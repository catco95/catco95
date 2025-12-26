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
import json
import httpx

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
    value_drivers: List[str] = Field(default_factory=list)
    risk_factors: List[str] = Field(default_factory=list)
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

async def search_market_data(brand: str, model: str, reference: str = "") -> str:
    """Search web for recent watch sales and market data"""
    try:
        search_query = f"{brand} {model} {reference} watch recent sales prices market value 2024 2025".strip()
        
        # Use web search to get market intelligence
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": os.environ.get("TAVILY_API_KEY", "tvly-demo-key"),
                    "query": search_query,
                    "search_depth": "basic",
                    "max_results": 5,
                    "include_domains": ["chrono24.com", "watchbox.com", "hodinkee.com", "watchbase.com", "chrono-hunter.com"]
                },
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                results = response.json()
                if results.get("results"):
                    market_intel = "\n\n".join([
                        f"Source: {r.get('url', 'N/A')}\n{r.get('content', '')[:300]}"
                        for r in results["results"][:3]
                    ])
                    return f"Recent Market Data:\n{market_intel}"
    except Exception as e:
        logging.warning(f"Market search failed: {e}")
    
    return "Market data unavailable - proceed with caution and reduce confidence."

def create_valuation_prompt(watch_data: dict, currency: str = "USD", market_data: str = "", calibration_mode: str = "MARKET-NEUTRAL") -> str:
    """Create detailed prompt for watch valuation with complete pricing philosophy"""
    
    system_context = """You are Crowntime AI, a watch market intelligence assistant designed to produce conservative, survivable, liquidity-aware valuation ranges.

You are NOT an appraiser.
You do NOT provide certified valuations.
You do NOT provide authoritative or final prices.

Your role is to help users understand realistic market-clearing price ranges, risk, and uncertainty — not to justify optimistic pricing.

PRICING PHILOSOPHY

There is no single "correct price".
There are only prices that clear the market under different conditions.

All valuations must be conservative, survivable, and liquidity-first.

You must always anchor pricing from the lowest realistic market-clearing price and move upward only when condition, completeness, and liquidity clearly justify it.

PRICING ANCHOR

Assume:
- Knowledgeable seller
- Price-sensitive buyer
- No emotional premium
- No speculative upside
- Normal market conditions

This anchor represents where the watch would clear quickly without narrative.

VALUATION STRUCTURE

You must produce three valuation bands:

LOW VALUE
- Trade, wholesale, or quick-sale levels
- Buyer-dominant conditions
- Must always be defendable to a cautious dealer

FAIR VALUE
- Price at which the watch would realistically sell within 30–60 days
- Assumes normal exposure and negotiation
- If achieving this price requires extended time, justification, or a specific buyer, it is too high and must be lowered

HIGH VALUE
- Patient private-sale outcome
- Must not reflect aspirational or speculative listings
- Only justified by strong condition, completeness, and liquidity
- If justification is weak, keep close to Fair

CONDITION DISCIPLINE

Condition must be assessed granularly:
- Honest wear vs polishing
- Cosmetic wear vs material loss
- Dial originality vs cosmetic cleanliness
- Bracelet stretch vs appearance

If condition information is vague or unverified:
- Penalise all valuation bands
- Widen ranges
- Reduce confidence score
- Explicitly flag condition uncertainty as downside risk

RARITY CONTROL

Never assume rarity.

Only apply rarity influence if:
- It is widely recognised by the collector market
- It materially improves liquidity, not just narrative appeal

Unverified rarity:
- Must not increase value
- Must be flagged as a risk, not a driver

LIQUIDITY PRIORITY

Liquidity always outweighs narrative.

A liquid, mainstream reference should be valued more confidently than a rarer but slow-moving watch.

If a watch requires a specific buyer profile:
- Lower valuation bands
- Lower confidence
- Flag buyer dependency as risk

DEALER SANITY CHECK

Before finalising output, ask internally:
"Would a cautious dealer be comfortable standing behind this Fair value without qualification?"

If not:
- Lower the Fair band
- Or widen the range
- Or reduce confidence

UNCERTAINTY HANDLING

When uncertainty exists:
- Widen ranges instead of averaging
- Reduce confidence faster than price
- Prefer being wrong low rather than wrong high

BRAND-SPECIFIC GUIDELINES:
Rolex: Stable liquidity, reference accuracy critical, box/papers +10-15%, service history matters
Patek Philippe: Extreme variance by reference, extract papers essential, provenance critical
Audemars Piguet: Royal Oak dominates, other models less liquid, condition premium high
Omega: Speedmaster Professional liquid, vintage needs authentication, modern depreciates
Cartier: Tank/Santos liquid, condition/bracelet critical, quartz limited value
Vacheron Constantin: Lower liquidity than PP, full set essential, Patrimony most stable"""

    # Add calibration mode context
    if calibration_mode == "ULTRA-CONSERVATIVE":
        system_context += """

DEALER CALIBRATION MODE: ULTRA-CONSERVATIVE
- Anchor closer to Low band
- Penalise uncertainty aggressively
- Reduce Fair band unless clearly justified
- Prefer survivability over optimism"""
    elif calibration_mode == "PATIENT RETAIL":
        system_context += """

DEALER CALIBRATION MODE: PATIENT RETAIL
- Allow limited upward flexibility within Fair–High
- Only when liquidity and condition strongly support it
- Never exceed survivable pricing logic
- Maintain conservative discipline"""
    
    currency_symbol = get_currency_symbol(currency)
    
    watch_prompt = f"""Analyze this watch using Crowntime pricing philosophy:

WATCH SPECIFICATIONS:
Brand: {watch_data.get('brand', 'Not specified')}
Model: {watch_data.get('model', 'Not specified')}
Reference: {watch_data.get('reference', 'Not specified')}
Year: {watch_data.get('year', 'Not specified')}
Size: {watch_data.get('case_size', 'Not specified')}
Material: {watch_data.get('case_material', 'Not specified')}
Condition: {watch_data.get('condition', 'Not specified')}
Box/Papers: {watch_data.get('box_papers', 'Not specified')}
Location: {watch_data.get('location', 'Not specified')}

{market_data}

VALUATION PROCESS (FOLLOW STRICTLY):

1. ANCHOR from lowest realistic market-clearing price
   - Knowledgeable seller, price-sensitive buyer
   - No emotional premium, no speculative upside
   
2. CONDITION ASSESSMENT
   - Granular evaluation: honest wear, dial originality, bracelet condition
   - If vague/unverified: PENALISE and WIDEN range
   
3. LIQUIDITY CHECK
   - Does this sell quickly or need specific buyer?
   - Liquid mainstream > rare but slow-moving
   - Buyer dependency = penalty
   
4. RARITY VERIFICATION
   - Is rarity widely recognized AND improves liquidity?
   - If unverified: treat as NEUTRAL or RISK, never value driver
   
5. MARKET DATA ANALYSIS
   - What are ACTUAL recent sales (not listings)?
   - What's realistic clearing price in 30-60 days?
   
6. FAIR PRICE REALITY
   - Would this sell in 30-60 days at Fair without extended time/justification?
   - If not: LOWER Fair price
   
7. DEALER SANITY CHECK (MANDATORY)
   - "Would a cautious dealer stand behind this Fair value without qualification?"
   - If hesitation: LOWER Fair or WIDEN range
   
8. UNCERTAINTY HANDLING
   - Missing data? WIDEN range, LOWER confidence
   - Confidence falls FASTER than price
   - Prefer wrong low over wrong high
   
9. FINAL VERIFICATION
   - Low = Trade/wholesale/quick-sale (defendable to cautious dealer)
   - Fair = 30-60 day realistic sale (passes sanity check, no justification needed)
   - High = Patient 6-12 month (justified by condition/completeness/liquidity, NOT speculative)

OUTPUT (JSON format):
{{
  "valuation_range": {{
    "low": "{currency_symbol}X,XXX",
    "fair": "{currency_symbol}X,XXX",
    "high": "{currency_symbol}X,XXX"
  }},
  "retail_price": "{currency_symbol}X,XXX or null",
  "retail_relationship": "Trading at X% of retail or null",
  "confidence_score": 0.XX,
  "value_drivers": ["ONLY verified factors that improve liquidity"],
  "risk_factors": ["Include: buyer dependency, condition uncertainty, liquidity concerns, unverified claims"],
  "market_sentiment": "Rising/Stable/Softening",
  "signal": "Buy/Hold/Avoid",
  "signal_justification": "Based on liquidity, condition, and market-clearing logic",
  "full_analysis": "Start with anchoring logic, liquidity assessment, dealer sanity check result. End with: 'Indicative market intelligence only. Not a certified appraisal.'"
}}

CRITICAL REMINDERS:
- Liquidity outweighs narrative ALWAYS
- Fair must pass dealer sanity check
- Widen ranges for uncertainty
- Confidence falls faster than price
- Conservative, survivable, liquidity-first"""
    
    return system_context, watch_prompt

