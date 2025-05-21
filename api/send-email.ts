import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const {
    nombre,
    email,
    telefono,
    tipoSeguro,
    mensaje,
  } = req.body;

  // Basic validation
  if (!nombre || !email || !tipoSeguro) {
    return res.status(400).json({ message: 'Nombre, email, and tipo de seguro are required.' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const leadNotificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey || !leadNotificationEmail || !senderEmail || !senderName) {
    console.error('Missing environment variables for email sending');
    return res.status(500).json({ message: 'Server configuration error for sending email.' });
  }

  const subject = `Nuevo Lead de Asesoría Gratuita: ${nombre}`;
  const htmlContent = `
    <h1>Nueva Solicitud de Asesoría Gratuita</h1>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
    <p><strong>Tipo de Seguro de Interés:</strong> ${tipoSeguro}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${mensaje || 'No proporcionado'}</p>
  `;

  const brevoPayload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: leadNotificationEmail,
        name: 'Proense Asesor Digital',
      },
    ],
    subject,
    htmlContent,
  };

  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json();
      console.error('Brevo API Error:', brevoResponse.status, errorData);
      return res.status(brevoResponse.status).json({
        message: 'Error sending email via Brevo.',
        details: errorData,
      });
    }

    // Brevo API returns 201 Created for successful email sending
    // or 202 Accepted if queued by messageId (though simple send usually is 201)
    if (brevoResponse.status === 201 || brevoResponse.status === 202) {
        const responseData = await brevoResponse.json();
        return res.status(200).json({ message: 'Solicitud enviada con éxito.', data: responseData });
    } else {
        // Handle other potential success codes if necessary, or treat as unexpected
        const responseData = await brevoResponse.json();
        console.warn('Brevo API unexpected success status:', brevoResponse.status, responseData);
        return res.status(200).json({ message: 'Solicitud procesada, estado inesperado de Brevo.', data: responseData });
    }

  } catch (error) {
    console.error('Error sending email:', error);
    let errorMessage = 'Internal server error.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return res.status(500).json({ message: errorMessage });
  }
}
