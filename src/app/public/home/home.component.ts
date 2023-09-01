import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
  euros:boolean = true;
  francos:boolean = false;
  cambio:string = 'euros'
  
  cotizaciones!: Cotizacion;
  ultimaCotizacion:string = '';

  formatoFecha:string = 'DD [de] MMMM';

  conversiones:Conversion[] = [];
  
  cambiarConversion(cambio:string){
    if(cambio == 'euro') {
      this.euros = true; 
      this.francos = !this.euros
      this.cambio = 'euros';
      this.ultimaCotizacion = moment(this.cotizaciones.euro.fecha).format(this.formatoFecha);
      localStorage.setItem('tipoCambio','euro');
    } else if(cambio = 'franco') {
      this.francos = true;
      this.euros = !this.francos;
      this.cambio = 'francos';
      this.ultimaCotizacion = moment(this.cotizaciones.franco.fecha).format(this.formatoFecha);
      localStorage.setItem('tipoCambio','franco');
    }
  }

  debouncer:Subject<number> = new Subject();

  ngOnInit(): void {
    const cambio = localStorage.getItem('tipoCambio') || 'euro';
    
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
    this.randomConversiones();
  }

  buscarCotizacion(){
    this.cotizaciones = {
      euro: {
        fecha: '2023-09-01',
        valor: 650
      },
      franco: {
        fecha: '2023-08-31',
        valor: 700
      }
    }
  }

  randomConversiones(){
    for (let index = 0; index < 10; index++) {
      
      this.conversiones.push({
        moneda:(Math.floor(Math.random() * 2) == 0) ? 'euro' : 'franco',
        valor: Math.floor(Math.random() * 10000),
        pesos: Math.floor(Math.random() * 10000)
      })      
    }
  }

  onDebouncer(event?:any){
    const valor = parseInt(event.target.value);
    this.debouncer.next(valor);
  }

  calcularValor(valor:number){
    console.log(valor)
  }

}
