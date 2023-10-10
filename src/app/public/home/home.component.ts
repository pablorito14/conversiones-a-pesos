import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Subject, timer } from 'rxjs';
import { debounceTime, delay } from 'rxjs/operators';
import { CotizacionesService } from '../services/cotizaciones.service';
import { Impuestos } from '../interfaces/impuestos.interface';
import { Cotizacion } from '../interfaces/cotizacion.interface';
import { Conversion } from '../interfaces/conversion.interface';
import { Configuracion } from '../interfaces/configuracion.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  imp:Impuestos = {
    rg4815: 0.45,
    pais: 0.30,
    catar: 0.25
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
  
  // cotizaciones!: Cotizacion;
  cotizaciones:any;
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

  config!:Configuracion;

  ngOnInit(): void {
    this.config = JSON.parse(localStorage.getItem('config')!);

    if(localStorage.getItem('tipoCambio')){
      localStorage.removeItem('tipoCambio');
    }
    this.debouncer
        .pipe(debounceTime(this.config.tiempo*1000))
        .subscribe(valor => {

          if(valor > 0){
            this.calcularValor(valor);
          }
        })

    this.buscarCotizacion();
    // setTimeout(() => {
    //   this.randomConversion();  
    // }, 5000);
    
  }

  randomConversion(){
    for (let index = 0; index < 30; index++) {
      const currency = ['euros','francos','dolares'];
      this.activeCurrency = currency[Math.floor(Math.random() * 3)]
      this.calcularValor(Math.floor(Math.random() * 30))
      
    }
  }

  tipoConversion!:string;
  cambiarConversion(cambio:string = '',recalcular:boolean = true){
    // console.log(cambio)
    if(cambio == '') {
      cambio = this.tipoConversion
    };
    // console.log(cambio,this.tipoConversion)
    // this.activeCurrency = cambio;
    localStorage.setItem('tipo_cambio',cambio);

    if(cambio == 'euroToPesos') {
      this.ultimaCotizacion = moment(this.cotizaciones.euroToPesos.fecha).format(this.formatoFecha);
      this.activeCurrency = 'euros a pesos';
      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.euroToPesos.valor,
        pesosConImp: this.cotizaciones.euroToPesos.valorConImp
      }
    } else if(cambio == 'francoToPesos') {
      this.ultimaCotizacion = moment(this.cotizaciones.francoToPesos.fecha).format(this.formatoFecha);
      this.activeCurrency = 'francos a pesos';
      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.francoToPesos.valor,
        pesosConImp: this.cotizaciones.francoToPesos.valorConImp
      }
    } else if(cambio == 'dolarToPesos'){
      this.ultimaCotizacion = moment(this.cotizaciones.dolarToPesos.fecha).format(this.formatoFecha);
      this.activeCurrency = 'dólares a pesos';
      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.dolarToPesos.valor,
        pesosConImp: this.cotizaciones.dolarToPesos.valorConImp
      }
    } else if(cambio == 'euroToDolares'){
      this.ultimaCotizacion = moment(this.cotizaciones.euroToDolares.fecha).format(this.formatoFecha);
      this.activeCurrency = 'euros a dólares';
      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.euroToDolares.valor,
        pesosConImp: this.cotizaciones.euroToDolares.valor
      }
    } else if(cambio == 'francoToEuros'){
      this.ultimaCotizacion = moment(this.cotizaciones.francoToEuros.fecha).format(this.formatoFecha);
      this.activeCurrency = 'francos a euros';
      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.francoToEuros.valor,
        pesosConImp: this.cotizaciones.francoToEuros.valor
      }
    } else if(cambio == 'francoToDolares'){
      this.ultimaCotizacion = moment(this.cotizaciones.francoToDolares.fecha).format(this.formatoFecha);
      this.activeCurrency = 'francos a dólares';
      this.conversionActual = {
        moneda: cambio,
        valor: 1,
        pesos: this.cotizaciones.francoToDolares.valor,
        pesosConImp: this.cotizaciones.francoToDolares.valor
      }
    }
    if(recalcular && this.valor != '' && this.config.calcularAlCambiar){
      this.calcularValor(+this.valor);
    } else if(recalcular && this.valor != '' && !this.config.calcularAlCambiar){
      this.limpiarInput();
    } 
    
  }
  // cambiarConversion(cambio:string,recalcular:boolean = true){
  //   console.log(cambio)
  //   this.activeCurrency = cambio;
  //   localStorage.setItem('tipoCambio',cambio);
  //   if(cambio == 'euroToPesos') {
  //     this.ultimaCotizacion = moment(this.cotizaciones.euroToPesos.fecha).format(this.formatoFecha);

  //     this.conversionActual = {
  //       moneda: cambio,
  //       valor: 1,
  //       pesos: this.cotizaciones.euroToPesos.valor,
  //       pesosConImp: this.cotizaciones.euroToPesos.valorConImp
  //     }
  //   } else if(cambio == 'francoToPesos') {
  //     this.ultimaCotizacion = moment(this.cotizaciones.francoToPesos.fecha).format(this.formatoFecha);

  //     this.conversionActual = {
  //       moneda: cambio,
  //       valor: 1,
  //       pesos: this.cotizaciones.francoToPesos.valor,
  //       pesosConImp: this.cotizaciones.francoToPesos.valorConImp
  //     }
  //   } else if(cambio == 'dolarToPesos'){
  //     this.ultimaCotizacion = moment(this.cotizaciones.dolarToPesos.fecha).format(this.formatoFecha);

  //     this.conversionActual = {
  //       moneda: cambio,
  //       valor: 1,
  //       pesos: this.cotizaciones.dolarToPesos.valor,
  //       pesosConImp: this.cotizaciones.dolarToPesos.valorConImp
  //     }
  //   } else if(cambio == 'euroToDolares'){
  //     this.ultimaCotizacion = cambio;

  //     this.conversionActual = {
  //       moneda: cambio,
  //       valor: 1,
  //       pesos: this.cotizaciones.euroToDolares.valor,
  //       // pesosConImp: this.cotizaciones.euroToDoalres.valorConImp
  //     }
  //   } else if(cambio == 'francoToEuros'){
  //     this.ultimaCotizacion = cambio;

  //     this.conversionActual = {
  //       moneda: cambio,
  //       valor: 1,
  //       pesos: this.cotizaciones.francoToEuros.valor,
  //       // pesosConImp: this.cotizaciones.dolarToPesos.valorConImp
  //     }
  //   } else if(cambio == 'francoToDolares'){
  //     this.ultimaCotizacion = cambio;

  //     this.conversionActual = {
  //       moneda: cambio,
  //       valor: 1,
  //       pesos: this.cotizaciones.francoToDolares.valor,
  //       // pesosConImp: this.cotizaciones.dolarToPesos.valorConImp
  //     }
  //   }

    
  //   if(recalcular && this.valor != '' && this.config.calcularAlCambiar){
  //     this.calcularValor(+this.valor);
  //   } else if(this.valor != '' && !this.config.calcularAlCambiar){
  //     this.limpiarInput();
  //   } 
  // }

  reloading:boolean = false;
  buscarCotizacion(reload:boolean = false){
    this.reloading = reload;

    this._cotizaciones.getCotizacion().subscribe((cot:any) => {
      
      const valorDolar = +(cot.dolar.valor * (this.imp.rg4815 + this.imp.pais + this.imp.catar + 1)).toFixed(2);
      const valorEuro = +(cot.euro.valor * (this.imp.rg4815 + this.imp.pais + this.imp.catar + 1)).toFixed(2);
      const valorFranco = +(cot.euro.valor * this.francosToEuros).toFixed(2)
      const valorFrancoConImp = +(valorFranco * (this.imp.rg4815 + this.imp.pais + this.imp.catar + 1)).toFixed(2);



      this.cotizaciones = {
        euroToPesos: {
          label: 'euros a pesos',
          fecha: cot.euro.fecha,
          valor: cot.euro.valor,
          valorConImp: valorEuro
        },
        francoToPesos: {
          label: 'francos a pesos',
          fecha: cot.euro.fecha,
          valor: valorFranco,
          valorConImp: valorFrancoConImp
        },
        dolarToPesos:{
          label: 'dólares a pesos',
          fecha: cot.dolar.fecha,
          valor: cot.dolar.valor,
          valorConImp:valorDolar
        },
        euroToDolares:{
          label: 'euros a dólares',
          fecha: cot.euro.fecha,
          valor: +(cot.euro.valor / cot.dolar.valor).toFixed(2),
          valorConImp: +(cot.euro.valor / cot.dolar.valor).toFixed(2)
        },
        francoToEuros:{
          label: 'francos a euros',
          fecha: cot.euro.fecha,
          valor: +(valorFranco / cot.euro.valor).toFixed(2),
          valorConImp: +(valorFranco / cot.euro.valor).toFixed(2)
        },
        francoToDolares:{
          label: 'francos a dólares',
          fecha: cot.euro.fecha,
          valor: +(valorFranco / cot.dolar.valor).toFixed(2),
          valorConImp: +(valorFranco / cot.dolar.valor).toFixed(2)
        }
      }

      this.dolaresToEuros = +(this.cotizaciones.euroToPesos.valor / this.cotizaciones.dolarToPesos.valor).toFixed(2);

      const limiteEuros = +(300 * (2 - this.dolaresToEuros)).toFixed(2);
      const limiteFrancos = +(limiteEuros * (2 - this.francosToEuros)).toFixed(2);

      this.limiteImpCatar = {
        dolares: 300,
        euros: limiteEuros,
        francos: limiteFrancos
      }
      

      localStorage.setItem('cotizaciones',JSON.stringify(this.cotizaciones))

      const cambio = localStorage.getItem('tipo_cambio') || 'euroToPesos';
      this.tipoConversion = cambio;
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
    // this.input.nativeElement.focus();
    // console.log(this.conversionActual)

    
    // console.log(this.cotizaciones['francoToEuros'])
    // console.log(this.cotizaciones[this.conversionActual.moneda])
    this.conversionActual = {
      valor: 1,
      moneda: this.conversionActual.moneda,
      pesos: this.cotizaciones[this.conversionActual.moneda].valor,
      pesosConImp: this.cotizaciones[this.conversionActual.moneda].valorConImp
    }

  }
   
  showStrImpCatar:string = '';
  calcularValor(valor:number){

    this.conversionActual = {
      moneda: this.tipoConversion,
      valor: valor,
      pesos: 0,
      pesosConImp: 0
    }

    let imp = 1;
    if(this.tipoConversion === 'euroToPesos'){

      // if(valor < this.limiteImpCatar.euros ){
      //   imp += (this.imp.rg4815 + this.imp.pais);
      //   this.showStrImpCatar = '';
      // } else {
      //   imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
      //   this.showStrImpCatar = `U$D 300 (≈ € ${this.limiteImpCatar.euros})`
      // }
      
      imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
      
      this.conversionActual.pesos = valor * this.cotizaciones.euroToPesos.valor;
      this.conversionActual.pesosConImp = +(valor * this.cotizaciones.euroToPesos.valor * imp).toFixed(2);
    } else if(this.tipoConversion === 'francoToPesos' ){

      // if(valor < this.limiteImpCatar.francos ){
      //   this.showStrImpCatar = '';
      //   imp += (this.imp.rg4815 + this.imp.pais);
      // } else {
      //   imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
      //   this.showStrImpCatar = `U$D 300 (≈ Fr. ${this.limiteImpCatar.francos})`;
      // }

      imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);

      this.conversionActual.pesos = valor * this.cotizaciones.francoToPesos.valor;
      this.conversionActual.pesosConImp = +(valor * this.cotizaciones.francoToPesos.valor * imp).toFixed(2);
    } else if(this.tipoConversion === 'dolarToPesos'){

      // if(valor < this.limiteImpCatar.dolares ){
      //   imp += (this.imp.rg4815 + this.imp.pais);
      //   this.showStrImpCatar = '';
      // } else {
      //   imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
      //   this.showStrImpCatar = `U$D 300`;
      // }

      imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
      
      this.conversionActual.pesos = valor * this.cotizaciones.dolarToPesos.valor;
      this.conversionActual.pesosConImp = +(valor * this.cotizaciones.dolarToPesos.valor * imp).toFixed(2);
    } else if(this.tipoConversion == 'francoToDolares') {
      this.showStrImpCatar = '';
      this.conversionActual.pesos = this.conversionActual.pesosConImp = valor * this.cotizaciones.francoToDolares.valor;
      
    } else if(this.tipoConversion == 'euroToDolares') {
      this.showStrImpCatar = '';

      this.conversionActual.pesos = this.conversionActual.pesosConImp = valor * this.cotizaciones.euroToDolares.valor;
    } else if(this.tipoConversion == 'francoToEuros') {
      this.showStrImpCatar = '';

      this.conversionActual.pesos = this.conversionActual.pesosConImp = valor * this.cotizaciones.francoToEuros.valor;
    }
    // if(this.activeCurrency === 'euros'){

    //   if(valor < this.limiteImpCatar.euros ){
    //     imp += (this.imp.rg4815 + this.imp.pais);
    //     this.showStrImpCatar = '';
    //   } else {
    //     imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
    //     this.showStrImpCatar = `U$D 300 (≈ € ${this.limiteImpCatar.euros})`
    //   }

    //   this.conversionActual.pesos = valor * this.cotizaciones.euroToPesos.valor;
    //   this.conversionActual.pesosConImp = +(valor * this.cotizaciones.euroToPesos.valor * imp).toFixed(2);
    // } else if(this.activeCurrency === 'francos' ){

    //   if(valor < this.limiteImpCatar.francos ){
    //     this.showStrImpCatar = '';
    //     imp += (this.imp.rg4815 + this.imp.pais);
    //   } else {
    //     imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
    //     this.showStrImpCatar = `U$D 300 (≈ Fr. ${this.limiteImpCatar.francos})`;
    //   }

    //   this.conversionActual.pesos = valor * this.cotizaciones.francoToPesos.valor;
    //   this.conversionActual.pesosConImp = +(valor * this.cotizaciones.francoToPesos.valor * imp).toFixed(2);
    // } else if(this.activeCurrency === 'dolares'){

    //   if(valor < this.limiteImpCatar.dolares ){
    //     imp += (this.imp.rg4815 + this.imp.pais);
    //     this.showStrImpCatar = '';
    //   } else {
    //     imp += (this.imp.rg4815 + this.imp.pais + this.imp.catar);
    //     this.showStrImpCatar = `U$D 300`;
    //   }

    //   this.conversionActual.pesos = valor * this.cotizaciones.dolarToPesos.valor;
    //   this.conversionActual.pesosConImp = +(valor * this.cotizaciones.dolarToPesos.valor * imp).toFixed(2);
    // }

    const existe = this.conversiones.findIndex(c => c.moneda == this.tipoConversion && c.valor == valor);
    
    if(existe != -1){
      this.conversiones.splice(existe,1);
    }

    this.conversiones.unshift(this.conversionActual)
  }

  limpiarHistorial(){
    console.log(this.conversiones);
    const source = timer(100,50)
    const limpiar = source.subscribe(val => {
      this.conversiones.pop();

      if(this.conversiones.length == 0){
        limpiar.unsubscribe();
      }
    })
  }

}
