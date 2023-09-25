import { Component, OnInit } from '@angular/core';
import { Configuracion } from '../interfaces/configuracion.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  loading:boolean = true;
  
  constructor(private router:Router){}

  config!:Configuracion;
  ngOnInit(): void {
    
    this.config = JSON.parse(localStorage.getItem('config')!);
    setTimeout(() => {
      this.loading = false;
    }, 1500);
  }

  guardarConfiguracion(){
    const strConfig = JSON.stringify(this.config);
    localStorage.setItem('config',strConfig);
    this.router.navigateByUrl('/');
  }
}
