import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule], // Aquí agregamos CommonModule
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'] // Cambié "styleUrl" a "styleUrls"
})
export class ContactoComponent {
  imagenlinkedin: string = 'icons/logolinkedin.jpg';
  imagengithub: string = 'icons/logogithub.png';
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
