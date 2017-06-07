import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


import { LoginPage } from '../login-page/login-page';

@Component({
  selector: 'page-backto-login',
  templateUrl: 'backto-login.html'
})
export class BacktoLoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad BacktoLoginPage');
  }
  gotologin(){
    this.navCtrl.push(LoginPage);
  }
}
