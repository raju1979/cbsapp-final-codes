import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { Network } from '@ionic-native/network';
 
import { DownloadPage } from '../download-page/download-page';
import { DownloadedPackageView } from '../downloaded-package-view/downloaded-package-view';
import { QuestionsView } from '../questions-view/questions-view';

import { UserdataService } from "../../services/userdata-service";

import { Storage } from '@ionic/storage';


declare var _:any;
declare var cordova: any;
/*
  Generated class for the Myshelf page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

// declare var localStorageDB: any;

// declare var cordova: any;
// declare var localStorageDB: any;

@Component({
  selector: 'page-myshelf',
  templateUrl: 'myshelf.html'
})
export class MyshelfPage {

  db: any;
  loading: any;
  lib: any;
  userData: any;
  userPackages: any = []; //this containe the packages list purchased by user get from purchase_master
  fs: string;
  mainDirectoryName: string = "cbsapp";

  availableOfflinePackages: Array<any>;

  userPackagesList: Array<any> = [];//this contain the individual package get from package_master

  packageBaseUrl: string = '';

  // Create instance:
  fileTransfer: any;

  devicePlatform:string = '';
  networkType:any = '';
  baseUrlPackage: any;
  offlinePosterImgPath:string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private alertCtrl: AlertController, private _userDataService: UserdataService, private _toastCtrl: ToastController, private _loadingController: LoadingController, private _modalCtrl: ModalController, private _storage:Storage,private _network:Network, private _file:File, private _transfer:Transfer) {
    if (this.platform.is('mobile')) {
      this.fileTransfer = new Transfer();
      //this.db = new SQLite();
    }

    this.packageBaseUrl = this._userDataService.returnBaseUrlPackage();

    if(this.platform.is('mobile')){
      this.devicePlatform = 'mobile';
    }else{
      this.devicePlatform = 'desktop';
    }

    if (this.platform.is('ios')) {
        this.fs = cordova.file.documentsDirectory;
    }
    else if (this.platform.is('android')) {
        this.fs = cordova.file.externalRootDirectory;
    }

    this.networkType = this._network.type;

    this.baseUrlPackage = this._userDataService.returnBaseUrlPackage();


  };//end constructor


  ionViewDidLoad() {

  }

  ionViewWillEnter(): void {

    this.availableOfflinePackages = [];//reset the availableOfflinePackages everytime the page open/routed
    this.userPackagesList = [];//reset the userPackagesList everytime the page open/routed

    /* For IndexedDB
    1- check values in user_master key
    2 send request to get online userPackages on server
    */
    this._storage.get("user_master")
      .then((data) => {
        console.log(data);
        this.userData = data;//get user data from user_master key
        this.getUserOnlinePackages(this.userData.user_id);//send request to server
      })
      .catch((err) => {
        console.log("Myshelf error",JSON.stringify(err));
      })


  };//end ionViewWillEnter()


  ionViewDidEnter(): void {
    
    /**check available offline packages
     * 
     */

    this._storage.ready()
      .then((data) => {
        this._storage.get("user_packages")
          .then((data) => {
            if(data == null){
              //if user_master == null do nothing
              console.log("there is no offline package available on your device")
            }else{
              console.log("you have that much packages available");
              console.log(data);
              let userPackagesFromDb:any = data;
              userPackagesFromDb.forEach((elem:any,index:any) => {
                this.availableOfflinePackages.push(elem);
              })
              console.log(this.availableOfflinePackages);
              this.populateUserPackagesList(this.availableOfflinePackages);
            }
          })
          .catch((err) => {
            console.log(JSON.stringify(err));
          })
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
      });//end this._storage.ready()

  };
  // end ionViewDidEnter

  





  showError(err: any) {
    console.log(err.json());
    let toast = this._toastCtrl.create({
      message: `Sorry, Some error occured from server, please restart the App. Error Code: ${err.status}`,
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  };//end showError  

  openPackageDownloadModal(): void {
    // let modal = this._modalCtrl.create(DownloadPage,{userId:this.userData.user_id});
    // modal.present();
    this.navCtrl.push(DownloadPage,
      { userId: this.userData.user_id, userPackages: this.userPackages, availableOfflinePackages: this.availableOfflinePackages });
  }//end  


  // done of 16th feb
  getUserOnlinePackages(id:any) {
    if(this.devicePlatform == 'mobile' && this.networkType == 'none'){
      console.log('offline mobile cant continue');
      this.showNoNetworkAlert();
    }else{
      this._userDataService.getAllPackageByUser(id)
      .subscribe(
      (data) => this.getPackages(data),
      (err) => this.showError(err)
      );
    };
    
  }//

  getPackages(data: any) {
    if (data[0].result == 0) {
      console.log('You dont have any packages purchased');
    } else {
      this.userPackages = data;
      console.log("userOnlinePackages::", JSON.stringify(this.userPackages));

      //get online packages in userPackagesList added on 16th feb
      this.getOnlinePackages();
      //end get online packages in userPackagesList
    }
  }//

    //added on 16th feb
  getOnlinePackages(): void {
    console.log(this.userPackages);
    this._userDataService.getInduvidualPackagesPurchasedByUser(this.userPackages)
      .subscribe(
      (data) => console.log(data),
      (err) => console.log(err)
      )
  };//

  //added on 16th feb
  populateUserPackagesList(data: Array<any>): void {
    this.userPackagesList = _.clone(data);
    console.log(this.userPackagesList);
  };//end populateUserPackagesList

  gotoPackageView(packageData: any) {
    this.navCtrl.push(DownloadedPackageView, {
      data: packageData.details,
      guestUser:'no'
    })
  };

  getImageUrl(packageId: any, posterPath: any): string {
        if(this.platform.is("mobile")){
            let baseStr:string = this.fs;
            console.log(baseStr);
            baseStr = baseStr.replace("file://",'');
            if(this.platform.is("android")){
              return this.offlinePosterImgPath = this.fs+this.mainDirectoryName + "/" + packageId + "/" + "poster.png";
            }else if(this.platform.is("ios")){
              return this.offlinePosterImgPath = baseStr+this.mainDirectoryName + "/" + packageId + "/" + "poster.png";
            }
            
        }else{
            return this.baseUrlPackage +   packageId + "/" + "poster.png";
        }        
    };//


  checkExistingReviewTest(packageData:any):void{
    this._storage.get("review_"+packageData.id).then((data) => {
      if(data == null){
        this.showNoOfflineReviewTestAlert(packageData);
      }else{
        this.navCtrl.push(QuestionsView,{id: packageData.id})
      }
    })
  };//

  showNoNetworkAlert():void{
    let alert = this.alertCtrl.create({
      title: 'Not Online!',
      subTitle: 'we are unable to fetch you online packages. Please connect to the Internet and restart the app!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showNoOfflineReviewTestAlert(packageData:any){
    let prompt = this.alertCtrl.create({
      title: 'Login',
      message: '<p>You dont have any offline test saved. <br /> Do you want to go to test selection screen?</p>',
      buttons: [
        {
          text: 'Cancel',
          handler: (data:any) => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: (data:any) => {
            if(this.networkType !== 'none'){
              this.gotoPackageView(packageData);
            }
          }
        }
      ]
    });
    prompt.present();
  }
  

};//end class
