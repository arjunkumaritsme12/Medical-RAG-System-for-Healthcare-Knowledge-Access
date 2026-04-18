const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

const newStandard = '**Vaccinations & Immunization**\\n\\nmRNA vaccines use a small piece of genetic code (mRNA) to teach your body how to make a harmless protein from a virus. This helps your immune system learn to fight the real virus later.\\n\\n**Overview:** Vaccines act by stimulating the immune system to recognize and destroy specific pathogens using antigens or mRNA.\\n**Precautions:** Minor side effects like fever or arm soreness may occur. Rarely, severe allergic reactions.';

const newHindiStandard = '**विवरण**: वैक्सीन रोग प्रतिरोधक क्षमता बढ़ाती हैं।\\n\\n**टीकाकरण और एमआरएनए वैक्सीन (Vaccines)**\\n\\nmRNA वैक्सीन शरीर को वायरस से लड़ना सिखाने के लिए एक छोटा मैसेज (mRNA) देती है। यह शरीर को वायरस जैसा एक छोटा प्रोटीन बनाना सिखाती है।\\n\\n**विवरण:** एमआरएनए (mRNA) वैक्सीन शरीर की कोशिकाओं को यह निर्देश देती है कि वे एक प्रोटीन (या उसका हिस्सा) कैसे बनाएं जो प्रतिरक्षा प्रतिक्रिया को ट्रिगर करता है। इससे एंटीबॉडी बनते हैं।\\n**सावधानियां:** बुखार या बांह में दर्द जैसे मामूली दुष्प्रभाव हो सकते हैं।';

content = content.replace(
  /"\*\*Vaccinations & Immunization\*\*\\n\\n\*\*Overview:\*\* Vaccines act by stimulating the immune system to recognize and destroy specific pathogens using antigens or mRNA\.\\n\*\*Precautions:\*\* Minor side effects like fever or arm soreness may occur\. Rarely, severe allergic reactions\."/g,
  `"${newStandard}"`
);

content = content.replace(
  /"\*\*विवरण\*\*: वैक्सीन रोग प्रतिरोधक क्षमता बढ़ाती हैं।\\n\\n\*\*टीकाकरण और एमआरएनए वैक्सीन \(Vaccines\)\*\*\\n\\n\*\*विवरण:\*\* एमआरएनए \(mRNA\) वैक्सीन शरीर की कोशिकाओं को यह निर्देश देती है कि वे एक प्रोटीन \(या उसका हिस्सा\) कैसे बनाएं जो प्रतिरक्षा प्रतिक्रिया को ट्रिगर करता है। इससे एंटीबॉडी बनते हैं।\\n\*\*सावधानियां:\*\* बुखार या बांह में दर्द जैसे मामूली दुष्प्रभाव हो सकते हैं।"/g,
  `"${newHindiStandard}"`
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('Successfully updated server.js with vaccine explanations');
