import { expect, type Locator, type Page } from '@playwright/test';
import { DECLARACION_ASESORIA_CHECKBOX_LABEL, DECLARACION_ASESORIA_TITLE } from '../../../src/data/declaracionAsesoria';
import {
  HOGAR_ASEGURABILIDAD_QUESTIONS,
  type HogarAsegurabilidadKey,
} from '../../../src/data/hogarAsegurabilidad';
import { mockCsrfToken } from '../api-mocks';
import { applicant, pdfFile, pngFile, type UploadFile } from '../test-data';

export type StepName =
  | 'Información Básica'
  | 'Selección de Seguro'
  | 'Detalles del Seguro'
  | 'Declaración'
  | 'Resumen y Envío';

export type InsuranceLabel =
  | 'Seguro de Vida'
  | 'Seguro de Salud'
  | 'Seguro de Hogar'
  | 'Seguro de Autos'
  | 'Seguro Empresarial'
  | 'Seguro de Rentas'
  | 'Seguro para Mascotas'
  | 'Seguro de Responsabilidad Civil'
  | 'Seguro de Vida - Crédito Protegido';

export type SiNo = 'si' | 'no';

/** Page object for the emisión (policy issuance) multi-step form at /clientes/emision-polizas. */
export class InsuranceFormPage {
  static readonly PATH = '/clientes/emision-polizas';

  constructor(readonly page: Page) {}

  // --- Navigation -----------------------------------------------------------

  /** Mocks the CSRF endpoint (the form fetches it on mount) and opens the form. */
  async open(): Promise<void> {
    await mockCsrfToken(this.page);
    await this.page.goto(InsuranceFormPage.PATH);
    await expect(this.nameInput).toBeVisible();
  }

  stepHeading(name: StepName): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  async expectStep(name: StepName): Promise<void> {
    await expect(this.stepHeading(name)).toBeVisible();
  }

