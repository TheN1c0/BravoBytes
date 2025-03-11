import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatExpansionModule],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
})
export class ProyectosComponent {
  isMenuOpen = false;
  imagen1: string = 'proyectosimg/inicio.png'; 

  listaProyectos: any[] = []; 

  constructor(private router: Router) {
    this.inicializarListaProyectos(); 
  }

  
  inicializarListaProyectos() {
    this.listaProyectos = [
      {
        titulo: 'Sistema de Administración de Inventario (Stock Master)',
        contenido: [
          {
            descripcion:
              'Stock Master es un sistema de gestión de inventario diseñado para optimizar el control de productos. Cuenta con autenticación mediante contraseña, distintos tipos de usuario y recuperación de credenciales, garantizando seguridad y accesibilidad para los administradores.',
            imagen: this.imagen1, 
          },
          {
            descripcion: 'Arquitectura Cliente-Servidor: El sistema está compuesto por dos aplicaciones, una para el cliente (Frontend) y otra como servidor API (Backend). Esto permite administrar productos desde cualquier ubicación sin consumir espacio en disco ni requerir copias de seguridad manuales, ya que toda la información se almacena en el servidor. Además, es posible actualizar la interfaz o modificar el inventario sin interrumpir el funcionamiento del otro componente.',
            imagen: 'proyectosimg/codigo_server.png',
          },
          {
            descripcion: 'El sistema proporciona al administrador herramientas avanzadas para la gestión de inventario. Permite editar las características de cualquier producto, agregar o reducir stock según sea necesario y administrar los permisos de usuario. Además, es posible crear nuevos roles personalizados según los requerimientos del negocio.',
            imagen: 'proyectosimg/editar_ctrl_stock_admin.png',
          },
          {
            descripcion: 'El sistema también permite la gestión de pedidos, actualizando automáticamente el stock según si los productos son enviados o recibidos. Como futuras mejoras, se plantea la implementación de monitoreo de inventario, estadísticas de productos más consumidos, cálculo de ganancias y más. Este sistema ha sido desarrollado utilizando Django, un framework basado en Python.',
            imagen: 'proyectosimg/pedido_ctrl_stock_admin_2.png',
          },          
        ],
      },
    ];
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  contacto() {
    this.router.navigate(['/contacto']);
  }

  blogs() {
    this.router.navigate(['/blogs']);
  }

  proyectos() {
    this.router.navigate(['/proyectos']);
  }

  servicios() {
    this.router.navigate(['/servicios']);
  }

  inicio() {
    this.router.navigate(['/']);
  }

  expandedIndex: number = -1;

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? -1 : index;
  }
}