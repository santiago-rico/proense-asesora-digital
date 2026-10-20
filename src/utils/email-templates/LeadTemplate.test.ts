import { describe, it, expect } from 'vitest';
import { LeadTemplate } from './LeadTemplate';
import { LEAD_FORM_INSURANCE_TYPES } from '../../constants/insuranceTypes';

const lead = (tipoSeguro: string) =>
  LeadTemplate({ nombre: 'Ana Gómez', email: 'ana@example.com', telefono: '+573001234567', tipoSeguro });

describe('LeadTemplate', () => {
  it.each(LEAD_FORM_INSURANCE_TYPES)('shows the "$label" label the client picked, not the raw value', ({ value, label }) => {
    expect(lead(value)).toContain(label);
  });

  it('keeps labels for types older leads may still send', () => {
    expect(lead('rentas')).toContain('Seguro de Rentas');
    expect(lead('otro')).toContain('Otro tipo de seguro');
  });

  it('falls back to the raw value for an unknown type', () => {
    expect(lead('desconocido')).toContain('desconocido');
  });
});
