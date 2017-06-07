import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';
 
declare var Connection:any;
declare var navigator:any;
 
@Injectable()
export class ConnectivityService {
 
  onDevice: boolean;
  networkType:string;
 
  constructor(private _platform: Platform,private _network:Network){
    this.onDevice = this._platform.is('cordova');
  }
 
  isOnline(): boolean {
    if(this.onDevice && this._network.type){
      return this._network.type !== Connection.NONE;
    } else {
      return navigator.onLine; 
    }
  }
 
  isOffline(): boolean {
    if(this.onDevice && this._network.type){
      return this._network.type === Connection.NONE;
    } else {
      return !navigator.onLine;   
    }
  }

  getConnectivityStatus():boolean{
    
    
        let connectivity:boolean = false;
        this.networkType = navigator.connection.type;
        console.log(this.networkType);
        if(this.networkType !== 'none'){
          connectivity =  true;
        }
        console.log('Connectivity',connectivity);
        return connectivity;
    
    
    
  }

}