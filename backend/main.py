import os
import tempfile
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
from dotenv import load_dotenv

# Load HF_API_KEY from .env
load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")
if not HF_API_KEY:
    raise RuntimeError("HF_API_KEY not set in environment")

API_URL = (
    "https://router.huggingface.co/hf-inference/"
    "models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions"
)
HEADERS = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def query_mistral(messages: list[dict[str, str]]) -> str:
    resp = requests.post(API_URL, headers=HEADERS, json={
        "model": "mistralai/Mistral-7B-Instruct-v0.3",
        "messages": messages,
        "temperature": 0.6,
        "max_tokens": 1024,
    })
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Mistral error: {resp.text}")
    return resp.json()["choices"][0]["message"]["content"]

def build_vectorstore(text: str) -> Chroma:
    chunks = CharacterTextSplitter(chunk_size=500, chunk_overlap=50).split_text(text)
    embeds = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return Chroma.from_texts(texts=chunks, embedding=embeds)

@app.post("/analyze")
async def analyze(
    playbook: UploadFile = File(...),
    contract: UploadFile = File(...)
):
    if playbook.content_type != "text/plain" or contract.content_type != "text/plain":
        raise HTTPException(status_code=415, detail="Only .txt files allowed")

    play_text = (await playbook.read()).decode("utf-8")
    contract_text = (await contract.read()).decode("utf-8")

    vectordb = build_vectorstore(play_text)
    top_docs = vectordb.similarity_search(contract_text, k=7)
    rules_block = "\n\n---\n\n".join(d.page_content for d in top_docs)

    prompt = f"""
You are a legal compliance assistant. Compare these rules against the contract.

1. **Compliance Table**  
   A Markdown table with **four** columns:
   | Rule | Contract Clause/Sentence | Status | Suggestions |

2. **Inline‐Annotated Contract**  
   - Prefix violations with “🔴”  
   - Prefix compliant sentences with “🟢”  
   - Wrap irrelevant sentences in ~~double tildes~~  

**Rules:**  
{rules_block}

**Contract:**  
{contract_text}
"""
    report = query_mistral([{"role": "user", "content": prompt}])

    temp_dir = tempfile.gettempdir()
    out_path = os.path.join(temp_dir, "compliance_report.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report)

    return JSONResponse({"report": report, "txt_path": out_path})

@app.get("/download-txt")
def download_txt(path: str):
    return FileResponse(path, media_type="text/plain", filename="compliance_report.txt")
