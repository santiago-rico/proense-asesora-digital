import { InsuranceApplicationTemplate } from './InsuranceApplicationTemplate.js';
import { LeadTemplate } from './LeadTemplate.js';
import { CancellationRequestTemplate } from './CancellationRequestTemplate.js';
import * as fs from 'fs';

// Test data for Insurance Application
const insuranceData = {
  nombreCompleto: 'Juan Pérez',
  telefono: '3001234567',
  email: 'juan.perez@example.com',
  tipoSeguro: 'vida',
  metodoPago: 'tarjeta_credito',
  periodicidadPago: 'mensual',
  numeroCedula: '1234567890',
  beneficiarios: 'si',
  listaBeneficiarios: 'Maria Pérez (Esposa), Carlos Pérez (Hijo)',
  tieneEnfermedadesDiagnosticadas: 'no' as const,
  declaraRenta: 'si' as const,
  aceptaTerminosYPolitica: true,
  aceptaDeclaracionAsesoria: true
};

// Test data for Lead
const leadData = {
  nombre: 'Ana García',
  telefono: '3009876543',
  email: 'ana.garcia@example.com',
  tipoSeguro: 'hogar',
  mensaje: 'Estoy interesada en conocer más sobre seguros de hogar'
};

// Test data for Cancellation
const cancellationData = {
  nombreCompleto: 'Carlos Rodríguez',
  numeroCedula: '9876543210',
  telefono: '3005551234',
  email: 'carlos.rodriguez@example.com',
  nombreAseguradora: 'Seguros XYZ',
  numeroPoliza: 'POL-2024-001',
  tipoSeguro: 'vehiculos',
  cancellationReason: 'Encontré mejores condiciones en otro lugar',
  aceptaTerminosYPolitica: true,
  aceptaDeclaracionAsesoria: true
};

const attachedFiles = {
  'Cédula de Ciudadanía': ['cedula.pdf'],
  'Declaración de Renta': ['declaracion_2023.pdf']
};

// Generate test emails
const baseUrl = 'https://proense-asesora-digital.vercel.app';

// Light mode emails
const insuranceLightUser = InsuranceApplicationTemplate({
  data: insuranceData,
  attachedFiles,
  isUserEmail: true,
  isDarkMode: false,
  baseUrl
});

const insuranceLightAgent = InsuranceApplicationTemplate({
  data: insuranceData,
  attachedFiles,
  isUserEmail: false,
  isDarkMode: false,
  baseUrl
});

const leadLight = LeadTemplate(leadData, false, baseUrl);

const cancellationLight = CancellationRequestTemplate({
  data: cancellationData,
  attachedFiles,
  isUserEmail: true,
  isDarkMode: false,
  baseUrl
});

// Dark mode emails
const insuranceDarkUser = InsuranceApplicationTemplate({
  data: insuranceData,
  attachedFiles,
  isUserEmail: true,
  isDarkMode: true,
  baseUrl
});

const insuranceDarkAgent = InsuranceApplicationTemplate({
  data: insuranceData,
  attachedFiles,
  isUserEmail: false,
  isDarkMode: true,
  baseUrl
});

const leadDark = LeadTemplate(leadData, true, baseUrl);

const cancellationDark = CancellationRequestTemplate({
  data: cancellationData,
  attachedFiles,
  isUserEmail: true,
  isDarkMode: true,
  baseUrl
});

// Save test emails to files
fs.writeFileSync('test-insurance-light-user.html', insuranceLightUser);
fs.writeFileSync('test-insurance-light-agent.html', insuranceLightAgent);
fs.writeFileSync('test-lead-light.html', leadLight);
fs.writeFileSync('test-cancellation-light.html', cancellationLight);

fs.writeFileSync('test-insurance-dark-user.html', insuranceDarkUser);
fs.writeFileSync('test-insurance-dark-agent.html', insuranceDarkAgent);
fs.writeFileSync('test-lead-dark.html', leadDark);
fs.writeFileSync('test-cancellation-dark.html', cancellationDark);

console.log('✅ Test emails generated successfully!');
console.log('\nLight mode emails:');
console.log('- test-insurance-light-user.html');
console.log('- test-insurance-light-agent.html');
console.log('- test-lead-light.html');
console.log('- test-cancellation-light.html');
console.log('\nDark mode emails:');
console.log('- test-insurance-dark-user.html');
console.log('- test-insurance-dark-agent.html');
console.log('- test-lead-dark.html');
console.log('- test-cancellation-dark.html');
console.log('\n📧 Open these files in your browser to preview, then test in email clients.');
console.log('💡 Tip: Use browser dark mode toggle to test @media queries support.');