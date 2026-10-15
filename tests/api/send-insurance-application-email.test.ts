import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// The module under test imports the Brevo client at top level; mock it so
// importing the file never needs API keys or network access.
vi.mock('../../src/utils/brevo.js', () => ({
  sendTransactionalEmail: vi.fn(),
}));

// Handler tests skip the multipart parsing and CSRF check: formidable hands
// over `parsed.fields` and every CSRF token verifies.
const parsed = vi.hoisted(() => ({ fields: {} as Record<string, string[]> }));
vi.mock('formidable', () => ({
  default: () => ({
    parse: (_req: unknown, cb: (err: null, fields: Record<string, string[]>, files: object) => void) =>
      cb(null, parsed.fields, {}),
  }),
}));
vi.mock('csrf', () => ({
  default: class {
    verify() {
      return true;
    }
  },
}));

import handler, { backendSchema } from '../../api/send-insurance-application-email';
import { _store } from '../../api/_utils/rate-limiter';
import { sendTransactionalEmail } from '../../src/utils/brevo.js';
import {
  HOGAR_ASEGURABILIDAD_KEYS,
  HOGAR_ASEGURABILIDAD_QUESTIONS,
  HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE,
  getAsegurabilidadQuestions,
} from '../../src/data/hogarAsegurabilidad';
import {
  DECLARACION_ASESORIA_TITLE,
  DECLARACION_ASESORIA_POINTS,
  DECLARACION_ASESORIA_REQUIRED_MESSAGE,
} from '../../src/data/declaracionAsesoria';

const TERMINOS_REQUIRED_MESSAGE = 'Debes aceptar la política de privacidad y los términos y condiciones para continuar.';

// ---------------------------------------------------------------------------
// Fixtures — raw multipart field values, exactly as formidable hands them over
// ---------------------------------------------------------------------------

/** The client sends every declaration key on every submission, '' when unanswered. */
function emptyAsegurabilidad(): Record<string, string> {
  return Object.fromEntries(HOGAR_ASEGURABILIDAD_KEYS.map(key => [key, '']));
}

function answeredAsegurabilidad(answer: 'si' | 'no' = 'no'): Record<string, string> {
  return Object.fromEntries(HOGAR_ASEGURABILIDAD_KEYS.map(key => [key, answer]));
}

function baseSubmission(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    nombreCompleto: 'María Gómez',
    telefono: '+573001234567',
    email: 'maria.gomez@example.com',
    tipoSeguro: 'responsabilidad_civil',
    metodoPago: 'tarjeta_credito',
    periodicidadPago: 'mensual',
    numeroCedula: '1234567890',
    declaraRenta: 'si',
    aceptaTerminosYPolitica: 'true',
    aceptaDeclaracionAsesoria: 'true',
    website: '',
    ...emptyAsegurabilidad(),
    ...overrides,
  };
}

function hogarSubmission(overrides: Record<string, string> = {}): Record<string, string> {
  return baseSubmission({ tipoSeguro: 'hogar', ...answeredAsegurabilidad('no'), ...overrides });
}

function empresarialSubmission(overrides: Record<string, string> = {}): Record<string, string> {
  return baseSubmission({
    tipoSeguro: 'empresarial',
    numeroCedula: '',
    numeroCedulaRepLegal: '1234567890',
    nit: '900123456',
    ...answeredAsegurabilidad('no'),
    ...overrides,
  });
}

