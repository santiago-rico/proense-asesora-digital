import { Resend } from 'resend';
import { InsuranceApplicationTemplate } from './InsuranceApplicationTemplate.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Test email address (replace with your email)
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

async function sendTestEmail() {
  const testData = {
    nombreCompleto: 'Test User',
    telefono: '3001234567',
    email: TEST_EMAIL,
    tipoSeguro: 'vida',
    metodoPago: 'tarjeta_credito',
    periodicidadPago: 'mensual',
    numeroCedula: '1234567890',
    beneficiarios: 'si',
    listaBeneficiarios: 'Beneficiario 1, Beneficiario 2',
    tieneEnfermedadesDiagnosticadas: 'no' as const,
    declaraRenta: 'si' as const,
    aceptaTerminosYPolitica: true
  };

  const attachedFiles = {
    'Cédula de Ciudadanía': ['test-cedula.pdf']
  };

  try {
    // Generate email HTML (the template will auto-detect dark mode based on client)
    const html = InsuranceApplicationTemplate({
      data: testData,
      attachedFiles,
      isUserEmail: true,
      isDarkMode: false, // Set to false - let client decide based on media query
      baseUrl: 'https://proense-asesora-digital.vercel.app'
    });

    // Send test email
    const { data, error } = await resend.emails.send({
      from: 'Proense Seguros <noreply@proense.co>',
      to: [TEST_EMAIL],
      subject: 'Test Dark Mode - Solicitud de Seguro',
      html
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }

    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', data?.id);
    console.log(`\n🔍 Check ${TEST_EMAIL} inbox to verify dark mode rendering.`);
    console.log('\n💡 Testing tips:');
    console.log('1. Open in Gmail with dark mode enabled');
    console.log('2. Open in Apple Mail with dark mode enabled');
    console.log('3. Open in Outlook with dark mode enabled');
    console.log('4. Toggle system dark/light mode to see changes');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Check if API key is set
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not set in .env file');
  console.log('Add RESEND_API_KEY=your_key_here to your .env file');
  process.exit(1);
}

if (!process.env.TEST_EMAIL) {
  console.error('⚠️ TEST_EMAIL not set in .env file');
  console.log('Add TEST_EMAIL=your-email@example.com to your .env file');
  console.log('Using default test email instead...');
}

// Send the test email
sendTestEmail();