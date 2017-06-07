import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ToastController, LoadingController, ModalController } from 'ionic-angular';

import { UserdataService } from "../../services/userdata-service";
import { DownloadedPackageView } from '../downloaded-package-view/downloaded-package-view';

import { Network } from '@ionic-native/network';

import { FormatNotificationDatePipe } from "../pipes/formatNotificationDate.pipe";

import { Storage } from '@ionic/storage';

declare var moment:any;
declare var _:any;
/**
 * DESCRIPTION about LEVELS used
 * Level-1 is normal info
 * Level-2 is Alert
 * Level-3 is for Update only
 */

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {

  notifications:Array<any> = [];
  userData:any;
  userPurchasedPackagesArray;

  loader: any;

  newTimeStamp:string;

  loaderVisible:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private alertCtrl: AlertController, private _userDataService: UserdataService, private _toastCtrl: ToastController, private _loadingController: LoadingController, private _network:Network,private _storage:Storage) {




  };//end constructor

  ionViewWillLeave() {
    console.log("Looks like I'm about to leave :(");
    if(this.loaderVisible){
      this.loaderVisible = false;
      this.loader.dismiss();
    }
  }

  ngOnInit(){

    if(this.platform.is('mobile') && this._network.type == 'none'){
      this.showNoNetworkAlert();
    }else{
      this._storage.get("user_master")
      .then((val) => {
        if(val == null){

        }else{
          this.userData = val;
          console.log("user data is",this.userData);
          this.fetchNotificationListAferUserDataget();
        }
      })
    };//end if(this.platform.is('mobile') && this._network.type == 'none')
    
  };//end ngOnInit

  fetchNotificationListAferUserDataget(){

    
    this.presentLoading('Fetching online notifications');

    this._userDataService.getNotificationList()
      .subscribe(
        (data) => {
          this.dismissLoader();
          let status = data.status;
          let returnedData = data.json();
          console.log(status,returnedData)
          if(data.status == 200){
            
            if(returnedData.notifications.length > 0){
              this.notifications = returnedData.notifications;
              console.log(this.notifications);
              setTimeout(() => {
                this.presentLoading('Fetching your purchased packages');
                this._userDataService.getAllPackageByUser(this.userData.user_id)
                  .subscribe(
                    (data) => this.populateUserPackages(data),
                    (err) => this.showDataFetchErrorFromServer()
                  )
              },1000)
              
            }else if(returnedData.notifications.result == 0){
              console.log('no notifications found');
            }
          }
        },
        (err) => {
          this.showDataFetchErrorFromServer()
        }
      );//end .subscribe


  };//end fetchNotificationListAferUserDataget

  populateUserPackages(userPackagesData:any){
    this.dismissLoader();
    console.log(userPackagesData);
    if(userPackagesData[0].result == 0){
      console.log("no package for this user")
    }else{
      this.userPurchasedPackagesArray = userPackagesData;
      //compare with 
      _.each(this.notifications,(value,index) => {
        let packageIndexInNotificationArray = _.findIndex(this.userPurchasedPackagesArray,(o) => {
          return o.package_id == value.package_id
        });
        if(packageIndexInNotificationArray != -1){
         value["purchasedByCurrentUser"] = true
        }else{
          value["purchasedByCurrentUser"] = false
        }
        
        console.log(packageIndexInNotificationArray);
      })
      console.log(this.notifications);
    }
  }

  getNotificationIcon(levelNum:string):string{
    let level = (levelNum);
    let iconName:string;
    switch(level){
      case "1":{
        iconName = 'information-circle';
        break;
      }
      case "2":{
        iconName = 'warning';
        break;
      }
      case "3":{
        iconName = 'ios-cloud-download-outline';
        break;
      }
    }
    return iconName;
  };//

  getNotificationColor(levelNum:string):string{
    let level = (levelNum);
    let iconColor:string;
    switch(level){
      case "1":{
        iconColor = 'warning';
        break;
      }
      case "2":{
        iconColor = 'danger';
        break;
      }
      case "3":{
        iconColor = 'secondary';
        break;
      }
    }
    return iconColor;
  };//

  gotoDownloadPackageView(item:any){
    if(item.purchasedByCurrentUser){
      let packageObject = {
        packageid:item.package_id
      }
      console.log(item.package_id)
      this.presentLoading('Fetching your packages')
      this._userDataService.getPackageDetailFromPackageMaster(packageObject)
        .subscribe(
          (response:any) => {
            this.dismissLoader();
            let status:any = response.status;
            let data:any = response.json();
            console.log(data)
            if(data.result == 0){
              this.showNoPackageAlert();
            }else{
              console.log(response.json())
              this._storage.get("timestampForPackage_"+data.id)
              .then((val: any) => {
                  if (val == null) {
                    this.navCtrl.push(DownloadedPackageView,{data:data});
                  } else {
                      this.newTimeStamp = val;
                      if(this.newTimeStamp == data.release_date){
                        this.showPackageAlreadyUpdatedAlert();
                      }else{
                        this.navCtrl.push(DownloadedPackageView,{data:data});
                      }
                  }
              });
              
              
            }            
          },//end response:any
          (err:any) => {
            this.showDataFetchErrorFromServer();
          }
        )
      
    }
    
  };//

   showNoNetworkAlert(): void {
    if(this.loaderVisible){
      this.loader.dismiss();
    }        
    let alert = this.alertCtrl.create({
      title: 'Not Online!',
      subTitle: 'Please check your internet connection!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showDataFetchErrorFromServer(): void {
    if(this.loaderVisible){
      this.loader.dismiss();
    } 
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: `There is some problem at server. Please check your network connection!`,
      buttons: ['OK']
    });
    alert.present();
  };//

  showNoPackageAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'No Package found!',
      subTitle: 'we are unable to finn any package for this name, Please restart the app!',
      buttons: ['OK']
    });
    alert.present();
  };//end showNoPackageAlert

  showPackageAlreadyUpdatedAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Package Already Updated!',
      subTitle: 'Your downloaded package is already updated, there is no need to take any further action!',
      buttons: ['OK']
    });
    alert.present();
  };//end showNoPackageAlert

  presentLoading(msg?:string) {

      this.loader = this._loadingController.create({
          content: `Please wait...${msg}`,
          showBackdrop: true, //dark background while loading
          dismissOnPageChange: true
      });

      this.loaderVisible = true;

      this.loader.onDidDismiss(() => {
        console.log('Dismissed loading');
        this.loaderVisible = false;
      });

      this.loader.present();

  };//

  dismissLoader(){
    setTimeout(() => {
      this.loader.dismiss();
    },500)    
  };//


};//end class
