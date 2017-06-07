import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform, LoadingController,ToastController } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';

import { UserdataService } from "../../services/userdata-service";

declare var _: any;
declare var moment:any;

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {

  loader: any;

  grandLevelRequestData: any;

  pkgLevelObj: Array<any> = [];

  userId:string;

  noResultFound:boolean = true;

  packagesHttpRequestCompleted:boolean = false;
  showpopup:boolean = false;

  testTypeToShow:any = {};

  levelsTestDataArray:any = [];

  loaderVisible:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _storage: Storage, public platform: Platform, private alertCtrl: AlertController, private loadingCtrl: LoadingController,private _toastCtrl:ToastController, private _network:Network) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DashboardPage');
  }

  ionViewWillLeave() {
    console.log("Looks like I'm about to leave :(");
    if(this.loaderVisible){
      this.loaderVisible = false;
      this.loader.dismiss();
    }
  };//


  ngOnInit() {

    if(this.platform.is('mobile') && this._network.type == 'none'){
      this.showNoNetworkAlert();
    }else{
      let userData: any;
      
      this.presentLoading('Fetching online packages');

      this._storage.get("user_master")
        .then((data: any) => {
          console.log(data);
          if (data == null) {

          } else {
            this.userId = data.user_id;
            userData = data.user_id;
            this.getUserLevels(userData);  
          }
        })//end this._storage.get
    }//end if(this._network.type == 'NONE')
    

  };//end ngOnInit

  getUserLevels(userData:any){
    let UserDataObj: any = {
        user_id: userData
    }
    this._userDataService.getBothLevelsForDashboard(UserDataObj)
        .subscribe(
        (response) => {
          this.dismissLoader();
            let status = response.status;
            let data = response.json();
            console.log(data);
            if(status == 200){
                this.populatePackageLevelArrayForUser(data.results)
            }else{
                this.showDataFetchErrorFromServer();
            }
            //this.populatePackageLevelArray(response);
        },
        (err) => this.showDataFetchErrorFromServer()
    )//end this._userDataService
  }
  
  populatePackageLevelArrayForUser(data:any){
    console.log(data);
    if(data == 0){

    }else{
      this.pkgLevelObj = data;
      this.noResultFound = false;
      console.log(this.pkgLevelObj);
    }
    
  };//

  showResult(passedPackageObj:any,testType:string){
    
    this.testTypeToShow.name = passedPackageObj.original_title;
    this.testTypeToShow.type = testType;

    let dataForUserService = {
      user_id:this.userId,
      package_id:passedPackageObj.package_id,
      test_type:testType == "Subject Grand" ? "grand" : "mega"
    }

    this.presentLoading('fetching data...');

    this._userDataService.getAlLevelDataForDashboard(dataForUserService)
      .subscribe(
        (response) =>{
          this.dismissLoader();
          let data = response.json();
          let status = response.status;
          if(status == 200){
            if(data.results == 0){//no data without error
              this.showNoDataForThisTestToast(this.testTypeToShow.name,this.testTypeToShow.type);
            }else{
              this.levelsTestDataArray = data.results;
              this.showpopup = true;
            }
          }else{
            this.showDataFetchErrorFromServer();
          }
          console.log(response.json())
        }
      ),
      (error) => {
        this.showDataFetchErrorFromServer();
      }

  };//end showResult


  closePopUp(){
    console.log('dsd');
    this.showpopup = false;
  }

 

  getUserIdFromLocalDb() {
    this._storage.get("user_master")
      .then((data) => {
        console.log(data);
        if (data == null) {
          return ("no user")
        } else {
          return (data);
        }
      })
  }

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

  getGrandDashboardText(individualPackagedata:any):string{
    let returnedString:string;

    if(individualPackagedata.max_grand_level == 0){
      returnedString = 'Subject Grand Test - No Test Result Available';
    }else{
      let levelCleared:string = individualPackagedata.grand_level_cleared == 1 ? 'Cleared' : 'Not Cleared';
      let percentMarks:string = individualPackagedata.grand_percent_marks > 0 ? `${individualPackagedata.grand_percent_marks}%` : ''
      returnedString = `Subject Grand Test - <span class='levelClearText'>${levelCleared}</span> <b>Level ${individualPackagedata.max_grand_level} of 5</b> (${percentMarks}) `;
    }
    return returnedString;
  };//

  getMegaDashboardText(individualPackagedata:any):string{
    let returnedString:string;

    if(individualPackagedata.max_mega_level == 0){
      returnedString = 'Subject Mega Test - No Test Result Available';
    }else{
      let levelCleared:string = individualPackagedata.mega_level_cleared == 1 ? 'Cleared' : 'Not Cleared';
      let percentMarks:string = individualPackagedata.mega_percent_marks > 0 ? `${individualPackagedata.mega_percent_marks}%` : ''
      returnedString = `Subject Mega Test - <span class='levelClearText'>${levelCleared}</span> <b>Level ${individualPackagedata.max_mega_level} of 3</b> (${percentMarks}) `;
    }

    return returnedString;
  };//

  showNoDataForThisTestToast(packageName:string, testType){
    let toast = this._toastCtrl.create({
      message: `No ${testType} test score available for  ${packageName}`,
      duration: 3000,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  };//

  getLevelNum(row){
    let levelNum:string;
    if(this.testTypeToShow.type == "Subject Grand"){
      levelNum = row.grand_level;
    }else if(this.testTypeToShow.type == "Mega Grand"){
      levelNum = row.mega_level;
    }

    return levelNum;
  }

  getLevelDate(row){
    let levelDate:string;
    levelDate = moment(row.timestring).format("DD-MMM-YYYY hh:mm");
    return levelDate;
  };//

  getTestClearText(row):string{
    console.log(row.level_cleared);
    let getTestClearText:string;
    if(row.level_cleared == "0"){
      getTestClearText = "Not Cleared";
    }else{
      getTestClearText = "Cleared";
    }

    return getTestClearText;
  };//

  getTestClearColor(row):string{
    console.log(row.level_cleared);
    let getTestClearColor:string;
    if(row.level_cleared == "0"){
      getTestClearColor = "danger";
    }else{
      getTestClearColor = "secondary";
    }

    return getTestClearColor;
  };//

  presentLoading(msg?:string) {

      this.loader = this.loadingCtrl.create({
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

}//end class
