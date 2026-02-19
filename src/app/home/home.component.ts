import {
  Component,
  AfterViewInit,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  // -------------------------
  // Estado menú
  // -------------------------
  isMenuOpen = false;

  // -------------------------
  // Animación letras
  // -------------------------
  letras = ['B', 'r', 'a', 'v', 'o', 'B', 'y', 't', 'e', 's'];
  letrasAnimadas = Array(this.letras.length).fill('0');

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // -------------------------
  // SEO
  // -------------------------
  ngOnInit(): void {
    this.titleService.setTitle('Mi Portafolio - Desarrollo Web y Programación');

    this.metaService.updateTag({
      name: 'description',
      content:
        'Soy desarrollador especializado como Analista Programador. Aquí encontrarás mis habilidades, proyectos y mi pasión por la tecnología.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content:
        'desarrollador, analista programador, programación, Python, JavaScript, Angular, Django, desarrollo web, machine learning, proyectos'
    });
  }

  // -------------------------
  // Lifecycle
  // -------------------------
  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.iniciarAnimacion();
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    window.removeEventListener('scroll', this.onScroll);

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // -------------------------
  // Scroll handler
  // -------------------------
  onScroll = (): void => {
    const content = document.querySelector('.content');
    if (!content) return;

    if (window.scrollY > 50) content.classList.add('scrolled');
    else content.classList.remove('scrolled');
  };

  // -------------------------
  // Animación título
  // -------------------------
  iniciarAnimacion(): void {
    let index = 0;

    this.intervalId = setInterval(() => {
      if (index < this.letras.length) {
        this.letrasAnimadas[index] = this.letras[index];
        index++;
      } else {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }
    }, 200);
  }

  // -------------------------
  // Menú móvil
  // -------------------------
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  // -------------------------
  // Navegación
  // -------------------------
  inicio(): void {
    this.router.navigate(['/home']);
  }

  servicios(): void {
    this.router.navigate(['/servicios']);
  }

  proyectos(): void {
    this.router.navigate(['/proyectos']);
  }

  contacto(): void {
    this.router.navigate(['/contacto']);
  }

  blogs(): void {
    this.router.navigate(['/blogs']);
  }
}
