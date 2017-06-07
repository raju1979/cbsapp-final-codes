import { Component, trigger, transition, style, animate } from '@angular/core';
import { NavController, NavParams, AlertController, Platform,LoadingController } from 'ionic-angular';

import { ImageQuestionsPage } from '../image-questions/image-questions';

import { UserdataService } from "../../services/userdata-service";

import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';

declare var _: any;
declare var cordova: any;
/*
  Generated class for the ImageLevelSelection page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-image-level-selection',
    templateUrl: 'image-level-selection.html',
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [   // :enter is alias to 'void => *'
                style({ opacity: 0 }),
                animate(500, style({ opacity: 1 }))
            ]),
            transition(':leave', [   // :leave is alias to '* => void'
                animate(100, style({ opacity: 0 }))
            ])
        ]),
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({ transform: 'translateX(100%)', opacity: 0 }),
                    animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
                ]),
                transition(':leave', [
                    style({ transform: 'translateX(0)', opacity: 1 }),
                    animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
                ])
            ]
        )
    ]
})
export class ImageLevelSelection {

    packageIdPasssed: string = '';
    imageQuestionsTotalTime: number;
    currentLevel: number = -1;
    previousTestExists: boolean = false;

    allLevelCleared: boolean = false;

    isGuestUser: boolean = true;
    readonly maxQuestionsFromEachChapperForGuestUser: number = 5;

    mainDirectoryName: string = "cbsapp";
    fs: string;

    loader:any;

    maximumTimeAvailableForTest:number = 15;//total time availabe for test

    constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _storage: Storage, public platform: Platform, private alertCtrl: AlertController,private loadingCtrl: LoadingController,private _network:Network, private _file:File) {

        

        if (this.platform.is('ios')) {
            this.fs = cordova.file.documentsDirectory;
        }
        else if (this.platform.is('android')) {
            this.fs = cordova.file.dataDirectory;
        }

        this.isGuestUser = this.navParams.get('guestUser');

        console.log("Guest User::",this.isGuestUser)


    }

    ionViewWillEnter() {
        this.packageIdPasssed = this.navParams.get('id');
        console.log(this.navParams.get('id'));
        setTimeout(() => {
            this._storage.get("image_" + this.packageIdPasssed).then((val) => {
                console.log(val)
                if (val == null) {//no previous test found
                    //this.createNewImageTest(0);
                    this.currentLevel = 0;
                } else {//previous test found
                    this.currentLevel = val.level;
                    this.allLevelCleared = val.allLevelCleared;
                    this.previousTestExists = true;
                    //this.presentContinueTestConfirm();
                }
            })//end find previous test
        }, 500)
    }

    ionViewDidLoad() {

    };//

    createNewImageTest(levelNum: number) {
        this.loader = this.loadingCtrl.create({
            content: "Please wait...",
        });
        this.loader.present();
        let suppliedLevel = levelNum;
        
            if (this.platform.is("mobile") && !this.isGuestUser) {
                this._file.readAsText(this.fs, this.mainDirectoryName + "/" + this.packageIdPasssed + "/" + "image_questions.json").
                    then((data: any) => {
                        let imageJson = JSON.parse(data);
                        console.log('questions json from local read::', imageJson);
                        this.submitDataTostorageAndNavigate(imageJson,suppliedLevel);
                    })
                    .catch((err) => {
                        this.loader.dismiss();
                        console.log(err);
                    })
            } else {
                if(this.platform.is('mobile') && this._network.type=='none'){
                    this.showNoNetworkAlert();
                }else{
                    this._userDataService.getImageQuestionsFromServer(this.packageIdPasssed)
                    .subscribe(
                    (response) => {
                        let status = response.status;
                        let responseData: any;
                        if (status == 200) {
                            responseData = response.json();
                            this.submitDataTostorageAndNavigate(responseData, suppliedLevel);
                        } else {
                            this.showDataFetchErrorFromServer(status);
                        }
                    },
                    (err) => this.showDataFetchErrorFromServer(err)
                    )
                }
                
            }//end this.platform if
    };//

    submitDataTostorageAndNavigate(responseData: any, suppliedLevel: any) {
        this.loader.dismiss();
        let data: any;
        let localQuestionsArray:any = [];
        //set all data of image questions into indexedDb
        this._storage.set("image_all_" + this.packageIdPasssed, responseData)
            .then((data) => {
                console.log("all questions data set");
            });

        // if(this.isGuestUser){
        //     localQuestionsArray = _.take(responseData.levels[suppliedLevel].data,this.maxQuestionsFromEachChapperForGuestUser);
        // }else{
        //     localQuestionsArray = responseData.levels[suppliedLevel].data;
        // }

        localQuestionsArray = responseData.levels[suppliedLevel].data;

        data = {
            level: suppliedLevel,
            lastQuestionAttempted: 0,
            packageId: this.packageIdPasssed,
            questions: _.shuffle(localQuestionsArray),
            secondsRemaining: (responseData.levels[suppliedLevel].timeDuration * 60),
            allLevelCleared: false
        }
        this._userDataService.setImageQuestionDataIndexedDb(this.packageIdPasssed, data);//set data into indexedDb
        setTimeout(() => {
            this.currentLevel = 0;
            this.navCtrl.push(ImageQuestionsPage, { id: this.packageIdPasssed,guestUser:this.isGuestUser });
        }, 500)
    };//

    presentResetTestConfirm() {
        let alert = this.alertCtrl.create({
            title: 'Reset Test',
            message: 'Do you want to reset the levels. Press OK to reset!',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        //this.createNewImageTest(0);
                    }
                },
                {
                    text: 'Start New Test',
                    handler: () => {
                        this.createNewImageTest(0);
                    }//end success handle
                }//end buttons object
            ]//end butotns array
        });
        alert.present();
    }//end presentConfirm

    showNoNetworkAlert(): void {
        this.loader.dismiss();
        let alert = this.alertCtrl.create({
            title: 'Not Online!',
            subTitle: 'We are unable to fetch questions. Please check your internet connection!',
            buttons: ['OK']
        });
        alert.present();
    };//

    showDataFetchErrorFromServer(err: any): void {
        this.loader.dismiss();
        let errorMsg: any = JSON.stringify(err);
        let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: `There is some problem at server. Please check your network connection!`,
            buttons: ['OK']
        });
        alert.present();
    };//

    navigateToImageTestScreen(): void {
        if(this.allLevelCleared){
            this.showAllLevelAlreadyClearedAlert();
        }else{
            if (this.previousTestExists) {
                this.navCtrl.push(ImageQuestionsPage, { id: this.packageIdPasssed,guestUser:this.isGuestUser});
            } else {
                this.createNewImageTest(0);
            }
        }
        

    };//

    resetTest() {
        this.presentResetTestConfirm();
    };//

    shouldShowResetBtn(){
        console.log(this.isGuestUser,this.currentLevel);
        if(this.isGuestUser && this.currentLevel == 1){
            return true;
        }else if(!this.isGuestUser && this.allLevelCleared){
            return true
        }else{
            return false;
        }
    };//

    showAllLevelAlreadyClearedAlert(): void {
        let alert = this.alertCtrl.create({
        title: 'Highest Level Reached!',
        subTitle: 'You have already reached highest level, press Reset button to practice test from Level 1',
        buttons: ['OK']
        });
        alert.present();
    };//end showError

}
