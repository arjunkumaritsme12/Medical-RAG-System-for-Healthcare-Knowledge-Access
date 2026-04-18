import streamlit as st
import time
import random
import re

st.set_page_config(page_title="MedRAG AI", page_icon="🩺", layout="wide")

def inject_css():
    theme = st.session_state.get('app_theme', 'light')
    
    if theme == 'light':
        bg_color = "#f7f9fc"
        text_primary = "#0A2540"
        text_secondary = "#4A5568"
        card_bg = "rgba(255, 255, 255, 0.9)"
        border_color = "#e2e8f0"
        shadow = "0 8px 30px rgba(0, 0, 0, 0.05)"
        chip_bg = "#e6f2f0"
        sidebar_bg = "#ffffff"
    else:
        bg_color = "#0b1120"
        text_primary = "#f1f5f9"
        text_secondary = "#94a3b8"
        card_bg = "rgba(30, 41, 59, 0.7)"
        border_color = "#334155"
        shadow = "0 8px 30px rgba(0, 0, 0, 0.3)"
        chip_bg = "#1e293b"
        sidebar_bg = "#0f172a"

    css = f"""
    <style>
        /* Base styles */
        .stApp {{
            background-color: {bg_color};
            color: {text_primary};
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            transition: all 0.3s ease;
        }}
        
        .main .block-container {{
            max-width: 1000px;
            padding-top: 2rem;
            padding-bottom: 5rem;
        }}
        
        /* Headers */
        h1, h2, h3, h4, h5, h6 {{
            color: {text_primary} !important;
            font-weight: 700 !important;
            letter-spacing: -0.02em;
        }}
        
        .title-container {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid {border_color};
            animation: fadeInDown 0.8s ease-out;
        }}
        
        .title-text h1 {{
            font-size: 2.5rem;
            margin-bottom: 0.2rem;
            background: linear-gradient(135deg, {text_primary} 0%, #00BFA5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .title-sub {{
            color: {text_secondary};
            font-size: 1.1rem;
            font-weight: 400;
        }}
        
        .user-badge {{
            display: flex;
            align-items: center;
            gap: 12px;
            background: {card_bg};
            padding: 8px 16px;
            border-radius: 50px;
            box-shadow: {shadow};
            border: 1px solid {border_color};
            backdrop-filter: blur(10px);
        }}
        
        .avatar {{
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #00BFA5;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        }}
        
        /* Input & Buttons */
        .stTextInput > div > div > input {{
            background-color: {card_bg} !important;
            color: {text_primary} !important;
            border: 2px solid {border_color} !important;
            border-radius: 16px !important;
            padding: 1rem 1.5rem !important;
            font-size: 1.1rem !important;
            box-shadow: {shadow} !important;
            transition: all 0.3s ease !important;
        }}
        
        .stTextInput > div > div > input:focus {{
            border-color: #00BFA5 !important;
            box-shadow: 0 0 0 3px rgba(0, 191, 165, 0.2), {shadow} !important;
        }}
        
        /* Primary Button Override */
        .stButton>button {{
            background: linear-gradient(135deg, #00BFA5 0%, #009688 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 0.6rem 2rem !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 15px rgba(0, 191, 165, 0.3) !important;
            transition: all 0.3s ease !important;
            width: 100%;
        }}
        
        .stButton>button:hover {{
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(0, 191, 165, 0.4) !important;
            background: linear-gradient(135deg, #00d6b9 0%, #00a898 100%) !important;
            border: none !important;
        }}

        /* Secondary Button Override */
        .secondary-btn>button {{
            background: {card_bg} !important;
            color: {text_primary} !important;
            border: 1px solid {border_color} !important;
            box-shadow: none !important;
        }}
        
        .secondary-btn>button:hover {{
            border-color: #00BFA5 !important;
            color: #00BFA5 !important;
            background: {chip_bg} !important;
        }}

        /* Example Chips */
        .chip {{
            display: inline-block;
            background: {chip_bg};
            color: {text_primary};
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            margin: 4px;
            cursor: pointer;
            border: 1px solid {border_color};
            transition: all 0.2s ease;
        }}
        
        .chip:hover {{
            background: #00BFA5;
            color: white;
            border-color: #00BFA5;
            transform: scale(1.05);
        }}
        
        /* Answer Section */
        .answer-card {{
            background: {card_bg};
            border-radius: 20px;
            padding: 2rem;
            margin-top: 2rem;
            box-shadow: {shadow};
            border: 1px solid {border_color};
            backdrop-filter: blur(12px);
            animation: fadeInUp 0.6s ease-out;
        }}
        
        .answer-header {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid {border_color};
            padding-bottom: 1rem;
        }}
        
        .confidence-meter {{
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }}
        
        .confidence-bar-bg {{
            width: 150px;
            height: 6px;
            background-color: {border_color};
            border-radius: 3px;
            overflow: hidden;
            margin-top: 4px;
        }}
        
        .confidence-bar-fill {{
            height: 100%;
            background-color: #00BFA5;
            border-radius: 3px;
        }}
        
        /* Chunk Cards */
        .chunk-card {{
            background: {card_bg};
            border: 1px solid {border_color};
            border-left: 4px solid #00BFA5;
            border-radius: 12px;
            padding: 1.2rem;
            margin-bottom: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            transition: all 0.3s ease;
            animation: fadeInUp 0.5s ease-out;
        }}
        
        .chunk-card:hover {{
            transform: translateY(-3px);
            box-shadow: {shadow};
            border-left: 6px solid #00BFA5;
        }}
        
        .chunk-title {{
            font-weight: 600;
            color: {text_primary};
            font-size: 1.05rem;
            margin-bottom: 0.5rem;
            display: flex;
            justify-content: space-between;
        }}
        
        .chunk-snippet {{
            color: {text_secondary};
            font-size: 0.95rem;
            line-height: 1.5;
        }}
        
        .highlight {{
            background-color: rgba(0, 191, 165, 0.2);
            color: {text_primary};
            padding: 0 4px;
            border-radius: 4px;
            font-weight: 500;
        }}
        
        .fake-link {{
            color: #00BFA5;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            margin-top: 0.8rem;
            display: inline-block;
            cursor: pointer;
        }}
        
        .fake-link:hover {{
            text-decoration: underline;
        }}
        
        /* Disclaimer */
        .disclaimer {{
            background: rgba(239, 68, 68, 0.05);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-left: 4px solid #EF4444;
            border-radius: 12px;
            padding: 1rem 1.5rem;
            margin-top: 3rem;
            color: {text_secondary};
            font-size: 0.9rem;
        }}
        
        /* Animations */
        @keyframes fadeInDown {{
            from {{ opacity: 0; transform: translateY(-20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        @keyframes fadeInUp {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        @keyframes pulse {{
            0% {{ opacity: 0.6; }}
            50% {{ opacity: 1; }}
            100% {{ opacity: 0.6; }}
        }}
        
        .loading-text {{
            animation: pulse 1.5s infinite;
            color: #00BFA5;
            font-weight: 500;
            text-align: center;
            margin-top: 1rem;
        }}

        /* Progress Bar Override */
        .stProgress > div > div > div > div {{
            background-color: #00BFA5 !important;
        }}

        /* Sidebar Styling */
        [data-testid="stSidebar"] {{
            background-color: {sidebar_bg} !important;
            border-right: 1px solid {border_color};
        }}
        
        .sidebar-card {{
            background: {chip_bg};
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1rem;
            border: 1px solid {border_color};
            font-size: 0.9rem;
            color: {text_secondary};
        }}
        
        /* Footer */
        .footer {{
            text-align: center;
            margin-top: 4rem;
            color: {text_secondary};
            font-size: 0.85rem;
            opacity: 0.7;
        }}
        
        /* Markdown overrides */
        .answer-content p {{
            line-height: 1.7;
            font-size: 1.05rem;
            margin-bottom: 1rem;
        }}
        
        .answer-content strong {{
            color: {text_primary};
        }}
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)

def init_session_state():
    if 'history' not in st.session_state:
        st.session_state.history = []
    if 'current_input' not in st.session_state:
        st.session_state.current_input = ""
    if 'trigger_search' not in st.session_state:
        st.session_state.trigger_search = False
    if 'app_theme' not in st.session_state:
        st.session_state.app_theme = 'light'
    if 'current_answer' not in st.session_state:
        st.session_state.current_answer = None
    if 'current_chunks' not in st.session_state:
        st.session_state.current_chunks = None
    if 'simplified_toggle' not in st.session_state:
        st.session_state.simplified_toggle = False
    if 'feedback' not in st.session_state:
        st.session_state.feedback = None
    if 'confidence' not in st.session_state:
        st.session_state.confidence = 0

def get_medical_topic(query):
    query = query.lower()
    if any(k in query for k in ['diabet', 'sugar', 'insulin']): return 'diabetes'
    if any(k in query for k in ['hypertens', 'blood pressure', 'bp']): return 'hypertension'
    if any(k in query for k in ['vaccin', 'mrna', 'immuniz']): return 'vaccine'
    if any(k in query for k in ['vir', 'bacteri', 'infect']): return 'infection'
    if any(k in query for k in ['asthma', 'breath', 'wheez']): return 'asthma'
    if any(k in query for k in ['dengue', 'mosquito']): return 'dengue'
    if any(k in query for k in ['tb', 'tuberculosis', 'cough']): return 'tuberculosis'
    return 'general'

def generate_demo_answer(query, topic, is_regenerate=False):
    answers = {
        'diabetes': {
            'standard': "Type 2 diabetes is a chronic metabolic condition characterized by insulin resistance and relative insulin deficiency, leading to hyperglycemia.\n\n**Pathophysiology:** As tissues become resistant to insulin, the pancreas initially increases insulin secretion, but eventually beta-cell function declines. \n\n**Clinical Relevance:** If left unmanaged, chronic hyperglycemia can induce microvascular complications (retinopathy, nephropathy, neuropathy) and macrovascular diseases (cardiovascular disease).\n\n*When to seek care:* Frequent urination, unexplained weight loss, or excessive thirst require prompt medical evaluation.",
            'simplified': "• **What it is:** A condition where your body has trouble using sugar for energy.\n• **Why it happens:** Your body either doesn't make enough insulin, or doesn't use it properly.\n• **What to watch for:** Feeling very thirsty, peeing often, or feeling very tired.\n• **Why it matters:** Extra sugar in the blood can damage your eyes, kidneys, and heart over time."
        },
        'hypertension': {
            'standard': "Hypertension, or elevated blood pressure, is defined as a persistent resting systolic BP ≥ 130 mmHg or diastolic BP ≥ 80 mmHg (per ACC/AHA guidelines).\n\n**Etiology:** It is largely primary (essential) due to multifactorial genetic and environmental factors, though secondary causes (e.g., renal artery stenosis) exist.\n\n**Clinical Relevance:** Often asymptomatic, it is a major risk factor for stroke, myocardial infarction, and chronic kidney disease.\n\n*When to seek care:* It requires routine screening; severe headaches, shortness of breath, or chest pain mandate emergency assessment.",
            'simplified': "• **What it is:** High blood pressure, meaning the force of blood against your artery walls is too high.\n• **Why it happens:** Often tied to age, family history, diet (too much salt), and lack of exercise.\n• **What to watch for:** It's usually a 'silent condition' with no symptoms, which is why routine checks are important.\n• **Why it matters:** If not treated, it strains the heart and can lead to heart attacks or strokes."
        },
        'vaccine': {
            'standard': "mRNA vaccines utilize synthetic messenger ribonucleic acid to instruct host cells to produce a specific pathogenic protein (antigen), which subsequently triggers an immune response.\n\n**Mechanism:** Once inside the cytoplasm (never entering the nucleus), the mRNA is translated into the target protein. The immune system recognizes this protein as foreign, generating neutralizing antibodies and memory T-cells.\n\n**Clinical Relevance:** This approach provides a rapid, adaptive, and highly efficacious method for immunization without using live virus.\n\n*When to seek care:* Common side effects are mild (arm pain, fever). Seek emergent care for signs of severe allergic reaction (anaphylaxis).",
            'simplified': "• **What it is:** A new type of vaccine that teaches your body how to defend itself.\n• **How it works:** It acts like an 'instruction manual' telling your cells to build a harmless piece of a germ.\n• **The Result:** Your immune system spots the piece, attacks it, and remembers how to fight the real germ if you ever get infected.\n• **Safety:** It does not contain the actual virus and cannot change your DNA."
        },
        'infection': {
            'standard': "Viral and bacterial infections differ fundamentally in their pathogen biology and required clinical management.\n\n**Dichotomy:** Bacteria are single-celled organisms capable of independent reproduction and are susceptible to antibiotic therapy. Viruses are acellular infectious agents requiring a host cell to replicate, rendering standard antibiotics ineffective.\n\n**Clinical Relevance:** Misuse of antibiotics for viral etiologies drives antimicrobial resistance. Diagnosis often relies on clinical presentation, duration, and specific serological or molecular assays.\n\n*When to seek care:* Persistent high fever, localized severe pain, or symptoms lasting longer than typically expected for a simple viral course require medical evaluation.",
            'simplified': "• **Bacteria:** Living, single-celled organisms. Illnesses they cause (like strep throat) can be treated with antibiotics.\n• **Viruses:** Tiny particles that need to hijack your cells to multiply. Illnesses they cause (like the common cold) CANNOT be treated with antibiotics.\n• **Why it matters:** Taking antibiotics for a viral infection won't help you and can make bacteria stronger and harder to kill in the future."
        },
        'general': {
            'standard': f"Regarding your query about '{query}', comprehensive medical assessment requires contextual clinical data.\n\n**Overview:** Medical conditions present with a spectrum of symptoms depending on host factors, etiology, and chronicity. \n\n**Clinical Relevance:** Accurate diagnosis is achieved through a combination of detailed patient history, physical examination, and appropriate diagnostic modalities (laboratory or imaging).\n\n*When to seek care:* Any sudden onset of severe pain, neurological changes, difficulty breathing, or persistent symptoms unresolved by conservative measures should be evaluated by a healthcare professional immediately.",
            'simplified': "• **Overview:** The topic you asked about can involve many different medical factors.\n• **Important:** We need a doctor's evaluation to give specific advice to an individual.\n• **What to do:** Always prioritize safety. If you are experiencing concerning symptoms, please visit a clinic or hospital for a proper checkup."
        }
    }

    base_answer = answers.get(topic, answers['general'])
    
    if is_regenerate:
        std_ans = "*(Alternative formulation)*\n\n" + base_answer['standard'].replace("Overview:", "Key Medical Context:").replace("Clinical Relevance", "Clinical Implications")
        simp_ans = base_answer['simplified'] + "\n• **Update:** Generated alternative phrasing."
    else:
        std_ans = base_answer['standard']
        simp_ans = base_answer['simplified']

    return {
        'standard': std_ans,
        'simplified': simp_ans,
        'confidence': random.randint(86, 98)
    }

def generate_demo_chunks(topic):
    templates = {
        'diabetes': [
            {"title": "WHO Clinical Notes - Diabetes", "snippet": "Management of Type 2 <span class='highlight'>diabetes</span> involves lifestyle modifications and pharmacological interventions aimed at maintaining normoglycemia...", "score": 96, "url": "#who-diabetes", "date": "Oct 2025"},
            {"title": "The Lancet – Review Paper", "snippet": "Pathophysiological mechanisms of <span class='highlight'>insulin resistance</span> in peripheral tissues indicate a complex interplay of genetic and environmental factors...", "score": 92, "url": "#lancet-insulin", "date": "Jan 2026"},
            {"title": "Mayo Clinic Reference", "snippet": "Early diagnostic criteria for <span class='highlight'>diabetes</span> mellitus include fasting plasma glucose levels ≥ 126 mg/dL on two separate occasions...", "score": 88, "url": "#mayo-diagnosis", "date": "Mar 2026"}
        ],
        'hypertension': [
            {"title": "AHA Guidelines 2025", "snippet": "First-line pharmacological management of <span class='highlight'>hypertension</span> typically includes thiazide diuretics, calcium channel blockers, or ACE inhibitors...", "score": 97, "url": "#aha-htn", "date": "Nov 2025"},
            {"title": "NIH Medical Brief", "snippet": "Chronic <span class='highlight'>blood pressure</span> elevation significantly accelerates vascular endothelial dysfunction and atherosclerosis progression...", "score": 94, "url": "#nih-vascular", "date": "Feb 2026"},
            {"title": "Primary Care Journal", "snippet": "Non-pharmacological interventions for <span class='highlight'>hypertension</span> include dietary sodium restriction, weight loss, and aerobic exercise regimens...", "score": 89, "url": "#pcj-lifestyle", "date": "Dec 2025"}
        ],
        'vaccine': [
            {"title": "CDC Vaccination Protocols", "snippet": "The mechanism of <span class='highlight'>mRNA vaccines</span> involves lipid nanoparticle delivery of messenger RNA into host cytoplasm for antigen presentation...", "score": 98, "url": "#cdc-mrna", "date": "Aug 2025"},
            {"title": "Immunology Today", "snippet": "Comparing viral vector and <span class='highlight'>mRNA vaccines</span> reveals differing immunogenicity profiles, though both achieve robust cellular and humoral immunity...", "score": 91, "url": "#imm-compare", "date": "Sep 2025"},
            {"title": "WHO Vaccine Safety Report", "snippet": "Post-market surveillance of <span class='highlight'>mRNA</span> based immunizations confirms a high safety profile with rare instances of transient myocarditis...", "score": 85, "url": "#who-safety", "date": "Jan 2026"}
        ],
        'infection': [
            {"title": "Infectious Disease Clinics", "snippet": "Differentiating <span class='highlight'>bacterial vs viral</span> pharyngitis necessitates the use of validated clinical scoring systems like the Centor criteria...", "score": 95, "url": "#idc-pharyngitis", "date": "Jul 2025"},
            {"title": "Antimicrobial Resistance Review", "snippet": "Inappropriate prescription of antibiotics for <span class='highlight'>viral infections</span> remains the primary driver of emerging resistant pathogenic strains globally...", "score": 93, "url": "#amr-stewardship", "date": "Oct 2025"},
            {"title": "Nature Medicine", "snippet": "Host transcriptomic biomarkers provide a highly sensitive mechanism for distinguishing precise <span class='highlight'>viral</span> from <span class='highlight'>bacterial</span> etiologies in febrile patients...", "score": 87, "url": "#nat-biomarkers", "date": "Feb 2026"}
        ]
    }
    
    general_chunks = [
        {"title": "National Institute of Health Registry", "snippet": "Clinical presentation algorithms must account for a wide differential diagnosis based on patient-reported <span class='highlight'>symptoms</span> and vital signs...", "score": 89, "url": "#nih-general", "date": "Jan 2026"},
        {"title": "Medical Diagnostic Handbook", "snippet": "Standardized care pathways emphasize the importance of thorough history-taking prior to initiating definitive <span class='highlight'>medical</span> treatment...", "score": 84, "url": "#mdh-pathway", "date": "Nov 2025"},
        {"title": "WHO Global Health Brief", "snippet": "Improving patient outcomes relies on swift transition from presentation to accurate pathological identification and <span class='highlight'>treatment</span>...", "score": 81, "url": "#who-outcomes", "date": "Mar 2026"}
    ]

    return templates.get(topic, general_chunks)

def render_header():
    st.markdown(f"""
        <div class="title-container">
            <div>
                <div class="title-text"><h1>🩺 MedRAG AI</h1></div>
                <div class="title-sub">Ask. Retrieve. Understand. Powered by RAG</div>
                <div style="margin-top: 8px; font-size: 0.8rem; background: var(--accent); color: white; display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #00BFA5;">v1.0 • Hackathon Demo</div>
            </div>
            <div class="user-badge">
                <div class="avatar">H</div>
                <span style="font-weight: 500;">Dr. Harshit</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

