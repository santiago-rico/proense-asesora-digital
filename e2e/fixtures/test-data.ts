export const testData = {
  // Lead generation form data
  leadForm: {
    valid: {
      fullName: 'Juan Carlos Pérez',
      email: 'juan.perez@example.com',
      phone: '+57 300 123 4567',
      insuranceType: 'auto',
      message: 'Estoy interesado en obtener una cotización para mi vehículo.',
    },
    invalid: {
      fullName: '',
      email: 'invalid-email',
      phone: '123',
      insuranceType: '',
      message: '',
    },
  },

  // Insurance application form data
  insuranceApplication: {
    basicInfo: {
      fullName: 'María Elena González',
      email: 'maria.gonzalez@example.com',
      phone: '+57 301 234 5678',
      identificationType: 'cedula',
      identificationNumber: '12345678',
      birthDate: '1985-03-15',
      gender: 'femenino',
      maritalStatus: 'casado',
      occupation: 'Ingeniera',
      address: 'Carrera 45 #123-45',
      city: 'Bogotá',
      department: 'Cundinamarca',
    },
    autoInsurance: {
      vehicleBrand: 'Toyota',
      vehicleModel: 'Corolla',
      vehicleYear: '2020',
      vehiclePlate: 'ABC123',
      vehicleCylinders: '4',
      vehicleValue: '50000000',
    },
    healthInsurance: {
      hasPreexistingConditions: false,
      medications: '',
      familyHistory: '',
      lifestyle: 'activo',
    },
    lifeInsurance: {
      beneficiaryName: 'Carlos González',
      beneficiaryRelationship: 'esposo',
      beneficiaryPhone: '+57 302 345 6789',
      coverageAmount: '100000000',
    },
  },

  // Modification request form data
  modificationRequest: {
    valid: {
      fullName: 'Ana Patricia Silva',
      email: 'ana.silva@example.com',
      phone: '+57 303 456 7890',
      policyNumber: 'POL-2024-001',
      modificationType: 'datos_personales',
      description: 'Necesito actualizar mi dirección de residencia.',
    },
  },

  // Cancellation request form data
  cancellationRequest: {
    valid: {
      fullName: 'Roberto Martínez',
      email: 'roberto.martinez@example.com',
      phone: '+57 304 567 8901',
      policyNumber: 'POL-2024-002',
      cancellationReason: 'otro',
      description: 'Ya no necesito la póliza por cambio de trabajo.',
    },
  },

  // File upload test data
  files: {
    validPdf: {
      name: 'documento.pdf',
      type: 'application/pdf',
      size: 1024 * 1024, // 1MB
    },
    validImage: {
      name: 'cedula.jpg',
      type: 'image/jpeg',
      size: 500 * 1024, // 500KB
    },
    invalidLargeFile: {
      name: 'documento-grande.pdf',
      type: 'application/pdf',
      size: 10 * 1024 * 1024, // 10MB (exceeds 5MB limit)
    },
    invalidType: {
      name: 'script.js',
      type: 'application/javascript',
      size: 1024,
    },
  },

  // Navigation test data
  navigation: {
    insuranceProducts: [
      { name: 'Seguro de Auto', slug: 'auto' },
      { name: 'Seguro de Vida', slug: 'vida' },
      { name: 'Seguro de Salud', slug: 'salud' },
      { name: 'Seguro de Hogar', slug: 'hogar' },
      { name: 'Seguro de Mascotas', slug: 'mascotas' },
      { name: 'Seguro para Motos', slug: 'motos' },
      { name: 'Seguro para PYMEs', slug: 'pymes' },
      { name: 'Seguro de Viaje', slug: 'viaje' },
    ],
    pages: [
      { name: 'Inicio', path: '/' },
      { name: 'Nosotros', path: '/nosotros' },
      { name: 'Contacto', path: '/contacto' },
      { name: 'Blog', path: '/blog' },
      { name: 'Emisión', path: '/emision' },
      { name: 'Servicio al Cliente', path: '/servicio-al-cliente' },
      { name: 'Pagos', path: '/pagos' },
    ],
  },

  // Security test data
  security: {
    xssAttempts: [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">',
      '"><script>alert("xss")</script>',
    ],
    sqlInjectionAttempts: [
      "'; DROP TABLE users;--",
      "' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users--",
    ],
    honeypotValues: [
      'bot-filled-value',
      'automated-submission',
      'spam-content',
    ],
  },

  // Performance test data
  performance: {
    expectedLoadTimes: {
      homepage: 3000, // 3 seconds
      insurancePage: 2500, // 2.5 seconds
      contactPage: 2000, // 2 seconds
      blogPage: 3500, // 3.5 seconds
    },
  },

  // Accessibility test data
  accessibility: {
    requiredElements: [
      'skip-to-content',
      'main-navigation',
      'main-content',
      'footer',
    ],
    keyboardNavigation: [
      'Tab',
      'Shift+Tab',
      'Enter',
      'Space',
      'Escape',
      'ArrowUp',
      'ArrowDown',
    ],
  },
};

// Helper functions for test data generation
export const generateRandomEmail = (): string => {
  const timestamp = Date.now();
  return `test.user.${timestamp}@example.com`;
};

export const generateRandomPhone = (): string => {
  const areaCode = Math.floor(Math.random() * 900) + 300;
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `+57 ${areaCode} ${number.toString().slice(0, 3)} ${number.toString().slice(3)}`;
};

export const generateRandomName = (): string => {
  const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Laura'];
  const lastNames = ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)];
  const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName1} ${lastName2}`;
};

export const generateRandomPolicyNumber = (): string => {
  const year = new Date().getFullYear();
  const number = Math.floor(Math.random() * 9999) + 1;
  return `POL-${year}-${number.toString().padStart(4, '0')}`;
};