import fs from 'fs';
import path from 'path';

const srcFiles = [
  'src/pages/Chat.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Intelligence.jsx',
  'src/components/Sidebar.jsx'
];

for (const relPath of srcFiles) {
  const p = path.resolve(process.cwd(), relPath);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf-8');
    
    // Replace literal `\${` with `${`
    content = content.replace(/\\\${/g, '${');
    
    // Replace literal `\`` with `` ` ``
    content = content.replace(/\\`/g, '`');

    fs.writeFileSync(p, content, 'utf-8');
    console.log(`Fixed escaped template literals in ${relPath}`);
  }
}
