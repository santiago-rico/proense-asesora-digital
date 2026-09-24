import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';
import { withRateLimit, rateLimitConfigs } from './_utils/rate-limiter.js';

async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Dynamic import for the csrf library
    const { default: Tokens } = await import('csrf') as { default: new () => { secretSync(): string; create(secret: string): string } };
    const tokens = new Tokens();
    
    // Generate a secret for this session
    const secret = tokens.secretSync();
    const token = tokens.create(secret);
    
    // Store the secret in an httpOnly cookie
    const cookie = serialize('_csrf_secret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in csrf-token handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Export the handler with rate limiting applied (more lenient for CSRF tokens)
export default withRateLimit(rateLimitConfigs.csrf, handler);
