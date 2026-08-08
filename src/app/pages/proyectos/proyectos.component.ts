import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { NavbarComponent } from '../../layout/navbar/navbar.component';

export interface Proyecto {
  titulo: string;
  descripcionCorta: string; // Used in the card
  descripcionLarga: string; // Used in the modal
  imagenCard: string;
  imagenDetalle: string[]; // List of images for the modal
  caracteristicas: string[]; // Bullet points for the modal
  tecnologias: { nombre: string; icono: string }[]; // E.g., {nombre: 'Python', icono: 'url...'}
  linkSitio?: string;
  videoUrl?: string; // YouTube embed URL
}

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, NavbarComponent],
  templateUrl: './proyectos.component.html',
  styleUrl: './proyectos.component.scss',
})
export class ProyectosComponent implements OnInit {
  // Removed menu attribute
  listaProyectos: Proyecto[] = []; 
  proyectoSeleccionado: Proyecto | null = null;
  imagen1: string = 'proyectosimg/inicio.png';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.inicializarListaProyectos(); 
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['proyecto'] === 'smart-english-notes') {
        const found = this.listaProyectos.find(p => p.titulo.toLowerCase().includes('english'));
        if (found) {
          this.abrirModal(found);
        }
      }
    });
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
        tecnologias: [
          { nombre: 'Python', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
          { nombre: 'Django', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg' },
          { nombre: 'SQLite', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg' },
          { nombre: 'HTML5', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
          { nombre: 'CSS3', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
          { nombre: 'JavaScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' }
        ],
        // linkSitio: 'https://tu-sitio.com' si lo tuvieras
      },
      {
        titulo: 'Smart English Notes',
        descripcionCorta: 'Aplicación web progresiva (PWA) con IA para registrar y estudiar vocabulario, expresiones y pronunciación en inglés.',
        descripcionLarga: 'Smart English Notes es una aplicación web progresiva (PWA) diseñada para estudiantes de inglés. Permite registrar, organizar y estudiar vocabulario, expresiones y phrasal verbs de forma inteligente. Utiliza la API de Gemini (gemini-flash-latest) para la generación automática de fichas de estudio enriquecidas con transcripción fonética (IPA), significados y consejos de listening, y la API de ElevenLabs para reproducir pronunciaciones hiperrealistas con caché de audio local.',
        imagenCard: 'https://img.youtube.com/vi/f96aH99a9S0/maxresdefault.jpg',
        imagenDetalle: [],
        videoUrl: 'https://www.youtube.com/embed/f96aH99a9S0',
        caracteristicas: [
          'Generación automática de fichas de estudio con Inteligencia Artificial (Gemini AI)',
          'Pronunciación por síntesis de voz hiperrealista con ElevenLabs y caché local',
          'Soporte sin conexión y acceso rápido como Aplicación Web Progresiva (PWA)',
          'Autenticación segura JWT y límite de peticiones (Rate-limiting) en backend Node.js',
          'Base de datos SQLite optimizada y scripts en Python para migración de datos'
        ],
        tecnologias: [
          { nombre: 'HTML5', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
          { nombre: 'CSS3', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
          { nombre: 'JavaScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
          { nombre: 'PWA', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pwa/pwa-original.svg' },
          { nombre: 'Node.js', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
          { nombre: 'Express', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg' },
          { nombre: 'SQLite', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg' },
          { nombre: 'Python', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
          { nombre: 'Gemini AI', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg' },
          { nombre: 'ElevenLabs API', icono: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EAE0CF"><rect x="3" y="9" width="3" height="6" rx="1.5"/><rect x="8" y="5" width="3" height="14" rx="1.5"/><rect x="13" y="7" width="3" height="10" rx="1.5"/><rect x="18" y="10" width="3" height="4" rx="1.5"/></svg>' }
        ]
      },
      {
        titulo: 'Go Gestión de Recursos Humanos (GGRRHH)',
        descripcionCorta: 'Plataforma web para gestionar y automatizar procesos de Recursos Humanos en medianas empresas, centralizando información de manera escalable.',
        descripcionLarga: 'GGRRHH resuelve el problema de gestionar RRHH con procesos manuales o herramientas dispersas que generan errores y pérdida de tiempo. Es un sistema web que automatiza y organiza la gestión de personal, facilitando la administración y la toma de decisiones.',
        imagenCard: 'imgrrhh.png',
        imagenDetalle: [
          'imgrrhh.png'
        ],
        caracteristicas: [
          'Automatización en la gestión y organización del personal',
          'Administración centralizada de empleados',
          'Gestión en proceso de selección de postulantes',
          'Reportes detallados para la toma de decisiones',
          'En funcionamiento interno en servidor propio Linux'
        ],
        tecnologias: [
          { nombre: 'Django', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg' },
          { nombre: 'Angular', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg' },
          { nombre: 'PostgreSQL', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
          { nombre: 'Docker', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
          { nombre: 'Python', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
          { nombre: 'HTML5', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
          { nombre: 'CSS3', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
          { nombre: 'JavaScript', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
          { nombre: 'Linux', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg' }
        ]
      },
      {
        titulo: 'Agenda Social',
        descripcionCorta: 'Plataforma integral para gestionar casos sociales. Desarrollada con React y Node.js, alojada en un servidor propio con Linux Server y túneles Cloudflared.',
        descripcionLarga: 'Agenda Social es una potente solución para el registro, seguimiento y analítica de casos sociales. Su arquitectura consta de dos partes bien definidas: un Front-end interactivo creado con React, Vite y TailwindCSS que incorpora gráficos interactivos (Recharts, Chart.js); y un Back-end implementado en Node.js mediante Express con Prisma ORM y almacenamiento en PostgreSQL. Todo el sistema está alojado en un servidor propio utilizando Linux Server, y la comunicación con la web externa mediante túneles seguros gestionados por Cloudflare.',
        imagenCard: 'imgagso.png',
        imagenDetalle: [
          'imgagso.png'
        ],
        caracteristicas: [
          'Alojamiento en servidor propio utilizando infraestructura Linux Server',
          'Dashboard completo e interactivo con seguimiento de estadísticas',
          'Frontend altamente optimizado (Vite + React + TS)',
          'Seguridad rigurosa con autenticación JWT, cookies, y validación en express',
          'Soporte completo CRUD, administración de archivos e historial de casos',
          'Despliegue y tunelización segura en red'
        ],
        tecnologias: [
          { nombre: 'React', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
          { nombre: 'Vite', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vite/vite-original.svg' },
          { nombre: 'Node.js', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
          { nombre: 'Express', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg' },
          { nombre: 'Prisma', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg' },
          { nombre: 'PostgreSQL', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
          { nombre: 'TailwindCSS', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
          { nombre: 'Linux', icono: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg' }
        ],
        linkSitio: 'https://agendasocial.bravo-bytes.com/'
      }
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