import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { NavbarComponent } from '../../layout/navbar/navbar.component';

export interface Proyecto {
  titulo: string;
  descripcionCorta: string; // Used in the card
  descripcionLarga: string; // Used in the modal
  imagenCard: string;
  imagenDetalle: string[]; // List of images for the modal
  caracteristicas: string[]; // Bullet points for the modal
  tecnologias: string[]; // E.g., ['Python', 'React', 'AWS']
  linkSitio?: string;
}

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, NavbarComponent],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
})
export class ProyectosComponent {
  // Removed menu attribute
  listaProyectos: Proyecto[] = []; 
  proyectoSeleccionado: Proyecto | null = null;
  imagen1: string = 'proyectosimg/inicio.png';

  constructor(private router: Router) {
    this.inicializarListaProyectos(); 
  }

  inicializarListaProyectos() {
    this.listaProyectos = [
      {
        titulo: 'Sistema de Administración de Inventario (Stock Master)',
        descripcionCorta: 'Sistema de gestión de inventario para optimizar el control de productos con autenticación y roles.',
        descripcionLarga: 'Stock Master es un sistema integral de gestión de inventario. Está compuesto por una arquitectura Cliente-Servidor (Frontend y Backend API) que permite administrar productos desde cualquier ubicación sin consumir espacio en disco local. Proporciona herramientas avanzadas para editar características, gestionar stock, procesar pedidos y administrar permisos de usuario de forma segura.',
        imagenCard: this.imagen1,
        imagenDetalle: [
          this.imagen1,
          'proyectosimg/codigo_server.png',
          'proyectosimg/editar_ctrl_stock_admin.png',
          'proyectosimg/pedido_ctrl_stock_admin_2.png'
        ],
        caracteristicas: [
          'Autenticación mediante contraseña y recuperación de credenciales',
          'Arquitectura Cliente-Servidor independiente',
          'Gestión completa de CRUD para inventario',
          'Actualización automática de stock al procesar envíos y recepciones',
          'Roles de usuario personalizables y permisos granulares'
        ],
        tecnologias: ['Python', 'Django', 'SQLite', 'HTML/CSS/JS'], // Reemplaza con las que uses realmente
        // linkSitio: 'https://tu-sitio.com' si lo tuvieras
      },
    ];
  }

  abrirModal(proyecto: Proyecto) {
    this.proyectoSeleccionado = proyecto;
    // Prevenir scroll en el body cuando el modal está abierto
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  cerrarModal() {
    this.proyectoSeleccionado = null;
    // Restaurar scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }



}