/** Mirrors the handler's 400 response body: `error.flatten().fieldErrors`. */
function fieldErrors(input: Record<string, string>): Record<string, string[] | undefined> {
  const result = backendSchema.safeParse(input);
  if (result.success) return {};
  return result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('backendSchema — hogar declaración de asegurabilidad', () => {
  it('accepts a hogar submission with every question answered "no"', () => {
    const result = backendSchema.safeParse(hogarSubmission());
    expect(result.success).toBe(true);
  });

  it('accepts "si" answers — a "Sí" never blocks the submission', () => {
    const result = backendSchema.safeParse(hogarSubmission(answeredAsegurabilidad('si')));
    expect(result.success).toBe(true);
    if (result.success) {
      for (const key of HOGAR_ASEGURABILIDAD_KEYS) {
        expect(result.data[key]).toBe('si');
      }
    }
  });

  it('keeps the answers in the parsed data so they reach the email template', () => {
    const result = backendSchema.safeParse(hogarSubmission({ hogarPiscina: 'si', hogarDanoSismico: 'no' }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hogarPiscina).toBe('si');
      expect(result.data.hogarDanoSismico).toBe('no');
    }
  });

  it.each(HOGAR_ASEGURABILIDAD_KEYS)('rejects a hogar submission with "%s" left empty, on that field', (key) => {
    const errors = fieldErrors(hogarSubmission({ [key]: '' }));
    expect(errors[key]).toEqual([HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE]);

    const otherKeysWithErrors = HOGAR_ASEGURABILIDAD_KEYS.filter(k => k !== key && errors[k]);
    expect(otherKeysWithErrors).toEqual([]);
  });

  it('rejects a hogar submission that omits a declaration key entirely', () => {
    const input = hogarSubmission();
    delete input.hogarRiesgoTerreno;
    const errors = fieldErrors(input);
    expect(errors.hogarRiesgoTerreno).toEqual([HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE]);
  });

  it('accepts a hogar submission from a page loaded before the declaration shipped (no keys sent)', () => {
    const input = baseSubmission({ tipoSeguro: 'hogar' });
    for (const key of HOGAR_ASEGURABILIDAD_KEYS) delete input[key];
    expect(backendSchema.safeParse(input).success).toBe(true);
  });

  it('reports every unanswered question for hogar', () => {
    const errors = fieldErrors(baseSubmission({ tipoSeguro: 'hogar' }));
    for (const key of HOGAR_ASEGURABILIDAD_KEYS) {
      expect(errors[key]).toEqual([HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE]);
    }
  });

  it.each(['responsabilidad_civil', 'vida', 'salud', 'auto'])(
    'does not require the declaration for tipoSeguro "%s" (empty values pass)',
    (tipoSeguro) => {
      const result = backendSchema.safeParse(baseSubmission({ tipoSeguro }));
      expect(result.success).toBe(true);
    },
  );

  it('rejects an invalid answer value', () => {
    const errors = fieldErrors(hogarSubmission({ hogarPatrimonio: 'maybe' }));
    expect(errors.hogarPatrimonio).toBeDefined();
  });

  it('rejects an invalid answer value even for other insurance types', () => {
    const errors = fieldErrors(baseSubmission({ hogarPiscina: 'maybe' }));
    expect(errors.hogarPiscina).toBeDefined();
  });
});

describe('backendSchema — empresarial declaración de asegurabilidad', () => {
  it('accepts an empresarial submission with every question answered "no"', () => {
    expect(backendSchema.safeParse(empresarialSubmission()).success).toBe(true);
  });

  it('accepts "si" answers and keeps them in the parsed data', () => {
    const result = backendSchema.safeParse(empresarialSubmission(answeredAsegurabilidad('si')));
    expect(result.success).toBe(true);
    if (result.success) {
      for (const key of HOGAR_ASEGURABILIDAD_KEYS) {
        expect(result.data[key]).toBe('si');
      }
    }
  });

  it.each(HOGAR_ASEGURABILIDAD_KEYS)('rejects an empresarial submission with "%s" left empty, on that field', (key) => {
    const errors = fieldErrors(empresarialSubmission({ [key]: '' }));
    expect(errors[key]).toEqual([HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE]);

    const otherKeysWithErrors = HOGAR_ASEGURABILIDAD_KEYS.filter(k => k !== key && errors[k]);
    expect(otherKeysWithErrors).toEqual([]);
  });

  it('reports every unanswered question for empresarial', () => {
    const errors = fieldErrors(empresarialSubmission(emptyAsegurabilidad()));
    for (const key of HOGAR_ASEGURABILIDAD_KEYS) {
      expect(errors[key]).toEqual([HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE]);
    }
  });

  it('accepts an empresarial submission that sends none of the keys, like hogar', () => {
    const input = empresarialSubmission();
    for (const key of HOGAR_ASEGURABILIDAD_KEYS) delete input[key];
    expect(backendSchema.safeParse(input).success).toBe(true);
  });
});

describe('backendSchema — Step 5 acceptances', () => {
  it('accepts a submission with both checkboxes ticked and parses them to true', () => {
    const result = backendSchema.safeParse(baseSubmission());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.aceptaTerminosYPolitica).toBe(true);
      expect(result.data.aceptaDeclaracionAsesoria).toBe(true);
    }
  });

  it.each([
    ['"false"', 'false'],
    ['empty', ''],
    ['missing', undefined],
  ])('rejects a %s Declaración de Asesoría on that field', (_label, value) => {
    const input = baseSubmission();
    if (value === undefined) delete input.aceptaDeclaracionAsesoria;
    else input.aceptaDeclaracionAsesoria = value;

    expect(fieldErrors(input).aceptaDeclaracionAsesoria).toEqual([DECLARACION_ASESORIA_REQUIRED_MESSAGE]);
  });

  it.each([
    ['"false"', 'false'],
    ['missing', undefined],
  ])('rejects %s privacy policy and terms on that field', (_label, value) => {
    const input = baseSubmission();
    if (value === undefined) delete input.aceptaTerminosYPolitica;
    else input.aceptaTerminosYPolitica = value;

    expect(fieldErrors(input).aceptaTerminosYPolitica).toEqual([TERMINOS_REQUIRED_MESSAGE]);
  });
});

