import { Component, AfterViewInit, OnDestroy, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    // Verificamos si estamos en un entorno de navegador
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
    }, 200); // Cambiar la letra cada 200ms
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

}
