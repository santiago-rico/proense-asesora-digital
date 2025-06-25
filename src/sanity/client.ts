import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'aofp3ugi',
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2025-06-25', // use current date (YYYY-MM-DD) to target the latest API version
});
