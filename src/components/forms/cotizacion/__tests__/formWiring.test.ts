import { describe, it, expect } from 'vitest';
import { quoteFormBaseSchema } from '../formSchema';
import { steps, quoteFormDefaultValues } from '../formWiring';

/**
 * Guards the wiring between the Zod schema, the per-step validation lists and
 * the form defaults.
 *
 * Why this matters: `handleSubmit` validates the WHOLE schema, but each step's
 * "Siguiente" button only validates the fields named in `steps[n].fields`. A
 * required field missing from that list is therefore never checked while the
 * user can still see it — the failure surfaces on the final summary step, where
 * the input is not mounted, so the submission is dropped with nothing on
 * screen. That is the "sometimes it arrives, sometimes it doesn't" failure
 * mode; `steps[2].fields` previously named only 4 of the 12 hogar fields and
 * three fields (`vehicleMake`/`vehicleModel`/`vehicleYear`) that never existed.
 */

const schemaFields = Object.keys(quoteFormBaseSchema.shape);
const stepFields = steps.flatMap((step) => step.fields);

// Fields that intentionally belong to no step:
//  - `website` is the honeypot, registered directly on the <form> and never
//    shown to (or validated for) a human.
//  - `preExistingConditions` is declared on both schemas, in the summary and in
//    the notification email, but Step3 renders NO input for it — salud quotes
//    can never carry a value, so it can never produce an error either.
const FIELDS_WITHOUT_A_STEP = new Set(['website', 'preExistingConditions']);

describe('cotización form wiring (schema ↔ steps ↔ defaults)', () => {
  it('every step field is a real schema field', () => {
    const unknownFields = stepFields.filter((field) => !schemaFields.includes(field));

    // A name here that the schema does not declare validates nothing — it is a
    // typo or a leftover from a renamed field.
    expect(unknownFields).toEqual([]);
  });

  it('every schema field is validated by exactly one step', () => {
    const unvalidated = schemaFields.filter(
      (field) => !FIELDS_WITHOUT_A_STEP.has(field) && !stepFields.includes(field)
    );

    // If this fails, add the field to the `fields` list of the step that renders
    // it in MultiStepQuoteForm.tsx — otherwise "Enviar" can fail silently on it.
    expect(unvalidated).toEqual([]);

    const duplicated = stepFields.filter((field, i) => stepFields.indexOf(field) !== i);
    expect(duplicated).toEqual([]);
  });

  it('every schema field has a default value', () => {
    const defaultKeys = Object.keys(quoteFormDefaultValues);
    const missingDefaults = schemaFields.filter((field) => !defaultKeys.includes(field));

    // Without a default, the input mounts uncontrolled (value === undefined) and
    // React only switches it to controlled on the first keystroke.
    expect(missingDefaults).toEqual([]);
  });

  it('declares no default for a field the schema does not have', () => {
    const orphanDefaults = Object.keys(quoteFormDefaultValues).filter(
      (field) => !schemaFields.includes(field)
    );
    expect(orphanDefaults).toEqual([]);
  });
});
