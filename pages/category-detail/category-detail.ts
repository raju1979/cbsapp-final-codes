import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController,Platform } from 'ionic-angular';

import { PackageView } from '../package-view/package-view';


import { UserdataService } from "../../services/userdata-service";
import { Storage } from '@ionic/storage';

declare var _: any;

/*
  Generated class for the CategoryDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-category-detail',
  templateUrl: 'category-detail.html'
})
export class CategoryDetail {


  currentOs: string = '';
  isPurchased: boolean;
  userData: any = '';
  userPackages: any = []; //this containe the packages list purchased by user get from purchase_master
  userPackagesList: Array<any> = [];//this contain the individual package get from package_master
  loading: any;
  categoryData: any;
  packageListArray: any = [];
  tempPackageListArray: any = [];
  tempPackageListArrayWithPurchased: any = [];

  searchString: string = '';
  filterSet: boolean = false;

  baseUrlPackage: any;

  


  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _toastCtrl: ToastController, private _loadingController: LoadingController, private _storage: Storage, private _platform:Platform) {

    this.baseUrlPackage = this._userDataService.returnBaseUrlPackage();

  }

  ionViewWillEnter():void{
    if(this._platform.is("android")){
      this.currentOs = "android";
    }else if(this._platform.is("ios")){
      this.currentOs = "ios";
    }else if(this._platform.is("core")){
      this.currentOs = "core";
    }
  }

  ionViewDidEnter(): void {
    this._storage.get("user_master")
      .then((data) => {
        console.log(data);
        this.userData = data;//get user data from user_master key
        console.log(this.userData);
        this.getUserOnlinePackages(this.userData.user_id);//send request to server
      })
      .catch((err) => {
        console.log("Myshelf error", JSON.stringify(err));
      })
  };

  ngOnInit() {

    this.loading = this._loadingController.create({
      content: 'Please wait...'
    });
    this.loading.present();

    this.categoryData = this.navParams.get('data');
    console.log("ITEM is ::" + this.categoryData);
    this._userDataService.getBooksByGnereIdCategoryDetailsPage(this.categoryData.id, 0)
      .subscribe(
      (data) => this.populatePackageListArray(data),
      (err) => this.showHttpError(err)
      )
  };//

  showError(err: any) {
    console.log(err.json());
    this.loading.dismiss();
    let toast = this._toastCtrl.create({
      message: `Sorry, Some error occured from server, please restart the App. Error Code: ${err.status}`,
      duration: 3000,
      position: 'middle',
      dismissOnPageChange:true
    });
    toast.present();
  };//end showError  

  populatePackageListArray(data: any) {
    
    console.log(data);
    if(typeof data.results !== 'undefined'){
      this.packageListArray = data.results;
      this.tempPackageListArray = [].concat(this.packageListArray);
      console.log(this.tempPackageListArray);
    }   

  }

  getUserOnlinePackages(id: any) {
    this._userDataService.getAllPackageByUser(id)
      .subscribe(
      (data) => this.getPackages(data),
      (err) => this.showError(err)
      );
  }//

  populateUserPackagesList(data: Array<any>): void {
    
    this.userPackagesList = data;
    console.log(this.userPackagesList);
  };//end populateUserPackagesList

  getPackages(data: any) {
    this.loading.dismiss();
    if (data[0].result == 0) {
      console.log('You dont have any packages purchased');
    } else {
      this.userPackages = data;

      // _.forEach(this.tempPackageListArray,(onlinePkg,index) =>{
      //   _.forEach(this.userPackages,(userPkg,innerIndex) =>{
      //     if (userPkg.package_id == onlinePkg.id) {
      //       this.tempPackageListArray[index]["isPurchased"] = true;
      //       return false;
      //     }else{
      //       this.tempPackageListArray[index]["isPurchased"] = false;
      //     }
      //   })
      // })
      
    }
  }//

  getOnlinePackages(): void {
    console.log(this.userPackages);
    //this.loading.dismiss();
    this._userDataService.getInduvidualPackagesPurchasedByUser(this.userPackages)
      .subscribe(
      (data) => this.populateUserPackagesList(data),
      (err) => console.log(err)
      )
  };//

  checkPackageStatus(id:string): string {
    //console.log(this.userPackages,id);
    let returnedString:string = '';
    // _.forEach(this.userPackages,(userPkg:any,innerIndex:any) =>{
    //  if(userPkg.package_id == id){
    //    returnedString = 'androidview';
    //    return false;
    //  }else{
    //    console.log("inside else",this.currentOs)
    //    if(this.currentOs=="ios"){
    //      returnedString = 'iossample';
    //    }else if(this.currentOs=="android" || this._platform.is("core")){
    //     returnedString =  "androidbuy";
    //    }
    //  }
    // });
    var idIndex = _.findIndex(this.userPackages, function (o) {
      return o.package_id ==id
    })
    if(idIndex >= 0){//if id found in user purchased array
      returnedString = 'androidview';
    }else{
      if(this.currentOs == "android"){
        returnedString =  "androidbuy";
      }else if(this.currentOs == "ios"){
        returnedString =  "iossample";
      }else if(this.currentOs == 'core'){
        returnedString =  "androidbuy";
      }
      
    }
    //console.log("matched index is::",idIndex);
    //console.log("returned string::",returnedString);
    return returnedString;
  };//



  showHttpError(err: any): void {
    this.loading.dismiss();
    let toast = this._toastCtrl.create({
      message: `Sorry, Some error occured from server, please check the network connectivity and restart the App. Error Code: ${err.status}`,
      duration: 5000,
      position: 'middle'
    });
    toast.present();
  };//


  gotoPackageView(id: any) {
    this.navCtrl.push(PackageView, {
      data: id,
      guestUser:'yes'
    })
  };;//


  // gotoDownloadedPackageView(packageData: any) {
  //   this.navCtrl.push(DownloadedPackageView, {
  //     data: packageData,
  //     guestUser:'no'
  //   })
  // };//

  gotoPackageViewAsPrivilegedUser(packageData: any) {
    this.navCtrl.push(PackageView, {
      data: packageData,
      guestUser:'no'
    })
  };//

    getImageUrl(packageId: any, posterPath: any): string {
        
          return this.baseUrlPackage +   packageId + "/" + "poster.png";

    };//

 



}
