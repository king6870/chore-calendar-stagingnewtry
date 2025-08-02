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

function fixSessionUserIdReferences(filePath) {
  console.log(`Checking session.user.id references in ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Replace session.user.id with proper user lookup pattern
  if (content.includes('session.user.id')) {
    // Add user lookup after session check if not already present
    if (!content.includes('const user = await prisma.user.findUnique') && 
        !content.includes('const currentUser = await prisma.user.findUnique')) {
      
      // Find the session check pattern and add user lookup after it
      const sessionCheckPattern = /(if \(!session\?\.\?user\?\.\?email\) \{\s*return NextResponse\.json\(\{ error: ['"]Unauthorized['"] \}, \{ status: 401 \}\);\s*\})/;
      
      if (sessionCheckPattern.test(content)) {
        content = content.replace(
          sessionCheckPattern,
          `$1

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }`
        );
        changed = true;
      }
    }
    
    // Replace session.user.id with user.id
    content = content.replace(/session\.user\.id/g, 'user.id');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed session.user.id references in ${filePath}`);
  } else {
    console.log(`ℹ️  No session.user.id fixes needed for ${filePath}`);
  }
}

// Get all API files
const apiDir = 'app/api';
const allFiles = getAllTsFiles(apiDir);

console.log(`🔧 Fixing session.user.id references in ${allFiles.length} files...`);

// Fix each file
allFiles.forEach(fixSessionUserIdReferences);

console.log('✅ Session.user.id fixes complete!');
