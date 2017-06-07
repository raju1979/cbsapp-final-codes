import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BacktoLoginPage } from '../backto-login/backto-login';

import { UserdataService } from "../../services/userdata-service";

declare var _: any;

/*
  Generated class for the Forgotpassword page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-forgotpassword',
  templateUrl: 'forgotpassword.html'
})
export class ForgotpasswordPage {
  email:string = "";
  formData:any;
  formSubmitting:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService) { 
     
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotpasswordPage');
  }

  sendInfo(){
    this.formSubmitting = true;

    this.formData = {
      email: this.email
    }
    console.log(this.email);
    this._userDataService.resetPasswordLink(this.formData).subscribe(
      (response:any) => {
        console.log(response);
          let status = response.status;
          if (status == 200) {
            console.log('success');
            this.navCtrl.push(BacktoLoginPage);
          } else {
            console.log('error');
          }
        }
    );
    
  }

}
