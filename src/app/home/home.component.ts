import { Component, AfterViewInit, OnDestroy, Renderer2, Inject, PLATFORM_ID, ElementRef, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../layout/navbar/navbar.component';
import { FooterComponent } from '../layout/footer/footer.component';
import { register } from 'swiper/element/bundle';

register(); // Register Swiper web components

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],  // Asegúrate de incluir CommonModule aquí
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  
  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}
  ngOnInit() {
    this.titleService.setTitle('BravoBytes | Productos de Software & Soluciones Web');
    this.metaService.updateTag({
      name: 'description',
      content: 'Desarrollo de productos de software, herramientas de productividad y plataformas web escalables. Extensiones de navegador, soluciones con Inteligencia Artificial y aplicaciones listas para producción.'
    });
    this.metaService.updateTag({
      name: 'keywords',
      content: 'BravoBytes, desarrollo de software, productos digitales, extensiones navegador, MultiCopy, Angular, .NET, React, Inteligencia Artificial, soluciones web, Nicolás Bravo'
    });
  }
  ngAfterViewInit(): void {
    
    if (isPlatformBrowser(this.platformId)) {
      this.iniciarAnimacion();
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll);
    }
  }

  ngOnDestroy(): void {
    // Limpiamos el listener cuando el componente se destruye
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll);
    }
  }

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  // Función flecha para mantener el contexto adecuado de 'this'
  onScroll = (): void => {
    const content = document.querySelector('.content');
    if (content) {
      if (window.scrollY > 50) {
        content.classList.add('scrolled');
      } else {
        content.classList.remove('scrolled');
      }
    }
  }

  letras = ['B', 'r', 'a', 'v', 'o', 'B', 'y', 't', 'e', 's'];
  letrasAnimadas = Array(9).fill('0'); // Inicializa las letras con '0'

  iniciarAnimacion(): void {
    let index = 0;
    const intervalo = setInterval(() => {
      if (index < this.letras.length) {
        this.letrasAnimadas[index] = this.letras[index]; // Actualiza las letras
        index++;
      } else {
        clearInterval(intervalo);
      }
    }, 200); 
  }

  contacto(){
    this.router.navigate(['/contacto']);
  }
  proyectos(){
    this.router.navigate(['/proyectos']);
  }
  verProyecto(id: string) {
    this.router.navigate(['/proyectos'], { queryParams: { proyecto: id } });
  }

}
