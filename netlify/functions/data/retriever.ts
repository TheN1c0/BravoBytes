import { PROFILE_DATA } from './profile';
import { SKILLS_DATA } from './skills';
import { EDUCATION_DATA } from './education';
import { EXPERIENCE_DATA } from './experience';
import { PROJECTS_DATA, ALL_PROJECTS_SUMMARY } from './projects';
import { CONTACT_DATA } from './contact';

export interface KnowledgeSelectionResult {
  context: string;
  isOutOfScope: boolean;
  category: string;
}

/**
 * Deterministic, token-optimized factual knowledge selector.
 * Analyzes the user's message and returns only the strictly relevant slice of facts.
 */
export function getRelevantKnowledge(userMessage: string): KnowledgeSelectionResult {
  const query = userMessage.toLowerCase().trim();

  // 1. Detection of clearly out-of-scope topics (saves 100% LLM tokens)
  const isOutOfScope =
    /(\breceta\b|\bcocinar\b|\bpizza\b|\bclima\b|\bhoroscopo\b|\bfutbol\b|\bchiste\b|\bpoema\b|\bpolitica\b)/i.test(query);

  if (isOutOfScope) {
    return {
      context: '',
      isOutOfScope: true,
      category: 'out_of_scope',
    };
  }

  const sections: string[] = [];

  // 2. Specific Project Queries
  const mentionsNixLang = /\b(nixlang|nix|edtech)\b/i.test(query);
  const mentionsSmartEnglish = /\b(smart english|english notes|apuntes|ia en ingles|audio)\b/i.test(query);
  const mentionsBravoBytes = /\b(bravobytes|portfolio|portafolio|asistente|bravobot)\b/i.test(query);
  const mentionsGeneralProjects = /\b(proyectos?|desarrollos?|aplicaciones|apps)\b/i.test(query);

  if (mentionsNixLang) {
    sections.push(PROJECTS_DATA.nixlang);
  }
  if (mentionsSmartEnglish) {
    sections.push(PROJECTS_DATA.smartEnglishNotes);
  }
  if (mentionsBravoBytes) {
    sections.push(PROJECTS_DATA.bravoBytes);
  }
  if (mentionsGeneralProjects && !mentionsNixLang && !mentionsSmartEnglish && !mentionsBravoBytes) {
    sections.push(ALL_PROJECTS_SUMMARY);
  }

  // 3. Contact & Location & Privacy Queries
  const mentionsContact = /\b(contacto|contactar|email|correo|linkedin|github|telefono|numero|celular|direccion|donde vive|donde esta|ubicacion|residencia|rut)\b/i.test(query);
  if (mentionsContact) {
    sections.push(CONTACT_DATA);
  }

  // 4. Education & Certifications
  const mentionsEducation = /\b(estudio|estudió|estudios|universidad|instituto|duoc|titulado|titulo|carrera|certificaci[oó]n|certificaciones|azure fundamentals)\b/i.test(query);
  if (mentionsEducation) {
    sections.push(EDUCATION_DATA);
  }

  // 5. Experience & Work History (including Jumbo)
  const mentionsExperience = /\b(experiencia|trabajo|trabajó|empleo|laboral|trayectoria|jumbo|cajero|empresas?|cliente)\b/i.test(query);
  if (mentionsExperience) {
    sections.push(EXPERIENCE_DATA);
  }

  // 6. Skills, Languages, Tools & Tech Stack
  const mentionsSkills = /\b(tecnolog[ií]as?|skills?|lenguajes?|herramientas?|stack|conocimientos?|frontend|backend|frameworks?|angular|react|net|c#|python|django|node|docker|aws|linux|sql|postgres|supabase|java|excel|power bi|github actions)\b/i.test(query);
  if (mentionsSkills) {
    sections.push(SKILLS_DATA);
  }

  // 7. Evaluative & Hypothetical Questions (e.g. ¿puede?, ¿es capaz?, ¿podría?, ¿está preparado?)
  const isEvaluative = /\b(puede|es capaz|podr[ií]a|est[aá] preparado|tiene capacidad|capaz de|podr[aá]|sabr[ií]a)\b/i.test(query);
  if (isEvaluative) {
    if (!sections.includes(SKILLS_DATA)) {
      sections.push(SKILLS_DATA);
    }
    if (!sections.includes(EXPERIENCE_DATA)) {
      sections.push(EXPERIENCE_DATA);
    }

    // Specific evaluative domains
    if (/\b(observabilidad|logging|monitoreo|metrics)\b/i.test(query) && !sections.includes(PROJECTS_DATA.bravoBytes)) {
      sections.push(PROJECTS_DATA.bravoBytes);
    }
    if (/\b(bancari[oa]|fintech|banca|financier[oa])\b/i.test(query)) {
      sections.push(`INFORMACIÓN ESPECÍFICA DE DOMINIO:
- No existe experiencia laboral previa registrada en el sector bancario o financiero.
- Cuenta con sólidas bases técnicas en backend (.NET, Node.js, Python), APIs RESTful, bases de datos SQL y arquitectura cloud que le permitirían abordar proyectos complejos.`);
    }
  }

  // 8. Specific entity checks (e.g. ¿Trabajó en Microsoft?)
  if (/\b(microsoft|google|amazon|meta)\b/i.test(query)) {
    sections.push(`INFORMACIÓN DE EMPRESAS Y CERTIFICACIONES:
- No se tiene registrada experiencia laboral de Nicolás en Microsoft u otras big tech.
- Sí cuenta con la certificación oficial "Microsoft Certified: Azure Fundamentals".`);
  }

  // 9. Default Fallback for generic profile questions (e.g. "¿Quién es Nicolás?", "Resumen")
  if (sections.length === 0) {
    sections.push(PROFILE_DATA);
    sections.push(SKILLS_DATA);
  }

  // Deduplicate and assemble minimal context string
  const combinedContext = Array.from(new Set(sections)).join('\n\n');

  return {
    context: combinedContext,
    isOutOfScope: false,
    category: isEvaluative ? 'evaluation' : 'factual',
  };
}
