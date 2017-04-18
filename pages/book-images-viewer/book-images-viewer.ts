import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams,Content,Platform } from 'ionic-angular';

import { UserdataService } from "../../services/userdata-service";

/*
  Generated class for the BookImagesViewer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-book-images-viewer',
  templateUrl: 'book-images-viewer.html'
})
export class BookImagesViewer {

  @ViewChild(Content) content: Content;

  tocJsonData:any;
  bookImagesArray:Array<any> = [];
  baseUrlPackage: any;

  isMainReading:boolean = true;

  showZoomImages:boolean = false;
  selectedImageToZoom:string = '';

  scrolledDistance:number = 0;

  currentImageIndex:number = 0;
  shouldZoomImage:boolean = false;
  showImg:boolean = false;
  imageFullyLoaded:boolean = false;
  

  constructor(public navCtrl: NavController, public navParams: NavParams,private _userDataService: UserdataService, private _platform:Platform) {

    this.baseUrlPackage = this._userDataService.returnBaseUrlPackage();
    console.log(this.baseUrlPackage);

    this.tocJsonData = this.navParams.get("data");
    this.isMainReading = this.navParams.get("mainReading");
    if(this.isMainReading){
      this.bookImagesArray = this.tocJsonData.mainBookImages;
    }else{
      this.bookImagesArray = this.tocJsonData.additionalPdfs;
    }
    
    console.log(this.tocJsonData);
    console.log("MAinREading::",this.isMainReading);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BookImagesViewerPage');
  }

  getImageUrl(imgName:string): string {
    //console.log(imgName);
    let bookImgPath:string = '';
    if(this.isMainReading){//variabel that told whether we come for main reading or supplementary reading
      bookImgPath = this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  imgName;
    }else{
      bookImgPath = this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  imgName;
    }
    

    //console.log(bookImgPath);
      
      return bookImgPath;
  };//

  imgLoaded(){
    console.log( "loaded");
    this.imageFullyLoaded = true;
  }

  showZoomedImage(imgName:string){
    
  }

  showImageContainer(imgName:string){
    console.log(imgName);
    this.selectedImageToZoom = imgName;
    this.scrolledDistance = this.content.scrollTop;
    console.log(this.content.scrollTop);
    this.showZoomImages = true;
    
  }

  getZoomedImagePath():string{
    let bookImgPath:string = '';
    if(this.isMainReading){
      bookImgPath = this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  this.selectedImageToZoom;
    }else{
      bookImgPath = this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  this.selectedImageToZoom;
    }        
      return bookImgPath;
  }

  closeImageZoomContainer(){
    this.showZoomImages = false;
    //this.content.scrollTo(0, this.scrolledDistance, 500);
  }

  getCurrentImageUrl(){
      let bookImgPath:string = '';
      bookImgPath = this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  this.bookImagesArray[this.currentImageIndex];
      return bookImgPath;
  }

  getZoomedImage():string{
    if(this.shouldZoomImage){
      return 'zoomedImage';
    }else{
      return '';
    }
  };//

  zoomImage(shouldZoom:boolean){
    console.log(shouldZoom)
    if(shouldZoom){
      this.shouldZoomImage = true;
    }else{
      this.shouldZoomImage = false;
    }
  }

  getScrollDiv(){
    if(this.shouldZoomImage == true){
      return 'scrollable';
    }
  };//

  getDivBackground(){
    let bookImgPath:string = '';
    bookImgPath = `url(${this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  this.bookImagesArray[this.currentImageIndex]})`;
    console.log(bookImgPath);
    return bookImgPath;
  };//

  incrementCurrentImageIndex(){
    this.shouldZoomImage = false;
    if(this.currentImageIndex >= this.bookImagesArray.length){

    }else{
      this.imageFullyLoaded = false;
      this.currentImageIndex++;
    }
  };//

  decrementCurrentImageIndex(){
    this.shouldZoomImage = false;
    if(this.currentImageIndex == 0){

    }else{
      this.imageFullyLoaded = false;
      this.currentImageIndex--;
    }
  };//

  divBackgroundStyle(){
    let backgroudnString:any;

    if(!this.shouldZoomImage){
      backgroudnString = {//if image is not zoomed, show this background
        'background-image':`url(${this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  this.bookImagesArray[this.currentImageIndex]})`,
        'background-size':'contain',
        'background-position':'center',
        'background-repeat':'no-repeat'
      }
    }else{
      backgroudnString = {
        'background':'#fff'
      }
    }
    

    return backgroudnString;
  };//

  getLoadingImgSrc() {
    if (this._platform.is('core')) {
      return "../assets/img/gears.gif";
    } else if (this._platform.is('android')) {
      return "assets/img/gears.gif";
    } else {
      return "assets/img/gears.gif";
    }
  };//end getLoadingImgSrc()

};//end class
