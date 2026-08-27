import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../../layout/navbar/navbar.component';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, NavbarComponent], 
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'] 
})
export class ContactoComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  imagenlinkedin: string = 'icons/logolinkedin.jpg';
  imagengithub: string = 'icons/logogithub.png';

  ngOnInit(): void {
    this.titleService.setTitle('Contacto & Colaboración | BravoBytes');
    this.metaService.updateTag({
      name: 'description',
      content: 'Ponte en contacto con BravoBytes para proyectos de software, desarrollo de herramientas o consultoría técnica.'
    });
  }
}
