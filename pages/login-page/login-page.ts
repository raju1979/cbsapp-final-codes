import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, MenuController, ToastController, Platform, AlertController } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';

import { Network} from '@ionic-native/network';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import { ForgotpasswordPage } from '../forgotpassword/forgotpassword';



import { HelloIonicPage } from '../hello-ionic/hello-ionic';

import { UserdataService } from "../../services/userdata-service";
import { ConnectivityService } from "../../services/connectivity-service";

import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';

/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var localStorageDB: any;

@Component({
  selector: 'page-login-page',
  templateUrl: 'login-page.html'
})
export class LoginPage {

  db: any;
  lib: any;

  userData: any;
  user_logged: boolean = false;
  user_id: string = '';
  loginFormSubmit: boolean = false;

  istrue: boolean = true;

  todo: any;
  userdata: any;
  networkType: string;
  basicAlert: any;

  disconnectSubscription: any;
  connectSubscription: any;

  isNetworkConnected: boolean = false;

  deviceUUID:string = '';
  isIos: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private _zone: NgZone, private _menuController: MenuController, private _formBuilder: FormBuilder, private _userDataService: UserdataService, private _connectivityService: ConnectivityService, private _toastCtrl: ToastController, private _plaform: Platform, private _alert: AlertController, private _storage:Storage,private device:Device,private _network:Network) {
    let EMAIL_REGEXP = /^[^@]+@([^@\.]+\.)+[^@\.]+$/i;
    this.userdata = this._formBuilder.group({
      email: [''],
      password: [''],
    });

    if (this._plaform.is('mobile')) {
      this.db = new SQLite();
    }
    
    if(this._plaform.is('android')){
      this.isIos = false;
    }
    if(this._plaform.is('ios')){
      this.isIos = true;
    }


    this._plaform.ready().then(x => {

      this._zone.run(() => {
        this.disconnectSubscription = this._network.onDisconnect().subscribe(x => {
          console.log('network disconnected');
          this.isNetworkConnected = false;
        });
      });

      this._zone.run(() => {
        this.connectSubscription = this._network.onConnect().subscribe(x => {
          setTimeout(() => {
            console.log('network connected', this._network.type);
            this.isNetworkConnected = true;
          }, 500)
        });
      });

      if(this._plaform.is("mobile")){
        this.deviceUUID = this.device.uuid;
        console.log("DEVICE UUID::", this.deviceUUID);
      }

    });
    if (this._plaform.is('core')) {

    }


  }

  ionViewDidLoad() {
    //let connection = this._connectivityService.isOnline();
    //console.log(connection);
  }

  ionViewDidEnter() {
    this._menuController.enable(false);//disable the side navigation
    

    this._storage.ready()
      .then((data) => {
        this._storage.get("user_master")
          .then((data) => {
            console.log(JSON.stringify(data));
            if(data == null){
              //if user_master == null do nothing
              this.user_logged = false;
              console.log(this.user_logged);
            }else{
              this.user_logged = true;
              this.setUserDataForSubscribeEvent(data);
              this.navigateToHomeRoot();
            }
          })
          .catch((err) => {
            console.log(JSON.stringify(err));
          })
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
      });

  };//end ionViewDidEnter

  ionViewWillLeave() {
    this._menuController.enable(true);
    this.disconnectSubscription.unsubscribe();
    this.connectSubscription.unsubscribe();
  }

  logForm() {
    this.loggedInNavigate();
  };//

  loggedInNavigate() {
    this.loginFormSubmit = true;
    let login = this._userDataService.getUserValidated(this.userdata.value.email, this.userdata.value.password)
      .subscribe(
      (data: any) => this.checkUserStatus(data),
      (err: any) => this.showHttpError(err)
      );
  }


  showHttpError(err: any) {
    this.loginFormSubmit = false;
    this.basicAlert = this._alert.create({
      title: 'Error!',
      subTitle: 'There is some problem at server, Please restart the app and try again!',
      buttons: ['OK']
    });
    this.basicAlert.present();
  }

  checkUserStatus(data: any) {//the data received from server has id,name,user_email,user_pass
    this.loginFormSubmit = false;
    let userData = data;
    //console.log(userData);
    if (userData[0].result == "0") {//user validation fails
      let toast = this._toastCtrl.create({
        message: 'Sorry, Invalid username / password',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    } else {//user validation successfull
      let toast = this._toastCtrl.create({
        message: 'Successfull logged in',
        duration: 3000,
        position: 'bottom',
        dismissOnPageChange:true
      });
      toast.present();

      this.appendUserLoginData(userData[0]);
      // if (this._plaform.is('mobile')) {
      //   this._userDataService.setUserData(userData[0]);
      // };
      this._userDataService.setUserData(userData[0]);

      this.navigateToHomeRoot();


    }//end else

  };//end checkUserStatus

  navigateToHomeRoot() {
    setTimeout(() => {
      this.navCtrl.setRoot(HelloIonicPage)
        .then(data => {
          //console.log(data);
        }, (error) => {
          console.log(error);
        })
    }, 2000);
  }

  appendUserLoginData(userData: any): void {

    // if (this._plaform.is('mobile')) {
    //   //console.log(userData);
    //   this.db.openDatabase({
    //     name: 'cbsapp.db',
    //     location: 'default' // the location field is required
    //   }).then(() => {
    //     this.db.executeSql(`INSERT INTO user_master (user_id, user_name,user_email) VALUES (?, ?,?)`, [userData.id, userData.name, userData.user_email]).then((data: any) => {
    //       console.log("INSERTED: " + JSON.stringify(data.rows));
    //       //this.readSqliteLoginData();
    //     }, (err: any) => {
    //       console.log("ERROR login line 177: " + JSON.stringify(err));
    //     });
    //   }, (err: any) => {
    //     console.error('Unable to open database: ', err);
    //   });
    // } else {
    //   this._userDataService.setUserLoginDataLocalStorage(userData);
    // }

    var user_data = {
      user_id:userData.id,
      user_name:userData.name,
      user_email:userData.user_email
    }

    this._storage.set("user_master",user_data)
      .then((data) => {
        console.log("user info successfully submitted",JSON.stringify(data));
      })
      .catch((err) => {
        console.log("User Data not submitted",JSON.stringify(err));
      })

  };//end appendUserLoginData

  createUserMasterTable() {
    this.db.openDatabase({
      name: 'cbsapp.db',
      location: 'default' // the location field is required
    }).then(() => {
      this.db.executeSql(`CREATE TABLE IF NOT EXISTS user_master (user_id VARCHAR(9) , user_name VARCHAR(30), user_email VARCHAR(255))`, []).then((data: any) => {
        console.log("INSERTED: " + JSON.stringify(data.rows));
        //this.readSqliteLoginData();
      }, (err: any) => {
        console.log("ERROR login line 193: " + JSON.stringify(err));
      });
    }, (err: any) => {
      console.error('Unable to open database: ', err);
    });
  }

  readSqliteLoginData() {
    this.db.executeSql("SELECT * FROM user_master", []).then((data: any) => {
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          //this.people.push({firstname: data.rows.item(i).firstname, lastname: data.rows.item(i).lastname});
          console.log("row", data.rows.item(i))
        }
      }
    }, (error: any) => {
      console.log("ERROR in Read: " + JSON.stringify(error));
    });
  };//

  setUserDataForSubscribeEvent(data:any){
    var dummyObj = {
      "autoid": "1",
      "id": data.user_id,
      "name": data.user_name,
      "user_email": data.user_email,
      "user_pass": "",
      "mobile": "",
      "address": "",
      "pincode": "",
      "cityname": "",
      "state": "",
      "institution": "",
      "studyingyear": ""
    };

    this._userDataService.setUserData(dummyObj);

    console.log(dummyObj);
  }

  goToForgotPassPage() {
    this.navCtrl.push(ForgotpasswordPage, {})
  };
  goToSignUp(){ 
    window.open(`https://mycbsexambooks.com/`, '_system', 'location=yes'); 
    return false;
  }
}//end class





