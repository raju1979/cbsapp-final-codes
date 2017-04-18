import { Component, style, state, animate, transition, trigger } from '@angular/core';
import { NavController, NavParams, Platform, AlertController,ModalController } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';

import { Storage } from '@ionic/storage';

import { CompleteView } from '../complete-view/complete-view';
import { VideoPopover } from '../video-popover/video-popover';
import { ImageLevelSelection } from '../image-level-selection/image-level-selection';
import { ImageQuestionsPage } from '../image-questions/image-questions';

import { GrandLevelSelection } from '../grand-level-selection/grand-level-selection';
import {MegaLevelSelection} from "../mega-level-selection/mega-level-selection";

import { DownloadPopover } from '../download-popover/download-popover';

import { BookImagesViewer } from '../book-images-viewer/book-images-viewer';

import { UserdataService } from "../../services/userdata-service";

import * as lodash from 'lodash';


declare var cordova: any;
@Component({
  selector: 'page-guest-downloaded-package-view',
  templateUrl: 'guest-downloaded-package-view.html',
  animations: [
        trigger('fadeInOut', [
            transition(':enter', [   // :enter is alias to 'void => *'
                style({ opacity: 0 }),
                animate(500, style({ opacity: 1 }))
            ]),
            transition(':leave', [   // :leave is alias to '* => void'
                animate(500, style({ opacity: 0 }))
            ])
        ])
    ]
})
export class GuestDownloadedPackageView {

  packageId: string = '';
    packageData: any;
    relationship: string = "details";
    moviewReviewsArray: any = [];

    tocJsonData: any;
    baseUrlPackage: any;

    passedPackage: any;
    packageIdPasssed: string = '';

    shouldShowTestContainer: boolean = false;
    shouldShowAdditionalContainer: boolean = false;
    shouldShowLearningContainer: boolean = false;

    mainDirectoryName: string = "cbsapp";
    fs: string;

    packageDirectoryFoundInDisc: boolean = false;

    imageQuestionsTotalTime:number;

    isMobile:boolean = false;


    offlinePosterImgPath:string = '';

    isGuestUser:boolean = true;



    constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _storage: Storage, public platform: Platform, private alertCtrl: AlertController,private _modalCtrl: ModalController,private _network:Network, private _file:File) {

        this.passedPackage = this.navParams.get('data');
        this.packageIdPasssed = this.passedPackage.id;
        console.log(`passedId:${this.packageIdPasssed}`);

        let userStatusForThisPackage = this.navParams.get('guestUser');
        if(userStatusForThisPackage == 'yes'){
            this.isGuestUser = true;
        }else if(userStatusForThisPackage == 'no'){
            this.isGuestUser = false;
        }
        console.log("User is a guest for this package::",this.isGuestUser)
        

        if (this.platform.is('ios')) {
            this.fs = cordova.file.documentsDirectory;
        }
        else if (this.platform.is('android')) {
            this.fs = cordova.file.externalRootDirectory;
        }



        this.baseUrlPackage = this._userDataService.returnBaseUrlPackage();
        console.log(this.baseUrlPackage);



    }//end constructor

    ionViewDidLoad() {
        if(this.platform.is('mobile') && !this.isGuestUser){
            this.isMobile = true;
            //this.checkPackageFolder();
            this.checkIfPackageDownloaded(this.packageIdPasssed);
        }else{
            this.checkIfPackageDownloaded(this.packageIdPasssed);
            this._userDataService.getPackageTocFromServer(this.packageIdPasssed)
            .subscribe(
            (data) => this.populateTocJsonData(data),
            (err) => console.log(err)
            )
        }
    }




    populateTocJsonData(data: any) {
        this.tocJsonData = data;
        // this.packageDirectoryFoundInDisc = true;
        console.log(this.tocJsonData);
    };//

    openVideo(videoUrlText: any): void {
        
            this.navCtrl.push(VideoPopover, { videoUrl: videoUrlText })
        
    }


    // ngOnInit() {
    //     if (this.platform.is('mobile')) {
    //         console.log('mobile view');
            
    //     }
    // };

    getImageUrl(packageId: any, posterPath: any): string {
        if(!this.isMobile){
            let imageUrlString = this.baseUrlPackage + packageId + "/" + posterPath;
            return imageUrlString;
        }else{
            return this.offlinePosterImgPath;
        }        
    };//

    navigatToQuestionView(): void {
        this.navCtrl.push(CompleteView, { data: this.tocJsonData, packageData: this.passedPackage, guestUser:this.isGuestUser });
    };//

    toggleTestContainerDisplay(): void {
        this.shouldShowTestContainer = !this.shouldShowTestContainer;
    };//

    toggleTestCircleIcon(): string {
        if (this.shouldShowTestContainer) {
            return "remove-circle";
        } else {
            return "add-circle";
        }
    };//

    toggleAdditionalContainerDisplay(): void {
        this.shouldShowAdditionalContainer = !this.shouldShowAdditionalContainer;
        console.log(this.shouldShowAdditionalContainer)
    };//

    toggleAdditionalCircleIcon(): string {
        if (this.shouldShowAdditionalContainer) {
            return "remove-circle";
        } else {
            return "add-circle";
        }
    };//

    toggleLearningContainerDisplay(): void {
        this.shouldShowLearningContainer = !this.shouldShowLearningContainer;
        console.log(this.shouldShowLearningContainer)
    };//

    toggleLearningCircleIcon(): string {
        if (this.shouldShowLearningContainer) {
            return "remove-circle";
        } else {
            return "add-circle";
        }
    };//

    
    //check if folder cbsapp/packageId exists
    checkPackageFolder() {
        //this.fs = cordova.file.externalRootDirectory;
        this._file.checkDir(this.fs, this.mainDirectoryName + "/" + this.passedPackage.id).
            then(_ => this.packageDirectoryFound())
            .catch(err => console.log(err));
    };//

    //packageDirectoryFound in SD card
    packageDirectoryFound(): void {
        console.log("Directory found");
        this.packageDirectoryFoundInDisc = true;

        //this._userDataService.getPackageTocFromLocal(this.packageIdPasssed,this.fs);
        //let localTocJson = ''
        console.log('path is ::'+this.fs+this.mainDirectoryName + "/" + this.passedPackage.id + "/");
        this.offlinePosterImgPath = this.fs+this.mainDirectoryName + "/" + this.passedPackage.id + "/" + "poster.png";
        this._file.readAsText(this.fs, this.mainDirectoryName + "/" + this.passedPackage.id + "/" + "TOC.json").
            then((data: any) => {
                let TocJson = JSON.parse(data);
                console.log(TocJson);
            })
            .catch((err) => {
                console.log(err);
            })
    }//end packageDirectoryFound


    navigatToImageQuestionView(): void {


        this.navCtrl.push(ImageLevelSelection,{id:this.packageIdPasssed,guestUser:this.isGuestUser});


    };//

    showNoNetworkAlert(): void {
        let alert = this.alertCtrl.create({
            title: 'Not Online!',
            subTitle: 'we are unable to fetch you online questions. Please connect to the Internet and restart the app!',
            buttons: ['OK']
        });
        alert.present();
    };//


    showDataFetchErrorFromServer(err: any): void {
        let errorMsg: any = JSON.stringify(err);
        let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: `There is some problem at server. Please check your network connection and Restart the App!<br />${errorMsg}`,
            buttons: ['OK']
        });
        alert.present();
    };//


    createNewImageTest() {
        let suppliedLevel = 0;
        if (this.platform.is("mobile") && this._network.type == "none") {//if offline on mobile
            this.showNoNetworkAlert();
        } else {
            this._userDataService.getImageQuestionsFromServer(this.passedPackage.id)
                .subscribe(
                (response) => {
                    let status = response.status;
                    let responseData: any;
                    let data: any;
                    if (status == 200) {
                        responseData = response.json();
                        //set all data of image questions into indexedDb
                        this._storage.set("image_all_"+this.passedPackage.id,responseData)
                            .then((data) => {
                                console.log("all questions data set");
                            })
                        data = {
                            level: suppliedLevel,
                            lastQuestionAttempted:0,
                            packageId:this.passedPackage.id,
                            questions:lodash.shuffle(responseData.levels[suppliedLevel].data),
                            secondsRemaining:(responseData.levels[suppliedLevel].timeDuration * 60)
                        }
                        this._userDataService.setImageQuestionDataIndexedDb(this.passedPackage.id, data);//set data into indexedDb
                        setTimeout(() => {
                            this.navCtrl.push(ImageQuestionsPage, { id: this.packageIdPasssed });
                        }, 500)
                    } else {
                        this.showDataFetchErrorFromServer(status);
                    }
                },
                (err) => this.showDataFetchErrorFromServer(err)
                )
        }//end if
    }

    checkIfPackageDownloaded(id:string){
        this._storage.get("user_packages")
            .then((data) => {
                if(data == null){
                    console.log('no package downloaded');
                }else{
                    console.log(data)
                    lodash.forEach(data,(value:any,index:any) => {
                        if(value.id == id){
                            if(this.platform.is("mobile")){
                                 this.populateTocJsonInMobileView(value.id);
                            }
                            if(this.platform.is("core")){
                                this.packageDirectoryFoundInDisc = true;
                            }
                            return false;
                        }
                    })
                }
            })
    };//

    

    populateTocJsonInMobileView(id:string){
        this._file.readAsText(this.fs, this.mainDirectoryName + "/" + this.passedPackage.id + "/" + "TOC.json").
            then((data: any) => {
                this.tocJsonData = JSON.parse(data);
                console.log("TOC DATA is",this.tocJsonData);
                let baseStr:string = this.fs;
                baseStr = baseStr.replace("file://",'');
                if(this.platform.is('android')){
                    this.offlinePosterImgPath = this.fs+this.mainDirectoryName + "/" + this.passedPackage.id + "/" + "poster.png";
                }else if(this.platform.is("ios")){
                    this.offlinePosterImgPath = baseStr+this.mainDirectoryName + "/" + this.passedPackage.id + "/" + "poster.png";
                }
                
                this.packageDirectoryFoundInDisc = true;
            })
            .catch((err) => {
                console.log(err);
            })
    };//populateTocJsonInMobileView

    gotoPackageDownloadPage(packageData:Object){
        console.log(packageData);
        let downloadModal = this._modalCtrl.create(DownloadPopover,{packageData:packageData,isGuestUser:this.isGuestUser});
        downloadModal.onDidDismiss((data:any) => {
            if(data == null){
                this.showPackageDownloadFailureAlert();
            }else{
                console.log(data);
                if(data.success){
                    if(this.platform.is('mobile')){
                        this.checkIfPackageDownloaded(this.passedPackage.id);
                    }else{
                        this.packageDirectoryFoundInDisc = true;
                    }                
                }else{
                    this.showPackageDownloadFailureAlert();
                }
            }            
        });
        downloadModal.present();
    };//

