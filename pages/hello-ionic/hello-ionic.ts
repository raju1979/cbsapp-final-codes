import { Component, ViewChild, NgZone } from '@angular/core';
import { Content, NavController, NavParams, MenuController, ToastController } from 'ionic-angular';
 
import { CategoryDetail } from '../category-detail/category-detail';
import { PackageView } from '../package-view/package-view';

import { UserdataService } from "../../services/userdata-service";

declare var localStorageDB: any;

@Component({
  selector: 'page-hello-ionic',
  templateUrl: 'hello-ionic.html'
})

export class HelloIonicPage {

  @ViewChild(Content) content: Content;

  loading: any;
  lib: any;
  userData: any;
  allDataLoaded: boolean = false;
  genreArray: any;
  scrollDistance:number =0;

  constructor(public navCtrl: NavController, private _userDataService: UserdataService, private _toastCtrl: ToastController,  public menuCtrl: MenuController, private zone:NgZone) {

    this.genreArray = [
      {id:28,name:'PGMEE / Medical MCQs'},
      {id:12,name:'PGDEE / Dental MCQs'},
      {id:16,name:'FMGE / MCI Screening'},
      {id:35,name:'Nursing Competitive Exams / Nursing'},
    ]

  }

  ionViewDidEnter() {
    this.menuCtrl.enable(false, 'menu2');
    this.menuCtrl.enable(true, 'menu1');    
  }//end ionViewDidEnter

  enableMenu1() {
    this.menuCtrl.close();
    this.menuCtrl.enable(true, 'menu1');
    this.menuCtrl.enable(false, 'menu2');
    this.menuCtrl.open();
  }

  enableMenu2() {
    this.menuCtrl.close();
    this.menuCtrl.enable(true, 'menu2');
    this.menuCtrl.enable(false, 'menu1');
    this.menuCtrl.open();
  }

  ngOnInit() {
    // let genres = this._userDataService.getGenereList()
    //   .subscribe(
    //   (data) => this.populategenereArray(data),
    //   (err) => console.log(err)
    //   );

    this.content.ionScroll.subscribe(($event:any) => {
      //this.scrollAmount = $event.scrollTop;
      this.zone.run(() => {
        this.scrollDistance = $event.scrollTop;
        console.log(this.scrollDistance);
      });      
    });
  };//

  populategenereArray(data: any) {
    this.genreArray = data.genres;
    this.getAllGeneresPackages();//call books based upon all genres
  };//

  getAllGeneresPackages() {
    let allGenrePackage = this._userDataService.getBooksByGnereId(this.genreArray)
      .subscribe(
      (data) => this.populateGenrePackage(data),
      (err) => console.log('err')
      )
  };//

  populateGenrePackage(data: any) {
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      this.genreArray[i]['packagelist'] = data[i];
    }
    this.allDataLoaded = true;
    this._userDataService.setGeneresArray(this.genreArray);
  };//

  openPackageView(item: any) {
    console.log(item);
    this.navCtrl.push(PackageView, {
      data: item.id
    })
  };//

  ionViewWillLeave() {
    this.menuCtrl.enable(false, 'menu2');
    this.menuCtrl.enable(false, 'menu1');
  };//


  itemSelected(item: any) {
    this.navCtrl.push(CategoryDetail, {
      data: item
    });
  };//

  scrollToTop() {
    this.content.scrollToTop(200);
  }

}
