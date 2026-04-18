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

function generateDemoAnswer(query, topic, isRegenerate, profile, demo, guide) {
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
      standard: "**Diabetes Mellitus**\n\n**Symptoms:** Increased thirst, frequent urination, hunger, fatigue, and blurred vision.\n**Treatment:** Managing blood sugar levels through insulin therapy, oral medications (like Metformin), diet, and exercise.\n**Prevention & Precautions:** Maintain a healthy weight, eat a balanced diet low in refined sugars, exercise regularly, and monitor blood glucose levels.",
      simplified: "• **Symptoms:** Always thirsty, peeing often, tired.\n• **Treatment:** Insulin, healthy eating, exercise.\n• **Prevention:** Stay active and eat healthy foods."
    },
    hypertension: {
      standard: "**Hypertension (High Blood Pressure)**\n\n**Symptoms:** Often asymptomatic ('silent killer'), but severe cases may cause headaches, shortness of breath, or nosebleeds.\n**Treatment:** ACE inhibitors, calcium channel blockers, diuretics, and lifestyle modifications.\n**Prevention & Precautions:** Reduce sodium (salt) intake, maintain a healthy weight, limit alcohol, and exercise daily.",
      simplified: "• **Symptoms:** Usually none, sometimes headaches.\n• **Treatment:** Blood pressure medicine, eating less salt.\n• **Prevention:** Exercise and low salt diet."
    },
    vaccine: {
      standard: "**Vaccinations & Immunization**\n\n**Overview:** Vaccines act by stimulating the immune system to recognize and destroy specific pathogens using antigens or mRNA.\n**Precautions:** Minor side effects like fever or arm soreness may occur. Rarely, severe allergic reactions.",
      simplified: "• **What it is:** Trains your body to fight germs.\n• **Precautions:** Your arm might be sore for a day."
    },
    infection: {
      standard: "**Viral & Bacterial Infections**\n\n**Symptoms:** Fever, chills, fatigue, muscle aches, and localized pain.\n**Treatment:** Bacterial infections are treated with antibiotics. Viral infections are treated with antivirals or supportive care (rest, fluids).\n**Prevention & Precautions:** Frequent hand hygiene, avoiding close contact with sick individuals, and staying up to date with vaccinations.",
      simplified: "• **Symptoms:** Fever, feeling tired, body aches.\n• **Treatment:** Antibiotics (for bacteria) or rest and fluids (for viruses).\n• **Prevention:** Wash your hands and get vaccinated."
    },
    dengue: {
      standard: "**Dengue Fever**\n\n**Symptoms:** High fever, severe headache, severe pain behind the eyes, joint pain, muscle and bone pain, rash, and mild bleeding.\n**Treatment:** Supportive care. Acetaminophen for fever and pain. Avoid NSAIDs (ibuprofen, aspirin) due to bleeding risk. Fluid replacement is critical.\n**Prevention & Precautions:** Eradicate mosquito breeding sites (stagnant water), use DEET or picaridin insect repellent, and wear long sleeves.",
      simplified: "• **Symptoms:** High fever, severe body pain, eye pain, rash.\n• **Treatment:** Rest, fluids, take Tylenol (No ibuprofen).\n• **Prevention:** Prevent mosquito bites and remove standing water."
    },
    malaria: {
      standard: "**Malaria**\n\n**Symptoms:** Paroxysms of fever, chills, and sweats. Also fatigue, nausea, and vomiting.\n**Treatment:** Antimalarial medications such as Artemisinin-based combination therapies (ACTs) or chloroquine depending on resistance.\n**Prevention & Precautions:** Antimalarial prophylaxis when traveling to endemic zones, sleeping under insecticide-treated bed nets.",
      simplified: "• **Symptoms:** Fever, severe chills, sweating.\n• **Treatment:** Antimalarial prescription medicine.\n• **Prevention:** Sleep under nets, use bug spray."
    },
    tuberculosis: {
      standard: "**Tuberculosis (TB)**\n\n**Symptoms:** Chronic persistent cough (lasting more than 3 weeks), chest pain, coughing up blood or sputum, fatigue, night sweats, and weight loss.\n**Treatment:** A strict regimen of multiple antibiotics (e.g., Isoniazid, Rifampin) taken for 6 to 9 months.\n**Prevention & Precautions:** BCG vaccination in endemic areas, proper ventilation, and wearing N95 respirators around active cases.",
      simplified: "• **Symptoms:** Long-lasting cough, chest pain, night sweats.\n• **Treatment:** Month-long courses of antibiotics.\n• **Prevention:** Avoid close contact with active TB patients."
    },
    fever: {
      standard: "**General Fever (Pyrexia)**\n\n**Symptoms:** Elevated body temperature (>38°C/100.4°F), sweating, chills, shivering, headache, muscle aches.\n**Treatment:** Antipyretics such as acetaminophen or ibuprofen. Identifying and treating the underlying cause (e.g., infection) is necessary.\n**Prevention & Precautions:** Treat the root infection, stay highly hydrated, and rest.",
      simplified: "• **Symptoms:** Hot feeling, sweating, chills, aches.\n• **Treatment:** Drink fluids, take fever reducers like Tylenol.\n• **Prevention:** Wash hands, avoid infections."
    },
    asthma: {
      standard: "**Asthma**\n\n**Symptoms:** Shortness of breath, chest tightness or pain, wheezing when exhaling, and coughing attacks.\n**Treatment:** Inhaled corticosteroids (preventative) and short-acting beta-agonists like Albuterol (rescue inhalers).\n**Prevention & Precautions:** Identify and avoid personal asthma triggers (pollen, dust, cold air), adhere to controller medications.",
      simplified: "• **Symptoms:** Trouble breathing, tight chest, wheezing.\n• **Treatment:** Inhalers (rescue and preventative).\n• **Prevention:** Avoid your triggers like dust or smoke."
    },
    comparison_infection: {
      standard: "### Viral vs Bacterial Infection Comparison\n\n| Feature | Viral Infection | Bacterial Infection |\n|---|---|---|\n| **Cause** | Virus | Bacteria |\n| **Treatment** | Mostly supportive / antivirals in some cases. Antibiotics are completely ineffective. | Often antibiotics if indicated by a physician. |\n| **Spread** | Highly contagious; spreads via respiratory droplets or contact. | Varies by bacteria; some contagious, some opportunistic. |\n| **Examples** | Common cold, Flu, COVID-19. | Strep throat, Tuberculosis, UTI. |",
      simplified: "• **Viral:** Caused by tiny viruses, cannot be cured with antibiotics, you just need rest and fluids.\n• **Bacterial:** Caused by living bugs called bacteria, can be cured with antibiotics from a doctor."
    },
    comparison_diabetes: {
      standard: "### Type 1 vs Type 2 Diabetes\n\n| Feature | Type 1 Diabetes | Type 2 Diabetes |\n|---|---|---|\n| **Cause** | Autoimmune; pancreas produces zero insulin. | Insulin resistance; body doesn't use insulin well. |\n| **Onset** | Usually in childhood or young adulthood. | Usually develops in adults, though increasing in children. |\n| **Treatment** | Lifelong insulin therapy is mandatory. | Lifestyle changes, oral medications, sometimes insulin. |\n| **Prevention** | Cannot be prevented currently. | Can often be prevented or delayed with a healthy lifestyle. |",
      simplified: "• **Type 1:** Your body makes no insulin. You must take insulin every day. Cannot be prevented.\n• **Type 2:** Your body doesn't use insulin well. Can often be managed with diet and exercise."
    },
    comparison_mosquito: {
      standard: "### Malaria vs Dengue Fever\n\n| Feature | Malaria | Dengue Fever |\n|---|---|---|\n| **Pathogen** | Plasmodium parasite | Dengue virus |\n| **Vector** | Anopheles mosquito (bites at night) | Aedes mosquito (bites during day) |\n| **Key Symptoms**| Chills, cyclical fever, sweating. | High fever, severe joint/bone pain (\"breakbone fever\"), rash. |\n| **Treatment** | Specific antimalarial drugs (e.g., Artemisinin). | Supportive care, fluid replacement, pain relief (No NSAIDs). |",
      simplified: "• **Malaria:** Caused by parasites, mosquitoes bite at night. Treated with special medicine.\n• **Dengue:** Caused by a virus, mosquitoes bite in the daytime. Extremely painful joints. Treated with rest and fluids."
    },
    general: {
      standard: `Regarding your query about '${query}', comprehensive medical assessment requires contextual clinical data.\n\n**Overview:** Medical conditions present with a spectrum of symptoms depending on host factors, etiology, and chronicity.`,
      simplified: "• **Overview:** The topic you asked about can involve many different medical factors.\n• **Important:** We need a doctor's evaluation to give specific advice to an individual."
    }
  };

  const baseAnswer = answers[topic] || answers.general;
  let stdAns = baseAnswer.standard;
  let simpAns = baseAnswer.simplified;

  if (isRegenerate) {
    stdAns = "*(Alternative formulation)*\n\n" + stdAns;
    simpAns = simpAns + "\n• **Update:** Generated alternative phrasing.";
  }

  let diseaseProbability = null;
  if (['fever', 'infection', 'dengue', 'malaria'].includes(topic) || query.toLowerCase().includes('symptom')) {
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
  const { query, history = [], isRegenerate, demographic, guidelines, experimental, userProfile } = req.body;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const topic = getMedicalTopic(query, history);
  
  // Quick pre-check for emergency so we don't send chunks
  const isUrgent = checkUrgency(query) !== null;
  const isSafeMedical = topic !== 'out_of_domain' && !isUrgent;

  let answerData = generateDemoAnswer(query, topic, isRegenerate, userProfile, demographic, guidelines);
  
  // If emergency or non-medical, send no chunks
  const chunks = isSafeMedical ? generateDemoChunks(topic) : [];

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

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
