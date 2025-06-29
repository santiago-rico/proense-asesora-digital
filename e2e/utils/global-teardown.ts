import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('Starting global teardown...');

  try {
    // Clean up test data
    await cleanupTestData();

    // Clean up temporary files
    await cleanupTempFiles();

    // Generate test report summary
    await generateTestSummary();

    console.log('Global teardown completed successfully');
  } catch (error) {
    console.error('Global teardown failed:', error);
    // Don't fail the tests if teardown fails
  }
}

/**
 * Clean up test data from the system
 */
async function cleanupTestData() {
  console.log('Cleaning up test data...');

  try {
    // Clean up any test data created during tests
    // This could include:
    // - Test user accounts
    // - Test form submissions
    // - Uploaded test files
    // - Test database records

    // Example cleanup operations:
    // await fetch('http://localhost:8080/api/test/cleanup', { method: 'POST' });
    
    console.log('Test data cleanup completed');
  } catch (error) {
    console.warn('Test data cleanup failed:', error);
  }
}

/**
 * Clean up temporary files created during tests
 */
async function cleanupTempFiles() {
  console.log('Cleaning up temporary files...');


  try {
    const tempDir = path.join(process.cwd(), 'test-results', 'temp-files');
    
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Removed temp file: ${file}`);
        } catch (error) {
          console.warn(`Failed to remove temp file ${file}:`, error);
        }
      }
    }

    console.log('Temporary files cleanup completed');
  } catch (error) {
    console.warn('Temporary files cleanup failed:', error);
  }
}

/**
 * Generate a summary of test results
 */
async function generateTestSummary() {
  console.log('Generating test summary...');


  try {
    const resultsDir = path.join(process.cwd(), 'test-results');
    
    // Read test results if available
    const resultsFile = path.join(resultsDir, 'results.json');
    
    if (fs.existsSync(resultsFile)) {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        environment: {
          baseURL: process.env.BASE_URL || 'http://localhost:8080',
          browser: 'chromium,webkit',
          ci: !!process.env.CI,
        },
      };

      // Write summary file
      const summaryFile = path.join(resultsDir, 'summary.json');
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
      
      console.log('Test Summary:');
      console.log(`- Total Tests: ${summary.totalTests}`);
      console.log(`- Passed: ${summary.passed}`);
      console.log(`- Failed: ${summary.failed}`);
      console.log(`- Skipped: ${summary.skipped}`);
      console.log(`- Duration: ${Math.round(summary.duration / 1000)}s`);
      
      // Log failures if any
      if (summary.failed > 0) {
        console.log('\n❌ Some tests failed. Check the detailed report for more information.');
      } else if (summary.passed > 0) {
        console.log('\n✅ All tests passed!');
      }
    }

    console.log('Test summary generation completed');
  } catch (error) {
    console.warn('Test summary generation failed:', error);
  }
}

export default globalTeardown;