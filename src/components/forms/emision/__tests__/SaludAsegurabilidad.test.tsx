/**
 * SaludAsegurabilidad Component Tests
 * Tests rendering, follow-up questions, accessibility wiring and data flow for the
 * declaración de asegurabilidad of vida and salud
 */

import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SaludAsegurabilidad from '../SaludAsegurabilidad';
import { formSchema, type FormSchemaType } from '../formSchema';
import {
  HOGAR_ASEGURABILIDAD_DISCLAIMER,
  HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE,
  HOGAR_ASEGURABILIDAD_TITLE,
} from '@/data/hogarAsegurabilidad';
import {
  SALUD_ASEGURABILIDAD_KEYS,
  SALUD_ASEGURABILIDAD_QUESTIONS,
  SALUD_ASEGURABILIDAD_TEXT_MAX_LENGTH,
  type SaludAsegurabilidadKey,
} from '@/data/saludAsegurabilidad';

// Exposes the form API to the assertions below
const form = {} as { methods: UseFormReturn<FormSchemaType> };

const TestWrapper = ({ tipoSeguro, children }: { tipoSeguro: 'vida' | 'salud'; children: React.ReactNode }) => {
  const methods = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    // A fully valid base, so the schema's superRefine (where the declaration rules live) runs
    defaultValues: {
      nombreCompleto: 'Juan Pérez',
      telefono: '+573001234567',
      email: 'test@example.com',
      tipoSeguro,
      metodoPago: 'tarjeta_credito',
      periodicidadPago: 'mensual',
      declaraRenta: 'si',
      aceptaDeclaracionAsesoria: true,
      aceptaTerminosYPolitica: true,
      ...(Object.fromEntries(SALUD_ASEGURABILIDAD_KEYS.map(key => [key, ''])) as Partial<FormSchemaType>),
    },
  });
  useEffect(() => {
    form.methods = methods;
  }, [methods]);
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderComponent = (tipoSeguro: 'vida' | 'salud' = 'salud') =>
  render(
    <TestWrapper tipoSeguro={tipoSeguro}>
      <SaludAsegurabilidad />
    </TestWrapper>
  );

const question = (key: SaludAsegurabilidadKey) => SALUD_ASEGURABILIDAD_QUESTIONS.find(q => q.key === key)!;

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getQuestionGroup = (key: SaludAsegurabilidadKey) =>
  screen.getByRole('radiogroup', { name: new RegExp(escapeRegExp(question(key).question)) });

const queryQuestionGroup = (key: SaludAsegurabilidadKey) =>
  screen.queryByRole('radiogroup', { name: new RegExp(escapeRegExp(question(key).question)) });

const answer = async (user: ReturnType<typeof userEvent.setup>, key: SaludAsegurabilidadKey, label: 'Sí' | 'No') =>
  user.click(within(getQuestionGroup(key)).getByRole('radio', { name: label }));

const TOP_LEVEL_KEYS: SaludAsegurabilidadKey[] = [
  'saludDiagnosticos',
  'saludCovidUci',
  'saludOtrasEnfermedades',
  'saludEmbarazo',
  'saludCitologia',
  'saludExclusionExtraprima',
];

const REQUIRED_KEYS: SaludAsegurabilidadKey[] = TOP_LEVEL_KEYS.filter(key => key !== 'saludCitologia');

