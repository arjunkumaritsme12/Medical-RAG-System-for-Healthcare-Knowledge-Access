const fs = require('fs');
let lines = fs.readFileSync('server.js', 'utf8').split('\n');
lines[125] = '      hindi_standard: "**विवरण**: डेंगू मच्छर जनित एक गंभीर स्थिति है।\\n\\n**डेंगू बुखार (Dengue Fever)**\\n\\n**लक्षण:** अचानक बुखार, तेज सिरदर्द, आँखों के पीछे दर्द, रैश, मांसपेशियों और जोड़ों में भारी दर्द।\\n**उपचार:** आमतौर पर कोई विशिष्ट एंटीवायरल इलाज़ नहीं; आराम करना, पर्याप्त तरल पदार्थ पीना और डॉक्टर की सलाह लेना।",';
fs.writeFileSync('server.js', lines.join('\n'));
console.log("Fixed!");
