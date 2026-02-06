from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.medical_summarizer import summarize_text

app = FastAPI(
    title="Uzimacare Medical Report Summarizer",
    description="AI-powered summarization for referral notes",
    version="0.1.0"
)

class SummaryRequest(BaseModel):
    text: str
    max_length: int = 120
    min_length: int = 30

class SummaryResponse(BaseModel):
    summary: str

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/summarize", response_model=SummaryResponse)
async def summarize(request: SummaryRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        summary = summarize_text(
            request.text,
            max_len=request.max_length,
            min_len=request.min_length
        )
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f" Summarization failed: {str(e)}")