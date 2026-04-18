const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

const newStandard = '**Explanation**\\n\\n**Viral Infection**\\nA viral infection is a disease caused by viruses, which enter body cells and use them to multiply.\\n**Bacterial Infection**\\nA bacterial infection is a disease caused by bacteria, which can grow and reproduce on their own inside the body.\\n\\n**Symptoms:** Fever, chills, fatigue, muscle aches, and localized pain.\\n**Treatment:** Bacterial infections are treated with antibiotics. Viral infections are treated with antivirals or supportive care (rest, fluids).\\n**Prevention & Precautions:** Frequent hand hygiene, avoiding close contact with sick individuals, and staying up to date with vaccinations.';

const newHindiStandard = '**स्पष्टीकरण (Explanation)**\\n\\n**वायरल संक्रमण**\\nवायरल संक्रमण वह बीमारी है जो वायरस के कारण होती है, जो शरीर की कोशिकाओं में जाकर बढ़ते हैं।\\n**बैक्टीरियल संक्रमण**\\nबैक्टीरियल संक्रमण वह बीमारी है जो बैक्टीरिया के कारण होती है, जो शरीर में खुद से बढ़ते और फैलते हैं।\\n\\n**लक्षण:** बुखार, ठंड लगना, थकान, शरीर में दर्द।\\n**उपचार:** बैक्टीरियल के लिए एंटीबायोटिक (Antibiotic) की जरूरत होती है। वायरल संक्रमण अक्सर आराम और तरल पदार्थों से ठीक हो जाते हैं (एंटीबायोटिक काम नहीं करती)।\\n**बचाव:** हाथ अच्छी तरह धोएं और बीमार लोगों से दूर रहें।';

content = content.replace(
  /"\*\*Viral & Bacterial Infections\*\*\\n\\n\*\*Symptoms:\*\* Fever, chills, fatigue, muscle aches, and localized pain\.\\n\*\*Treatment:\*\* Bacterial infections are treated with antibiotics\. Viral infections are treated with antivirals or supportive care \(rest, fluids\)\.\\n\*\*Prevention & Precautions:\*\* Frequent hand hygiene, avoiding close contact with sick individuals, and staying up to date with vaccinations\."/g,
  `"${newStandard}"`
);

content = content.replace(
  /"\*\*वायरल और बैक्टीरियल संक्रमण \(Infections\)\*\*\\n\\n\*\*लक्षण:\*\* बुखार, ठंड लगना, थकान, शरीर में दर्द।\\n\*\*उपचार:\*\* बैक्टीरियल के लिए एंटीबायोटिक \(Antibiotic\) की जरूरत होती है। वायरल संक्रमण अक्सर आराम और तरल पदार्थों से ठीक हो जाते हैं \(एंटीबायोटिक काम नहीं करती\)।\\n\*\*बचाव:\*\* हाथ अच्छी तरह धोएं और बीमार लोगों से दूर रहें।"/g,
  `"${newHindiStandard}"`
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('Successfully updated server.js with infection explanations');
