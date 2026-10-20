import { expect, type Locator, type Page } from '@playwright/test';
import { CANCELLATION_ENDPOINT, CSRF_TOKEN, MODIFICATION_ENDPOINT } from '../api-mocks';
import { applicant, type UploadFile } from '../test-data';

/** What differs between the modificación and cancelación forms (near-identical copies). */
export interface ServiceRequestConfig {
  /** Used in test titles. */
  name: 'Modificación' | 'Cancelación';
  /** The form component, for "Known bug" references. */
  sourceFile: string;
  path: string;
  endpoint: string;
  labels: {
    nombre: string;
    cedula: string;
    email: string;
    tipoSeguro: RegExp;
    /** The free-text area: required in modificación, optional in cancelación. */
    detalle: string;
    archivos: string;
  };
  /** Form field name of the free-text area. */
  detalleField: 'modificaciones' | 'cancellationReason';
  submitLabel: string;
  successHeading: string;
  /** The amber warning on the success screen (first words). */
  successWarning: string;
  secondaryAction: string;
  /** Title of the toast shown for a non-400 failure. */
  errorToastTitle: string;
}

export const MODIFICACION: ServiceRequestConfig = {
  name: 'Modificación',
  sourceFile: 'src/components/forms/modificacion/ModificationForm.tsx',
  path: '/clientes/modificaciones',
  endpoint: MODIFICATION_ENDPOINT,
  labels: {
    nombre: 'Nombre completo',
    cedula: 'Número de cédula',
    email: 'Correo electrónico',
    tipoSeguro: /¿Qué seguro quieres modificar\?/,
    detalle: '¿Qué modificaciones quieres hacer?',
    archivos: 'Documentos Adicionales (Opcional)',
  },
  detalleField: 'modificaciones',
  submitLabel: 'Enviar Solicitud',
  successHeading: '¡Solicitud Enviada con Éxito!',
  successWarning: 'Para que tu solicitud sea procesada, es indispensable que respondas al correo',
  secondaryAction: 'Realizar otra modificación',
  errorToastTitle: 'Error',
};

export const CANCELACION: ServiceRequestConfig = {
  name: 'Cancelación',
  sourceFile: 'src/components/forms/cancelacion/CancellationForm.tsx',
  path: '/clientes/cancelaciones',
  endpoint: CANCELLATION_ENDPOINT,
  labels: {
    nombre: 'Nombre completo del tomador',
    cedula: 'Número de cédula del tomador',
    email: 'Email de contacto',
    tipoSeguro: /¿Qué seguro quieres cancelar\?/,
    detalle: 'Motivo de la cancelación (Opcional)',
    archivos: 'Adjuntar Paz y Salvo u otros documentos (Opcional)',
  },
  detalleField: 'cancellationReason',
  submitLabel: 'Enviar Solicitud de Cancelación',
  successHeading: '¡Solicitud de Cancelación Enviada!',
  successWarning: 'Para que tu solicitud de cancelación sea procesada, es indispensable que respondas al correo',
  secondaryAction: 'Realizar otra solicitud',
  errorToastTitle: 'Error en el envío',
};

export const SERVICE_REQUEST_FORMS = [MODIFICACION, CANCELACION];

export const TERMS_REQUIRED_MESSAGE =
  'Debes aceptar la política de privacidad y los términos y condiciones para continuar.';

export const serviceRequest = {
  aseguradora: 'Seguros Bolívar',
  numeroPoliza: 'POL-778899',
  detalle: 'Cambiar la dirección de correspondencia a Calle 10 # 20-30.',
};

const CSRF_URL = '**/api/csrf-token';

/**
 * Page object for the modificación (/clientes/modificaciones) and cancelación
 * (/clientes/cancelaciones) forms. Both are single-page forms on `ClientServicePage`
 * with the same fields, `useCsrf` states and shared `FileUpload`.
 */
export class ServiceRequestFormPage {
  constructor(
    readonly page: Page,
    readonly config: ServiceRequestConfig,
  ) {}

  /** Opens the page and waits for the form (the CSRF token is stubbed by the network fixture). */
  async open(): Promise<void> {
    await this.page.goto(this.config.path);
    await expect(this.nameInput).toBeVisible();
  }

  /**
   * Holds every CSRF token request until `release()`, which answers with the
   * token. Overrides any earlier CSRF route on the page.
   */
  async holdCsrf(): Promise<() => void> {
    let release!: () => void;
    const gate = new Promise<void>(resolve => (release = resolve));
    await this.page.unroute(CSRF_URL);
    await this.page.route(CSRF_URL, async route => {
      await gate;
      await route.fulfill({ status: 200, json: { token: CSRF_TOKEN } });
    });
    return release;
  }

