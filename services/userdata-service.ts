import { Injectable, EventEmitter, } from '@angular/core';
import { Http, Response,RequestOptions, Request, RequestMethod,URLSearchParams } from "@angular/http";
import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Storage } from '@ionic/storage';

import { File } from '@ionic-native/file';

import 'rxjs/Rx';

declare var localStorageDB: any;
declare var cordova:any;

interface IQuestionData {
  chapter:number,
  shuffledQuestionArray:Array<any>,
  level:number,
  lastQuestionAttempted:number
};

@Injectable()



export class UserdataService {
  user = {
    name: "Rajesh"
  };

  mainDirectoryName: string = "cbsapp";
  fs: string;


  name: any;
  // EventEmitter should not be used this way - only for `@Output()`s
  //nameChange: EventEmitter<string> = new EventEmitter<string>();
  nameChange: Subject<string> = new Subject<string>();

  userData: any;
  userDataChange: Subject<any> = new Subject<any>();

  genereListArrayChange: Subject<any> = new Subject<any>();

  lib: any;

  genreArray: any = [];
  genreListArray: any = [];

  tocJson: any;
  baseUrlPackage: any;
  user_question_data:any;

  

  constructor(private _http: Http, private _storage: Storage) {

    this.name = "Jack";

    this.lib = new localStorageDB("cbsapp", localStorage);

    this.baseUrlPackage = "https://s3-us-west-2.amazonaws.com/cbsapp/package_content/";

    this.tocJson = {
      "id": "98581",
      "mainBookPdf": [
        {
          "name": "main.pdf"
        }
      ],
      "youtubeUrls": [
        "https://www.youtube.com/embed/_xn5ot6JNV4?rel=0&amp;showinfo=0",
        "https://www.youtube.com/embed/_xn5ot6JNV4?rel=0&amp;showinfo=0",
        "https://www.youtube.com/embed/_xn5ot6JNV4?rel=0&amp;showinfo=0"
      ],
      "posterPath": "no_image.png",
      "additionalPdfs": [
        {
          "id": "4597343487",
          "name": "sample1.pdf"
        },
        {
          "id": "3478445893",
          "name": "sample2.pdf"
        },
        {
          "id": "3987205489",
          "name": "sample3.pdf"
        }
      ],
      "questionsFile": "questions.json"
    }

  };//end constructor

  returnTocJson() {
    return this.tocJson;
  }
  returnBaseUrlPackage() {
    return this.baseUrlPackage;
  }

  getGenereList() {

    var genereList = this._http.get("http://52.11.53.90/cbsapp/get_package_list.php").map((res: Response) => res.json());
    genereList.subscribe(
      (data) => this.populateGenereListArray(data),
      (err) => console.log(err)
    )
    return genereList;
  }


  populateGenereListArray(data: any) {
    this.genreListArray = data;
    this.genereListArrayChange.next(this.genreListArray);
    console.error(this.genreListArray);
  }





  getUserValidated(email: any, pass: any) {
    let user_email = email || 'dhrajesh1@gmail.com';
    let user_pass = pass || '123456';
    var userList = this._http.get(`http://52.11.53.90/cbsapp/login.php?email=${user_email}&pass=${user_pass}`).map((res: Response) => res.json());
    // var userList = this._http.get(`http://localhost/cbsapp/login.php?email=${user_email}&pass=${user_pass}`).map((res:Response) => res.json());
    return userList;
  };//

  getAllPackageByUser(id: any) {
    let user_id = id;
    var allpackageByUser = this._http.get(`http://52.11.53.90/cbsapp/allpackage_by_user.php?user_id=${user_id}`).map((res: Response) => res.json());
    // var allpackageByUser = this._http.get(`http://localhost/cbsapp/allpackage_by_user.php?user_id=${user_id}`).map((res:Response) => res.json());
    return allpackageByUser;
  }

  setUserData(data: any) {
    this.userData = data;
    this.userDataChange.next(this.userData);
    console.log(this.userData);
  }

  getBooksByGnereId(idArray: any, offset?: number) {
    console.log(idArray);
    if (typeof offset === "undefined") {
      offset = 0;
    }
    return Observable.forkJoin(
      idArray.map(
        (i: any) => this._http.get('http://52.11.53.90/cbsapp/get_all_packages_by_id.php?genreid=' + i.id + "&offset=" + offset)
          .map(res => res.json())
      ))
    //var genereList = this._http.get("http://www.notesapp.esy.es/tmdbphp/tmdb_movieby_genre.php?genereid="+id).map((res:Response) => res.json());
    //return genereList;
  };//

