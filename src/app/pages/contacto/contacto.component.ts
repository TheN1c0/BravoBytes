import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, NavbarComponent], 
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'] 
})
export class ContactoComponent {
  imagenlinkedin: string = 'icons/logolinkedin.jpg';
  imagengithub: string = 'icons/logogithub.png';

  constructor() {}
}
