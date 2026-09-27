import { test, expect, FAILED_REQUEST } from '../../fixtures/network';
import { CSRF_TOKEN, field, mockCsrfFailure, mockMultipartSubmission, respond } from '../../fixtures/api-mocks';
import {
  SERVICE_REQUEST_FORMS,
  ServiceRequestFormPage,
  serviceRequest,
  TERMS_REQUIRED_MESSAGE,
  type ServiceRequestConfig,
} from '../../fixtures/page-objects/service-request-form';
import { applicant, MB, pdfFile, pngFile, textFile } from '../../fixtures/test-data';

type FormName = ServiceRequestConfig['name'];

/**
 * A realistic 400 per form: input the client accepts but the server rejects.
 * Modificación's server trims the textarea; cancelación's enforces cédula
 * length and a phone regex (api/send-cancellation-request.ts).
 */
const SERVER_FIELD_ERRORS: Record<FormName, { cedula?: string; detalle?: string; errors: Record<string, string[]> }> = {
  Modificación: {
    detalle: '   ',
    errors: { modificaciones: ['Las modificaciones son requeridas'] },
  },
  Cancelación: {
    cedula: '12345',
    errors: {
      numeroCedula: ['El número de cédula debe tener al menos 6 caracteres'],
      telefono: ['Número de teléfono inválido'],
    },
  },
};

/** Each server's real 403 body when its CSRF check fails, and the bug it triggers (if any). */
const REAL_CSRF_403: Record<FormName, { message: string; knownBug?: string }> = {
  Modificación: { message: 'Invalid CSRF token' }, // api/send-modification-request.ts:113
  Cancelación: {
    message: 'Token de seguridad inválido', // api/send-cancellation-request.ts:126
    knownBug:
      'Known bug: the server answers a CSRF failure with "Token de seguridad inválido", but the client only reloads when the message contains "CSRF", so it shows a generic error instead, src/components/forms/cancelacion/CancellationForm.tsx:145.',
  },
};

/** Line of each form's catch block, whose Spanish fallback never applies to a failed fetch. */
const NETWORK_ERROR_LINE: Record<FormName, number> = { Modificación: 180, Cancelación: 181 };

