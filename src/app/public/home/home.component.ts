import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Subject, timer } from 'rxjs';
import { debounceTime, delay } from 'rxjs/operators';
import { CotizacionesService } from '../services/cotizaciones.service';
import Swal from 'sweetalert2';

interface Cotizacion {
  euro:{
    fecha:string;
    valor:number;
    valorConImp:number;
  };
  franco:{
    fecha:string;
    valor: number;
    valorConImp:number;
  },
  dolar: {
    fecha:string;
    valor:number;
    valorConImp:number;
  }
}

interface Conversion{
  moneda:string;
  valor:number;
  pesos:number;
  pesosConImp:number;
}

interface Impuestos{
  rg4815:number;
  pais:number;
  catar:number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  imp:Impuestos = {
    rg4815: 0.45,
    pais: 0.30,
    catar: 0.05
  }

  loading:boolean = true;

  @ViewChild('conversion') input!: ElementRef;

  // euros:boolean = true;
  // francos:boolean = false;

  activeCurrency:string = 'euros';
  
  francosToEuros:number = 1.05;
  dolaresToEuros:number = 0;
  
  limiteImpCatar:any = {
    dolar: 0,
    euro: 0,
    franco:0,

  }
  
  // cambio:string = 'euros'
  
  cotizaciones!: Cotizacion;
  ultimaCotizacion:string = '';

  formatoFecha:string = 'D [de] MMMM';

  conversiones:Conversion[] = [];
  conversionActual!:Conversion;
  
  debouncer:Subject<number> = new Subject();

  online:boolean = true;
  constructor(private _cotizaciones:CotizacionesService){

    window.addEventListener('online', (e) => {
      console.log(window.navigator.onLine)
      this.online = window.navigator.onLine
      this.buscarCotizacion(true);
    })

    window.addEventListener('offline', (e) => {
      console.log(window.navigator.onLine)
      this.online = window.navigator.onLine
    })
  }


  
  ngOnInit(): void {
    
    
    this.debouncer
        .pipe(debounceTime(1000))
        .subscribe(valor => {

          if(valor > 0){
            this.calcularValor(valor);
          }
        })

    this.buscarCotizacion();
    // setTimeout(() => {
    //   this.randomConversion();  
    // }, 3000);
    
  }

  randomConversion(){
    for (let index = 0; index < 30; index++) {
      const currency = ['euros','francos','dolares'];
      this.activeCurrency = currency[Math.floor(Math.random() * 3)]
      this.calcularValor(Math.floor(Math.random() * 15))
      
    }
  }

