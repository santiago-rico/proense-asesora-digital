import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Starting global setup...');

  // Create a browser instance for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Determine the base URL for the application
    const baseURL = process.env.BASE_URL || config.projects[0].use.baseURL || 'http://localhost:8080';
    console.log(`Using base URL: ${baseURL}`);

    // Wait for the development server to be ready
    console.log('Waiting for server to be ready...');
    let retries = 0;
    const maxRetries = 30;
    
    while (retries < maxRetries) {
      try {
        const response = await page.goto(baseURL, { timeout: 5000 });
        if (response?.status() === 200) {
          console.log('Server is ready!');
          break;
        }
      } catch (error) {
        retries++;
        console.log(`Server not ready, retrying... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (retries >= maxRetries) {
      throw new Error('Server failed to start within the expected time');
    }

    // Perform any additional setup tasks
    await setupTestData(page, baseURL);

    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Set up test data and initial state
 */
async function setupTestData(page: any, baseURL: string) {
  console.log('Setting up test data...');

  // Clear any existing test data
  try {
    // You might want to call your API to clear test data
    // await page.request.post(`${baseURL}/api/test/clear-data`);
  } catch (error) {
    console.warn('Failed to clear test data:', error);
  }

  // Create test directories
  const fs = require('fs');
  const path = require('path');
  
  const testDirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/videos',
    'test-results/temp-files',
  ];

  for (const dir of testDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }

  // Seed any required test data
  await seedTestData(page, baseURL);

  console.log('Test data setup completed');
}

/**
 * Seed test data if needed
 */
async function seedTestData(page: any, baseURL: string) {
  // Example: Create test users, test content, etc.
  // This would depend on your application's needs
  
  try {
    // Example API calls to seed data
    // await page.request.post(`${baseURL}/api/test/seed-users`);
    // await page.request.post(`${baseURL}/api/test/seed-content`);
    
    console.log('Test data seeding completed');
  } catch (error) {
    console.warn('Test data seeding failed:', error);
  }
}

export default globalSetup;