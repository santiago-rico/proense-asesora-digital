import { describe, it, expect, vi } from 'vitest';

// The module under test imports the Brevo client at top level; mock it so
// importing the file never needs API keys or network access. The template
// components themselves are NOT mocked — these tests render the real HTML.
vi.mock('../src/utils/brevo.js', () => ({
  sendTransactionalEmail: vi.fn(),
}));

import { QuoteRequestTemplate, type QuoteRequestData } from './send-quote-request';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Step 1 personal data shared by every insurance type. */
function basePersonalData(): QuoteRequestData {
  return {
    firstName: 'María',
    lastName: 'Gómez',
    birthDate: { day: '05', month: '11', year: '1990' },
    phoneNumber: '+573001234567',
    email: 'maria.gomez@example.com',
    cedula: '1234567890',
    city: 'Bogotá',
    address: 'Calle 123 #45-67',
    employmentStatus: 'empleado_completo',
    occupationSector: 'Tecnología',
    insuranceType: 'vida',
    acceptTerms: true,
  };
}

/** Hogar fixture: every field the hogar form collects, fully filled in. */
function completeHogarData(): QuoteRequestData {
  return {
    ...basePersonalData(),
    insuranceType: 'hogar',
    insuredPropertyAddress: 'Carrera 7 #45-10 Apto 501',
    insuredPropertyCity: 'Medellín',
    propertyRelationship: 'propietario_habita',
    propertyType: 'apartamento',
    constructionType: 'concreto_reforzado',
    constructionYear: '2015',
    unitFloor: '5',
    buildingFloors: '12',
    basementCount: '2',
    estrato: 'estrato_4',
    propertyArea: '85',
    hasEconomicActivity: 'no',
    propertyValue: '350000000',
    insuranceMethod: 'valor_comercial',
    wantsContentsCoverage: 'si',
    contentsValue: '40000000',
    electricContentsValue: '15000000',
    theftValue: '10000000',
    portableContentsValue: '8000000',
  };
}

/** Renders the agent-facing notification email. */
const renderAgentEmail = (data: QuoteRequestData) => QuoteRequestTemplate(data, false);

/** Asserts that both the row label and the row value appear in the HTML. */
function expectRow(html: string, label: string, value: string) {
  expect(html).toContain(label);
  expect(html).toContain(value);
}

const NO_SUMINISTRADO = 'NO SUMINISTRADO — revisar con el cliente';

// ---------------------------------------------------------------------------
// Shared sections
// ---------------------------------------------------------------------------

describe('QuoteRequestTemplate - agent email, shared sections', () => {
  it('renders every personal-information row', async () => {
    const html = await renderAgentEmail(basePersonalData());

    expectRow(html, 'Nombre Completo', 'María Gómez');
    expectRow(html, 'Correo Electrónico', 'maria.gomez@example.com');
    expectRow(html, 'Teléfono', '+573001234567');
    expectRow(html, 'Cédula', '1234567890');
    expectRow(html, 'Fecha de Nacimiento', '05/11/1990');
    expectRow(html, 'Ciudad', 'Bogotá');
    expectRow(html, 'Dirección', 'Calle 123 #45-67');
    expectRow(html, 'Situación Laboral', 'Empleado(a) a tiempo completo');
    expectRow(html, 'Actividad Laboral o Sector Económico', 'Tecnología');
  });

  it('renders the additional comments section when provided', async () => {
    const html = await renderAgentEmail({
      ...basePersonalData(),
      additionalComments: 'Prefiero ser contactada después de las 6pm.',
    });

    expectRow(html, 'Comentarios Adicionales del Cliente', 'Prefiero ser contactada después de las 6pm.');
  });

  it('omits the additional comments section when not provided', async () => {
    const html = await renderAgentEmail(basePersonalData());
    expect(html).not.toContain('Comentarios Adicionales del Cliente');
  });
});

// ---------------------------------------------------------------------------
// Vida
// ---------------------------------------------------------------------------

