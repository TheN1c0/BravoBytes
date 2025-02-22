import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'] 
})
export class ContactoComponent {
  imagenlinkedin: string = 'icons/logolinkedin.jpg';
  imagengithub: string = 'icons/logogithub.png';
  isMenuOpen = false;

  constructor(  
    private router: Router
  ) {}

toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}
contacto(){
  this.router.navigate(['/contacto']);
}
blogs(){
  this.router.navigate(['/blogs']);
}
proyectos(){
  this.router.navigate(['/proyectos']);
}
servicios(){
  this.router.navigate(['/servicios']);
}
inicio(){
  this.router.navigate(['/']);
}
}
