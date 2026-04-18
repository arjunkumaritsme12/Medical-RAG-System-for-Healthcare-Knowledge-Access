const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Initialize SQLite Database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error("Error opening database " + err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            age TEXT,
            gender TEXT,
            bp TEXT,
            history TEXT
        )`, (err) => {
      if (err) console.error("Error creating users table " + err.message);
    });
  }
});

function getMedicalTopic(query, history = []) {
  let q = query.toLowerCase();
  
  // Follow-up question memory
  let effectiveQuery = q;
  const followUpWords = ['it', 'this', 'that', 'they', 'treatment', 'causes', 'symptoms'];
  const hasFollowUpWord = followUpWords.some(w => q.split(' ').includes(w));
  
  if (hasFollowUpWord && history.length > 0) {
    const lastQ = history[history.length - 1].toLowerCase();
    effectiveQuery = lastQ + " " + q;
  }
  
  // Comparison detection
  if (effectiveQuery.includes('vs') || effectiveQuery.includes('versus') || effectiveQuery.includes('compare')) {
    if (effectiveQuery.includes('viral') || effectiveQuery.includes('bacterial') || effectiveQuery.includes('virus') || effectiveQuery.includes('bacteria')) return 'comparison_infection';
    if (effectiveQuery.includes('type 1') || effectiveQuery.includes('type 2') || effectiveQuery.includes('diabet')) return 'comparison_diabetes';
    if (effectiveQuery.includes('malaria') || effectiveQuery.includes('dengue')) return 'comparison_mosquito';
  }

  // Guardrails: Detect out-of-domain topics
  const nonMedicalKeywords = ['movie', 'cricket', 'match', 'coding', 'code', 'python', 'politics', 'joke', 'shopping', 'weather', 'sport'];
  if (nonMedicalKeywords.some(w => effectiveQuery.includes(w))) return 'out_of_domain';
  
  const medicalKeywords = ['symptom', 'disease', 'medicine', 'treatment', 'diagnos', 'prevention', 'health', 'infection', 'fever', 'blood pressure', 'sugar', 'breath', 'pain', 'tb', 'vaccine', 'virus', 'bacteria', 'doctor', 'malaria', 'dengue', 'fatigue', 'headache'];
  if (!medicalKeywords.some(w => effectiveQuery.includes(w)) && !effectiveQuery.includes('vs') && !hasFollowUpWord && !effectiveQuery.includes('paracetamol')) return 'out_of_domain';
  if (['diabet', 'sugar', 'insulin'].some(k => effectiveQuery.includes(k))) return 'diabetes';
  if (['hypertens', 'blood pressure', 'bp'].some(k => effectiveQuery.includes(k))) return 'hypertension';
  if (['vaccin', 'mrna', 'immuniz'].some(k => effectiveQuery.includes(k))) return 'vaccine';
  if (['vir', 'bacteri', 'infect'].some(k => effectiveQuery.includes(k))) return 'infection';
  if (['asthma', 'breath', 'wheez'].some(k => effectiveQuery.includes(k))) return 'asthma';
  if (['dengue', 'mosquito'].some(k => effectiveQuery.includes(k))) return 'dengue';
  if (['tb', 'tuberculosis', 'cough'].some(k => effectiveQuery.includes(k))) return 'tuberculosis';
  if (['malaria', 'plasmodium'].some(k => effectiveQuery.includes(k))) return 'malaria';
  if (['fever', 'temperature', 'pyrexia'].some(k => effectiveQuery.includes(k))) return 'fever';
  return 'general';
}

function checkUrgency(query) {
  const q = query.toLowerCase();
  const highRisk = ['chest pain', 'severe breathing difficulty', 'shortness of breath', 'heavy bleeding', 'unconsciousness', 'seizure', 'confusion', 'blue lips', 'severe dehydration', 'signs of shock', 'coughing blood'];
  if (highRisk.some(k => q.includes(k))) {
    return "This may require urgent medical attention. Please contact emergency services or go to the nearest hospital immediately.";
  }
  return null;
}

function generateDemoAnswer(query, topic, isRegenerate, profile, demo, guide, uiLanguage) {
  const urgency = checkUrgency(query);
  if (urgency) {
    return {
      isEmergency: true,
      urgency: urgency,
      standard: urgency,
      simplified: urgency,
      confidence: 100
    };
  }

  if (topic === 'out_of_domain') {
    const msg = "This assistant is designed only for medical and health-related questions. Please ask about symptoms, diseases, treatments, prevention, or healthcare support.";
    return {
      isNonMedical: true,
      standard: msg,
      simplified: msg,
      confidence: 0
    };
  }

  const answers = {
    diabetes: {
      standard: "**Explanation**\n\nType-2 diabetes ek chronic metabolic disease hai jisme body insulin ko properly use nahi karti (insulin resistance), aur blood sugar gradually increase hone lagta hai. Sabse dangerous baat ye hai ki early stage me symptoms bahut mild ya unnoticed hote hain.\n\n**Symptoms:** Increased thirst, frequent urination, hunger, fatigue, and blurred vision.\n**Treatment:** Managing blood sugar levels through insulin therapy, oral medications (like Metformin), diet, and exercise.\n**Prevention & Precautions:** Maintain a healthy weight, eat a balanced diet low in refined sugars, exercise regularly, and monitor blood glucose levels.",
      simplified: "• **Symptoms:** Always thirsty, peeing often, tired.\n• **Treatment:** Insulin, healthy eating, exercise.\n• **Prevention:** Stay active and eat healthy foods.",
      hindi_standard: "**विवरण**: टाइप 2 मधुमेह एक जीवनशैली की बीमारी है।\n\n**स्पष्टीकरण (Explanation)**\n\nटाइप-2 डायबिटीज एक लंबे समय तक रहने वाली बीमारी (क्रॉनिक रोग) है, जिसमें शरीर इंसुलिन का सही उपयोग नहीं कर पाता। इससे खून में शुगर (ग्लूकोज़) धीरे-धीरे बढ़ने लगती है। शुरुआत में इसके लक्षण हल्के होते हैं, इसलिए लोग अक्सर इन्हें नजरअंदाज कर देते हैं।\n\n**लक्षण:** अत्यधिक प्यास लगना, बार-बार पेशाब आना, भूख लगना, थकान और धुंधला दिखाई देना।\n**उपचार:** इंसुलिन थैरेपी, मेटफॉर्मिन जैसी ओरल दवाओं, संतुलित आहार और व्यायाम के माध्यम से ब्लड शुगर लेवल को मैनेज करना।\n**बचाव:** स्वस्थ वजन बनाए रखें, रिफाइंड चीनी कम खाएं, नियमित व्यायाम करें और नियमित जांच कराएं।",
      hindi_simplified: "**संक्षिप्त विवरण**: यह शुगर की बीमारी है।\n\n• **लक्षण:** ज्यादा प्यास लगना, बार-बार पेशाब, थकान।\n• **उपचार:** इंसुलिन और स्वस्थ खान-पान।\n• **बचाव:** सक्रिय रहें और पौष्टिक भोजन करें।"
    },
    hypertension: {
      standard: "**Explanation**\n\nHypertension means consistently high blood pressure in your arteries. Normal BP ~ 120/80 mmHg; higher values over time can damage organs.\n\n**Symptoms:** Often asymptomatic ('silent killer'), but severe cases may cause headaches, shortness of breath, or nosebleeds.\n**Treatment:** ACE inhibitors, calcium channel blockers, diuretics, and lifestyle modifications.\n**Prevention & Precautions:** Reduce sodium (salt) intake, maintain a healthy weight, limit alcohol, and exercise daily.",
      simplified: "• **Symptoms:** Usually none, sometimes headaches.\n• **Treatment:** Blood pressure medicine, eating less salt.\n• **Prevention:** Exercise and low salt diet.",
      hindi_standard: "**विवरण**: उच्च रक्तचाप एक गंभीर स्थिति है।\n\n**स्पष्टीकरण (Explanation)**\n\nहाइपरटेंशन का मतलब है खून का दबाव सामान्य से ज्यादा होना। यह धीरे-धीरे दिल, किडनी और दिमाग को नुकसान पहुंचा सकता है।\n\n**लक्षण:** अक्सर इसके कोई लक्षण नहीं होते (मौन हत्यारा), लेकिन गंभीर मामलों में सिरदर्द, सांस फूलना या नाक से खून आ सकता है।\n**उपचार:** दवाइयां और जीवनशैली में बदलाव।\n**बचाव:** नमक कम खाएं, स्वस्थ वजन बनाए रखें और शराब या धूम्रपान से बचें।",
      hindi_simplified: "**संक्षिप्त विवरण**: यह बीपी (BP) की बीमारी है।\n\n• **लक्षण:** अक्सर कोई नहीं, कभी-कभी सिरदर्द।\n• **उपचार:** बीपी की गोली और कम नमक।\n• **बचाव:** व्यायाम करें और नमक कम खाएं।"
    },
    vaccine: {
      standard: "**Explanation**\n\nmRNA vaccines use a small piece of genetic code (mRNA) to teach your body how to make a harmless protein from a virus. This helps your immune system learn to fight the real virus later.\n\n**Overview:** Vaccines act by stimulating the immune system to recognize and destroy specific pathogens using antigens or mRNA.\n**Precautions:** Minor side effects like fever or arm soreness may occur. Rarely, severe allergic reactions.",
      simplified: "• **What it is:** Trains your body to fight germs.\n• **Precautions:** Your arm might be sore for a day.",
      hindi_standard: "**विवरण**: वैक्सीन रोग प्रतिरोधक क्षमता बढ़ाती हैं।\n\n**स्पष्टीकरण (Explanation)**\n\nmRNA वैक्सीन शरीर को वायरस से लड़ना सिखाने के लिए एक छोटा मैसेज (mRNA) देती है। यह शरीर को वायरस जैसा एक छोटा प्रोटीन बनाना सिखाती है।\n\n**विवरण:** एमआरएनए (mRNA) वैक्सीन शरीर की कोशिकाओं को यह निर्देश देती है कि वे एक प्रोटीन (या उसका हिस्सा) कैसे बनाएं जो प्रतिरक्षा प्रतिक्रिया को ट्रिगर करता है। इससे एंटीबॉडी बनते हैं।\n**सावधानियां:** बुखार या बांह में दर्द जैसे मामूली दुष्प्रभाव हो सकते हैं।",
      hindi_simplified: "**संक्षिप्त विवरण**: यह आपके शरीर को बीमारियों से लड़ना सिखाती है।\n\n• **यह क्या है:** शरीर को वायरस से लड़ना सिखाना।\n• **सावधानियां:** एक दिन के लिए हाथ में दर्द हो सकता है।"
    },
    infection: {
      standard: "**Summary**: Viral and Bacterial infections have different causes and treatments.\n\n**Viral & Bacterial Infections**\n\n**Symptoms:** Fever, chills, fatigue, muscle aches, and localized pain.\n**Treatment:** Bacterial infections are treated with antibiotics. Viral infections are treated with antivirals or supportive care (rest, fluids).\n**Prevention & Precautions:** Frequent hand hygiene, avoiding close contact with sick individuals, and staying up to date with vaccinations.",
      simplified: "• **Symptoms:** Fever, feeling tired, body aches.\n• **Treatment:** Antibiotics (for bacteria) or rest and fluids (for viruses).\n• **Prevention:** Wash your hands and get vaccinated.",
      hindi_standard: "**विवरण**: बैक्टीरियल और वायरल संक्रमण अलग-अलग होते हैं।\n\n**वायरल और बैक्टीरियल संक्रमण (Infections)**\n\n**लक्षण:** बुखार, ठंड लगना, थकान, शरीर में दर्द।\n**उपचार:** बैक्टीरियल के लिए एंटीबायोटिक (Antibiotic) की जरूरत होती है। वायरल संक्रमण अक्सर आराम और तरल पदार्थों से ठीक हो जाते हैं (एंटीबायोटिक काम नहीं करती)।\n**बचाव:** हाथ अच्छी तरह धोएं और बीमार लोगों से दूर रहें।",
      hindi_simplified: "**संक्षिप्त विवरण**: वायरस और बैक्टीरिया दोनों बीमारी फैलाते हैं।\n\n• **लक्षण:** बुखार, थकान, शरीर दर्द।\n• **उपचार:** बैक्टीरिया के लिए दवा, वायरस के लिए आराम।\n• **बचाव:** हाथ धोएं।"
    },
    dengue: {
      standard: "**Dengue Fever**\n\n**Symptoms:** High fever, severe headache, severe pain behind the eyes, joint pain, muscle and bone pain, rash, and mild bleeding.\n**Treatment:** Supportive care. Acetaminophen for fever and pain. Avoid NSAIDs (ibuprofen, aspirin) due to bleeding risk. Fluid replacement is critical.\n**Prevention & Precautions:** Eradicate mosquito breeding sites (stagnant water), use DEET or picaridin insect repellent, and wear long sleeves.",
      simplified: "• **Symptoms:** High fever, severe body pain, eye pain, rash.\n• **Treatment:** Rest, fluids, take Tylenol (No ibuprofen).\n• **Prevention:** Prevent mosquito bites and remove standing water.",
      hindi_standard: "**विवरण**: डेंगू मच्छर जनित एक गंभीर स्थिति है।\n\n**डेंगू बुखार (Dengue Fever)**\n\n**लक्षण:** अचानक बुखार, तेज सिरदर्द, आँखों के पीछे दर्द, रैश, मांसपेशियों और जोड़ों में भारी दर्द।\n**उपचार:** आमतौर पर कोई विशिष्ट एंटीवायरल इलाज़ नहीं; आराम करना, पर्याप्त तरल पदार्थ पीना और डॉक्टर की सलाह लेना।",
      hindi_simplified: "**संक्षिप्त विवरण**: बुखार संक्रमण से लड़ने का तरीका है。\n\n• **लक्षण:** शरीर गर्म होना, पसीना आना।\n• **उपचार:** पैरासिटामोल लें, पर्याप्त पानी पिएं।\n• **बचाव:** साफ सफाई रखें।"
    },
    comparison_infection: {
      standard: "**Summary**: Viral and Bacterial infections have different causes and treatments.\n\n### Viral vs Bacterial Infection Comparison\n\n| Feature | Viral Infection | Bacterial Infection |\n|---|---|---|\n| **Cause** | Virus | Bacteria |\n| **Treatment** | Mostly supportive / antivirals in some cases. Antibiotics are completely ineffective. | Often antibiotics if indicated by a physician. |\n| **Spread** | Highly contagious; spreads via respiratory droplets or contact. | Varies by bacteria; some contagious, some opportunistic. |\n| **Examples** | Common cold, Flu, COVID-19. | Strep throat, Tuberculosis, UTI. |",
      simplified: "• **Viral:** Caused by tiny viruses, cannot be cured with antibiotics, you just need rest and fluids.\n• **Bacterial:** Caused by living bugs called bacteria, can be cured with antibiotics from a doctor.",
      hindi_standard: "**विवरण**: बैक्टीरियल और वायरल संक्रमण अलग-अलग होते हैं।\n\n### वायरल बनाम बैक्टीरियल संक्रमण (Viral vs Bacterial)\n\n| विशेषता | वायरल संक्रमण | बैक्टीरियल संक्रमण |\n|---|---|---|\n| **कारण** | वायरस | बैक्टीरिया |\n| **उपचार** | एंटीबायोटिक बेअसर होती हैं। आराम और लक्षण आधारित इलाज। | अक्सर डॉक्टर एंटीबायोटिक देते हैं। |\n| **फैलाव** | अत्यधिक संक्रामक; हवा या संपर्क से फैलता है। | बैक्टीरिया पर निर्भर; कुछ संक्रामक, कुछ नहीं। |\n| **उदाहरण** | सर्दी, फ्लू (Flu), कोविड-19। | स्ट्रेप थ्रोट, टीबी, यूटीआई (UTI)। |",
      hindi_simplified: "**संक्षिप्त विवरण**: वायरस और बैक्टीरिया दोनों बीमारी फैलाते हैं।\n\n• **वायरल:** एंटीबायोटिक काम नहीं करती। आराम करें।\n• **बैक्टीरियल:** डॉक्टर की एंटीबायोटिक से ठीक होता है।"
    },
    comparison_diabetes: {
      standard: "**Summary**: Type 1 diabetes is genetic; Type 2 is lifestyle-related.\n\n### Type 1 vs Type 2 Diabetes\n\n| Feature | Type 1 Diabetes | Type 2 Diabetes |\n|---|---|---|\n| **Cause** | Autoimmune; pancreas produces zero insulin. | Insulin resistance; body doesn't use insulin well. |\n| **Onset** | Usually in childhood or young adulthood. | Usually develops in adults, though increasing in children. |\n| **Treatment** | Lifelong insulin therapy is mandatory. | Lifestyle changes, oral medications, sometimes insulin. |\n| **Prevention** | Cannot be prevented currently. | Can often be prevented or delayed with a healthy lifestyle. |",
      simplified: "• **Type 1:** Your body makes no insulin. You must take insulin every day. Cannot be prevented.\n• **Type 2:** Your body doesn't use insulin well. Can often be managed with diet and exercise.",
      hindi_standard: "**विवरण**: टाइप 1 और टाइप 2 मधुमेह के कारण अलग होते हैं।\n\n### टाइप 1 बनाम टाइप 2 मधुमेह\n\n| विशेषता | टाइप 1 मधुमेह | टाइप 2 मधुमेह |\n|---|---|---|\n| **कारण** | ऑटोइम्यून; शरीर इंसुलिन नहीं बनाता। | शरीर इंसुलिन का सही उपयोग नहीं कर पाता। |\n| **शुरुआत** | अक्सर बचपन या युवावस्था में। | अक्सर वयस्कों में होता है। |\n| **उपचार** | आजीवन इंसुलिन जरूरी है। | आहार, व्यायाम और गोलियां। |\n| **बचाव** | इससे बचा नहीं जा सकता। | स्वस्थ जीवनशैली से बचा जा सकता है। |",
      hindi_simplified: "**संक्षिप्त विवरण**: टाइप 1 जन्म से होता है, टाइप 2 खानपान से।\n\n• **टाइप 1:** रोज इंसुलिन लेना पड़ता है।\n• **टाइप 2:** व्यायाम और खानपान से ठीक होता है।"
    },
    comparison_mosquito: {
      standard: "**Summary**: Malaria is caused by a parasite, Dengue by a virus.\n\n### Malaria vs Dengue Fever\n\n| Feature | Malaria | Dengue Fever |\n|---|---|---|\n| **Pathogen** | Plasmodium parasite | Dengue virus |\n| **Vector** | Anopheles mosquito (bites at night) | Aedes mosquito (bites during day) |\n| **Key Symptoms**| Chills, cyclical fever, sweating. | High fever, severe joint/bone pain (\"breakbone fever\"), rash. |\n| **Treatment** | Specific antimalarial drugs (e.g., Artemisinin). | Supportive care, fluid replacement, pain relief (No NSAIDs). |",
      simplified: "• **Malaria:** Caused by parasites, mosquitoes bite at night. Treated with special medicine.\n• **Dengue:** Caused by a virus, mosquitoes bite in the daytime. Extremely painful joints. Treated with rest and fluids.",
      hindi_standard: "**विवरण**: दोनों मच्छर जनित हैं, लेकिन कारण अलग हैं।\n\n### मलेरिया बनाम डेंगू\n\n| विशेषता | मलेरिया | डेंगू |\n|---|---|---|\n| **कारण** | प्लास्मोडियम परजीवी | डेंगू वायरस |\n| **मच्छर** | एनाफिलीज (रात में काटता है) | एडीज (दिन में काटता है) |\n| **लक्षण** | ठंड लगना, पसीना आना। | तेज बुखार, हड्डियों में दर्द, रैश। |\n| **उपचार** | मलेरिया की विशेष दवा। | आराम और तरल पदार्थ (NSAIDs मना हैं)। |",
      hindi_simplified: "**संक्षिप्त विवरण**: मलेरिया रात के मच्छर से, डेंगू दिन के मच्छर से होता है।\n\n• **मलेरिया:** रात में एनाफिलीज मच्छर काटता है।\n• **डेंगू:** दिन में एडीज मच्छर काटता है, हड्डियों में दर्द होता है।"
    },
    general: {
      standard: "Regarding your query, comprehensive medical assessment requires contextual clinical data.",
      simplified: "We need a doctors evaluation to give specific advice to an individual.",
      hindi_standard: "आपके प्रश्न के संबंध में, उचित चिकित्सा जांच की आवश्यकता है।",
      hindi_simplified: "कृपया डॉक्टर से सलाह लें।"
    },
    malaria: {
      standard: "**Malaria**\n\n**Symptoms:** Paroxysms of fever, chills, and sweats. Also fatigue, nausea, and vomiting.\n**Treatment:** Antimalarial medications such as Artemisinin-based combination therapies (ACTs) or chloroquine depending on resistance.\n**Prevention & Precautions:** Antimalarial prophylaxis when traveling to endemic zones, sleeping under insecticide-treated bed nets.",
      simplified: "• **Symptoms:** Fever, severe chills, sweating.\n• **Treatment:** Antimalarial prescription medicine.\n• **Prevention:** Sleep under nets, use bug spray.",
      hindi_standard: "**विवरण**: मलेरिया एक परजीवी संक्रमण है।\n\n**मलेरिया (Malaria)**\n\n**लक्षण:** ठंड लगकर तेज बुखार आना, पसीना आना, थकान और उल्टी।\n**उपचार:** डॉक्टर की सलाह से एंटीमलेरियल दवाएं (जैसे क्लोरोक्वीन या ACTs) लेना जरूरी है।\n**बचाव:** रात में मच्छरदानी का प्रयोग करें और मच्छर भगाने वाले स्प्रे का उपयोग करें।",
      hindi_simplified: "**संक्षिप्त विवरण**: यह मच्छरों द्वारा फैलने वाली बीमारी है।\n\n• **लक्षण:** कंपकंपी के साथ बुखार, पसीना।\n• **उपचार:** मलेरिया की विशेष दवा।\n• **बचाव:** मच्छरदानी लगाकर सोएं।"
    },
    tuberculosis: {
      standard: "**Tuberculosis (TB)**\n\n**Symptoms:** Chronic persistent cough (lasting more than 3 weeks), chest pain, coughing up blood or sputum, fatigue, night sweats, and weight loss.\n**Treatment:** A strict regimen of multiple antibiotics (e.g., Isoniazid, Rifampin) taken for 6 to 9 months.\n**Prevention & Precautions:** BCG vaccination in endemic areas, proper ventilation, and wearing N95 respirators around active cases.",
      simplified: "• **Symptoms:** Long-lasting cough, chest pain, night sweats.\n• **Treatment:** Month-long courses of antibiotics.\n• **Prevention:** Avoid close contact with active TB patients.",
      hindi_standard: "**विवरण**: टीबी (TB) एक संक्रामक फेफड़ों की बीमारी है।\n\n**क्षयरोग या टीबी (Tuberculosis)**\n\n**लक्षण:** 3 हफ्ते से ज्यादा खाँसी, सीने में दर्द, बलगम में खून आना, रात में पसीना आना और वजन गिरना।\n**उपचार:** डॉट्स (DOTS) के तहत 6 से 9 महीने तक लगातार एंटीबायोटिक दवाओं का सही कोर्स पूरा करना।\n**बचाव:** मरीज से उचित दूरी, खासते समय रुमाल का प्रयोग और मास्क पहनना।",
      hindi_simplified: "**संक्षिप्त विवरण**: यह फेफड़ों की गंभीर बीमारी है।\n\n• **लक्षण:** 3 हफ्ते से खाँसी, रात में पसीना, सीने में दर्द।\n• **उपचार:** लगातार 6-9 महीने की दवा।\n• **बचाव:** मरीज के पास मास्क पहनें।"
    },
    fever: {
      standard: "**Fever**: A fever is a high body temperature.\n\n**General Fever (Pyrexia)**\n\n**Symptoms:** Elevated body temperature (>38°C/100.4°F), sweating, chills, shivering, headache, muscle aches.\n**Treatment:** Antipyretics such as acetaminophen or ibuprofen. Identifying and treating the underlying cause (e.g., infection) is necessary.\n**Prevention & Precautions:** Treat the root infection, stay highly hydrated, and rest.",
      simplified: "• **Symptoms:** Hot feeling, sweating, chills, aches.\n• **Treatment:** Drink fluids, take fever reducers like Tylenol.\n• **Prevention:** Wash hands, avoid infections.",
      hindi_standard: "**विवरण**: बुखार(Fever) शरीर में किसी संक्रमण का संकेत है।\n\n**बुखार (Pyrexia)**\n\n**लक्षण:** 100.4°F से ज्यादा तापमान, पसीना आना, ठंड लगना, शरीर में दर्द।\n**उपचार:** पैरासिटामोल (Paracetamol) की 500mg/650mg डोज़ लें। खूब सारा पानी या इलेक्ट्रोलाइट्स पिएं और आराम करें। बुखार 3 दिन से ज्यादा रहे तो डॉक्टर से मिलें।\n**बचाव:** साफ-सफाई रखें और संक्रमण से बचें।",
      hindi_simplified: "**संक्षिप्त विवरण**: बुखार संक्रमण से लड़ने का तरीका है।\n\n• **लक्षण:** शरीर गर्म होना, पसीना आना।\n• **उपचार:** पैरासिटामोल लें, पर्याप्त पानी पिएं।\n• **बचाव:** साफ सफाई रखें।"
    },
    general: {
      standard: "**Diagnosis Required**: Your query requires medical diagnosis.\n\nRegarding your query about '${query}', comprehensive medical assessment requires contextual clinical data.\n\n**Overview:** Medical conditions present with a spectrum of symptoms depending on host factors, etiology, and chronicity.",
      simplified: "• **Overview:** The topic you asked about can involve many different medical factors.\n• **Important:** We need a doctor's evaluation to give specific advice to an individual.",
      hindi_standard: "**विवरण**: आपके प्रश्न के लिए एक योग्य डॉक्टर की आवश्यकता है।\n\nहमें आपकी चिकित्सा स्थिति के बारे में अधिक व्यक्तिगत क्लीनिकल डेटा की आवश्यकता है।\n\n**सिफारिश:** कृपया सटीक निदान के लिए पूर्ण चिकित्सा जांच कराएं।",
      hindi_simplified: "**संक्षिप्त विवरण**: यह एक जटिल चिकित्सा स्थिति है।\n\n• आपको किसी विशेषज्ञ डॉक्टर से मिलने की आवश्यकता है।"
    }
  };

  const baseAnswer = answers[topic] || answers.general;
  
  // Conditionally assign Hindi or English based on uiLanguage toggle!
  const isHindi = uiLanguage === 'hi-IN';
  let stdAns = isHindi ? (baseAnswer.hindi_standard || baseAnswer.standard) : baseAnswer.standard;
  let simpAns = isHindi ? (baseAnswer.hindi_simplified || baseAnswer.simplified) : baseAnswer.simplified;

  if (isRegenerate) {
    stdAns = "*(Alternative formulation)*\n\n" + stdAns;
    simpAns = simpAns + "\n• **Update:** Generated alternative phrasing.";
  }

  let diseaseProbability = null;
  if (['fever', 'infection', 'dengue', 'malaria'].includes(topic)) {
    diseaseProbability = {
      Viral: 70,
      Dengue: 20,
      Typhoid: 10
    };
  }

  let prescriptionData = null;
  if (['medicine', 'pill', 'paracetamol', 'prescribe', 'dose'].some(k => query.toLowerCase().includes(k))) {
    prescriptionData = [
      { time: 'Morning', icon: '☀️', details: '1 Tablet after breakfast' },
      { time: 'Afternoon', icon: '🌤️', details: 'Skip unless fever > 101' },
      { time: 'Night', icon: '🌙', details: '1 Tablet after dinner' }
    ];
  }

  let diagnosticAccuracy = {
    ai: Math.floor(Math.random() * 5) + 94, // 94-98%
    doctor: Math.floor(Math.random() * 5) + 88 // 88-92%
  };

  return {
    standard: stdAns,
    simplified: simpAns,
    confidence: Math.floor(Math.random() * (98 - 86 + 1)) + 86,
    diseaseProbability,
    prescriptionData,
    diagnosticAccuracy
  };
}

function generateDemoChunks(topic) {
  if (topic === 'out_of_domain') return [];
  
  const templates = {
    diabetes: [
      {title: "WHO Guidelines", sectionName: "Clinical Management Section 4.2", rank: 1, match: 96, snippet: "Management of Type 2 <span class='highlight'>diabetes</span> involves lifestyle modifications and pharmacological interventions aimed at maintaining normoglycemia...", score: 96, url: "#who-diabetes", date: "Oct 2025"},
      {title: "The Lancet – Review Paper", sectionName: "Pathophysiology Abstract", rank: 2, match: 92, snippet: "Pathophysiological mechanisms of <span class='highlight'>insulin resistance</span> in peripheral tissues indicate a complex interplay of genetic and environmental factors...", score: 92, url: "#lancet-insulin", date: "Jan 2026"}
    ],
    hypertension: [
      {title: "AHA Guidelines 2025", sectionName: "Pharmacological Management", rank: 1, match: 97, snippet: "First-line pharmacological management of <span class='highlight'>hypertension</span> typically includes thiazide diuretics, calcium channel blockers, or ACE inhibitors...", score: 97, url: "#aha-htn", date: "Nov 2025"}
    ],
    vaccine: [
      {title: "CDC Vaccination Protocols", sectionName: "Mechanism of Action", rank: 1, match: 98, snippet: "The mechanism of <span class='highlight'>mRNA vaccines</span> involves lipid nanoparticle delivery of messenger RNA into host cytoplasm for antigen presentation...", score: 98, url: "#cdc-mrna", date: "Aug 2025"}
    ],
    infection: [
      {title: "Infectious Disease Clinics", sectionName: "Differential Diagnosis", rank: 1, match: 95, snippet: "Differentiating <span class='highlight'>bacterial vs viral</span> pharyngitis necessitates the use of validated clinical scoring systems like the Centor criteria...", score: 95, url: "#idc-pharyngitis", date: "Jul 2025"}
    ],
    comparison_infection: [
      {title: "NIH Comparative Medicine Protocol", sectionName: "Viral vs Bacterial Discrimination", rank: 1, match: 94, snippet: "Host transcriptomic biomarkers provide a highly sensitive mechanism for distinguishing precise <span class='highlight'>viral</span> from <span class='highlight'>bacterial</span> etiologies in febrile patients...", score: 94, url: "#nih-compare", date: "Feb 2026"}
    ],
    comparison_diabetes: [
      {title: "Mayo Clinic Summary", sectionName: "Endocrinology Distinctions", rank: 1, match: 91, snippet: "The foundational difference between <span class='highlight'>Type 1</span> and <span class='highlight'>Type 2 diabetes</span> rests on autoimmune beta-cell destruction versus peripheral tissue insulin resistance...", score: 91, url: "#mayo-diabet", date: "Jan 2026"}
    ],
    comparison_mosquito: [
      {title: "WHO Vector-Borne Diseases Guide", sectionName: "Tropical Pathogens", rank: 1, match: 88, snippet: "While both <span class='highlight'>malaria</span> and <span class='highlight'>dengue</span> present with high fevers in tropical regions, the vector behavioral patterns and pathogenic mechanisms drastically diverge...", score: 88, url: "#who-vectors", date: "Nov 2025"}
    ]
  };

  const generalChunks = [
    {title: "National Institute of Health Registry", sectionName: "General Algorithms", rank: 1, match: 89, snippet: "Clinical presentation algorithms must account for a wide differential diagnosis based on patient-reported <span class='highlight'>symptoms</span> and vital signs...", score: 89, url: "#nih-general", date: "Jan 2026"}
  ];

  return templates[topic] || generalChunks;
}

app.post('/api/ask', async (req, res) => {
  const { query, history = [], isRegenerate, demographic, guidelines, experimental, userProfile, uiLanguage } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const topic = getMedicalTopic(query, history);
  
  // Quick pre-check for emergency so we don't send chunks
  const isUrgent = checkUrgency(query) !== null;
  const isSafeMedical = topic !== 'out_of_domain' && !isUrgent;

  let answerData = generateDemoAnswer(query, topic, isRegenerate, userProfile, demographic, guidelines, uiLanguage);
  let chunks = isSafeMedical ? generateDemoChunks(topic) : [];
  
  if (isSafeMedical) {
    try {
      const resp = await fetch('http://127.0.0.1:8000/api/ask_llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language: uiLanguage === 'hi-IN' ? 'hindi' : 'english' })
      });
      if (resp.ok) {
        const llmData = await resp.json();
        if (llmData.answer) {
            answerData.standard = llmData.answer;
            answerData.simplified = llmData.answer;
        }
        if (llmData.chunks && llmData.chunks.length > 0) {
            chunks = llmData.chunks;
        }
      }
    } catch (e) {
      console.error("Python FastAPI LLM unreachable. Falling back to local mock data.");
    }
  }

  // Attach Advanced Options Headers
  if (isSafeMedical && demographic && guidelines) {
    answerData.standard = `*(Parameters: ${demographic} | ${guidelines}${experimental ? ' | Experimental' : ''})*\n\n` + answerData.standard;
  }

  const encodedTopic = encodeURIComponent(topic !== 'general' && topic !== 'out_of_domain' ? topic : query);
  
  let researchLinks = [];
  if (topic !== 'out_of_domain') {
    researchLinks = [
      { title: "Search PubMed Central", url: `https://www.ncbi.nlm.nih.gov/pmc/?term=${encodedTopic}` },
      { title: "ClinicalTrials.gov", url: `https://clinicaltrials.gov/search?cond=${encodedTopic}` },
      { title: "WHO Global Index", url: `https://search.who.int/search?q=${encodedTopic}` }
    ];
  }

  // Add simulating network delay to feel like "generating"
  setTimeout(() => {
    res.json({
      answer: answerData,
      chunks: chunks,
      researchLinks: researchLinks
    });
  }, 1000); // 1s delay
});

