import { Pipe, PipeTransform, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { marked, RendererObject } from 'marked';
import DOMPurify from 'dompurify';

const customRenderer: RendererObject = {
  link(token: any) {
    const href = token.href || '#';
    let text = token.text || href;

    // Clean up raw URLs to be human-readable labels
    if (text.startsWith('http://') || text.startsWith('https://')) {
      if (text.includes('linkedin.com')) {
        text = 'LinkedIn (Nicolás Bravo)';
      } else if (text.includes('github.com')) {
        text = 'GitHub (TheN1c0)';
      } else if (text.includes('youtube.com') || text.includes('youtu.be')) {
        text = 'Ver en YouTube';
      } else {
        try {
          const u = new URL(text);
          text = u.hostname.replace('www.', '');
        } catch {
          text = 'Enlace externo';
        }
      }
    }

    const titleAttr = token.title ? ` title="${token.title}"` : '';
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="ai-chat-link"${titleAttr}><span class="link-text">${text}</span><span class="link-icon">↗</span></a>`;
  }
};

marked.use({ renderer: customRenderer });

@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  private platformId = inject(PLATFORM_ID);

  transform(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') {
      return '';
    }

    try {
      // 1. Convert markdown to HTML synchronously
      const rawHtml = marked.parse(value, {
        async: false,
        gfm: true,
        breaks: true,
      }) as string;

      // 2. Client-side sanitization with DOMPurify (Defense-in-depth)
      if (isPlatformBrowser(this.platformId)) {
        return DOMPurify.sanitize(rawHtml, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'b', 'i', 'u',
            'ul', 'ol', 'li', 'code', 'pre', 'a',
            'h1', 'h2', 'h3', 'h4', 'blockquote', 'hr', 'span'
          ],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'title'],
        });
      }

      // 3. Server-side (SSR): return parsed HTML string (sanitized natively by Angular innerHTML binding)
      return rawHtml;
    } catch {
      return value;
    }
  }
}
