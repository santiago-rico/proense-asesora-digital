import { describe, it, expect } from 'vitest';
import { InsuranceApplicationTemplate } from './InsuranceApplicationTemplate';
import {
  HOGAR_ASEGURABILIDAD_QUESTIONS,
  HOGAR_ASEGURABILIDAD_TITLE,
  HOGAR_ASEGURABILIDAD_DISCLAIMER,
  type HogarAsegurabilidadKey,
} from '../../data/hogarAsegurabilidad';
import {
  DECLARACION_ASESORIA_TITLE,
  DECLARACION_ASESORIA_INTRO,
  DECLARACION_ASESORIA_POINTS,
} from '../../data/declaracionAsesoria';

type TemplateData = Parameters<typeof InsuranceApplicationTemplate>[0]['data'];
type Answer = 'si' | 'no' | '';

function baseData(overrides: Partial<TemplateData> = {}): TemplateData {
  return {
    nombreCompleto: 'María Gómez',
    telefono: '+573001234567',
    email: 'maria.gomez@example.com',
    tipoSeguro: 'hogar',
    metodoPago: 'tarjeta_credito',
    periodicidadPago: 'mensual',
    numeroCedula: '1234567890',
    declaraRenta: 'si',
    aceptaTerminosYPolitica: true,
    aceptaDeclaracionAsesoria: true,
    ...overrides,
  };
}

function answers(answer: Answer, overrides: Partial<Record<HogarAsegurabilidadKey, Answer>> = {}) {
  return {
    ...Object.fromEntries(HOGAR_ASEGURABILIDAD_QUESTIONS.map(q => [q.key, answer])),
    ...overrides,
  } as Record<HogarAsegurabilidadKey, Answer>;
}

function render(data: TemplateData, isUserEmail: boolean, declaracionAceptadaEn?: Date): string {
  return InsuranceApplicationTemplate({ data, attachedFiles: {}, isUserEmail, isDarkMode: false, declaracionAceptadaEn });
}

/** Returns the rendered answer cell (opening tag + text) for each question, in order. */
function answerCells(html: string): { openTag: string; text: string }[] {
  return HOGAR_ASEGURABILIDAD_QUESTIONS.map((q, index) => {
    const start = html.indexOf(`${index + 1}. ${q.question}`);
    expect(start, `question ${index + 1} should be rendered`).toBeGreaterThan(-1);
    const row = html.slice(start, html.indexOf('</tr>', start));
    const cellOpen = row.lastIndexOf('<td');
    const openTagEnd = row.indexOf('>', cellOpen) + 1;
    return {
      openTag: row.slice(cellOpen, openTagEnd),
      text: row.slice(openTagEnd, row.lastIndexOf('</td>')).trim(),
    };
  });
}

const SI_ALERT_PATTERN = /El cliente respondió «Sí» a (\d+) preguntas? de la declaración de asegurabilidad/;