describe('SaludAsegurabilidad', () => {
  it('renders the title, the disclaimer and the six questions numbered in order, word for word', () => {
    renderComponent();

    expect(screen.getByRole('group', { name: new RegExp(HOGAR_ASEGURABILIDAD_TITLE) })).toBeInTheDocument();
    expect(screen.getByText(HOGAR_ASEGURABILIDAD_DISCLAIMER)).toBeInTheDocument();

    const groups = screen.getAllByRole('radiogroup');
    expect(groups).toHaveLength(6);
    TOP_LEVEL_KEYS.forEach((key, index) => {
      const optional = key === 'saludCitologia' ? ' (opcional)' : '';
      expect(groups[index]).toHaveAccessibleName(`${index + 1}. ${question(key).question}${optional}`);
    });
  });

  it('marks only citología as optional among the top-level questions', () => {
    renderComponent();

    expect(getQuestionGroup('saludCitologia')).toHaveAccessibleName(/\(opcional\)$/);
    REQUIRED_KEYS.forEach(key => {
      expect(getQuestionGroup(key)).not.toHaveAccessibleName(/opcional/);
    });
  });

  it('hides every follow-up question until its question is answered "Sí"', () => {
    renderComponent();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(queryQuestionGroup('saludEmbarazoComplicaciones')).not.toBeInTheDocument();
    expect(queryQuestionGroup('saludCitologiaAlteraciones')).not.toBeInTheDocument();
    expect(queryQuestionGroup('saludCitologiaMasDeUnAno')).not.toBeInTheDocument();
  });

  it('asks the optional número de asegurado after a COVID "Sí", limited in length', async () => {
    const user = userEvent.setup();
    renderComponent();

    await answer(user, 'saludCovidUci', 'Sí');

    const numero = screen.getByRole('textbox', { name: /En caso positivo indique el número de asegurado \(opcional\)/ });
    expect(numero).toHaveAttribute('maxLength', String(SALUD_ASEGURABILIDAD_TEXT_MAX_LENGTH));
    await user.type(numero, '2');
    expect(form.methods.getValues('saludCovidNumeroAsegurado')).toBe('2');
  });

  it('asks about pregnancy complications after a pregnancy "Sí"', async () => {
    const user = userEvent.setup();
    renderComponent();

    await answer(user, 'saludEmbarazo', 'Sí');
    await answer(user, 'saludEmbarazoComplicaciones', 'No');

    expect(getQuestionGroup('saludEmbarazoComplicaciones')).toHaveAccessibleName(question('saludEmbarazoComplicaciones').question);
    expect(form.methods.getValues('saludEmbarazoComplicaciones')).toBe('no');
  });

  it('asks both citología follow-ups after a citología "Sí"', async () => {
    const user = userEvent.setup();
    renderComponent();

    await answer(user, 'saludCitologia', 'Sí');

    expect(getQuestionGroup('saludCitologiaAlteraciones')).toBeInTheDocument();
    expect(getQuestionGroup('saludCitologiaMasDeUnAno')).toBeInTheDocument();
  });

  it('hides and clears the follow-ups when their question changes back to "No"', async () => {
    const user = userEvent.setup();
    renderComponent();

    await answer(user, 'saludCovidUci', 'Sí');
    await user.type(screen.getByRole('textbox'), '3');
    await answer(user, 'saludCitologia', 'Sí');
    await answer(user, 'saludCitologiaAlteraciones', 'Sí');
    await answer(user, 'saludCitologiaMasDeUnAno', 'No');

    await answer(user, 'saludCovidUci', 'No');
    await answer(user, 'saludCitologia', 'No');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(queryQuestionGroup('saludCitologiaAlteraciones')).not.toBeInTheDocument();
    expect(queryQuestionGroup('saludCitologiaMasDeUnAno')).not.toBeInTheDocument();
    expect(form.methods.getValues('saludCovidNumeroAsegurado')).toBe('');
    expect(form.methods.getValues('saludCitologiaAlteraciones')).toBe('');
    expect(form.methods.getValues('saludCitologiaMasDeUnAno')).toBe('');

    // Answering "Sí" again starts the follow-ups blank
    await answer(user, 'saludCitologia', 'Sí');
    expect(within(getQuestionGroup('saludCitologiaAlteraciones')).getByRole('radio', { name: 'Sí' })).not.toBeChecked();
  });

  it('shows the required message on every required question, and on follow-ups once shown', async () => {
    const user = userEvent.setup();
    renderComponent('vida');

    await act(async () => {
      await form.methods.trigger(SALUD_ASEGURABILIDAD_KEYS);
    });
    expect(await screen.findAllByText(HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE)).toHaveLength(REQUIRED_KEYS.length);

    await answer(user, 'saludEmbarazo', 'Sí');
    await waitFor(() => {
      expect(screen.getAllByText(HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE)).toHaveLength(REQUIRED_KEYS.length - 1);
    });

    await act(async () => {
      await form.methods.trigger(SALUD_ASEGURABILIDAD_KEYS);
    });
    await waitFor(() => {
      const complicaciones = getQuestionGroup('saludEmbarazoComplicaciones').closest('div.space-y-3')!;
      expect(within(complicaciones as HTMLElement).getByText(HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE)).toBeInTheDocument();
    });
  });

  it('clears a follow-up\'s required message when its question changes to "No"', async () => {
    const user = userEvent.setup();
    renderComponent();

    await answer(user, 'saludEmbarazo', 'Sí');
    await act(async () => {
      await form.methods.trigger('saludEmbarazoComplicaciones');
    });
    expect(form.methods.getFieldState('saludEmbarazoComplicaciones').error).toBeDefined();

    await answer(user, 'saludEmbarazo', 'No');

    expect(form.methods.getFieldState('saludEmbarazoComplicaciones').error).toBeUndefined();
  });
});
