import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { ConfigComponent } from './public/config/config.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'config',
    component: ConfigComponent
  },
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