def render_sidebar():
    with st.sidebar:
        st.markdown("### ⚙️ Settings & Info")
        
        # Dark mode toggle
        theme_col1, theme_col2 = st.columns([3, 1])
        with theme_col1:
            st.markdown("Dark Mode")
        with theme_col2:
            is_dark = st.session_state.app_theme == 'dark'
            if st.toggle("Theme Toggle", value=is_dark, label_visibility="collapsed"):
                if st.session_state.app_theme != 'dark':
                    st.session_state.app_theme = 'dark'
                    st.rerun()
            else:
                if st.session_state.app_theme != 'light':
                    st.session_state.app_theme = 'light'
                    st.rerun()
        
        st.markdown("<hr style='margin: 10px 0; border-color: rgba(150,150,150,0.2)'>", unsafe_allow_html=True)
        
        st.markdown("""
        <div class="sidebar-card">
            <strong>System Status</strong><br>
            🧠 Model: Grok-4 + Vector DB<br>
            ⚡ Avg Response: 0.4s<br>
            🟢 Status: Operational
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("### 🕒 History")
        if st.session_state.history:
            for i, h in enumerate(reversed(st.session_state.history[-5:])): # Show last 5
                if st.button(f"🔍 {h[:25]}...", key=f"hist_{i}", use_container_width=True):
                    st.session_state.current_input = h
                    st.session_state.trigger_search = True
                    st.rerun()
            
            if st.button("🗑️ Clear History", use_container_width=True):
                st.session_state.history = []
                st.session_state.current_answer = None
                st.session_state.current_chunks = None
                st.session_state.current_input = ""
                st.rerun()
        else:
            st.markdown("<span style='color: gray; font-size: 0.9rem;'>No history yet.</span>", unsafe_allow_html=True)

def simulate_loading_process():
    st.markdown("<br>", unsafe_allow_html=True)
    loading_placeholder = st.empty()
    progress_bar = st.progress(0)
    
    stages = [
        {"msg": "🔍 Parsing medical query...", "prog": 15},
        {"msg": "📚 Retrieving relevant medical documents from Vector DB...", "prog": 35},
        {"msg": "⚖️ Scoring relevance and extracting evidence...", "prog": 60},
        {"msg": "🧠 Generating clinical synthesis with Grok-4...", "prog": 85},
        {"msg": "✨ Finalizing response formatting...", "prog": 100}
    ]
    
    for stage in stages:
        loading_placeholder.markdown(f"<div class='loading-text'>{stage['msg']}</div>", unsafe_allow_html=True)
        progress_bar.progress(stage['prog'])
        time.sleep(0.4)
        
    time.sleep(0.2)
    loading_placeholder.empty()
    progress_bar.empty()

def handle_submission(query, is_regen=False):
    if not query.strip():
        return
        
    if not is_regen and query not in st.session_state.history:
        st.session_state.history.append(query)
        
    st.session_state.current_input = query
    st.session_state.simplified_toggle = False
    st.session_state.feedback = None
    
    simulate_loading_process()
    
    topic = get_medical_topic(query)
    ans_data = generate_demo_answer(query, topic, is_regen)
    chunks = generate_demo_chunks(topic)
    
    st.session_state.current_answer = ans_data
    st.session_state.current_chunks = chunks
    st.session_state.confidence = ans_data['confidence']
    
    # Trigger auto-scroll hack via script
    st.components.v1.html(
        "<script>window.parent.document.getElementById('answer_anchor').scrollIntoView({behavior: 'smooth'});</script>",
        height=0
    )
    st.rerun()

def render_answer_section():
    ans = st.session_state.current_answer
    if not ans:
        return
        
    st.markdown("<div id='answer_anchor'></div>", unsafe_allow_html=True)
    st.markdown("<div class='answer-card'>", unsafe_allow_html=True)
    
    # Header & Confidence
    st.markdown(f"""
        <div class="answer-header">
            <div class="avatar" style="background-color: #0A2540; width: 40px; height: 40px; border-radius: 8px;">🤖</div>
            <div>
                <h3 style="margin: 0;">AI Answer</h3>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">Generated based on retrieved evidence</span>
            </div>
            <div class="confidence-meter">
                <span style="font-size: 0.9rem; font-weight: 600; color: #00BFA5;">{st.session_state.confidence}% Confidence</span>
                <div class="confidence-bar-bg">
                    <div class="confidence-bar-fill" style="width: {st.session_state.confidence}%;"></div>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    # Body
    is_simple = st.session_state.simplified_toggle
    content = ans['simplified'] if is_simple else ans['standard']
    
    st.markdown(f"<div class='answer-content'>\n\n{content}\n\n</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
    
    # Action Buttons
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2, c3, c4, c5 = st.columns([2, 2, 2, 1, 1])
    
    with c1:
        btn_text = "📖 Detailed View" if is_simple else "👶 Simplified View"
        if st.button(btn_text, key="btn_simple", use_container_width=True):
            st.session_state.simplified_toggle = not is_simple
            st.rerun()
            
    with c2:
        if st.button("🔄 Regenerate", key="btn_regen", use_container_width=True):
            handle_submission(st.session_state.current_input, is_regen=True)
            
    with c3:
        if st.button("📋 Copy Text", key="btn_copy", use_container_width=True):
            st.toast("Copied to clipboard!", icon="✅")
            
    with c4:
        if st.button("👍", key="btn_up", use_container_width=True):
            st.session_state.feedback = "up"
            st.toast("Feedback received", icon="👍")
            
    with c5:
        if st.button("👎", key="btn_down", use_container_width=True):
            st.session_state.feedback = "down"
            st.toast("Feedback received", icon="👎")

def render_chunks_section():
    chunks = st.session_state.current_chunks
    if not chunks:
        return
        
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown(f"#### 📚 Supporting Retrieved Chunks ({len(chunks)} documents in 0.8s)")
    
    for i, c in enumerate(chunks):
        with st.container():
            st.markdown(f"""
            <div class="chunk-card">
                <div class="chunk-title">
                    <span>📄 {c['title']}</span>
                    <span style="color: #00BFA5; font-size: 0.9rem;">⭐ Relevance: {c['score']}%</span>
                </div>
                <div class="chunk-snippet">
                    "...{c['snippet']}..."
                </div>
                <a href="{c['url']}" class="fake-link" target="_self">View full source &rarr;</a>
            </div>
            """, unsafe_allow_html=True)
            
            with st.expander(f"Expand full document context ({c['title']})"):
                st.markdown(f"""
                **Source Metadata**
                - **Document ID:** doc_{random.randint(1000,9999)}
                - **Updated Date:** {c['date']}
                - **Extraction Confidence:** {c['score']}%
                
                **Extended Text:**
                The clinical framework requires an understanding of patient history. {c['snippet'].replace("<span class='highlight'>", "").replace("</span>", "")} Furthermore, standard operating procedures dictate that subsequent monitoring occurs on a structured basis to prevent relapse.
                """)

def render_disclaimer():
    st.markdown("""
        <div class="disclaimer">
            <strong>⚠️ Important Medical Disclaimer</strong><br>
            This AI tool is for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </div>
        <div class="footer">
            Built in <30 mins with ❤️ & Streamlit | Delhi Hackathon 2026
        </div>
    """, unsafe_allow_html=True)

def main():
    init_session_state()
    inject_css()
    
    render_header()
    render_sidebar()
    
    st.markdown("### Ask a medical question")
    
    q_input = st.text_input(
        "Search", 
        value=st.session_state.current_input if st.session_state.trigger_search else "",
        placeholder="Ask any medical question… (e.g., What causes hypertension?)",
        key="main_input",
        label_visibility="collapsed"
    )
    
    _, col_btn, _ = st.columns([1, 1, 1])
    with col_btn:
        btn_submit = st.button("✨ Ask AI", use_container_width=True)
        st.markdown("<p style='text-align: center; font-size: 0.8rem; color: var(--text-secondary);'>Press Enter or click to submit</p>", unsafe_allow_html=True)

    # Example Chips
    st.markdown("<div style='margin-bottom: 1rem;'></div>", unsafe_allow_html=True)
    example_col1, example_col2 = st.columns([1, 1])
    examples = [
        "What are the early symptoms of Type-2 Diabetes?",
        "How do mRNA vaccines work?",
        "Explain the causes and treatment of hypertension",
        "What is the difference between viral and bacterial infections?"
    ]
    
    for i, ex in enumerate(examples):
        col = example_col1 if i % 2 == 0 else example_col2
        with col:
            st.markdown(f'<div class="secondary-btn">', unsafe_allow_html=True)
            if st.button(ex, key=f"ex_{i}", use_container_width=True):
                st.session_state.current_input = ex
                st.session_state.trigger_search = True
                st.rerun()
            st.markdown('</div>', unsafe_allow_html=True)
            
    # Process submission
    submit_triggered = btn_submit or (st.session_state.trigger_search and st.session_state.current_input) or (q_input and q_input != st.session_state.get('last_processed_input', ''))
    
    if submit_triggered:
        st.session_state.trigger_search = False
        query_to_process = st.session_state.current_input if st.session_state.current_input else q_input
        st.session_state.last_processed_input = query_to_process
        handle_submission(query_to_process)
        
    # Render Result areas
    if st.session_state.current_answer:
        render_answer_section()
        render_chunks_section()
        
    render_disclaimer()

if __name__ == "__main__":
    main()
