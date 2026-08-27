import { Component, inject, ElementRef, ViewChild, AfterViewChecked, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAssistantService } from '../../../core/services/ai-assistant.service';
import { TurnstileService } from '../../../core/services/turnstile.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss'
})
export class AiAssistantComponent implements OnInit, AfterViewChecked {
  public aiService = inject(AiAssistantService);
  private turnstileService = inject(TurnstileService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('turnstileContainer') private turnstileContainer?: ElementRef;

  public userInput: string = '';
  public readonly MAX_CHARS = 300;

  public suggestedQuestions: string[] = [
    '¿Qué productos ha desarrollado Nicolás?',
    '¿Cómo funciona la extensión MultiCopy?',
    '¿Qué proyectos tienen Inteligencia Artificial?',
    '¿Cómo puedo contactarlo?'
  ];

  private shouldScroll = false;
  private turnstileWidgetId: string | null = null;
  public turnstileToken: string = '';
  private isWidgetRendered = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.turnstileService.loadScript().catch(() => {
        // Safe silent catch if script fails to load or is blocked by ad-blocker
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }

    if (this.aiService.isOpen() && !this.isWidgetRendered && this.turnstileContainer && isPlatformBrowser(this.platformId)) {
      this.renderTurnstile();
    }
  }

  private renderTurnstile(): void {
    if (this.isWidgetRendered || !this.turnstileContainer) return;

    this.turnstileService.loadScript().then(() => {
      if (this.turnstileContainer && !this.isWidgetRendered) {
        const id = this.turnstileService.render(
          this.turnstileContainer.nativeElement,
          (token: string) => {
            this.turnstileToken = token;
          },
          () => {
            this.turnstileToken = '';
            this.turnstileService.reset(this.turnstileWidgetId);
          }
        );

        if (id) {
          this.turnstileWidgetId = id;
          this.isWidgetRendered = true;
        }
      }
    });
  }

  public toggle(): void {
    this.aiService.toggleChat();
    if (this.aiService.isOpen()) {
      this.shouldScroll = true;
    }
  }

  public close(): void {
    this.aiService.closeChat();
  }

  public handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitQuestion();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  public sendSuggested(question: string): void {
    this.userInput = question;
    this.submitQuestion();
  }

  public submitQuestion(): void {
    const text = this.userInput.trim();
    if (!text || this.aiService.isLoading() || this.aiService.remainingQuota() <= 0) {
      return;
    }

    const tokenToSend = this.turnstileToken;
    this.userInput = '';
    this.shouldScroll = true;

    // Send question with Turnstile token
    this.aiService.sendMessage(text, tokenToSend);

    // Reset Turnstile token & widget for the next query
    this.turnstileToken = '';
    if (this.turnstileWidgetId) {
      this.turnstileService.reset(this.turnstileWidgetId);
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {
      // ignore
    }
  }
}