describe('QuoteRequestTemplate - vida', () => {
  const vidaData = (): QuoteRequestData => ({
    ...basePersonalData(),
    insuranceType: 'vida',
    monthlyIncome: '1500000',
    maritalStatus: 'Casado(a)',
    hasChildren: 'si',
    height: '170',
    weight: '65',
    epsName: 'Sura EPS',
    practicesSports: 'si',
    sportsDetails: 'Ciclismo de montaña',
    hasHealthConditions: 'si',
    healthConditionsDetails: 'Hipertensión controlada',
  });

  it('renders every vida field the form collects', async () => {
    const html = await renderAgentEmail(vidaData());

    expectRow(html, 'Tipo de Seguro', 'Seguro de Vida');
    expectRow(html, 'Ingresos Mensuales', '$1.500.000 COP');
    expectRow(html, 'Estado Civil', 'Casado(a)');
    expectRow(html, 'Tiene Hijos', 'Sí');
    expectRow(html, 'Estatura', '170 cm');
    expectRow(html, 'Peso', '65 kg');
    expectRow(html, 'EPS', 'Sura EPS');
    expect(html).toContain('Practica Deportes');
    expectRow(html, 'Deportes que Practica', 'Ciclismo de montaña');
    expect(html).toContain('Tiene Enfermedades');
    expectRow(html, 'Detalles de Enfermedades', 'Hipertensión controlada');
  });

  it('omits the detail rows when sports/health answers are "no"', async () => {
    const html = await renderAgentEmail({
      ...vidaData(),
      practicesSports: 'no',
      sportsDetails: undefined,
      hasHealthConditions: 'no',
      healthConditionsDetails: undefined,
    });

    expect(html).toContain('Practica Deportes');
    expect(html).toContain('Tiene Enfermedades');
    expect(html).not.toContain('Deportes que Practica');
    expect(html).not.toContain('Detalles de Enfermedades');
  });
});

// ---------------------------------------------------------------------------
// Auto
// ---------------------------------------------------------------------------

describe('QuoteRequestTemplate - auto', () => {
  const autoData = (): QuoteRequestData => ({
    ...basePersonalData(),
    insuranceType: 'auto',
    vehiclePlate: 'ABC123',
    vehicleCity: 'Cali',
    vehicleType: 'usado',
    vehicleUse: 'familiar',
    hasAccessories: 'si',
    accessoriesValue: '3200000',
    accessoriesType: 'rines_lujo',
  });

  it('renders every auto field including accessories when hasAccessories is "si"', async () => {
    const html = await renderAgentEmail(autoData());

    expectRow(html, 'Tipo de Seguro', 'Seguro de Auto');
    expectRow(html, 'Placa del Vehículo', 'ABC123');
    expectRow(html, 'Ciudad de Circulación', 'Cali');
    expectRow(html, 'Tipo de Vehículo', 'Usado');
    expectRow(html, 'Uso Principal del Vehículo', 'Familiar');
    expect(html).toContain('¿Tiene Accesorios o Modificaciones?');
    expectRow(html, 'Valor Estimado de Accesorios', '$3.200.000 COP');
    expectRow(html, 'Tipo de Accesorios', 'Rines de lujo');
  });

  it('omits accessory detail rows when hasAccessories is "no"', async () => {
    const html = await renderAgentEmail({
      ...autoData(),
      hasAccessories: 'no',
      accessoriesValue: undefined,
      accessoriesType: undefined,
    });

    expect(html).toContain('¿Tiene Accesorios o Modificaciones?');
    expect(html).not.toContain('Valor Estimado de Accesorios');
    expect(html).not.toContain('Tipo de Accesorios');
  });
});

// ---------------------------------------------------------------------------
// Salud
// ---------------------------------------------------------------------------

