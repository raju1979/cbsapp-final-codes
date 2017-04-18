import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ToastController, LoadingController,ModalController } from 'ionic-angular';

import { DownloadPopover } from '../download-popover/download-popover';

import { UserdataService } from "../../services/userdata-service";
import { Storage } from '@ionic/storage';

declare var _:any;
declare var cordova: any;

/*
  Generated class for the DownloadPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-download-page',
  templateUrl: 'download-page.html'
})
export class DownloadPage {

  loading: any;
  lib:any;
  userId:string = '';
  userPackages: any = []; //this containe the packages list purchased by user get from purchase_master
  userPackagesList: Array<any> = [];//this contain the individual package get from package_master
  availableOfflinePackages:Array<any> = [];

  fs: string;
  mainDirectoryName: string = "cbsapp";
  baseUrlPackage: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,private _alertCtrl: AlertController, private _userDataService: UserdataService, private _toastCtrl: ToastController, private _loadingController: LoadingController,private _modalCtrl: ModalController,public platform:Platform) {
    this.userId = this.navParams.get('userId');
    this.userPackages = this.navParams.get('userPackages');
    let tempAvailableOfflinePackageArray:Array<any> =  this.navParams.get("availableOfflinePackages");

    _.forEach(tempAvailableOfflinePackageArray,(value:any,index:any) =>{
      this.availableOfflinePackages.push(value.id);
    })

    if (this.platform.is('ios')) {
        this.fs = cordova.file.documentsDirectory;
    }
    else if (this.platform.is('android')) {
        this.fs = cordova.file.externalRootDirectory;
    }

    this.baseUrlPackage = this._userDataService.returnBaseUrlPackage();
    console.log(this.availableOfflinePackages);
  };//end constructor

  ionViewDidLoad() {
    console.log('ionViewDidLoad DownloadPagePage');
  }

  ionViewDidEnter(): void {
    this.loading = this._loadingController.create({
      content: 'Please wait...'
    });
    //this.loading.present();   
    this.getPackages();
    
  };// end ionViewDidEnter

  getPackages():void {    
    console.log(this.userPackages);
    this.loading.dismiss();
    this._userDataService.getInduvidualPackagesPurchasedByUser(this.userPackages)
      .subscribe(
      (data) => this.populateUserPackagesList(data),
      (err) => this.presentHttpErrorAlert(err)
      )
  };//

  populateUserPackagesList(data: Array<any>): void {
    this.userPackagesList = data;
    for(let i=0; i< this.userPackagesList.length;i++){
      if(this.availableOfflinePackages.indexOf(this.userPackagesList[i].id) > -1){// check if package available offline
        console.log("package already available offline",this.userPackagesList[i].id);
        this.userPackagesList[i]["filesAvailable"] = true;
      }else{
        this.userPackagesList[i]["filesAvailable"] = false;
        console.log("package not available offline",this.userPackagesList[i].id);
      }      
    };//end for loop
    
    console.log(this.userPackagesList);

  };//end populateUserPackagesList

  gotoPackageDownloadPage(packageData:Object){
    console.log(packageData);
    let downloadModal = this._modalCtrl.create(DownloadPopover,{packageData:packageData});
    downloadModal.onDidDismiss((data:any) => {
     console.log("download returned data" , data);
   });
    downloadModal.present();
  }

  presentHttpErrorAlert(err:any) {
    let alert = this._alertCtrl.create({
      title: 'Error',
      message: 'There is some problem in getting data from server, please restart the app and try again',
      buttons: ["OK"]
    });
    alert.present();
  };//end presentAlert()

  getImageUrl(packageId: any, posterPath: any): string {
        
        let imgPath = this.baseUrlPackage +   packageId + "/" + "poster.png";
        console.log(imgPath);
        return imgPath;

    };//end getImageUrl

  

}
