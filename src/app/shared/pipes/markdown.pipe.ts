import { Pipe, PipeTransform, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
          ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        });
      }

      // 3. Server-side (SSR): return parsed HTML string (sanitized natively by Angular innerHTML binding)
      return rawHtml;
    } catch {
      return value;
    }
  }
}
