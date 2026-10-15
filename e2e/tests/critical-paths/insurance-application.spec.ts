import { test, expect, FAILED_REQUEST } from '../../fixtures/network';
import {
  DECLARACION_ASESORIA_POINTS,
  DECLARACION_ASESORIA_REQUIRED_MESSAGE,
} from '../../../src/data/declaracionAsesoria';
import {
  HOGAR_ASEGURABILIDAD_QUESTIONS,
  HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE,
  getAsegurabilidadQuestions,
  type HogarAsegurabilidadKey,
} from '../../../src/data/hogarAsegurabilidad';
import { CSRF_TOKEN, field, mockEmisionSubmission, respond } from '../../fixtures/api-mocks';
import { InsuranceFormPage, type SiNo } from '../../fixtures/page-objects/insurance-form';
import { applicant, company, MB, pdfFile, pngFile, textFile } from '../../fixtures/test-data';

const HOGAR_ANSWERS: Record<HogarAsegurabilidadKey, SiNo> = {
  hogarPiscina: 'si',
  hogarMaterialesNoConvencionales: 'no',
  hogarEnConstruccion: 'no',
  hogarPatrimonio: 'no',
  hogarRiesgoTerreno: 'si',
  hogarFisurasHumedad: 'no',
  hogarDanoSismico: 'no',
};

const EMPRESARIAL_ANSWERS: Record<HogarAsegurabilidadKey, SiNo> = {
  hogarPiscina: 'no',
  hogarMaterialesNoConvencionales: 'no',
  hogarEnConstruccion: 'si',
  hogarPatrimonio: 'no',
  hogarRiesgoTerreno: 'no',
  hogarFisurasHumedad: 'no',
  hogarDanoSismico: 'si',
};

