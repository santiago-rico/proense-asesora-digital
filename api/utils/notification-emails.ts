/**
 * Utility for parsing notification email recipients
 * Supports multiple comma-separated recipients
 */

export interface EmailRecipient {
  email: string;
  name: string;
}

/**
 * Parses comma-separated notification emails from NOTIFICATION_EMAILS env variable.
 *
 * @returns Array of email recipients formatted for Brevo API
 *
 * @example
 * // With NOTIFICATION_EMAILS=agent1@company.com,agent2@company.com
 * getNotificationEmails()
 * // Returns: [{ email: 'agent1@company.com', name: 'Agente Proense' }, ...]
 */
export function getNotificationEmails(): EmailRecipient[] {
  const notificationEmails = process.env.NOTIFICATION_EMAILS;

  if (!notificationEmails) {
    return [{ email: 'comercial@proense.co', name: 'Agente Proense' }];
  }

  return notificationEmails
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0)
    .map(email => ({ email, name: 'Agente Proense' }));
}
