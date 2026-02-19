import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type ProyectoItem = {
  descripcion: string;
  imagen: string;
};

type Proyecto = {
  titulo: string;
  contenido: ProyectoItem[];
};

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss'],
})
export class ProyectosComponent {
  // -------------------------
  // Navbar / Menú móvil
  // -------------------------
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  // -------------------------
  // Navegación
  // -------------------------
  constructor(private router: Router) {
    this.inicializarListaProyectos();
  }

  inicio(): void {
    this.router.navigate(['/']);
    this.closeMenu();
  }

  servicios(): void {
    this.router.navigate(['/servicios']);
    this.closeMenu();
  }

  proyectos(): void {
    this.router.navigate(['/proyectos']);
    this.closeMenu();
  }

  contacto(): void {
    this.router.navigate(['/contacto']);
    this.closeMenu();
  }

  blogs(): void {
    this.router.navigate(['/blogs']);
    this.closeMenu();
  }

  // -------------------------
  // Proyectos / Expand
  // -------------------------
  expandedIndex: number = -1;

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? -1 : index;
  }

  listaProyectos: Proyecto[] = [];

  private inicializarListaProyectos(): void {
    this.listaProyectos = [
      {
        titulo: 'Sistema de Administración de Inventario (Stock Master)',
        contenido: [
          {
            descripcion:
              'Stock Master es un sistema de gestión de inventario diseñado para optimizar el control de productos. Cuenta con autenticación mediante contraseña, distintos tipos de usuario y recuperación de credenciales.',
            imagen: 'proyectosimg/inicio.png',
          },
          {
            descripcion:
              'Arquitectura Cliente-Servidor: dos aplicaciones (Frontend + API Backend) para administrar productos desde cualquier ubicación, centralizando la información en el servidor y permitiendo evolución independiente.',
            imagen: 'proyectosimg/codigo_server.png',
          },
          {
            descripcion:
              'Herramientas de administración: edición de productos, control de stock, permisos de usuario y creación de roles según requerimientos del negocio.',
            imagen: 'proyectosimg/editar_ctrl_stock_admin.png',
          },
          {
            descripcion:
              'Gestión de pedidos con actualización automática de stock. Futuras mejoras: monitoreo, estadísticas de consumo, cálculo de ganancias. Backend desarrollado con Django.',
            imagen: 'proyectosimg/pedido_ctrl_stock_admin_2.png',
          },
        ],
      },
    ];
  }
}
