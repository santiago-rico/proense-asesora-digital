import { createClient } from '@sanity/client';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

dotenv.config();

// This is the client that will be used for mutations
const writeClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'aofp3ugi',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false, // `false` if you want to ensure fresh data
  apiVersion: '2025-06-25',
  token: process.env.SANITY_API_WRITE_TOKEN, // required for mutations
});

// Function to generate a slug from a title
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

// --- Main Seeding Function ---
async function seedBlog() {
  console.log('Starting to seed blog posts...');

  // 1. Fetch existing authors and categories
  const authors = await writeClient.fetch('*[_type == "author"]{_id, name}');
  const categories = await writeClient.fetch('*[_type == "category"]{_id, title}');
  const imageAsset = await writeClient.fetch('*[_type == "sanity.imageAsset"][0]');

  if (authors.length === 0) {
    console.error(
      'No authors found. Please add at least one author in Sanity Studio before seeding.'
    );
    return;
  }

  if (categories.length === 0) {
    console.error(
      'No categories found. Please add at least one category in Sanity Studio before seeding.'
    );
    return;
  }

  if (!imageAsset) {
    console.error(
      'No image assets found in your Sanity dataset. Please upload at least one image before seeding.'
    );
    return;
  }

  console.log(`Found ${authors.length} authors, ${categories.length} categories, and an image asset.`);

  // 2. Generate 15 sample posts
  const posts = Array.from({ length: 15 }).map((_, i) => {
    const title = faker.lorem.sentence(5);
    const author = authors[faker.number.int({ min: 0, max: authors.length - 1 })];
    const category = categories[faker.number.int({ min: 0, max: categories.length - 1 })];

    return {
      _type: 'post',
      title: `Articulo de prueba #${i + 1}: ${title}`,
      slug: {
        _type: 'slug',
        current: slugify(`Articulo de prueba #${i + 1} ${title}`),
      },
      author: {
        _type: 'reference',
        _ref: author._id,
      },
      featuredImage: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
      excerpt: faker.lorem.paragraph(2),
      categories: [
        {
          _type: 'reference',
          _ref: category._id,
          _key: faker.string.uuid(),
        },
      ],
      date: faker.date.recent({ days: 30 }).toISOString(),
      body: [
        {
          _type: 'block',
          style: 'normal',
          _key: faker.string.uuid(),
          children: [
            {
              _type: 'span',
              _key: faker.string.uuid(),
              text: faker.lorem.paragraphs(3),
              marks: [],
            },
          ],
        },
      ],
    };
  });

  // 3. Create a transaction and commit
  console.log('Creating transaction...');
  const transaction = writeClient.transaction();
  posts.forEach(post => {
    transaction.create(post);
  });

  try {
    await transaction.commit();
    console.log(`Successfully created ${posts.length} blog posts!`);
  } catch (error) {
    console.error('Error committing transaction:', error);
  }
}

// --- Execute the function ---
seedBlog().catch(err => {
  console.error(err);
  process.exit(1);
});
