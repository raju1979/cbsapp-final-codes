import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Platform, LoadingController } from 'ionic-angular';
import { UserdataService } from "../../services/userdata-service";

import { Storage } from '@ionic/storage';
import { Network } from '@ionic-native/network';



/*
  Generated class for the AddPasscode page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
declare var moment: any;
declare var _: any;
@Component({
  selector: 'page-add-passcode',
  templateUrl: 'add-passcode.html'
})
export class AddPasscodePage {

  passCodeText: string = '';
  passcodeError: string = '';
  uniqueKeyText: string = '';
  uniqueKeyError: string = '';
  submitting: boolean = false;
  btnStatus: string = '';

  datatext: any;
  tocJsonData: any;
  htmlSnippet: any;

  loader: any;

  timestamp: string;

  userData: any;

  existingPackagesList: Array<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService,private _alertCtrl: AlertController, private _loadingCtrl: LoadingController, private _storage: Storage, private _platform: Platform,private _network: Network) {

    this._storage.get("user_master")
      .then((data) => {
        if (data == null) {
          console.log("data local error")
        } else {
          this.userData = data;
          this.getUserOnlinePackages(this.userData);
        }
      })
    
  };//

  // done of 16th feb
  getUserOnlinePackages(data: any) {
    if (this._platform.is('mobile') && this._network.type == 'none') {
      console.log('offline mobile cant continue');
      this.showNoNetworkAlert();
    } else {
      this.loader = this._loadingCtrl.create({
        content: "Please wait, getting your packages list..."
      });
      this.loader.present();
      this._userDataService.getAllPackageByUser(data.user_id)
        .subscribe(
        (data) => {
          this.loader.dismiss();
          if (data.result == 0) {

          } else {
            this.existingPackagesList = data;
          }
          console.log(data)
        },
        (err) => this.showDataFetchErrorFromServer(err)
        );
    };

  }//

  appendTimestamp() {
    var m = moment(); // get "now" as a moment
    this.timestamp = m.format();
    console.log(this.timestamp);
  }; //

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddPasscodePage');
  }
  
  onSubmitting() {



    this.appendTimestamp();
    this.loader = this._loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader.present();

    let uniqueIdText = this.uniqueKeyText.trim();
    let passCodeName = this.passCodeText.trim();

    if (uniqueIdText.length <= 0 || passCodeName.length <= 0) {
      this.showInvalidDataEnteredAlert();
    } else {
      let uniqueDataObj = {
        uniqueid: uniqueIdText,
        packageid: passCodeName
      }

      //check if unique_id entered already exist in user existingPackagesList
      var idIndex = _.findIndex(this.existingPackagesList, function (o) {
        return o.unique_id == uniqueIdText;
      })
      if (idIndex >= 0) {
        this.showUniqueIdAlreadyExistAlert();//if unique_id already exist in existingPackagesList
      } else {
        this._userDataService.getUniqueIdStatus(uniqueDataObj)
          .subscribe(
          (response: any) => {
              let data = response.json();
              if (response.status == 200) {
                if (data.results == "0") {
                  this.showInvalidDataEnteredAlert();
                } else {
                  this.loader.dismiss();
                  this.updateUniqueIdAndInsertIntoPurchaseMaster(data.results);
                }
              } else {
                this.showDataFetchErrorFromServer('error');
              }
            },
            (err: any) => {
              this.showDataFetchErrorFromServer(err);
            }
          )//end response
      }//end if (idIndex >= 0)

    }//end if (uniqueIdText.length <= 0 || passCodeName.length <= 0)

  };//end onSubmitting()

  updateUniqueIdAndInsertIntoPurchaseMaster(data: any) {
    // $userid = $_REQUEST['userid'];
    // $packageid = $_REQUEST['packageid'];
    // $uniqueid = $_REQUEST['uniqueid'];
    // $timestamp = $_REQUEST['timestamp'];
    // $transaction_id = $_REQUEST['transaction_id'];
    console.log(data[0]);
    var purchaseMAsterSubmitDataObj = {
      userid: this.userData.user_id,
      packageid: data[0].package_id,
      uniqueid: this.uniqueKeyText.trim(),
      timestamp: this.timestamp,
      transaction_id: (Math.random() * 1e64).toString(36).substr(2, 12)
    }

    this.loader = this._loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader.present();

    console.log(purchaseMAsterSubmitDataObj)

    this._userDataService.updateUniqueIdAndInsertIntoPurchaseMaster(purchaseMAsterSubmitDataObj)
      .subscribe(
      (response: any) => {
        console.log(response.json());
        let insertData = response.json()
        if (response.status == 200) {
          console.log(insertData);
          if (insertData.success == 'true') {
            this.showDataEnteredSuccessAlert();
          } else {
            this.showDataFetchErrorFromServer('err');
          }
        } else {
          this.showDataFetchErrorFromServer('err');
        }
      },
      (err) => {
        console.log(err);
        this.showDataFetchErrorFromServer('err');
      }
      );//end subscribe


  };//


  showDataFetchErrorFromServer(err: any): void {
    this.loader.dismiss();

    let errorMsg: any = JSON.stringify(err);
    let alert = this._alertCtrl.create({
      title: 'Error!',
      subTitle: `There is some problem at server. Please check your network connection and Restart the App!`,
      buttons: ['OK']
    });
    alert.present();
  };//

  showInvalidDataEnteredAlert(): void {
    this.loader.dismiss();

    let alert = this._alertCtrl.create({
      title: 'Error!',
      subTitle: 'Invalid Passcode or UniqueId!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showUniqueIdAlreadyExistAlert(): void {
    this.loader.dismiss();

    let alert = this._alertCtrl.create({
      title: 'Error!',
      subTitle: 'Unique id already exists!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showDataEnteredSuccessAlert(): void {
    this.loader.dismiss();

    let alert = this._alertCtrl.create({
      title: 'Success!',
      subTitle: 'Passcode inserted successfully, now please download the package!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showNoNetworkAlert(): void {
    let alert = this._alertCtrl.create({
      title: 'Not Online!',
      subTitle: 'we are unable to fetch you online packages. Please connect to the Internet and restart the app!',
      buttons: ['OK']
    });
    alert.present();
  };//





}
