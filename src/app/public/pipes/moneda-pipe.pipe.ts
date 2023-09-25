import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monedaPipe'
})
export class MonedaPipePipe implements PipeTransform {

  transform(moneda:string,index:number): string {
    // console.log(moneda)
    if(moneda == 'euroToPesos'){

      const resp = ['€','$'];
      // console.log(resp[index]);
      return resp[index];
    } else if(moneda == 'francoToPesos'){
      const resp =  ['Fr.','$'];
      return resp[index];
    } else if(moneda == 'dolarToPesos'){
      const resp = ['U$D','$'];
      return resp[index];
    } else if(moneda == 'euroToDolares'){
      const resp = ['€','U$D'];
      return resp[index];
    } else if(moneda == 'francoToEuros'){
      const resp = ['Fr.','€'];
      return resp[index];
    } else if(moneda == 'francoToDolares'){
      const resp = ['Fr.','U$D'];
      return resp[index];
    }

    return '';
  }

}
