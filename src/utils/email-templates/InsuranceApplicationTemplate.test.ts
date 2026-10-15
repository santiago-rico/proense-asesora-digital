import { describe, it, expect } from 'vitest';
import { InsuranceApplicationTemplate } from './InsuranceApplicationTemplate';
import {
  HOGAR_ASEGURABILIDAD_QUESTIONS,
  HOGAR_ASEGURABILIDAD_TITLE,
  HOGAR_ASEGURABILIDAD_DISCLAIMER,
  getAsegurabilidadQuestions,
  type AsegurabilidadQuestion,
  type HogarAsegurabilidadKey,
} from '../../data/hogarAsegurabilidad';
import {
  SALUD_ASEGURABILIDAD_KEYS,
  SALUD_ASEGURABILIDAD_QUESTIONS,
  type SaludAsegurabilidadKey,
} from '../../data/saludAsegurabilidad';
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
function answerCells(
  html: string,
  questions: readonly AsegurabilidadQuestion[] = HOGAR_ASEGURABILIDAD_QUESTIONS,
): { openTag: string; text: string }[] {
  return questions.map((q, index) => {
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

describe('InsuranceApplicationTemplate — empresarial declaración de asegurabilidad', () => {
  const EMPRESARIAL_QUESTIONS = getAsegurabilidadQuestions('empresarial');
  const empresarial = (overrides: Partial<TemplateData> = {}) =>
    baseData({ tipoSeguro: 'empresarial', numeroCedula: undefined, nit: '900123456', ...overrides });

  describe.each([
    ['user', true],
    ['agent', false],
  ])('%s email', (_label, isUserEmail) => {
    it('renders every question in the empresarial wording, never "¿Tu hogar"', () => {
      const html = render(empresarial(answers('no')), isUserEmail);

      expect(html).toContain(HOGAR_ASEGURABILIDAD_TITLE);
      expect(html).toContain(HOGAR_ASEGURABILIDAD_DISCLAIMER);
      EMPRESARIAL_QUESTIONS.forEach((q, index) => {
        expect(html).toContain(`${index + 1}. ${q.question}`);
      });
      expect(html).not.toContain('¿Tu hogar');
    });

    it('adapts questions 1–4 to "el inmueble de tu empresa" and keeps 5–7 as in hogar', () => {
      const html = render(empresarial(answers('no')), isUserEmail);

      EMPRESARIAL_QUESTIONS.slice(0, 4).forEach((q, index) => {
        expect(q.question).toMatch(/^¿El inmueble de tu empresa /);
        expect(html).not.toContain(HOGAR_ASEGURABILIDAD_QUESTIONS[index].question);
      });
      EMPRESARIAL_QUESTIONS.slice(4).forEach((q, offset) => {
        expect(q.question).toBe(HOGAR_ASEGURABILIDAD_QUESTIONS[offset + 4].question);
        expect(html).toContain(`${offset + 5}. ${q.question}`);
      });
    });

    it('renders Sí / No per question and "No respondida" for a missing answer', () => {
      const data = empresarial(answers('no', { hogarPiscina: 'si', hogarDanoSismico: '' }));
      const cells = answerCells(render(data, isUserEmail), EMPRESARIAL_QUESTIONS).map(cell => cell.text);

      expect(cells).toEqual(['Sí', 'No', 'No', 'No', 'No', 'No', 'No respondida']);
    });

    it('omits the section when no answer was submitted', () => {
      const html = render(empresarial(answers('')), isUserEmail);
      expect(html).not.toContain(HOGAR_ASEGURABILIDAD_TITLE);
    });
  });

  it('counts and highlights the "Sí" answers in the agent email', () => {
    const HIGHLIGHT = 'font-weight: 700; background-color: #fff3cd; color: #856404;';
    const html = render(empresarial(answers('no', { hogarPatrimonio: 'si', hogarFisurasHumedad: 'si' })), false);

    expect(html.match(SI_ALERT_PATTERN)?.[1]).toBe('2');
    expect(answerCells(html, EMPRESARIAL_QUESTIONS).map(cell => cell.openTag.includes(HIGHLIGHT)))
      .toEqual([false, false, false, true, false, true, false]);
  });

  it('neither alerts nor highlights in the user email', () => {
    const HIGHLIGHT = 'font-weight: 700; background-color: #fff3cd; color: #856404;';
    const html = render(empresarial(answers('si')), true);

    expect(html).not.toMatch(SI_ALERT_PATTERN);
    expect(answerCells(html, EMPRESARIAL_QUESTIONS).some(cell => cell.openTag.includes(HIGHLIGHT))).toBe(false);
  });

  it.each(['auto', 'vida'])('still omits the section for tipoSeguro "%s" even with answers present', (tipoSeguro) => {
    const html = render(baseData({ tipoSeguro, ...answers('si') }), false);
    expect(html).not.toContain(HOGAR_ASEGURABILIDAD_TITLE);
    expect(html).not.toMatch(SI_ALERT_PATTERN);
  });
});

describe('InsuranceApplicationTemplate — vida and salud declaración de asegurabilidad', () => {
  const HIGHLIGHT = 'font-weight: 700; background-color: #fff3cd; color: #856404;';
  const FLAGGED_ALERT_PATTERN = /(\d+) respuestas? de la declaración de asegurabilidad requieren? revisión/;
  const question = (key: SaludAsegurabilidadKey) => SALUD_ASEGURABILIDAD_QUESTIONS.find(q => q.key === key)!.question;
  const TOP_LEVEL_KEYS: SaludAsegurabilidadKey[] = [
    'saludDiagnosticos',
    'saludCovidUci',
    'saludOtrasEnfermedades',
    'saludEmbarazo',
    'saludCitologia',
    'saludExclusionExtraprima',
  ];
  const FOLLOW_UP_KEYS: SaludAsegurabilidadKey[] = [
    'saludCovidNumeroAsegurado',
    'saludEmbarazoComplicaciones',
    'saludCitologiaAlteraciones',
    'saludCitologiaMasDeUnAno',
  ];
  /** Every follow-up shown: all parents "Sí". */
  const ALL_SHOWN_KEYS: SaludAsegurabilidadKey[] = [
    'saludDiagnosticos',
    'saludCovidUci',
    'saludCovidNumeroAsegurado',
    'saludOtrasEnfermedades',
    'saludEmbarazo',
    'saludEmbarazoComplicaciones',
    'saludCitologia',
    'saludCitologiaAlteraciones',
    'saludCitologiaMasDeUnAno',
    'saludExclusionExtraprima',
  ];

  /** Required questions answered "no", citología and follow-ups blank, unless overridden. */
  const saludAnswers = (overrides: Partial<Record<SaludAsegurabilidadKey, string>> = {}) => ({
    ...Object.fromEntries(SALUD_ASEGURABILIDAD_KEYS.map(key => [key, ''])),
    saludDiagnosticos: 'no',
    saludCovidUci: 'no',
    saludOtrasEnfermedades: 'no',
    saludEmbarazo: 'no',
    saludExclusionExtraprima: 'no',
    ...overrides,
  });
  const allSi = (overrides: Partial<Record<SaludAsegurabilidadKey, string>> = {}) => saludAnswers({
    ...Object.fromEntries(ALL_SHOWN_KEYS.map(key => [key, 'si'])),
    saludCovidNumeroAsegurado: '2',
    ...overrides,
  });

  /** The question cell (opening tag + text) and answer cell of each row, by key, in order. */
  const rows = (html: string, keys: SaludAsegurabilidadKey[]) => {
    let from = 0;
    return keys.map(key => {
      const start = html.indexOf(question(key), from);
      expect(start, `${key} should be rendered`).toBeGreaterThan(-1);
      from = start;
      const questionOpen = html.lastIndexOf('<td', start);
      const questionTag = html.slice(questionOpen, html.indexOf('>', questionOpen) + 1);
      const questionText = html.slice(questionOpen + questionTag.length, html.indexOf('</td>', start)).trim();
      const row = html.slice(start, html.indexOf('</tr>', start));
      const answerOpen = row.lastIndexOf('<td');
      const answerTagEnd = row.indexOf('>', answerOpen) + 1;
      return {
        questionTag,
        questionText,
        answerTag: row.slice(answerOpen, answerTagEnd),
        answer: row.slice(answerTagEnd, row.lastIndexOf('</td>')).trim(),
      };
    });
  };

  describe.each([
    ['vida', 'user', true],
    ['vida', 'agent', false],
    ['salud', 'user', true],
    ['salud', 'agent', false],
  ])('%s, %s email', (tipoSeguro, _label, isUserEmail) => {
    const ramo = (answers: Record<string, string>) => baseData({ tipoSeguro, ...answers });

    it('renders the title, disclaimer and the six questions numbered 1–6, without hidden follow-ups', () => {
      const html = render(ramo(saludAnswers()), isUserEmail);

      expect(html).toContain(HOGAR_ASEGURABILIDAD_TITLE);
      expect(html).toContain(HOGAR_ASEGURABILIDAD_DISCLAIMER);
      expect(rows(html, TOP_LEVEL_KEYS).map(row => row.questionText))
        .toEqual(TOP_LEVEL_KEYS.map((key, index) => `${index + 1}. ${question(key)}`));
      for (const key of FOLLOW_UP_KEYS) {
        expect(html).not.toContain(question(key));
      }
    });

    it('shows each follow-up under its "Sí" parent, unnumbered and indented', () => {
      const html = render(ramo(allSi({ saludEmbarazoComplicaciones: 'no', saludCitologiaAlteraciones: 'no' })), isUserEmail);
      const rendered = rows(html, ALL_SHOWN_KEYS);

      expect(rendered.map(row => row.answer)).toEqual(['Sí', 'Sí', '2', 'Sí', 'Sí', 'No', 'Sí', 'No', 'Sí', 'Sí']);
      rendered.forEach((row, index) => {
        const key = ALL_SHOWN_KEYS[index];
        const isFollowUp = FOLLOW_UP_KEYS.includes(key);
        expect(row.questionText, key).toBe(isFollowUp ? question(key) : `${TOP_LEVEL_KEYS.indexOf(key) + 1}. ${question(key)}`);
        expect(row.questionTag.includes('padding-left: 40px;'), key).toBe(isFollowUp);
      });
    });

    it('never shows a follow-up whose parent is not "Sí", even when a value came along', () => {
      const html = render(ramo(saludAnswers({
        saludCovidUci: 'no',
        saludCovidNumeroAsegurado: '3',
        saludEmbarazo: 'no',
        saludEmbarazoComplicaciones: 'si',
        saludCitologia: '',
        saludCitologiaAlteraciones: 'si',
      })), isUserEmail);

      for (const key of FOLLOW_UP_KEYS) {
        expect(html).not.toContain(question(key));
      }
    });

    it('renders "No respondida" for a blank citología and "No indicado" for a blank número de asegurado', () => {
      const html = render(ramo(saludAnswers({ saludCovidUci: 'si', saludCovidNumeroAsegurado: '' })), isUserEmail);
      const [covidNumero, citologia] = rows(html, ['saludCovidNumeroAsegurado', 'saludCitologia']);

      expect(covidNumero.answer).toBe('No indicado');
      expect(citologia.answer).toBe('No respondida');
    });

    it('omits the section when no answer was submitted', () => {
      const empty = Object.fromEntries(SALUD_ASEGURABILIDAD_KEYS.map(key => [key, '']));
      expect(render(ramo(empty), isUserEmail)).not.toContain(HOGAR_ASEGURABILIDAD_TITLE);
      expect(render(baseData({ tipoSeguro }), isUserEmail)).not.toContain(HOGAR_ASEGURABILIDAD_TITLE);
    });
  });

  describe('agent review alert and highlighting', () => {
    const highlighted = (html: string) => rows(html, ALL_SHOWN_KEYS).map(row => row.answerTag.includes(HIGHLIGHT));

    it('highlights and counts every flagged "Sí", never the citología itself or the número de asegurado', () => {
      const html = render(baseData({ tipoSeguro: 'salud', ...allSi() }), false);

      expect(html.match(FLAGGED_ALERT_PATTERN)?.[0]).toBe('8 respuestas de la declaración de asegurabilidad requieren revisión');
      expect(highlighted(html)).toEqual([true, true, false, true, true, true, false, true, true, true]);
    });

    it('uses the singular for one flagged answer', () => {
      const html = render(baseData({ tipoSeguro: 'vida', ...saludAnswers({ saludExclusionExtraprima: 'si' }) }), false);
      expect(html.match(FLAGGED_ALERT_PATTERN)?.[0]).toBe('1 respuesta de la declaración de asegurabilidad requiere revisión');
    });

    it('raises nothing when the only "Sí" is having had a citología', () => {
      const html = render(baseData({
        tipoSeguro: 'salud',
        ...saludAnswers({ saludCitologia: 'si', saludCitologiaAlteraciones: 'no', saludCitologiaMasDeUnAno: 'no' }),
      }), false);

      expect(html).not.toMatch(FLAGGED_ALERT_PATTERN);
      expect(html).not.toContain(HIGHLIGHT);
    });

    it('neither alerts nor highlights in the user email', () => {
      const html = render(baseData({ tipoSeguro: 'vida', ...allSi() }), true);

      expect(html).not.toMatch(FLAGGED_ALERT_PATTERN);
      expect(highlighted(html).some(Boolean)).toBe(false);
    });

    it('does not use the hogar "Sí" count wording', () => {
      const html = render(baseData({ tipoSeguro: 'vida', ...allSi() }), false);
      expect(html).not.toMatch(SI_ALERT_PATTERN);
    });
  });

  it.each(['auto', 'empresarial', 'vida_credito_protegido'])(
    'omits the section for tipoSeguro "%s" even with vida/salud answers present',
    (tipoSeguro) => {
      const html = render(baseData({ tipoSeguro, ...allSi() }), false);
      expect(html).not.toContain(question('saludDiagnosticos'));
      expect(html).not.toMatch(FLAGGED_ALERT_PATTERN);
    },
  );

  it('shows only the hogar questions for hogar, even with vida/salud answers present', () => {
    const html = render(baseData({ ...answers('no'), ...allSi() }), false);

    expect(html).toContain(`1. ${HOGAR_ASEGURABILIDAD_QUESTIONS[0].question}`);
    expect(html).not.toContain(question('saludDiagnosticos'));
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
