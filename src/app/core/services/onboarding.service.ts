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
  private readonly MULTICOPY_NEVER_SHOW_KEY = 'bravobytes_multicopy_never_show';
  public readonly MULTICOPY_EDGE_URL = 'https://microsoftedge.microsoft.com/addons/detail/multicopy-excel-form-au/mgfofggplgekkejigmchemfhofbpncji';

  private isBrowser: boolean;
  private sessionDismissed = false;

  readonly steps: OnboardingStep[] = [
    {
      id: 'projects',
      targetSelector: '[data-onboarding="projects"], [data-onboarding="projects-hero"]',
      title: 'Productos & Desarrollos',
      description: 'Conoce las herramientas de software, extensiones y aplicaciones funcionales creadas por BravoBytes.',
      icon: '🚀',
      badgeText: 'Paso 1 de 2',
      preferredPosition: 'bottom'
    },
    {
      id: 'ai-assistant',
      targetSelector: '[data-onboarding="ai-assistant"]',
      title: 'BravoBot AI Assistant',
      description: 'Pregúntale a la IA sobre las soluciones desarrolladas, capacidades técnicas o cómo podemos colaborar.',
      icon: '🤖',
      badgeText: 'Paso 2 de 2',
      preferredPosition: 'top'
    }
  ];

  readonly isActive = signal<boolean>(false);
  readonly currentStepIndex = signal<number>(0);
  readonly showMultiCopyRecommendation = signal<boolean>(false);

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
  initAutoStart(delayMs: number = 1400): void {
    if (!this.isBrowser) return;

    try {
      const hasCompleted = localStorage.getItem(this.STORAGE_KEY);
      const neverShow = localStorage.getItem(this.MULTICOPY_NEVER_SHOW_KEY) === 'true';

      if (!hasCompleted) {
        setTimeout(() => {
          // Solo iniciamos automáticamente si no se ha marcado como completado
          if (localStorage.getItem(this.STORAGE_KEY) !== 'true') {
            this.startTour();
          }
        }, delayMs);
      } else if (!neverShow && !this.sessionDismissed) {
        // Si ya completó el tour previamente pero solo cerró con X (no permanente),
        // mostramos la recomendación con un retardo amigable
        setTimeout(() => {
          if (!this.sessionDismissed && !this.isActive()) {
            this.showMultiCopyRecommendation.set(true);
          }
        }, delayMs + 600);
      }
    } catch {
      // Ignorar errores de acceso a localStorage en entornos restrictivos
    }
  }

  /**
   * Inicia el tour desde el primer paso
   */
  startTour(): void {
    this.showMultiCopyRecommendation.set(false);
    this.currentStepIndex.set(0);
    this.isActive.set(true);
  }

  /**
   * Reinicia manualmente el tour (utilizado por el botón '?')
   */
  restartTour(): void {
    this.showMultiCopyRecommendation.set(false);
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
   * Finaliza el tour y activa la ventana de recomendación
   */
  completeTour(): void {
    this.isActive.set(false);
    this.saveCompletion();
    this.triggerMultiCopyRecommendation();
  }

  /**
   * Omite o cierra el tour y activa la ventana de recomendación
   */
  skipTour(): void {
    this.isActive.set(false);
    this.saveCompletion();
    this.triggerMultiCopyRecommendation();
  }

  /**
   * Dispara suavemente la ventana de recomendación si no ha sido descartada permanentemente
   */
  private triggerMultiCopyRecommendation(delayMs: number = 380): void {
    if (!this.isBrowser) return;

    try {
      const neverShow = localStorage.getItem(this.MULTICOPY_NEVER_SHOW_KEY) === 'true';
      if (!neverShow && !this.sessionDismissed) {
        setTimeout(() => {
          if (!this.sessionDismissed && !this.isActive()) {
            this.showMultiCopyRecommendation.set(true);
          }
        }, delayMs);
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Cierra temporalmente la ventana de recomendación al pulsar 'X'.
   * Se volverá a mostrar la próxima vez que el usuario visite la página.
   */
  closeRecommendationTemporarily(): void {
    this.sessionDismissed = true;
    this.showMultiCopyRecommendation.set(false);
  }

  /**
   * Cierra permanentemente la ventana de recomendación al pulsar 'No volver a mostrar'.
   * No se volverá a mostrar más.
   */
  dismissRecommendationPermanently(): void {
    this.sessionDismissed = true;
    this.showMultiCopyRecommendation.set(false);
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.MULTICOPY_NEVER_SHOW_KEY, 'true');
      } catch {
        // Safe fallback
      }
    }
  }

  /**
   * Abre la URL oficial de la extensión MultiCopy en Microsoft Edge Add-ons
   */
  openMultiCopyStore(): void {
    if (this.isBrowser) {
      window.open(this.MULTICOPY_EDGE_URL, '_blank', 'noopener,noreferrer');
    }
    // Cerramos temporalmente tras abrir para permitir continuar navegando
    this.sessionDismissed = true;
    this.showMultiCopyRecommendation.set(false);
  }

  /**
   * Guarda el estado completado del onboarding en localStorage
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
