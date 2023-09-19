import { Component, HostListener, OnInit } from '@angular/core';
import { CotizacionesService } from './public/services/cotizaciones.service';

import { SwUpdate } from '@angular/service-worker';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'euro-pesos-app';
  
  constructor(private update:SwUpdate){

    const notificacion = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    })

    if(!navigator.onLine){
      notificacion.fire(
        'Algunas funciones pueden no estar disponibles',
        'Sin conexión a internet'
      )
    }

    this.updateClient();
  
  }
  ngOnInit(): void {
    this.pwaDisponible();
  }

  updateClient(){
    
    if(!this.update.isEnabled){
      return;
    }

    this.update.versionUpdates.subscribe((event:any) => {
     
      if(event.type === "VERSION_READY"){
        Swal.fire({
          title: 'Nueva version disponible',
          icon: 'info',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          showCancelButton: true,
          confirmButtonText: 'Actualizar',
          cancelButtonText: 'Cancelar',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.update.activateUpdate().then(() => location.reload());
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire(
              'Actualización cancelada',
              'No recibirás notificación hasta la proxima actualización',
              'error'
            )
          }
        })
      }
    })
  }

  /** ofrecer la instalacion de pwa en iOS */
  pwaDisponible(){
    const userAgent = window.navigator.userAgent.toLowerCase();
    // console.log(window.navigator);
    
    const standalone = ('standalone' in window.navigator) && (window.navigator as any).standalone; 
    // standalone valida solo para iOS y se esta usando pwa // true = pwa - false = navegador

    const isIos = userAgent.includes('iphone') || userAgent.includes('ipod') || userAgent.includes('ipad')
    const mostrarPwa = JSON.parse(localStorage.getItem('msg-pwa')!);
    // console.log(mostrarPwa);
    
    // alert(`iOS: ${isIos} - standalone: ${standalone}`);

    if(isIos && !standalone && !mostrarPwa){
      const titulo = '¡Descargá la app en tu iPhone o iPad!';
      const mensaje = 'Tocá en <i class="fa-solid fa-arrow-up-from-bracket"></i> y después en agregar al inicio';
      // const toastrOption = {
      //   enableHtml:true,
      //   disableTimeOut: true,
      //   // timeOut: 5000,
      //   closeButton:false,
      //   positionClass: 'toast-bottom-full-width'
      // }

      Swal.fire({
        title: titulo,
        html: mensaje,
        icon: 'info',
        showCloseButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'No volver a mostrar',
      }).then((result) => {
        if (result.isConfirmed) {
  
          this.noMostrar();
        
        }
      })

      // this.toastr.info(mensaje,titulo,toastrOption);
    }
  }
  /** ofrecer la instalacion de pwa en iOS */

  noMostrar(){
    localStorage.setItem('msg-pwa', JSON.stringify(true));
    
  }


  /** ofrecer pwa en android/pc */
  deferredPrompt: any;
  // showButton = false;
 
  @HostListener('window:beforeinstallprompt', ['$event'])

  onbeforeinstallprompt(e:any) {

    // alert('onBeforeInstallPrompt')
    // console.log(e);
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    const mostrarPwa = JSON.parse(localStorage.getItem('msg-pwa')!);

    if(!mostrarPwa){
      Swal.fire({
        title: 'Aplicación disponible',
        html: `¿Querés instalar la app en tu dispositivo?`,
        icon: 'info',
        confirmButtonColor: '#3085d6',
        denyButtonColor: '#d33',
        showCloseButton: true,
        showDenyButton: true,
        confirmButtonText: 'Instalar',
        denyButtonText: 'No volver a mostrar',

      }).then((result) => {
        if (result.isConfirmed) {
          this.addToHomeScreen();
        } else if (result.isDenied) {
          this.noMostrar();
        }
      })
    }
    
  }


  addToHomeScreen() {
    // hide our user interface that shows our A2HS button
    // this.showButton = false;
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult:any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        this.deferredPrompt = null;
      });
  }
  /** ofrecer pwa en android/pc */
  
}