  cambiarConversion(cambio:string,recalcular:boolean = true){
    this.activeCurrency = cambio;
    localStorage.setItem('tipoCambio',cambio);
    if(cambio == 'euros') {
      this.ultimaCotizacion = moment(this.cotizaciones.euro.fecha).format(this.formatoFecha);

      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.euro.valor,
        pesosConImp: this.cotizaciones.euro.valorConImp
      }
    } else if(cambio == 'francos') {
      this.ultimaCotizacion = moment(this.cotizaciones.franco.fecha).format(this.formatoFecha);

      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.franco.valor,
        pesosConImp: this.cotizaciones.franco.valorConImp
      }
    } else if(cambio == 'dolares'){
      this.ultimaCotizacion = moment(this.cotizaciones.dolar.fecha).format(this.formatoFecha);

      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.dolar.valor,
        pesosConImp: this.cotizaciones.dolar.valorConImp
      }
    }

    console.log(this.conversionActual)
    if(recalcular && this.valor != ''){
      this.calcularValor(+this.valor);
    }
  }

  reloading:boolean = false;
  buscarCotizacion(reload:boolean = false){
    this.reloading = reload;

    this._cotizaciones.getCotizacion().subscribe((cot:any) => {
      
      // const valorDolar = +(cot.dolar.valor * (this.imp.rg4815 +1) * (this.imp.pais + 1)).toFixed(2);
      // const valorEuro = +(cot.euro.valor * (this.imp.rg4815 + 1) * (this.imp.pais + 1)).toFixed(2);
      const valorDolar = +(cot.dolar.valor * (this.imp.rg4815 + this.imp.pais + 1)).toFixed(2);
      const valorEuro = +(cot.euro.valor * (this.imp.rg4815 + this.imp.pais + 1)).toFixed(2);
      const valorFranco = +(cot.euro.valor * this.francosToEuros).toFixed(2)
      // const valorFrancoConImp = +(alorEuro * this.francosToEuros).toFixed(2);
      const valorFrancoConImp = +(valorFranco * (this.imp.rg4815 + this.imp.pais + 1)).toFixed(2);

      this.cotizaciones = {
        euro: {
          fecha: cot.euro.fecha,
          valor: cot.euro.valor,
          valorConImp: valorEuro
        },
        franco: {
          fecha: cot.euro.fecha,
          valor: valorFranco,
          valorConImp: valorFrancoConImp
        },
        dolar:{
          fecha: cot.dolar.fecha,
          valor: cot.dolar.valor,
          valorConImp:valorDolar
        }
      }

      this.dolaresToEuros = +(this.cotizaciones.euro.valor / this.cotizaciones.dolar.valor).toFixed(2);

      const limiteEuros = +(300 * (2 - this.dolaresToEuros)).toFixed(2);
      const limiteFrancos = +(limiteEuros * (2 - this.francosToEuros)).toFixed(2);

      this.limiteImpCatar = {
        dolares: 300,
        euros: limiteEuros,
        francos: limiteFrancos
      }
      console.log(this.limiteImpCatar)
      

      localStorage.setItem('cotizaciones',JSON.stringify(this.cotizaciones))

      const cambio = localStorage.getItem('tipoCambio') || 'euros';
      this.cambiarConversion(cambio,false);
      this.loading = false;
      this.reloading = false;
    });

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
    this.valor = '';
    this.showStrImpCatar = '';
    this.input.nativeElement.focus();
    const cambio = localStorage.getItem('tipoCambio') || 'euros';
    this.cambiarConversion(cambio,false);
    
  }
   
  showStrImpCatar:string = '';
  calcularValor(valor:number){

    this.conversionActual = {
      moneda: this.activeCurrency,
      valor: valor,
      pesos: 0,
      pesosConImp: 0
    }

    let imp = 1;

    if(this.activeCurrency === 'euros'){

      if(valor < this.limiteImpCatar.euros ){
        imp += (this.imp.rg4815 + this.imp.pais);
        this.showStrImpCatar = '';
      } else {
        imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
        this.showStrImpCatar = `U$D 300 (≈ € ${this.limiteImpCatar.euros})`
      }

      this.conversionActual.pesos = valor * this.cotizaciones.euro.valor;
      this.conversionActual.pesosConImp = +(valor * this.cotizaciones.euro.valor * imp).toFixed(2);
    } else if(this.activeCurrency === 'francos' ){

      if(valor < this.limiteImpCatar.francos ){
        this.showStrImpCatar = '';
        imp += (this.imp.rg4815 + this.imp.pais);
      } else {
        imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
        this.showStrImpCatar = `U$D 300 (≈ Fr. ${this.limiteImpCatar.francos})`;
      }

      this.conversionActual.pesos = valor * this.cotizaciones.franco.valor;
      this.conversionActual.pesosConImp = +(valor * this.cotizaciones.franco.valor * imp).toFixed(2);
    } else if(this.activeCurrency === 'dolares'){

      if(valor < this.limiteImpCatar.dolares ){
        imp += (this.imp.rg4815 + this.imp.pais);
        this.showStrImpCatar = '';
      } else {
        imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
        this.showStrImpCatar = `U$D 300`;
      }

      this.conversionActual.pesos = valor * this.cotizaciones.dolar.valor;
      this.conversionActual.pesosConImp = +(valor * this.cotizaciones.dolar.valor * imp).toFixed(2);
    }

    const existe = this.conversiones.findIndex(c => c.moneda == this.activeCurrency && c.valor == valor);
    
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