test.describe('Emisión de pólizas', () => {
  let form: InsuranceFormPage;

  test.beforeEach(async ({ page }) => {
    form = new InsuranceFormPage(page);
    await form.open();
  });

  test.describe('Solicitudes completas', () => {
    test('Seguro de Autos: envía datos y documentos, y "Entendido" reinicia el formulario', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.success());

      await form.reachSummaryAsAuto();
      await expect(form.summaryValue('Nombre Completo')).toHaveText(applicant.nombreCompleto);
      await expect(form.summaryValue('Tipo de Seguro Solicitado')).toHaveText('auto');
      await expect(form.summaryValue('Tarjeta de Propiedad (Autos)')).toContainText('tarjeta-propiedad.pdf');

      await form.submitButton.click();
      await expect(form.successHeading).toBeVisible();
      await expect(page.getByText(applicant.email)).toBeVisible();

      expect(submissions).toHaveLength(1);
      const [sent] = submissions;
      expect(sent.headers['x-csrf-token']).toBe(CSRF_TOKEN);
      expect(field(sent, 'nombreCompleto')).toBe(applicant.nombreCompleto);
      expect(field(sent, 'telefono')).toBe(applicant.telefonoE164);
      expect(field(sent, 'email')).toBe(applicant.email);
      expect(field(sent, 'tipoSeguro')).toBe('auto');
      expect(field(sent, 'metodoPago')).toBe('tarjeta_credito');
      expect(field(sent, 'periodicidadPago')).toBe('mensual');
      expect(field(sent, 'numeroCedula')).toBe(applicant.numeroCedula);
      expect(field(sent, 'declaraRenta')).toBe('si');
      expect(field(sent, 'aceptaDeclaracionAsesoria')).toBe('true');
      expect(field(sent, 'aceptaTerminosYPolitica')).toBe('true');
      expect(field(sent, 'website')).toBe(''); // honeypot stays empty for humans
      expect(sent.files.fotoCedula?.map(f => f.filename)).toEqual(['cedula.png']);
      expect(sent.files.tarjetaPropiedad?.map(f => f.filename)).toEqual(['tarjeta-propiedad.pdf']);
      expect(sent.files.archivoDeclaracionRenta?.map(f => f.filename)).toEqual(['declaracion-renta.pdf']);

      await page.getByRole('button', { name: 'Entendido' }).click();
      await form.expectStep('Información Básica');
      await expect(form.nameInput).toHaveValue('');
    });

    test('Seguro de Vida: beneficiarios y datos financieros de no declarante', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.success());

      await form.startApplication('Seguro de Vida');
      await form.fillCommonDetails();
      await page.getByLabel('Nombre completo de beneficiarios').fill('Ana Gómez, hija, 50%; Luis Gómez, hijo, 50%');
      await form.upload('Documento de identidad beneficiarios', pdfFile('ti-ana.pdf'), pdfFile('ti-luis.pdf'));
      await form.next('Declaración');

      await form.setDeclaraRenta('no');
      await form.fillNonDeclarantFinancials({ ingresos: '4500000', egresos: '3000000', activos: '120000000', pasivos: '20000000' });
      await form.next('Resumen y Envío');
      await expect(form.summaryValue('¿Declara Renta?')).toHaveText('No');
      await expect(form.summaryValue('Ingresos Mensuales (No Declarante)')).toHaveText('4500000');

      await form.acceptDeclarationAndTerms();
      await form.submitButton.click();
      await expect(form.successHeading).toBeVisible();

      const [sent] = submissions;
      expect(field(sent, 'tipoSeguro')).toBe('vida');
      expect(field(sent, 'beneficiarios')).toBe('Ana Gómez, hija, 50%; Luis Gómez, hijo, 50%');
      expect(sent.files.documentosBeneficiarios?.map(f => f.filename)).toEqual(['ti-ana.pdf', 'ti-luis.pdf']);
      expect(field(sent, 'declaraRenta')).toBe('no');
      expect(field(sent, 'ingresosNoDeclarante')).toBe('4500000');
      expect(field(sent, 'egresosNoDeclarante')).toBe('3000000');
      expect(field(sent, 'activosNoDeclarante')).toBe('120000000');
      expect(field(sent, 'pasivosNoDeclarante')).toBe('20000000');
      expect(sent.files.archivoDeclaracionRenta).toBeUndefined();
    });

    test('Seguro de Hogar: declaración de asegurabilidad con respuestas "Sí" no bloquea el envío', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.success());

      await form.startApplication('Seguro de Hogar');
      await form.fillCommonDetails();
      await form.upload('Certificado de libertad y tradición', pdfFile('certificado-libertad.pdf'));
      await expect(page.getByText('Responde con veracidad; una declaración inexacta puede afectar la validez de tu póliza.')).toBeVisible();
      await form.answerDeclaration(HOGAR_ANSWERS);
      await form.next('Declaración');

      await form.upload('Archivo declaración renta', pdfFile('declaracion-renta.pdf'));
      await form.next('Resumen y Envío');
      for (const { key, shortLabel } of HOGAR_ASEGURABILIDAD_QUESTIONS) {
        await expect(form.summaryValue(shortLabel)).toHaveText(HOGAR_ANSWERS[key] === 'si' ? 'Sí' : 'No');
      }

      await form.acceptDeclarationAndTerms();
      await form.submitButton.click();
      await expect(form.successHeading).toBeVisible();

      const [sent] = submissions;
      expect(field(sent, 'tipoSeguro')).toBe('hogar');
      expect(sent.files.certificadoLibertad?.map(f => f.filename)).toEqual(['certificado-libertad.pdf']);
      for (const { key } of HOGAR_ASEGURABILIDAD_QUESTIONS) {
        expect(field(sent, key), key).toBe(HOGAR_ANSWERS[key]);
      }
    });

    test('Seguro Empresarial: documentos de la empresa y declaración de asegurabilidad con su propia redacción', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.success());

      await form.startApplication('Seguro Empresarial');
      await form.fillEmpresarialDetails();
      await expect(page.getByRole('group', { name: /Declaración de asegurabilidad/ })).not.toContainText(/tu hogar/i);
      await form.answerDeclaration(EMPRESARIAL_ANSWERS, 'empresarial');
      await form.next('Declaración');

      await form.upload('Archivo declaración renta', pdfFile('declaracion-renta.pdf'));
      await form.next('Resumen y Envío');
      await expect(form.summaryValue('NIT (Empresarial)')).toHaveText(company.nit);
      for (const { key, shortLabel } of getAsegurabilidadQuestions('empresarial')) {
        await expect(form.summaryValue(shortLabel)).toHaveText(EMPRESARIAL_ANSWERS[key] === 'si' ? 'Sí' : 'No');
      }

      await form.acceptDeclarationAndTerms();
      await form.submitButton.click();
      await expect(form.successHeading).toBeVisible();

      const [sent] = submissions;
      expect(field(sent, 'tipoSeguro')).toBe('empresarial');
      expect(field(sent, 'numeroCedulaRepLegal')).toBe(company.numeroCedulaRepLegal);
      expect(field(sent, 'nit')).toBe(company.nit);
      expect(sent.files.fotoCedulaRepLegal?.map(f => f.filename)).toEqual(['cedula-rep-legal.png']);
      expect(sent.files.rut?.map(f => f.filename)).toEqual(['rut.pdf']);
      expect(sent.files.camaraComercio?.map(f => f.filename)).toEqual(['camara-comercio.pdf']);
      for (const { key } of HOGAR_ASEGURABILIDAD_QUESTIONS) {
        expect(field(sent, key), key).toBe(EMPRESARIAL_ANSWERS[key]);
      }
    });
  });

  test.describe('Navegación', () => {
    test('conserva los datos al ir y volver entre pasos', async ({ page }) => {
      await form.startApplication('Seguro de Hogar');
      await form.cedulaInput.fill(applicant.numeroCedula);
      await form.declarationGroup('hogarPiscina').getByRole('radio', { name: 'Sí', exact: true }).check();

      await form.prev('Selección de Seguro');
      await expect(page.getByRole('combobox', { name: 'Tipo de seguro que deseas contratar' })).toHaveText('Seguro de Hogar');
      await expect(page.getByRole('combobox', { name: 'Método de pago preferido' })).toHaveText('Tarjeta de Crédito');
      await expect(page.getByRole('combobox', { name: 'Periodicidad de pago' })).toHaveText('Mensual');

      await form.prev('Información Básica');
      await expect(form.nameInput).toHaveValue(applicant.nombreCompleto);
      await expect(form.emailInput).toHaveValue(applicant.email);
      await expect(form.prevButton).toBeHidden();

      await form.next('Selección de Seguro');
      await form.next('Detalles del Seguro');
      await expect(form.cedulaInput).toHaveValue(applicant.numeroCedula);
      await expect(form.declarationGroup('hogarPiscina').getByRole('radio', { name: 'Sí', exact: true })).toBeChecked();
    });
  });

  test.describe('Validación', () => {
    test('Paso 1: exige nombre, teléfono y email válidos', async ({ page }) => {
      await form.next();
      await form.expectStep('Información Básica');
      await expect(page.getByText('El nombre es requerido')).toBeVisible();
      await expect(page.getByText('Número de teléfono inválido')).toBeVisible();
      await expect(page.getByText('Email inválido')).toBeVisible();

      await form.fillBasicInfo({ nombreCompleto: applicant.nombreCompleto, telefono: '123', email: 'maria@' });
      await form.next();
      await form.expectStep('Información Básica');
      await expect(page.getByText('El nombre es requerido')).toBeHidden();
      await expect(page.getByText('Número de teléfono inválido')).toBeVisible();
      await expect(page.getByText('Email inválido')).toBeVisible();

      await form.fillBasicInfo();
      await form.next('Selección de Seguro');
    });

    test('Paso 1: tras corregir el último campo, un solo clic en "Siguiente" avanza', async ({ page }) => {
      await form.fillBasicInfo({ nombreCompleto: applicant.nombreCompleto, telefono: applicant.telefono, email: 'maria@' });
      await form.next();
      await expect(page.getByText('Email inválido')).toBeVisible();
      await form.emailInput.fill(applicant.email);
      await form.next('Selección de Seguro');
    });

    test('Paso 2: exige tipo de seguro, método y periodicidad de pago', async ({ page }) => {
      await form.fillBasicInfo();
      await form.next('Selección de Seguro');
      await form.next();
      await form.expectStep('Selección de Seguro');
      // The placeholder repeats the error text, so check the message wired to each control.
      await expect(page.getByRole('combobox', { name: 'Tipo de seguro que deseas contratar' }))
        .toHaveAccessibleDescription('Selecciona un tipo de seguro');
      await expect(page.getByRole('combobox', { name: 'Método de pago preferido' }))
        .toHaveAccessibleDescription('Selecciona un método de pago');
      await expect(page.getByRole('combobox', { name: 'Periodicidad de pago' }))
        .toHaveAccessibleDescription('Selecciona la periodicidad de pago');
    });

    test('Hogar: cada pregunta de la declaración es obligatoria y su error desaparece al responderla', async ({ page }) => {
      await form.startApplication('Seguro de Hogar');
      await form.next();
      await form.expectStep('Detalles del Seguro');
      await expect(page.getByText('El número de cédula es requerido.')).toBeVisible();
      await expect(page.getByText('La foto de la cédula es requerida.')).toBeVisible();
      await expect(page.getByText('El certificado de libertad y tradición es requerido.')).toBeVisible();

      const requiredMessages = page.getByText(HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE, { exact: true });
      await expect(requiredMessages).toHaveCount(HOGAR_ASEGURABILIDAD_QUESTIONS.length);
      for (const [index, { key }] of HOGAR_ASEGURABILIDAD_QUESTIONS.entries()) {
        const group = form.declarationGroup(key);
        await expect(group.getByRole('radio', { name: 'Sí', exact: true })).not.toBeChecked();
        await expect(group.getByRole('radio', { name: 'No', exact: true })).not.toBeChecked();
        await group.getByRole('radio', { name: HOGAR_ANSWERS[key] === 'si' ? 'Sí' : 'No', exact: true }).check();
        await expect(requiredMessages).toHaveCount(HOGAR_ASEGURABILIDAD_QUESTIONS.length - index - 1);
      }

      await form.fillCommonDetails();
      await form.upload('Certificado de libertad y tradición', pdfFile('certificado-libertad.pdf'));
      await form.next('Declaración');
    });

    test('Empresarial: no avanza sin responder la declaración de asegurabilidad', async ({ page }) => {
      await form.startApplication('Seguro Empresarial');
      await form.fillEmpresarialDetails();
      await form.next();
      await form.expectStep('Detalles del Seguro');

      const requiredMessages = page.getByText(HOGAR_ASEGURABILIDAD_REQUIRED_MESSAGE, { exact: true });
      await expect(requiredMessages).toHaveCount(HOGAR_ASEGURABILIDAD_QUESTIONS.length);
      await form.answerDeclaration(EMPRESARIAL_ANSWERS, 'empresarial');
      await expect(requiredMessages).toHaveCount(0);
      await form.next('Declaración');
    });

    test('Paso 4: pide el archivo de renta o, si no declara, sus datos financieros', async ({ page }) => {
      await form.startApplication('Seguro de Autos');
      await form.fillCommonDetails();
      await form.upload('Tarjeta de propiedad (ambos lados)', pdfFile('tarjeta-propiedad.pdf'));
      await form.next('Declaración');

      await form.next();
      await form.expectStep('Declaración');
      await expect(page.getByText('El archivo de declaración de renta es requerido.')).toBeVisible();

      await form.setDeclaraRenta('no');
      await form.next();
      await form.expectStep('Declaración');
      for (const message of [
        'Los ingresos son requeridos.',
        'Los egresos son requeridos.',
        'Los activos son requeridos.',
        'Los pasivos son requeridos.',
      ]) {
        await expect(page.getByText(message)).toBeVisible();
      }
    });

    test('Paso 5: muestra la declaración de asesoría completa antes de enviar', async () => {
      await form.reachSummaryAsAuto();

      await expect(form.advisoryDeclaration.getByRole('listitem')).toHaveText([...DECLARACION_ASESORIA_POINTS]);
      await expect(form.advisoryDeclarationCheckbox).toBeChecked();
    });

    test('Paso 5: no envía sin aceptar la declaración de asesoría', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.success());
      await form.reachSummaryAsAuto(); // declaration and terms accepted
      await form.advisoryDeclarationCheckbox.click(); // un-accept the declaration only
      await form.submitButton.click();

      await expect(page.getByText(DECLARACION_ASESORIA_REQUIRED_MESSAGE)).toBeVisible();
      await expect(page.getByText('Debes aceptar la política de privacidad y los términos y condiciones para continuar.')).toBeHidden();
      await form.expectStep('Resumen y Envío');
      expect(submissions).toHaveLength(0);
    });

    test('Paso 5: no envía sin aceptar la política y los términos', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.success());
      await form.reachSummaryAsAuto(); // declaration and terms accepted
      await form.termsCheckbox.click(); // un-accept privacy and terms only
      await form.submitButton.click();

      await expect(page.getByText('Debes aceptar la política de privacidad y los términos y condiciones para continuar.')).toBeVisible();
      await expect(page.getByText(DECLARACION_ASESORIA_REQUIRED_MESSAGE)).toBeHidden();
      await form.expectStep('Resumen y Envío');
      expect(submissions).toHaveLength(0);
    });
  });

  test.describe('Archivos', () => {
    test.beforeEach(async () => {
      await form.startApplication('Seguro de Autos');
    });

    test('acepta un archivo válido y permite quitarlo', async () => {
      await form.upload('Tarjeta de propiedad (ambos lados)', pdfFile('tarjeta-propiedad.pdf'));
      await form.removeFileButton('tarjeta-propiedad.pdf').click();
      await expect(form.removeFileButton('tarjeta-propiedad.pdf')).toBeHidden();
    });

    test('rechaza archivos de más de 5MB', async ({ page }) => {
      await form.fileInput('Tarjeta de propiedad (ambos lados)').setInputFiles(pdfFile('escaneo-grande.pdf', 6 * MB));
      await expect(page.getByText('El archivo "escaneo-grande.pdf" (6.0 MB) excede el tamaño máximo de 5MB.')).toBeVisible();
      await expect(form.removeFileButton('escaneo-grande.pdf')).toBeHidden();
    });

    test('rechaza tipos de archivo no permitidos', async ({ page }) => {
      await form.fileInput('Tarjeta de propiedad (ambos lados)').setInputFiles(textFile('notas.txt'));
      await expect(page.getByText('El tipo de archivo no es válido. Solo puedes subir: PDF, JPG, PNG, WEBP, DOC, DOCX.')).toBeVisible();
      await expect(form.removeFileButton('notas.txt')).toBeHidden();
    });

    test('no envía si los archivos suman más de 4MB', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.success());
      await form.cedulaInput.fill(applicant.numeroCedula);
      await form.upload('Foto cédula (ambos lados)', pngFile('cedula.png'));
      await form.upload('Tarjeta de propiedad (ambos lados)', pdfFile('tarjeta-propiedad.pdf', 2.5 * MB));
      await form.next('Declaración');
      await form.upload('Archivo declaración renta', pdfFile('declaracion-renta.pdf', 2.5 * MB));
      await form.next('Resumen y Envío');
      await form.acceptDeclarationAndTerms();
      await form.submitButton.click();

      await expect(form.toast('Archivos demasiado grandes')).toBeVisible();
      await form.expectStep('Resumen y Envío');
      expect(submissions).toHaveLength(0);
    });
  });

  test.describe('Respuestas del servidor', () => {
    test.beforeEach(({ consoleErrors }) => {
      // The failed request itself, and the form's own logging of it.
      consoleErrors.allow(FAILED_REQUEST, /^API Error:/, /^Error de red u otro error:/);
    });

    const fieldErrorResponse = respond.json(400, {
      message: 'Datos inválidos.',
      errors: { numeroCedula: ['El número de cédula no es válido.'] },
    });

    test('400 con errores de campo: vuelve al paso que contiene el campo', async ({ page }) => {
      await mockEmisionSubmission(page, fieldErrorResponse);
      await form.reachSummaryAsAuto();
      await form.submitButton.click();

      await expect(form.toast('Por favor revisa los campos del formulario')).toBeVisible();
      await form.expectStep('Detalles del Seguro');
    });

    test('400 con errores de campo: muestra el mensaje del servidor junto al campo', async ({ page }) => {
      await mockEmisionSubmission(page, fieldErrorResponse);
      await form.reachSummaryAsAuto();
      await form.submitButton.click();

      await form.expectStep('Detalles del Seguro');
      await expect(page.getByText('El número de cédula no es válido.')).toBeVisible();
    });

    test('400 rechazando la declaración de asesoría: muestra el mensaje en el paso de resumen', async ({ page }) => {
      await mockEmisionSubmission(page, respond.json(400, {
        message: 'Datos inválidos.',
        errors: { aceptaDeclaracionAsesoria: [DECLARACION_ASESORIA_REQUIRED_MESSAGE] },
      }));
      await form.reachSummaryAsAuto();
      await form.submitButton.click();

      await expect(form.toast('Por favor revisa los campos del formulario')).toBeVisible();
      await form.expectStep('Resumen y Envío');
      await expect(form.advisoryDeclaration.getByText(DECLARACION_ASESORIA_REQUIRED_MESSAGE)).toBeVisible();
    });

    test('500: muestra el error del servidor y permite reintentar', async ({ page }) => {
      const submissions = await mockEmisionSubmission(
        page,
        respond.json(500, { message: 'Error enviando email de notificación al agente.' }),
        respond.success(),
      );
      await form.reachSummaryAsAuto();
      await form.submitButton.click();

      const errorToast = form.toast('Error al Enviar Solicitud');
      await expect(errorToast).toBeVisible();
      await expect(errorToast).toContainText('Error enviando email de notificación al agente.');
      await form.expectStep('Resumen y Envío');

      await form.submitButton.click();
      await expect(form.successHeading).toBeVisible();
      expect(submissions).toHaveLength(2);
    });

    test('403 por CSRF: avisa y recarga la página', async ({ page }) => {
      await mockEmisionSubmission(page, respond.json(403, { message: 'Invalid CSRF token' }));
      await form.reachSummaryAsAuto();
      await form.submitButton.click();

      await expect(form.toast('Token de seguridad inválido. Recargando página...')).toBeVisible();
      await page.waitForEvent('load');
      await form.expectStep('Información Básica');
      await expect(form.nameInput).toHaveValue('');
    });

    test('error de red persistente: reintenta una vez y muestra "Error de Conexión"', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.networkError());
      await form.reachSummaryAsAuto();
      await form.submitButton.click();

      await expect(form.toast('Error de Conexión')).toBeVisible();
      await form.expectStep('Resumen y Envío');
      await expect(form.submitButton).toBeEnabled();
      expect(submissions).toHaveLength(2);
    });

    test('error de red transitorio: el reintento automático completa el envío', async ({ page }) => {
      const submissions = await mockEmisionSubmission(page, respond.networkError(), respond.success());
      await form.reachSummaryAsAuto();
      await form.submitButton.click();

      await expect(form.successHeading).toBeVisible();
      expect(submissions).toHaveLength(2);
    });
  });
});

test.describe('Emisión de pólizas: servidor que no responde', () => {
  test('muestra "El envío tardó demasiado" sin reintentar', async ({ page, consoleErrors }) => {
    consoleErrors.allow(/^Error de red u otro error: AbortError/);
    // Fake timers so the client's 63s request timeout can be fast-forwarded.
    await page.clock.install();
    const form = new InsuranceFormPage(page);
    await form.open();
    const submissions = await mockEmisionSubmission(page, respond.hang());
    await form.reachSummaryAsAuto();
    await form.submitButton.click();
    await expect(page.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
    await expect.poll(() => submissions.length).toBe(1);

    await page.clock.fastForward(64_000);
    await expect(form.toast('El envío tardó demasiado')).toBeVisible();
    await expect(form.submitButton).toBeEnabled();
    expect(submissions).toHaveLength(1); // timeouts are not retried (duplicate-email risk)

    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });
});
