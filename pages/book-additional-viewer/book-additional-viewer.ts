import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams,Content,Platform } from 'ionic-angular';

import { UserdataService } from "../../services/userdata-service";

@Component({
  selector: 'page-book-additional-viewer',
  templateUrl: 'book-additional-viewer.html',
})
export class BookAdditionalViewer {

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

  bookImagesArray2: Array<any> = [];
  additionalImagesData: any;
  bookPath: any;
  package_id:any;
  

  constructor(public navCtrl: NavController, public navParams: NavParams,private _userDataService: UserdataService, private _platform:Platform) {

    this.baseUrlPackage = this._userDataService.returnBaseUrlPackage();
    console.log(this.baseUrlPackage);

    
    this.isMainReading = this.navParams.get("mainReading");

    this.additionalImagesData = this.navParams.get("additionalImages");

    this.package_id = this.navParams.get("package_id");
    this.bookPath = this.navParams.get("bookPath");

    console.log(this.bookPath,this.additionalImagesData)
    
    if(this.isMainReading){
      this.bookImagesArray = this.additionalImagesData;
    }else{
      this.bookImagesArray = this.additionalImagesData;
    }
    
    console.log(this.tocJsonData);
    console.log("MAinREading::",this.isMainReading);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BookImagesViewerPage');
  }

  // getImageUrl(imgName:string): string {
  //   //console.log(imgName);
  //   let bookImgPath:string = '';
  //   if(this.isMainReading){//variabel that told whether we come for main reading or supplementary reading
  //     bookImgPath = this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  imgName;
  //   }else{
  //     bookImgPath = this.baseUrlPackage + this.tocJsonData.id +  "/main_images/"  +  imgName;
  //   }
    

  //   //console.log(bookImgPath);
      
  //     return bookImgPath;
  // };//

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
      bookImgPath = this.baseUrlPackage + this.package_id +  "/additional_imgs/" + this.bookPath + "/" +  this.selectedImageToZoom;
    }else{
      bookImgPath = this.baseUrlPackage + this.package_id +  "/additional_imgs/" +  this.bookPath + "/" +  this.selectedImageToZoom;
    }        
      return bookImgPath;
  }

  closeImageZoomContainer(){
    this.showZoomImages = false;
    //this.content.scrollTo(0, this.scrolledDistance, 500);
  }

  getCurrentImageUrl(){
      let bookImgPath:string = '';
      bookImgPath =  this.baseUrlPackage + this.package_id +  "/additional_imgs/" + this.bookPath + "/" +  this.bookImagesArray[this.currentImageIndex];
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
    console.log(this.currentImageIndex)
    this.shouldZoomImage = false;
    if(this.currentImageIndex+1 == this.bookImagesArray.length){

    }else{
      this.imageFullyLoaded = false;
      ++this.currentImageIndex;
    }
  };//

  decrementCurrentImageIndex(){
    this.shouldZoomImage = false;
    if(this.currentImageIndex == 0){

    }else{
      this.imageFullyLoaded = false;
      --this.currentImageIndex;
    }
  };//

  divBackgroundStyle(){
    let backgroudnString:any;

    if(!this.shouldZoomImage){
      backgroudnString = {//if image is not zoomed, show this background
        'background-image':`url(${this.baseUrlPackage + this.package_id +  "/additional_imgs/"  +  this.bookPath + "/" +this.bookImagesArray[this.currentImageIndex]})`,
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

}
