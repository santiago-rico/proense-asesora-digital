/**
 * Utility for resolving which agents receive each form's notification email.
 *
 * ── Routing model (additive) ────────────────────────────────────────────────
 * Recipients for a form = NOTIFICATION_EMAILS  +  NOTIFY_<FORM>   (de-duplicated)
 *
 *   • NOTIFICATION_EMAILS  → people who should receive EVERY form ("recibe todo").
 *   • NOTIFY_<FORM>        → EXTRA people who should also receive that one form.
 *
 * Both variables accept a comma-separated list of emails. Either can be left
 * empty. This means you can configure routing in two equally valid styles:
 *
 *   1. DRY:      put the shared recipient once in NOTIFICATION_EMAILS and only
 *                the specialists in each NOTIFY_<FORM>.
 *   2. Explicit: leave NOTIFICATION_EMAILS empty and list the full set of
 *                recipients in each NOTIFY_<FORM>.
 *
 * If a form ends up with no configured recipients at all, it falls back to
 * DEFAULT_RECIPIENT so a submission is never silently lost.
 *
 * @example
 *   // NOTIFICATION_EMAILS=lidercomercial@proense.co
 *   // NOTIFY_EMISION=soporte@proense.co,gestorcomercial@proense.co
 *   getNotificationEmails('emision')
 *   // → lidercomercial@proense.co, soporte@proense.co, gestorcomercial@proense.co
 */

export interface EmailRecipient {
  email: string;
  name: string;
}

/** The distinct form types the site can send. */
export type FormType =
  | 'asesoria'
  | 'cotizacion'
  | 'emision'
  | 'modificacion'
  | 'cancelacion';

/** Maps each form type to the env variable holding its extra recipients. */
const FORM_ENV_KEYS: Record<FormType, string> = {
  asesoria: 'NOTIFY_ASESORIA',
  cotizacion: 'NOTIFY_COTIZACION',
  emision: 'NOTIFY_EMISION',
  modificacion: 'NOTIFY_MODIFICACION',
  cancelacion: 'NOTIFY_CANCELACION',
};

/** Used only when no recipients are configured anywhere, so mail is never lost. */
const DEFAULT_RECIPIENT = 'comercial@proense.co';

const RECIPIENT_NAME = 'Agente Proense';

/** Splits a comma-separated env value into a clean list of email strings. */
function parseEmailList(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

/**
 * Resolves the notification recipients for a given form, formatted for Brevo.
 *
 * @param formType - The form being submitted. When omitted, only the global
 *                   NOTIFICATION_EMAILS list is used (legacy behaviour).
 * @returns De-duplicated array of recipients: [{ email, name }, ...]
 */
export function getNotificationEmails(formType?: FormType): EmailRecipient[] {
  const globalEmails = parseEmailList(process.env.NOTIFICATION_EMAILS);
  const formEmails = formType
    ? parseEmailList(process.env[FORM_ENV_KEYS[formType]])
    : [];

  // Merge global + per-form recipients, de-duplicating case-insensitively while
  // preserving first-seen order (global recipients appear first).
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const email of [...globalEmails, ...formEmails]) {
    const key = email.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(email);
    }
  }

  if (merged.length === 0) {
    return [{ email: DEFAULT_RECIPIENT, name: RECIPIENT_NAME }];
  }

  return merged.map(email => ({ email, name: RECIPIENT_NAME }));
}
