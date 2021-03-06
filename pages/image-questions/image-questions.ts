import { Component, trigger, transition, style, animate,ViewChild,ElementRef } from '@angular/core';
import { Content,NavController, NavParams, ToastController, ModalController, Platform, FabContainer, AlertController } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeHtml } from "@angular/platform-browser";

import { ShowImagequestionStat } from '../show-imagequestion-stat/show-imagequestion-stat';

import { UserdataService } from "../../services/userdata-service";

import { ResultsView } from '../results-view/results-view';
import { ShowQuestionStats } from '../show-question-stats/show-question-stats';

import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';

import { FormatTime } from "../pipes/formattime.pipe";

declare var _: any;
declare var moment: any;


/*
  Generated class for the ImageQuestions page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var cordova: any;

@Component({
  selector: 'page-image-questions',
  templateUrl: 'image-questions.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(100, style({ opacity: 0 }))
      ])
    ]),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateX(100%)', opacity: 0 }),
          animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateX(0)', opacity: 1 }),
          animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
        ])
      ]
    )
  ]
})

export class ImageQuestionsPage {

  @ViewChild(Content) content: Content;

  @ViewChild('resultViewContainer') private resultViewContainer : ElementRef;
  private scrollElement; 

  chapterData: any;
  questionsArray: any = [];
  passedId: string;

  savedPackageData: any;//keep package data from indexeddb

  isQuestionAnswered: boolean = false;
  currentQuestion: number = 0;
  currentLevel: number = 0;

  maxQuestionInASet: number = 3;
  numberOfSets: number = 3;
  questionSetArayBaseUponLevel: Array<any> = [];//this will keep 1/3 of questions base upon level 1-3
  questionSetChosen: Array<any> = [];//this will hold the current questions to be answered

  selectedIndex: number = -1;
  selectedOptionIconName = '';
  selectedOptionIconColor = '';

  explanaitonString: SafeHtml;

  existingPackage: boolean;

  shouldShowExplanation: boolean = false;

  totalCorrectAnswers: number = 0;

  imagesBaseUrl: string;

  secondsRemaining: number = 0;
  testRunning: boolean = false;
  allLevelCleared: boolean = false;

  readonly passingMarks: number = 80;//this should be 80

  readonly maxLevelInthisTestCategory: number = 1;

  readonly mainDirectoryName: string = "cbsapp";
  fs: string;

  isGuestUser: boolean = false;

  showPopoverDiv:boolean = false;
  resultObject:any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _storage: Storage, private _sanitizer: DomSanitizer, private _toastCtrl: ToastController, private _modalCtrl: ModalController, public platform: Platform, private alertCtrl: AlertController,private _network:Network, private _file:File) {

    if (this.platform.is('ios')) {
      this.fs = cordova.file.documentsDirectory;
    }
    else if (this.platform.is('android')) {
      this.fs = cordova.file.dataDirectory;
    }


  };//end constructor

  ngOnInit() {
    //this.existingPackage = this.navParams.get('existingPackage');
    //this.chapterData = this.navParams.get('question');

    this.passedId = this.navParams.get('id');
    this.isGuestUser = this.navParams.get('guestUser');
    console.log("entered as guest use::", this.isGuestUser);

    if (this.platform.is("mobile") && !this.isGuestUser) {
      if (this.platform.is("android")) {
        this.imagesBaseUrl = this.fs + this.mainDirectoryName + "/" + this.passedId + "/questionimages/";
      } else if (this.platform.is("ios")) {
        let baseStr: string = this.fs;
        baseStr = baseStr.replace("file://", '');
        this.imagesBaseUrl = baseStr + this.mainDirectoryName + "/" + this.passedId + "/questionimages/";
      }

    } else {
      this.imagesBaseUrl = this._userDataService.returnBaseUrlPackage() + this.passedId + "/questionimages/";
    }

    console.log(this.passedId);
  };

  ionViewDidEnter() {
    //  get a key/value pair based upon passed package id and retreived from indexedDb
    this._storage.get("image_" + this.passedId).then((val) => {
      this.savedPackageData = val;
      this.currentQuestion = this.savedPackageData.lastQuestionAttempted;
      this.secondsRemaining = this.savedPackageData.secondsRemaining;
      this.currentLevel = this.savedPackageData.level;
      console.log('Your question package is', this.savedPackageData);
      this.questionsArray = this.savedPackageData.questions;
      //let questionInASet = this.questionsArray.length;
      this.questionSetChosen = this.questionsArray;
      if (this.questionSetChosen[this.currentQuestion].questiondata.isAnswered == "yes") {
        this.selectedIndex = this.questionSetChosen[this.currentQuestion].questiondata.userChoice;
      }
      this.calculateTotalCorrectAnswers();//call to calculate correct answers
      this.testRunning = true;
      this.updateTimer();
    });
  };//

  ionViewWillLeave() {
    this.testRunning = false;
    //this.setQuestionsDataToIndexedDB();
  }

  // makeQuestionSet(maxQuestion:number){
  //   let setArray:Array<any>;
  //   this.questionSetArayBaseUponLevel = this.chapterData.data;
  //   this.questionSetChosen = this.questionSetArayBaseUponLevel;
  //   console.log(this.questionSetChosen);      
  // }

  gotoResultsView(id: any) {
    this.navCtrl.push(ResultsView, {
      data: id
    })
  };//

  /**
   * nextQuestion()().
   * @param none , @return none
   * @EXPLAIN : 
   * 1- check if this.currentIndex < this.questionSetChosen.length , if yes increase currentIdex by 1
   * set curentIndex and other data to IonicStorage
   */
  nextQuestion(): void {
    this.isQuestionAnswered = false;
    //this.selectedOptionIconName = '';
    //this.selectedOptionIconColor = '';

    console.log(this.selectedIndex);

    if (this.currentQuestion < this.questionSetChosen.length - 1) {
      this.currentQuestion++;
      this.onQuestionChange();
    } else {
      console.log('last question reached');
    }
  };//end nextQuestion

  /**
   * prevQuestion()().
   * @param none , @return none
   * @EXPLAIN : 
   * 1- check if this.currentIndex > 0 , if yes reduce currentIdex by 1
   * set curentIndex and other data to IonicStorage
   */
  prevQuestion(): void {
    this.isQuestionAnswered = false;
    //this.selectedOptionIconName = '';
    //this.selectedOptionIconColor = '';

    console.log("selected userChoice is::", this.selectedIndex);

    if (this.currentQuestion > 0) {
      this.currentQuestion--;
      this.onQuestionChange();
    } else {
      console.log('first question reached');
    }
  };//end nextQuestion



  checkAnswer(currentQuestion: any, optionIndex: any) {

    console.log("quesiton already answerd::", this.questionSetChosen[currentQuestion].questiondata)
    if (this.testRunning) {//allow click if test is not paused testRunning == true
      this.selectedIndex = optionIndex;
      this.isQuestionAnswered = true;

      let isAnswerCorrect: boolean = false;

      let selectedOptionId = this.questionSetChosen[currentQuestion].optiondata.options[optionIndex].optionid;
      let correctAnswerId = this.questionSetChosen[currentQuestion].rightanswerdata.rightanswer[0].answerid;
      if (selectedOptionId == correctAnswerId) {//if answer is correct
        //this.selectedOptionIconName = 'checkmark-circle';
        //this.selectedOptionIconColor = 'secondary';
        isAnswerCorrect = true;
      } else {//if answer is wrong
        //this.selectedOptionIconName = 'close-circle';
        //this.selectedOptionIconColor = 'danger';
        isAnswerCorrect = false;
      }
      // console.log(selectedOptionId, correctAnswerId);
      // console.log(this.questionSetChosen[currentQuestion]);


      this.calculateTotalCorrectAnswers();//update the correctAnswer Status Text
      this.setQuestionsDataToIndexedDB();

      this.questionSetChosen[currentQuestion].questiondata.isAnswered = "yes";
      this.questionSetChosen[currentQuestion].questiondata.userChoice = optionIndex;
      this.questionSetChosen[currentQuestion].questiondata.isCorrect = isAnswerCorrect;
    }else{//if test is paused h=show paused toast
      let toast = this._toastCtrl.create({
        message: 'Test is Paused, please press start button',
        position:'middle',
        duration: 1000
      });
      toast.present();
    }//end 

  };//if (this.testRunning)

  checkSelectedIndex(optionIndex: any): boolean {
    //console.log(`${optionIndex} :: ${this.selectedIndex}`)
    if (optionIndex == this.selectedIndex) {
      // this.selectedOptionIconName = 'checkmark-circle';
      // this.selectedOptionIconColor = 'secondary';
      return true;
    } else {
      // this.selectedOptionIconName = 'close-circle';
      // this.selectedOptionIconColor = 'danger';
      return false;
    }
  };//

  getSelectedIndex(): number {
    let optionIndex = -1;
    console.log(this.questionSetChosen[this.currentQuestion].questiondata.isAnswered)
    if (this.questionSetChosen[this.currentQuestion].questiondata.isAnswered == "yes") {
      optionIndex = this.questionSetChosen[this.currentQuestion].questiondata.userChoice;
    } else {
      optionIndex = -1;
    }
    return optionIndex;
  }

  setQuestionsDataToIndexedDB(level: number = null): void {
    // let newLevel:number;
    // if(level == null){
    //   newLevel = this.savedPackageData.level;
    // }else{
    //   newLevel = level;
    // }
    let data = {
      packageId: this.savedPackageData.packageId,
      lastQuestionAttempted: this.currentQuestion,
      level: this.currentLevel,
      questions: this.questionSetChosen,
      secondsRemaining: this.secondsRemaining,
      allLevelCleared: this.allLevelCleared
    };

    //this._userDataService.setQuestionDataIndexedDb("image_" + this.savedPackageData.packageId, data);//set data into indexedDb
    this._userDataService.setImageQuestionDataIndexedDb(this.passedId, data);
};//end setQuestionsDataToLocalStorage

  sanitizeJson(string: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(string);
  }

  showStats(): void {
    this.testRunning = false;
    this.presentGridModal();
    //this.navCtrl.push(ShowQuestionStats);
  }

  /**
   * showExplanation()
   * @param none , @return none
   * 
   */
  showExplanation(): void {
    this.shouldShowExplanation = !this.shouldShowExplanation;//toggle show/hide state
  };//


  /**
   * onQuestionChange()
   * @param none , @return none
   * EXPLAIN
   * 1- These subroutines whenever user press NEXT / BACK button to bottom toolbar (for questions)
   */
  onQuestionChange(): void {
    this.setQuestionsDataToIndexedDB();//set the lastQuestionAttempted into IndexedDb
    this.selectedIndex = this.getSelectedIndex();//get the current quesiton userChoice if available and use in selectedIndex variable
    this.shouldShowExplanation = false;//reset +/- button to hide state

    this.calculateTotalCorrectAnswers();
  };//

  /**
   * presentAlreadyAnsweredToast()
   * @param none , @return none
   * EXPLAIN
   * 1- Shows toast if user click on already answered question
   */

  presentAlreadyAnsweredToast() {
    let toast = this._toastCtrl.create({
      message: 'Question Already Answered',
      position: 'middle',
      duration: 1000
    });
    toast.present();
  };//


  /**
     * calculateTotalCorrectAnswers().
     * @param none , @return none
     * @EXPLAIN : 
     * reset this.totalCorrectAnswers = 0
     * - loop through the array this.questionSetChosen
     * if array[index].isCorrect == true, increment this.totalCorrectAnswers
     */
  calculateTotalCorrectAnswers(): void {
    this.totalCorrectAnswers = 0;
    for (let i = 0; i < this.questionSetChosen.length; i++) {
      let questionObj = this.questionSetChosen[i].questiondata;
      var answerCorrect: boolean = questionObj.isCorrect;
      if (answerCorrect == true) {
        this.totalCorrectAnswers++;
      }
      //console.log(`Question no:${i} , ${questionObj.isCorrect}`);
    }
  };//


  /**
     * getOptionColor().
     * @param 
     * userSelectedIndex -- this is the item selected by the use it is BASE - 0
     * correctAnswerIndex -  this is the correct answer in JSON/Array it is BASE - 1
     * optionIndex -- this is the current optionIndex in the four options it is base - 0
     *  , @return none
     * @EXPLAIN : 
     * set the isSkipped in question
     */
  getOptionColor(userSelectedIndex: any, correctAnswerIndex: any, optionIndex: any) {
    // console.log(userSelectedIndex,correctAnswerIndex,optionIndex)
    if (optionIndex + 1 == userSelectedIndex + 1) {
      return "greyBoldtext";
    }
  };//


  /**
   * presentGridModal()
   * @param:none, @return:none
   * @EXPLAIN
   * 1- Create the GirdModal with parameter:this.pasedId(packageId basically)
   * 2- Capture quesiton number when modal is onDidDismiss
   * 3- If quesiton number is -1 -> do nothing
   * 4- else :: set this.currentQuesiton = questionNum received from modal onDidDismiss
   * 5- set selectedIndex to current question cuserChoice to highlight the option red/green
   */
  presentGridModal() {
    let modal = this._modalCtrl.create(ShowImagequestionStat, { id: this.passedId });

    modal.onDidDismiss((data: any) => {
      console.log("received quesiton form grid==", data);
      if (typeof data == 'undefined') {

      } else {
        if (data.selectedQuestion == -1) {
          //do nothing as user press the close btn of modal
        } else {
          this.currentQuestion = data.selectedQuestion;
          console.log(this.questionSetChosen[this.currentQuestion]);
          setTimeout(() => {
            if (this.questionSetChosen[this.currentQuestion].questiondata.isAnswered == "yes") {//if quesiton is answered then set this.selectedIndex to question.userChoice
              console.log("answere")
              this.selectedIndex = this.questionSetChosen[this.currentQuestion].questiondata.userChoice;
            } else {
              console.log("not found");
              this.selectedIndex = -1;//reset selectedIndex To -1 as previous selectedIndex might override
            }
          });//end setTimeout
          this.setQuestionsDataToIndexedDB();//send current data to indexedDB       
        }
      }

      this.testRunning = true;
      this.updateTimer();
      this.setQuestionsDataToIndexedDB();
      //this.fab.close();
    });//end modal.onDidDismiss
    modal.present();//call th modal
  };//end presentGridModal()

  //
  getQuestionImage(imgName: any): string {
    let returnedImgFullPath: string;
    if (this.platform.is("mobile") && !this.isGuestUser) {
      returnedImgFullPath = this.imagesBaseUrl + imgName;
      console.log(returnedImgFullPath);
    } else {
      returnedImgFullPath = this.imagesBaseUrl + imgName;
    }
    return returnedImgFullPath;
  }



  updateTimer(): void {
    // console.log('timer start');
    if (this.secondsRemaining > 0 && this.testRunning) {
      setTimeout(() => {
        this.secondsRemaining--;
        // console.log(this.secondsRemaining);
        this.updateTimer();
      }, 1000)
    } else if (this.secondsRemaining <= 0) {
      this.testRunning = false;
      console.log('time over');
      this.showResultPopover();
      //this.showTimeoverAlert();
    }
  };//

  pauseTest(): void {
    this.testRunning = !this.testRunning;
    if (this.testRunning) {
      this.updateTimer();
    }
    this.setQuestionsDataToIndexedDB();
  };//

  submitCurrentLevelTest() {
    let percentMarks = Math.floor((this.totalCorrectAnswers / this.questionSetChosen.length) * 100);
    if (percentMarks >= this.passingMarks) {
      console.log('Hurray, test cleared');
      this.clearLevelAndUpgrade();
    } else {
      console.log('Sorry, test not cleared, cant continue');
      if (this.secondsRemaining > 0) {
        this.showTestNotClearedAlert();
      } else {
        console.log("times consumed need to reset");
        this.editImageTestWithResetTimer();
      }

    }
    console.log(percentMarks)
    //fab.close();
  };//


  showNoNetworkAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Not Online!',
      subTitle: 'We are unable to fetch questions. Please check your internet connection!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showDataFetchErrorFromServer(err: any): void {
    let errorMsg: any = JSON.stringify(err);
    let alert = this.alertCtrl.create({
      title: 'Error!',
      subTitle: `There is some problem at server. Please check your network connection!`,
      buttons: ['OK']
    });
    alert.present();
  };//

  showTimeoverAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Times Up',
      subTitle: 'Your time is up. Please press submit button.!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showTimeResetAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Restart the level!',
      subTitle: 'Since your level is not cleared. You need to restart this level!',
      buttons: [{
        text: 'OK',
          handler: data => {
            //this.setQuestionsDataToIndexedDB();
            setTimeout(() => {
              this.navCtrl.pop();
            },500)
            
          }
      }]
    });
    alert.present();
  };//

  showTestNotClearedAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Level Not Clear!',
      subTitle: 'Your current marks are less than 80%. Please select few more correct answers to Clear test!',
      buttons: ['OK']
    });
    alert.present();
  };//

  showLevelClearedAlert(): void {
    let alert = this.alertCtrl.create({
      title: 'Level Cleared!',
      subTitle: 'Congratulations, you have cleared this Level!',
      buttons: [
        {
          text: 'OK',
          handler: (data: any) => {
            console.log('btn clicked');
            this.navCtrl.pop();
          }
        }
      ]
    });
    alert.present();
  };//

  clearLevelAndUpgrade(): void {
    console.log(this.currentLevel, this.maxLevelInthisTestCategory, this.totalCorrectAnswers);
    if (this.currentLevel == this.maxLevelInthisTestCategory) {
      this.showMaxLevelReachAlert();
    } else {
      console.log("Level cleared now upgrade");
      //stop the test
      this.testRunning = false;
      this.getSavedAllImageAllPackageFromIndexedDb(this.currentLevel + 1);
      setTimeout(() => {
        console.log("going back")
        this.navCtrl.pop();
      },1000)
      
      //this.showLevelClearedAlert();
    }
  };//

  showMaxLevelReachAlert(): void {
    this.allLevelCleared = true;
    this.setQuestionsDataToIndexedDB();
    setTimeout(() => {
      this.navCtrl.pop();
    },500)    
    // let alert = this.alertCtrl.create({
    //   title: 'All Levels Cleared!',
    //   subTitle: 'You have cleared all levels for Image Based Questions!',
    //   buttons: [{
    //     text: 'OK',
    //       handler: data => {
    //         console.log('Cancel clicked');
    //         this.navCtrl.pop();
    //       }
    //   }]
    // });
    // this.allLevelCleared = true;
    // this.setQuestionsDataToIndexedDB();
    // alert.present();
  };//end showMaxLevelReachAlert

  getSavedAllImageAllPackageFromIndexedDb(newLevel: number) {
    let allImagesPackage: any;

    this._storage.get("image_all_" + this.passedId).then((val) => {
      if (val == null) {

      } else {
        allImagesPackage = val.levels;
        this.editImageTestWithNewLevel(allImagesPackage);
      }

    });

  };//end getSavedAllImageAllPackageFromIndexedDb

  editImageTestWithNewLevel(levelData: any) {

    console.log(levelData);
    let suppliedLevel = this.currentLevel + 1;
    let responseData: any = levelData;
    let data: any;
    data = {
      level: suppliedLevel,
      lastQuestionAttempted: 0,
      packageId: this.passedId,
      questions: _.shuffle(responseData[suppliedLevel].data),
      secondsRemaining: (responseData[suppliedLevel].timeDuration * 60),
      allLevelCleared: this.allLevelCleared
    }
    console.log(data);
    this._userDataService.setImageQuestionDataIndexedDb(this.passedId, data);//set data into

  };//end editImageTestWithNewLevel

  editImageTestWithResetTimer(){
    let allImagesPackage: any;

    let suppliedLevel = this.currentLevel;
    let responseData: any;
    let data: any;

    this._storage.get("image_all_" + this.passedId).then((val) => {
      if (val == null) {

      } else {
        allImagesPackage = val.levels;
        responseData = allImagesPackage;

        //reset all answers given by user
        _.forEach(responseData.questions,(value,index) => {
          value.questiondata.isAnswered = "no",
          value.questiondata.isFlagged = "false",
          value.questiondata.userChoice = "Z",
          value.questiondata.isCorrect = "NA"
        });

        data = {
          level: suppliedLevel,
          lastQuestionAttempted: 0,
          packageId: this.passedId,
          questions: _.shuffle(responseData[suppliedLevel].data),
          secondsRemaining: (responseData[suppliedLevel].timeDuration * 60),
          allLevelCleared: this.allLevelCleared
        }
        console.log(data);
        this._userDataService.setImageQuestionDataIndexedDb(this.passedId, data);//set data int
        setTimeout(() => {
          this.navCtrl.pop();
          //this.showTimeResetAlert();
        },500)
    }

    });

  };//

  checkMyProgress() {

    //pause the test
    this.testRunning = false;
    this.setQuestionsDataToIndexedDB();
    this.showFinishTestAlert();

  };//checkMyProgress

  showFinishTestAlert() {
    let alert = this.alertCtrl.create({
      title: 'Finish Test',
      message: 'Do you want to finish this test?',
      enableBackdropDismiss:false,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('no')
            this.testRunning = true;
            this.updateTimer();//restart the Timer
          }
        },
        {
          text: 'Yes',
          handler: () => {
            
            this.showResultPopover();
          }
        }
      ]
    });
    alert.present();
  };//

  showResultPopover(){

    this.secondsRemaining = 0;
    this.setQuestionsDataToIndexedDB();
    console.log(this.totalCorrectAnswers,this.questionSetChosen.length)
    let percentMarks = Math.floor((this.totalCorrectAnswers / this.questionSetChosen.length) * 100);
    this.resultObject.totalQuestions = this.questionSetChosen.length;
    this.resultObject.skippedQuestions = 0;
    this.resultObject.totalCorrectAnswers = 0;
    this.resultObject.totalWrongAnswers = 0;
    //this.resultObject.percentMarks = percentMarks;
    _.forEach(this.questionSetChosen,(value,index) => {
      if(value.questiondata.isAnswered == "no"){
        this.resultObject.skippedQuestions++;
      }else{
        if(value.questiondata.isCorrect == true){
          this.resultObject.totalCorrectAnswers++;
          this.resultObject.percentMarks = Math.floor((this.resultObject.totalCorrectAnswers / this.questionSetChosen.length) * 100);
        }else{
          this.resultObject.totalWrongAnswers++;
        }
      }
    })
    setTimeout(() => {
      this.showPopoverDiv = true;
      // You should resize the content to use the space left by the navbar
      this.content.resize();
    },500);

  };//end showResultPopover

  closeResultPopover(){
    console.log('seconds remaining', this.secondsRemaining);
    this.closeResultPopoverAndResize();
    this.submitCurrentLevelTest();    

  };//closeResultPopover

  closeResultPopoverAndResize(){
      this.showPopoverDiv = false;
      // You should resize the content to use the space left by the navbar
      this.content.resize();
  }

  scrollResultViewContainerToTop(){
    this.resultViewContainer.nativeElement.scrollTop = 0;
  }

  getResultObject(){
    _.forEach(this.questionSetChosen,(vlaue,index) => {

    });//end _.forEach
  }

  getUserSelectedAnswer(question:any):string{
    let userSelectedAnswer:string = '';
    if(question.questiondata.userChoice == 'Z'){
      userSelectedAnswer = "Not Answered";
    }else{
      userSelectedAnswer = question.optiondata.options[question.questiondata.userChoice].optiontext;
    }
    return userSelectedAnswer
  };//

  presentContinueTestChoiceAlert() {
    let alert = this.alertCtrl.create({
      title: 'Your level is cleared.',
      message: 'Do you want to goto next level?',
      buttons: [
        {
          text: 'Continue Test',
          role: 'cancel',
          handler: () => {
            this.closeResultPopoverAndResize();
          }
        },
        {
          text: 'Upgrade Level',
          handler: () => {
            this.closeResultPopoverAndResize();
            this.clearLevelAndUpgrade();
          }
        }
      ]
    });
    alert.present();
  };//

  isAnswerCorrect(question:any){
    let isAnswerCorrect:string = '';
    if(question.questiondata.isCorrect == 'NA'){
      isAnswerCorrect = "";
    }else if(question.questiondata.isCorrect == true){
      isAnswerCorrect = 'Correct';
    }else{
      isAnswerCorrect = 'Incorrect';
    }
    return isAnswerCorrect;
  };//

  setAnswerColor(question:any):string{
    let answerColor:string = '';
    if(question.questiondata.isCorrect == 'NA'){
      answerColor = "";
    }else if(question.questiondata.isCorrect == true){
      answerColor = 'secondary';
    }else{
      answerColor = 'danger';
    }
    return answerColor;
  };//


  gotoPreviousScreen(){
    this.navCtrl.pop();
  }



};//end class

