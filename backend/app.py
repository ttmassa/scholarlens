from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

class DetectClaimsRequest(BaseModel):
    text: str

class ClaimResult(BaseModel):
    sentence: str
    score: float
    is_claim: bool

class DetectClaimsResponse(BaseModel):
    status: str
    claims: list[ClaimResult]

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/detect-claims", response_model=DetectClaimsResponse)
async def detect_claims(data: DetectClaimsRequest):
    if not data.text.strip():
        raise HTTPException(400, "Text cannot be empty")
    
    return DetectClaimsResponse(
        status="ok",
        claims=[]
    )