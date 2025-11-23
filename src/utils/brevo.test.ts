import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTransactionalEmail } from './brevo';

// Mock global fetch
global.fetch = vi.fn();

// Store original process.env and restore after each test
const originalEnv = process.env;

describe('sendTransactionalEmail', () => {
  beforeEach(() => {
    // Reset mocks and environment variables before each test
    vi.resetAllMocks();
    process.env = { ...originalEnv }; // Restore original env
  });

  afterEach(() => {
    process.env = originalEnv; // Ensure original env is restored
  });

  const mockEmailParams = {
    to: [{ email: 'test@example.com', name: 'Test User' }],
    subject: 'Test Subject',
    htmlContent: '<p>Test Content</p>',
  };

  it('should send an email successfully with default sender', async () => {
    process.env.BREVO_API_KEY = 'test-api-key';
    process.env.BREVO_SENDER_EMAIL = 'default-sender@example.com';
    process.env.BREVO_SENDER_NAME = 'Default Sender';

    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ messageId: '12345' }),
    });

    const result = await sendTransactionalEmail(mockEmailParams);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': 'test-api-key',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Default Sender', email: 'default-sender@example.com' },
        ...mockEmailParams,
      }),
    });
    expect(result).toEqual({ success: true, messageId: '12345', status: 201 });
  });

  it('should send an email successfully with custom sender', async () => {
    process.env.BREVO_API_KEY = 'test-api-key';
    process.env.BREVO_SENDER_EMAIL = 'default-sender@example.com'; // Still needed for fallback check
    process.env.BREVO_SENDER_NAME = 'Default Sender';

    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ messageId: '67890' }),
    });

    const customSenderParams = {
      ...mockEmailParams,
      sender: { name: 'Custom Sender', email: 'custom@example.com' },
    };
    const result = await sendTransactionalEmail(customSenderParams);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': 'test-api-key',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Custom Sender', email: 'custom@example.com' },
        to: customSenderParams.to,
        subject: customSenderParams.subject,
        htmlContent: customSenderParams.htmlContent,
      }),
    });
    expect(result).toEqual({ success: true, messageId: '67890', status: 201 });
  });

  it('should return error if API key is missing', async () => {
    delete process.env.BREVO_API_KEY;
    process.env.BREVO_SENDER_EMAIL = 'default-sender@example.com';
    process.env.BREVO_SENDER_NAME = 'Default Sender';

    const result = await sendTransactionalEmail(mockEmailParams);

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: 'Brevo API key missing' });
  });

  it('should return error if default sender email is missing', async () => {
    process.env.BREVO_API_KEY = 'test-api-key';
    delete process.env.BREVO_SENDER_EMAIL;
    process.env.BREVO_SENDER_NAME = 'Default Sender';

    const result = await sendTransactionalEmail(mockEmailParams);

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: 'Brevo sender details missing' });
  });

  it('should return error if default sender name is missing', async () => {
    process.env.BREVO_API_KEY = 'test-api-key';
    process.env.BREVO_SENDER_EMAIL = 'default-sender@example.com';
    delete process.env.BREVO_SENDER_NAME;

    const result = await sendTransactionalEmail(mockEmailParams);

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: 'Brevo sender details missing' });
  });

  it('should handle Brevo API error response', async () => {
    process.env.BREVO_API_KEY = 'test-api-key';
    process.env.BREVO_SENDER_EMAIL = 'default-sender@example.com';
    process.env.BREVO_SENDER_NAME = 'Default Sender';

    const apiError = { code: 'invalid_parameter', message: 'Recipient email is invalid' };
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => apiError,
    });

    const result = await sendTransactionalEmail(mockEmailParams);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: false, error: apiError, status: 400 });
  });

  it('should handle network error during fetch', async () => {
    process.env.BREVO_API_KEY = 'test-api-key';
    process.env.BREVO_SENDER_EMAIL = 'default-sender@example.com';
    process.env.BREVO_SENDER_NAME = 'Default Sender';

    const networkError = new Error('Network connection failed');
    (fetch as vi.Mock).mockRejectedValueOnce(networkError);

    const result = await sendTransactionalEmail(mockEmailParams);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: false, error: 'Network connection failed' });
  });
});
