import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChatMessage, ChatApiRequest, ChatApiResponse } from '../models/ai-chat.model';


@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private readonly API_ENDPOINT = '/.netlify/functions/chat';
  private readonly DEFAULT_QUOTA = 6;
  private readonly SESSION_STORAGE_KEY = 'bravobytes_ai_session_id';
  private readonly QUOTA_STORAGE_KEY = 'bravobytes_ai_quota';

  // Reactive State using Angular Signals
  public isOpen = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public remainingQuota = signal<number>(this.DEFAULT_QUOTA);
  public messages = signal<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: '¡Hola! Soy el Asistente Virtual de BravoBytes. Pregúntame sobre el perfil profesional de Nicolás, sus proyectos, experiencia técnica o vías de contacto.',
      timestamp: new Date()
    }
  ]);

  private sessionId: string = '';

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSession();
    }
  }

  private initSession(): void {
    try {
      let storedSession = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!storedSession) {
        storedSession = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        sessionStorage.setItem(this.SESSION_STORAGE_KEY, storedSession);
      }
      this.sessionId = storedSession;

      const storedQuota = sessionStorage.getItem(this.QUOTA_STORAGE_KEY);
      if (storedQuota !== null) {
        this.remainingQuota.set(parseInt(storedQuota, 10));
      }
    } catch {
      this.sessionId = 'temp_' + Date.now();
    }
  }

  public toggleChat(): void {
    this.isOpen.update(open => !open);
  }

  public openChat(): void {
    this.isOpen.set(true);
  }

  public closeChat(): void {
    this.isOpen.set(false);
  }

  public async sendMessage(prompt: string, turnstileToken?: string): Promise<void> {
    const trimmed = prompt.trim();
    if (!trimmed || this.isLoading()) return;

    // Check client-side quota before sending
    if (this.remainingQuota() <= 0) {
      this.addMessage({
        id: 'quota-err-' + Date.now(),
        role: 'assistant',
        text: 'Has alcanzado el límite de consultas permitidas para esta sesión. Si deseas más información, por favor utiliza la sección de Contacto.',
        timestamp: new Date(),
        isError: true
      });
      return;
    }

    // 1. Append user message
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      text: trimmed,
      timestamp: new Date()
    };
    this.addMessage(userMsg);

    this.isLoading.set(true);

    const payload: ChatApiRequest = {
      message: trimmed,
      turnstileToken,
      sessionId: this.sessionId
    };

    try {
      this.http.post<ChatApiResponse>(this.API_ENDPOINT, payload).subscribe({
        next: (res) => {
          this.isLoading.set(false);

          if (res.remainingQuota !== undefined) {
            this.updateQuota(res.remainingQuota);
          } else {
            this.updateQuota(Math.max(0, this.remainingQuota() - 1));
          }

          if (res.answer) {
            this.addMessage({
              id: 'ai-' + Date.now(),
              role: 'assistant',
              text: res.answer,
              timestamp: new Date()
            });
          }
        },
        error: (err) => {
          this.isLoading.set(false);

          let errorText = 'Ocurrió un error al procesar tu consulta. Inténtalo de nuevo más tarde.';
          if (err.status === 429) {
            errorText = 'Has alcanzado el límite de consultas. Por favor espera unos momentos o usa la sección de contacto.';
            this.updateQuota(0);
          } else if (err.status === 403) {
            errorText = 'Verificación de seguridad fallida. Por favor recarga la página.';
          } else if (err.status === 400 && err.error?.message) {
            errorText = err.error.message;
          }

          this.addMessage({
            id: 'err-' + Date.now(),
            role: 'assistant',
            text: errorText,
            timestamp: new Date(),
            isError: true
          });
        }
      });
    } catch {
      this.isLoading.set(false);
      this.addMessage({
        id: 'fatal-' + Date.now(),
        role: 'assistant',
        text: 'No fue posible conectar con el asistente. Verifica tu conexión.',
        timestamp: new Date(),
        isError: true
      });
    }
  }

  private addMessage(message: ChatMessage): void {
    this.messages.update(list => [...list, message]);
  }

  private updateQuota(newQuota: number): void {
    this.remainingQuota.set(newQuota);
    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem(this.QUOTA_STORAGE_KEY, newQuota.toString());
      } catch {
        // ignore storage errors
      }
    }
  }
}
