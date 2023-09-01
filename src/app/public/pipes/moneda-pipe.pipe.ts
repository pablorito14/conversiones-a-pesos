import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monedaPipe'
})
export class MonedaPipePipe implements PipeTransform {

  transform(moneda:string): string {

    if(moneda == 'euro'){
      return '€';
    } else if(moneda == 'franco'){
      return 'Fr.'
    }

    return '';
  }

}
