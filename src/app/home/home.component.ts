import { Component, AfterViewInit, OnDestroy, Renderer2, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],  // Asegúrate de incluir CommonModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  
  isMenuOpen = false;
  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}
  ngOnInit() {
    this.titleService.setTitle('Mi Portafolio - Desarrollo Web y Programación');
    this.metaService.updateTag({
      name: 'description',
      content: 'Soy desarrollador especializado como Analista Programador. En mi página web encontrarás contenido sobre mis habilidades, proyectos y mi pasión por la tecnología.'
    });
    this.metaService.updateTag({
      name: 'keywords',
      content: 'desarrollador, analista programador, programación, Python, JavaScript, Angular, Django, desarrollo web, machine learning, proyectos, tecnología'
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
    this.router.navigate(['/home']);
  }


}
