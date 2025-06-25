import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const writeClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'aofp3ugi',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2025-06-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
});

async function deleteAllTestPosts() {
  console.log('Fetching test posts to delete...');
  const query = `*[_type == "post" && title match "Articulo de prueba #*"]{_id}`;
  const postsToDelete = await writeClient.fetch(query);

  if (postsToDelete.length === 0) {
    console.log('No test posts found to delete.');
    return;
  }

  console.log(`Found ${postsToDelete.length} test posts. Deleting...`);

  const transaction = writeClient.transaction();
  postsToDelete.forEach((post: { _id: string }) => {
    transaction.delete(post._id);
  });

  try {
    await transaction.commit();
    console.log('Successfully deleted all test posts.');
  } catch (error) {
    console.error('Error deleting posts:', error);
  }
}

deleteAllTestPosts().catch(err => {
  console.error(err);
  process.exit(1);
});
