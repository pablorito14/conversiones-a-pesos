// export interface Cotizacion {
//   euro:{
//     fecha:string;
//     valor:number;
//     valorConImp:number;
//   };
//   franco:{
//     fecha:string;
//     valor: number;
//     valorConImp:number;
//   },
//   dolar: {
//     fecha:string;
//     valor:number;
//     valorConImp:number;
//   }
// }

// export interface Cotiacion_new{
//   id:string;
//   label:string;
//   fecha:string;
//   valor:number;
//   valorConImp?:number;
// }

export interface Cotizacion {
  dolarToPesos: {
    label: string;
    fecha:string;
    valor:number;
    valorConImp:number;
  },
  euroToPesos:{
    label: string;
    fecha:string;
    valor:number;
    valorConImp:number;
  };
  francoToPesos:{
    label: string;
    fecha:string;
    valor: number;
    valorConImp:number;
  },
  euroToDolares:{
    label: string;
    fecha:string;
    valor: number;
    valorConImp?:number;
  },
  francoToEuros:{
    label: string;
    fecha:string;
    valor: number;
    valorConImp?:number;
  },
  francoToDolares:{
    label: string;
    fecha:string;
    valor: number;
    valorConImp?:number;
  }
}

export interface CotizacionResponse {
  compra    :string;
  venta     :string;
  fecha     :string;
}