import { Component, ViewChild, NgZone } from '@angular/core';

import { Platform, MenuController, Nav, ToastController, AlertController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { LoginPage } from '../pages/login-page/login-page';
import { CategoryDetail } from '../pages/category-detail/category-detail';
import { MyshelfPage } from '../pages/myshelf/myshelf';
import { Feedback } from '../pages/feedback/feedback';
import { AddPasscodePage } from '../pages/add-passcode/add-passcode';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { PrivacypolicyPage } from '../pages/privacy-policy/privacy-policy';
import { NotificationsPage } from '../pages/notifications/notifications';

import { UserdataService } from "../services/userdata-service";

import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { File } from '@ionic-native/file';

import { Storage } from '@ionic/storage';

declare var cordova: any;
declare var localStorageDB: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  // db: any;
  // private storage: Storage;
  // lib: any;
  userData: any;
  mainDirectoryName: string = "cbsapp";
  fs: string;
  toast: any;
  mobile: boolean = false;

  // make HelloIonicPage the root (or first) page
  rootPage: any = LoginPage;
  pages: Array<{ title: string, component: any }>;

  genereList: any;

  //name: any;
  _subscription: any;
  _subscriptionuserData: any;

  currentOs:string = '';

  showAddPassCodePage:boolean = false;

  constructor(public toastCtrl: ToastController, public platform: Platform, public menu: MenuController, private _userDataService: UserdataService, private _zone: NgZone, public _alertCtrl: AlertController, private _toastCtrl: ToastController, private _storage:Storage,public statusBar: StatusBar,public splashScreen: SplashScreen,private _file: File) {
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'Hello Ionic', component: HelloIonicPage }
    ];

    //this.name = this._userDataService.name;

    //this.lib = new localStorageDB("cbsapp", localStorage);

    this.platform.ready().then((readySource) => {
      if (this.platform.is('mobile')) {
        this.mobile = true;
        //this.db = new SQLite();
        //this.createSQliteDb();
      }

      if (this.platform.is('ios')) {
        this.fs = cordova.file.documentsDirectory;
      }
      else if (this.platform.is('android')) {
        this.fs = cordova.file.externalRootDirectory;
        this.showAddPassCodePage = true;
      }
    });



    // setTimeout(() => {
    //   this._userDataService.change();
    // },5000)

  };//end constructor

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.hideSplashScreen();


      setTimeout(() => {
        let loading = document.getElementById('splash');
        loading.classList.add('fade-out');  // Will hide splash & show rootpage that you setup (normally landing)
        loading.remove();
        loading = null;
      }, 500)
    });
  };

  hideSplashScreen() {
    if (this.splashScreen) {
      setTimeout(() => {
        this.splashScreen.hide();
      }, 100)
    }
  };//

  /**
   * ngOnInit().
   * @param none , @return none
   * @EXPLAIN : 
   * 1- subscribe to event where user data is changed by _userDataService.userDataChange
   * 2- subscribe to event where genre data is changed by _userDataService.genereListArrayChange
   */
  ngOnInit() {
    this._subscriptionuserData = this._userDataService.userDataChange.subscribe((value) => {
      this._zone.run(() => {
        this.userData = value;
        console.info(this.userData);
      });//      
    });

    // this._subscription = this._userDataService.genereListArrayChange.subscribe((value) => {
    //   this.genereList = value.genres;
    //   console.info(value);
    // });
  };//end ngOnInit

  ngOnDestroy() {
    this._subscription.unsubscribe();
    this._subscriptionuserData.unsubscribe();
  };//end ngOnDestroy()

  populateGenereList(data: any) {
    this.genereList = data.genres;
  }

  openPage(page: any) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  itemSelected(item: any) {
    console.log(item);
  }

  /**
   * getProfileImgSrc().
   * @param none , @return none
   * @EXPLAIN : 
   * 1- get the profileImage form assets/img folder
   */
  getProfileImgSrc() {
    if (this.platform.is('core')) {
      return "../assets/img/girl.png";
    } else if (this.platform.is('android')) {
      return "assets/img/girl.png";
    } else {
      return "assets/img/girl.png";
    }
  };//end getProfileImgSrc()

  /**
   * getGenereDataAndNavigate(i: any).
   * @param i => genreId
   * @return none
   * @EXPLAIN : 
   * 1- call the _userDataService.getGenereData
   * 2- close the menu
   * 2- inside setTimeout: push @CategoryDetail page with param 'data' returned from _userDataService.getGenereData
   */
  getGenereDataAndNavigate(i: any) {
    let data = this._userDataService.getGenereData(i);
    this.menu.close();
    setTimeout(() => {
      this.nav.push(CategoryDetail, {
        data: data
      });
    }, 500)
  };//end getGenereDataAndNavigate(i: any)

  /**
   * showToast().
   * @param none , @return none
   * @EXPLAIN : 
   * 1- show the toast
   */
  showToast() {
    this.menu.close();
    let toast = this.toastCtrl.create({
      message: 'No done yet',
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  };//end showToast()

  /**
  * logoutUser().
  * @param none
  * @return none
  * @EXPLAIN : 
  * 1- drop the database 'lib'
  * 2- inside setTimeout: close the menu and set root to login page
  */
  logoutUser() {
    this.menu.close();
    this.presentLogoutConfirm();
  };//end logoutUser()

  /**
   * navigateToMyshelf().
   * @param none , @return none
   * @EXPLAIN : 
   * 1- close the menu
   * push new page @MyshelfPage
   */
  navigateToMyshelf(): void {
    // close the menu when clicking a link from the menu
    this.menu.close();
    this.nav.push(MyshelfPage);
  };//end navigateToMyshelf()

  presentLogoutConfirm() {
    let alert = this._alertCtrl.create({
      title: 'Confirm Logout',
      message: 'Do you really want to Logout? All your history and downloaded content <span class="logOutAlertText">will be deleted</span>',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Log Me Out',
          handler: () => {
            if (this.mobile) {
              this._file.checkDir(this.fs, this.mainDirectoryName)
                .then(_ => {
                  console.log('Directory exists');
                  this._file.removeRecursively(this.fs, this.mainDirectoryName)
                    .then(() => console.log('Directory deleted'))
                    .catch((err) => this.presentDirectoryRemoveToast(err));
                })
                .catch(err => console.log('Directory doesnt exist'));              
            }//end if
            localStorage.removeItem("user_master");
            this._storage.clear();//clear the indexedDb HOT
            setTimeout(() => {
              this.menu.close();
              this.nav.setRoot(LoginPage);
            }, 2000);;
          }
        }
      ]
    });
    alert.present();
  };//

  presentDirectoryRemoveToast(msg: string): void {
    let toast = this._toastCtrl.create({
      message: `Hey: ${msg}`,
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  };//

  

  

  navigateToFeedback(){
    this.menu.close();
    this.nav.push(Feedback);
  }
  navigateToAddPasscode(){
    this.menu.close();
    this.nav.push(AddPasscodePage);
  }
    navigateToDashboard(){
    this.menu.close();
    this.nav.push(DashboardPage);
  }
  navigateToPrivacy(){
    this.menu.close();
    this.nav.push(PrivacypolicyPage);
  }
  navigateToNotifications(){
    this.menu.close();
    this.nav.push(NotificationsPage);
  }
};//end class
