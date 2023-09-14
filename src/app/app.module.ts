import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';

import { CommonModule, registerLocaleData } from '@angular/common';

// momentjs
import * as moment from 'moment';
moment.locale('es')
// momentjs

import { HomeComponent } from './public/home/home.component';
import { MonedaPipePipe } from './public/pipes/moneda-pipe.pipe';
import { FormsModule } from '@angular/forms';

import localeEs from '@angular/common/locales/es-AR';
registerLocaleData(localeEs)
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MonedaPipePipe
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [ { provide:LOCALE_ID,useValue: 'es-ar' } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
