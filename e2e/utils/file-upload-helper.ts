import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface TestFile {
  name: string;
  content: Buffer;
  mimeType: string;
  size: number;
}

export class FileUploadHelper {
  private page: Page;
  private tempDir: string;

  constructor(page: Page) {
    this.page = page;
    this.tempDir = path.join(process.cwd(), 'test-results', 'temp-files');
    this.ensureTempDir();
  }

  /**
   * Ensures the temporary directory exists
   */
  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Creates a test PDF file
   */
  createTestPDF(fileName: string = 'test-document.pdf', sizeKB: number = 100): string {
    const filePath = path.join(this.tempDir, fileName);
    
    // Create a simple PDF content (minimal PDF structure)
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000361 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
455
%%EOF`;

    // Pad the content to reach desired size
    const targetSize = sizeKB * 1024;
    const padding = Math.max(0, targetSize - Buffer.byteLength(pdfContent));
    const paddedContent = pdfContent + ' '.repeat(padding);

    fs.writeFileSync(filePath, paddedContent);
    return filePath;
  }

  /**
   * Creates a test image file (JPEG)
   */
  createTestImage(fileName: string = 'test-image.jpg', sizeKB: number = 50): string {
    const filePath = path.join(this.tempDir, fileName);
    
    // Create a minimal JPEG file structure
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
    ]);

    // Pad to desired size
    const targetSize = sizeKB * 1024;
    const padding = Math.max(0, targetSize - jpegHeader.length);
    const paddingBuffer = Buffer.alloc(padding, 0x00);
    
    const fullContent = Buffer.concat([jpegHeader, paddingBuffer]);
    fs.writeFileSync(filePath, fullContent);
    return filePath;
  }

  /**
   * Creates a test file with invalid extension
   */
  createInvalidFile(fileName: string = 'malicious.exe', content: string = 'fake executable'): string {
    const filePath = path.join(this.tempDir, fileName);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  /**
   * Creates a file that exceeds size limit
   */
  createOversizedFile(fileName: string = 'oversized.pdf', sizeMB: number = 10): string {
    const filePath = path.join(this.tempDir, fileName);
    const content = 'x'.repeat(sizeMB * 1024 * 1024);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  /**
   * Uploads a file using drag and drop
   */
  async uploadFileByDragDrop(fileInput: Locator, filePath: string): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await fileInput.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);
  }

  /**
   * Uploads a file using input element
   */
  async uploadFileByInput(inputSelector: string, filePath: string): Promise<void> {
    await this.page.locator(inputSelector).setInputFiles(filePath);
  }

  /**
   * Uploads multiple files
   */
  async uploadMultipleFiles(inputSelector: string, filePaths: string[]): Promise<void> {
    await this.page.locator(inputSelector).setInputFiles(filePaths);
  }

  /**
   * Tests file validation by attempting to upload invalid file
   */
  async testFileValidation(
    inputSelector: string, 
    filePath: string, 
    expectedErrorSelector: string
  ): Promise<boolean> {
    try {
      await this.uploadFileByInput(inputSelector, filePath);
      
      // Wait for validation error to appear
      await this.page.waitForSelector(expectedErrorSelector, { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('File validation test failed:', error);
      return false;
    }
  }

  /**
   * Tests file size limit validation
   */
  async testFileSizeLimit(inputSelector: string, maxSizeKB: number = 5120): Promise<boolean> {
    const oversizedFile = this.createOversizedFile('test-oversized.pdf', 10);
    
    try {
      await this.uploadFileByInput(inputSelector, oversizedFile);
      
      // Should show size error
      const errorVisible = await this.page.locator('[data-testid*="size-error"]').isVisible({ timeout: 5000 });
      return errorVisible;
    } catch (error) {
      return false;
    } finally {
      this.cleanupFile(oversizedFile);
    }
  }

  /**
   * Tests file type validation
   */
  async testFileTypeValidation(inputSelector: string): Promise<boolean> {
    const invalidFile = this.createInvalidFile('malicious.exe');
    
    try {
      await this.uploadFileByInput(inputSelector, invalidFile);
      
      // Should show type error
      const errorVisible = await this.page.locator('[data-testid*="type-error"]').isVisible({ timeout: 5000 });
      return errorVisible;
    } catch (error) {
      return false;
    } finally {
      this.cleanupFile(invalidFile);
    }
  }

  /**
   * Tests multiple file upload with mixed valid/invalid files
   */
  async testMixedFileUpload(inputSelector: string): Promise<{ valid: number; invalid: number }> {
    const validPdf = this.createTestPDF('valid.pdf', 100);
    const validImage = this.createTestImage('valid.jpg', 50);
    const invalidFile = this.createInvalidFile('invalid.txt');
    const oversizedFile = this.createOversizedFile('oversized.pdf', 10);

    try {
      await this.uploadMultipleFiles(inputSelector, [validPdf, validImage, invalidFile, oversizedFile]);
      
      // Count successful uploads vs errors
      await this.page.waitForTimeout(2000); // Wait for processing
      
      const validUploads = await this.page.locator('[data-testid="uploaded-file-item"]').count();
      const errorMessages = await this.page.locator('[data-testid*="error"]').count();
      
      return { valid: validUploads, invalid: errorMessages };
    } finally {
      this.cleanupFiles([validPdf, validImage, invalidFile, oversizedFile]);
    }
  }

  /**
   * Simulates file upload progress
   */
  async monitorUploadProgress(inputSelector: string, filePath: string): Promise<number[]> {
    const progressValues: number[] = [];
    
    // Monitor progress indicators
    this.page.on('console', (msg) => {
      if (msg.text().includes('upload progress')) {
        const match = msg.text().match(/(\d+)%/);
        if (match) {
          progressValues.push(parseInt(match[1]));
        }
      }
    });

    await this.uploadFileByInput(inputSelector, filePath);
    
    // Wait for upload to complete
    await this.page.waitForSelector('[data-testid="upload-complete"]', { timeout: 10000 });
    
    return progressValues;
  }

  /**
   * Tests file upload cancellation
   */
  async testUploadCancellation(inputSelector: string, filePath: string): Promise<boolean> {
    const largeFile = this.createTestPDF('large-file.pdf', 2000); // 2MB file
    
    try {
      await this.uploadFileByInput(inputSelector, largeFile);
      
      // Wait a bit then cancel
      await this.page.waitForTimeout(500);
      await this.page.locator('[data-testid="cancel-upload"]').click();
      
      // Verify cancellation
      const cancelledVisible = await this.page.locator('[data-testid="upload-cancelled"]').isVisible({ timeout: 5000 });
      return cancelledVisible;
    } finally {
      this.cleanupFile(largeFile);
    }
  }

  /**
   * Tests malicious file detection
   */
  async testMaliciousFileDetection(inputSelector: string): Promise<boolean> {
    // Create files that might be flagged as malicious
    const scriptFile = this.createInvalidFile('script.js', 'alert("xss")');
    const phpFile = this.createInvalidFile('shell.php', '<?php system($_GET["cmd"]); ?>');
    
    try {
      for (const file of [scriptFile, phpFile]) {
        await this.uploadFileByInput(inputSelector, file);
        
        // Should be rejected
        const errorVisible = await this.page.locator('[data-testid*="security-error"]').isVisible({ timeout: 3000 });
        if (!errorVisible) {
          return false; // Security check failed
        }
      }
      
      return true;
    } finally {
      this.cleanupFiles([scriptFile, phpFile]);
    }
  }

  /**
   * Creates a test file with specific content and metadata
   */
  createCustomTestFile(
    fileName: string, 
    content: string | Buffer, 
    mimeType: string = 'text/plain'
  ): string {
    const filePath = path.join(this.tempDir, fileName);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  /**
   * Gets file information
   */
  getFileInfo(filePath: string): TestFile {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath);
    const name = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };

    return {
      name,
      content,
      mimeType: mimeTypes[ext] || 'application/octet-stream',
      size: stats.size,
    };
  }

  /**
   * Cleans up a single test file
   */
  cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Failed to cleanup file ${filePath}:`, error);
    }
  }

  /**
   * Cleans up multiple test files
   */
  cleanupFiles(filePaths: string[]): void {
    filePaths.forEach(filePath => this.cleanupFile(filePath));
  }

  /**
   * Cleans up all test files in temp directory
   */
  cleanupAllTestFiles(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        files.forEach(file => {
          const filePath = path.join(this.tempDir, file);
          fs.unlinkSync(filePath);
        });
      }
    } catch (error) {
      console.warn('Failed to cleanup test files:', error);
    }
  }

  /**
   * Validates uploaded file on server (simulation)
   */
  async validateUploadedFile(fileName: string): Promise<boolean> {
    // This would typically make an API call to verify the file was uploaded correctly
    try {
      const response = await this.page.request.get(`/api/validate-upload?file=${fileName}`);
      return response.ok();
    } catch (error) {
      return false;
    }
  }
}

/**
 * Utility function to create file upload helper instance
 */
export function createFileUploadHelper(page: Page): FileUploadHelper {
  return new FileUploadHelper(page);
}