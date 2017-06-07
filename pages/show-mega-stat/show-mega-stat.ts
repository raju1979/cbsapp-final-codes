import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { DomSanitizer, SafeResourceUrl, SafeUrl, SafeHtml } from "@angular/platform-browser";

import { UserdataService } from "../../services/userdata-service";


import { Storage } from '@ionic/storage';

declare var _: any;

/*
  Generated class for the ShowMegaStat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-show-mega-stat',
  templateUrl: 'show-mega-stat.html'
})
export class ShowMegaStat {

  questions: any[] = [];
    isSkipped:boolean = true;
    selectedQuesiton: number = -1;

    passedId:string;

    reviewQuestionObj:any;

    constructor(private _viewCtrl: ViewController,private _navParams:NavParams,private _storage: Storage) {
        this.passedId = this._navParams.get("id");
        console.log(this.passedId)
        for (let i = 1; i <= 100; i++) {
            this.questions.push(i);
        }
    };//end constructor

    ionViewDidEnter(){
        this._storage.get("mega_"+this.passedId)
            .then((data) => {
                this.reviewQuestionObj = data.questions;
                console.log(this.reviewQuestionObj);
            })
            .catch((err) => {
                console.log(err);
            })
    };//end ionViewDidEnter
    
    closeThisModal(index:any) {
        this._viewCtrl.dismiss({
            selectedQuestion: index
        })
    };//


    checkAnswered(index:number):string{
        let isAnswered = this.reviewQuestionObj[index].questiondata.isAnswered;
        let iscorrect = this.reviewQuestionObj[index].questiondata.isCorrect;
        console.log(isAnswered,iscorrect);
        if(isAnswered == "yes"){
            if(iscorrect){
                return "C"
            }else{
                return "W"
            }
        }else{
            return "F";
        }

    }

}