  get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Siguiente' });
  }

  get prevButton(): Locator {
    return this.page.getByRole('button', { name: 'Anterior' });
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Firmar y Enviar Solicitud' });
  }

  async next(expected?: StepName): Promise<void> {
    await this.nextButton.click();
    if (expected) await this.expectStep(expected);
  }

  async prev(expected?: StepName): Promise<void> {
    await this.prevButton.click();
    if (expected) await this.expectStep(expected);
  }

  // --- Step 1: Información Básica -------------------------------------------

  get nameInput(): Locator {
    return this.page.getByLabel('Nombre completo');
  }

  get phoneInput(): Locator {
    return this.page.getByPlaceholder('Número telefónico');
  }

  get emailInput(): Locator {
    return this.page.getByLabel('Correo Electrónico');
  }

  async fillBasicInfo(data: { nombreCompleto: string; telefono: string; email: string } = applicant): Promise<void> {
    await this.nameInput.fill(data.nombreCompleto);
    await this.phoneInput.fill(data.telefono);
    await this.emailInput.fill(data.email);
  }

  // --- Step 2: Selección de Seguro ------------------------------------------

  async selectOption(label: string, option: string): Promise<void> {
    await this.page.getByRole('combobox', { name: label }).click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  async chooseInsurance(
    tipo: InsuranceLabel,
    metodoPago = 'Tarjeta de Crédito',
    periodicidad = 'Mensual',
  ): Promise<void> {
    await this.selectOption('Tipo de seguro que deseas contratar', tipo);
    await this.selectOption('Método de pago preferido', metodoPago);
    await this.selectOption('Periodicidad de pago', periodicidad);
  }

  // --- Step 3: Detalles del Seguro ------------------------------------------

  get cedulaInput(): Locator {
    return this.page.getByLabel('Número de cédula');
  }

  /** The hidden `<input type=file>` of the upload whose visible label contains `label`. */
  fileInput(label: string): Locator {
    return this.page.locator('label', { hasText: label }).locator('xpath=..').locator('input[type="file"]');
  }

  async upload(label: string, ...files: UploadFile[]): Promise<void> {
    await this.fileInput(label).setInputFiles(files);
    for (const file of files) {
      await expect(this.removeFileButton(file.name)).toBeVisible();
    }
  }

  removeFileButton(fileName: string): Locator {
    return this.page.getByRole('button', { name: `Eliminar archivo ${fileName}` });
  }

  /** Radio group of one hogar declaration question, named by its question text. */
  declarationGroup(key: HogarAsegurabilidadKey): Locator {
    const question = HOGAR_ASEGURABILIDAD_QUESTIONS.find(q => q.key === key)!.question;
    return this.page.getByRole('radiogroup', { name: question });
  }

  async answerDeclaration(answers: Record<HogarAsegurabilidadKey, SiNo>): Promise<void> {
    for (const { key } of HOGAR_ASEGURABILIDAD_QUESTIONS) {
      await this.declarationGroup(key)
        .getByRole('radio', { name: answers[key] === 'si' ? 'Sí' : 'No', exact: true })
        .check();
    }
  }

  /** Cédula + foto: the fields every personal insurance type asks for. */
  async fillCommonDetails(): Promise<void> {
    await this.cedulaInput.fill(applicant.numeroCedula);
    await this.upload('Foto cédula (ambos lados)', pngFile('cedula.png'));
  }

  // --- Step 4: Declaración --------------------------------------------------

  async setDeclaraRenta(value: SiNo): Promise<void> {
    await this.page.getByRole('radio', { name: value === 'si' ? 'Sí' : 'No', exact: true }).check();
  }

  async fillNonDeclarantFinancials(values: { ingresos: string; egresos: string; activos: string; pasivos: string }): Promise<void> {
    await this.page.getByLabel('¿Cuántos son tus ingresos mensuales?').fill(values.ingresos);
    await this.page.getByLabel('¿Cuántos son tus egresos mensuales?').fill(values.egresos);
    await this.page.getByLabel('Valor total de tus activos').fill(values.activos);
    await this.page.getByLabel('Valor de tus pasivos').fill(values.pasivos);
  }

  // --- Step 5: Resumen y Envío ----------------------------------------------

  /** The value cell next to a summary row label (labels render as "Label:"). */
  summaryValue(label: string): Locator {
    return this.page.getByText(`${label}:`, { exact: true }).locator('xpath=following-sibling::div[1]');
  }

  /** The Declaración de Asesoría y Conformidad del Cliente: its text and its own checkbox. */
  get advisoryDeclaration(): Locator {
    return this.page.getByRole('region', { name: DECLARACION_ASESORIA_TITLE });
  }

  get advisoryDeclarationCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: DECLARACION_ASESORIA_CHECKBOX_LABEL });
  }

  get termsCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: /Política de Privacidad/ });
  }

  async acceptAdvisoryDeclaration(): Promise<void> {
    await this.advisoryDeclarationCheckbox.click();
    await expect(this.advisoryDeclarationCheckbox).toBeChecked();
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.click();
    await expect(this.termsCheckbox).toBeChecked();
  }

  /** Both Step 5 checkboxes a submission needs: the advisory declaration, then privacy and terms. */
  async acceptDeclarationAndTerms(): Promise<void> {
    await this.acceptAdvisoryDeclaration();
    await this.acceptTerms();
  }

  get successHeading(): Locator {
    return this.page.getByRole('heading', { name: '¡Solicitud Enviada!' });
  }

  /** Toasts render their title as plain text (only one toast is shown at a time). */
  toast(text: string | RegExp): Locator {
    return this.page.locator('li[data-state="open"]').filter({ hasText: text });
  }

  // --- Composite flows ------------------------------------------------------

  /** Steps 1–2: basic info and the chosen insurance, landing on Step 3. */
  async startApplication(tipo: InsuranceLabel): Promise<void> {
    await this.fillBasicInfo();
    await this.next('Selección de Seguro');
    await this.chooseInsurance(tipo);
    await this.next('Detalles del Seguro');
  }

  /** A complete Seguro de Autos application up to the Step 5 summary, declaration and terms accepted. */
  async reachSummaryAsAuto(): Promise<void> {
    await this.startApplication('Seguro de Autos');
    await this.fillCommonDetails();
    await this.upload('Tarjeta de propiedad (ambos lados)', pdfFile('tarjeta-propiedad.pdf'));
    await this.next('Declaración');
    await this.upload('Archivo declaración renta', pdfFile('declaracion-renta.pdf'));
    await this.next('Resumen y Envío');
    await this.acceptDeclarationAndTerms();
  }
}