@api_router.post("/detect-watch-details")
async def detect_watch_details(
    image: UploadFile = File(...)
):
    """Auto-detect watch details from image for user verification"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        session_id = str(uuid.uuid4())
        
        detection_prompt = """You are analyzing a watch image to extract OBSERVABLE details only.

AUTO-FILL EXTRACTION RULES:

You MAY auto-fill (if clearly visible):
- Brand (if logo or text clearly visible)
- Model family (if widely recognizable)
- Dial color and style (descriptive only - e.g., "Black sunburst", "White")
- Bracelet or strap type (if visible - e.g., "Metal bracelet", "Leather strap")
- Bezel type (if visible - e.g., "Smooth", "Fluted", "Ceramic insert")

You MAY suggest with uncertainty:
- Reference number (if partially visible)
- Case material (e.g., "Appears to be stainless steel")
- Approximate era (e.g., "Likely 2010s based on style")

You MUST NOT auto-fill:
- Exact production year
- Authenticity or originality claims
- Service history
- Box & papers presence

CONFIDENCE LEVELS:
- "detected": Clearly visible, high confidence
- "suggested": Reasonable inference, needs verification
- "uncertain": Possible but unclear, low confidence

If unclear or uncertain: Mark as "uncertain" or omit entirely.

Respond in JSON format ONLY:
{
  "brand": {"value": "Brand Name", "confidence": "detected/suggested/uncertain"},
  "model": {"value": "Model Name", "confidence": "detected/suggested/uncertain"},
  "dial_description": {"value": "Description", "confidence": "detected/suggested/uncertain"},
  "bracelet_strap": {"value": "Type", "confidence": "detected/suggested/uncertain"},
  "bezel_type": {"value": "Type", "confidence": "detected/suggested/uncertain"},
  "case_material": {"value": "Material", "confidence": "suggested/uncertain"},
  "reference": {"value": "Ref", "confidence": "suggested/uncertain"},
  "year": {"value": "Era", "confidence": "suggested/uncertain"},
  "case_size": {"value": "Approx size", "confidence": "suggested/uncertain"}
}

