import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ToastController, LoadingController, ModalController, ViewController } from 'ionic-angular';

import { UserdataService } from "../../services/userdata-service";


import { File } from '@ionic-native/file';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { Zip } from '@ionic-native/zip';

import { Storage } from '@ionic/storage';
/*
  Generated class for the DownloadPopover page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var cordova: any;
declare var localStorageDB: any;
declare var _:any;

@Component({
  selector: 'page-download-popover',
  templateUrl: 'download-popover.html'
})
export class DownloadPopover {

  selectedPackageForDownload: any;

  loading: any;
  db: any;
  lib: any;
  mainDirectoryName: string = "cbsapp";
  fs: string;
  fileTransfer: any;
  progressInterval: any;
  progress: number = 0;
  toast: any;
  mobile: boolean = false;
  downoadedAsGuestUser:boolean = false;
  offlinePosterImgPath:string = '';
  baseUrlPackage:any;

  existingPackagesInLocalDb:Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, private _userDataService: UserdataService, private _toastCtrl: ToastController, private _loadingController: LoadingController, private _modalCtrl: ModalController, public platform: Platform, public viewCtrl: ViewController, private _zone: NgZone, private _storage: Storage,private _file:File, private _zip:Zip, private _transfer:Transfer) {

    this.selectedPackageForDownload = this.navParams.get('packageData');
    console.log(this.selectedPackageForDownload);
    this.downoadedAsGuestUser = this.navParams.get("isGuestUser") || false;
    console.log("guest user::",this.downoadedAsGuestUser);
    if (this.platform.is('ios')) {
      this.fs = cordova.file.documentsDirectory;
    }
    else if (this.platform.is('android')) {
      this.fs = cordova.file.dataDirectory;
    }

    if (this.platform.is('mobile')) {
      this.mobile = true;
      //this.db = new SQLite();
      this.checkPrimaryFolder();
      this.fileTransfer =  this._transfer.create();
    } else if (this.platform.is('core')) {
      this.populateForDesktop();
    }
    this.baseUrlPackage = this._userDataService.returnBaseUrlPackage();
  };//end constructor

  ionViewDidLoad() {
    console.log('ionViewDidLoad DownloadPopoverPage');
  }

  ionViewWillEnter() {


    //for testing on desktop only


  };//end ionViewWillEnter

  //check if folder cbsapp exists
  checkPrimaryFolder() {
    //this.fs = cordova.file.dataDirectory;
    this._file.checkDir(this.fs, this.mainDirectoryName).
      then(_ => this.createPackageDirectory(this.selectedPackageForDownload.id))
      .catch(err => this.createPrimaryDirectory());
  };//
    getImageUrl(packageId: any, posterPath: any): string {
            let imageUrlString = this.baseUrlPackage + packageId + "/" + posterPath;
            return imageUrlString;
     
    };//
  //create new folder cbsapp
  createPrimaryDirectory() {
    this._file.createDir(this.fs, this.mainDirectoryName, false)
      .then(() => this.createPackageDirectory(this.selectedPackageForDownload.id))
      .catch((err) => this.showDirectoryCreationError(err))
  };//


  showDirectoryCreationError(err: any) {
    console.log(err.json());
    this.loading.dismiss();
    let toast = this._toastCtrl.create({
      message: `Sorry, Some error occured please restart the App. Error Code: ${err}`,
      duration: 3000,
      position: 'middle'
    });
    toast.present();
  };//end showError

  createPackageDirectory(id: any) {//always create new package directory
    this._file.createDir(this.fs, this.mainDirectoryName + "/" + id, true)
      // .then(() => this.downloadPackageFile(id))
      .then(() => this.downloadPackageFile(id))
      .catch((err) => console.log(err))
  };//

  downloadPackageFile(id: any) {
    console.log('download package id::' + id);
    // let url = `https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/${id}.zip`;
    let url = `https://s3.ap-south-1.amazonaws.com/cbspublisher/package_content/${id}/${id}.zip`;
    console.log(url);
    this.fileTransfer.download(url, this.fs + this.mainDirectoryName + "/" + id + "/" + 'package.zip').then((entry: any) => {
      this.packageDownloadComplete(entry, id);
    }, (error: any) => {
      // handle error
      this.showFailureToast(error);
    });

    this.fileTransfer.onProgress((progressEvent: any) => {
      console.log((progressEvent.loaded / progressEvent.total) * 100);
      this._zone.run(() => {
        this.progress = (progressEvent.loaded / progressEvent.total) * 100;
        this.progress = parseFloat(this.progress.toFixed(1));
        // if (this.progress >= 100) {
        //   this.viewCtrl.dismiss();
        //   console.log("file Downloaded")
        // }
      });
    });//end this.fileTransfer

  };//

  packageDownloadComplete(entry: any, id: any) {
    console.log(entry.toURL());
    this.unzipPackage(id);
  };//

  unzipPackage(id: any) {
    this._zip.unzip(this.fs + this.mainDirectoryName + "/" + id + "/" + 'package.zip', this.fs + this.mainDirectoryName + "/" + id + "/", (progress: any) => console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%'))
      .then((result) => {
        if (result === 0) { //when unzipped successfully
          this.showSuccessToast('Package Downloaded');
        }//end if for unzip success
        if (result === -1) console.log('FAILED');
      });
  }

  presentDownloadErrorAlert(msg: string) {
    const alertFailure = this.alertCtrl.create({
      title: `Download Failed!`,
      subTitle: `Package was not successfully downloaded. . Check your Network connection and Restart the app`,
      buttons: ['Ok']
    });

    alertFailure.present();
  };//


  showSuccessToast(msg?: string) {
    this.toast = this._toastCtrl.create({
      message: `${msg}`,
      duration: 500,
      position: 'middle'
    });

    this.toast.onDidDismiss(() => {

      //read the previous user_packages from indexedDb
      this._storage.get("user_packages")
        .then((data) => {
          console.log("outside null for mobile" + JSON.stringify(data));
          
          if (data == null) {
            //if user_packages == null do nothing
            console.log("inside null for mobile"+this.selectedPackageForDownload.id);
            console.log("GUest user package",'false');
            this.existingPackagesInLocalDb.push({id:this.selectedPackageForDownload.id,details:this.selectedPackageForDownload})
          } else {//if some packages exists in localDb
            this.existingPackagesInLocalDb = data;
            console.log(this.existingPackagesInLocalDb);
            //loop in existingPackagesInLocalDb and find current packageId
            this.existingPackagesInLocalDb.forEach((elem,index) => {
              if(elem == this.selectedPackageForDownload.id){//remove matched element from array
                this.existingPackagesInLocalDb = this.existingPackagesInLocalDb.splice(index,1);
                console.log("new array after matched removed first",this.existingPackagesInLocalDb )
              }
            });
            
            this.existingPackagesInLocalDb.push({id:this.selectedPackageForDownload.id,details:this.selectedPackageForDownload})

            console.log("new array after matched removed and pushed",this.existingPackagesInLocalDb )
            console.log("selected package id::"+this.selectedPackageForDownload.id);         
            //this.existingPackagesInLocalDb.push(this.selectedPackageForDownload.id)

            console.log("user_package Array="+this.existingPackagesInLocalDb);
          }

          this._storage.set("user_packages", this.existingPackagesInLocalDb)
          .then((data) => {
            console.log("inside _storage"+JSON.stringify(data))
            console.log("user info successfully submitted", JSON.stringify(data));

            this.viewCtrl.dismiss({success:true});//close the popover
          })
          .catch((err) => {
            console.log("User Data not submitted", JSON.stringify(err));
          })

        })//end .then
        .catch((err) => {
          console.log(JSON.stringify(err));
        })
      
    });//end 

    this.toast.present();
  };//end this.toast.onDidDismiss

  showFailureToast(msg?: string) {
    let toast = this._toastCtrl.create({
      message: `Download Failed`,
      duration: 1000,
      position: 'middle',
      dismissOnPageChange:true
    });
    toast.present();
  };//

  closePopover(): void {
    this.viewCtrl.dismiss();
  };//

  abortDownloadAndExit(): void {
    this.fileTransfer.abort();
    this.viewCtrl.dismiss({success:false});
  };//


  populateForDesktop(){

    this._storage.get("user_packages")
        .then((data) => {
          console.log("outside null" + JSON.stringify(data));
          
          if (data == null) {
            //if user_packages == null do nothing
            console.log("inside null"+this.selectedPackageForDownload.id);
            this.existingPackagesInLocalDb.push({guestUser:this.downoadedAsGuestUser,id:this.selectedPackageForDownload.id,details:this.selectedPackageForDownload});
          } else {//if some packages exists in localDb
            this.existingPackagesInLocalDb = data;
            console.log(this.existingPackagesInLocalDb);
            //loop in existingPackagesInLocalDb and find current packageId
            _.forEach(this.existingPackagesInLocalDb,(elem:any,index:any) => {
              if(elem.id == this.selectedPackageForDownload.id){
                //this.existingPackagesInLocalDb = _.remove(this.existingPackagesInLocalDb,index);
                this.existingPackagesInLocalDb.splice(index,1);
                return false;
              }
            });
            this.existingPackagesInLocalDb.push({id:this.selectedPackageForDownload.id,details:this.selectedPackageForDownload});

            console.log("user_package Array="+this.existingPackagesInLocalDb);
          }

          this._storage.set("user_packages", this.existingPackagesInLocalDb)
          .then((data) => {
            console.log("inside _storage"+JSON.stringify(data))
            console.log("user info successfully submitted", JSON.stringify(data));
            setTimeout(() => {
                this.viewCtrl.dismiss({success:true});//close the popover
            }, 5000)
            
          })
          .catch((err) => {
            console.log("User Data not submitted", JSON.stringify(err));
          })

        })//end .then
        .catch((err) => {
          console.log(JSON.stringify(err));
        })

  }//end populateForDesktop



};//end class

