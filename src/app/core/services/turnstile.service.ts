import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TurnstileService {
  private platformId = inject(PLATFORM_ID);
  public readonly SITE_KEY = '0x4AAAAAAEU6S_UxhXUyb_bi';

  private isScriptLoaded = false;
  private scriptLoadingPromise: Promise<void> | null = null;

  /**
   * Loads Cloudflare Turnstile explicit script safely in browser only.
   */
  public loadScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (this.isScriptLoaded && window.turnstile) {
      return Promise.resolve();
    }

    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
      // Check if script already exists in document
      if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };

      script.onerror = (err) => {
        this.scriptLoadingPromise = null;
        console.warn('Could not load Cloudflare Turnstile script:', err);
        reject(err);
      };

      document.head.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Renders the Turnstile Managed widget in the specified DOM element.
   */
  public render(
    container: HTMLElement,
    onSuccess: (token: string) => void,
    onExpired?: () => void
  ): string | null {
    if (!isPlatformBrowser(this.platformId) || !window.turnstile) {
      return null;
    }

    try {
      return window.turnstile.render(container, {
        sitekey: this.SITE_KEY,
        theme: 'dark',
        size: 'flexible',
        callback: (token: string) => onSuccess(token),
        'expired-callback': () => {
          if (onExpired) onExpired();
        },
        'error-callback': () => {
          console.warn('Turnstile challenge encountered an error.');
        }
      });
    } catch (err) {
      console.warn('Turnstile render error:', err);
      return null;
    }
  }

  /**
   * Resets the Turnstile widget to acquire a fresh token.
   */
  public reset(widgetId?: string | null): void {
    if (!isPlatformBrowser(this.platformId) || !window.turnstile) {
      return;
    }

    try {
      if (widgetId) {
        window.turnstile.reset(widgetId);
      } else {
        window.turnstile.reset();
      }
    } catch (err) {
      console.warn('Turnstile reset error:', err);
    }
  }
}
