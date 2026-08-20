import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AiAssistantComponent } from './shared/components/ai-assistant/ai-assistant.component';
import { OnboardingComponent } from './shared/components/onboarding/onboarding.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AiAssistantComponent, OnboardingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'BravoBytes';
}

