import { Component, trigger, transition, style, animate } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeHtml } from "@angular/platform-browser";

import { UserdataService } from "../../services/userdata-service";

import { ResultsView } from '../results-view/results-view';
import { ShowQuestionStats } from '../show-question-stats/show-question-stats';

import { Storage } from '@ionic/storage';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

declare var _: any;

@Component({
  selector: 'page-questions-view',
  templateUrl: 'questions-view.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(100, style({ opacity: 0 }))
      ])
    ])
  ]
})

export class QuestionsView {



  chapterData: any;
  questionsArray: any = [];
  passedId: string;

  savedPackageData: any;//keep package data from indexeddb

  isQuestionAnswered: boolean = false;
  currentQuestion: number = 0;

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

  constructor(public navCtrl: NavController, public navParams: NavParams, private _userDataService: UserdataService, private _storage: Storage, private _sanitizer: DomSanitizer, private _toastCtrl: ToastController, private _modalCtrl: ModalController) {





  };//end constructor

  ngOnInit() {
    //this.existingPackage = this.navParams.get('existingPackage');
    //this.chapterData = this.navParams.get('question');

    this.passedId = this.navParams.get('id');

    console.log(this.passedId);
  };

  ionViewDidEnter() {
    //  get a key/value pair based upon passed package id and retreived from indexedDb
    this._storage.get("review_" + this.passedId).then((val) => {
      this.savedPackageData = val;
      this.currentQuestion = this.savedPackageData.lastQuestionAttempted;
      console.log('Your question package is', this.savedPackageData);
      this.questionsArray = this.savedPackageData.questions;
      //let questionInASet = this.questionsArray.length;
      this.questionSetChosen = this.questionsArray;
      if (this.questionSetChosen[this.currentQuestion].questiondata.isAnswered == "yes") {
        this.selectedIndex = this.questionSetChosen[this.currentQuestion].questiondata.userChoice;
      }
      this.calculateTotalCorrectAnswers();//call to calculate correct answers
    });
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
    if (this.questionSetChosen[currentQuestion].questiondata.isAnswered == "yes") {
      this.presentAlreadyAnsweredToast();
    } else {
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
    }//end main if

  };//

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
      chapter: this.savedPackageData.chapter,
      title: this.savedPackageData.title,
      lastQuestionAttempted: this.currentQuestion,
      level: 0,
      questions: this.questionSetChosen
    };

    this._userDataService.setQuestionDataIndexedDb("review_" + this.savedPackageData.packageId, data);//set data into indexedDb
  };//end setQuestionsDataToLocalStorage

  sanitizeJson(string: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(string);
  }

  showStats(): void {
    this.presentGridModal()
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
    console.log(userSelectedIndex, correctAnswerIndex, optionIndex)
    if (optionIndex + 1 == userSelectedIndex + 1) {
      if (userSelectedIndex + 1 == correctAnswerIndex) {//add one to userSelectedIndex so that is now BASE - 1 as correctAnswerIndex
        return 'greenText';
      } else {
        return 'redText';
      }
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
    let modal = this._modalCtrl.create(ShowQuestionStats, { id: this.passedId });

    modal.onDidDismiss((data: any) => {
      this.shouldShowExplanation = false;
      console.log("received quesiton form grid==", data);
      if (typeof data == 'undefined') {

      } else {
        if (data.selectedQuestion == -1 || (data == null)) {
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

    });//end modal.onDidDismiss
    modal.present();//call th modal
  };//end presentGridModal()




};//end class