Omit fields if not visible or uncertain. Be conservative."""

        image_content = await image.read()
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You are a watch detail extraction assistant. Respond only in JSON format."
        )
        chat.with_model("openai", "gpt-5.2")
        
        image_attachment = ImageContent(image_base64=image_base64)
        user_message = UserMessage(
            text=detection_prompt,
            file_contents=[image_attachment]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse response
        import json
        response_clean = response.strip()
        if response_clean.startswith('```json'):
            response_clean = response_clean[7:]
        if response_clean.startswith('```'):
            response_clean = response_clean[3:]
        if response_clean.endswith('```'):
            response_clean = response_clean[:-3]
        response_clean = response_clean.strip()
        
        detected_details = json.loads(response_clean)
        
        return {
            "success": True,
            "detected_details": detected_details,
            "message": "Details detected. Please verify before valuation."
        }
        
    except Exception as e:
        logging.error(f"Detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
    auto_filled_fields: str = Form(""),  # JSON string of which fields were auto-filled
    image: Optional[UploadFile] = File(None)
):
    try:
        # Check valuation limit
        # ... existing limit check code ...
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
        
        # Parse auto-filled fields
        auto_filled = []
        if auto_filled_fields:
            try:
                auto_filled = json.loads(auto_filled_fields)
            except:
                pass
        
        # Build auto-fill context for AI
        auto_fill_context = ""
        if auto_filled:
            auto_fill_context = f"\n\nAUTO-FILLED FIELDS (UNCONFIRMED): {', '.join(auto_filled)}\nThese fields were auto-detected from image and NOT user-verified. Apply AUTO-FILL CONFIDENCE PENALTY: Reduce overall confidence by 0.10-0.15. Flag as verification-required in risks."
        
        currency_symbol = get_currency_symbol(currency)
        
        # Search for market data
        market_data = ""
        if brand and model:
            logging.info(f"Searching market data for {brand} {model} {reference}")
            market_data = await search_market_data(brand, model, reference)
            logging.info(f"Market data retrieved: {len(market_data)} chars")
        
        # Add auto-fill context to market data
        if auto_fill_context:
            market_data += auto_fill_context
        
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        session_id = str(uuid.uuid4())
        
        # Image-only mode
        if image and not has_text_data:
            system_context = """Crowntime AI: Conservative watch valuation from images.

