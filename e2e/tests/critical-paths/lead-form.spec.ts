import { test, expect, FAILED_REQUEST } from '../../fixtures/network';
import { LEAD_FORM_INSURANCE_TYPES } from '../../../src/constants/insuranceTypes';
import { blogPost } from '../../fixtures/blog-data';
import { CSRF_TOKEN, LEAD_ENDPOINT, mockJsonSubmission, respond, type CapturedJson } from '../../fixtures/api-mocks';
import { lead, LeadForm } from '../../fixtures/page-objects/lead-form';
import { Site } from '../../fixtures/page-objects/site';
import { CSRF_ERROR_CODE } from '../../../src/utils/csrf-error';

/** The exact JSON LeadForm posts: no `terminos`, the phone in E.164, the honeypot empty. */
function expectLeadRequest(sent: CapturedJson, tipoSeguro: string): void {
  expect(sent.headers['content-type']).toBe('application/json');
  expect(sent.headers['x-csrf-token']).toBe(CSRF_TOKEN);
  expect(sent.body).toStrictEqual({
    nombre: lead.nombre,
    email: lead.email,
    telefono: lead.telefonoE164,
    tipoSeguro,
    mensaje: lead.mensaje,
    website: '',
  });
}

const typeLabel = (value: string) => LEAD_FORM_INSURANCE_TYPES.find(t => t.value === value)!.label;

/** Every /seguros route; its LeadForm preselects the option with the same value. */
const PRODUCT_TYPES = ['vida', 'vida-deudores', 'salud', 'auto', 'hogar', 'pymes', 'mascotas', 'motos', 'arrendamiento', 'viaje'];

test.describe('LeadForm: envío', () => {
  test('desde /contacto envía el JSON exacto y "Entendido" reinicia el formulario', async ({ page }) => {
    const submissions = await mockJsonSubmission(page, LEAD_ENDPOINT, respond.success());
    await page.goto('/contacto');
    const form = LeadForm.inMain(page);
    await expect(form.typeSelect).toHaveText('Selecciona un tipo de seguro');

    await form.fill(lead);
    await form.submit();
    await expect(form.successHeading).toBeVisible();
    expect(submissions).toHaveLength(1);
    expectLeadRequest(submissions[0], 'hogar');

    await form.dismissButton.click();
    await expect(form.nameInput).toHaveValue('');
    await expect(form.emailInput).toHaveValue('');
    await expect(form.phoneInput).toHaveValue('');
    await expect(form.typeSelect).toHaveText('Selecciona un tipo de seguro');
    await expect(form.messageInput).toHaveValue('');
    await expect(form.termsCheckbox).not.toBeChecked();
    await form.expectSubmitReady();
  });

  test('desde una página de producto envía el tipo preseleccionado', async ({ page }) => {
    const submissions = await mockJsonSubmission(page, LEAD_ENDPOINT, respond.success());
    await page.goto('/seguros/auto');
    const form = LeadForm.inMain(page);
    await expect(form.typeSelect).toHaveText('Seguro de Auto');

    await form.fill({ ...lead, tipoSeguro: undefined });
    await form.submit();
    await expect(form.successHeading).toBeVisible();
    expectLeadRequest(submissions[0], 'auto');

    await form.dismissButton.click();
    await expect(form.typeSelect).toHaveText('Seguro de Auto');
  });

  test('desde el diálogo del navbar envía el JSON y "Entendido" cierra el diálogo', async ({ page, isMobile }) => {
    const submissions = await mockJsonSubmission(page, LEAD_ENDPOINT, respond.success());
    const site = new Site(page);
    // A product page: the dialog's form coexists with the inline one and is never prefilled.
    await site.goto('/seguros/auto');
    if (isMobile) await site.openMobileMenu();
    await site.navLeadButton.click();
    const dialog = LeadForm.inDialog(page);
    await expect(dialog.typeSelect).toHaveText('Selecciona un tipo de seguro');

    await dialog.fill({ ...lead, tipoSeguro: 'Seguro de Vida' });
    await dialog.submit();
    await expect(dialog.successHeading).toBeVisible();
    expect(submissions).toHaveLength(1);
    expectLeadRequest(submissions[0], 'vida');

    await dialog.dismissButton.click();
    await expect(site.leadDialog).toBeHidden();
  });
});

