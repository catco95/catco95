from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class WatchValuationRequest(BaseModel):
    brand: str
    model: str
    reference: Optional[str] = ""
    year: Optional[str] = ""
    case_size: Optional[str] = ""
    case_material: Optional[str] = ""
    bezel_type: Optional[str] = ""
    dial_description: Optional[str] = ""
    bracelet_strap: Optional[str] = ""
    condition: Optional[str] = ""
    box_papers: Optional[str] = ""
    modifications: Optional[str] = ""
    location: Optional[str] = ""

class ValuationRange(BaseModel):
    low: str
    fair: str
    high: str

class ValuationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    valuation_range: ValuationRange
    retail_price: Optional[str] = None
    retail_relationship: Optional[str] = None
    confidence_score: float
    value_drivers: List[str]
    risk_factors: List[str]
    market_sentiment: str
    signal: str
    signal_justification: str
    full_analysis: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ValuationHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    brand: str
    model: str
    valuation_range: ValuationRange
    confidence_score: float
    market_sentiment: str
    signal: str
    timestamp: str

def get_currency_symbol(currency: str) -> str:
    """Get currency symbol for display"""
    symbols = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "CHF": "Fr",
        "AUD": "A$",
        "CAD": "C$",
        "JPY": "¥",
        "HKD": "HK$",
        "SGD": "S$"
    }
    return symbols.get(currency, currency)

def create_valuation_prompt(watch_data: dict, currency: str = "USD") -> str:
    """Create detailed prompt for watch valuation"""
    
    system_context = """You are Crowntime AI, a specialist watch valuation assistant providing conservative market intelligence.

Core principles: Conservative estimates, realized sales over asking prices, explicit uncertainty acknowledgment.

Output: Clear JSON with valuation ranges, retail comparison, confidence score, value drivers, risks, market sentiment, and buy/hold/avoid signal."""
    
    currency_symbol = get_currency_symbol(currency)
    
    watch_prompt = f"""Analyze this watch for {currency} valuation:

Brand: {watch_data.get('brand', 'Not specified')}
Model: {watch_data.get('model', 'Not specified')}
Reference: {watch_data.get('reference', 'Not specified')}
Year: {watch_data.get('year', 'Not specified')}
Size: {watch_data.get('case_size', 'Not specified')}
Material: {watch_data.get('case_material', 'Not specified')}
Condition: {watch_data.get('condition', 'Not specified')}
Box/Papers: {watch_data.get('box_papers', 'Not specified')}
Location: {watch_data.get('location', 'Not specified')}

Provide: Low/Fair/High range, retail price (if known), confidence (0-1), 3 value drivers, 3 risks, sentiment, signal with brief justification.

JSON format:
{{
  "valuation_range": {{"low": "{currency_symbol}X,XXX", "fair": "{currency_symbol}X,XXX", "high": "{currency_symbol}X,XXX"}},
  "retail_price": "{currency_symbol}X,XXX or null",
  "retail_relationship": "Trading at X% of retail or null",
  "confidence_score": 0.XX,
  "value_drivers": ["point 1", "point 2", "point 3"],
  "risk_factors": ["point 1", "point 2", "point 3"],
  "market_sentiment": "Rising/Stable/Softening",
  "signal": "Buy/Hold/Avoid",
  "signal_justification": "1-2 lines",
  "full_analysis": "2-3 sentence market summary"
}}"""
    
    return system_context, watch_prompt

