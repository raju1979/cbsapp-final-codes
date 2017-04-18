import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name:'searchPipe',
    pure:false
})

export class SearchPipe implements PipeTransform{
    transform(data: any[], searchTerm:string){
        searchTerm = searchTerm.toUpperCase();
        console.log(data);
    }
}