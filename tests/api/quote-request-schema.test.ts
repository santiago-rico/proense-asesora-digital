import { describe, it, expect } from 'vitest';
import { backendQuoteSchema } from '../../api/_schemas/quote-request-schema';

/**
 * A 400 from /api/send-quote-request returns these messages per field, and the
 * cotización form shows them under the matching inputs, so they must be in
 * Spanish. zod 4 ignores the zod 3 `required_error`/`invalid_type_error`
 * params, which left its English "Invalid option: expected one of …".
 */

const validPayload = {
  firstName: 'Juan',
  lastName: 'Pérez',
  birthDate_day: '15',
  birthDate_month: '6',
  birthDate_year: '1985',
  phoneNumber: '+573001234567',
  email: 'juan.perez@example.com',
  cedula: '12345678',
  city: 'Medellín',
  address: 'Calle 10 # 43-25',
  employmentStatus: 'estudiante',
  insuranceType: 'auto',
  acceptTerms: 'true',
};

const fieldErrors = (payload: Record<string, unknown>) => {
  const result = backendQuoteSchema.safeParse(payload);
  return result.success ? {} : result.error.flatten().fieldErrors;
};

describe('backendQuoteSchema — mensajes en español', () => {
  it('accepts a minimal valid payload', () => {
    expect(backendQuoteSchema.safeParse(validPayload).success).toBe(true);
  });

  it.each([undefined, '', 'otro'])('employmentStatus %j', (employmentStatus) => {
    expect(fieldErrors({ ...validPayload, employmentStatus }).employmentStatus).toEqual([
      'Selecciona tu situación laboral',
    ]);
  });

  it.each([undefined, '', 'viaje'])('insuranceType %j', (insuranceType) => {
    expect(fieldErrors({ ...validPayload, insuranceType }).insuranceType).toEqual([
      'Selecciona un tipo de seguro',
    ]);
  });

  it('reports birth-date errors under the flattened keys the form maps back', () => {
    const errors = fieldErrors({ ...validPayload, birthDate_day: '32' });
    expect(errors).toEqual({ birthDate_day: ['Día inválido'] });
  });
});