// GET all users
app.get('/api/users', (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST user (create or update)
app.post('/api/users', (req, res) => {
  const { id, name, age, gender, bp, history, role } = req.body;
  const userRole = role || 'Self';
  if (id) {
    // Update existing
    // Ensure table has role or recreate schema (if sqlite runs into alter issue, we cheat by using history)
    // Wait, to keep it hackathon fast and prevent sqlite column missing error, we will just pass role inside history or bypass DB update for role, but let's add `ALTER TABLE` hack or just use `role` column.
    // Given the previous schema didn't have role, let's append it to history as JSON if needed, or better just use a map in memory. For hackathon, let's just alter table if missing:
    db.run("ALTER TABLE users ADD COLUMN role TEXT", (err) => {
      // Ignore err if column exists
      const stmt = db.prepare("UPDATE users SET name=?, age=?, gender=?, bp=?, history=?, role=? WHERE id=?");
      stmt.run([name, age, gender, bp, history, userRole, id], function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ id, name, age, gender, bp, history, role: userRole });
      });
      stmt.finalize();
    });
  } else {
    // Create new
    db.run("ALTER TABLE users ADD COLUMN role TEXT", (err) => {
      const stmt = db.prepare("INSERT INTO users (name, age, gender, bp, history, role) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run([name, age, gender, bp, history, userRole], function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ id: this.lastID, name, age, gender, bp, history, role: userRole });
      });
      stmt.finalize();
    });
  }
});

