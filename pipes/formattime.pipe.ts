import { Pipe, PipeTransform } from '@angular/core';


declare var moment:any;

@Pipe({name: 'formattime',pure:false})
export class FormatTime implements PipeTransform {
  transform(value: number, args: string[]): any {
    // console.log("total time is ::",value);  
    // if (!value) return value;

   var dd = moment("1900-01-01 00:00:00").add(value, 'seconds').format("HH:mm:ss")
    // return dd;
    return dd;
  }
}