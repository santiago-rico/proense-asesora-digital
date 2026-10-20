import { expect, type Locator, type Page } from '@playwright/test';
import { applicant } from '../test-data';

/** What a person types into the LeadForm. `tipoSeguro` is an option label (e.g. 'Seguro de Hogar'). */
export interface LeadData {
  nombre: string;
  email: string;
  /** Typed with Colombia preselected; sent as `telefonoE164`. */
  telefono: string;
  telefonoE164: string;
  tipoSeguro?: string;
  mensaje: string;
}

export const lead: LeadData = {
  nombre: applicant.nombreCompleto,
  email: applicant.email,
  telefono: applicant.telefono,
  telefonoE164: applicant.telefonoE164,
  tipoSeguro: 'Seguro de Hogar',
  mensaje: 'Quiero asesoría para asegurar mi apartamento.',
};

/**
 * Page object for `src/components/forms/LeadForm.tsx`, scoped to a container:
 * the inline form (/contacto, /seguros/<type>, blog sidebars) and the global
 * "Solicitar Asesoría" dialog can both be in the DOM at once.
 *
 * ```ts
 * const form = LeadForm.inMain(page);  // inline form
 * const dialog = LeadForm.inDialog(page); // global dialog
 * ```
 */
export class LeadForm {
  constructor(
    readonly page: Page,
    readonly container: Locator,
  ) {}

  /** The inline form inside Layout's `<main>` (`.first()`: /blog nests a second `<main>`). */
  static inMain(page: Page): LeadForm {
    return new LeadForm(page, page.getByRole('main').first());
  }

  /**
   * The form in the global dialog. While it is open everything else is
   * aria-hidden, but `getByLabel` doesn't filter that, so always scope here.
   */
  static inDialog(page: Page): LeadForm {
    return new LeadForm(page, page.getByRole('dialog', { name: 'Solicitar Asesoría' }));
  }

  // --- Fields ---------------------------------------------------------------

  get nameInput(): Locator {
    return this.container.getByLabel('Nombre Completo');
  }

  /** No `type=email`, so the browser accepts anything (only zod checks it). */
  get emailInput(): Locator {
    return this.container.getByLabel('Email', { exact: true });
  }

  get phoneInput(): Locator {
    return this.container.getByPlaceholder('Número telefónico');
  }

  /** The insurance-type select (a Radix combobox button), named by its label. */
  get typeSelect(): Locator {
    return this.container.getByRole('combobox', { name: 'Tipo de Seguro de Interés' });
  }

  get messageInput(): Locator {
    return this.container.getByLabel('Mensaje (opcional)');
  }

  /** The label contains links, so click the checkbox itself, never the label text. */
  get termsCheckbox(): Locator {
    return this.container.getByRole('checkbox', { name: /Acepto la Política de Privacidad/ });
  }

  /** The submit button, in either state: "Obtener Mi Asesoría", or "Enviando..." (disabled) while a request is in flight. */
  get submitButton(): Locator {
    return this.container.getByRole('button', { name: /^(Obtener Mi Asesoría|Enviando\.\.\.)$/ });
  }

  /** Ready to submit again: enabled and back to its idle label. */
  async expectSubmitReady(options?: { timeout?: number }): Promise<void> {
    await expect(this.submitButton).toHaveText('Obtener Mi Asesoría', options);
    await expect(this.submitButton).toBeEnabled();
  }

  /** A field's zod or server message (rendered as plain text under the field). */
  error(message: string): Locator {
    return this.container.getByText(message, { exact: true });
  }

  // --- Actions --------------------------------------------------------------

  /** Opens the select and picks an option by label (options render in a portal). */
  async selectType(label: string): Promise<void> {
    await this.typeSelect.click();
    await this.page.getByRole('option', { name: label, exact: true }).click();
    await expect(this.typeSelect).toHaveText(label);
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.click();
    await expect(this.termsCheckbox).toBeChecked();
  }

  /** Fills every field and accepts the terms. Pass `tipoSeguro: undefined` to keep a preselected type. */
  async fill(data: LeadData = lead): Promise<void> {
    await this.nameInput.fill(data.nombre);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.telefono);
    if (data.tipoSeguro) await this.selectType(data.tipoSeguro);
    await this.messageInput.fill(data.mensaje);
    await this.acceptTerms();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  // --- Result ---------------------------------------------------------------

  get successHeading(): Locator {
    return this.container.getByRole('heading', { name: '¡Solicitud Enviada!' });
  }

  get dismissButton(): Locator {
    return this.container.getByRole('button', { name: 'Entendido' });
  }

  /** Toasts render their title as plain text; only one is shown at a time. */
  toast(text: string | RegExp): Locator {
    return this.page.locator('li[data-state="open"]').filter({ hasText: text });
  }
}
