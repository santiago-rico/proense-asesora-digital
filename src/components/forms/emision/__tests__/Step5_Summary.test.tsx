/**
 * Step5_Summary Component Tests
 * Tests the Declaración de Asesoría y Conformidad, the two acceptance checkboxes and
 * which declaración de asegurabilidad answers the summary lists
 */

import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Step5_Summary from '../Step5_Summary';
import { formSchema, type FormSchemaType } from '../formSchema';
import {
  DECLARACION_ASESORIA_CHECKBOX_LABEL,
  DECLARACION_ASESORIA_INTRO,
  DECLARACION_ASESORIA_POINTS,
  DECLARACION_ASESORIA_REQUIRED_MESSAGE,
  DECLARACION_ASESORIA_TITLE,
} from '@/data/declaracionAsesoria';
import { SALUD_ASEGURABILIDAD_QUESTIONS, type SaludAsegurabilidadKey } from '@/data/saludAsegurabilidad';

const PRIVACY_REQUIRED_MESSAGE = 'Debes aceptar la política de privacidad y los términos y condiciones para continuar.';

// Exposes the form API to the assertions below
const form = {} as { methods: UseFormReturn<FormSchemaType> };

const TestWrapper = ({ children, values = {} }: { children: React.ReactNode; values?: Partial<FormSchemaType> }) => {
  const methods = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: 'Juan Pérez',
      telefono: '+573001234567',
      email: 'test@example.com',
      tipoSeguro: 'auto',
      metodoPago: 'tarjeta_credito',
      periodicidadPago: 'mensual',
      declaraRenta: 'si',
      aceptaDeclaracionAsesoria: false,
      aceptaTerminosYPolitica: false,
      ...values,
    },
  });
  useEffect(() => {
    form.methods = methods;
  }, [methods]);
  return (
    <MemoryRouter>
      <FormProvider {...methods}>{children}</FormProvider>
    </MemoryRouter>
  );
};

const renderComponent = (values?: Partial<FormSchemaType>) =>
  render(
    <TestWrapper values={values}>
      <Step5_Summary />
    </TestWrapper>
  );

const getDeclaration = () => screen.getByRole('region', { name: DECLARACION_ASESORIA_TITLE });
const getDeclarationCheckbox = () => screen.getByRole('checkbox', { name: new RegExp(DECLARACION_ASESORIA_CHECKBOX_LABEL) });
const getPrivacyCheckbox = () => screen.getByRole('checkbox', { name: /Política de Privacidad/ });