CRITICAL RULES:
- Explicit uncertainty acknowledgment required
- NEVER assume rarity from image alone - flag as uncertain
- If special features visible but not verifiable, treat as NEUTRAL or risk factor
- Focus on what's clearly visible: condition, authenticity markers, standard configuration

VALUATION LEVELS:
- Low = Trade/quick sale (dealer would pay)
- Fair = Realistic private sale
- High = Patient sale (NOT speculative)

JSON output only."""

            image_only_prompt = f"""Identify and value this watch in {currency}:

What you can clearly see: Brand, model, era, material, condition, visible details.

STRICT RARITY DISCIPLINE:
- Do NOT assume special/rare based on appearance alone
- If unsure about configuration, state explicitly and reduce confidence
- Unknown provenance = risk factor, not value driver

Provide: Low (trade), Fair (private sale), High (patient sale) in {currency_symbol}
Retail if known, confidence (reduce for ANY uncertainty), 3 value drivers, 3 risks (MUST mention image-only limitations + unverified claims), sentiment, signal.

JSON:
{{
  "valuation_range": {{"low": "{currency_symbol}X", "fair": "{currency_symbol}X", "high": "{currency_symbol}X"}},
  "retail_price": "{currency_symbol}X or null",
  "retail_relationship": "X% of retail or null",
  "confidence_score": 0.XX,
  "value_drivers": ["point 1", "point 2", "point 3"],
  "risk_factors": ["Image-only limitation", "Cannot verify claims", "point 3"],
  "market_sentiment": "Rising/Stable/Softening",
  "signal": "Buy/Hold/Avoid",
  "signal_justification": "brief",
  "full_analysis": "Start with visible elements. Conservative dealer perspective. 2-3 sentences."
}}"""
            
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
            system_context, watch_prompt = create_valuation_prompt(watch_data, currency, market_data)
            
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
        
        # Validate required fields
        if not valuation_data.get("valuation_range") or \
           not valuation_data["valuation_range"].get("low") or \
           not valuation_data["valuation_range"].get("fair") or \
           not valuation_data["valuation_range"].get("high"):
            raise ValueError("AI response missing required valuation range fields")
        
        valuation_response = ValuationResponse(
            valuation_range=ValuationRange(**valuation_data["valuation_range"]),
            retail_price=valuation_data.get("retail_price"),
            retail_relationship=valuation_data.get("retail_relationship"),
            confidence_score=valuation_data.get("confidence_score", 0.5),
            value_drivers=valuation_data.get("value_drivers", ["Unable to determine specific drivers"]),
            risk_factors=valuation_data.get("risk_factors", ["Insufficient data for complete assessment"]),
            market_sentiment=valuation_data.get("market_sentiment", "Stable"),
            signal=valuation_data.get("signal", "Hold"),
            signal_justification=valuation_data.get("signal_justification", "Requires more data for definitive recommendation"),
            full_analysis=valuation_data.get("full_analysis", "Analysis based on available information")
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