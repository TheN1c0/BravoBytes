import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface OnboardingStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  icon: string;
  badgeText?: string;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly STORAGE_KEY = 'bravobytes_onboarding_completed';
  private isBrowser: boolean;

  readonly steps: OnboardingStep[] = [
    {
      id: 'projects',
      targetSelector: '[data-onboarding="projects"], [data-onboarding="projects-hero"]',
      title: 'Mis Proyectos',
      description: 'Conoce los proyectos que he desarrollado.',
      icon: '📁',
      badgeText: 'Paso 1 de 2',
      preferredPosition: 'bottom'
    },
    {
      id: 'ai-assistant',
      targetSelector: '[data-onboarding="ai-assistant"]',
      title: 'BravoBot AI Assistant',
      description: 'También puedes preguntarle a mi asistente de IA sobre mi perfil, proyectos y tecnologías.',
      icon: '🤖',
      badgeText: 'Paso 2 de 2',
      preferredPosition: 'top'
    }
  ];

  readonly isActive = signal<boolean>(false);
  readonly currentStepIndex = signal<number>(0);

  readonly currentStep = computed(() => {
    const idx = this.currentStepIndex();
    return this.steps[idx] || null;
  });

  readonly totalSteps = computed(() => this.steps.length);
  readonly isLastStep = computed(() => this.currentStepIndex() === this.steps.length - 1);
  readonly isFirstStep = computed(() => this.currentStepIndex() === 0);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Inicializa la comprobación automática para la primera visita
   */
  initAutoStart(delayMs: number = 1200): void {
    if (!this.isBrowser) return;

    try {
      const hasCompleted = localStorage.getItem(this.STORAGE_KEY);
      if (!hasCompleted) {
        setTimeout(() => {
          // Solo iniciamos automáticamente si no se ha marcado como completado
          if (localStorage.getItem(this.STORAGE_KEY) !== 'true') {
            this.startTour();
          }
        }, delayMs);
      }
    } catch {
      // Ignorar errores de acceso a localStorage en entornos restrictivos
    }
  }

  /**
   * Inicia el tour desde el primer paso
   */
  startTour(): void {
    this.currentStepIndex.set(0);
    this.isActive.set(true);
  }

  /**
   * Reinicia manualmente el tour (utilizado por el botón '?')
   */
  restartTour(): void {
    this.currentStepIndex.set(0);
    this.isActive.set(true);
  }

  /**
   * Avanza al siguiente paso o finaliza si es el último
   */
  nextStep(): void {
    if (this.isLastStep()) {
      this.completeTour();
    } else {
      this.currentStepIndex.update(idx => idx + 1);
    }
  }

  /**
   * Retrocede al paso anterior
   */
  prevStep(): void {
    if (!this.isFirstStep()) {
      this.currentStepIndex.update(idx => idx - 1);
    }
  }

  /**
   * Finaliza el tour y guarda la persistencia
   */
  completeTour(): void {
    this.isActive.set(false);
    this.saveCompletion();
  }

  /**
   * Omite o cierra el tour y guarda la persistencia
   */
  skipTour(): void {
    this.isActive.set(false);
    this.saveCompletion();
  }

  /**
   * Guarda el estado completado en localStorage
   */
  private saveCompletion(): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.STORAGE_KEY, 'true');
      } catch {
        // Safe fallback
      }
    }
  }
}
