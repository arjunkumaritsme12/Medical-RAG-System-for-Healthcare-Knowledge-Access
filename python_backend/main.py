import os
import json
import uvicorn
import sqlite3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.llms.openai import OpenAI

# Configure LLM for LlamaIndex
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    print("❌ ERROR: OPENAI_API_KEY is not set in environment variables!")
else:
    print(f"✅ OPENAI_API_KEY found (starts with {api_key[:8]}...)")

try:
    Settings.llm = OpenAI(model="gpt-4o-mini")
except Exception as e:
    print(f"❌ ERROR initializing OpenAI: {e}")

app = FastAPI()

# Database Initialization
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "profiles.db")

def init_db():
    print(f"Initializing database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            age TEXT,
            gender TEXT,
            role TEXT,
            bp TEXT,
            history TEXT
        )
    ''')
    conn.commit()
    conn.close()
    print("Database initialized.")

init_db()

# Add CORS middleware to allow Netlify frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your Netlify URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Medical RAG System API is running! Visit /docs for Swagger UI."}

def load_medical_documents():
    # Make path relative to this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, "medical_dataset_medrag_ai.json")
    print(f"Loading documents from {json_path}...")
    if not os.path.exists(json_path):
        print(f"❌ ERROR: {json_path} not found!")
        return []
        
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    docs = []
    diseases = data.get("diseases", [])
    for item in diseases:
        text = f"""
        Condition: {item.get('condition', '')}
        Category: {item.get('category', '')}
        Aliases: {', '.join(item.get('aliases', []))}
        Key Terms: {', '.join(item.get('key_terms', []))}
        Overview: {item.get('overview', '')}
        Definition: {item.get('definition', '')}
        Causes or Pathogen: {item.get('causes_or_pathogen', '')}
        Transmission: {item.get('transmission', '')}
        Risk Factors: {'; '.join(item.get('risk_factors', []))}
        Common Symptoms: {'; '.join(item.get('common_symptoms', []))}
        Early Symptoms: {'; '.join(item.get('early_symptoms', []))}
        Severe or Red Flag Symptoms: {'; '.join(item.get('severe_or_red_flag_symptoms', []))}
        Diagnosis: {'; '.join(item.get('diagnosis', []))}
        Treatment: {'; '.join(item.get('treatment', []))}
        Home Care: {'; '.join(item.get('home_care', []))}
        Prevention: {'; '.join(item.get('prevention', []))}
        Possible Complications: {'; '.join(item.get('possible_complications', []))}
        When to Seek Medical Help: {'; '.join(item.get('when_to_seek_medical_help', []))}
        Important Notes: {'; '.join(item.get('important_notes', []))}
        Source Authorities: {', '.join(item.get('source_authorities', []))}
        """
        docs.append(Document(text=text, metadata={"condition": item.get("condition", "Unknown")}))
    print(f"Successfully loaded {len(docs)} documents.")
    return docs

# Global variables for RAG
query_engine = None
retriever = None

@app.on_event("startup")
async def startup_event():
    global query_engine, retriever
    print("🚀 Starting backend initialization...")
    try:
        documents = load_medical_documents()
        if not documents:
            print("⚠️ No documents loaded. AI features might not work.")
            return

        print("Building LlamaIndex VectorStore (this may take a few seconds)...")
        index = VectorStoreIndex.from_documents(documents)
        query_engine = index.as_query_engine(similarity_top_k=2)
        retriever = index.as_retriever(similarity_top_k=2)
        print("✅ Index built and ready!")
    except Exception as e:
        print(f"❌ CRITICAL ERROR during startup: {e}")
        # We don't want to crash the whole app just in case, 
        # but the AI endpoints will fail gracefully later.

SYSTEM_PROMPT = """
You are a top-tier medical knowledge assistant.
Answer only from the retrieved medical context. Do not hallucinate.
If the retrieved context is insufficient, say: "Insufficient evidence in retrieved medical documents."
Format your response elegantly using markdown (bullet points, bold text).
CRITICAL: You MUST begin your response with a 1 to 2 sentence short, simple explanation summarizing the direct answer.
CRITICAL: You MUST output your ENTIRE response exclusively in the requested language. Do not mix English and Hindi unless it is a medical term that cannot be translated.
"""

class QueryRequest(BaseModel):
    query: str
    language: str = "english"

class UserProfile(BaseModel):
    id: Optional[int] = None
    name: str = ""
    age: str = ""
    gender: str = "Not specified"
    role: str = "Self"
    bp: str = ""
    history: str = ""

class RedeemRequest(BaseModel):
    email: str
    
@app.post("/api/ask_llm")
def ask_llm(req: QueryRequest):
    query = req.query
    lang_prompt = f"\n\nIMPORTANT: The user has requested the output language to be: {req.language.upper()}. You must translate and write your entire response natively in {req.language.upper()}."
    
    # Generate LLM Answer
    response = query_engine.query(
        f"{SYSTEM_PROMPT}{lang_prompt}\n\nUser question: {query}"
    )
    
    # Retrieve Source Chunks
    nodes = retriever.retrieve(query)
    
    chunks = []
    for i, node in enumerate(nodes):
        chunks.append({
            "rank": i + 1,
            "title": node.metadata.get("condition", "Medical Document"),
            "score": round(node.score * 100) if getattr(node, 'score', None) else 95,
            "snippet": node.text[:300].replace('\n', ' ').strip()
        })
        
    return {
        "answer": str(response),
        "chunks": chunks
    }

@app.get("/api/users")
def get_users():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows

@app.post("/api/users")
def create_or_update_user(user: UserProfile):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if user.id:
        cursor.execute("""
            UPDATE users SET name=?, age=?, gender=?, role=?, bp=?, history=? WHERE id=?
        """, (user.name, user.age, user.gender, user.role, user.bp, user.history, user.id))
        user_id = user.id
    else:
        cursor.execute("""
            INSERT INTO users (name, age, gender, role, bp, history) VALUES (?, ?, ?, ?, ?, ?)
        """, (user.name, user.age, user.gender, user.role, user.bp, user.history))
        user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    user.id = user_id
    return user

@app.post("/api/redeem")
def redeem(req: RedeemRequest):
    print(f"Redeeming discount for {req.email}")
    return {"success": True, "message": f"Discount code sent to {req.email}"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
