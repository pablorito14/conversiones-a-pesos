import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Subject, timer } from 'rxjs';
import { debounceTime, delay } from 'rxjs/operators';

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
  cambio:string = 'euros'
  
  cotizaciones!: Cotizacion;
  ultimaCotizacion:string = '';

  formatoFecha:string = 'D [de] MMMM';

  conversiones:Conversion[] = [];
  conversionActual!:Conversion;
  
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

  debouncer:Subject<number> = new Subject();

  ngOnInit(): void {
    const cambio = localStorage.getItem('tipoCambio') || 'euros';
    
    this.debouncer
        .pipe(debounceTime(1000))
        .subscribe(valor => {

          console.log(typeof valor);
          if(valor > 0){
            this.calcularValor(valor);
          }
        })


    this.buscarCotizacion();
    this.cambiarConversion(cambio);
    
    // this.randomConversiones();
  }

  buscarCotizacion(){
    this.cotizaciones = {
      euro: {
        fecha: '2023-09-01',
        valor: 1650
      },
      franco: {
        fecha: '2023-08-31',
        valor: 700
      }
    }

    setTimeout(() => {
      this.loading = false;
    }, 3000);
  }

  randomConversiones(){
    for (let index = 0; index < 20; index++) {
      
      this.conversiones.push({
        moneda:(Math.floor(Math.random() * 2) == 0) ? 'euros' : 'francos',
        valor: Math.floor(Math.random() * 10000),
        pesos: Math.floor(Math.random() * 10000)
      })      
    }
  }

  onDebouncer(event?:any){

    // console.log(this.valor.toFixed(2))
    // console.log(event.target.value.replace(',','.'));
    // this.valor = +parseFloat(event.target.value.replace(',','.')).toFixed(2)

    // // const valor = +parseFloat(this.valor).toFixed(2);
    this.debouncer.next(this.valor);
  }

  valor!:number;
  limpiarInput(){
    this.valor = undefined!;
    this.input.nativeElement.focus();
  }
   

  // testValue:number = 0;
  calcularValor(valor:number){
    console.log(valor)
    // this.testValue = valor;

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

    console.log(this.conversionActual);
    this.conversiones.push(this.conversionActual)
  }

  limpiarHistorial(){
    console.log(this.conversiones.length)

    const source = timer(100,50)
    const limpiar = source.subscribe(val => {
      this.conversiones.pop();

      if(this.conversiones.length == 0){
        limpiar.unsubscribe();
      }
    })
  }

  

}
