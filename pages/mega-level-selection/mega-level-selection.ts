import { Component, trigger, transition, style, animate } from '@angular/core';
import { NavController, NavParams, AlertController, Platform,LoadingController } from 'ionic-angular';


import {MegaQuestions} from "../mega-questions/mega-questions"

import { UserdataService } from "../../services/userdata-service";

import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';

declare var _: any;
declare var cordova: any;

/*
  Generated class for the MegaLevelSelection page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-mega-level-selection',
  templateUrl: 'mega-level-selection.html',
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

export class MegaLevelSelection {

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

  maxLevelForThisCategory:number = 2;


  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _storage: Storage, public platform: Platform, private alertCtrl: AlertController,private loadingCtrl: LoadingController,private _network:Network, private _file:File) {

    if (this.platform.is('ios')) {
      this.fs = cordova.file.documentsDirectory;
    }
    else if (this.platform.is('android')) {
      this.fs = cordova.file.dataDirectory;
    }

    this.isGuestUser = this.navParams.get('guestUser');

    console.log("Guest User::", this.isGuestUser)

  }

  ionViewWillEnter() {
    this.packageIdPasssed = this.navParams.get('id');
    console.log(this.navParams.get('id'));
      this._storage.get("mega_" + this.packageIdPasssed).then((val) => {
        console.log(val)
        if (val == null) {//no previous test found
          this.findPackageLevelFromOnlineStoredData();
          this.currentLevel = 0;          
        } else {//previous test found
          this.currentLevel = val.level;
          this.allLevelCleared = val.allLevelCleared;
          this.previousTestExists = true;
          
          //this.presentContinueTestConfirm();
        }
      })//end find previous test

    // this.packageIdPasssed = this.navParams.get('id');
    // console.log(this.navParams.get('id'));
    //   this._storage.get("mega_" + this.packageIdPasssed).then((val) => {
    //     console.log(val)
    //     if (val == null) {//no previous test found
    //       //this.createNewImageTest(0);
    //       this.findPackageLevelFromOnlineStoredData();
    //     } else {//previous test found
    //       this.currentLevel = val.level;
    //       this.allLevelCleared = val.allLevelCleared;
    //       this.previousTestExists = true;
          
    //       //this.presentContinueTestConfirm();
    //     }
    //   })//end find previous test
  };//end ionViewWillEnter()

  ionViewDidLoad() {
    console.log('ionViewDidLoad MegaLevelSelectionPage');
  };//

  findPackageLevelFromOnlineStoredData()  {
    //get savedLevels result
    setTimeout(() => {
      this._storage.get("userLevelsOnline")
      .then((val) => {
        if(val == null){
          console.log("no saved levels for this user")
        }else{
          console.log(val);
          var idIndex = _.findIndex(val, (o) =>{
            return o.package_id == this.packageIdPasssed;
          });
          if(idIndex > -1){//if online level package found in local
            console.log(val[idIndex].max_mega_level);
            let receivedLevelNum:number = (+val[idIndex].max_mega_level) * 1;
            console.log(receivedLevelNum , (this.maxLevelForThisCategory + 1))
            if(receivedLevelNum >= this.maxLevelForThisCategory + 1){
              console.log('all level cleared');
              this.allLevelCleared = true;
            }else{
              console.log('all level not cleared')
            }
            this.createNewMegaTestBaseUponOnlineLevels(parseInt(val[idIndex].max_mega_level));
            //this.currentLevel = val[idIndex].max_grand_level;
          }else{
            //this.currentLevel = 0;
          }
        }//end if val == null
      })
    },500)
  };//end findPackageLevelFromOnlineStoredData()
  

  createNewMegaTest(levelNum: number) {
    this.loader = this.loadingCtrl.create({
        content: "Please wait...",
    });
    this.loader.present();
    
    let suppliedLevel = levelNum;

    //if on mobile read local data
    if (this.platform.is("mobile") && !this.isGuestUser) {
      let jsonFileName = `Package0000${levelNum + 1}.json`;
      console.log(jsonFileName);
      this._file.readAsText(this.fs, this.mainDirectoryName + "/" + this.packageIdPasssed + "/megagrand/" + jsonFileName).
        then((data: any) => {
          this.loader.dismiss();
          let megaJson = JSON.parse(data);
          console.log('questions json from local read::', megaJson);
          this.submitDataToStorageAndNavigate(megaJson, suppliedLevel);
        })
        .catch((err) => {
          this.loader.dismiss();
          this.showLocalFileReadErrorAlert();
        })
    } else {//if on desktop of GUEST USER on MOBILE read online data
      if(this.platform.is('mobile') && this._network.type=='none'){
          this.showNoNetworkAlert();
      }else{
          this._userDataService.getMegaQuestionsFromServer(this.packageIdPasssed, levelNum)
          .subscribe(
          (response) => {
            this.loader.dismiss();
            let status = response.status;
            let responseData: any;
            if (status == 200) {
              responseData = response.json();
              console.log(responseData);
              this.submitDataToStorageAndNavigate(responseData, suppliedLevel);
            } else {
              this.showDataFetchErrorFromServer(status);
            }
          },
          (err) => this.showDataFetchErrorFromServer(err)
          )
      }

      

    }//end if
  };//

  submitDataToStorageAndNavigate(responseData: any, suppliedLevel: any) {
    //this.loader.dismiss();
    let data: any;
    let localQuestionsArray: any = [];


    localQuestionsArray = responseData.levels[suppliedLevel].data;

    data = {
      level: suppliedLevel,
      lastQuestionAttempted: 0,
      packageId: this.packageIdPasssed,
      questions: _.shuffle(localQuestionsArray),
      originalTimeAlloted:responseData.levels[suppliedLevel].timeDuration * 60,
      secondsRemaining: (responseData.levels[suppliedLevel].timeDuration * 60),
      allLevelCleared: false
    }
    this._userDataService.setMegaQuestionDataIndexedDb(this.packageIdPasssed, data);//set data into indexedDb
    setTimeout(() => {
      this.currentLevel = 0;
      this.navCtrl.push(MegaQuestions, { id: this.packageIdPasssed,guestUser:this.isGuestUser });
    }, 500)
  };//end submitDataTostorageAndNavigate

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

  navigateToImageTestScreen(btnLevel: number): void {
    //if user already cleared all (5) levels, he cant go to question screen
    if(this.allLevelCleared){
      this.showAllLevelAlreadyClearedAlert();
    }else{
      if (this.previousTestExists) {
        this.navCtrl.push(MegaQuestions, { id: this.packageIdPasssed,guestUser:this.isGuestUser });
      } else {
        this.createNewMegaTest(btnLevel);
      }//end inner if
    }//end outer if
  };//end navigateToImageTestScreen

  showLocalFileReadErrorAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: 'There is osme error in getting the data. Please restart the App!',
      buttons: ['OK']
    });
    alert.present();
  };//end showMaxLevelReachAlert

  shouldShowResetBtn(){
        console.log(this.isGuestUser,this.currentLevel);
        if(this.isGuestUser && this.currentLevel == 1){
            return true;
        }else if(!this.isGuestUser && this.allLevelCleared){
            return true
        }else{
            return false;
        }
    };//end shouldShowResetBtn

  showAllLevelAlreadyClearedAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Maximum Level Reached!',
      subTitle: 'You have already reached highest level, press Reset button to practice test from Level 1',
      buttons: ['OK']
    });
    alert.present();
  };//end showError

  createNewMegaTestBaseUponOnlineLevels(levelNum: number) {
    let suppliedLevel:number;
    if(levelNum == this.maxLevelForThisCategory + 1){
      suppliedLevel = levelNum - 1;
    }else{
      suppliedLevel = levelNum;
    }
    this.loader = this.loadingCtrl.create({
        content: "Please wait, creating new test...",
    });
    this.loader.present();
    
    

    console.log(`SuppliedLevel::${suppliedLevel} :: levelNum::${levelNum}`);

    //if on mobile read local data
    if (this.platform.is("mobile") && !this.isGuestUser) {
      
      let jsonFileName = `Package0000${suppliedLevel + 1}.json`;
      console.log(jsonFileName);
      this._file.readAsText(this.fs, this.mainDirectoryName + "/" + this.packageIdPasssed + "/megagrand/" + jsonFileName).
        then((data: any) => {
          this.loader.dismiss();
          let grandJson = JSON.parse(data);
          console.log('questions json from local read::', grandJson,'supplied level',suppliedLevel);
          this.submitDataToStorageBaseUponOnlineLevels(grandJson, suppliedLevel);
        })
        .catch((err) => {
          this.loader.dismiss();
          this.showLocalFileReadErrorAlert();
        })
    } else {//if on desktop of GUEST USER on MOBILE read online data
      if(this.platform.is('mobile') && this._network.type=='none'){
          this.showNoNetworkAlert();
      }else{
          this._userDataService.getMegaQuestionsFromServer(this.packageIdPasssed, suppliedLevel)
          .subscribe(
          (response) => {
            this.loader.dismiss();
            let status = response.status;
            let responseData: any;
            if (status == 200) {
              responseData = response.json();
              console.log('questions json from local read::', responseData,'supplied level',suppliedLevel);
              this.submitDataToStorageBaseUponOnlineLevels(responseData, suppliedLevel);
            } else {
              this.showDataFetchErrorFromServer(status);
            }
          },
          (err) => this.showDataFetchErrorFromServer(err)
          )
      }     

    }//end if
  };//end createNewGrandTestBaseUponOnlineLevels


  submitDataToStorageBaseUponOnlineLevels(responseData: any, suppliedLevel: any) {
    let data: any;
    let localQuestionsArray: any = [];

    this.currentLevel = suppliedLevel;
    // if(this.currentLevel == this.maxLevelForThisCategory + 1){
    //   this.allLevelCleared = true
    // }else{
    //   this.allLevelCleared = false;
    // }
    this.previousTestExists = true;

    localQuestionsArray = responseData.levels[0].data;

    data = {
      level: (suppliedLevel)*1,
      lastQuestionAttempted: 0,
      packageId: this.packageIdPasssed,
      questions: _.shuffle(localQuestionsArray),
      originalTimeAlloted:responseData.levels[0].timeDuration * 60,
      secondsRemaining: (responseData.levels[suppliedLevel].timeDuration * 60),
      allLevelCleared: this.allLevelCleared
    }
    console.log(data);
    this._userDataService.setMegaQuestionDataIndexedDb(this.packageIdPasssed, data);//set data into indexedDb
    
  };//end submitDataToStorageBaseUponOnlineLevels

  /**
   * resetTest()
   * @params:none
   * @return:none
   * This function reset the whole grand level.
   * by- deleting grand_packageId from IndexedB
   * - delte all rows from grand_score_master from mysql
   * - set currentLevel = 0 and reset the IndexedDB data
   */
  resetTestBtnHandler(){

    //first show resetConfirm Alert
    this.showResetTestAlert();

  };//

  showResetTestAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Reset the test!',
      subTitle: 'Do you want to reset the levels. Press OK to reset!',
      buttons: [
        {
          text: 'Cancel',
          handler: (data: any) => {
            
          }
        },
        {
          text: 'OK',
          handler: (data: any) => {
            this.resetTest();
          }
        }
      ]
    });
    alert.present();
  };//end showResetTestAlert

  resetTest(){
    //get the user_master data
    this._storage.get("user_master")
      .then((data) => {
        if(data == null){

        }else{
          console.log("User data is",data);
          let userData = {
            user_id:data.user_id,
            package_id:this.packageIdPasssed
          }

          this.loader = this.loadingCtrl.create({
              content: "Please wait, resetting data",
          });
          this.loader.present();

          this._userDataService.deleteAllRowsForUserFromMegaScoreMaster(userData)
            .subscribe(
              (response) => {
                this.loader.dismiss();
                let status = response.status;
                console.log(status);
                let data;
                if(status != 200){

                }else{
                  data = response.json();
                  console.log(data);
                  if(data.success == "true"){
                     //find the current grand_packageId key in indexedDb and remove it
                    this._storage.remove("mega_"+this.packageIdPasssed)
                      .then((data) => {
                        console.log("removed");
                        this.createNewMegaTest(0);
                      })
                  }else{
                    this.showDataFetchErrorFromServer('Unable to Delete Records from server')
                  };//end if(data.success == true)
                  
                }//end if(status != 200)           
              },
              (err) => {
                this.showDataFetchErrorFromServer('Unable to Delete Records from server')
              }
            )//end .subscribe
            

        }//end .then

      })//end this._storage.get
   
      
  };//end resetTest()

}
