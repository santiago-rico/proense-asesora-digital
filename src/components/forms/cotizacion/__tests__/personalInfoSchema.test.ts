import { describe, it, expect } from 'vitest';
import { quoteFormSchema } from '../formSchema';
import { quoteFormDefaultValues } from '../formWiring';

/**
 * Step 1 (Información Personal) validation, run against the values the form
 * holds while the client is still on Step 1: the defaults, with Step 2's
 * `insuranceType` still unanswered.
 *
 * That unanswered select is an aborting issue in zod 4, and zod 4 skips
 * refinements once there is one. The occupation-sector rule used to live in a
 * refinement like that, so "Siguiente" let an empty sector through.
 */

const step1Values = (overrides: Record<string, unknown> = {}) => ({
  ...quoteFormDefaultValues,
  firstName: 'Juan',
  lastName: 'Pérez',
  birthDate: { day: '15', month: '6', year: '1985' },
  phoneNumber: '+573001234567',
  email: 'juan.perez@example.com',
  cedula: '12345678',
  city: 'Medellín',
  address: 'Calle 10 # 43-25',
  employmentStatus: 'empleado_completo',
  occupationSector: 'Tecnología',
  ...overrides,
});

/** Error message per top-level field, as react-hook-form would show it. */
const messagesByField = (data: Record<string, unknown>): Record<string, string[]> => {
  const result = quoteFormSchema.safeParse(data);
  const byField: Record<string, string[]> = {};
  if (result.success) return byField;
  for (const issue of result.error.issues) {
    const field = String(issue.path[0]);
    (byField[field] ??= []).push(issue.message);
  }
  return byField;
};

describe('cotización paso 1 — actividad laboral', () => {
  it.each(['empleado_completo', 'empleado_parcial', 'autonomo', 'jubilado', 'incapacidad'])(
    'requires the occupation sector for "%s" while the insurance type is still empty',
    (employmentStatus) => {
      const errors = messagesByField(step1Values({ employmentStatus, occupationSector: '' }));
      expect(errors.occupationSector).toEqual(['La actividad laboral o sector económico es requerida']);
      // The unanswered Step 2 select is what used to suppress the rule.
      expect(errors.insuranceType).toBeDefined();
    }
  );

  it('treats a whitespace-only occupation sector as empty', () => {
    const errors = messagesByField(step1Values({ occupationSector: '   ' }));
    expect(errors.occupationSector).toEqual(['La actividad laboral o sector económico es requerida']);
  });

  it.each(['desempleado', 'estudiante', 'ama_casa'])(
    'does not require the occupation sector for "%s"',
    (employmentStatus) => {
      const errors = messagesByField(step1Values({ employmentStatus, occupationSector: '' }));
      expect(errors.occupationSector).toBeUndefined();
    }
  );

  it('accepts a filled occupation sector', () => {
    expect(messagesByField(step1Values()).occupationSector).toBeUndefined();
  });

  it('still reports the other Step 1 errors alongside it', () => {
    const errors = messagesByField(step1Values({ firstName: '', occupationSector: '' }));
    expect(errors.firstName).toEqual(['El nombre es requerido']);
    expect(errors.occupationSector).toEqual(['La actividad laboral o sector económico es requerida']);
  });
});

describe('cotización — selectores vacíos con mensaje en español', () => {
  it.each([undefined, ''])('employmentStatus %j → "Selecciona tu situación laboral"', (employmentStatus) => {
    const errors = messagesByField(step1Values({ employmentStatus }));
    expect(errors.employmentStatus).toEqual(['Selecciona tu situación laboral']);
  });

  it.each([undefined, ''])('insuranceType %j → "Selecciona un tipo de seguro"', (insuranceType) => {
    const errors = messagesByField(step1Values({ insuranceType }));
    expect(errors.insuranceType).toEqual(['Selecciona un tipo de seguro']);
  });
});
