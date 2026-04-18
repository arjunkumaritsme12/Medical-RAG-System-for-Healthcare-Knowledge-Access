const fs = require('fs');
let lines = fs.readFileSync('server.js', 'utf8').split('\n');
lines.splice(146, 2, 
  '    general: {',
  '      standard: "Regarding your query, comprehensive medical assessment requires contextual clinical data.",',
  '      simplified: "We need a doctors evaluation to give specific advice to an individual.",',
  '      hindi_standard: "आपके प्रश्न के संबंध में, उचित चिकित्सा जांच की आवश्यकता है।",',
  '      hindi_simplified: "कृपया डॉक्टर से सलाह लें।"',
  '    },'
);
fs.writeFileSync('server.js', lines.join('\n'));
console.log("Fixed general!");