@api_router.post("/valuate")
async def valuate_watch(
    brand: str = Form(""),
    model: str = Form(""),
    reference: str = Form(""),
    year: str = Form(""),
    case_size: str = Form(""),
    case_material: str = Form(""),
    bezel_type: str = Form(""),
    dial_description: str = Form(""),
    bracelet_strap: str = Form(""),
    condition: str = Form(""),
    box_papers: str = Form(""),
    modifications: str = Form(""),
    location: str = Form(""),
    currency: str = Form("USD"),
    image: Optional[UploadFile] = File(None)
):
    try:
        # Check if we have either text data or image
        has_text_data = any([brand, model, reference, year, case_size, case_material, 
                            bezel_type, dial_description, bracelet_strap, condition, 
                            box_papers, modifications, location])
        
        if not has_text_data and not image:
            raise HTTPException(status_code=400, detail="Please provide either watch details or upload an image")
        
        watch_data = {
            "brand": brand,
            "model": model,
            "reference": reference,
            "year": year,
            "case_size": case_size,
            "case_material": case_material,
            "bezel_type": bezel_type,
            "dial_description": dial_description,
            "bracelet_strap": bracelet_strap,
            "condition": condition,
            "box_papers": box_papers,
            "modifications": modifications,
            "location": location
        }
        
        currency_symbol = get_currency_symbol(currency)
        
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        session_id = str(uuid.uuid4())
        
        # Image-only mode
        if image and not has_text_data:
            system_context = """You are Crowntime AI, a specialist watch market intelligence assistant.
Your role is to provide conservative, investment-grade valuation guidance for luxury and collectible watches.

You are NOT an appraiser.
You do NOT provide certified valuations.
You do NOT inflate prices based on speculative or unrealistic listings.

You think like:
- A seasoned watch dealer
- A long-term collector
- A risk-aware investor

Your outputs must be:
- Clear
- Conservative
- Justified
- Calm in tone
- Free of hype

You always prefer:
- Realised sales logic over asking prices
- Liquidity awareness over rarity hype
- Condition discipline over brand bias

If information is missing or uncertain, you explicitly say so and reduce confidence."""

            image_only_prompt = f"""Analyse the watch in this image for indicative market value.

Based on what you can see in the image, identify:
- Brand (if visible)
- Model (if identifiable)
- Approximate era/age
- Case material and condition
- Dial condition and type
- Bracelet/strap type
- Any visible wear or damage
- Box & papers (if visible in image)

IMPORTANT: You are working from an image only. Be conservative with identifications. If you cannot clearly identify something, say so and adjust confidence accordingly.

VALUATION INSTRUCTIONS:
1. Establish a realistic base market value using recent comparable sales logic
2. Adjust for visible condition and completeness
3. Produce a valuation band:
   - Low (quick sale / trade level)
   - Fair (private sale realistic)
   - High (top of market, patient sale)

IMPORTANT: Provide all valuations in {currency} ({currency_symbol}). Use current market rates and local market conditions for this currency.

OUTPUT FORMAT (respond in valid JSON):
{{
  "valuation_range": {{
    "low": "{currency_symbol}X,XXX",
    "fair": "{currency_symbol}X,XXX",
    "high": "{currency_symbol}X,XXX"
  }},
  "retail_price": "{currency_symbol}X,XXX (if identifiable, otherwise null)",
  "retail_relationship": "Trading at X% of retail" or "Premium of X% over retail" or null if retail unavailable,
  "confidence_score": "0.XX (REDUCE if identification is uncertain)",
  "value_drivers": [
    "bullet point 1",
    "bullet point 2"
  ],
  "risk_factors": [
    "bullet point 1 (ALWAYS mention image-only limitations)",
    "bullet point 2"
  ],
  "market_sentiment": "Rising / Stable / Softening",
  "signal": "Buy / Hold / Avoid",
  "signal_justification": "1-2 line justification",
  "full_analysis": "Detailed paragraph about what you can see and valuation rationale. Start by identifying what you can see in the image."
}

Tone: Professional, restrained, investor-focused. Never use hype language. Never present certainty where none exists.

Provide ONLY the JSON response, no additional text."""
            
            chat = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=system_context
            )
            chat.with_model("openai", "gpt-5.2")
            
            image_content = await image.read()
            image_base64 = base64.b64encode(image_content).decode('utf-8')
            image_attachment = ImageContent(image_base64=image_base64)
            
            user_message = UserMessage(
                text=image_only_prompt,
                file_contents=[image_attachment]
            )
        else:
            # Text mode (with or without image)
            system_context, watch_prompt = create_valuation_prompt(watch_data, currency)
            
            chat = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=system_context
            )
            chat.with_model("openai", "gpt-5.2")
            
            if image:
                image_content = await image.read()
                image_base64 = base64.b64encode(image_content).decode('utf-8')
                image_attachment = ImageContent(image_base64=image_base64)
                
                user_message = UserMessage(
                    text=watch_prompt + "\n\nImage provided: Please assess visible condition conservatively. Do not assume originality unless obvious. Flag uncertainty clearly.",
                    file_contents=[image_attachment]
                )
            else:
                user_message = UserMessage(text=watch_prompt)
        
        response = await chat.send_message(user_message)
        
        import json
        response_clean = response.strip()
        if response_clean.startswith('```json'):
            response_clean = response_clean[7:]
        if response_clean.startswith('```'):
            response_clean = response_clean[3:]
        if response_clean.endswith('```'):
            response_clean = response_clean[:-3]
        response_clean = response_clean.strip()
        
        valuation_data = json.loads(response_clean)
        
        valuation_response = ValuationResponse(
            valuation_range=ValuationRange(**valuation_data["valuation_range"]),
            retail_price=valuation_data.get("retail_price"),
            retail_relationship=valuation_data.get("retail_relationship"),
            confidence_score=valuation_data["confidence_score"],
            value_drivers=valuation_data["value_drivers"],
            risk_factors=valuation_data["risk_factors"],
            market_sentiment=valuation_data["market_sentiment"],
            signal=valuation_data["signal"],
            signal_justification=valuation_data["signal_justification"],
            full_analysis=valuation_data["full_analysis"]
        )
        
        doc = valuation_response.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        doc['brand'] = brand
        doc['model'] = model
        
        await db.valuations.insert_one(doc)
        
        return valuation_response
        
    except json.JSONDecodeError as e:
        logging.error(f"JSON parsing error: {e}. Response: {response}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logging.error(f"Valuation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/valuations/history", response_model=List[ValuationHistory])
async def get_valuation_history():
    try:
        valuations = await db.valuations.find({}, {"_id": 0}).sort("timestamp", -1).limit(20).to_list(20)
        
        return [
            ValuationHistory(
                id=v['id'],
                brand=v['brand'],
                model=v['model'],
                valuation_range=v['valuation_range'],
                confidence_score=v['confidence_score'],
                market_sentiment=v['market_sentiment'],
                signal=v['signal'],
                timestamp=v['timestamp']
            )
            for v in valuations
        ]
    except Exception as e:
        logging.error(f"History fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()