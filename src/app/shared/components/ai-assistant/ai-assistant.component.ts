import { Component, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAssistantService } from '../../../core/services/ai-assistant.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss'
})
export class AiAssistantComponent implements AfterViewChecked {
  public aiService = inject(AiAssistantService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  public userInput: string = '';
  public readonly MAX_CHARS = 300;

  public suggestedQuestions: string[] = [
    '¿Qué tecnologías domina Nicolás?',
    '¿Qué proyectos destacados tiene?',
    '¿Tiene proyectos con Inteligencia Artificial?',
    '¿Cómo puedo contactarlo?'
  ];

  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
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

    this.userInput = '';
    this.shouldScroll = true;
    this.aiService.sendMessage(text);
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
