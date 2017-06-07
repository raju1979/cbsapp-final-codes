import { Pipe, PipeTransform } from '@angular/core';


declare var moment:any;

@Pipe({name: 'FormatNotificationDate',pure:false})
export class FormatNotificationDatePipe implements PipeTransform {
  transform(value: number, args: string[]): any {
    // console.log("total time is ::",value);  
    // if (!value) return value;

   var formattedDate = moment(value).startOf('day').fromNow()
    // return dd;
    return formattedDate;
  }
}