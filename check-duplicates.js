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

function checkForDuplicateUserDeclarations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const userDeclarations = [];
  
  lines.forEach((line, index) => {
    if (line.trim().startsWith('const user = ')) {
      userDeclarations.push({
        line: index + 1,
        content: line.trim()
      });
    }
  });
  
  if (userDeclarations.length > 1) {
    console.log(`⚠️  Multiple user declarations found in ${filePath}:`);
    userDeclarations.forEach(decl => {
      console.log(`   Line ${decl.line}: ${decl.content}`);
    });
    return true;
  } else if (userDeclarations.length === 1) {
    console.log(`✅ Single user declaration in ${filePath} (Line ${userDeclarations[0].line})`);
  } else {
    console.log(`ℹ️  No user declarations in ${filePath}`);
  }
  
  return false;
}

// Get all API files
const apiDir = 'app/api';
const allFiles = getAllTsFiles(apiDir);

console.log(`🔍 Checking for duplicate user declarations in ${allFiles.length} files...`);

let filesWithDuplicates = 0;

// Check each file
allFiles.forEach(file => {
  if (checkForDuplicateUserDeclarations(file)) {
    filesWithDuplicates++;
  }
});

console.log(`\n📊 Summary: ${filesWithDuplicates} files have duplicate user declarations`);

if (filesWithDuplicates === 0) {
  console.log('🎉 No duplicate user declarations found!');
}