// POST redeem gamification rewards
app.post('/api/redeem', (req, res) => {
  const { email } = req.body;
  console.log(`\n\n[MOCK EMAIL SERVER] Sending discount redemption to: ${email}`);
  console.log(`[MOCK EMAIL SERVER] Subject: Your 50% MedRAG Consultant Discount is Ready!`);
  console.log(`[MOCK EMAIL SERVER] Body: Congratulations! You hit 90% on your Health Rewards...`);
  // Add a small delay
  setTimeout(() => res.json({ success: true, message: `Email sent to ${email}` }), 800);
});

// POST emergency SOS dispatch
app.post('/api/sos', (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: "Missing coordinates" });
  
  // Generating a mocked response for the hackathon
  const dispatchId = `EMS-${Math.floor(1000 + Math.random() * 9000)}`;
  const driverPhone = `+1 800 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;
  const hospitalEmail = `emergency-dispatch@citycare.com`;
  const etaMins = Math.floor(3 + Math.random() * 5); // 3-7 mins

  console.log(`[SOS DISPATCH TRIGGERED] Lat: ${lat}, Lng: ${lng}`);

  res.json({
    success: true,
    dispatchId,
    hospital: "City Command Center (Nearest Unit)",
    driverName: "Officer Rodriguez",
    driverPhone,
    hospitalEmail,
    etaMins,
    coordinates: { lat, lng }
  });
});

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
