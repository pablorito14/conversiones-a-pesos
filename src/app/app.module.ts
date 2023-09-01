import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';

import { CommonModule } from '@angular/common';
// momentjs
import * as moment from 'moment';
import { HomeComponent } from './public/home/home.component';
import { MonedaPipePipe } from './public/pipes/moneda-pipe.pipe';
import { FormsModule } from '@angular/forms';
moment.locale('es')
// momentjs
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
