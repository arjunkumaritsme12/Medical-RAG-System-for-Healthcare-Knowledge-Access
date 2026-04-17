# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


##  Project Overview

Traditional AI tools often generate responses directly from model memory, which can lead to **hallucinations**, lack of transparency, and medically unsafe outputs.  
MedRAG AI addresses this by following a **retrieval-first approach**:

1. The user asks a medical question  
2. Relevant disease knowledge is retrieved from a structured dataset  
3. The system generates a contextual answer based on retrieved evidence  
4. Supporting chunks are shown for transparency and trust

This makes the project more **explainable, reliable, and domain-focused** than a generic chatbot.

---

##  Key Features

-  **Medical Question Answering**
  - Ask questions related to diseases, symptoms, prevention, causes, treatment, and complications

-  **Structured Medical Knowledge Base**
  - Uses a detailed JSON dataset containing multiple diseases and clinical concepts

-  **RAG-Style Workflow**
  - Retrieval-first design improves answer grounding and reduces hallucination risk

-  **Supporting Retrieved Chunks**
  - Displays contextual evidence snippets along with the answer

-  **Premium Streamlit UI**
  - Modern medical-themed interface with glassmorphism, animated cards, and responsive layout

-  **Session-Based Chat History**
  - Stores previous questions using `st.session_state`

-  **Simplified Explanation Mode**
  - Converts answers into easier bullet-point explanations for non-technical users

-  **Medical Disclaimer**
  - Clearly informs users that the tool is educational and not a substitute for clinical advice

---

##  Problem Statement

Accessing relevant medical information quickly is often difficult because knowledge is distributed across many documents, articles, and public health sources.  
General AI tools may answer quickly, but they often do not show where the answer comes from and may produce unreliable medical outputs.

The challenge is to build a system that can:

- retrieve relevant medical knowledge
- provide structured answers
- improve transparency
- remain lightweight and demo-friendly for hackathon use

---

##  Proposed Solution

MedRAG AI provides a **medical retrieval-based assistant** that uses a structured disease knowledge base as the primary source of context.

Instead of relying on raw generation alone, the application:

- matches the question with relevant disease topics
- retrieves supporting medical context
- generates a contextual and professional-looking answer
- displays supporting chunks for evidence and explainability

This improves the trustworthiness of the system compared to standard black-box AI chatbots.

---

##  How It Works

### Workflow

1. **User enters a medical query**
2. **System identifies relevant topic/condition**
3. **Matching content is retrieved from the medical dataset**
4. **A structured response is generated**
5. **Supporting chunks are displayed**
6. **Optional simplified explanation is shown**

---

##  Dataset

The project uses a **single structured JSON medical dataset** containing detailed information for multiple diseases and clinical concepts.

### Included topics:
- Dengue
- Malaria
- Tuberculosis
- Diabetes Mellitus
- Hypertension
- Viral Infection
- Fever
- Asthma
- Pneumonia
- Hepatitis B

### Each entry contains fields such as:
- condition
- category
- aliases
- key_terms
- overview
- definition
- causes_or_pathogen
- transmission
- risk_factors
- common_symptoms
- early_symptoms
- severe_or_red_flag_symptoms
- diagnosis
- treatment
- home_care
- prevention
- possible_complications
- when_to_seek_medical_help
- important_notes
- source_authorities

This structure makes the dataset highly suitable for:
- retrieval
- chunking
- semantic search
- future vector database integration

---

##  Tech Stack

- **Frontend / UI:** Streamlit
- **Language:** Python
- **State Management:** `st.session_state`
- **Dataset Format:** JSON
- **Styling:** Custom CSS + inline HTML
- **Architecture Style:** Retrieval-Augmented Generation (RAG-inspired)

---

##  Why This Project Stands Out

### 1. Evidence-Oriented Approach
Unlike generic AI tools, MedRAG AI is designed around **retrieval before response generation**, which makes answers more grounded.

### 2. Transparency
The system shows **supporting retrieved chunks**, allowing users to understand the basis of the answer.

### 3. Domain Focus
This project is specifically designed for **medical knowledge assistance**, not general conversation.

### 4. Lightweight and Scalable
The architecture is simple enough for hackathon deployment but modular enough to be extended into a real RAG system using embeddings and vector databases later.

---

##  UI Highlights

- Wide modern layout
- Medical-themed color palette
- Sidebar with history and quick questions
- AI Answer section with confidence score
- Supporting Retrieved Chunks section
- Simplified Explanation toggle
- Footer and disclaimer for complete product feel

---

##  Getting Started

### 1. Clone the repository

git clone https://github.com/your-username/medrag-ai.git
cd medrag-ai
pip install streamlit
streamlit run app.py
medrag-ai/
│
├── app.py
├── medical_dataset_medrag_ai.json
├── README.md
└── assets/   # optional
Future Improvements
Integrate real embeddings for semantic retrieval
Use a vector database such as ChromaDB or Qdrant
Connect a real LLM for answer generation
Add source ranking and evidence scoring
Support more diseases and medical categories
Add multilingual medical query support
Enable doctor/researcher mode vs public-user mode
