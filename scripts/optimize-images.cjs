#!/usr/bin/env node

/**
 * Image optimization script for Proense Seguros
 * Converts large JPG/PNG images to WebP format for better performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if necessary tools are installed
function checkDependencies() {
  try {
    execSync('which cwebp', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: cwebp is not installed.');
    console.log('Please install webp tools:');
    console.log('  macOS: brew install webp');
    console.log('  Ubuntu/Debian: sudo apt-get install webp');
    console.log('  Or download from: https://developers.google.com/speed/webp/download');
    process.exit(1);
  }
}

// Convert image to WebP
function convertToWebP(inputPath, outputPath, quality = 85) {
  try {
    const cmd = `cwebp -q ${quality} "${inputPath}" -o "${outputPath}"`;
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed to convert ${inputPath}:`, error.message);
    return false;
  }
}

// Get file size in MB
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

// Main optimization function
function optimizeImages() {
  checkDependencies();

  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  const files = fs.readdirSync(imagesDir);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  const results = [];

  console.log('🖼️  Starting image optimization...\n');

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

    const inputPath = path.join(imagesDir, file);
    const outputName = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(imagesDir, outputName);

    // Skip if WebP already exists
    if (fs.existsSync(outputPath)) {
      console.log(`✓ ${outputName} already exists, skipping...`);
      return;
    }

    const originalSize = getFileSizeMB(inputPath);
    totalOriginalSize += parseFloat(originalSize);

    console.log(`Converting ${file} (${originalSize} MB)...`);
    
    // Use higher quality for hero images
    const quality = file.includes('hero') ? 90 : 85;
    
    if (convertToWebP(inputPath, outputPath, quality)) {
      const optimizedSize = getFileSizeMB(outputPath);
      totalOptimizedSize += parseFloat(optimizedSize);
      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
      
      results.push({
        original: file,
        webp: outputName,
        originalSize,
        optimizedSize,
        savings
      });
      
      console.log(`✅ Saved ${savings}% (${originalSize} MB → ${optimizedSize} MB)\n`);
    }
  });

  // Print summary
  console.log('\n📊 Optimization Summary:');
  console.log('========================');
  results.forEach(r => {
    console.log(`${r.original} → ${r.webp}: ${r.savings}% reduction`);
  });
  console.log('\nTotal original size:', totalOriginalSize.toFixed(2), 'MB');
  console.log('Total optimized size:', totalOptimizedSize.toFixed(2), 'MB');
  console.log('Total savings:', ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1) + '%');

  // Generate component update instructions
  console.log('\n📝 Next Steps:');
  console.log('1. Update your components to use WebP images with fallbacks:');
  console.log('   <picture>');
  console.log('     <source srcSet="/images/hero-image.webp" type="image/webp" />');
  console.log('     <img src="/images/hero-image.jpg" alt="Description" />');
  console.log('   </picture>');
  console.log('\n2. Or create a reusable component for optimized images');
  console.log('\n3. Consider implementing lazy loading for below-the-fold images');
}

// Run the optimization
optimizeImages();