describe('QuoteRequestTemplate - salud', () => {
  const saludData = (): QuoteRequestData => ({
    ...basePersonalData(),
    insuranceType: 'salud',
    height: '165',
    weight: '58',
    epsName: 'Compensar',
    practicesSports: 'si',
    sportsDetails: 'Natación',
    hasHealthConditions: 'si',
    healthConditionsDetails: 'Asma leve',
    preExistingConditions: 'Asma diagnosticada en 2018',
  });

  it('renders the pre-existing conditions row', async () => {
    const html = await renderAgentEmail(saludData());

    expectRow(html, 'Tipo de Seguro', 'Seguro de Salud');
    expectRow(html, 'Condiciones Preexistentes', 'Asma diagnosticada en 2018');
  });

  // #165 bug class: these fields used to render only inside the `vida` branch,
  // so salud submissions reached the agent with no medical data at all.
  it('renders the salud health fields (height/weight/EPS/sports/conditions)', async () => {
    const html = await renderAgentEmail(saludData());

    expectRow(html, 'Estatura', '165 cm');
    expectRow(html, 'Peso', '58 kg');
    expectRow(html, 'EPS', 'Compensar');
    expect(html).toContain('Practica Deportes');
    expectRow(html, 'Deportes que Practica', 'Natación');
    expect(html).toContain('Tiene Enfermedades');
    expectRow(html, 'Detalles de Enfermedades', 'Asma leve');
  });
});

// ---------------------------------------------------------------------------
// Mascotas
// ---------------------------------------------------------------------------

describe('QuoteRequestTemplate - mascotas', () => {
  const mascotasData = (): QuoteRequestData => ({
    ...basePersonalData(),
    insuranceType: 'mascotas',
    petType: 'perro',
    petName: 'Rocky',
    petGender: 'macho',
    petAge: '4 años',
    petBreed: 'Golden Retriever',
    petVaccinated: 'si',
    petHasSeriousIllness: 'si',
    petSeriousIllnessDetails: 'Fractura de pata en 2024',
  });

  it('renders every mascotas field including illness details when "si"', async () => {
    const html = await renderAgentEmail(mascotasData());

    expectRow(html, 'Tipo de Seguro', 'Seguro de Mascotas');
    expectRow(html, 'Tipo de Mascota', 'Perro');
    expectRow(html, 'Nombre de la Mascota', 'Rocky');
    expectRow(html, 'Sexo de la Mascota', 'Macho');
    expectRow(html, 'Edad de la Mascota', '4 años');
    expectRow(html, 'Raza de la Mascota', 'Golden Retriever');
    expect(html).toContain('¿Tiene Esquema de Vacunas al Día?');
    expect(html).toContain('¿Ha Tenido Enfermedades o Accidentes Graves en el Último Año?');
    expectRow(html, 'Detalles de Enfermedades o Accidentes', 'Fractura de pata en 2024');
  });

  it('omits illness details when petHasSeriousIllness is "no"', async () => {
    const html = await renderAgentEmail({
      ...mascotasData(),
      petHasSeriousIllness: 'no',
      petSeriousIllnessDetails: undefined,
    });

    expect(html).toContain('¿Ha Tenido Enfermedades o Accidentes Graves en el Último Año?');
    expect(html).not.toContain('Detalles de Enfermedades o Accidentes');
  });
});

// ---------------------------------------------------------------------------
// Hogar
// ---------------------------------------------------------------------------

