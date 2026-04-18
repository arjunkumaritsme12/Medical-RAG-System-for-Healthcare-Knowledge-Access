import os
import json
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

from llama_index.core import Document, VectorStoreIndex, Settings
from llama_index.llms.openai import OpenAI

# Keys should be set as environment variables on Render
# os.environ["OPENAI_API_KEY"] = "sk-proj-..." 
# os.environ["LLAMA_CLOUD_API_KEY"] = "llx-..."

# Configure LLM for LlamaIndex
Settings.llm = OpenAI(model="gpt-4o-mini")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware to allow Netlify frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your Netlify URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_medical_documents():
    # Make path relative to this script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, "medical_dataset_medrag_ai.json")
    with open(json_path, "r", encoding="utf-8") as f:

        data = json.load(f)

    docs = []
    for item in data["diseases"]:
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
    return docs

print("Building LlamaIndex VectorStore...")
documents = load_medical_documents()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine(similarity_top_k=2)
retriever = index.as_retriever(similarity_top_k=2)
print("Index built!")

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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
