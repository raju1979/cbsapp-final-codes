import { Component } from '@angular/core';
import { NavController, NavParams, AlertController,ToastController,Platform,LoadingController } from 'ionic-angular';

import { UserdataService } from "../../services/userdata-service";
import { QuestionsView } from '../questions-view/questions-view';

import { Network } from '@ionic-native/network';
import { File } from '@ionic-native/file';

import { Storage } from '@ionic/storage';

interface IQuestionData {
  chapter: number,
  questionArray: Array<any>,
  shuffledQuestionArray: Array<any>,
  level: number,
  lastQuestionAttempted: number
};

declare var _: any;

declare var cordova: any;

@Component({
  selector: 'page-complete-view',
  templateUrl: 'complete-view.html'
})
export class CompleteView {


  packageId: string = '';
  packageData: any;
  relationship: string = "details";
  moviewReviewsArray: any = [];

  passedTocJson: any;
  questionsJson: any;
  passedPackage: any;

  question_data: any;

  alert: any;
  currentPackageData: any;//it will hold current package questions from localstorage
  activeChapterIndex: number;
  packageExists: boolean = false;
  existingPackage:any;

  chaptersArray:any;

  isGuestUser:boolean = true;
  readonly maxQuestionsFromEachChapperForGuestUser:number = 5;

  mainDirectoryName: string = "cbsapp";
  fs: string;

  loader:any;


  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform,private _userDataService: UserdataService, private _alertCtrl: AlertController, private _storage: Storage, private _toastCtrl:ToastController,private loadingCtrl: LoadingController,private _file:File,private _network: Network) {



    this.passedTocJson = this.navParams.get('data');
    this.passedPackage = this.navParams.get("packageData");

    this.isGuestUser = this.navParams.get('guestUser')

    console.log('this is guest uer::',this.isGuestUser);

    if (this.platform.is('ios')) {
            this.fs = cordova.file.documentsDirectory;
        }
        else if (this.platform.is('android')) {
            this.fs = cordova.file.externalRootDirectory;
        }







  };//end constructor

  populateQuestionsJsonFromService(data: any) {
    this.loader.dismiss();
    this.questionsJson = data[0];
    console.log('questions for array::',this.questionsJson);
    this.chaptersArray = new Array<any>(this.questionsJson.chapters.length);
    for(let i=0; i<this.chaptersArray.length; i++){
      this.chaptersArray[i] = {
        selected:false,
        questions:this.questionsJson.chapters[i].data
      }
    }

    console.log(this.chaptersArray)
  };//

  ngOnInit() {
    this._storage.get("review_"+this.passedTocJson.id)
    .then((data) => {
      if(data !== null){
        this.presentContinueTestConfirm(0);
      }else{
        console.log("no package found")
        this.getPackageData();
      }
    })
    .catch((err) => {
      console.log("package not found"+ err)
    })
  };

  getPackageData(){
    if(this.platform.is('mobile') && !this.isGuestUser){
      this.loader = this.loadingCtrl.create({
          content: "Please wait, Getting Review Quesiotns data...",
        });
        this.loader.present();
      this._file.readAsText(this.fs, this.mainDirectoryName + "/" + this.passedPackage.id + "/" + "questions.json").
          then((data: any) => {
              let TocJson = JSON.parse(data);
              console.log('questions json from local read::',TocJson);
              this.populateQuestionsJsonFromService(TocJson);
          })
          .catch((err) => {
              this.loader.dismiss();
              console.log(err);
          })
    }else{
      if(this.platform.is('mobile') && this._network.type=='none'){
        this.showNoNetworkAlert();
      }else{
        this.loader = this.loadingCtrl.create({
          content: "Please wait...",
        });
        this.loader.present();
        this._userDataService.getReviewQuestionsFromServer(this.passedTocJson.id)
        .subscribe(
        (data) => this.populateQuestionsJsonFromService(data),
        (err) => this.showDataFetchErrorFromServer()
        )
      }
    }
  }

  //get localstorage data for question data
  ionViewWillEnter() {

    this._storage.length().then((data:any) => {
      console.log(data);
    })

    //check packageId --> indexedDB keys. IF exists then store package object in existingPackage
    this._storage.keys().then((data:any) => {
      for (let i = 0; i < data.length; i++) {
        let savedPackageId = data[i];
        if (this.passedTocJson.id == savedPackageId) {//if we found the passedPackageId into indexedDb list (key)
          this._storage.get(data[i]).then((val) => {//get the kkeys value (Object)
            this.existingPackage = val;
            let activeChapter = this.existingPackage.chapter;
            this.activeChapterIndex = activeChapter;
            this.packageExists = true;
          })
        }
        console.log(data[i]);
      }
    })


    // this.question_data = this._userDataService.getQuestionLocalStorage();
    // let existingPackage:any;
    // if(this.question_data == "no data"){

    // }else{//search if packageId already exists in
    //   let allPAckagesQuestionsData = JSON.parse(this.question_data);
    //   console.log(allPAckagesQuestionsData);
    //   for(let packageData of allPAckagesQuestionsData){

    //     if(this.passedTocJson.id == packageData.packageId){
    //       console.log('found previous package having chapter',this.passedTocJson.id , ":::" ,packageData.packageId);
    //       console.log(packageData);
    //       existingPackage = packageData;
    //       this.existingPackageExists = true;
    //       let activeChapter = existingPackage.chapter;
    //       this.activeChapterIndex = activeChapter;
    //       break;
    //     }
    //   }
    // }

  };//end ionViewWillEnter

  gotoQuestionsView(id: any) {

  };//



