import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendTransactionalEmail } from '../src/utils/brevo.js';
import { JSDOM } from 'jsdom';
import { withRateLimit, rateLimitConfigs } from './utils/rate-limiter.js';
import { getNotificationEmails } from './utils/notification-emails.js';
import { backendQuoteSchema } from './schemas/quote-request-schema.js';

// Defines the expected structure of the quote request data
interface QuoteRequestData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  birthDate: {
    day: string;
    month: string;
    year: string;
  };
  phoneNumber: string;
  email: string;
  cedula: string;
  city: string;
  address: string;
  employmentStatus: string;
  occupationSector?: string;

  // Step 2: Insurance Selection
  insuranceType: string;

  // Step 3: Conditional Fields - Vida
  monthlyIncome?: string;
  maritalStatus?: string;
  hasChildren?: 'si' | 'no' | '';
  height?: string;
  weight?: string;
  epsName?: string;
  practicesSports?: 'si' | 'no' | '';
  sportsDetails?: string;
  hasHealthConditions?: 'si' | 'no' | '';
  healthConditionsDetails?: string;

  // Step 3: Conditional Fields - Auto
  vehiclePlate?: string;
  vehicleCity?: string;
  vehicleType?: string;
  vehicleUse?: string;
  hasAccessories?: 'si' | 'no' | '';
  accessoriesValue?: string;
  accessoriesType?: string;

  // Step 3: Conditional Fields - Hogar
  insuredPropertyAddress?: string;
  insuredPropertyCity?: string;
  buildingFloors?: string;
  estrato?: string;
  propertyType?: string;
  propertyUse?: string;
  residesInProperty?: 'si' | 'no' | '';
  propertyArea?: string;
  hasEconomicActivity?: 'si' | 'no' | '';
  propertyValue?: string;
  contentsValue?: string;
  insuranceMethod?: string;

  // Step 3: Conditional Fields - Salud
  preExistingConditions?: string;

  // Step 3: Conditional Fields - Mascotas
  petType?: string;
  petName?: string;
  petGender?: string;
  petAge?: string;
  petBreed?: string;
  petVaccinated?: 'si' | 'no' | '';
  petHasSeriousIllness?: 'si' | 'no' | '';
  petSeriousIllnessDetails?: string;

  // Step 3: Additional Comments
  additionalComments?: string;

  // Step 4: Terms
  acceptTerms: boolean;

  // Honeypot
  website?: string;

  // Allow other fields
  [key: string]: string | boolean | { day: string; month: string; year: string } | undefined;
}