describe('InsuranceApplicationTemplate — hogar declaración de asegurabilidad', () => {
  describe.each([
    ['user', true],
    ['agent', false],
  ])('%s email', (_label, isUserEmail) => {
    it('renders the title, disclaimer and every full question with its number', () => {
      const html = render(baseData(answers('no')), isUserEmail);

      expect(html).toContain(HOGAR_ASEGURABILIDAD_TITLE);
      expect(html).toContain(HOGAR_ASEGURABILIDAD_DISCLAIMER);
      HOGAR_ASEGURABILIDAD_QUESTIONS.forEach((q, index) => {
        expect(html).toContain(`${index + 1}. ${q.question}`);
      });
    });

    it('renders Sí / No per question and "No respondida" for a missing answer', () => {
      const data = baseData(answers('no', { hogarPiscina: 'si', hogarDanoSismico: '' }));
      const cells = answerCells(render(data, isUserEmail)).map(cell => cell.text);

      expect(cells).toEqual(['Sí', 'No', 'No', 'No', 'No', 'No', 'No respondida']);
    });

    it('omits the section for other insurance types', () => {
      const html = render(baseData({ tipoSeguro: 'auto', ...answers('') }), isUserEmail);
      expect(html).not.toContain(HOGAR_ASEGURABILIDAD_TITLE);
      expect(html).not.toContain(HOGAR_ASEGURABILIDAD_DISCLAIMER);
      expect(html).not.toContain(HOGAR_ASEGURABILIDAD_QUESTIONS[0].question);
    });

    it('omits the section for hogar when no answer was submitted', () => {
      const html = render(baseData(answers('')), isUserEmail);
      expect(html).not.toContain(HOGAR_ASEGURABILIDAD_TITLE);
    });
  });

  describe('agent "Sí" alert', () => {
    it('is absent when every answer is "no"', () => {
      const html = render(baseData(answers('no')), false);
      expect(html).not.toMatch(SI_ALERT_PATTERN);
    });

    it('uses the singular for one "Sí"', () => {
      const html = render(baseData(answers('no', { hogarEnConstruccion: 'si' })), false);
      expect(html).toContain('El cliente respondió «Sí» a 1 pregunta de la declaración de asegurabilidad');
    });

    it('counts every "Sí" answer', () => {
      const html = render(
        baseData(answers('no', { hogarPiscina: 'si', hogarRiesgoTerreno: 'si', hogarDanoSismico: 'si' })),
        false,
      );
      expect(html.match(SI_ALERT_PATTERN)?.[1]).toBe('3');
    });

    it('never appears in the user email', () => {
      const html = render(baseData(answers('si')), true);
      expect(html).not.toMatch(SI_ALERT_PATTERN);
    });
  });

  describe('"Sí" highlighting', () => {
    const HIGHLIGHT = 'font-weight: 700; background-color: #fff3cd; color: #856404;';
    const highlighted = (html: string) =>
      answerCells(html).map(cell => cell.openTag.includes(HIGHLIGHT));

    it('highlights only the "Sí" answers in the agent email', () => {
      const html = render(baseData(answers('no', { hogarPatrimonio: 'si', hogarFisurasHumedad: 'si' })), false);
      expect(highlighted(html)).toEqual([false, false, false, true, false, true, false]);
    });

    it('does not highlight answers in the user email', () => {
      const html = render(baseData(answers('si')), true);
      expect(highlighted(html)).toEqual(HOGAR_ASEGURABILIDAD_QUESTIONS.map(() => false));
    });
  });
});

describe('InsuranceApplicationTemplate — Declaración de Asesoría y Conformidad', () => {
  // 15:42 UTC is 10:42 in Bogotá (UTC-5, no daylight saving time).
  const ACCEPTED_AT = new Date('2026-10-15T15:42:00Z');

  describe.each([
    ['user', true],
    ['agent', false],
  ])('%s email', (_label, isUserEmail) => {
    it.each(['hogar', 'auto', 'vida', 'empresarial'])('renders the full declaration for tipoSeguro "%s"', (tipoSeguro) => {
      const html = render(baseData({ tipoSeguro }), isUserEmail, ACCEPTED_AT);

      expect(html).toContain(DECLARACION_ASESORIA_TITLE);
      expect(html).toContain(DECLARACION_ASESORIA_INTRO);
      for (const point of DECLARACION_ASESORIA_POINTS) {
        expect(html).toContain(point);
      }
    });

    it('states when the declaration was accepted, in Colombian time', () => {
      const html = render(baseData(), isUserEmail, ACCEPTED_AT);
      const acceptedAt = html.match(/Aceptada electrónicamente el ([^<]*) \(hora de Colombia\)\./)?.[1];

      expect(acceptedAt).toContain('15 de octubre de 2026');
      expect(acceptedAt).toContain('10:42');
    });

    it('omits the acceptance time when none is given', () => {
      const html = render(baseData(), isUserEmail);
      expect(html).toContain(DECLARACION_ASESORIA_TITLE);
      expect(html).not.toContain('Aceptada electrónicamente');
    });

    it('omits the section when the declaration was not accepted', () => {
      const html = render(baseData({ aceptaDeclaracionAsesoria: false }), isUserEmail, ACCEPTED_AT);
      expect(html).not.toContain(DECLARACION_ASESORIA_TITLE);
      expect(html).not.toContain(DECLARACION_ASESORIA_POINTS[0]);
      expect(html).not.toContain('Aceptada electrónicamente');
    });
  });
});
