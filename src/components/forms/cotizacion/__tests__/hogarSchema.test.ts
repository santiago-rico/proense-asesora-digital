import { describe, it, expect } from 'vitest';
import { quoteFormSchema } from '../formSchema';

/**
 * `propertyValue` (the commercial value of the property) is required for every
 * hogar quote.
 *
 * It used to be asked for — and validated — only when `propertyUse === 'propio'`.
 * That is why agents kept receiving hogar quotes carrying every field except
 * this one: quotes for rented properties were never asked the question, so the
 * email guard (`if (data.propertyValue)`) silently dropped the row. The insurer
 * rates the structure regardless of who occupies it, so both cases need it.
 */

const getValidHogarData = (overrides: Record<string, unknown> = {}) => ({
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
  insuranceType: 'hogar',
  insuredPropertyAddress: 'Carrera 43A # 5-15',
  insuredPropertyCity: 'Medellín',
  estrato: 'estrato_4',
  propertyType: 'apartamento',
  propertyUse: 'propio',
  residesInProperty: 'si',
  propertyArea: '120',
  hasEconomicActivity: 'no',
  propertyValue: '350000000',
  insuranceMethod: 'valor_comercial',
  acceptTerms: true,
  website: '',
  ...overrides,
});

const messagesFor = (data: Record<string, unknown>): string[] => {
  const result = quoteFormSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('cotización hogar — valor comercial de la vivienda', () => {
  it('accepts a complete hogar quote', () => {
    expect(quoteFormSchema.safeParse(getValidHogarData()).success).toBe(true);
  });

  it.each(['propio', 'arrendamiento'])(
    'requires the commercial value when propertyUse is "%s"',
    (propertyUse) => {
      const messages = messagesFor(getValidHogarData({ propertyUse, propertyValue: '' }));
      expect(messages).toContain('El valor comercial de la vivienda es requerido');
    }
  );

  it('accepts a rented-out property once the commercial value is provided', () => {
    const data = getValidHogarData({ propertyUse: 'arrendamiento', residesInProperty: 'no' });
    expect(quoteFormSchema.safeParse(data).success).toBe(true);
  });

  it.each(['0', '-1', 'abc'])('rejects a non-positive commercial value ("%s")', (propertyValue) => {
    const messages = messagesFor(getValidHogarData({ propertyValue }));
    expect(messages).toContain('El valor comercial de la vivienda debe ser un número positivo');
  });

  it('does not require the commercial value for other insurance types', () => {
    const data = {
      firstName: 'Ana',
      lastName: 'Gómez',
      birthDate: { day: '2', month: '3', year: '1990' },
      phoneNumber: '+573001234567',
      email: 'ana.gomez@example.com',
      cedula: '87654321',
      city: 'Bogotá',
      address: 'Calle 100 # 15-20',
      employmentStatus: 'desempleado',
      insuranceType: 'salud',
      height: '165',
      weight: '60',
      epsName: 'Sura',
      practicesSports: 'no',
      hasHealthConditions: 'no',
      propertyValue: '',
      acceptTerms: true,
      website: '',
    };
    expect(quoteFormSchema.safeParse(data).success).toBe(true);
  });
});
