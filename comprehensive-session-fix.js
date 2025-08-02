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

function fixAllSessionUserIdReferences(filePath) {
  console.log(`Comprehensive check for session.user.id in ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Check for any session.user.id or session?.user?.id patterns
  const sessionUserIdPatterns = [
    /session\.user\.id/g,
    /session\?\.\?user\?\.\?id/g
  ];
  
  let hasSessionUserId = false;
  for (const pattern of sessionUserIdPatterns) {
    if (pattern.test(content)) {
      hasSessionUserId = true;
      break;
    }
  }
  
  if (hasSessionUserId) {
    console.log(`  Found session.user.id patterns in ${filePath}`);
    
    // Replace session check patterns
    content = content.replace(
      /if \(!session\?\.\?user\?\.\?id\)/g,
      'if (!session?.user?.email)'
    );
    
    content = content.replace(
      /if \(!session\.user\.id\)/g,
      'if (!session?.user?.email)'
    );
    
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
      }
    }
    
    // Replace all remaining session.user.id references with user.id
    content = content.replace(/session\.user\.id/g, 'user.id');
    content = content.replace(/session\?\.\?user\?\.\?id/g, 'user.id');
    
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed all session.user.id patterns in ${filePath}`);
  } else {
    console.log(`ℹ️  No session.user.id patterns found in ${filePath}`);
  }
}

// Get all API files
const apiDir = 'app/api';
const allFiles = getAllTsFiles(apiDir);

console.log(`🔧 Comprehensive session.user.id fix for ${allFiles.length} files...`);

// Fix each file
allFiles.forEach(fixAllSessionUserIdReferences);

console.log('✅ Comprehensive session.user.id fixes complete!');