test.describe('LeadForm: validación', () => {
  test('muestra los mensajes de zod al enviar y quita cada uno en cuanto se corrige su campo', async ({ page }) => {
    const submissions = await mockJsonSubmission(page, LEAD_ENDPOINT, respond.success());
    await page.goto('/contacto');
    const form = LeadForm.inMain(page);

    // Leaving an invalid field shows nothing yet (`mode: 'onSubmit'`).
    await form.nameInput.fill('A');
    await form.emailInput.fill('maria@');
    await form.phoneInput.fill('123');
    await form.messageInput.focus();
    await expect(form.error('El nombre es requerido')).toBeHidden();

    await form.submit();
    await expect(form.error('El nombre es requerido')).toBeVisible();
    await expect(form.nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(form.error('Email inválido')).toBeVisible();
    await expect(form.error('Número de teléfono inválido')).toBeVisible();
    await expect(form.error('Por favor seleccione un tipo de seguro')).toBeVisible();
    await expect(form.error('Debes aceptar los términos y condiciones')).toBeVisible();
    expect(submissions).toHaveLength(0);

    // Then each field re-validates as it changes (`reValidateMode: 'onChange'`), without leaving it.
    await form.nameInput.fill(lead.nombre);
    await expect(form.error('El nombre es requerido')).toBeHidden();
    await expect(form.nameInput).toHaveAttribute('aria-invalid', 'false');
    await form.emailInput.fill(lead.email);
    await expect(form.error('Email inválido')).toBeHidden();
    await expect(form.emailInput).toBeFocused();
  });

  test('un solo clic en "Obtener Mi Asesoría" envía tras corregir el último campo inválido', async ({ page }) => {
    const submissions = await mockJsonSubmission(page, LEAD_ENDPOINT, respond.success());
    await page.goto('/contacto');
    const form = LeadForm.inMain(page);
    await form.fill(lead);

    await form.nameInput.fill('A');
    await form.submit();
    await expect(form.error('El nombre es requerido')).toBeVisible();
    await form.nameInput.fill(lead.nombre);

    // The click's mousedown blurs the fixed name field, which must not move the button.
    await form.submit();
    // The mocked response is immediate; a lost click never gets there.
    await expect(form.successHeading).toBeVisible({ timeout: 2000 });
    expect(submissions).toHaveLength(1);
  });
});

test.describe('LeadForm: respuestas del servidor', () => {
  let form: LeadForm;

  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto');
    form = LeadForm.inMain(page);
    await form.fill(lead);
  });

  test('un 403 de CSRF muestra "Error de Seguridad" y recarga la página a los 2 s', async ({ page, consoleErrors }) => {
    consoleErrors.allow(FAILED_REQUEST);
    // The real server's body (api/send-email.ts); the client reloads only when it carries the CSRF error code.
    await mockJsonSubmission(page, LEAD_ENDPOINT, respond.json(403, { message: 'Invalid CSRF token', code: CSRF_ERROR_CODE }));
    await page.clock.install();

    await form.submit();
    await expect(form.toast('Error de Seguridad')).toContainText('Token de seguridad inválido. Recargando página...');

    const reloaded = page.waitForEvent('load');
    await page.clock.runFor(2000);
    await reloaded;
    await expect(form.nameInput).toHaveValue('');
  });

  test('un 400 con `errors` marca cada campo y muestra un toast', async ({ page, consoleErrors }) => {
    consoleErrors.allow(FAILED_REQUEST);
    // Messages the client-side schema never produces, so they can only come from the server.
    await mockJsonSubmission(
      page,
      LEAD_ENDPOINT,
      respond.json(400, {
        message: 'Datos inválidos.',
        errors: { email: ['El correo no es válido en el servidor'], tipoSeguro: ['El tipo de seguro es requerido'] },
      }),
    );

    await form.submit();
    await expect(form.toast('Por favor revisa los campos del formulario')).toBeVisible();
    await expect(form.error('El correo no es válido en el servidor')).toBeVisible();
    await expect(form.error('El tipo de seguro es requerido')).toBeVisible();
    await expect(form.emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(form.successHeading).toBeHidden();
  });

  test('tras un 400 el botón vuelve a "Obtener Mi Asesoría"', async ({ page, consoleErrors }) => {
    consoleErrors.allow(FAILED_REQUEST);
    await mockJsonSubmission(page, LEAD_ENDPOINT, respond.json(400, { message: 'Datos inválidos.', errors: { nombre: ['Muy corto'] } }));

    await form.submit();
    await expect(form.toast('Por favor revisa los campos del formulario')).toBeVisible();
    // The toast is shown in the same tick the loading state should end, so a short wait is enough.
    await form.expectSubmitReady({ timeout: 1000 });
  });

  test('otro error del servidor muestra "Error al enviar solicitud" con su mensaje', async ({ page, consoleErrors }) => {
    consoleErrors.allow(FAILED_REQUEST);
    await mockJsonSubmission(page, LEAD_ENDPOINT, respond.json(500, { message: 'El servicio de correo no responde.' }));

    await form.submit();
    await expect(form.toast('Error al enviar solicitud')).toContainText('El servicio de correo no responde.');
    await form.expectSubmitReady();
    await expect(form.nameInput).toHaveValue(lead.nombre);
  });

  test('un error de red muestra "Error al enviar solicitud"', async ({ page, consoleErrors }) => {
    consoleErrors.allow(FAILED_REQUEST);
    await mockJsonSubmission(page, LEAD_ENDPOINT, respond.networkError());

    await form.submit();
    await expect(form.toast('Error al enviar solicitud')).toBeVisible();
    await form.expectSubmitReady();
  });

  test('un error de red explica el problema en español', async ({ page, consoleErrors }) => {
    consoleErrors.allow(FAILED_REQUEST);
    await mockJsonSubmission(page, LEAD_ENDPOINT, respond.networkError());

    await form.submit();
    const toast = form.toast('Error al enviar solicitud');
    await expect(toast).toBeVisible();
    expect(await toast.textContent()).not.toContain('Failed to fetch');
  });
});