describe('QuoteRequestTemplate - hogar', () => {
  it('propietario_habita with full data renders every row and no fallback', async () => {
    const html = await renderAgentEmail(completeHogarData());

    expectRow(html, 'Tipo de Seguro', 'Seguro de Hogar');
    expectRow(html, 'Relación con el Inmueble', 'Propietario/a y habito el inmueble');
    expectRow(html, 'Dirección del Inmueble a Asegurar', 'Carrera 7 #45-10 Apto 501');
    expectRow(html, 'Ciudad del Inmueble a Asegurar', 'Medellín');
    expectRow(html, 'Tipo de Vivienda', 'Apartamento');
    expectRow(html, 'Tipo de Construcción', 'Concreto reforzado');
    expectRow(html, 'Año de Construcción', '2015');
    expectRow(html, 'Piso de Ubicación del Predio', '5');
    expectRow(html, 'Número de Pisos del Edificio', '12');
    expectRow(html, 'Número de Sótanos', '2');
    expectRow(html, 'Estrato', 'Estrato 4');
    expectRow(html, 'Área de la Vivienda', '85 M2');
    expect(html).toContain('¿Se Desarrolla Actividad Económica?');
    expectRow(html, 'Valor de la Propiedad', '$350.000.000 COP');
    expectRow(html, 'Método de Aseguramiento', 'Valor Comercial');
    expect(html).toContain('¿Desea Asegurar Contenidos?');
    expectRow(html, 'Valor de los Contenidos', '$40.000.000 COP');
    expectRow(html, 'Valor de Contenidos Eléctricos', '$15.000.000 COP');
    expectRow(html, 'Valor a Asegurar por Hurto', '$10.000.000 COP');
    expectRow(html, 'Todo Riesgo Contenidos Portátiles', '$8.000.000 COP');

    expect(html).not.toContain('NO SUMINISTRADO');
  });

  it('propietario_no_habita with an empty property value shows the highlighted fallback', async () => {
    const html = await renderAgentEmail({
      ...completeHogarData(),
      propertyRelationship: 'propietario_no_habita',
      propertyValue: undefined,
    });

    expectRow(html, 'Relación con el Inmueble', 'Propietario/a, no lo habito (arrendado o desocupado)');
    expect(html).toContain('Valor de la Propiedad');
    expect(html).toContain(NO_SUMINISTRADO);
  });

  it('arrendatario with a contents value renders contents but no property-value or method rows', async () => {
    const html = await renderAgentEmail({
      ...completeHogarData(),
      propertyRelationship: 'arrendatario',
      propertyValue: undefined,
      insuranceMethod: undefined,
      wantsContentsCoverage: undefined,
      contentsValue: '25000000',
    });

    expectRow(html, 'Relación con el Inmueble', 'Arrendatario/a — vivo en arriendo');
    expect(html).not.toContain('Valor de la Propiedad');
    expect(html).not.toContain('Método de Aseguramiento');
    expectRow(html, 'Valor de los Contenidos', '$25.000.000 COP');
    expect(html).not.toContain(NO_SUMINISTRADO);
  });

  it('arrendatario with an empty contents value shows the fallback on the contents row', async () => {
    const html = await renderAgentEmail({
      ...completeHogarData(),
      propertyRelationship: 'arrendatario',
      propertyValue: undefined,
      insuranceMethod: undefined,
      wantsContentsCoverage: undefined,
      contentsValue: undefined,
    });

    expect(html).toContain('Valor de los Contenidos');
    expect(html).toContain(NO_SUMINISTRADO);
  });

  it('tercero renders the owner rows', async () => {
    const html = await renderAgentEmail({
      ...completeHogarData(),
      propertyRelationship: 'tercero',
      ownerName: 'Carlos Pérez',
      ownerCedula: '98765432',
      ownerBirthDate: '10/03/1965',
      residesInProperty: 'si',
    });

    expectRow(html, 'Relación con el Inmueble', 'Cotizo a nombre del propietario (otra persona)');
    expectRow(html, 'Nombre del Propietario', 'Carlos Pérez');
    expectRow(html, 'Cédula del Propietario', '98765432');
    expectRow(html, 'Fecha de Nacimiento del Propietario', '10/03/1965');
    expect(html).toContain('¿El propietario habita el inmueble?');
  });

  it('legacy payloads carrying propertyUse still render the "Uso de la Vivienda" row', async () => {
    const html = await renderAgentEmail({
      ...completeHogarData(),
      propertyRelationship: undefined,
      propertyUse: 'propio',
    });

    expectRow(html, 'Uso de la Vivienda', 'Propio');
  });
});

// ---------------------------------------------------------------------------
// User-facing confirmation email
// ---------------------------------------------------------------------------

describe('QuoteRequestTemplate - user confirmation email', () => {
  it('renders without throwing and greets the user by first name', async () => {
    const html = await QuoteRequestTemplate(completeHogarData(), true);

    expect(html).toContain('María');
    expect(html).toContain('Resumen de tu Solicitud');
    expectRow(html, 'Tipo de Seguro', 'Seguro de Hogar');
  });
});
