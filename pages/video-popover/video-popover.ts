import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import {DomSanitizer, SafeResourceUrl} from  "@angular/platform-browser";

/*
  Generated class for the VideoPopover page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-video-popover',
  templateUrl: 'video-popover.html'
})
export class VideoPopover {

  videoUrl:string = '';
  youTubeUrl:SafeResourceUrl;

  constructor(public navCtrl: NavController, public navParams: NavParams,private _sanitizer:DomSanitizer) {
    this.videoUrl = this.navParams.get("videoUrl");
    this.youTubeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
    console.log(this.youTubeUrl);
  };

  getVideoUrl(){
    return this.youTubeUrl;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VideoPopoverPage');
  }

}
