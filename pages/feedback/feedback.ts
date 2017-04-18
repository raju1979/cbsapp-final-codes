import { Component } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, LoadingController, ToastController } from 'ionic-angular';

import { UserdataService } from "../../services/userdata-service";

import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';

import { Storage } from '@ionic/storage';

declare var _: any;
declare var moment: any;

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html'
})

export class Feedback {
  formData: any;
  bookname: string;
  feedBackValue1: number = 2;
  feedBackValue2: number = 2;
  feedBackValue3: number = 2;
  feedBackValue4: boolean = true;
  feedBackValue5: boolean = true;
  feedbackSuggestion: string;

  userPackages: any;
  loading: any;

  userData: any;

  noResultFound:boolean = false;

  packagesHttpRequestCompleted:boolean = false;


  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _storage: Storage, public platform: Platform, private alertCtrl: AlertController, private _loadingController: LoadingController, private _toastCtrl:ToastController,private _network:Network, private _file:File) {

    console.log(moment().format('DD-MM-YYYY HH:mm:ss'));

  }

  showFormData() {
    if (typeof this.bookname !== 'undefined') {
      let currentTimeString = moment().format('DD-MM-YYYY HH:mm:ss');
      this.formData = {
        package_id: this.bookname,
        question_feedback: this.feedBackValue1,
        lecture_feedback: this.feedBackValue2,
        approach_feedback: this.feedBackValue3,
        vfm_feedback: this.feedBackValue4 == true ? 1 : 0,
        recommend_feedback: this.feedBackValue5 == true ? 1 : 0,
        feedback_text: this.feedbackSuggestion,
        user_id: this.userData.user_id,
        user_name: this.userPackages[0].name,
        feedback_time: currentTimeString
      }
      this._userDataService.sendFeedbackData(this.formData)
        .subscribe(
        (response) => {
          let status = response.status;
          let data = response.json();
          if (status == 200 && data.success == "true") {
            this.showFeedbackSubmittedAlert();
          } else {
            this.showError('some error');
          }
        },
        (err) => this.showError('some error')
        )
    }else{
      this.showNoPackageSelectedToast();
    }

  };//

  ngOnInit() {
    this.loading = this._loadingController.create({
      content: 'Please wait...'
    });

    if (this.platform.is("mobile") && this._network.type == 'NONE') {
      this.showNoNetworkAlert();
    } else {
      this._storage.get("user_master")
        .then((data) => {
          if (data == null) {
            console.log("no user data found");
            this.showError('error');
          } else {
            this.getUserOnlinePackages(data.user_id);
            this.userData = data;
          }
        });
      this.loading.present();
    }
    //
  };;//end ngOnInit


  getUserOnlinePackages(id: any) {
    this._userDataService.getAllPackageByUser(id)
      .subscribe(
      (data) => this.getPackages(data),
      (err) => this.showError(err)
      );
  }//end getUserOnlinePackages


  getPackages(data: any) {
    this.packagesHttpRequestCompleted = true;
    this.loading.dismiss();
    if (data[0].result == 0) {
      this.noResultFound = true;
      //this.showNoPackageAlert();
    } else {
      
      this.userPackages = data;
      console.log(this.userPackages);
    }
  }//end getPackages

  showError(err: any): void {
    this.loading.dismiss();
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: 'There is some error from server. Please connect to the Internet and restart the app!',
      buttons: ['OK']
    });
    alert.present();
  };//end showError

  showNoNetworkAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Not Online!',
      subTitle: 'we are unable to fetch you online questions. Please connect to the Internet and restart the app!',
      buttons: ['OK']
    });
    alert.present();
  };//end showNoNetworkAlert

  showNoPackageAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'No Package found!',
      subTitle: 'we are unable to fidn any package purchased by you!',
      buttons: ['OK']
    });
    alert.present();
  };//end showNoPackageAlert

  showFeedbackSubmittedAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Thanks!',
      subTitle: 'Thanks for your valuable feedback!',
      buttons: ['OK']
    });
    alert.present();
  };//end showFeedbackSubmittedAlert

  bookSelected($event:any, bookname:any) {
    console.log($event, bookname)
  };//


  showNoPackageSelectedToast(){
    let toast = this._toastCtrl.create({
      message: 'Please select a package',
      duration: 1000,
      position:'middle'
    });

    toast.present();
  };//


};//end class