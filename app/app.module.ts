import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HttpModule } from '@angular/http';

import { HelloIonicPage } from '../pages/hello-ionic/hello-ionic';
import { Feedback } from '../pages/feedback/feedback';

import { LoginPage } from '../pages/login-page/login-page';
import { CategoryDetail } from '../pages/category-detail/category-detail';
import { PackageView } from '../pages/package-view/package-view';
import { MyshelfPage } from '../pages/myshelf/myshelf';
import { CompleteView } from '../pages/complete-view/complete-view';
import { QuestionsView } from '../pages/questions-view/questions-view';
import { ResultsView } from '../pages/results-view/results-view';
import { DownloadPage } from '../pages/download-page/download-page';
import { DownloadPopover } from '../pages/download-popover/download-popover';
import { VideoPopover } from '../pages/video-popover/video-popover';
import { DownloadedPackageView } from '../pages/downloaded-package-view/downloaded-package-view';
import { GuestDownloadedPackageView } from '../pages/guest-downloaded-package-view/guest-downloaded-package-view';
import { AddPasscodePage } from '../pages/add-passcode/add-passcode';
import { ShowQuestionStats } from '../pages/show-question-stats/show-question-stats';
import { ShowImagequestionStat } from '../pages/show-imagequestion-stat/show-imagequestion-stat';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { PrivacypolicyPage } from '../pages/privacy-policy/privacy-policy';
import { NotificationsPage } from '../pages/notifications/notifications';

import { ImageQuestionsPage } from '../pages/image-questions/image-questions';
import { ImageLevelSelection } from '../pages/image-level-selection/image-level-selection';

import { GrandLevelSelection } from '../pages/grand-level-selection/grand-level-selection';
import { GrandQuestions } from '../pages/grand-questions/grand-questions';
import { ShowGrandStat } from '../pages/show-grand-stat/show-grand-stat';

import {MegaLevelSelection} from "../pages/mega-level-selection/mega-level-selection"
import {MegaQuestions} from "../pages/mega-questions/mega-questions"
import { ShowMegaStat } from '../pages/show-mega-stat/show-mega-stat';

import { BookImagesViewer } from '../pages/book-images-viewer/book-images-viewer';
import { BookAdditionalViewer } from '../pages/book-additional-viewer/book-additional-viewer';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { ForgotpasswordPage } from '../pages/forgotpassword/forgotpassword';
import { BacktoLoginPage } from '../pages/backto-login/backto-login';

import { AboutUs } from '../pages/about-us/about-us';



//services
import {UserdataService} from  "../services/userdata-service";
import {ConnectivityService} from  "../services/connectivity-service";

//pipes
import {CapitalizePipe} from  "../pipes/capitalize.pipe";
import {SearchPipe} from  "../pipes/packagesearch.pipe";
import {FormatTime} from  "../pipes/formattime.pipe";
import {FormatNotificationDatePipe} from  "../pipes/formatNotificationDate.pipe";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { IonicStorageModule } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { File } from '@ionic-native/file';
import { Transfer, FileUploadOptions, TransferObject } from '@ionic-native/transfer';
import { Zip } from '@ionic-native/zip';
import { Network } from '@ionic-native/network';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@NgModule({
  declarations: [
    MyApp,
    HelloIonicPage,
    LoginPage,
    CategoryDetail,
    PackageView,
    MyshelfPage,
    CompleteView,
    QuestionsView,
    ResultsView,
    Feedback,
    DownloadPage,
    DownloadPopover,
    VideoPopover,
    DownloadedPackageView,
    GuestDownloadedPackageView,
    AddPasscodePage,
    ShowQuestionStats,
    ShowImagequestionStat,
    CapitalizePipe,
    SearchPipe,
    FormatNotificationDatePipe,
    FormatTime,
    DashboardPage,
    PrivacypolicyPage,
    NotificationsPage,
    ImageQuestionsPage,
    ImageLevelSelection,
    GrandLevelSelection,
    GrandQuestions,
    ShowGrandStat,
    MegaLevelSelection,
    MegaQuestions,
    ShowMegaStat,
    BookImagesViewer,
    BookAdditionalViewer,
    ForgotpasswordPage,
    BacktoLoginPage,
    AboutUs
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp,{
      scrollAssist: false,    // Valid options appear to be [true, false]
      autoFocusAssist: false
    }),
    IonicStorageModule.forRoot(),
    BrowserAnimationsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HelloIonicPage,
    LoginPage,
    CategoryDetail,
    PackageView,
    Feedback,
    MyshelfPage,
    CompleteView,
    QuestionsView,
    ResultsView,
    DownloadPage,
    VideoPopover,
    DownloadedPackageView,
    GuestDownloadedPackageView,
    DownloadPopover,
    AddPasscodePage,
    ShowQuestionStats,
    ShowImagequestionStat,
    DashboardPage,
    PrivacypolicyPage,
    NotificationsPage,
    ImageQuestionsPage,
    ImageLevelSelection,
    GrandLevelSelection,
    GrandQuestions,
    ShowGrandStat,
    MegaLevelSelection,
    MegaQuestions,
    ShowMegaStat,
    BookImagesViewer,
    BookAdditionalViewer,
    ForgotpasswordPage,
    BacktoLoginPage,
    AboutUs
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserdataService,ConnectivityService,Device,File,Transfer,Zip,Network,StatusBar,SplashScreen,SQLite
  ]
})
export class AppModule {}
