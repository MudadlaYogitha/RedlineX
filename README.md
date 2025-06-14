
# 📑 RedlineX – Intelligent Document Compliance POC

AI Redliner helps you automatically review contracts against compliance rules using AI. Just upload your playbook and contract to get a clear, audit-ready report. 

- ✅ Open-source LLM (Mistral-7B-Instruct)
- ✅ Retrieval-Augmented Generation (RAG)
- ✅ React frontend
- ✅ ChromaDB for vector storage

---

## 🚀 Features

- 📥 Upload a **compliance playbook** (rules)
- 📄 Upload a **contract or document**
- 🔍 Uses **RAG** to retrieve relevant rules
- 🧠 Sends focused prompt to **Mistral-7B-Instruct** via Hugging Face Inference API
- 📝 Generates a structured compliance report
- 📥 Download the report in `.txt` format

---

## 📦 Tech Stack

| Layer         | Tool/Framework                          |
|---------------|------------------------------------------|
| LLM           | [Mistral-7B-Instruct](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3) via Hugging Face API |
| RAG           | LangChain + ChromaDB + MiniLM embeddings |
| Vector DB     | ChromaDB                                |
| Embeddings    | HuggingFace SentenceTransformers (`all-MiniLM-L6-v2`) |
| UI            | React                           |


---

## 🔧 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/MudadlaYogitha/RedlineX.git

cd AI-Redliner
```

### 2. Create Virtual Environment
```bash
python -m venv venv

source venv/bin/activate   # Windows: venv\\Scripts\\activate
```

### 3. Install Requirements
```bash
pip install -r requirements.txt
```

### 4. Set Hugging Face API Key
```bash
export HF_API_KEY="xxxxxxxxxxxxxx"
```

### 5. Run the Backend
```bash
uvicorn main:app --reload

```

### 5. Run the Frontend
```bash
npm start

```

### Sample Compliance Playbook(Rules)
```bash
Compliance Playbook – Employee Agreement

1. All employees must be at least 18 years old.
2. Contracts must include a 30-day notice period for termination.
3. A confidentiality clause must be included in all agreements.
4. NDAs must be valid for at least 12 months post-employment.
5. Health insurance benefits must be offered.
6. The job role and responsibilities must be clearly stated.
7. Salary and compensation details must be explicitly mentioned.
8. Work hours and leave policy must be included.
9. The agreement must follow anti-discrimination policies.
10. A dispute resolution clause must be present.
```

### Sample Contract
```bash
EMPLOYEE AGREEMENT

This contract is made between AlphaCorp and Jane Doe.

Jane is employed as a Software Engineer with responsibilities related to full-stack development.

Termination policy: Either party may terminate the agreement with a 15-day notice.

No confidentiality or NDA is included in this contract.

Employee is entitled to a base salary and stock options.

The contract adheres to standard company policies, but does not explicitly list working hours or leave policies.

There is no mention of dispute resolution procedures or health insurance.
```
## 📷 

### 🔍 Uploading Files
![Uploading Files](images/ss1.png)

### 📑 Compliance Report
![Compliance Report](images/ss2.png)




