import { useEffect, useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import Step2_InsuranceSelection from '../Step2_InsuranceSelection';
import Step3_ConditionalFields from '../Step3_ConditionalFields';
import Step5_Summary from '../Step5_Summary';
import MultiStepQuoteForm from '../MultiStepQuoteForm';
import { quoteFormDefaultValues } from '../formWiring';
import type { QuoteFormSchemaType } from '../formSchema';

/**
 * A "Sí" answer reveals a details field ("¿Qué deportes practicas?", …). If the
 * client types there and then answers "No", the hidden field must be emptied,
 * or its stale text still shows on the summary and is sent with the quote. The
 * same goes for answers hidden by another hogar answer (the floor of an
 * apartment that became a casa) and for the previous insurance type's answers.
 */

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

type QuoteForm = UseFormReturn<QuoteFormSchemaType>;

/** Step 3 (below Step 2 with `withStep2`), then the summary, sharing one form like the real wizard. */
const Harness = ({
  values,
  onForm,
  withStep2 = false,
}: {
  values: Partial<QuoteFormSchemaType>;
  onForm: (form: QuoteForm) => void;
  withStep2?: boolean;
}) => {
  const methods = useForm<QuoteFormSchemaType>({
    defaultValues: { ...quoteFormDefaultValues, ...values },
  });
  const [showSummary, setShowSummary] = useState(false);
  useEffect(() => {
    onForm(methods);
  }, [methods, onForm]);
  return (
    <MemoryRouter>
      <FormProvider {...methods}>
        {showSummary ? (
          <Step5_Summary />
        ) : (
          <>
            {withStep2 && <Step2_InsuranceSelection />}
            <Step3_ConditionalFields />
          </>
        )}
        <button type="button" onClick={() => setShowSummary(true)}>
          Ver resumen
        </button>
      </FormProvider>
    </MemoryRouter>
  );
};

const renderStep3 = (values: Partial<QuoteFormSchemaType>, { withStep2 = false } = {}) => {
  const holder: { form?: QuoteForm } = {};
  render(<Harness values={values} withStep2={withStep2} onForm={(form) => (holder.form = form)} />);
  return (name: keyof QuoteFormSchemaType) => holder.form?.getValues(name);
};

const choose = async (user: UserEvent, label: RegExp, option: string) => {
  await user.click(screen.getByRole('combobox', { name: label }));
  await user.click(screen.getByRole('option', { name: option }));
};

/** The value shown next to a "Label:" row of the summary. */
const rowValue = (label: string) => screen.getByText(`${label}:`).nextElementSibling?.textContent;

interface Detail {
  field: keyof QuoteFormSchemaType;
  label: RegExp;
  /** Text typed into an input, or… */
  text?: string;
  /** …the option picked in a select. */
  option?: string;
  /** Its row label on the summary. */
  summary: string;
}

interface Case {
  name: string;
  values: Partial<QuoteFormSchemaType>;
  question: RegExp;
  questionSummary: string;
  details: Detail[];
}

const SPORTS: Omit<Case, 'name' | 'values'> = {
  question: /^Practicas algún deporte/,
  questionSummary: '¿Practica Deportes?',
  details: [{ field: 'sportsDetails', label: /^¿Qué deportes practicas\?/, text: 'Natación', summary: 'Deportes que Practica' }],
};

const ILLNESS: Omit<Case, 'name' | 'values'> = {
  question: /^¿Tienes o padeces alguna enfermedad\?/,
  questionSummary: '¿Tiene Enfermedades?',
  details: [{ field: 'healthConditionsDetails', label: /^¿Qué enfermedades\?/, text: 'Asma', summary: 'Enfermedades' }],
};

const CASES: Case[] = [
  { name: 'vida: deportes', values: { insuranceType: 'vida' }, ...SPORTS },
  { name: 'vida: enfermedades', values: { insuranceType: 'vida' }, ...ILLNESS },
  { name: 'salud: deportes', values: { insuranceType: 'salud' }, ...SPORTS },
  { name: 'salud: enfermedades', values: { insuranceType: 'salud' }, ...ILLNESS },
  {
    name: 'auto: accesorios',
    values: { insuranceType: 'auto' },
    question: /^¿El vehículo tiene accesorios o modificaciones\?/,
    questionSummary: '¿Tiene Accesorios o Modificaciones?',
    details: [
      { field: 'accessoriesValue', label: /^Valor estimado de accesorios/, text: '2000000', summary: 'Valor Estimado de Accesorios' },
      { field: 'accessoriesType', label: /^Tipo de accesorios/, option: 'Rines de lujo', summary: 'Tipo de Accesorios' },
    ],
  },
  {
    name: 'hogar: contenidos',
    values: { insuranceType: 'hogar', propertyRelationship: 'propietario_habita' },
    question: /^¿Deseas asegurar también los contenidos de tu hogar\?/,
    questionSummary: '¿Desea Asegurar Contenidos?',
    details: [
      { field: 'contentsValue', label: /^Valor de los contenidos/, text: '50000000', summary: 'Valor de los Contenidos' },
      { field: 'electricContentsValue', label: /^Valor de contenidos eléctricos/, text: '8000000', summary: 'Valor de Contenidos Eléctricos' },
      { field: 'theftValue', label: /^Valor a asegurar por hurto/, text: '5000000', summary: 'Valor a Asegurar por Hurto' },
      { field: 'portableContentsValue', label: /^Todo riesgo contenidos portátiles/, text: '3000000', summary: 'Todo Riesgo Contenidos Portátiles' },
    ],
  },
  {
    name: 'mascotas: enfermedades o accidentes',
    values: { insuranceType: 'mascotas' },
    question: /^¿Tu mascota ha tenido enfermedades o accidentes graves en el último año\?/,
    questionSummary: '¿Ha Tenido Enfermedades o Accidentes Graves?',
    details: [
      { field: 'petSeriousIllnessDetails', label: /^¿Qué enfermedades o accidentes tuvo tu mascota\?/, text: 'Fractura', summary: 'Enfermedades o Accidentes' },
    ],
  },
];

describe('Step3_ConditionalFields (cotización): details of a "Sí" answer changed to "No"', () => {
  it.each(CASES)('$name: are cleared, stay empty when "Sí" is chosen again, and are not on the summary', async ({
    values,
    question,
    questionSummary,
    details,
  }) => {
    const user = userEvent.setup();
    const getValue = renderStep3(values);

    await choose(user, question, 'Sí');
    for (const detail of details) {
      if (detail.option) await choose(user, detail.label, detail.option);
      else await user.type(screen.getByLabelText(detail.label), detail.text ?? '');
    }
    for (const { field } of details) expect(getValue(field), field).not.toBe('');

    await choose(user, question, 'No');
    for (const { label } of details) expect(screen.queryByLabelText(label)).not.toBeInTheDocument();
    for (const { field } of details) expect(getValue(field), field).toBe('');

    // Asked again, the details start empty instead of bringing the old answer back.
    await choose(user, question, 'Sí');
    for (const { label, option } of details) {
      if (option) expect(screen.getByRole('combobox', { name: label })).toHaveTextContent('Elige una opción');
      else expect(screen.getByLabelText(label)).toHaveDisplayValue('');
    }
    await choose(user, question, 'No');

    await user.click(screen.getByRole('button', { name: 'Ver resumen' }));
    expect(rowValue(questionSummary)).toBe('No');
    for (const { summary } of details) expect(screen.queryByText(`${summary}:`)).not.toBeInTheDocument();
  });

  it('keeps the details while the answer stays "Sí"', async () => {
    const user = userEvent.setup();
    const getValue = renderStep3({ insuranceType: 'vida' });

    await choose(user, SPORTS.question, 'Sí');
    await user.type(screen.getByLabelText(/^¿Qué deportes practicas\?/), 'Natación');
    await choose(user, ILLNESS.question, 'No');

    expect(getValue('sportsDetails')).toBe('Natación');
    await user.click(screen.getByRole('button', { name: 'Ver resumen' }));
    expect(rowValue('Deportes que Practica')).toBe('Natación');
  });
});

describe('Step3_ConditionalFields (cotización): hogar answers hidden by another answer', () => {
  const HOGAR = { insuranceType: 'hogar' } as const;

  it('choosing Casa after Apartamento empties the floor, which is not on the summary', async () => {
    const user = userEvent.setup();
    const getValue = renderStep3(HOGAR);

    await choose(user, /^Tipo de vivienda/, 'Apartamento');
    await user.type(screen.getByLabelText(/^Piso en el que se ubica el apartamento/), '7');
    expect(getValue('unitFloor')).toBe('7');

    await choose(user, /^Tipo de vivienda/, 'Casa');
    expect(screen.queryByLabelText(/^Piso en el que se ubica el apartamento/)).not.toBeInTheDocument();
    expect(getValue('unitFloor')).toBe('');

    // Back to Apartamento, the floor is asked again from scratch.
    await choose(user, /^Tipo de vivienda/, 'Apartamento');
    expect(screen.getByLabelText(/^Piso en el que se ubica el apartamento/)).toHaveDisplayValue('');
    await choose(user, /^Tipo de vivienda/, 'Casa');

    await user.click(screen.getByRole('button', { name: 'Ver resumen' }));
    expect(rowValue('Tipo de Vivienda')).toBe('Casa');
    expect(screen.queryByText('Piso de Ubicación del Predio:')).not.toBeInTheDocument();
  });

  it('keeps the floor while the property stays an Apartamento', async () => {
    const user = userEvent.setup();
    const getValue = renderStep3(HOGAR);

    await choose(user, /^Tipo de vivienda/, 'Apartamento');
    await user.type(screen.getByLabelText(/^Piso en el que se ubica el apartamento/), '7');
    await choose(user, /^¿Cuál es tu relación con el inmueble\?/, 'Arrendatario/a — vivo en arriendo');

    expect(getValue('unitFloor')).toBe('7');
  });

  it('becoming arrendatario empties the property value, the method and the contents question, but keeps the contents', async () => {
    const user = userEvent.setup();
    const getValue = renderStep3(HOGAR);

    await choose(user, /^¿Cuál es tu relación con el inmueble\?/, 'Propietario/a y habito el inmueble');
    await user.type(screen.getByLabelText(/^Valor de la propiedad/), '350000000');
    await choose(user, /^¿Cómo deseas asegurar el predio\?/, 'Valor comercial');
    await choose(user, /^¿Deseas asegurar también los contenidos de tu hogar\?/, 'Sí');
    await user.type(screen.getByLabelText(/^Valor de los contenidos/), '50000000');

    await choose(user, /^¿Cuál es tu relación con el inmueble\?/, 'Arrendatario/a — vivo en arriendo');
    expect(screen.queryByLabelText(/^Valor de la propiedad/)).not.toBeInTheDocument();
    expect(getValue('propertyValue')).toBe('');
    expect(getValue('insuranceMethod')).toBe('');
    expect(getValue('wantsContentsCoverage')).toBe('');
    // An arrendatario is still asked the contents, so what was typed there stays.
    expect(screen.getByLabelText(/^Valor de los contenidos/)).toHaveDisplayValue('50000000');
    expect(getValue('contentsValue')).toBe('50000000');

    await user.click(screen.getByRole('button', { name: 'Ver resumen' }));
    expect(screen.queryByText('Valor de la Propiedad:')).not.toBeInTheDocument();
    expect(screen.queryByText('Método de Aseguramiento:')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Desea Asegurar Contenidos?:')).not.toBeInTheDocument();
    expect(screen.getByText('Valor de los Contenidos:')).toBeInTheDocument();
  });
});

describe('Step2_InsuranceSelection (cotización): changing the insurance type', () => {
  const chooseType = (user: UserEvent, label: string) => choose(user, /^Tipo de seguro que deseas cotizar/, label);

  /** Answers part of vida's Step 3, including a "Sí" with details and a comment. */
  const answerVida = async (user: UserEvent) => {
    await user.type(screen.getByLabelText(/^Ingreso mensual/), '5000000');
    await choose(user, /^Estado civil/, 'Casado/a');
    await choose(user, /^¿Tiene hijos\?/, 'Sí');
    await user.type(screen.getByLabelText(/^Estatura/), '170');
    await choose(user, SPORTS.question, 'Sí');
    await user.type(screen.getByLabelText(/^¿Qué deportes practicas\?/), 'Natación');
    await user.type(screen.getByLabelText(/^Comentarios adicionales/), 'Llamar en la tarde');
  };

  it('empties the previous type\'s answers, which are not on the summary', async () => {
    const user = userEvent.setup();
    const getValue = renderStep3({}, { withStep2: true });

    await chooseType(user, 'Seguro de Vida');
    await answerVida(user);
    await chooseType(user, 'Seguro de Auto');

    for (const field of ['monthlyIncome', 'maritalStatus', 'hasChildren', 'height', 'practicesSports', 'sportsDetails'] as const) {
      expect(getValue(field), field).toBe('');
    }
    // Asked of every type.
    expect(getValue('additionalComments')).toBe('Llamar en la tarde');

    // Back to vida, its questions start empty.
    await chooseType(user, 'Seguro de Vida');
    expect(screen.getByLabelText(/^Ingreso mensual/)).toHaveDisplayValue('');
    await chooseType(user, 'Seguro de Auto');

    await user.click(screen.getByRole('button', { name: 'Ver resumen' }));
    expect(rowValue('Tipo de Seguro')).toBe('Seguro de Auto');
    expect(screen.queryByText('Ingreso Mensual:')).not.toBeInTheDocument();
    expect(rowValue('Comentarios Adicionales')).toBe('Llamar en la tarde');
  });

  it('from vida to salud keeps the answers both ask and empties the ones only vida asks', async () => {
    const user = userEvent.setup();
    const getValue = renderStep3({}, { withStep2: true });

    await chooseType(user, 'Seguro de Vida');
    await answerVida(user);
    await chooseType(user, 'Seguro de Salud');

    expect(getValue('monthlyIncome')).toBe('');
    expect(getValue('maritalStatus')).toBe('');
    expect(getValue('hasChildren')).toBe('');
    expect(screen.getByLabelText(/^Estatura/)).toHaveDisplayValue('170');
    expect(getValue('practicesSports')).toBe('si');
    expect(screen.getByLabelText(/^¿Qué deportes practicas\?/)).toHaveDisplayValue('Natación');
  });
});

describe('MultiStepQuoteForm (cotización): payload after an answer is hidden', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation((url: string) =>
      Promise.resolve(
        url === '/api/csrf-token'
          ? ({ ok: true, json: () => Promise.resolve({ token: 'mock-csrf-token' }) } as Response)
          : ({
              ok: true,
              status: 200,
              headers: new Headers({ 'content-type': 'application/json' }),
              json: () => Promise.resolve({ message: 'Solicitud de cotización enviada con éxito.' }),
            } as Response)
      )
    );
    global.fetch = mockFetch;
  });

  /** Renders the wizard and completes Step 1; returns a click on "Siguiente". */
  const startQuote = async (user: UserEvent) => {
    render(
      <MemoryRouter>
        <MultiStepQuoteForm />
      </MemoryRouter>
    );
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/csrf-token', { credentials: 'include' }));
    const next = () => user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await user.type(screen.getByLabelText(/^Nombre/), 'María');
    await user.type(screen.getByLabelText(/^Apellido/), 'Gómez');
    await user.type(screen.getByLabelText('Día de nacimiento'), '15');
    await choose(user, /^Mes de nacimiento/, 'Marzo');
    await user.type(screen.getByLabelText('Año de nacimiento'), '1990');
    await user.type(screen.getByPlaceholderText('Número telefónico'), '3001234567');
    await user.type(screen.getByLabelText(/^Correo Electrónico/), 'maria@example.com');
    await user.type(screen.getByLabelText(/^Número de cédula/), '1020304050');
    await user.type(screen.getByLabelText(/^Ciudad/), 'Bogotá');
    await user.type(screen.getByLabelText(/^Dirección/), 'Calle 123 # 45-67');
    await choose(user, /^Estado laboral/, 'Empleado(a) a tiempo completo');
    await user.type(screen.getByLabelText(/^Actividad laboral o sector económico/), 'Tecnología');
    await next();
    return next;
  };

  /** Accepts the terms, sends the quote and returns the JSON it posted. */
  const submittedPayload = async (user: UserEvent) => {
    await user.click(screen.getByRole('checkbox', { name: /He leído y acepto/ }));
    await user.click(screen.getByRole('button', { name: 'Enviar Cotización' }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('/api/send-quote-request', expect.anything()));
    const [, init] = mockFetch.mock.calls.find(([url]) => url === '/api/send-quote-request')!;
    return JSON.parse((init as RequestInit).body as string);
  };

  it('does not send the sports or illness details typed before answering "No"', async () => {
    const user = userEvent.setup();
    const next = await startQuote(user);

    // Step 2
    await choose(user, /^Tipo de seguro que deseas cotizar/, 'Seguro de Vida');
    await next();

    // Step 3: answer "Sí", type the details, then change the answer to "No".
    await user.type(await screen.findByLabelText(/^Ingreso mensual/), '5000000');
    await choose(user, /^Estado civil/, 'Casado/a');
    await choose(user, /^¿Tiene hijos\?/, 'No');
    await user.type(screen.getByLabelText(/^Estatura/), '170');
    await user.type(screen.getByLabelText(/^Peso/), '68');
    await user.type(screen.getByLabelText(/^EPS a la que está afiliado/), 'Sura EPS');
    await choose(user, SPORTS.question, 'Sí');
    await user.type(screen.getByLabelText(/^¿Qué deportes practicas\?/), 'Natación');
    await choose(user, SPORTS.question, 'No');
    await choose(user, ILLNESS.question, 'Sí');
    await user.type(screen.getByLabelText(/^¿Qué enfermedades\?/), 'Asma');
    await choose(user, ILLNESS.question, 'No');
    await next();

    // Summary
    expect(await screen.findByRole('heading', { name: 'Resumen y Envío' })).toBeInTheDocument();
    expect(rowValue('¿Practica Deportes?')).toBe('No');
    expect(rowValue('¿Tiene Enfermedades?')).toBe('No');
    expect(screen.queryByText('Deportes que Practica:')).not.toBeInTheDocument();
    expect(screen.queryByText('Enfermedades:')).not.toBeInTheDocument();

    expect(await submittedPayload(user)).toMatchObject({
      insuranceType: 'vida',
      practicesSports: 'no',
      sportsDetails: '',
      hasHealthConditions: 'no',
      healthConditionsDetails: '',
    });
  });

  it('does not send the answers of the insurance type chosen before', async () => {
    const user = userEvent.setup();
    const next = await startQuote(user);

    // Start a vida quote, then go back and quote auto instead.
    await choose(user, /^Tipo de seguro que deseas cotizar/, 'Seguro de Vida');
    await next();
    await user.type(await screen.findByLabelText(/^Ingreso mensual/), '5000000');
    await choose(user, /^Estado civil/, 'Casado/a');
    await user.type(screen.getByLabelText(/^Estatura/), '170');
    await choose(user, ILLNESS.question, 'Sí');
    await user.type(screen.getByLabelText(/^¿Qué enfermedades\?/), 'Asma');
    await user.click(screen.getByRole('button', { name: 'Anterior' }));

    await choose(user, /^Tipo de seguro que deseas cotizar/, 'Seguro de Auto');
    await next();
    await user.type(await screen.findByLabelText(/^Placa del vehículo/), 'ABC123');
    await user.type(screen.getByLabelText(/^Ciudad de circulación/), 'Medellín');
    await choose(user, /^Tipo de vehículo/, 'Usado');
    await choose(user, /^Uso del principal del vehículo/, 'Familiar');
    await next();

    expect(await screen.findByRole('heading', { name: 'Resumen y Envío' })).toBeInTheDocument();
    expect(rowValue('Placa del Vehículo')).toBe('ABC123');
    expect(screen.queryByText('Ingreso Mensual:')).not.toBeInTheDocument();

    expect(await submittedPayload(user)).toMatchObject({
      insuranceType: 'auto',
      vehiclePlate: 'ABC123',
      monthlyIncome: '',
      maritalStatus: '',
      height: '',
      hasHealthConditions: '',
      healthConditionsDetails: '',
    });
  });
});
