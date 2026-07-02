import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getNotificationEmails } from './notification-emails';

const FORM_KEYS = [
  'NOTIFICATION_EMAILS',
  'NOTIFY_ASESORIA',
  'NOTIFY_COTIZACION',
  'NOTIFY_EMISION',
  'NOTIFY_MODIFICACION',
  'NOTIFY_CANCELACION',
] as const;

/** Resets all routing env vars so each test starts from a clean slate. */
function clearRoutingEnv() {
  for (const key of FORM_KEYS) {
    delete process.env[key];
  }
}

/** Convenience: get just the email strings for a form. */
const emailsFor = (form?: Parameters<typeof getNotificationEmails>[0]) =>
  getNotificationEmails(form).map(r => r.email);

describe('getNotificationEmails', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    clearRoutingEnv();
  });

  afterEach(() => {
    clearRoutingEnv();
    // Restore any values that existed before the suite ran.
    for (const key of FORM_KEYS) {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      }
    }
  });

  it('falls back to the default recipient when nothing is configured', () => {
    expect(emailsFor('emision')).toEqual(['comercial@proense.co']);
  });

  it('uses only NOTIFICATION_EMAILS when no per-form var is set (legacy behaviour)', () => {
    process.env.NOTIFICATION_EMAILS = 'lidercomercial@proense.co';
    expect(emailsFor('cancelacion')).toEqual(['lidercomercial@proense.co']);
  });

  it('preserves legacy behaviour when called with no form type', () => {
    process.env.NOTIFICATION_EMAILS = 'a@proense.co, b@proense.co';
    expect(emailsFor()).toEqual(['a@proense.co', 'b@proense.co']);
  });

  it('merges global recipients with per-form recipients (global first)', () => {
    process.env.NOTIFICATION_EMAILS = 'lidercomercial@proense.co';
    process.env.NOTIFY_EMISION = 'soporte@proense.co,gestorcomercial@proense.co';

    expect(emailsFor('emision')).toEqual([
      'lidercomercial@proense.co',
      'soporte@proense.co',
      'gestorcomercial@proense.co',
    ]);
  });

  it('supports the explicit style (empty global, full list per form)', () => {
    process.env.NOTIFY_ASESORIA = 'lidercomercial@proense.co, gestorcomercial@proense.co';
    expect(emailsFor('asesoria')).toEqual([
      'lidercomercial@proense.co',
      'gestorcomercial@proense.co',
    ]);
  });

  it('de-duplicates case-insensitively so no one gets two copies', () => {
    process.env.NOTIFICATION_EMAILS = 'lidercomercial@proense.co';
    process.env.NOTIFY_MODIFICACION = 'LiderComercial@proense.co, soporte@proense.co';

    expect(emailsFor('modificacion')).toEqual([
      'lidercomercial@proense.co',
      'soporte@proense.co',
    ]);
  });

  it('trims whitespace and ignores empty entries', () => {
    process.env.NOTIFY_COTIZACION = '  gestorcomercial@proense.co ,, ';
    expect(emailsFor('cotizacion')).toEqual(['gestorcomercial@proense.co']);
  });

  it('routes each form independently based on its own env var', () => {
    process.env.NOTIFICATION_EMAILS = 'lidercomercial@proense.co';
    process.env.NOTIFY_ASESORIA = 'gestorcomercial@proense.co';
    process.env.NOTIFY_COTIZACION = 'gestorcomercial@proense.co';
    process.env.NOTIFY_EMISION = 'soporte@proense.co,gestorcomercial@proense.co';
    process.env.NOTIFY_MODIFICACION = 'soporte@proense.co';
    process.env.NOTIFY_CANCELACION = 'soporte@proense.co';

    expect(emailsFor('asesoria')).toEqual(['lidercomercial@proense.co', 'gestorcomercial@proense.co']);
    expect(emailsFor('cotizacion')).toEqual(['lidercomercial@proense.co', 'gestorcomercial@proense.co']);
    expect(emailsFor('emision')).toEqual([
      'lidercomercial@proense.co',
      'soporte@proense.co',
      'gestorcomercial@proense.co',
    ]);
    expect(emailsFor('modificacion')).toEqual(['lidercomercial@proense.co', 'soporte@proense.co']);
    expect(emailsFor('cancelacion')).toEqual(['lidercomercial@proense.co', 'soporte@proense.co']);
  });

  it('formats recipients for the Brevo API with a name field', () => {
    process.env.NOTIFICATION_EMAILS = 'lidercomercial@proense.co';
    expect(getNotificationEmails('emision')).toEqual([
      { email: 'lidercomercial@proense.co', name: 'Agente Proense' },
    ]);
  });
});