async function QuoteRequestTemplate(
  data: QuoteRequestData,
  isUserEmail: boolean,
  isDarkMode: boolean = false,
  baseUrl?: string
): Promise<string> {
  const { BaseTemplate } = await import('../src/utils/email-templates/BaseTemplate.js');
  const {
    Heading,
    Paragraph,
    Alert,
    Card,
    DataTable,
    Spacer,
    BulletList,
    Divider,
  } = await import('../src/utils/email-templates/EmailComponents.js');

  const insuranceTypeMap: Record<string, string> = {
    vida: 'Seguro de Vida',
    salud: 'Seguro de Salud',
    auto: 'Seguro de Auto',
    hogar: 'Seguro de Hogar',
    mascotas: 'Seguro de Mascotas',
  };

  const employmentStatusMap: Record<string, string> = {
    empleado_completo: 'Empleado(a) a tiempo completo',
    empleado_parcial: 'Empleado(a) a tiempo parcial',
    autonomo: 'Trabajador(a) autónomo(a) / Freelance',
    desempleado: 'Desempleado(a)',
    estudiante: 'Estudiante',
    jubilado: 'Jubilado(a)',
    ama_casa: 'Ama de casa',
    incapacidad: 'Incapacidad laboral',
  };

  const formattedInsuranceType = insuranceTypeMap[data.insuranceType] || data.insuranceType;
  const fullName = `${data.firstName} ${data.lastName}`;
  const birthDateFormatted = `${data.birthDate.day}/${data.birthDate.month}/${data.birthDate.year}`;

  if (isUserEmail) {
    // User confirmation email
    const preheader = `Confirmación de tu solicitud de cotización para ${formattedInsuranceType}`;

    const content = `
      ${Alert({
        type: 'success',
        title: '¡Solicitud Recibida!',
        message: 'Hemos recibido tu solicitud de cotización. Un asesor se pondrá en contacto contigo pronto.',
        isDarkMode,
      })}

      ${Spacer({ height: 'md' })}

      ${Paragraph({
        text: `Hola ${data.firstName},`,
        isDarkMode,
      })}

      ${Paragraph({
        text: 'Gracias por confiar en Proense Seguros para tu solicitud de cotización. Hemos recibido tu información y uno de nuestros asesores especializados la está revisando.',
        isDarkMode,
      })}

      ${Spacer({ height: 'md' })}

      ${Heading({ level: 2, text: 'Resumen de tu Solicitud', isDarkMode })}

      ${Card({
        content: DataTable({
          rows: [
            { label: 'Tipo de Seguro', value: formattedInsuranceType, isHighlighted: true },
            { label: 'Nombre Completo', value: fullName },
            { label: 'Correo Electrónico', value: data.email },
            { label: 'Teléfono', value: data.phoneNumber },
            { label: 'Ciudad', value: data.city },
          ],
          isDarkMode,
        }),
        isDarkMode,
        noPadding: true,
      })}

      ${Spacer({ height: 'lg' })}

      ${Divider({ isDarkMode })}

      ${Heading({ level: 3, text: '¿Qué Sigue?', isDarkMode })}

      ${BulletList({
        items: [
          'Un asesor especializado revisará tu solicitud',
          'Te contactaremos tan pronto hayamos procesado tu solicitud',
          'Recibirás cotizaciones comparativas de múltiples aseguradoras',
          'Te ayudaremos a elegir la mejor opción para tus necesidades',
        ],
        isDarkMode,
        icon: '✓',
      })}

      ${Spacer({ height: 'md' })}

      ${Paragraph({
        text: 'Si tienes alguna pregunta, no dudes en contactarnos.',
        isDarkMode,
        isLast: true,
      })}
    `;

    return BaseTemplate({ preheader, content, isDarkMode, baseUrl });
  } else {
    // Agent notification email
    const preheader = `Nueva solicitud de cotización de ${fullName} - ${formattedInsuranceType}`;

    const basicInfoRows = [
      { label: 'Nombre Completo', value: fullName, isHighlighted: true },
      { label: 'Correo Electrónico', value: data.email, isHighlighted: false },
      { label: 'Teléfono', value: data.phoneNumber, isHighlighted: false },
      { label: 'Cédula', value: data.cedula, isHighlighted: false },
      { label: 'Fecha de Nacimiento', value: birthDateFormatted, isHighlighted: false },
      { label: 'Ciudad', value: data.city, isHighlighted: false },
      { label: 'Dirección', value: data.address, isHighlighted: false },
      { label: 'Situación Laboral', value: employmentStatusMap[data.employmentStatus] || data.employmentStatus, isHighlighted: false },
    ];

    // Add occupation sector if provided
    if (data.occupationSector) {
      basicInfoRows.push({ label: 'Actividad Laboral o Sector Económico', value: data.occupationSector, isHighlighted: false });
    }

    const insuranceInfoRows = [
      { label: 'Tipo de Seguro', value: formattedInsuranceType, isHighlighted: true },
    ];

    // Add conditional fields based on insurance type
    if (data.insuranceType === 'vida') {
      if (data.monthlyIncome) insuranceInfoRows.push({ label: 'Ingresos Mensuales', value: data.monthlyIncome, isHighlighted: false });
      if (data.maritalStatus) insuranceInfoRows.push({ label: 'Estado Civil', value: data.maritalStatus, isHighlighted: false });
      if (data.hasChildren) insuranceInfoRows.push({ label: 'Tiene Hijos', value: data.hasChildren === 'si' ? 'Sí' : 'No', isHighlighted: false });
      if (data.height) insuranceInfoRows.push({ label: 'Estatura', value: `${data.height} cm`, isHighlighted: false });
      if (data.weight) insuranceInfoRows.push({ label: 'Peso', value: `${data.weight} kg`, isHighlighted: false });
      if (data.epsName) insuranceInfoRows.push({ label: 'EPS', value: data.epsName, isHighlighted: false });
      if (data.practicesSports) {
        insuranceInfoRows.push({ label: 'Practica Deportes', value: data.practicesSports === 'si' ? 'Sí' : 'No', isHighlighted: false });
        if (data.practicesSports === 'si' && data.sportsDetails) {
          insuranceInfoRows.push({ label: 'Deportes que Practica', value: data.sportsDetails, isHighlighted: false });
        }
      }
      if (data.hasHealthConditions) {
        insuranceInfoRows.push({ label: 'Tiene Enfermedades', value: data.hasHealthConditions === 'si' ? 'Sí' : 'No', isHighlighted: false });
        if (data.hasHealthConditions === 'si' && data.healthConditionsDetails) {
          insuranceInfoRows.push({ label: 'Detalles de Enfermedades', value: data.healthConditionsDetails, isHighlighted: false });
        }
      }
    } else if (data.insuranceType === 'auto') {
      const vehicleTypeMap: Record<string, string> = {
        nuevo: 'Nuevo (0 Km)',
        usado: 'Usado',
      };
      const vehicleUseMap: Record<string, string> = {
        familiar: 'Familiar',
        trabajo: 'Trabajo',
        empresa: 'Al servicio de una empresa',
      };
      const accessoriesTypeMap: Record<string, string> = {
        planta_sonido: 'Planta de sonido',
        ductos_escape: 'Ductos de escape',
        rines_lujo: 'Rines de lujo',
        pintura_personalizada: 'Pintura personalizada',
        otro: 'Otro',
      };

      if (data.vehiclePlate) insuranceInfoRows.push({ label: 'Placa del Vehículo', value: data.vehiclePlate, isHighlighted: false });
      if (data.vehicleCity) insuranceInfoRows.push({ label: 'Ciudad de Circulación', value: data.vehicleCity, isHighlighted: false });
      if (data.vehicleType) insuranceInfoRows.push({ label: 'Tipo de Vehículo', value: vehicleTypeMap[data.vehicleType] || data.vehicleType, isHighlighted: false });
      if (data.vehicleUse) insuranceInfoRows.push({ label: 'Uso Principal del Vehículo', value: vehicleUseMap[data.vehicleUse] || data.vehicleUse, isHighlighted: false });
      if (data.hasAccessories) {
        insuranceInfoRows.push({ label: '¿Tiene Accesorios o Modificaciones?', value: data.hasAccessories === 'si' ? 'Sí' : 'No', isHighlighted: false });
        if (data.hasAccessories === 'si') {
          if (data.accessoriesValue) insuranceInfoRows.push({ label: 'Valor Estimado de Accesorios', value: data.accessoriesValue, isHighlighted: false });
          if (data.accessoriesType) insuranceInfoRows.push({ label: 'Tipo de Accesorios', value: accessoriesTypeMap[data.accessoriesType] || data.accessoriesType, isHighlighted: false });
        }
      }
    } else if (data.insuranceType === 'hogar') {
      const estratoMap: Record<string, string> = {
        estrato_1: 'Estrato 1',
        estrato_2: 'Estrato 2',
        estrato_3: 'Estrato 3',
        estrato_4: 'Estrato 4',
        estrato_5: 'Estrato 5',
        estrato_6: 'Estrato 6',
      };
      const propertyTypeMap: Record<string, string> = {
        apartamento: 'Apartamento',
        casa: 'Casa',
        casa_campestre: 'Casa Campestre',
        finca: 'Finca',
      };
      const propertyUseMap: Record<string, string> = {
        arrendamiento: 'Arrendamiento',
        propio: 'Propio',
      };
      const insuranceMethodMap: Record<string, string> = {
        valor_comercial: 'Valor Comercial',
        valor_reconstruccion: 'Valor de Reconstrucción',
      };

      if (data.insuredPropertyAddress) insuranceInfoRows.push({ label: 'Dirección del Inmueble a Asegurar', value: data.insuredPropertyAddress, isHighlighted: false });
      if (data.insuredPropertyCity) insuranceInfoRows.push({ label: 'Ciudad del Inmueble a Asegurar', value: data.insuredPropertyCity, isHighlighted: false });
      if (data.buildingFloors) insuranceInfoRows.push({ label: 'Número de Pisos del Edificio', value: data.buildingFloors, isHighlighted: false });
      if (data.estrato) insuranceInfoRows.push({ label: 'Estrato', value: estratoMap[data.estrato] || data.estrato, isHighlighted: false });
      if (data.propertyType) insuranceInfoRows.push({ label: 'Tipo de Vivienda', value: propertyTypeMap[data.propertyType] || data.propertyType, isHighlighted: false });
      if (data.propertyUse) insuranceInfoRows.push({ label: 'Uso de la Vivienda', value: propertyUseMap[data.propertyUse] || data.propertyUse, isHighlighted: false });
      if (data.residesInProperty) insuranceInfoRows.push({ label: '¿Habitas la Vivienda?', value: data.residesInProperty === 'si' ? 'Sí' : 'No', isHighlighted: false });
      if (data.propertyArea) insuranceInfoRows.push({ label: 'Área de la Vivienda', value: `${data.propertyArea} M2`, isHighlighted: false });
      if (data.hasEconomicActivity) insuranceInfoRows.push({ label: '¿Se Desarrolla Actividad Económica?', value: data.hasEconomicActivity === 'si' ? 'Sí' : 'No', isHighlighted: false });
      if (data.propertyValue) insuranceInfoRows.push({ label: 'Valor de la Vivienda', value: data.propertyValue, isHighlighted: false });
      if (data.contentsValue) insuranceInfoRows.push({ label: 'Valor de los Contenidos', value: data.contentsValue, isHighlighted: false });
      if (data.insuranceMethod) insuranceInfoRows.push({ label: 'Método de Aseguramiento', value: insuranceMethodMap[data.insuranceMethod] || data.insuranceMethod, isHighlighted: false });
    } else if (data.insuranceType === 'salud') {
      if (data.preExistingConditions) insuranceInfoRows.push({ label: 'Condiciones Preexistentes', value: data.preExistingConditions, isHighlighted: false });
    } else if (data.insuranceType === 'mascotas') {
      const petGenderMap: Record<string, string> = {
        hembra: 'Hembra',
        macho: 'Macho',
      };

      if (data.petType) insuranceInfoRows.push({ label: 'Tipo de Mascota', value: data.petType === 'perro' ? 'Perro' : 'Gato', isHighlighted: false });
      if (data.petName) insuranceInfoRows.push({ label: 'Nombre de la Mascota', value: data.petName, isHighlighted: false });
      if (data.petGender) insuranceInfoRows.push({ label: 'Sexo de la Mascota', value: petGenderMap[data.petGender] || data.petGender, isHighlighted: false });
      if (data.petAge) insuranceInfoRows.push({ label: 'Edad de la Mascota', value: data.petAge, isHighlighted: false });
      if (data.petBreed) insuranceInfoRows.push({ label: 'Raza de la Mascota', value: data.petBreed, isHighlighted: false });
      if (data.petVaccinated) {
        insuranceInfoRows.push({
          label: '¿Tiene Esquema de Vacunas al Día?',
          value: data.petVaccinated === 'si' ? 'Sí' : 'No',
          isHighlighted: false,
        });
      }
      if (data.petHasSeriousIllness) {
        insuranceInfoRows.push({
          label: '¿Ha Tenido Enfermedades o Accidentes Graves en el Último Año?',
          value: data.petHasSeriousIllness === 'si' ? 'Sí' : 'No',
          isHighlighted: false,
        });
        if (data.petHasSeriousIllness === 'si' && data.petSeriousIllnessDetails) {
          insuranceInfoRows.push({
            label: 'Detalles de Enfermedades o Accidentes',
            value: data.petSeriousIllnessDetails,
            isHighlighted: false,
          });
        }
      }
    }

    const content = `
      ${Alert({
        type: 'info',
        title: 'Nueva Solicitud de Cotización',
        message: 'Se ha recibido una nueva solicitud de cotización a través del formulario web.',
        isDarkMode,
      })}

      ${Spacer({ height: 'md' })}

      ${Heading({ level: 2, text: 'Información Personal del Solicitante', isDarkMode })}

      ${Card({
        content: DataTable({ rows: basicInfoRows, isDarkMode }),
        isDarkMode,
        noPadding: true,
      })}

      ${Spacer({ height: 'md' })}

      ${Heading({ level: 2, text: 'Información del Seguro Solicitado', isDarkMode })}

      ${Card({
        content: DataTable({ rows: insuranceInfoRows, isDarkMode }),
        isDarkMode,
        noPadding: true,
      })}

      ${data.additionalComments ? `
        ${Spacer({ height: 'md' })}

        ${Heading({ level: 3, text: 'Comentarios Adicionales del Cliente', isDarkMode })}

        ${Card({
          content: `
            ${Paragraph({ text: data.additionalComments, isDarkMode, isLast: true })}
          `,
          isDarkMode,
        })}
      ` : ''}

      ${Spacer({ height: 'lg' })}

      ${Divider({ isDarkMode })}

      ${Heading({ level: 3, text: 'Próximos Pasos', isDarkMode })}

      ${BulletList({
        items: [
          'Contactar al cliente tan pronto como se haya procesado la solicitud',
          'Solicitar información adicional específica según el tipo de seguro',
          'Preparar cotizaciones comparativas de múltiples aseguradoras',
          'Presentar las opciones al cliente y hacer seguimiento hasta el cierre',
        ],
        isDarkMode,
        icon: '→',
      })}

      ${Spacer({ height: 'md' })}
    `;

    return BaseTemplate({ preheader, content, isDarkMode, baseUrl });
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Dynamic imports for security modules
    const dompurifyModule = await import('dompurify');
    // Handle both ES module and CommonJS default export
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOMPurify = (dompurifyModule as any).default || dompurifyModule;
    const { parse } = await import('cookie');
    const { default: Tokens } = (await import('csrf')) as unknown as {
      default: new () => { verify: (secret: string, token: string) => boolean };
    };
    const tokens = new Tokens();

    // Initialize DOMPurify with JSDOM
    const window = new JSDOM('').window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOMPurifyInstance = DOMPurify(window);

    // Verify CSRF token
    const cookies = parse(req.headers.cookie || '');
    const secret = cookies._csrf_secret;
    const token = req.headers['x-csrf-token'] as string;

    if (!secret || !token || !tokens.verify(secret, token)) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    const rawFormData = req.body as Record<string, string>;

    // Check honeypot field first - with safe property access
    if (rawFormData?.website && typeof rawFormData.website === 'string' && rawFormData.website.length > 0) {
      // Silently accept but don't process spam submissions
      return res.status(200).json({
        message: 'Solicitud enviada con éxito.',
        data: { messageId: 'spam-filtered' },
      });
    }

    // Validate with backend schema
    const validationResult = backendQuoteSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Datos inválidos.',
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const validatedData = validationResult.data;

    // Reconstruct birthDate object
    const formData: QuoteRequestData = {
      ...validatedData,
      birthDate: {
        day: validatedData.birthDate_day,
        month: validatedData.birthDate_month,
        year: validatedData.birthDate_year,
      },
    };

    // Sanitize all text fields to prevent XSS
    const sanitizedData: QuoteRequestData = {
      firstName: DOMPurifyInstance.sanitize(formData.firstName),
      lastName: DOMPurifyInstance.sanitize(formData.lastName),
      birthDate: {
        day: DOMPurifyInstance.sanitize(formData.birthDate.day),
        month: DOMPurifyInstance.sanitize(formData.birthDate.month),
        year: DOMPurifyInstance.sanitize(formData.birthDate.year),
      },
      phoneNumber: DOMPurifyInstance.sanitize(formData.phoneNumber),
      email: DOMPurifyInstance.sanitize(formData.email),
      cedula: DOMPurifyInstance.sanitize(formData.cedula),
      city: DOMPurifyInstance.sanitize(formData.city),
      address: DOMPurifyInstance.sanitize(formData.address),
      employmentStatus: DOMPurifyInstance.sanitize(formData.employmentStatus),
      occupationSector: formData.occupationSector ? DOMPurifyInstance.sanitize(formData.occupationSector) : undefined,
      insuranceType: DOMPurifyInstance.sanitize(formData.insuranceType),
      monthlyIncome: formData.monthlyIncome ? DOMPurifyInstance.sanitize(formData.monthlyIncome) : undefined,
      maritalStatus: formData.maritalStatus ? DOMPurifyInstance.sanitize(formData.maritalStatus) : undefined,
      hasChildren: formData.hasChildren as 'si' | 'no' | '' | undefined,
      height: formData.height ? DOMPurifyInstance.sanitize(formData.height) : undefined,
      weight: formData.weight ? DOMPurifyInstance.sanitize(formData.weight) : undefined,
      epsName: formData.epsName ? DOMPurifyInstance.sanitize(formData.epsName) : undefined,
      practicesSports: formData.practicesSports as 'si' | 'no' | '' | undefined,
      sportsDetails: formData.sportsDetails ? DOMPurifyInstance.sanitize(formData.sportsDetails) : undefined,
      hasHealthConditions: formData.hasHealthConditions as 'si' | 'no' | '' | undefined,
      healthConditionsDetails: formData.healthConditionsDetails
        ? DOMPurifyInstance.sanitize(formData.healthConditionsDetails)
        : undefined,
      vehiclePlate: formData.vehiclePlate ? DOMPurifyInstance.sanitize(formData.vehiclePlate) : undefined,
      vehicleCity: formData.vehicleCity ? DOMPurifyInstance.sanitize(formData.vehicleCity) : undefined,
      vehicleType: formData.vehicleType ? DOMPurifyInstance.sanitize(formData.vehicleType) : undefined,
      vehicleUse: formData.vehicleUse ? DOMPurifyInstance.sanitize(formData.vehicleUse) : undefined,
      hasAccessories: formData.hasAccessories as 'si' | 'no' | '' | undefined,
      accessoriesValue: formData.accessoriesValue ? DOMPurifyInstance.sanitize(formData.accessoriesValue) : undefined,
      accessoriesType: formData.accessoriesType ? DOMPurifyInstance.sanitize(formData.accessoriesType) : undefined,
      insuredPropertyAddress: formData.insuredPropertyAddress ? DOMPurifyInstance.sanitize(formData.insuredPropertyAddress) : undefined,
      insuredPropertyCity: formData.insuredPropertyCity ? DOMPurifyInstance.sanitize(formData.insuredPropertyCity) : undefined,
      buildingFloors: formData.buildingFloors ? DOMPurifyInstance.sanitize(formData.buildingFloors) : undefined,
      estrato: formData.estrato ? DOMPurifyInstance.sanitize(formData.estrato) : undefined,
      propertyType: formData.propertyType ? DOMPurifyInstance.sanitize(formData.propertyType) : undefined,
      propertyUse: formData.propertyUse ? DOMPurifyInstance.sanitize(formData.propertyUse) : undefined,
      residesInProperty: formData.residesInProperty as 'si' | 'no' | '' | undefined,
      propertyArea: formData.propertyArea ? DOMPurifyInstance.sanitize(formData.propertyArea) : undefined,
      hasEconomicActivity: formData.hasEconomicActivity as 'si' | 'no' | '' | undefined,
      propertyValue: formData.propertyValue ? DOMPurifyInstance.sanitize(formData.propertyValue) : undefined,
      contentsValue: formData.contentsValue ? DOMPurifyInstance.sanitize(formData.contentsValue) : undefined,
      insuranceMethod: formData.insuranceMethod ? DOMPurifyInstance.sanitize(formData.insuranceMethod) : undefined,
      preExistingConditions: formData.preExistingConditions
        ? DOMPurifyInstance.sanitize(formData.preExistingConditions)
        : undefined,
      petType: formData.petType ? DOMPurifyInstance.sanitize(formData.petType) : undefined,
      petName: formData.petName ? DOMPurifyInstance.sanitize(formData.petName) : undefined,
      petGender: formData.petGender ? DOMPurifyInstance.sanitize(formData.petGender) : undefined,
      petAge: formData.petAge ? DOMPurifyInstance.sanitize(formData.petAge) : undefined,
      petBreed: formData.petBreed ? DOMPurifyInstance.sanitize(formData.petBreed) : undefined,
      petVaccinated: formData.petVaccinated as 'si' | 'no' | '' | undefined,
      petHasSeriousIllness: formData.petHasSeriousIllness as 'si' | 'no' | '' | undefined,
      petSeriousIllnessDetails: formData.petSeriousIllnessDetails
        ? DOMPurifyInstance.sanitize(formData.petSeriousIllnessDetails)
        : undefined,
      additionalComments: formData.additionalComments
        ? DOMPurifyInstance.sanitize(formData.additionalComments)
        : undefined,
      acceptTerms: formData.acceptTerms,
    };

    const senderName = process.env.BREVO_SENDER_NAME || 'Proense Asesora Digital';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@proense.co';
    const notificationRecipients = getNotificationEmails('cotizacion');

    // Get the base URL from the request
    const baseUrl = req.headers.host ? `https://${req.headers.host}` : undefined;

    const insuranceTypeMap: Record<string, string> = {
      vida: 'Seguro de Vida',
      salud: 'Seguro de Salud',
      auto: 'Seguro de Auto',
      hogar: 'Seguro de Hogar',
      mascotas: 'Seguro de Mascotas',
    };

    const formattedInsuranceType = insuranceTypeMap[sanitizedData.insuranceType] || sanitizedData.insuranceType;

    // 1. Email to User
    const userEmailSubject = `Confirmación de Solicitud de Cotización - Proense Seguros`;
    const userEmailHtmlContent = await QuoteRequestTemplate(sanitizedData, true, false, baseUrl);

    const userBrevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: sanitizedData.email, name: `${sanitizedData.firstName} ${sanitizedData.lastName}` }],
      subject: userEmailSubject,
      htmlContent: userEmailHtmlContent,
    };

    // 2. Email to Agent
    const agentEmailSubject = `Nueva Solicitud de Cotización - ${formattedInsuranceType}`;
    const agentEmailHtmlContent = await QuoteRequestTemplate(sanitizedData, false, false, baseUrl);

    const agentBrevoPayload = {
      sender: { name: senderName, email: senderEmail },
      to: notificationRecipients,
      subject: agentEmailSubject,
      htmlContent: agentEmailHtmlContent,
    };

    // Send emails
    const userEmailResult = await sendTransactionalEmail(userBrevoPayload);
    if (!userEmailResult.success) {
      console.error('Failed to send email to user:', userEmailResult.error);
      // We don't abort here; the agent email is more critical.
    }

    const agentEmailResult = await sendTransactionalEmail(agentBrevoPayload);
    if (!agentEmailResult.success) {
      console.error('Failed to send email to agent:', agentEmailResult.error);
      // This is a critical failure.
      return res.status(agentEmailResult.status || 500).json({
        message: 'Error enviando email de notificación al agente.',
        details: agentEmailResult.error,
      });
    }

    return res.status(200).json({ message: 'Solicitud de cotización enviada con éxito.' });
  } catch (error) {
    console.error('Error processing quote request:', error);
    let errorMessage = 'Error interno del servidor.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({ message: errorMessage });
  }
}

// Export the handler with rate limiting applied
export default withRateLimit(rateLimitConfigs.forms, handler);
