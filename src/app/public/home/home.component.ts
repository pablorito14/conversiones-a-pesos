import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Subject, timer } from 'rxjs';
import { debounceTime, delay } from 'rxjs/operators';
import { CotizacionesService } from '../services/cotizaciones.service';

interface Cotizacion {
  euro:{
    fecha:string;
    valor:number;
  };
  franco:{
    fecha:string;
    valor: number;
  }
}

interface Conversion{
  moneda:string;
  valor:number;
  pesos:number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loading:boolean = true;

  @ViewChild('conversion') input!: ElementRef;

  euros:boolean = true;
  francos:boolean = false;
  
  francosToEuros:number = 1.05;
  
  cambio:string = 'euros'
  
  cotizaciones!: Cotizacion;
  ultimaCotizacion:string = '';

  formatoFecha:string = 'D [de] MMMM';

  conversiones:Conversion[] = [];
  conversionActual!:Conversion;
  
  debouncer:Subject<number> = new Subject();

  constructor(private _cotizaciones:CotizacionesService){}

  ngOnInit(): void {
    
    this.debouncer
        .pipe(debounceTime(1000))
        .subscribe(valor => {

          if(valor > 0){
            this.calcularValor(valor);
          }
        })

    this.buscarCotizacion();
  }

  cambiarConversion(cambio:string){
    if(cambio == 'euros') {
      this.euros = true; 
      this.francos = !this.euros
      this.cambio = cambio;
      this.ultimaCotizacion = moment(this.cotizaciones.euro.fecha).format(this.formatoFecha);
      localStorage.setItem('tipoCambio',cambio);

      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.euro.valor
      }
    } else if(cambio = 'francos') {
      this.francos = true;
      this.euros = !this.francos;
      this.cambio = cambio;
      this.ultimaCotizacion = moment(this.cotizaciones.franco.fecha).format(this.formatoFecha);
      localStorage.setItem('tipoCambio',cambio);

      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.franco.valor
      }
    }
  }

  buscarCotizacion(){

    this._cotizaciones.getCotizacion().subscribe(
      (cot:any) => {
        this.cotizaciones = {
          euro: {
            fecha: cot.fecha,
            valor: cot.valor
          },
          franco: {
            fecha: cot.fecha,
            valor: +(cot.valor * this.francosToEuros).toFixed(2)
          }
        }
        const cambio = localStorage.getItem('tipoCambio') || 'euros';
        this.cambiarConversion(cambio);
        this.loading = false;
      }
    );

    // this.cotizaciones = {
    //   euro: {
    //     fecha: '2023-09-01',
    //     valor: 1650
    //   },
    //   franco: {
    //     fecha: '2023-08-31',
    //     valor: 700
    //   }
    // }

  }

  keyDown(event?:any){
    /**
     * keyCode 48 y que no sea el primero para eliminar el 0 inicial
     * keyCode entre 48 y 57: numeros del 0 al 9
     * keyCode 188: coma y se verifica que no este en el input
     * keycode 8 es borrar, entre 37 y 40 las flechas de direccion
     * Todo el resto se restringe la entrada
     */

    if(event.keyCode == 48 && event.target.value != ''){
      console.log('aaa',event.target.value);
      return true;
    } else if(event.keyCode > 48 && event.keyCode <= 57){
      return true;
    } else if(event.keyCode == 188 && !event.target.value.includes('.')){
      return true;
    } else if(event.keyCode == 8 || (event.keyCode >= 37 && event.keyCode <= 40)){
      return true;
    }

    return false;
  }
  
  onDebouncer(event?:any){
    this.valor = event.target.value.replace(',','.')

    this.debouncer.next(+this.valor);
  }

  valor:string = '';
  limpiarInput(){
    // this.valor = undefined!;
    this.valor = '';
    this.input.nativeElement.focus();
  }
   

  // testValue:number = 0;
  calcularValor(valor:number){
    let pesos = 0;
    if(this.cambio === 'euros'){
      pesos = valor * this.cotizaciones.euro.valor;
    } else if(this.cambio === 'francos' ){
      pesos = valor * this.cotizaciones.franco.valor;
    }

    this.conversionActual = {
      moneda: this.cambio,
      valor: valor,
      pesos: pesos
    }

    const existe = this.conversiones.findIndex(c => c.moneda == this.cambio && c.valor == valor);
    
    if(existe != -1){
      this.conversiones.splice(existe,1);
    }

    this.conversiones.unshift(this.conversionActual)
  }

  limpiarHistorial(){

    const source = timer(100,50)
    const limpiar = source.subscribe(val => {
      this.conversiones.pop();

      if(this.conversiones.length == 0){
        limpiar.unsubscribe();
      }
    })
  }

  

}
