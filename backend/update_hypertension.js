const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

const newStandard = '**Explanation**\\n\\nHypertension means consistently high blood pressure in your arteries. Normal BP ~ 120/80 mmHg; higher values over time can damage organs.\\n\\n**Symptoms:** Often asymptomatic ("silent killer"), but severe cases may cause headaches, shortness of breath, or nosebleeds.\\n**Treatment:** ACE inhibitors, calcium channel blockers, diuretics, and lifestyle modifications.\\n**Prevention & Precautions:** Reduce sodium (salt) intake, maintain a healthy weight, limit alcohol, and exercise daily.';

const newHindiStandard = '**विवरण**: उच्च रक्तचाप एक गंभीर स्थिति है।\\n\\n**स्पष्टीकरण (Explanation)**\\n\\nहाइपरटेंशन का मतलब है खून का दबाव सामान्य से ज्यादा होना। यह धीरे-धीरे दिल, किडनी और दिमाग को नुकसान पहुंचा सकता है।\\n\\n**लक्षण:** अक्सर इसके कोई लक्षण नहीं होते (मौन हत्यारा), लेकिन गंभीर मामलों में सिरदर्द, सांस फूलना या नाक से खून आ सकता है।\\n**उपचार:** दवाइयां और जीवनशैली में बदलाव।\\n**बचाव:** नमक कम खाएं, स्वस्थ वजन बनाए रखें और शराब या धूम्रपान से बचें।';

content = content.replace(
  /"\*\*Hypertension \(High Blood Pressure\)\*\*\\n\\n\*\*Symptoms:\*\* Often asymptomatic \('silent killer'\), but severe cases may cause headaches, shortness of breath, or nosebleeds\.\\n\*\*Treatment:\*\* ACE inhibitors, calcium channel blockers, diuretics, and lifestyle modifications\.\\n\*\*Prevention & Precautions:\*\* Reduce sodium \(salt\) intake, maintain a healthy weight, limit alcohol, and exercise daily\."/g,
  `"${newStandard}"`
);

// Matching Hindi block properly avoiding trailing punctuation bugs
content = content.replace(
  /"\*\*विवरण\*\*: उच्च रक्तचाप एक गंभीर स्थिति है।\\n\\n\*\*हाइपरटेंशन \(High Blood Pressure\)\*\*\\n\\n\*\*लक्षण:\*\* अक्सर इसके कोई लक्षण नहीं होते \(मौन हत्यारा\), लेकिन गंभीर मामलों में सिरदर्द, सांस फूलना या नाक से खून आ सकता है।\\n\*\*उपचार:\*\* दवाइयां और जीवनशैली में बदलाव।\\n\*\*बचाव:\*\* नमक कम खाएं, स्वस्थ वजन बनाए रखें और शराब या धूम्रपान से बचें।"/g,
  `"${newHindiStandard}"`
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('Successfully updated server.js with hypertension explanations');