test.describe('LeadForm: tipo de seguro en páginas de producto', () => {
  // One test per route: ten page loads in a single test outrun its timeout on a busy machine.
  for (const type of PRODUCT_TYPES) {
    test(`el formulario de /seguros/${type} muestra su tipo de seguro`, async ({ page }) => {
      await page.goto(`/seguros/${type}`);
      await expect(LeadForm.inMain(page).typeSelect).toHaveText(typeLabel(type));
    });
  }

  test('al navegar a otro producto desde el footer, el formulario cambia de tipo', async ({ page }) => {
    const submissions = await mockJsonSubmission(page, LEAD_ENDPOINT, respond.success());
    const site = new Site(page);
    await site.goto('/seguros/vida');
    const form = LeadForm.inMain(page);
    await expect(form.typeSelect).toHaveText('Seguro de Vida');

    await site.footer.getByRole('link', { name: 'Auto', exact: true }).click();
    await expect(site.h1).toHaveText('Seguro de Auto');
    await expect(form.typeSelect).toHaveText('Seguro de Auto', { timeout: 1000 });

    await form.fill({ ...lead, tipoSeguro: undefined });
    await form.submit();
    await expect(form.successHeading).toBeVisible();
    expectLeadRequest(submissions[0], 'auto');
  });
});

test.describe('LeadForm: dónde se muestra', () => {
  test.beforeEach(({ sanity }) => {
    sanity.posts = [blogPost()];
  });

  for (const path of ['/blog', '/blog/mi-post']) {
    test(`en la barra lateral de ${path}`, async ({ page }) => {
      await page.goto(path);
      const form = LeadForm.inMain(page);
      await expect(page.getByRole('heading', { name: '¡Hablemos de tu Protección!', exact: true })).toBeVisible();
      await expect(form.nameInput).toBeVisible();
      await form.expectSubmitReady();
    });
  }
});
