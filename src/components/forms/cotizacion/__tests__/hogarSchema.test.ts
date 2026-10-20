import { describe, it, expect } from 'vitest';
import { quoteFormSchema } from '../formSchema';

/**
 * Hogar quote conditional validation.
 *
 * Invariant: every quote that insures the structure carries a property value;
 * arrendatarios insure contents only and are exempt (their quotes require
 * `contentsValue` instead). `propertyRelationship` drives the branching:
 * owners (habita / no habita) and terceros must provide `propertyValue`,
 * `insuranceMethod` and `wantsContentsCoverage`; terceros additionally
 * identify the owner; apartments require the unit floor and the building's
 * total floors.
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
  propertyRelationship: 'propietario_habita',
  constructionType: 'concreto_reforzado',
  constructionYear: '2010',
  unitFloor: '3',
  buildingFloors: '10',
  propertyArea: '120',
  hasEconomicActivity: 'no',
  propertyValue: '350000000',
  insuranceMethod: 'valor_comercial',
  wantsContentsCoverage: 'no',
  acceptTerms: true,
  website: '',
  ...overrides,
});

const messagesFor = (data: Record<string, unknown>): string[] => {
  const result = quoteFormSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('cotización hogar — validación condicional', () => {
  it('accepts a complete hogar quote', () => {
    expect(quoteFormSchema.safeParse(getValidHogarData()).success).toBe(true);
  });

  it('requires propertyRelationship', () => {
    const messages = messagesFor(getValidHogarData({ propertyRelationship: '' }));
    expect(messages).toContain('Indica tu relación con el inmueble');
  });

  it.each(['propietario_habita', 'propietario_no_habita'])(
    'requires the property value when propertyRelationship is "%s"',
    (propertyRelationship) => {
      const messages = messagesFor(
        getValidHogarData({ propertyRelationship, propertyValue: '' })
      );
      expect(messages).toContain('El valor de la propiedad es requerido');
    }
  );

  it('requires the property value for tercero', () => {
    const messages = messagesFor(
      getValidHogarData({
        propertyRelationship: 'tercero',
        ownerName: 'María López',
        ownerCedula: '87654321',
        residesInProperty: 'si',
        propertyValue: '',
      })
    );
    expect(messages).toContain('El valor de la propiedad es requerido');
  });

  it('does NOT require property value, insurance method or contents opt-in for arrendatario, but requires contents value', () => {
    const messages = messagesFor(
      getValidHogarData({
        propertyRelationship: 'arrendatario',
        propertyValue: '',
        insuranceMethod: '',
        wantsContentsCoverage: '',
        contentsValue: '',
      })
    );
    expect(messages).not.toContain('El valor de la propiedad es requerido');
    expect(messages).not.toContain('Selecciona cómo deseas asegurar el predio');
    expect(messages).not.toContain('Indica si deseas asegurar los contenidos');
    expect(messages).toContain('El valor de los contenidos es requerido');
  });

  it('accepts an arrendatario quote with contents value only', () => {
    const data = getValidHogarData({
      propertyRelationship: 'arrendatario',
      propertyValue: '',
      insuranceMethod: '',
      wantsContentsCoverage: '',
      contentsValue: '25000000',
    });
    expect(quoteFormSchema.safeParse(data).success).toBe(true);
  });

  it('requires owner details and residesInProperty for tercero', () => {
    const messages = messagesFor(getValidHogarData({ propertyRelationship: 'tercero' }));
    expect(messages).toContain('El nombre del propietario es requerido');
    expect(messages).toContain('La cédula del propietario es requerida');
    expect(messages).toContain('Indica si el propietario habita el inmueble');
  });

  it('accepts a tercero quote once owner details are provided', () => {
    const data = getValidHogarData({
      propertyRelationship: 'tercero',
      ownerName: 'María López',
      ownerCedula: '87654321',
      residesInProperty: 'no',
    });
    expect(quoteFormSchema.safeParse(data).success).toBe(true);
  });

  it('does not require owner details for propietario_habita', () => {
    const data = getValidHogarData({ ownerName: '', ownerCedula: '', residesInProperty: '' });
    expect(quoteFormSchema.safeParse(data).success).toBe(true);
  });

  it('rejects a tercero owner cédula that is not digits only', () => {
    const messages = messagesFor(
      getValidHogarData({
        propertyRelationship: 'tercero',
        ownerName: 'María López',
        ownerCedula: 'CC 123',
        residesInProperty: 'si',
      })
    );
    expect(messages).toEqual(['Solo números permitidos']);
  });

  // The owner fields are hidden for every other relationship, so a value typed
  // while "tercero" was selected must not block the quote with an error the
  // client cannot see.
  it.each(['propietario_habita', 'propietario_no_habita'])(
    'ignores a stale non-numeric owner cédula once the relationship is "%s"',
    (propertyRelationship) => {
      const data = getValidHogarData({ propertyRelationship, ownerCedula: 'CC 123' });
      expect(quoteFormSchema.safeParse(data).success).toBe(true);
    }
  );

  it('requires unitFloor and buildingFloors for apartamento', () => {
    const messages = messagesFor(getValidHogarData({ unitFloor: '', buildingFloors: '' }));
    expect(messages).toContain('El piso del apartamento es requerido');
    expect(messages).toContain('El total de pisos del edificio es requerido');
  });

  it('rejects an apartamento whose unit floor exceeds the building total', () => {
    const messages = messagesFor(getValidHogarData({ unitFloor: '12', buildingFloors: '10' }));
    expect(messages).toContain('El piso del apartamento no puede ser mayor que el total de pisos');
  });

  it('does not require unitFloor or buildingFloors for casa', () => {
    const data = getValidHogarData({ propertyType: 'casa', unitFloor: '', buildingFloors: '' });
    expect(quoteFormSchema.safeParse(data).success).toBe(true);
  });

  it('requires the construction year', () => {
    const messages = messagesFor(getValidHogarData({ constructionYear: '' }));
    expect(messages).toContain('El año de construcción es requerido');
  });

  it.each(['1899', String(new Date().getFullYear() + 1), 'abc', '2005.5'])(
    'rejects an out-of-range or invalid construction year ("%s")',
    (constructionYear) => {
      const messages = messagesFor(getValidHogarData({ constructionYear }));
      expect(messages).toContain('Ingresa un año de construcción válido');
    }
  );

  it('accepts boundary construction years', () => {
    expect(
      quoteFormSchema.safeParse(getValidHogarData({ constructionYear: '1900' })).success
    ).toBe(true);
    expect(
      quoteFormSchema.safeParse(
        getValidHogarData({ constructionYear: String(new Date().getFullYear()) })
      ).success
    ).toBe(true);
  });

  it('requires the construction type', () => {
    const messages = messagesFor(getValidHogarData({ constructionType: '' }));
    expect(messages).toContain('El tipo de construcción es requerido');
  });

  it('requires contents value when wantsContentsCoverage is "si"', () => {
    const messages = messagesFor(
      getValidHogarData({ wantsContentsCoverage: 'si', contentsValue: '' })
    );
    expect(messages).toContain('El valor de los contenidos es requerido');
  });

  it('does not require contents value when wantsContentsCoverage is "no"', () => {
    const data = getValidHogarData({ wantsContentsCoverage: 'no', contentsValue: '' });
    expect(quoteFormSchema.safeParse(data).success).toBe(true);
  });

  it.each(['0', '-1', 'abc'])('rejects a non-positive property value ("%s")', (propertyValue) => {
    const messages = messagesFor(getValidHogarData({ propertyValue }));
    expect(messages).toContain('El valor de la propiedad debe ser un número positivo');
  });

  it('does not require the property value for other insurance types', () => {
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