  getBooksByGnereIdCategoryDetailsPage(id: any, offset?: number) {
    if (typeof offset === "undefined") {
      offset = 0;
    }
    return this._http.get('http://52.11.53.90/cbsapp/get_all_packages_by_id.php?genreid=' + id + "&offset=" + offset).timeout(6000)
      .map(res => res.json())
    //var genereList = this._http.get("http://www.notesapp.esy.es/tmdbphp/tmdb_movieby_genre.php?genereid="+id).map((res:Response) => res.json());
    //return genereList;
  };//


  getInduvidualPackagesPurchasedByUser(packageIdArray: any) {
    return Observable.forkJoin(
      packageIdArray.map(
        (i: any) => this._http.get('http://52.11.53.90/cbsapp/get_package_by_id.php?packageid=' + i.package_id)
          .map(res => res.json())
      ))
  };//

   getNotificationList() {
    var notificationList = this._http.get("http://52.11.53.90/cbsapp/getNotifications.php");
    return notificationList;
  }

  setGeneresArray(data: any) {
    this.genreArray = data;
    console.log(this.genreArray);
  };//

  getGenereData(itemindex: any) {
    var genereData = this.genreArray[itemindex];
    return genereData;
  };//

  getpackageById(id: any) {
    var movieData = this._http.get("http://notesapp.esy.es/tmdbphp/tmdb_movie_by_id.php?movieid=" + id).map((res: Response) => res.json());
    //console.log(movieData);
    return movieData;
  };//

  getPackageReviewByMovieid(id: any) {
    var movieData = this._http.get("http://notesapp.esy.es/tmdbphp/tmdb_review_by_movieid.php?movieid=" + id).map((res: Response) => res.json());
    //console.log(movieData);
    return movieData;
  }

  setQuestionDataLocalStorage(data:any){
    let questionsDataArray:Array<any> = [];

    if (localStorage.getItem("question_data") === null) {
      //return "no data";
      questionsDataArray.push(data);
    }else{
      questionsDataArray = JSON.parse(localStorage.getItem("question_data"));
      questionsDataArray.push(data);
      //return question_data;
    }

    localStorage.removeItem("question_data");
    localStorage.setItem("question_data",JSON.stringify(questionsDataArray));
  };//

  getQuestionLocalStorage(){
    if (localStorage.getItem("question_data") === null) {
      return "no data";
    }else{
      let question_data = localStorage.getItem("question_data");
      return question_data;
    }
  }

  setUserLoginDataLocalStorage(data:any) {
    localStorage.setItem("user_master", JSON.stringify(data));
  }

  getUserLoginDataLocalStorage() {
    if (localStorage.getItem("user_master") === null) {
      return "no user";
    } else {
      let user_master = localStorage.getItem("user_master");
      return JSON.parse(user_master);
    }
  };//

  getPackageTocFromServer(id:string){
    console.log(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/TOC.json`);
    let packageToc = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/TOC.json`).map((res: Response) => res.json());
    return packageToc;
  }
  //https://s3-us-west-2.amazonaws.com/cbsapp/package_content/a78o5jax32/TOC.json

