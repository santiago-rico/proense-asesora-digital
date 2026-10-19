import { expect, type Locator, type Page } from '@playwright/test';
import { applicant } from '../test-data';

export type QuoteStep = 'Información Personal' | 'Tipo de Seguro' | 'Detalles del Seguro' | 'Resumen y Envío';

export type QuoteType = 'vida' | 'auto' | 'hogar' | 'salud' | 'mascotas';

/** Option labels of the Step 2 select (`Step2_InsuranceSelection.tsx`). */
export const QUOTE_TYPE_LABELS: Record<QuoteType, string> = {
  vida: 'Seguro de Vida',
  auto: 'Seguro de Auto',
  hogar: 'Seguro de Hogar',
  salud: 'Seguro de Salud',
  mascotas: 'Seguro de Mascotas',
};

export const quoteApplicant = {
  firstName: 'María Fernanda',
  lastName: 'Gómez',
  birthDay: '15',
  birthMonth: 'Marzo',
  birthYear: '1990',
  phone: applicant.telefono,
  phoneE164: applicant.telefonoE164,
  email: applicant.email,
  cedula: applicant.numeroCedula,
  city: 'Bogotá',
  address: 'Calle 123 # 45-67',
  employmentStatus: 'Empleado(a) a tiempo completo',
  occupationSector: 'Tecnología',
};

export type PersonalInfo = typeof quoteApplicant;

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Matches a label exactly, with or without the trailing " *" of required fields. */
const labelText = (label: string) => new RegExp(`^${escapeRegExp(label)}(?: \\*)?$`);

/** Page object for the cotización (quote request) multi-step form at /clientes/cotizacion. */
export class QuoteFormPage {
  static readonly PATH = '/clientes/cotizacion';

  constructor(readonly page: Page) {}

  // --- Navigation -----------------------------------------------------------

  /** Opens the form. The CSRF token is already stubbed by the network fixture. */
  async open(): Promise<void> {
    await this.page.goto(QuoteFormPage.PATH);
    await expect(this.input('Nombre')).toBeVisible();
  }

  stepHeading(name: QuoteStep): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  async expectStep(name: QuoteStep): Promise<void> {
    await expect(this.stepHeading(name)).toBeVisible();
  }

