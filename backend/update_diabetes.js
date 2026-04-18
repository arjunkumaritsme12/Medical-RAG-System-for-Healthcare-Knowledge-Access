const fs = require('fs');

let content = fs.readFileSync('server.js', 'utf8');

const newStandard = '**Diabetes Mellitus**\\n\\nType-2 diabetes ek chronic metabolic disease hai jisme body insulin ko properly use nahi karti (insulin resistance), aur blood sugar gradually increase hone lagta hai. Sabse dangerous baat ye hai ki early stage me symptoms bahut mild ya unnoticed hote hain.\\n\\n**Symptoms:** Increased thirst, frequent urination, hunger, fatigue, and blurred vision.\\n**Treatment:** Managing blood sugar levels through insulin therapy, oral medications (like Metformin), diet, and exercise.\\n**Prevention & Precautions:** Maintain a healthy weight, eat a balanced diet low in refined sugars, exercise regularly, and monitor blood glucose levels.';

const newHindiStandard = '**विवरण**: टाइप 2 मधुमेह एक जीवनशैली की बीमारी है।\\n\\n**डायबिटीज मेलिटस (Diabetes Mellitus)**\\n\\nटाइप-2 डायबिटीज एक लंबे समय तक रहने वाली बीमारी (क्रॉनिक रोग) है, जिसमें शरीर इंसुलिन का सही उपयोग नहीं कर पाता। इससे खून में शुगर (ग्लूकोज़) धीरे-धीरे बढ़ने लगती है। शुरुआत में इसके लक्षण हल्के होते हैं, इसलिए लोग अक्सर इन्हें नजरअंदाज कर देते हैं।\\n\\n**लक्षण:** अत्यधिक प्यास लगना, बार-बार पेशाब आना, भूख लगना, थकान और धुंधला दिखाई देना।\\n**उपचार:** इंसुलिन थैरेपी, मेटफॉर्मिन जैसी ओरल दवाओं, संतुलित आहार और व्यायाम के माध्यम से ब्लड शुगर लेवल को मैनेज करना।\\n**बचाव:** स्वस्थ वजन बनाए रखें, रिफाइंड चीनी कम खाएं, नियमित व्यायाम करें और नियमित जांच कराएं।';

content = content.replace(
  /"\*\*Diabetes Mellitus\*\*\\n\\n\*\*Symptoms:\*\* Increased thirst, frequent urination, hunger, fatigue, and blurred vision\.\\n\*\*Treatment:\*\* Managing blood sugar levels through insulin therapy, oral medications \(like Metformin\), diet, and exercise\.\\n\*\*Prevention & Precautions:\*\* Maintain a healthy weight, eat a balanced diet low in refined sugars, exercise regularly, and monitor blood glucose levels."/g,
  `"${newStandard}"`
);

content = content.replace(
  /"\*\*विवरण\*\*: टाइप 2 मधुमेह एक जीवनशैली की बीमारी है।\\n\\n\*\*डायबिटीज मेलिटस \(Diabetes Mellitus\)\*\*\\n\\n\*\*लक्षण:\*\* अत्यधिक प्यास लगना, बार-बार पेशाब आना, भूख लगना, थकान और धुंधला दिखाई देना।\\n\*\*उपचार:\*\* इंसुलिन थैरेपी, मेटफॉर्मिन जैसी ओरल दवाओं, संतुलित आहार और व्यायाम के माध्यम से ब्लड शुगर लेवल को मैनेज करना।\\n\*\*बचाव:\*\* स्वस्थ वजन बनाए रखें, रिफाइंड चीनी कम खाएं, नियमित व्यायाम करें और नियमित जांच कराएं।"/g,
  `"${newHindiStandard}"`
);

fs.writeFileSync('server.js', content, 'utf8');
console.log('Successfully updated server.js with diabetes explanations');
