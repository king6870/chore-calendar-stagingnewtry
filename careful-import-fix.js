const fs = require('fs');
const path = require('path');

// Get all TypeScript files in the API directory
function getAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixImportsOnly(filePath) {
  console.log(`Checking imports in ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Only fix import statements - be very specific
  if (content.includes("from 'next-auth'") && !content.includes("from 'next-auth/next'")) {
    // Only replace the import line, nothing else
    content = content.replace(
      /import\s+\{\s*getServerSession\s*\}\s+from\s+['"]next-auth['"];?/g,
      "import { getServerSession } from 'next-auth/next';"
    );
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed imports in ${filePath}`);
  } else {
    console.log(`ℹ️  No import fixes needed for ${filePath}`);
  }
}

// Get all API files
const apiDir = 'app/api';
const allFiles = getAllTsFiles(apiDir);

console.log(`🔧 Fixing imports in ${allFiles.length} files...`);

// Fix each file
allFiles.forEach(fixImportsOnly);

console.log('✅ Import fixes complete!');
