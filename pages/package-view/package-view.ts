import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

import { UserdataService } from "../../services/userdata-service";
import { CompleteView } from '../complete-view/complete-view';
import { GuestDownloadedPackageView } from '../guest-downloaded-package-view/guest-downloaded-package-view';
import { DownloadedPackageView } from '../downloaded-package-view/downloaded-package-view';
/*
  Generated class for the PackageView page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-package-view',
  templateUrl: 'package-view.html'
})
export class PackageView {

  parsedpackageData: any;
  packageDescription: any;
  packageData: any;
  isGuestUser:Boolean = true;
  relationship: string = "details";
  moviewReviewsArray: any = [];
  baseUrlPackage: any;
  hideBuyBtn: any = true;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _platfrom: Platform) {
    this.parsedpackageData = this.navParams.get('data');
    this.isGuestUser = this.navParams.get('guestUser') == 'no' ? false : true;
    console.log(this.parsedpackageData,this.isGuestUser);
    this.baseUrlPackage = this._userDataService.returnBaseUrlPackage();
    if(this._platfrom.is('ios')){
      this.hideBuyBtn = false;
      console.log(this.hideBuyBtn);
    } else if (this._platfrom.is('android')){
      this.hideBuyBtn = true;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PackageViewPage');
  }

  ngOnInit() {
    // this._userDataService.getpackageById(this.parsedpackageData).subscribe(
    //     (data) => this.populatePackageData(data),
    //     (err) => console.log(err)
    // )
    this._userDataService.getPackageDesciption(this.parsedpackageData.id).subscribe(
      (data: any) => this.populatePackageData(data),
      (error) => console.log(error)
    )
  };//

  populatePackageData(data: any) {
    this.packageDescription = data;
    console.log(this.packageDescription);
  };//

  populateMoviReviewsArray(data: any) {
    this.moviewReviewsArray = data.results;
    console.log(this.moviewReviewsArray);
  }

  selectedEnemies() {
    this.relationship = "details";
  }
  getImageUrl(packageId: any, posterPath: any): string {
    return this.baseUrlPackage + packageId + "/" + "poster.png";
  };//
  getAuthorImageUrl(packageId: any, imgPath: any): string {
    return this.baseUrlPackage + packageId + "/description/" + imgPath;
  };//


  selectedFriends() {
    this.relationship = "reviews";
  }
  gotoCompleteView(id: any) {
    this.navCtrl.push(CompleteView, {
      data: id
    })
  };//

  gotoDownloadedPackageViewAsGuest(packageData: any) {
    this.navCtrl.push(GuestDownloadedPackageView, {
      data: packageData,
      guestUser:'yes'
    })
  };//

  gotoDownloadedPackageViewAsPrivilegedUser(packageData: any) {
    this.navCtrl.push(DownloadedPackageView, {
      data: packageData,
      guestUser:'no'
    })
  };//

}