  get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Siguiente' });
  }

  get prevButton(): Locator {
    return this.page.getByRole('button', { name: 'Anterior' });
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Enviar Cotización' });
  }

  /**
   * Clicks "Siguiente" straight from the last field, the way a user would: blur
   * does not validate, so the click's mousedown can no longer move the button.
   */
  async next(expected?: QuoteStep): Promise<void> {
    await this.nextButton.click();
    if (expected) await this.expectStep(expected);
  }

  async prev(expected?: QuoteStep): Promise<void> {
    await this.prevButton.click();
    if (expected) await this.expectStep(expected);
  }

  // --- Generic fields ---------------------------------------------------------

  /** A text/number input or textarea by its label (the " *" of required fields is optional). */
  input(label: string): Locator {
    return this.page.getByLabel(labelText(label));
  }

  /** A Radix select trigger by its label. */
  select(label: string): Locator {
    return this.page.getByRole('combobox', { name: labelText(label) });
  }

  async choose(label: string, option: string): Promise<void> {
    await this.select(label).click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
    await expect(this.select(label)).toHaveText(option);
  }

  /** A validation message, matched exactly. */
  message(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }

  // --- Step 1: Información Personal -----------------------------------------

  get firstNameInput(): Locator {
    return this.input('Nombre');
  }

  get emailInput(): Locator {
    return this.input('Correo Electrónico');
  }

  get cedulaInput(): Locator {
    return this.input('Número de cédula');
  }

  get birthDayInput(): Locator {
    return this.input('Día de nacimiento');
  }

  get birthYearInput(): Locator {
    return this.input('Año de nacimiento');
  }

  get phoneInput(): Locator {
    return this.page.getByPlaceholder('Número telefónico');
  }

  get employmentSelect(): Locator {
    return this.select('Estado laboral');
  }

  get occupationInput(): Locator {
    return this.input('Actividad laboral o sector económico');
  }

  /** Fills Step 1. Pass `occupationSector: ''` to leave that field alone (or with a status that hides it). */
  async fillPersonalInfo(overrides: Partial<PersonalInfo> = {}): Promise<void> {
    const data = { ...quoteApplicant, ...overrides };
    await this.firstNameInput.fill(data.firstName);
    await this.input('Apellido').fill(data.lastName);
    await this.birthDayInput.fill(data.birthDay);
    await this.choose('Mes de nacimiento', data.birthMonth);
    await this.birthYearInput.fill(data.birthYear);
    await this.phoneInput.fill(data.phone);
    await this.emailInput.fill(data.email);
    await this.cedulaInput.fill(data.cedula);
    await this.input('Ciudad').fill(data.city);
    await this.input('Dirección').fill(data.address);
    await this.choose('Estado laboral', data.employmentStatus);
    if (data.occupationSector) await this.occupationInput.fill(data.occupationSector);
  }

  // --- Step 2: Tipo de Seguro -----------------------------------------------

  get insuranceTypeSelect(): Locator {
    return this.select('Tipo de seguro que deseas cotizar');
  }

  async chooseInsurance(type: QuoteType): Promise<void> {
    await this.choose('Tipo de seguro que deseas cotizar', QUOTE_TYPE_LABELS[type]);
  }

  // --- Step 3: Detalles del Seguro ------------------------------------------

  /** Height, weight, EPS and the two yes/no questions shared by vida and salud. */
  async fillHealth(): Promise<void> {
    await this.input('Estatura (en cm)').fill('170');
    await this.input('Peso (en kg)').fill('68');
    await this.input('EPS a la que está afiliado').fill('Sura EPS');
    await this.choose('Practicas algún deporte', 'Sí');
    await this.input('¿Qué deportes practicas?').fill('Natación');
    await this.choose('¿Tienes o padeces alguna enfermedad?', 'No');
  }

  async fillVida(): Promise<void> {
    await this.input('Ingreso mensual').fill('5000000');
    await this.choose('Estado civil', 'Casado/a');
    await this.choose('¿Tiene hijos?', 'Sí');
    await this.fillHealth();
  }

  async fillSalud(): Promise<void> {
    await this.fillHealth();
  }

  async fillAuto(): Promise<void> {
    await this.input('Placa del vehículo').fill('ABC123');
    await this.input('Ciudad de circulación').fill('Medellín');
    await this.choose('Tipo de vehículo', 'Usado');
    await this.choose('Uso del principal del vehículo', 'Familiar');
    await this.choose('¿El vehículo tiene accesorios o modificaciones?', 'Sí');
    await this.input('Valor estimado de accesorios').fill('2000000');
    await this.choose('Tipo de accesorios', 'Rines de lujo');
  }

  /** An owner-occupied apartment, insured at commercial value, with contents. */
  async fillHogar(): Promise<void> {
    await this.choose('¿Cuál es tu relación con el inmueble?', 'Propietario/a y habito el inmueble');
    await this.input('Dirección del inmueble a asegurar').fill('Carrera 7 # 80-20 Apto 301');
    await this.input('Ciudad del inmueble a asegurar').fill('Bogotá');
    await this.choose('Tipo de vivienda', 'Apartamento');
    await this.choose('Tipo de construcción', 'Concreto reforzado');
    await this.input('Año de construcción (aproximado)').fill('2005');
    await this.input('Piso en el que se ubica el apartamento').fill('3');
    await this.input('Total de pisos del edificio').fill('10');
    await this.choose('Estrato', 'Estrato 4');
    await this.input('Area de la vivienda (M2)').fill('80');
    await this.choose('¿Se desarrolla alguna actividad económica?', 'No');
    await this.input('Valor de la propiedad (en pesos)').fill('350000000');
    await this.choose('¿Cómo deseas asegurar el predio?', 'Valor comercial');
    await this.choose('¿Deseas asegurar también los contenidos de tu hogar?', 'Sí');
    await this.input('Valor de los contenidos (muebles y enseres)').fill('50000000');
  }

  async fillMascotas(): Promise<void> {
    await this.choose('Tipo de mascota', 'Perro');
    await this.input('Nombre de tu mascota').fill('Luna');
    await this.choose('Sexo de tu mascota', 'Hembra');
    await this.input('Escribe la edad de tu mascota').fill('3 años');
    await this.input('Raza de tu mascota').fill('Criollo');
    await this.choose('Tu mascota tiene el esquema de vacunas al día', 'Sí');
    await this.choose('¿Tu mascota ha tenido enfermedades o accidentes graves en el último año?', 'Sí');
    await this.input('¿Qué enfermedades o accidentes tuvo tu mascota?').fill('Fractura de pata en 2025');
  }

  async fillDetails(type: QuoteType): Promise<void> {
    const fillers: Record<QuoteType, () => Promise<void>> = {
      vida: () => this.fillVida(),
      salud: () => this.fillSalud(),
      auto: () => this.fillAuto(),
      hogar: () => this.fillHogar(),
      mascotas: () => this.fillMascotas(),
    };
    await fillers[type]();
  }

  // --- Step 4: Resumen y Envío ----------------------------------------------

  /** The value cell next to a summary row label (labels render as "Label:"). */
  summaryValue(label: string): Locator {
    return this.page.getByText(`${label}:`, { exact: true }).locator('xpath=following-sibling::div[1]');
  }

  get termsCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: /He leído y acepto/ });
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.click();
    await expect(this.termsCheckbox).toBeChecked();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  get successHeading(): Locator {
    return this.page.getByRole('heading', { name: '¡Cotización Enviada!' });
  }

  /** Toasts render their title as plain text (only one toast is shown at a time). */
  toast(text: string | RegExp): Locator {
    return this.page.locator('li[data-state="open"]').filter({ hasText: text });
  }

  // --- Composite flows ------------------------------------------------------

  /** Steps 1–2, landing on Step 3 with `type` selected. */
  async startQuote(type: QuoteType, personal: Partial<PersonalInfo> = {}): Promise<void> {
    await this.fillPersonalInfo(personal);
    await this.next('Tipo de Seguro');
    await this.chooseInsurance(type);
    await this.next('Detalles del Seguro');
  }

  /** A complete quote up to the Step 4 summary, terms not yet accepted. */
  async reachSummary(type: QuoteType, personal: Partial<PersonalInfo> = {}): Promise<void> {
    await this.startQuote(type, personal);
    await this.fillDetails(type);
    await this.next('Resumen y Envío');
  }
}
