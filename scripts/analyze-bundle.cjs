#!/usr/bin/env node

/**
 * Bundle size analyzer for monitoring package impact
 */

const fs = require('fs');
const path = require('path');

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function analyzeBundle() {
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  const files = [];
  let totalSize = 0;

  // Recursively find all files in dist
  function walkDir(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (stat.isFile()) {
        const relativePath = path.relative(distPath, fullPath);
        files.push({
          path: relativePath,
          size: stat.size,
          ext: path.extname(item).toLowerCase()
        });
        totalSize += stat.size;
      }
    });
  }

  walkDir(distPath);

  // Sort by size
  files.sort((a, b) => b.size - a.size);

  console.log('📦 Bundle Analysis Report');
  console.log('========================\n');

  // Group by file type
  const byType = {};
  files.forEach(file => {
    if (!byType[file.ext]) {
      byType[file.ext] = { count: 0, size: 0, files: [] };
    }
    byType[file.ext].count++;
    byType[file.ext].size += file.size;
    byType[file.ext].files.push(file);
  });

  // Print summary by type
  console.log('📊 Summary by File Type:');
  Object.entries(byType)
    .sort((a, b) => b[1].size - a[1].size)
    .forEach(([ext, data]) => {
      const percentage = ((data.size / totalSize) * 100).toFixed(1);
      console.log(`${ext || 'no extension'}: ${data.count} files, ${formatBytes(data.size)} (${percentage}%)`);
    });

  console.log(`\nTotal: ${files.length} files, ${formatBytes(totalSize)}`);

  // Print largest files
  console.log('\n🔍 Largest Files:');
  files.slice(0, 10).forEach(file => {
    const percentage = ((file.size / totalSize) * 100).toFixed(1);
    console.log(`${file.path}: ${formatBytes(file.size)} (${percentage}%)`);
  });

  // Check for concerning sizes
  console.log('\n⚠️  Warnings:');
  const largeJsFiles = files.filter(f => f.ext === '.js' && f.size > 500 * 1024);
  if (largeJsFiles.length > 0) {
    console.log(`- ${largeJsFiles.length} JavaScript files larger than 500KB`);
    largeJsFiles.forEach(f => {
      console.log(`  - ${f.path}: ${formatBytes(f.size)}`);
    });
  }

  const largeCssFiles = files.filter(f => f.ext === '.css' && f.size > 100 * 1024);
  if (largeCssFiles.length > 0) {
    console.log(`- ${largeCssFiles.length} CSS files larger than 100KB`);
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (largeJsFiles.length > 0) {
    console.log('- Consider code splitting for large JavaScript bundles');
    console.log('- Use dynamic imports for routes and heavy components');
    console.log('- Run "npm run build -- --analyze" to see detailed bundle composition');
  }
  
  console.log('- Ensure images are optimized (use WebP format)');
  console.log('- Enable gzip/brotli compression on your server');
  console.log('- Consider using a CDN for static assets');
}

// Run the analysis
analyzeBundle();