  getReviewQuestionsFromServer(id:string){
    let questions = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/questions.json`).map((res: Response) => res.json());
    return questions;
  }

  getImageQuestionsFromServer(id:string){
    let questions = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/image_questions.json`);
    return questions;
  }

  getGrandQuestionsFromServer(id:string,level:number){
    let questions:any;
        console.log(`Passed ID is ${id} and passed level is ${level}`);
        questions = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/grandpackage/Package0000${level+1}.json`);
    

    return questions;
    // let questions = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/image_questions.json`);
    // return questions;
  }

  getMegaQuestionsFromServer(id:string,level:number){
    let questions:any;
        console.log(`Passed ID is ${id} and passed level is ${level}`);
        questions = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/megagrand/Package0000${level+1}.json`);
    

    return questions;
    // let questions = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/image_questions.json`);
    // return questions;
  }


  getPackageTocFromLocal(id:string,fs:any){
    let packageToc = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/TOC.json`).map((res: Response) => res.json());
    return packageToc;
  }

  sendFeedbackData(data: any) {
    let params: URLSearchParams = this.objToSearchParams(data);

    console.log(params);

    let feedback = this._http.get("http://52.11.53.90/cbsapp/cbslogin/insertFeedback.php",{search:params});
    //console.log(movieData);
    return feedback;
  };//

  insertGrandLevelSubmitData(data:any){
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    let levelClearInsertRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/insertGrandScore.php",{search:params});
    return levelClearInsertRequest;
  }

  insertMegaLevelClearData(data:any){
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    let levelClearInsertRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/insertMegaScore.php",{search:params});
    return levelClearInsertRequest;
  }

  objToSearchParams(obj:any): URLSearchParams{
    let params: URLSearchParams = new URLSearchParams();
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            params.set(key, obj[key]);
    }
    return params;
 }

   getPackageDesciption(id:string){ 
    let packageToc = this._http.get(`https://s3-us-west-2.amazonaws.com/cbsapp/package_content/${id}/description/description.json`).map((res: Response) => res.json());
    return packageToc;
  }


  getGrandLevelScore(data:any) {
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    // let packageGrandLevelRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/getUserGrandLevel.php",{search:params});
    // return packageGrandLevelRequest;

    return Observable.forkJoin(
        this._http.get('http://52.11.53.90/cbsapp/cbslogin/getUserGrandLevel.php',{search:params}).map((res:Response) => res.json()),
        this._http.get('http://52.11.53.90/cbsapp/cbslogin/getUserMegaLevel.php',{search:params}).map((res:Response) => res.json())
    );//

  };//

  

  getBothLevels(data:any) {
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    // let packageGrandLevelRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/getUserGrandLevel.php",{search:params});
    // return packageGrandLevelRequest;

    return this._http.get('http://52.11.53.90/cbsapp/cbslogin/getUserLevelsFromBoth.php',{search:params})

  };//

  getBothLevelsForDashboard(data:any) {
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    // let packageGrandLevelRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/getUserGrandLevel.php",{search:params});
    // return packageGrandLevelRequest;

    return this._http.get('http://52.11.53.90/cbsapp/cbslogin/getUserLevelFromBothDashboard.php',{search:params})

  };//

  getUniqueIdStatus(data:any){
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    let uniqueIdStatusREquestRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/verifyUniqueId.php",{search:params});
    return uniqueIdStatusREquestRequest;
  }

  updateUniqueIdAndInsertIntoPurchaseMaster(data:any){
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    let uniqueIdStatusREquestRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/addNewUserPackage.php",{search:params});
    return uniqueIdStatusREquestRequest;
  }

  getPackageDetailFromPackageMaster(data:any){
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    let packageDetailRequest = this._http.get("http://52.11.53.90/cbsapp/get_package_by_id.php",{search:params});
    return packageDetailRequest;
  }

  deleteAllRowsForUserFromGrandScoreMaster(data:any){
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    let packageDetailRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/deleteFromGrandScore.php",{search:params});
    return packageDetailRequest;
  }

  deleteAllRowsForUserFromMegaScoreMaster(data:any){
    let params: URLSearchParams = this.objToSearchParams(data);
    console.log(params);
    let packageDetailRequest = this._http.get("http://52.11.53.90/cbsapp/cbslogin/deleteFromMegaScore.php",{search:params});
    return packageDetailRequest;
  }



/*
  This block is for IndexdDb
*/

/*-- This set the questionsData along with packageId in indexedDb--*/
setQuestionDataIndexedDb(packageId:string,data:any):void{
  this._storage.set(packageId, data).then(() => {
      console.log('value added', packageId)
    })
}

/*-- This get the questionsData along with packageId from indexedDb--*/
getQuestionDataIndexedDb(id:string):void{
  this._storage.get(id).then(() => {
      console.log('value added', id)
    })
}


/*-- This set the imageQuestionsData along with packageId in indexedDb--*/
setImageQuestionDataIndexedDb(packageId:string,data:any):void{
  this._storage.set("image_"+packageId, data).then(() => {
      console.log('value added', packageId)
    })
}

/*-- This set the grandQuestionsData along with packageId in indexedDb--*/
setGrandQuestionDataIndexedDb(packageId:string,data:any):void{
  this._storage.set("grand_"+packageId, data).then(() => {
      console.log('value added', packageId)
    })
}

/*-- This set the megaQuestionsData along with packageId in indexedDb--*/
setMegaQuestionDataIndexedDb(packageId:string,data:any):void{
  this._storage.set("mega_"+packageId, data).then(() => {
      console.log('value added', packageId)
    })
}





};//end class
