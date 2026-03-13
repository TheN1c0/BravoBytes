import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isMenuOpen = false;

  constructor(private router: Router) {}

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
  inicio(){
    this.router.navigate(['/']);
  }
}
