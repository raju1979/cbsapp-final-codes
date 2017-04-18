import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { UserdataService } from "../../services/userdata-service";

declare var _: any;

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {

  loader: any;

  grandLevelRequestData: any;

  pkgLevelObj: Array<any> = [];

  noResultFound:boolean = true;

  packagesHttpRequestCompleted:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _storage: Storage, public platform: Platform, private alertCtrl: AlertController, private loadingCtrl: LoadingController) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DashboardPage');
  }


  ngOnInit() {
    let userData: any;

    this.loader = this.loadingCtrl.create({
      content: "Please wait... Fetching online packages",
    });
    this.loader.present();

    this._storage.get("user_master")
      .then((data: any) => {
        console.log(data);
        if (data == null) {

        } else {
          userData = data.user_id;
          this.getUserLevels(userData);  
        }
      })//end this._storage.get

  };//end ngOnInit

  getUserLevels(userData:any){
    let UserDataObj: any = {
        user_id: userData
    }
    this._userDataService.getBothLevelsForDashboard(UserDataObj)
        .subscribe(
        (response) => {
          this.loader.dismiss();
            let status = response.status;
            let data = response.json();
            console.log(data);
            if(status == 200){
                this.populatePackageLevelArrayForUser(data.results)
            }else{
                this.showDataFetchErrorFromServer('no data')
            }
            //this.populatePackageLevelArray(response);
        },
        (err) => this.showDataFetchErrorFromServer(err)
    )//end this._userDataService
  }
  
  populatePackageLevelArrayForUser(data:any){
    
    this.pkgLevelObj = data;
    this.noResultFound = false;
    console.log(this.pkgLevelObj);
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
    this.loader.dismiss();
    let alert = this.alertCtrl.create({
      title: 'Not Online!',
      subTitle: 'we are unable to fetch you online questions. Please connect to the Internet and restart the app!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showDataFetchErrorFromServer(err: any): void {
    this.loader.dismiss();
    let errorMsg: any = JSON.stringify(err);
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: `There is some problem at server. Please check your network connection and Restart the App!<br />${errorMsg}`,
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

}