  get csrfLoading(): Locator {
    return this.page.getByText('Cargando formulario seguro...');
  }

  get csrfErrorHeading(): Locator {
    return this.page.getByRole('heading', { level: 3, name: 'Error de Seguridad' });
  }

  get csrfRetryButton(): Locator {
    return this.page.getByRole('button', { name: 'Reintentar' });
  }

  // --- Fields ---------------------------------------------------------------

  get nameInput(): Locator {
    return this.page.getByLabel(this.config.labels.nombre);
  }

  get cedulaInput(): Locator {
    return this.page.getByLabel(this.config.labels.cedula);
  }

  get phoneInput(): Locator {
    return this.page.getByPlaceholder('300 123 4567');
  }

  get emailInput(): Locator {
    return this.page.getByLabel(this.config.labels.email);
  }

  get aseguradoraInput(): Locator {
    return this.page.getByLabel('Nombre de la aseguradora');
  }

  get polizaInput(): Locator {
    return this.page.getByLabel('Número de póliza');
  }

  get tipoSeguroSelect(): Locator {
    return this.page.getByRole('combobox', { name: this.config.labels.tipoSeguro });
  }

  get otroSeguroInput(): Locator {
    return this.page.getByLabel('Especifica qué seguro');
  }

  get detalleInput(): Locator {
    return this.page.getByLabel(this.config.labels.detalle);
  }

  /** The label contains links, so target the checkbox role, never the label text. */
  get termsCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: /Acepto la Política de Privacidad/ });
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: this.config.submitLabel, exact: true });
  }

  async chooseInsurance(option: string): Promise<void> {
    await this.tipoSeguroSelect.click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
    await expect(this.tipoSeguroSelect).toHaveText(option);
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.click();
    await expect(this.termsCheckbox).toBeChecked();
  }

  /** Every required field (and the optional ones), terms not accepted. */
  async fillRequired(overrides: { cedula?: string; tipoSeguro?: string } = {}): Promise<void> {
    await this.nameInput.fill(applicant.nombreCompleto);
    await this.cedulaInput.fill(overrides.cedula ?? applicant.numeroCedula);
    await this.phoneInput.fill(applicant.telefono);
    await this.emailInput.fill(applicant.email);
    await this.aseguradoraInput.fill(serviceRequest.aseguradora);
    await this.polizaInput.fill(serviceRequest.numeroPoliza);
    await this.chooseInsurance(overrides.tipoSeguro ?? 'Seguro de Auto');
    await this.detalleInput.fill(serviceRequest.detalle);
  }

  /** A complete, valid request ready to submit. */
  async fillValid(overrides: { cedula?: string; tipoSeguro?: string } = {}): Promise<void> {
    await this.fillRequired(overrides);
    await this.acceptTerms();
  }

  // --- Files ----------------------------------------------------------------

  /** The dropzone's visually hidden `<input type=file>`, labelled by FileUpload's label. */
  get fileInput(): Locator {
    return this.page.getByLabel(this.config.labels.archivos);
  }

  async upload(...files: UploadFile[]): Promise<void> {
    await this.fileInput.setInputFiles(files);
    for (const file of files) {
      await expect(this.removeFileButton(file.name)).toBeVisible();
    }
  }

  removeFileButton(fileName: string): Locator {
    return this.page.getByRole('button', { name: `Eliminar archivo ${fileName}` });
  }

  // --- Result ---------------------------------------------------------------

  get successHeading(): Locator {
    return this.page.getByRole('heading', { name: this.config.successHeading });
  }

  /** Toasts render their title as plain text (only one toast is shown at a time). */
  toast(text: string | RegExp): Locator {
    return this.page.locator('li[data-state="open"]').filter({ hasText: text });
  }

  /** The toast whose title is exactly `title` ("Error" would otherwise match any error toast). */
  toastTitled(title: string): Locator {
    return this.page
      .locator('li[data-state="open"]')
      .filter({ has: this.page.getByText(title, { exact: true }) });
  }

  /** Asserts the form is back to its initial, empty state. */
  async expectEmptyForm(): Promise<void> {
    await expect(this.nameInput).toHaveValue('');
    await expect(this.emailInput).toHaveValue('');
    await expect(this.tipoSeguroSelect).toHaveText('Selecciona un tipo de seguro');
    await expect(this.otroSeguroInput).toHaveCount(0);
    await expect(this.termsCheckbox).not.toBeChecked();
    await expect(this.page.getByText('Archivos seleccionados:')).toBeHidden();
  }
}