/**
 *
 * @param $event = checkbox event, index = checkbox index in  questionsJson.chapters
 * @param index
 */
  questionSetChange($event:any, index:any){
    console.log($event.checked,$event.id,index)
    this.chaptersArray[index].selected = $event.checked;
    console.log(this.chaptersArray)
  };//

  createNewTest():void{
    let finalDataArray:any = [];
    let someChapterSelected:boolean = false;
    this.chaptersArray.forEach((element:any) => {
      if(element.selected){
        someChapterSelected = true;
        if(this.isGuestUser){
          finalDataArray = finalDataArray.concat(_.take(element.questions,this.maxQuestionsFromEachChapperForGuestUser));
        }else{
          finalDataArray = finalDataArray.concat(element.questions);//get all questions from all chapters in finalDataArray
        }

      }
    });

    console.log(finalDataArray);
    if(someChapterSelected){
      this.setMergedDataToQuestionArrayToLocalStorage(0,finalDataArray)
    }else{
      this.presentNoChapterSelectedToast();
    }

  };//

  setMergedDataToQuestionArrayToLocalStorage(index:any, mergedQuestionsData:Array<any>):void{
    let data = {
      packageId: this.passedTocJson.id,
      chapter: 0,
      title: this.questionsJson.chapters[0].chapterTitle,
      lastQuestionAttempted: 0,
      level: 0,
      questions:_.shuffle(mergedQuestionsData)
    };

    this._userDataService.setQuestionDataIndexedDb("review_"+this.passedTocJson.id, data);//set data into indexedDb

    setTimeout(() => {
      this.navigateToNextRoute(0,mergedQuestionsData);
    },500)
  };//

  navigateToNextRoute(index: number, mergedQuestionsData:Array<any>): void {
    this.navCtrl.push(QuestionsView, {
      id: this.passedTocJson.id, index: index, question: mergedQuestionsData
    })
  };//end navigateToNextRoute

  presentContinueTestConfirm(index: any) {
    this.alert = this._alertCtrl.create({
      title: 'Continue With Previous Test',
      message: 'Do you want to continue your previous test!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.getPackageData();
          }
        },
        {
          text: 'GO Ahead',
          handler: () => {
            this.navigateToNextRoute(index,[1,2,3]);
          }//end success handle
        }//end buttons object
      ]//end butotns array
    });
    this.alert.present();
  }//end presentConfirm


presentNoChapterSelectedToast():void{
  let toast = this._toastCtrl.create({
    message: 'Select at least One chapter to continue',
    duration: 2000,
    position: 'middle'
  });
  toast.present();
};//

showDataFetchErrorFromServer(): void {
        this.loader.dismiss();
        //let errorMsg: any = JSON.stringify(err);
        let alert = this._alertCtrl.create({
            title: 'Error!',
            subTitle: `There is some problem at server. Please check your network connection and Restart the App!`,
            buttons: ['OK']
        });
        alert.present();
    };//

showNoNetworkAlert(): void {
    this.loader.dismiss();
    let alert = this._alertCtrl.create({
      title: 'Not Online!',
      subTitle: 'we are unable to fetch you online questions. Please connect to the Internet and restart the app!',
      buttons: ['OK']
    });
    alert.present();
  };//


};//end class
