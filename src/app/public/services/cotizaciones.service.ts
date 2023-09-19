import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, map, of, zip } from 'rxjs';
import * as moment from 'moment';

interface CotizacionResponse {
  compra    :string;
  venta     :string;
  fecha     :string;
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {

  constructor(private http:HttpClient) { }

  urlEuros:string = 'https://mercados.ambito.com//euro/variacion';
  urlDolares:string = 'https://mercados.ambito.com//dolar/oficial/variacion';
  
  getCotizacion(){
    const euros = this.http.get<CotizacionResponse>(this.urlEuros);
    const dolares = this.http.get<CotizacionResponse>(this.urlDolares);


    const request = zip(euros,dolares);

    return request.pipe(
      delay(3000),
      map((c:CotizacionResponse[]) => {
        const euros = c.at(0);
        const dolares = c.at(1);

        return {
          euro: {
            valor: +euros!.venta.replace(',','.'),
            fecha: euros!.fecha.split(' ')[0].split('/').reverse().join('-')
          },
          dolar: {
            valor: +dolares!.venta.replace(',','.'),
            fecha: dolares!.fecha.split(' ')[0].split('/').reverse().join('-')
          },
        }
      }),
      catchError(err => { console.log(err); return of({status:false})})
    )
  }

  
}