function request(fields: Record<string, string>): VercelRequest {
  parsed.fields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, [value]]));
  return {
    method: 'POST',
    headers: { cookie: '_csrf_secret=secret', 'x-csrf-token': 'token', 'x-forwarded-for': '203.0.113.7' },
  } as unknown as VercelRequest;
}

function response() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    setHeader: vi.fn(),
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
  };
  return res;
}

async function submit(fields: Record<string, string>) {
  const res = response();
  await handler(request(fields), res as unknown as VercelResponse);
  return res;
}

const sentHtml = () => vi.mocked(sendTransactionalEmail).mock.calls.map(([payload]) => payload.htmlContent as string);

function resetHandlerMocks() {
  _store.clear();
  vi.mocked(sendTransactionalEmail).mockReset();
  vi.mocked(sendTransactionalEmail).mockResolvedValue({ success: true });
}

describe('handler — Declaración de Asesoría y Conformidad', () => {
  // 15:42 UTC is 10:42 in Bogotá (UTC-5, no daylight saving time).
  const SUBMITTED_AT = new Date('2026-10-15T15:42:00Z');

  beforeEach(() => {
    resetHandlerMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(SUBMITTED_AT);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records the full declaration and the server time of acceptance in the user and agent emails', async () => {
    const res = await submit(baseSubmission());

    expect(res.statusCode).toBe(200);
    const emails = sentHtml();
    expect(emails).toHaveLength(2);
    for (const html of emails) {
      expect(html).toContain(DECLARACION_ASESORIA_TITLE);
      for (const point of DECLARACION_ASESORIA_POINTS) {
        expect(html).toContain(point);
      }
      const acceptedAt = html.match(/Aceptada electrónicamente el ([^<]*) \(hora de Colombia\)\./)?.[1];
      expect(acceptedAt).toContain('15 de octubre de 2026');
      expect(acceptedAt).toContain('10:42');
    }
  });

  it('answers 400 on the declaration field and sends no email when it was not accepted', async () => {
    const res = await submit(baseSubmission({ aceptaDeclaracionAsesoria: 'false' }));

    expect(res.statusCode).toBe(400);
    expect((res.body as { errors: Record<string, string[]> }).errors.aceptaDeclaracionAsesoria)
      .toEqual([DECLARACION_ASESORIA_REQUIRED_MESSAGE]);
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });
});

describe('handler — empresarial declaración de asegurabilidad', () => {
  beforeEach(resetHandlerMocks);

  it('emails the questions in the empresarial wording the client saw', async () => {
    const res = await submit(empresarialSubmission({ hogarPiscina: 'si' }));

    expect(res.statusCode).toBe(200);
    const emails = sentHtml();
    expect(emails).toHaveLength(2);
    for (const html of emails) {
      getAsegurabilidadQuestions('empresarial').forEach((q, index) => {
        expect(html).toContain(`${index + 1}. ${q.question}`);
      });
      expect(html).not.toContain(HOGAR_ASEGURABILIDAD_QUESTIONS[0].question);
    }
  });

  it('answers 400 on the unanswered question and sends no email', async () => {
    const res = await submit(empresarialSubmission({ hogarRiesgoTerreno: '' }));

    expect(res.statusCode).toBe(400);
    expect((res.body as { errors: Record<string, string[]> }).errors.hogarRiesgoTerreno)
      .toEqual([HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE]);
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });
});
