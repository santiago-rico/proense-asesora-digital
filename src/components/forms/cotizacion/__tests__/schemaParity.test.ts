import { describe, it, expect } from 'vitest';
import { quoteFormBaseSchema } from '../formSchema';
import { backendQuoteSchema } from '../../../../../api/_schemas/quote-request-schema';

/**
 * Guards against client/server schema drift for the quote (cotización) form.
 *
 * The client submits every field it collects, but the server validates the
 * payload with a Zod schema that STRIPS any key it does not declare. So if a
 * field is added to the client form and not to the server schema, it is
 * silently dropped and never reaches the notification email — the exact class
 * of bug this suite prevents (it previously affected the hogar and mascotas
 * insurance types).
 *
 * The only intentional shape difference is `birthDate`: the client collects it
 * as a nested object which `MultiStepQuoteForm` flattens into three string
 * fields before POSTing.
 */

// Client field that is transformed (not sent verbatim) before reaching the server.
const CLIENT_ONLY = new Set(['birthDate']);
// The three server fields that the client `birthDate` object is flattened into,
// plus `propertyUse`: replaced on the client by `propertyRelationship`, kept on
// the server so in-flight submissions from the old form still validate during
// the deploy window. Remove it (and its email row) once that window has passed.
const SERVER_ONLY = new Set(['birthDate_day', 'birthDate_month', 'birthDate_year', 'propertyUse']);

const clientFields = Object.keys(quoteFormBaseSchema.shape);
const serverFields = Object.keys(backendQuoteSchema.shape);

describe('cotización schema parity (client ↔ server)', () => {
  it('server schema accepts every field the client form collects', () => {
    const droppedByServer = clientFields.filter(
      (field) => !CLIENT_ONLY.has(field) && !serverFields.includes(field)
    );

    // If this fails, add the listed field(s) to api/_schemas/quote-request-schema.ts
    // (plus the QuoteRequestData interface, sanitization block and email template
    // in api/send-quote-request.ts) or they will be dropped from the email.
    expect(droppedByServer).toEqual([]);
  });

  it('server schema has no orphan field the client form never sends', () => {
    const orphanServerFields = serverFields.filter(
      (field) => !SERVER_ONLY.has(field) && !clientFields.includes(field)
    );

    // If this fails, the server schema still declares a field the form stopped
    // collecting — remove it so the email does not render a stale/empty row.
    expect(orphanServerFields).toEqual([]);
  });

  it('flattens the client birthDate object into day/month/year on the server', () => {
    expect(clientFields).toContain('birthDate');
    for (const field of SERVER_ONLY) {
      expect(serverFields).toContain(field);
    }
  });
});
