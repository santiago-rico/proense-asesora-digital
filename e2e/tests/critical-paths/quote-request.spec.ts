import { test, expect, FAILED_REQUEST } from '../../fixtures/network';
import { CSRF_TOKEN, mockCsrfFailure, mockJsonSubmission, QUOTE_ENDPOINT, respond } from '../../fixtures/api-mocks';
import {
  QUOTE_TYPE_LABELS,
  QuoteFormPage,
  quoteApplicant,
  type QuoteType,
} from '../../fixtures/page-objects/quote-form';

const RELATIONSHIP = '¿Cuál es tu relación con el inmueble?';
const COMMENT = 'Prefiero que me contacten por WhatsApp.';
/** Typed with spaces and capitals: the client sends it trimmed and lowercased. */
const TYPED_EMAIL = '  Maria.Gomez@Example.COM ';

interface TypeCase {
  type: QuoteType;
  /** Summary rows (label → shown value) that this type adds. */
  summary: Record<string, string>;
  /** Step 3 fields this type sends; every other type's field must be sent as ''. */
  sent: Record<string, string>;
}

const HEALTH_SENT = {
  height: '170',
  weight: '68',
  epsName: 'Sura EPS',
  practicesSports: 'si',
  sportsDetails: 'Natación',
  hasHealthConditions: 'no',
  healthConditionsDetails: '',
};

const TYPE_CASES: TypeCase[] = [
  {
    type: 'vida',
    summary: {
      'Ingreso Mensual': '$5.000.000 COP',
      'Estado Civil': 'Casado/a',
      '¿Tiene Hijos?': 'Sí',
      Estatura: '170 cm',
      Peso: '68 kg',
      EPS: 'Sura EPS',
      '¿Practica Deportes?': 'Sí',
      'Deportes que Practica': 'Natación',
      '¿Tiene Enfermedades?': 'No',
    },
    sent: { monthlyIncome: '5000000', maritalStatus: 'casado', hasChildren: 'si', ...HEALTH_SENT },
  },
  {
    type: 'salud',
    summary: {}, // the salud answers are missing from the summary (bug #4, tested below)
    sent: HEALTH_SENT,
  },
  {
    type: 'auto',
    summary: {
      'Placa del Vehículo': 'ABC123',
      'Ciudad de Circulación': 'Medellín',
      'Tipo de Vehículo': 'Usado',
      'Uso Principal del Vehículo': 'Familiar',
      '¿Tiene Accesorios o Modificaciones?': 'Sí',
      'Valor Estimado de Accesorios': '$2.000.000 COP',
      'Tipo de Accesorios': 'Rines de lujo',
    },
    sent: {
      vehiclePlate: 'ABC123',
      vehicleCity: 'Medellín',
      vehicleType: 'usado',
      vehicleUse: 'familiar',
      hasAccessories: 'si',
      accessoriesValue: '2000000',
      accessoriesType: 'rines_lujo',
    },
  },
  {
    type: 'hogar',
    summary: {
      'Relación con el Inmueble': 'Propietario/a y habito el inmueble',
      'Tipo de Vivienda': 'Apartamento',
      'Tipo de Construcción': 'Concreto reforzado',
      'Año de Construcción': '2005',
      'Piso de Ubicación del Predio': '3',
      'Número de Pisos del Edificio': '10',
      Estrato: 'Estrato 4',
      'Área de la Vivienda (M2)': '80 M2',
      'Valor de la Propiedad': '$350.000.000 COP',
      'Método de Aseguramiento': 'Valor Comercial',
      '¿Desea Asegurar Contenidos?': 'Sí',
      'Valor de los Contenidos': '$50.000.000 COP',
    },
    sent: {
      propertyRelationship: 'propietario_habita',
      ownerName: '',
      ownerCedula: '',
      residesInProperty: '',
      insuredPropertyAddress: 'Carrera 7 # 80-20 Apto 301',
      insuredPropertyCity: 'Bogotá',
      propertyType: 'apartamento',
      constructionType: 'concreto_reforzado',
      constructionYear: '2005',
      unitFloor: '3',
      buildingFloors: '10',
      estrato: 'estrato_4',
      propertyArea: '80',
      hasEconomicActivity: 'no',
      propertyValue: '350000000',
      insuranceMethod: 'valor_comercial',
      wantsContentsCoverage: 'si',
      contentsValue: '50000000',
      electricContentsValue: '',
    },
  },
  {
    type: 'mascotas',
    summary: {
      'Tipo de Mascota': 'Perro',
      'Nombre de la Mascota': 'Luna',
      'Sexo de la Mascota': 'Hembra',
      'Edad de la Mascota': '3 años',
      'Raza de la Mascota': 'Criollo',
      '¿Tiene Esquema de Vacunas al Día?': 'Sí',
      '¿Ha Tenido Enfermedades o Accidentes Graves?': 'Sí',
      'Enfermedades o Accidentes': 'Fractura de pata en 2025',
    },
    sent: {
      petType: 'perro',
      petName: 'Luna',
      petGender: 'hembra',
      petAge: '3 años',
      petBreed: 'Criollo',
      petVaccinated: 'si',
      petHasSeriousIllness: 'si',
      petSeriousIllnessDetails: 'Fractura de pata en 2025',
    },
  },
];