//     gotoPackageDownloadPage(packageData:Object){
//     console.log(packageData);
//     let downloadModal = this._modalCtrl.create(DownloadPopover,{packageData:packageData});
//     downloadModal.onDidDismiss(data => {
//      console.log("download returned data" , data);
//    });
//     downloadModal.present();
//   }

    showPackageDownloadFailureAlert():void{
        let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: `Unable to download package from server. Please check the internet connectivity and restart the app`,
            buttons: ['OK']
        });
        alert.present();
    };//

    getMainPdfHref(pdfUrl1:any):string{
        // let hrefString = "#";
        // if(!this.isGuestUser){
        //     hrefString = this.baseUrlPackage+this.tocJsonData.id + "/" + pdfUrl1.name;
        // }
        // return hrefString;
        let hrefString = "#";
        hrefString = this.baseUrlPackage+this.tocJsonData.id + "/" + pdfUrl1.name;
        return hrefString;
    };//

    getAdditionPdfHref(pdfUrl:any):string{
        let hrefString = "#";
        if(!this.isGuestUser){
            hrefString = this.baseUrlPackage+this.tocJsonData.id + "/" + pdfUrl.name;
        }
        return hrefString;
    };//

    showMainBookImages(){
        console.log(this.tocJsonData);
        this.navCtrl.push(BookImagesViewer,{data:this.tocJsonData,mainReading:true})
    };//

    showAdditionalBookImages(){
        console.log(this.tocJsonData);
        this.navCtrl.push(BookImagesViewer,{data:this.tocJsonData,mainReading:false})
    };//

    showToastIfGuestUser(){
        let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: `Tyou are curently viewing as GUEST, and not authorised to view PREMIUM content`,
            buttons: ['OK']
        });
        if(this.isGuestUser){
            alert.present();
        }else{

        }
        
    };//

    navigatToGrandLevelSelection():void{
        this.navCtrl.push(GrandLevelSelection,{id:this.packageIdPasssed,guestUser:this.isGuestUser});
    }

    navigatToMegaLevelSelection():void{
        this.navCtrl.push(MegaLevelSelection,{id:this.packageIdPasssed,guestUser:this.isGuestUser});
    }

}
