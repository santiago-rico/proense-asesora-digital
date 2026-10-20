import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import Step5_Summary from '../Step5_Summary';
import { quoteFormDefaultValues } from '../formWiring';
import type { QuoteFormSchemaType } from '../formSchema';

/** Which answers the cotización summary lists, and how it formats them. */

const Wrapper = ({ children, values }: { children: ReactNode; values: Partial<QuoteFormSchemaType> }) => {
  const methods = useForm<QuoteFormSchemaType>({
    defaultValues: { ...quoteFormDefaultValues, ...values },
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
};

const renderSummary = (values: Partial<QuoteFormSchemaType>) =>
  render(
    <Wrapper values={values}>
      <Step5_Summary />
    </Wrapper>
  );

/** The value shown next to a "Label:" row. */
const rowValue = (label: string) => screen.getByText(`${label}:`).nextElementSibling?.textContent;

const personal: Partial<QuoteFormSchemaType> = {
  firstName: 'Juan',
  lastName: 'Pérez',
  birthDate: { day: '15', month: '3', year: '1990' },
  employmentStatus: 'empleado_completo',
  occupationSector: 'Tecnología',
};

describe('Step5_Summary (cotización)', () => {
  it('shows every salud answer, formatted like the vida ones', () => {
    renderSummary({
      ...personal,
      insuranceType: 'salud',
      height: '170',
      weight: '68',
      epsName: 'Sura EPS',
      practicesSports: 'si',
      sportsDetails: 'Natación',
      hasHealthConditions: 'si',
      healthConditionsDetails: 'Asma',
      additionalComments: 'Llamar en la tarde',
    });

    expect(rowValue('Tipo de Seguro')).toBe('Seguro de Salud');
    expect(rowValue('Estatura')).toBe('170 cm');
    expect(rowValue('Peso')).toBe('68 kg');
    expect(rowValue('EPS')).toBe('Sura EPS');
    expect(rowValue('¿Practica Deportes?')).toBe('Sí');
    expect(rowValue('Deportes que Practica')).toBe('Natación');
    expect(rowValue('¿Tiene Enfermedades?')).toBe('Sí');
    expect(rowValue('Enfermedades')).toBe('Asma');
    expect(rowValue('Comentarios Adicionales')).toBe('Llamar en la tarde');
  });

  it('shows the occupation sector right after the employment status', () => {
    renderSummary({ ...personal, insuranceType: 'auto' });

    expect(rowValue('Estado Laboral')).toBe('Empleado(a) a tiempo completo');
    expect(rowValue('Actividad Laboral o Sector Económico')).toBe('Tecnología');
    const labels = screen.getAllByText(/:$/).map((el) => el.textContent);
    expect(labels.indexOf('Actividad Laboral o Sector Económico:')).toBe(labels.indexOf('Estado Laboral:') + 1);
  });

  it('omits the occupation sector row when it was not asked', () => {
    renderSummary({ ...personal, employmentStatus: 'estudiante', occupationSector: '', insuranceType: 'auto' });

    expect(rowValue('Estado Laboral')).toBe('Estudiante');
    expect(screen.queryByText('Actividad Laboral o Sector Económico:')).not.toBeInTheDocument();
  });
});
