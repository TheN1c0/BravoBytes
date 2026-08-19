export const PROJECTS_DATA = {
  nixlang: `PROYECTO: NixLang (Plataforma EdTech de Inglés)
- Propósito: Plataforma para el aprendizaje interactivo del idioma inglés.
- Estado: En etapa final de desarrollo.
- Stack Backend: .NET, C#, ASP.NET Core, PostgreSQL (Npgsql), Entity Framework Core.
- Arquitectura Backend: Clean Architecture, Domain-Driven Design (DDD), patrón CQRS con MediatR, validaciones con FluentValidation.
- Stack Frontend: Angular, TypeScript.
- Infraestructura & Features: Contenedores Docker, APIs RESTful, sistema de autenticación, lecciones interactivas, seguimiento de progreso de alumnos, filtros y búsqueda avanzada.`,

  smartEnglishNotes: `PROYECTO: Smart English Notes (Gestor Inteligente de Apuntes)
- Propósito: Aplicación interactiva orientada al aprendizaje y gestión de apuntes de inglés.
- Integración de IA: Utiliza la API de Gemini para generar, analizar y obtener significados contextuales de vocabulario y gramática.
- Integración de Audio: Integra una API externa para generación de pronunciación y sonidos en tiempo real.
- Valor Técnico: Aplicación práctica y real de Inteligencia Artificial Generativa e integración de APIs externas.`,

  bravoBytes: `PROYECTO: BravoBytes (Portafolio Personal & AI Assistant)
- Propósito: Sitio web y portafolio profesional de Nicolás Bravo.
- Stack: Angular 18 SSR, TypeScript, Node.js (Express), Netlify Functions, OpenRouter, Google Gemini.
- Asistente Virtual (BravoBot AI):
  * Arquitectura serverless en Netlify Functions con API key y System Prompt 100% server-side.
  * Validación estricta de payloads, protección anti-bot (Cloudflare Turnstile preparado).
  * Control de cuotas y rate limiting serverless en memoria (sin Redis/Upstash en V1).
  * Observabilidad estructurada con requestId, registro de latencia y métricas de tokens sin almacenamiento de conversaciones.
  * Renderizado seguro de Markdown con sanitización DOMPurify.`
};

export const ALL_PROJECTS_SUMMARY = `PROYECTOS DESTACADOS:
1. NixLang: Plataforma EdTech de inglés en etapa final de desarrollo (.NET, C#, Angular, Clean Architecture, DDD, MediatR, PostgreSQL, Docker).
2. Smart English Notes: App interactiva de aprendizaje de inglés potenciada por IA generativa (Gemini) y APIs de audio.
3. BravoBytes: Portafolio personal en Angular 18 SSR con asistente virtual serverless en Netlify Functions y OpenRouter.`;
