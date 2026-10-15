/**
 * HogarAsegurabilidad Component Tests
 * Tests rendering, accessibility wiring and data flow for the declaración de asegurabilidad
 * (hogar and empresarial)
 */

import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import HogarAsegurabilidad from '../HogarAsegurabilidad';
import { formSchema, type FormSchemaType } from '../formSchema';
import {
  HOGAR_ASEGURABILIDAD_DISCLAIMER,
  HOGAR_ASEGURABILIDAD_KEYS,
  HOGAR_ASEGURABILIDAD_QUESTIONS,
  HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE,
  HOGAR_ASEGURABILIDAD_TITLE,
  getAsegurabilidadQuestions,
  type AsegurabilidadRamo,
} from '@/data/hogarAsegurabilidad';

// Exposes the form API to the assertions below
const form = {} as { methods: UseFormReturn<FormSchemaType> };

const TestWrapper = ({ ramo, children }: { ramo: AsegurabilidadRamo; children: React.ReactNode }) => {
  const methods = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    // A fully valid base, so the schema's superRefine (where the declaration rules live) runs
    defaultValues: {
      nombreCompleto: 'Juan Pérez',
      telefono: '+573001234567',
      email: 'test@example.com',
      tipoSeguro: ramo,
      metodoPago: 'tarjeta_credito',
      periodicidadPago: 'mensual',
      declaraRenta: 'si',
      aceptaDeclaracionAsesoria: true,
      aceptaTerminosYPolitica: true,
      ...(Object.fromEntries(HOGAR_ASEGURABILIDAD_KEYS.map(key => [key, ''])) as Partial<FormSchemaType>),
    },
  });
  useEffect(() => {
    form.methods = methods;
  }, [methods]);
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderComponent = (ramo: AsegurabilidadRamo = 'hogar') =>
  render(
    <TestWrapper ramo={ramo}>
      <HogarAsegurabilidad ramo={ramo} />
    </TestWrapper>
  );

const getQuestionGroup = (question: string) => screen.getByRole('radiogroup', { name: new RegExp(escapeRegExp(question)) });

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('HogarAsegurabilidad', () => {
  it('renders the title, the disclaimer and all seven questions in order', () => {
    renderComponent();

    expect(screen.getByRole('group', { name: new RegExp(HOGAR_ASEGURABILIDAD_TITLE) })).toBeInTheDocument();
    expect(screen.getByText(HOGAR_ASEGURABILIDAD_DISCLAIMER)).toBeInTheDocument();

    const groups = screen.getAllByRole('radiogroup');
    expect(groups).toHaveLength(7);
    HOGAR_ASEGURABILIDAD_QUESTIONS.forEach((q, index) => {
      expect(groups[index]).toHaveAccessibleName(`${index + 1}. ${q.question}`);
    });
  });

  it('offers labelled Sí and No options for each question with nothing preselected', () => {
    renderComponent();

    HOGAR_ASEGURABILIDAD_QUESTIONS.forEach(q => {
      const group = getQuestionGroup(q.question);
      const si = within(group).getByRole('radio', { name: 'Sí' });
      const no = within(group).getByRole('radio', { name: 'No' });
      expect(si).not.toBeChecked();
      expect(no).not.toBeChecked();
    });
  });

  it('stores the selected answer for each question independently', async () => {
    const user = userEvent.setup();
    renderComponent();

    const [first, second] = HOGAR_ASEGURABILIDAD_QUESTIONS;
    await user.click(within(getQuestionGroup(first.question)).getByRole('radio', { name: 'Sí' }));
    await user.click(within(getQuestionGroup(second.question)).getByRole('radio', { name: 'No' }));

    expect(form.methods.getValues(first.key)).toBe('si');
    expect(form.methods.getValues(second.key)).toBe('no');
    expect(within(getQuestionGroup(first.question)).getByRole('radio', { name: 'Sí' })).toBeChecked();
    HOGAR_ASEGURABILIDAD_QUESTIONS.slice(2).forEach(q => {
      expect(form.methods.getValues(q.key)).toBe('');
    });
  });

  it('shows the required message for unanswered questions and clears it once answered', async () => {
    const user = userEvent.setup();
    renderComponent();

    await act(async () => {
      await form.methods.trigger(HOGAR_ASEGURABILIDAD_KEYS);
    });

    expect(await screen.findAllByText(HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE)).toHaveLength(7);

    const [first] = HOGAR_ASEGURABILIDAD_QUESTIONS;
    await user.click(within(getQuestionGroup(first.question)).getByRole('radio', { name: 'No' }));

    await waitFor(() => {
      expect(screen.getAllByText(HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE)).toHaveLength(6);
    });
  });

  describe('empresarial', () => {
    const empresarialQuestions = getAsegurabilidadQuestions('empresarial');

    it('renders the title, the disclaimer and the empresarial wording of all seven questions in order', () => {
      renderComponent('empresarial');

      expect(screen.getByRole('group', { name: new RegExp(HOGAR_ASEGURABILIDAD_TITLE) })).toBeInTheDocument();
      expect(screen.getByText(HOGAR_ASEGURABILIDAD_DISCLAIMER)).toBeInTheDocument();

      const groups = screen.getAllByRole('radiogroup');
      expect(groups).toHaveLength(7);
      empresarialQuestions.forEach((q, index) => {
        expect(groups[index]).toHaveAccessibleName(`${index + 1}. ${q.question}`);
      });
    });

    it('asks about "el inmueble de tu empresa" instead of "tu hogar" and keeps questions 5–7 as in hogar', () => {
      renderComponent('empresarial');

      expect(screen.queryByText(/tu hogar/i)).not.toBeInTheDocument();
      empresarialQuestions.slice(0, 4).forEach(q => {
        expect(q.question).toMatch(/^¿El inmueble de tu empresa /);
        expect(getQuestionGroup(q.question)).toBeInTheDocument();
      });
      HOGAR_ASEGURABILIDAD_QUESTIONS.slice(4).forEach(q => {
        expect(getQuestionGroup(q.question)).toBeInTheDocument();
      });
    });

    it('stores answers under the same keys as hogar', async () => {
      const user = userEvent.setup();
      renderComponent('empresarial');

      const [first] = empresarialQuestions;
      await user.click(within(getQuestionGroup(first.question)).getByRole('radio', { name: 'Sí' }));

      expect(first.key).toBe('hogarPiscina');
      expect(form.methods.getValues('hogarPiscina')).toBe('si');
    });

    it('shows the required message for every unanswered question', async () => {
      renderComponent('empresarial');

      await act(async () => {
        await form.methods.trigger(HOGAR_ASEGURABILIDAD_KEYS);
      });

      expect(await screen.findAllByText(HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE)).toHaveLength(7);
    });
  });
});
