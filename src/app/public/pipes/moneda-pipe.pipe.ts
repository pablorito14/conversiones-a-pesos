import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monedaPipe'
})
export class MonedaPipePipe implements PipeTransform {

  transform(moneda:string): string {

    if(moneda == 'euros'){
      return '€';
    } else if(moneda == 'francos'){
      return 'Fr.'
    }

    return '';
  }

}