describe('Step5_Summary', () => {
  describe('Declaración de Asesoría y Conformidad', () => {
    it('shows the declaration text verbatim, with every point in order', () => {
      renderComponent();

      const declaration = getDeclaration();
      expect(within(declaration).getByText(DECLARACION_ASESORIA_INTRO)).toBeInTheDocument();
      const points = within(declaration).getAllByRole('listitem');
      expect(points.map(point => point.textContent)).toEqual([...DECLARACION_ASESORIA_POINTS]);
    });

    it('asks for the declaration with its own unchecked checkbox, separate from the privacy one', () => {
      renderComponent();

      expect(within(getDeclaration()).getByRole('checkbox')).toBe(getDeclarationCheckbox());
      expect(getDeclarationCheckbox()).not.toBeChecked();
      expect(getPrivacyCheckbox()).not.toBeChecked();
      expect(getPrivacyCheckbox()).not.toBe(getDeclarationCheckbox());
    });

    it('shows its required message and clears only its own error once accepted', async () => {
      const user = userEvent.setup();
      renderComponent();

      await act(async () => {
        await form.methods.trigger(['aceptaDeclaracionAsesoria', 'aceptaTerminosYPolitica']);
      });
      expect(screen.getByText(DECLARACION_ASESORIA_REQUIRED_MESSAGE)).toBeInTheDocument();
      expect(screen.getByText(PRIVACY_REQUIRED_MESSAGE)).toBeInTheDocument();

      await user.click(getDeclarationCheckbox());

      expect(getDeclarationCheckbox()).toBeChecked();
      expect(form.methods.getValues('aceptaDeclaracionAsesoria')).toBe(true);
      expect(screen.queryByText(DECLARACION_ASESORIA_REQUIRED_MESSAGE)).not.toBeInTheDocument();
      expect(screen.getByText(PRIVACY_REQUIRED_MESSAGE)).toBeInTheDocument();
    });
  });

  it('names the real submit button in the electronic signature notice', () => {
    renderComponent();

    expect(screen.getByText(/Al hacer clic en "Firmar y Enviar Solicitud"/)).toBeInTheDocument();
  });

  describe('Declaración de asegurabilidad de vida y salud', () => {
    const label = (key: SaludAsegurabilidadKey) => SALUD_ASEGURABILIDAD_QUESTIONS.find(q => q.key === key)!.shortLabel;
    const summaryValue = (key: SaludAsegurabilidadKey) => screen.getByText(`${label(key)}:`).nextElementSibling;
    const querySummaryRow = (key: SaludAsegurabilidadKey) => screen.queryByText(`${label(key)}:`);

    const answers: Partial<FormSchemaType> = {
      saludDiagnosticos: 'no',
      saludCovidUci: 'si',
      saludCovidNumeroAsegurado: '2',
      saludOtrasEnfermedades: 'no',
      saludEmbarazo: 'si',
      saludEmbarazoComplicaciones: 'no',
      saludCitologia: 'si',
      saludCitologiaAlteraciones: 'no',
      saludCitologiaMasDeUnAno: 'si',
      saludExclusionExtraprima: 'no',
    };

    it.each(['vida', 'salud'] as const)('lists every answer, follow-ups included, for %s', (tipoSeguro) => {
      renderComponent({ tipoSeguro, ...answers });

      expect(summaryValue('saludDiagnosticos')).toHaveTextContent('No');
      expect(summaryValue('saludCovidUci')).toHaveTextContent('Sí');
      expect(summaryValue('saludCovidNumeroAsegurado')).toHaveTextContent('2');
      expect(summaryValue('saludEmbarazo')).toHaveTextContent('Sí');
      expect(summaryValue('saludEmbarazoComplicaciones')).toHaveTextContent('No');
      expect(summaryValue('saludCitologia')).toHaveTextContent('Sí');
      expect(summaryValue('saludCitologiaAlteraciones')).toHaveTextContent('No');
      expect(summaryValue('saludCitologiaMasDeUnAno')).toHaveTextContent('Sí');
      expect(summaryValue('saludExclusionExtraprima')).toHaveTextContent('No');
    });

    it('leaves out follow-ups whose question is not answered "Sí" and a blank citología', () => {
      renderComponent({
        tipoSeguro: 'salud',
        ...answers,
        saludCovidUci: 'no',
        saludEmbarazo: 'no',
        saludCitologia: '',
      });

      expect(querySummaryRow('saludCovidNumeroAsegurado')).not.toBeInTheDocument();
      expect(querySummaryRow('saludEmbarazoComplicaciones')).not.toBeInTheDocument();
      expect(querySummaryRow('saludCitologia')).not.toBeInTheDocument();
      expect(querySummaryRow('saludCitologiaAlteraciones')).not.toBeInTheDocument();
      expect(querySummaryRow('saludCitologiaMasDeUnAno')).not.toBeInTheDocument();
      expect(summaryValue('saludEmbarazo')).toHaveTextContent('No');
    });

    it('leaves out answers left over from switching to another ramo', () => {
      renderComponent({ tipoSeguro: 'auto', ...answers });

      SALUD_ASEGURABILIDAD_QUESTIONS.forEach(q => {
        expect(querySummaryRow(q.key)).not.toBeInTheDocument();
      });
    });
  });
});
