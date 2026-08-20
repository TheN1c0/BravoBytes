import { 
  Component, 
  OnInit, 
  OnDestroy, 
  Inject, 
  PLATFORM_ID, 
  HostListener, 
  effect, 
  signal, 
  ElementRef, 
  ViewChild 
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OnboardingService, OnboardingStep } from '../../../core/services/onboarding.service';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

interface CardPosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit, OnDestroy {
  @ViewChild('cardElement') cardElement?: ElementRef<HTMLElement>;

  private isBrowser: boolean;
  private resizeObserver?: ResizeObserver;
  private animationFrameId?: number;

  readonly targetRect = signal<TargetRect | null>(null);
  readonly cardPosition = signal<CardPosition>({});
  readonly arrowDirection = signal<'up' | 'down' | 'left' | 'right'>('up');
  readonly isTargetVisible = signal<boolean>(false);

  constructor(
    public onboardingService: OnboardingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Reaccionar a cambios en isActive o currentStepIndex en entorno cliente
    effect(() => {
      const active = this.onboardingService.isActive();
      const step = this.onboardingService.currentStep();
      
      if (this.isBrowser && active && step) {
        // Permitir un frame de renderizado antes de calcular coordenadas
        setTimeout(() => this.updateTargetPosition(), 60);
      }
    });
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.onboardingService.initAutoStart(1400);

      window.addEventListener('resize', this.onWindowChange, { passive: true });
      window.addEventListener('scroll', this.onWindowChange, { passive: true });
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('resize', this.onWindowChange);
      window.removeEventListener('scroll', this.onWindowChange);
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  }

  @HostListener('window:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    if (this.onboardingService.isActive()) {
      event.preventDefault();
      this.onboardingService.skipTour();
    }
  }

  private onWindowChange = (): void => {
    if (!this.onboardingService.isActive()) return;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(() => {
      this.updateTargetPosition();
    });
  };

  /**
   * Comprueba si un elemento está realmente visible en el viewport
   */
  private isElementVisible(el: HTMLElement): boolean {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }

    // Si está dentro del menú hamburguesa y el menú está cerrado, no está visible
    const menuContainer = el.closest('.menu-pc');
    if (menuContainer && !menuContainer.classList.contains('open')) {
      return false;
    }

    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  /**
   * Encuentra el elemento destino y calcula las posiciones exactas de la tarjeta y la flecha
   */
  updateTargetPosition(): void {
    if (!this.isBrowser) return;

    const step = this.onboardingService.currentStep();
    if (!step) return;

    // Buscar elementos que cumplan con los selectores del paso y estén visibles
    const selectors = step.targetSelector.split(',').map(s => s.trim());
    let targetEl: HTMLElement | null = null;

    for (const selector of selectors) {
      const el = document.querySelector<HTMLElement>(selector);
      if (el && this.isElementVisible(el)) {
        targetEl = el;
        break;
      }
    }

    // Si no se encuentra un elemento específico visible, intentar encontrar el primero en el DOM
    if (!targetEl) {
      targetEl = document.querySelector<HTMLElement>(selectors[0]);
    }

    if (targetEl && this.isElementVisible(targetEl)) {
      // Hacer scroll suave si está fuera del viewport visible
      const rect = targetEl.getBoundingClientRect();
      const inViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );

      if (!inViewport && rect.height > 0) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Obtener coordenadas actualizadas relativas al viewport para position: fixed
      const updatedRect = targetEl.getBoundingClientRect();

      this.targetRect.set({
        top: updatedRect.top,
        left: updatedRect.left,
        width: updatedRect.width,
        height: updatedRect.height,
        bottom: updatedRect.bottom,
        right: updatedRect.right
      });

      this.isTargetVisible.set(true);
      this.calculateCardPosition(updatedRect, step);
    } else {
      // Posicionamiento de fallback centrado si no se encuentra el elemento visible
      this.targetRect.set(null);
      this.isTargetVisible.set(false);
      this.cardPosition.set({
        top: '50%',
        left: '16px',
        right: '16px',
        transform: 'translateY(-50%)'
      });
      this.arrowDirection.set('up');
    }
  }

  /**
   * Calcula la posición óptima de la tarjeta y la dirección de la flecha
   */
  private calculateCardPosition(targetRect: DOMRect, step: OnboardingStep): void {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 768;
    const cardWidth = Math.min(360, viewportWidth - 32);

    if (step.id === 'ai-assistant') {
      // BravoBot está en la esquina inferior derecha
      // Posicionamos la tarjeta arriba del botón flotante
      const bottomOffset = viewportHeight - targetRect.top + 16;

      if (isMobile) {
        this.cardPosition.set({
          bottom: `${bottomOffset}px`,
          left: '16px',
          right: '16px'
        });
      } else {
        const rightOffset = Math.max(16, viewportWidth - targetRect.right);
        this.cardPosition.set({
          bottom: `${bottomOffset}px`,
          right: `${rightOffset}px`,
          left: 'auto'
        });
      }
      this.arrowDirection.set('down');
      return;
    }

    if (step.id === 'projects') {
      // Proyectos está en la barra superior o en el hero
      // Posicionamos la tarjeta debajo del elemento objetivo
      const topOffset = targetRect.bottom + 16;
      
      if (isMobile) {
        this.cardPosition.set({
          top: `${Math.min(topOffset, viewportHeight - 270)}px`,
          left: '16px',
          right: '16px'
        });
      } else {
        // En desktop centramos la tarjeta respecto al elemento o la ajustamos al viewport
        const targetCenterX = targetRect.left + targetRect.width / 2;
        let leftPos = targetCenterX - cardWidth / 2;

        // Limitar dentro del viewport
        if (leftPos < 16) leftPos = 16;
        if (leftPos + cardWidth > viewportWidth - 16) {
          leftPos = viewportWidth - cardWidth - 16;
        }

        this.cardPosition.set({
          top: `${topOffset}px`,
          left: `${leftPos}px`,
          right: 'auto'
        });
      }
      this.arrowDirection.set('up');
      return;
    }

    // Fallback estándar
    this.cardPosition.set({
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    });
    this.arrowDirection.set('up');
  }

  onRestartTour(): void {
    this.onboardingService.restartTour();
  }

  onNext(): void {
    this.onboardingService.nextStep();
  }

  onPrev(): void {
    this.onboardingService.prevStep();
  }

  onSkip(): void {
    this.onboardingService.skipTour();
  }
}