for (const config of SERVICE_REQUEST_FORMS) {
  test.describe(`${config.name} de póliza`, () => {
    test('token CSRF: si falla muestra "Error de Seguridad", y "Reintentar" carga el formulario', async ({ page, consoleErrors }) => {
      consoleErrors.allow(FAILED_REQUEST, /^Error fetching CSRF token:/);
      const form = new ServiceRequestFormPage(page, config);
      await mockCsrfFailure(page);
      await page.goto(config.path);

      await expect(form.csrfErrorHeading).toBeVisible();
      await expect(page.getByText('Error: Failed to fetch CSRF token: 500')).toBeVisible();
      await expect(form.submitButton).toHaveCount(0);

      // Hold the retry so the loading state can be seen.
      const release = await form.holdCsrf();
      await form.csrfRetryButton.click();
      await expect(form.csrfLoading).toBeVisible();
      await expect(form.csrfErrorHeading).toBeHidden();
      await expect(form.submitButton).toHaveCount(0);

      release();
      await expect(form.nameInput).toBeVisible();
      await expect(form.csrfLoading).toBeHidden();
      await expect(form.submitButton).toBeEnabled();
    });

    test.describe('Formulario', () => {
      let form: ServiceRequestFormPage;

      test.beforeEach(async ({ page }) => {
        form = new ServiceRequestFormPage(page, config);
        await form.open();
      });

      test.describe('Envío', () => {
        test('envía datos, documentos y token CSRF; "Entendido" reinicia el formulario', async ({ page }) => {
          const submissions = await mockMultipartSubmission(page, config.endpoint, respond.success());
          await form.fillValid();
          await form.upload(pdfFile('poliza.pdf'), pngFile('soporte.png'));
          await form.submitButton.click();

          await expect(form.successHeading).toBeVisible();
          await expect(page.getByText(config.successWarning)).toBeVisible();
          await expect(page.getByRole('button', { name: config.secondaryAction })).toBeVisible();

          expect(submissions).toHaveLength(1);
          const [sent] = submissions;
          expect(sent.headers['x-csrf-token']).toBe(CSRF_TOKEN);
          expect(field(sent, 'nombreCompleto')).toBe(applicant.nombreCompleto);
          expect(field(sent, 'numeroCedula')).toBe(applicant.numeroCedula);
          expect(field(sent, 'telefono')).toBe(applicant.telefonoE164);
          expect(field(sent, 'email')).toBe(applicant.email);
          expect(field(sent, 'nombreAseguradora')).toBe(serviceRequest.aseguradora);
          expect(field(sent, 'numeroPoliza')).toBe(serviceRequest.numeroPoliza);
          expect(field(sent, 'tipoSeguro')).toBe('auto');
          expect(field(sent, 'otroSeguro')).toBe('');
          expect(field(sent, config.detalleField)).toBe(serviceRequest.detalle);
          expect(field(sent, 'aceptaTerminosYPolitica')).toBe('true');
          expect(field(sent, 'website')).toBe(''); // honeypot stays empty for humans
          expect(sent.files.documentosAdicionales?.map(f => [f.filename, f.contentType])).toEqual([
            ['poliza.pdf', 'application/pdf'],
            ['soporte.png', 'image/png'],
          ]);

          await page.getByRole('button', { name: 'Entendido' }).click();
          await form.expectEmptyForm();
        });

        test(`"Otro" pide especificar el seguro y lo envía; "${config.secondaryAction}" reinicia el formulario`, async ({ page }) => {
          const submissions = await mockMultipartSubmission(page, config.endpoint, respond.success());
          await expect(form.otroSeguroInput).toHaveCount(0);
          await form.fillValid({ tipoSeguro: 'Otro' });
          await form.otroSeguroInput.fill('Seguro de bicicleta');
          await form.submitButton.click();

          await expect(form.successHeading).toBeVisible();
          const [sent] = submissions;
          expect(field(sent, 'tipoSeguro')).toBe('otro');
          expect(field(sent, 'otroSeguro')).toBe('Seguro de bicicleta');
          expect(sent.files.documentosAdicionales).toBeUndefined();

          await page.getByRole('button', { name: config.secondaryAction }).click();
          await form.expectEmptyForm();
        });
      });

      test.describe('Validación', () => {
        test('valida el correo al salir del campo', async ({ page }) => {
          const emailError = page.getByText('Correo electrónico inválido');
          // Valid for a type=email input, rejected by zod.
          await form.emailInput.fill('maria@example');
          await form.emailInput.press('Tab');
          await expect(emailError).toBeVisible();

          // Before the first submit, errors only update on blur (mode 'onBlur').
          await form.emailInput.fill(applicant.email);
          await expect(emailError).toBeVisible();
          await form.emailInput.press('Tab');
          await expect(emailError).toBeHidden();
        });

        test('tras corregir el correo, un solo clic en enviar envía la solicitud', async ({ page, isMobile }) => {
          test.skip(isMobile, 'On the mobile viewport the field is scrolled out of view and the click lands.');
          test.fail(
            true,
            `Known bug: the first click on submit after fixing an invalid field is lost. mousedown blurs the field, onBlur validation removes its error message, the button moves up before mouseup and the click never fires, ${config.sourceFile}:61 (mode 'onBlur').`,
          );
          const submissions = await mockMultipartSubmission(page, config.endpoint, respond.success());
          await form.fillValid();
          await form.emailInput.fill('maria@example');
          await form.emailInput.press('Tab');
          await expect(page.getByText('Correo electrónico inválido')).toBeVisible();

          await form.emailInput.fill(applicant.email);
          await form.submitButton.click();
          // A click that lands submits at once to the mock; don't wait the full default timeout.
          await expect.poll(() => submissions.length, { timeout: 2000 }).toBe(1);
          await expect(form.successHeading).toBeVisible();
        });

        test('no envía sin aceptar la política y los términos', async ({ page }) => {
          const submissions = await mockMultipartSubmission(page, config.endpoint, respond.success());
          await form.fillRequired();
          await form.submitButton.click();

          await expect(page.getByText(TERMS_REQUIRED_MESSAGE)).toBeVisible();
          await expect(form.successHeading).toBeHidden();
          expect(submissions).toHaveLength(0);
        });
      });

      test.describe('Archivos', () => {
        test('rechaza tipos de archivo no permitidos', async ({ page }) => {
          await form.fileInput.setInputFiles(textFile('notas.txt'));
          await expect(page.getByText('El tipo de archivo no es válido. Solo puedes subir: PDF, JPG, PNG, WEBP, DOC, DOCX.')).toBeVisible();
          await expect(form.removeFileButton('notas.txt')).toHaveCount(0);
        });

        test('no envía si los archivos suman más de 4MB', async ({ page }) => {
          const submissions = await mockMultipartSubmission(page, config.endpoint, respond.success());
          await form.fillValid();
          await form.upload(pdfFile('poliza.pdf', 2.5 * MB), pdfFile('anexo.pdf', 2.5 * MB));
          await form.submitButton.click();

          await expect(form.toast('Archivos demasiado grandes')).toContainText('excede el límite de 4MB');
          await expect(form.submitButton).toBeEnabled();
          expect(submissions).toHaveLength(0);
        });
      });

      test.describe('Respuestas del servidor', () => {
        test.beforeEach(({ consoleErrors }) => {
          consoleErrors.allow(FAILED_REQUEST);
        });

        test('400 con errores de campo: muestra el mensaje del servidor junto al campo', async ({ page }) => {
          const { cedula, detalle, errors } = SERVER_FIELD_ERRORS[config.name];
          const submissions = await mockMultipartSubmission(
            page,
            config.endpoint,
            respond.json(400, { message: 'Datos inválidos.', errors }),
          );
          await form.fillValid({ cedula });
          if (detalle !== undefined) await form.detalleInput.fill(detalle);
          await form.submitButton.click();

          await expect(form.toast('Por favor revisa los campos del formulario')).toBeVisible();
          for (const [name, [message]] of Object.entries(errors)) {
            await expect(page.getByText(message, { exact: true }), name).toBeVisible();
          }
          await expect(form.successHeading).toBeHidden();
          expect(submissions).toHaveLength(1);
        });

        test('500: muestra el error del servidor y permite reintentar', async ({ page }) => {
          const submissions = await mockMultipartSubmission(
            page,
            config.endpoint,
            respond.json(500, { message: 'Error interno del servidor.' }),
            respond.success(),
          );
          await form.fillValid();
          await form.submitButton.click();

          const errorToast = form.toastTitled(config.errorToastTitle);
          await expect(errorToast).toContainText('Error interno del servidor.');
          await expect(form.nameInput).toHaveValue(applicant.nombreCompleto);

          await form.submitButton.click();
          await expect(form.successHeading).toBeVisible();
          expect(submissions).toHaveLength(2);
        });

        test('403 por CSRF con la respuesta real del servidor: avisa y recarga la página', async ({ page }) => {
          const { message, knownBug } = REAL_CSRF_403[config.name];
          test.fail(!!knownBug, knownBug);
          await mockMultipartSubmission(page, config.endpoint, respond.json(403, { message }));
          await form.fillValid();
          await form.submitButton.click();

          // A toast shows either way; its text is final once it does. The reload follows 2 s later.
          const shownToast = form.toast(/./);
          await expect(shownToast).toBeVisible();
          await expect(shownToast).toContainText('Token de seguridad inválido. Recargando página...', { timeout: 1000 });
          await page.waitForEvent('load');
          await expect(form.nameInput).toHaveValue('');
        });

        test('error de red: muestra un mensaje de conexión en español', async ({ page }) => {
          test.fail(
            true,
            `Known bug: a failed fetch shows the browser's English "Failed to fetch"; the Spanish fallback is only used for non-Error values, ${config.sourceFile}:${NETWORK_ERROR_LINE[config.name]}.`,
          );
          await mockMultipartSubmission(page, config.endpoint, respond.networkError());
          await form.fillValid();
          await form.submitButton.click();

          const errorToast = form.toastTitled(config.errorToastTitle);
          await expect(errorToast).toBeVisible();
          // The toast's text is final once it shows.
          await expect(errorToast).toContainText('No se pudo conectar con el servidor', { timeout: 1000 });
        });
      });
    });
  });
}
