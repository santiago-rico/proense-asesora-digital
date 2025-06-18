interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  sender?: {
    name: string;
    email: string;
  };
  attachment?: {
    name: string;
    content: string; // base64 encoded string
  }[];
}

interface BrevoResponse {
  success: boolean;
  messageId?: string;
  error?: any;
  status?: number;
}

/**
 * Sends a transactional email using the Brevo (Sendinblue) API.
 *
 * @param params - The email parameters including recipients, subject, and HTML content.
 * @returns A promise that resolves with an object indicating success or failure.
 */
export async function sendTransactionalEmail(
  params: EmailParams,
): Promise<BrevoResponse> {
  const apiKey = process.env.BREVO_API_KEY;
  const defaultSenderEmail = process.env.BREVO_SENDER_EMAIL;
  const defaultSenderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey) {
    console.error('Brevo API key is not configured.');
    return { success: false, error: 'Brevo API key missing' };
  }
  if (!defaultSenderEmail || !defaultSenderName) {
    console.error('Brevo default sender email or name is not configured.');
    return { success: false, error: 'Brevo sender details missing' };
  }

  const sender = params.sender || {
    name: defaultSenderName,
    email: defaultSenderEmail,
  };

  const payload = {
    sender,
    to: params.to,
    subject: params.subject,
    htmlContent: params.htmlContent,
    attachment: params.attachment,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      // Brevo API returns 201 Created for success, sometimes 202 Accepted
      const responseData = await response.json(); // Contains messageId
      return { success: true, messageId: responseData.messageId, status: response.status };
    } else {
      const errorData = await response.json();
      console.error('Brevo API Error:', response.status, errorData);
      return { success: false, error: errorData, status: response.status };
    }
  } catch (error) {
    console.error('Error sending email via Brevo:', error);
    let errorMessage = 'Unknown error during Brevo API call';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