const DETAIL_FIELDS = [...new Set(TYPE_CASES.flatMap(c => Object.keys(c.sent)))];

// Known-bug tests give the assertion the bug breaks a 2 s timeout: the correct
// state appears at once, so there's no point idling for the default 5 s.

test.describe('Cotización de seguros', () => {
  let form: QuoteFormPage;

  test.beforeEach(async ({ page }) => {
    form = new QuoteFormPage(page);
    await form.open();
  });

  test.describe('Solicitudes completas', () => {
    for (const { type, summary, sent } of TYPE_CASES) {
      test(`${QUOTE_TYPE_LABELS[type]}: resume y envía la cotización, y "Entendido" reinicia el formulario`, async ({ page }) => {
        const submissions = await mockJsonSubmission(page, QUOTE_ENDPOINT, respond.success());

        await form.startQuote(type, { email: TYPED_EMAIL });
        await form.fillDetails(type);
        await form.input('Comentarios adicionales').fill(COMMENT);
        await form.next('Resumen y Envío');

        const rows = {
          Nombre: quoteApplicant.firstName,
          'Fecha de Nacimiento': '15 de Marzo de 1990',
          Teléfono: quoteApplicant.phoneE164,
          'Estado Laboral': quoteApplicant.employmentStatus,
          'Tipo de Seguro': QUOTE_TYPE_LABELS[type],
          ...summary,
          'Comentarios Adicionales': COMMENT,
        };
        for (const [label, value] of Object.entries(rows)) {
          await expect(form.summaryValue(label), label).toHaveText(value);
        }

        await form.acceptTerms();
        await form.submit();
        await expect(form.successHeading).toBeVisible();
        await expect(page.getByText(TYPED_EMAIL.trim())).toBeVisible();

        expect(submissions).toHaveLength(1);
        const [{ headers, body }] = submissions;
        expect(headers['content-type']).toContain('application/json');
        expect(headers['x-csrf-token']).toBe(CSRF_TOKEN);
        for (const [key, value] of Object.entries(body)) {
          expect(typeof value, key).toBe('string');
        }
        expect(body).not.toHaveProperty('birthDate');
        expect(body).toMatchObject({
          firstName: quoteApplicant.firstName,
          lastName: quoteApplicant.lastName,
          birthDate_day: '15',
          birthDate_month: '3',
          birthDate_year: '1990',
          phoneNumber: quoteApplicant.phoneE164,
          email: 'maria.gomez@example.com',
          cedula: quoteApplicant.cedula,
          city: quoteApplicant.city,
          address: quoteApplicant.address,
          employmentStatus: 'empleado_completo',
          occupationSector: quoteApplicant.occupationSector,
          insuranceType: type,
          additionalComments: COMMENT,
          acceptTerms: 'true',
          website: '', // honeypot stays empty for humans
        });
        for (const key of DETAIL_FIELDS) {
          expect(body[key], key).toBe(sent[key] ?? '');
        }

        await page.getByRole('button', { name: 'Entendido' }).click();
        await form.expectStep('Información Personal');
        await expect(form.firstNameInput).toHaveValue('');
      });
    }
  });

  test.describe('Paso 1: Información Personal', () => {
    test('muestra los mensajes de validación de cada campo', async () => {
      await form.next();
      await form.expectStep('Información Personal');
      for (const message of [
        'El nombre es requerido',
        'El apellido es requerido',
        'Día inválido',
        'Mes requerido',
        'Año inválido',
        'Número de teléfono inválido',
        'Email inválido',
        'Número de cédula requerido',
        'Ciudad requerida',
        'Dirección requerida',
        'Selecciona tu situación laboral',
      ]) {
        await expect(form.message(message)).toBeVisible();
      }

      await form.birthDayInput.fill('32');
      await form.birthYearInput.fill('1850');
      await form.cedulaInput.fill('10.203.040');
      await form.next();
      await expect(form.message('Día inválido')).toBeVisible();
      await expect(form.message('Año inválido')).toBeVisible();
      await expect(form.message('Solo números permitidos')).toBeVisible();
      await expect(form.message('Número de cédula requerido')).toBeHidden();

      await form.fillPersonalInfo();
      await form.next('Tipo de Seguro');
    });

    test('"Actividad laboral o sector económico" solo aparece para quien trabaja o recibe pensión', async () => {
      const shown: Record<string, boolean> = {
        'Empleado(a) a tiempo completo': true,
        'Empleado(a) a tiempo parcial': true,
        'Trabajador(a) autónomo(a) / Freelance': true,
        'Desempleado(a)': false,
        Estudiante: false,
        'Jubilado(a)': true,
        'Ama de casa': false,
        'Incapacidad laboral': true,
      };
      await form.choose('Estado laboral', 'Empleado(a) a tiempo completo');
      await form.occupationInput.fill(quoteApplicant.occupationSector);
      for (const [status, visible] of Object.entries(shown)) {
        await form.choose('Estado laboral', status);
        await expect(form.occupationInput, status).toBeVisible({ visible });
      }
      // A status that hides the field drops the sector typed before, so it never
      // reaches the summary or the email under a status that doesn't ask for it.
      await expect(form.occupationInput).toHaveValue('');
    });

    test('tras corregir el último campo inválido, un solo clic en "Siguiente" avanza', async () => {
      // A field near the button: when the fixed field is scrolled out of view,
      // Chrome's scroll anchoring keeps the button still and the click lands.
      await form.fillPersonalInfo({ address: '' });
      await form.next();
      await expect(form.message('Dirección requerida')).toBeVisible();
      await form.input('Dirección').fill(quoteApplicant.address);
      await form.nextButton.click(); // focus is still in the address field
      await expect(form.stepHeading('Tipo de Seguro')).toBeVisible();
    });

    test('exige la actividad laboral antes de pasar al paso 2', async () => {
      await form.fillPersonalInfo({ occupationSector: '' });
      await form.next();
      await expect(form.occupationInput).toHaveAccessibleDescription('La actividad laboral o sector económico es requerida');
      await form.expectStep('Información Personal');
    });

    test('los selectores vacíos muestran su mensaje en español', async () => {
      await form.next();
      await expect(form.employmentSelect).toHaveAccessibleDescription('Selecciona tu situación laboral');
      await form.fillPersonalInfo();
      await form.next('Tipo de Seguro');
      await form.next();
      await expect(form.insuranceTypeSelect).toHaveAccessibleDescription('Selecciona un tipo de seguro');
    });
  });

  test.describe('Paso 2: Tipo de Seguro', () => {
    test('no avanza sin tipo de seguro y conserva los datos al volver', async ({ page }) => {
      await form.fillPersonalInfo();
      await form.next('Tipo de Seguro');
      await form.next();
      await form.expectStep('Tipo de Seguro');
      // The placeholder repeats the error text, so check the message wired to the control.
      await expect(form.insuranceTypeSelect).toHaveAttribute('aria-invalid', 'true');
      await expect(form.insuranceTypeSelect).toHaveAccessibleDescription(/\S/);

      await form.insuranceTypeSelect.click();
      await expect(page.getByRole('option')).toHaveText(Object.values(QUOTE_TYPE_LABELS));
      await page.getByRole('option', { name: 'Seguro de Hogar', exact: true }).click();
      await form.next('Detalles del Seguro');
      await expect(page.getByRole('heading', { name: 'Relación con el inmueble' })).toBeVisible();

      await form.prev('Tipo de Seguro');
      await expect(form.insuranceTypeSelect).toHaveText('Seguro de Hogar');
      await form.prev('Información Personal');
      await expect(form.firstNameInput).toHaveValue(quoteApplicant.firstName);
      await expect(form.select('Mes de nacimiento')).toHaveText('Marzo');
      await expect(form.prevButton).toBeHidden();
    });
  });

  test.describe('Paso 3: Detalles del Seguro', () => {
    test('Salud y Vida: exigen los datos de salud y el detalle de cada respuesta "Sí"', async () => {
      const sportsDetails = form.input('¿Qué deportes practicas?');
      const healthDetails = form.input('¿Qué enfermedades?');

      await form.startQuote('salud');
      await expect(sportsDetails).toBeHidden();
      await expect(healthDetails).toBeHidden();
      await form.next();
      await form.expectStep('Detalles del Seguro');
      for (const message of [
        'La estatura es requerida para seguro de salud',
        'El peso es requerido para seguro de salud',
        'El nombre de la EPS es requerido para seguro de salud',
        'Indica si practicas algún deporte',
        'Indica si tienes o padeces alguna enfermedad',
      ]) {
        await expect(form.message(message)).toBeVisible();
      }

      await form.choose('Practicas algún deporte', 'Sí');
      await form.choose('¿Tienes o padeces alguna enfermedad?', 'Sí');
      await form.next();
      await expect(form.message('Debes especificar qué deportes practicas')).toBeVisible();
      await expect(form.message('Debes describir las enfermedades que padeces')).toBeVisible();

      // Vida shares these answers and adds income, marital status and children.
      await form.prev('Tipo de Seguro');
      await form.chooseInsurance('vida');
      await form.next('Detalles del Seguro');
      await form.next();
      for (const message of [
        'Los ingresos mensuales son requeridos para seguro de vida',
        'El estado civil es requerido para seguro de vida',
        'Indica si tienes hijos',
        'La estatura es requerida para seguro de vida',
        'El peso es requerido para seguro de vida',
        'El nombre de la EPS es requerido para seguro de vida',
        'Debes especificar qué deportes practicas',
        'Debes describir las enfermedades que padeces',
      ]) {
        await expect(form.message(message)).toBeVisible();
      }

      await form.choose('Practicas algún deporte', 'No');
      await form.choose('¿Tienes o padeces alguna enfermedad?', 'No');
      await expect(sportsDetails).toBeHidden();
      await expect(healthDetails).toBeHidden();
    });

    test('Auto: exige los datos del vehículo, y el valor y tipo de accesorios solo si los tiene', async () => {
      const accessoriesValue = form.input('Valor estimado de accesorios');
      const accessoriesType = form.select('Tipo de accesorios');

      await form.startQuote('auto');
      await expect(accessoriesValue).toBeHidden();
      await form.next();
      for (const message of [
        'La placa del vehículo es requerida',
        'La ciudad de circulación es requerida',
        'El tipo de vehículo es requerido',
        'El uso principal del vehículo es requerido',
      ]) {
        await expect(form.message(message)).toBeVisible();
      }

      await form.choose('¿El vehículo tiene accesorios o modificaciones?', 'Sí');
      await form.next();
      await expect(form.message('El valor estimado de accesorios es requerido')).toBeVisible();
      await expect(form.message('El tipo de accesorios es requerido')).toBeVisible();

      await form.choose('¿El vehículo tiene accesorios o modificaciones?', 'No');
      await expect(accessoriesValue).toBeHidden();
      await expect(accessoriesType).toBeHidden();
      await form.input('Placa del vehículo').fill('ABC123');
      await form.input('Ciudad de circulación').fill('Medellín');
      await form.choose('Tipo de vehículo', 'Nuevo (0 Km)');
      await form.choose('Uso del principal del vehículo', 'Al servicio de una empresa');
      await form.next('Resumen y Envío');
    });

    test('Hogar: al cotizar a nombre de otra persona pide los datos del propietario', async () => {
      const ownerFields = [
        form.input('Nombre completo del propietario'),
        form.input('Cédula del propietario'),
        form.input('Fecha de nacimiento del propietario (Opcional)'),
        form.select('¿El propietario habita el inmueble?'),
      ];

      await form.startQuote('hogar');
      for (const field of ownerFields) await expect(field).toBeHidden();

      await form.choose(RELATIONSHIP, 'Cotizo a nombre del propietario (otra persona)');
      for (const field of ownerFields) await expect(field).toBeVisible();
      await form.input('Cédula del propietario').fill('CC 123');
      await form.next();
      await expect(form.message('El nombre del propietario es requerido')).toBeVisible();
      await expect(form.message('Solo números permitidos')).toBeVisible();
      await expect(form.message('Indica si el propietario habita el inmueble')).toBeVisible();

      await form.input('Cédula del propietario').fill('');
      await form.next();
      await expect(form.message('La cédula del propietario es requerida')).toBeVisible();

      await form.choose(RELATIONSHIP, 'Propietario/a y habito el inmueble');
      for (const field of ownerFields) await expect(field).toBeHidden();
    });

    test('Hogar: un apartamento pide su piso y el total de pisos, y el año de construcción va de 1900 al año actual', async () => {
      const unitFloor = form.input('Piso en el que se ubica el apartamento');
      const houseFloors = form.input('Número de pisos de la vivienda (Opcional)');
      const year = form.input('Año de construcción (aproximado)');
      const currentYear = new Date().getFullYear();

      await form.startQuote('hogar');
      await expect(unitFloor).toBeHidden();
      await expect(houseFloors).toBeVisible();

      await form.choose('Tipo de vivienda', 'Apartamento');
      await expect(houseFloors).toBeHidden(); // relabelled as the building's total floors
      await form.next();
      await expect(form.message('El piso del apartamento es requerido')).toBeVisible();
      await expect(form.message('El total de pisos del edificio es requerido')).toBeVisible();
      await expect(form.message('El año de construcción es requerido')).toBeVisible();

      await unitFloor.fill('12');
      await form.input('Total de pisos del edificio').fill('10');
      await year.fill('1899');
      await form.next();
      await expect(form.message('El piso del apartamento no puede ser mayor que el total de pisos')).toBeVisible();
      await expect(form.message('Ingresa un año de construcción válido')).toBeVisible();

      await year.fill(String(currentYear + 1));
      await form.next();
      await expect(form.message('Ingresa un año de construcción válido')).toBeVisible();

      await unitFloor.fill('10');
      await year.fill(String(currentYear));
      await form.next();
      await expect(form.message('El piso del apartamento no puede ser mayor que el total de pisos')).toBeHidden();
      await expect(form.message('Ingresa un año de construcción válido')).toBeHidden();
      await year.fill('1900');
      await form.next();
      await expect(form.message('Ingresa un año de construcción válido')).toBeHidden();

      await form.choose('Tipo de vivienda', 'Casa');
      await expect(unitFloor).toBeHidden();
      await expect(houseFloors).toBeVisible();
    });

    test('Hogar: un arrendatario asegura solo contenidos; un propietario elige si los incluye', async ({ page }) => {
      const propertyValue = form.input('Valor de la propiedad (en pesos)');
      const insuranceMethod = form.select('¿Cómo deseas asegurar el predio?');
      const wantsContents = '¿Deseas asegurar también los contenidos de tu hogar?';
      const tenantNote = page.getByText('Como arrendatario/a, tu seguro cubre los contenidos de tu hogar.');
      const contentsFields = [
        'Valor de los contenidos (muebles y enseres)',
        'Valor de contenidos eléctricos (Opcional)',
        'Valor a asegurar por hurto (Opcional)',
        'Todo riesgo contenidos portátiles (Opcional)',
      ].map(label => form.input(label));

      await form.startQuote('hogar');
      await form.choose(RELATIONSHIP, 'Arrendatario/a — vivo en arriendo');
      await expect(tenantNote).toBeVisible();
      for (const hidden of [propertyValue, insuranceMethod, form.select(wantsContents)]) await expect(hidden).toBeHidden();
      for (const field of contentsFields) await expect(field).toBeVisible();
      await form.next();
      await expect(form.message('El valor de los contenidos es requerido')).toBeVisible();
      await expect(form.message('El valor de la propiedad es requerido')).toBeHidden();

      await form.choose(RELATIONSHIP, 'Propietario/a, no lo habito (arrendado o desocupado)');
      await expect(tenantNote).toBeHidden();
      for (const field of contentsFields) await expect(field).toBeHidden();
      await propertyValue.fill('0');
      await form.next();
      await expect(form.message('El valor de la propiedad debe ser un número positivo')).toBeVisible();
      await expect(form.message('Selecciona cómo deseas asegurar el predio')).toBeVisible();
      await expect(form.message('Indica si deseas asegurar los contenidos')).toBeVisible();

      await form.choose(wantsContents, 'Sí');
      for (const field of contentsFields) await expect(field).toBeVisible();
      await form.next();
      await expect(form.message('El valor de los contenidos es requerido')).toBeVisible();
    });

    test('Hogar: una cédula de propietario inválida no bloquea al dejar de cotizar a nombre de otra persona', async () => {
      await form.startQuote('hogar');
      await form.choose(RELATIONSHIP, 'Cotizo a nombre del propietario (otra persona)');
      await form.input('Cédula del propietario').fill('CC 123');
      await form.fillHogar(); // switches to "Propietario/a y habito el inmueble"
      await form.next('Resumen y Envío');
      await expect(form.summaryValue('Relación con el Inmueble')).toHaveText('Propietario/a y habito el inmueble');
      // Leaving "tercero" clears the hidden owner fields: the stale cédula is not shown (nor sent).
      await expect(form.summaryValue('Cédula del Propietario')).toBeHidden();
    });

    test('Mascotas: exige los datos de la mascota y el detalle si tuvo una enfermedad o accidente grave', async () => {
      const illness = '¿Tu mascota ha tenido enfermedades o accidentes graves en el último año?';
      const details = form.input('¿Qué enfermedades o accidentes tuvo tu mascota?');

      await form.startQuote('mascotas');
      await expect(details).toBeHidden();
      await form.next();
      for (const message of [
        'El tipo de mascota es requerido',
        'El nombre de la mascota es requerido',
        'El sexo de la mascota es requerido',
        'La edad de la mascota es requerida',
        'La raza de la mascota es requerida',
        'Indica si tu mascota ha tenido enfermedades o accidentes graves',
      ]) {
        await expect(form.message(message)).toBeVisible();
      }

      await form.choose(illness, 'Sí');
      await form.next();
      await expect(form.message('Debes describir las enfermedades o accidentes de tu mascota')).toBeVisible();
      await form.choose(illness, 'No');
      await expect(details).toBeHidden();
    });
  });

  test.describe('Paso 4: Resumen y Envío', () => {
    test('no envía sin aceptar la política y los términos', async ({ page }) => {
      const submissions = await mockJsonSubmission(page, QUOTE_ENDPOINT, respond.success());
      const termsMessage = form.message('Debes aceptar la política de privacidad y los términos y condiciones para continuar');
      await form.reachSummary('auto');
      await form.submit();

      await expect(form.toast('Faltan datos por completar')).toBeVisible();
      await expect(termsMessage).toBeVisible();
      await form.expectStep('Resumen y Envío');
      await form.acceptTerms();
      await expect(termsMessage).toBeHidden();
      expect(submissions).toHaveLength(0);
    });

    test('Salud: el resumen muestra las respuestas de salud y la actividad laboral', async () => {
      test.fail(
        true,
        'Known bug: the summary shows none of the salud answers (saludFields lists only preExistingConditions and additionalComments) and never shows occupationSector (missing from personalInfoFields), src/components/forms/cotizacion/Step5_Summary.tsx:267, 204-214.',
      );
      await form.reachSummary('salud');
      await expect(form.summaryValue('Estatura')).toHaveText('170 cm', { timeout: 2000 });
      await expect(form.summaryValue('Peso')).toHaveText('68 kg');
      await expect(form.summaryValue('EPS')).toHaveText('Sura EPS');
      await expect(form.summaryValue('¿Practica Deportes?')).toHaveText('Sí');
      await expect(form.summaryValue('¿Tiene Enfermedades?')).toHaveText('No');
      await expect(form.summaryValue('Actividad Laboral o Sector Económico')).toHaveText(quoteApplicant.occupationSector);
    });
  });

  test.describe('Respuestas del servidor', () => {
    test.beforeEach(async ({ consoleErrors }) => {
      consoleErrors.allow(FAILED_REQUEST);
      await form.reachSummary('auto');
      await form.acceptTerms();
    });

    test('500 y error de red: avisan, conservan los datos y permiten reintentar sin reenvíos automáticos', async ({ page, consoleErrors }) => {
      consoleErrors.allow(/^API Error:/, /^Error de red u otro error:/);
      const submissions = await mockJsonSubmission(
        page,
        QUOTE_ENDPOINT,
        respond.json(500, { message: 'Error enviando email de notificación al agente.' }),
        respond.networkError(),
        respond.success(),
      );

      await form.submit();
      const serverError = form.toast('Error al Enviar Cotización');
      await expect(serverError).toBeVisible();
      await expect(serverError).toContainText('Error enviando email de notificación al agente.');
      await form.expectStep('Resumen y Envío');
      await expect(form.submitButton).toBeEnabled();
      expect(submissions).toHaveLength(1);

      await form.submit();
      await expect(form.toast('Error de Conexión')).toBeVisible();
      await expect(form.submitButton).toBeEnabled();
      expect(submissions).toHaveLength(2);

      await form.submit();
      await expect(form.successHeading).toBeVisible();
      expect(submissions).toHaveLength(3);
    });

    test('400 con errores de campo: vuelve al paso del campo y muestra el mensaje del servidor', async ({ page }) => {
      await mockJsonSubmission(
        page,
        QUOTE_ENDPOINT,
        respond.json(400, { message: 'Datos inválidos.', errors: { email: ['Correo electrónico inválido'] } }),
      );
      await form.submit();

      await expect(form.toast('Por favor revisa los campos del formulario')).toBeVisible();
      await form.expectStep('Información Personal');
      await expect(form.emailInput).toHaveAccessibleDescription('Correo electrónico inválido');
    });

    test('400 con errores de la fecha de nacimiento: vuelve al paso 1 y muestra el mensaje', async ({ page }) => {
      test.fail(
        true,
        'Known bug: server errors keyed birthDate_day/_month/_year match no step field, so the form stays on the summary with only a toast, src/components/forms/cotizacion/MultiStepQuoteForm.tsx:219-237.',
      );
      await mockJsonSubmission(
        page,
        QUOTE_ENDPOINT,
        respond.json(400, { message: 'Datos inválidos.', errors: { birthDate_day: ['Día inválido'] } }),
      );
      await form.submit();

      await expect(form.toast('Por favor revisa los campos del formulario')).toBeVisible();
      await expect(form.stepHeading('Información Personal')).toBeVisible({ timeout: 2000 });
      await expect(form.birthDayInput).toHaveAccessibleDescription('Día inválido');
    });

    test('403 por CSRF: avisa y recarga la página', async ({ page }) => {
      await mockJsonSubmission(page, QUOTE_ENDPOINT, respond.json(403, { message: 'Invalid CSRF token' }));
      await form.submit();

      await expect(form.toast('Token de seguridad inválido. Recargando página...')).toBeVisible();
      await page.waitForEvent('load');
      await form.expectStep('Información Personal');
      await expect(form.firstNameInput).toHaveValue('');
    });
  });
});

test.describe('Cotización de seguros: sin token CSRF', () => {
  test('el botón de envío queda deshabilitado en "Cargando..."', async ({ page, consoleErrors }) => {
    consoleErrors.allow(FAILED_REQUEST);
    await mockCsrfFailure(page);
    const form = new QuoteFormPage(page);
    await form.open();
    await form.reachSummary('auto');
    await form.acceptTerms();

    await expect(page.getByRole('button', { name: 'Cargando...' })).toBeDisabled();
    await expect(form.submitButton).toBeHidden();
  });
});
