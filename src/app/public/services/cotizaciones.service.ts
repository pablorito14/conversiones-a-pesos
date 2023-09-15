import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
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

  url:string = 'https://mercados.ambito.com//euro/variacion';
  getCotizacion(){
    return this.http.get<CotizacionResponse>(this.url)
                .pipe(
                  map((c:CotizacionResponse) => {

                    return {
                      valor: +c.venta.replace(',','.'),
                      fecha: c.fecha.split(' ')[0].split('/').reverse().join('-')
                    };
                  }),
                  catchError(err => {console.log(err); return of({status:false}) })
                )
  }
}
