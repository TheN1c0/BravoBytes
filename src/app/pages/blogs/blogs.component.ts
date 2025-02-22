import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule],  //
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss']
})
  



export class BlogsComponent {
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

