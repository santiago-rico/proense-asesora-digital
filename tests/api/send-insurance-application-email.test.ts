import { describe, it, expect, vi } from 'vitest';

// The module under test imports the Brevo client at top level; mock it so
// importing the file never needs API keys or network access.
vi.mock('../../src/utils/brevo.js', () => ({
  sendTransactionalEmail: vi.fn(),
}));

import { backendSchema } from '../../api/send-insurance-application-email';
import {
  HOGAR_ASEGURABILIDAD_KEYS,
  HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE,
} from '../../src/data/hogarAsegurabilidad';

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
    website: '',
    ...emptyAsegurabilidad(),
    ...overrides,
  };
}

function hogarSubmission(overrides: Record<string, string> = {}): Record<string, string> {
  return baseSubmission({ tipoSeguro: 'hogar', ...answeredAsegurabilidad('no'), ...overrides });
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

  it.each(['responsabilidad_civil', 'vida', 'auto', 'empresarial'])(
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
