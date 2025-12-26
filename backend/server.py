from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import base64
import json
from emergentintegrations.llm.openai import chat, Models

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM Key
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app
app = FastAPI(title="Crowntime AI - Watch Market Intelligence")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== WATCH DATA ==============
# Comprehensive luxury watch database with trade-level pricing
WATCH_DATABASE = {
    "Rolex": {
        "Submariner": {
            "reference_patterns": ["116610", "126610", "114060", "124060", "16610", "16800"],
            "base_trade_price": 9500,
            "dial_colors": ["Black", "Green", "Blue"],
            "bezel_types": ["Ceramic", "Aluminum"],
            "bracelet_types": ["Oyster"],
            "price_modifiers": {"Green": 1.15, "Blue": 1.05, "Ceramic": 1.1}
        },
        "Daytona": {
            "reference_patterns": ["116500", "126500", "116503", "116508", "116515", "116519"],
            "base_trade_price": 28000,
            "dial_colors": ["White", "Black", "Panda", "Meteorite", "Green"],
            "bezel_types": ["Ceramic", "Steel"],
            "bracelet_types": ["Oyster", "Oysterflex"],
            "price_modifiers": {"Panda": 1.2, "Meteorite": 1.4, "Green": 1.3}
        },
        "GMT-Master II": {
            "reference_patterns": ["126710", "116710", "126711", "126715", "116718"],
            "base_trade_price": 14500,
            "dial_colors": ["Black", "Blue", "Meteorite"],
            "bezel_types": ["Pepsi", "Batman", "Sprite", "Root Beer", "Ceramic Black"],
            "bracelet_types": ["Oyster", "Jubilee"],
            "price_modifiers": {"Pepsi": 1.25, "Batman": 1.15, "Sprite": 1.2, "Jubilee": 1.05}
        },
        "Datejust": {
            "reference_patterns": ["126334", "126300", "126331", "126333", "116234", "116200"],
            "base_trade_price": 7500,
            "dial_colors": ["Blue", "Silver", "Slate", "Wimbledon", "Black", "White", "Champagne"],
            "bezel_types": ["Fluted", "Smooth", "Diamond"],
            "bracelet_types": ["Oyster", "Jubilee"],
            "price_modifiers": {"Fluted": 1.1, "Jubilee": 1.05, "Diamond": 1.4}
        },
        "Day-Date": {
            "reference_patterns": ["228238", "228235", "228239", "118238", "118235"],
            "base_trade_price": 32000,
            "dial_colors": ["Champagne", "Green", "Blue", "Olive", "Silver"],
            "bezel_types": ["Fluted", "Smooth"],
            "bracelet_types": ["President"],
            "price_modifiers": {"Green": 1.15, "Olive": 1.1}
        },
        "Explorer": {
            "reference_patterns": ["124270", "214270", "124273", "226570"],
            "base_trade_price": 7000,
            "dial_colors": ["Black", "White"],
            "bezel_types": ["Smooth"],
            "bracelet_types": ["Oyster"],
            "price_modifiers": {}
        }
    },
    "Patek Philippe": {
        "Nautilus": {
            "reference_patterns": ["5711", "5712", "5726", "5980", "5990"],
            "base_trade_price": 95000,
            "dial_colors": ["Blue", "Green", "White", "Black", "Brown"],
            "bezel_types": ["Integrated"],
            "bracelet_types": ["Integrated Steel", "Leather"],
            "price_modifiers": {"Green": 1.3, "Blue": 1.1}
        },
        "Aquanaut": {
            "reference_patterns": ["5167", "5168", "5164", "5968"],
            "base_trade_price": 45000,
            "dial_colors": ["Black", "Blue", "Green", "Khaki"],
            "bezel_types": ["Integrated"],
            "bracelet_types": ["Rubber", "Steel"],
            "price_modifiers": {"Khaki": 1.2, "Green": 1.15}
        },
        "Calatrava": {
            "reference_patterns": ["5196", "5227", "6119", "5120"],
            "base_trade_price": 22000,
            "dial_colors": ["White", "Silver", "Blue", "Black"],
            "bezel_types": ["Smooth", "Hobnail"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {}
        }
    },
    "Audemars Piguet": {
        "Royal Oak": {
            "reference_patterns": ["15500", "15202", "15400", "15510", "15550"],
            "base_trade_price": 38000,
            "dial_colors": ["Blue", "Black", "White", "Grey", "Green", "Salmon"],
            "bezel_types": ["Integrated Octagonal"],
            "bracelet_types": ["Integrated Steel", "Leather"],
            "price_modifiers": {"Blue": 1.1, "Green": 1.25, "Salmon": 1.3}
        },
        "Royal Oak Offshore": {
            "reference_patterns": ["26470", "26400", "26405", "26420"],
            "base_trade_price": 28000,
            "dial_colors": ["Black", "Blue", "White", "Grey"],
            "bezel_types": ["Ceramic", "Steel"],
            "bracelet_types": ["Rubber", "Steel"],
            "price_modifiers": {"Ceramic": 1.1}
        }
    },
    "Omega": {
        "Speedmaster": {
            "reference_patterns": ["310.30", "311.30", "310.32", "3861", "1861"],
            "base_trade_price": 5500,
            "dial_colors": ["Black", "Silver", "White", "Blue"],
            "bezel_types": ["Tachymeter", "Ceramic"],
            "bracelet_types": ["Steel", "Leather", "NATO"],
            "price_modifiers": {"Ceramic": 1.15}
        },
        "Seamaster": {
            "reference_patterns": ["210.30", "210.32", "212.30", "215.30"],
            "base_trade_price": 4200,
            "dial_colors": ["Black", "Blue", "White", "Green"],
            "bezel_types": ["Ceramic", "Aluminum"],
            "bracelet_types": ["Steel", "Rubber"],
            "price_modifiers": {"Green": 1.1}
        }
    }
}

# Condition multipliers for valuation
CONDITION_MULTIPLIERS = {
    "Mint/Unworn": 1.15,
    "Excellent": 1.05,
    "Very Good": 1.0,
    "Good": 0.92,
    "Fair": 0.85,
    "Poor": 0.70
}

# Dealer calibration modes
DEALER_CALIBRATION = {
    "ultra_conservative": {
        "name": "Ultra-Conservative",
        "description": "Maximum safety margin for quick liquidity",
        "low_modifier": 0.75,
        "fair_modifier": 0.82,
        "high_modifier": 0.88
    },
    "market_neutral": {
        "name": "Market-Neutral",
        "description": "Balanced approach reflecting current market",
        "low_modifier": 0.85,
        "fair_modifier": 0.92,
        "high_modifier": 0.98
    },
    "patient_retail": {
        "name": "Patient Retail",
        "description": "Optimistic pricing for patient sellers",
        "low_modifier": 0.92,
        "fair_modifier": 1.0,
        "high_modifier": 1.08
    }
}

# ============== MODELS ==============
class WatchDetails(BaseModel):
    brand: str
    model_family: str
    dial_color: Optional[str] = None
    bezel_type: Optional[str] = None
    bracelet_type: Optional[str] = None
    reference_number: Optional[str] = None
    condition: str = "Very Good"
    box_papers: bool = False

class DetectedField(BaseModel):
    field_name: str
    detected_value: str
    confidence: float  # 0-1
    status: str = "unconfirmed"  # unconfirmed, confirmed, rejected

class ImageAnalysisResult(BaseModel):
    success: bool
    detected_fields: List[DetectedField]
    analysis_notes: Optional[str] = None
    error: Optional[str] = None

class ValuationRequest(BaseModel):
    watch: WatchDetails
    calibration_mode: str = "market_neutral"
    confirmed_fields: List[str] = []  # List of field names that are confirmed

class ValuationResult(BaseModel):
    low_estimate: int
    fair_estimate: int
    high_estimate: int
    confidence_level: str  # "low", "medium", "high"
    confidence_percentage: int
    calibration_mode: str
    notes: List[str]
    breakdown: Dict[str, Any]

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# ============== UTILITY FUNCTIONS ==============
def calculate_valuation(watch: WatchDetails, calibration_mode: str, confirmed_fields: List[str]) -> ValuationResult:
    """Calculate conservative watch valuation with dealer-survivable pricing"""
    
    notes = []
    breakdown = {}
    
    # Get brand data
    brand_data = WATCH_DATABASE.get(watch.brand)
    if not brand_data:
        # Unknown brand - very conservative estimate
        base_price = 2000
        notes.append(f"Unknown brand '{watch.brand}' - using minimum baseline")
    else:
        model_data = brand_data.get(watch.model_family)
        if not model_data:
            # Unknown model - use brand minimum
            base_price = min([m.get("base_trade_price", 2000) for m in brand_data.values()]) * 0.7
            notes.append(f"Unknown model '{watch.model_family}' for {watch.brand} - using conservative brand baseline")
        else:
            base_price = model_data["base_trade_price"]
            breakdown["base_trade_price"] = base_price
            
            # Apply price modifiers
            modifier = 1.0
            if watch.dial_color and watch.dial_color in model_data.get("price_modifiers", {}):
                dial_mod = model_data["price_modifiers"][watch.dial_color]
                modifier *= dial_mod
                breakdown["dial_modifier"] = dial_mod
                
            if watch.bezel_type and watch.bezel_type in model_data.get("price_modifiers", {}):
                bezel_mod = model_data["price_modifiers"][watch.bezel_type]
                modifier *= bezel_mod
                breakdown["bezel_modifier"] = bezel_mod
                
            if watch.bracelet_type and watch.bracelet_type in model_data.get("price_modifiers", {}):
                bracelet_mod = model_data["price_modifiers"][watch.bracelet_type]
                modifier *= bracelet_mod
                breakdown["bracelet_modifier"] = bracelet_mod
                
            base_price *= modifier
    
    # Apply condition multiplier
    condition_mult = CONDITION_MULTIPLIERS.get(watch.condition, 0.9)
    base_price *= condition_mult
    breakdown["condition_multiplier"] = condition_mult
    
    # Box & papers bonus
    if watch.box_papers:
        base_price *= 1.08
        breakdown["box_papers_bonus"] = 1.08
        notes.append("Box & papers adds ~8% to value")
    else:
        notes.append("No box/papers documented - valuation reflects watch-only")
    
    # Get calibration modifiers
    cal = DEALER_CALIBRATION.get(calibration_mode, DEALER_CALIBRATION["market_neutral"])
    
    # Calculate confidence based on confirmed fields
    total_fields = 5  # brand, model, dial, bezel, bracelet
    confirmed_count = len([f for f in confirmed_fields if f in ["brand", "model_family", "dial_color", "bezel_type", "bracelet_type"]])
    
    # Brand and model are critical
    if "brand" not in confirmed_fields:
        confirmed_count = 0  # No confidence without confirmed brand
        notes.append("⚠️ Brand not confirmed - valuation has low confidence")
    if "model_family" not in confirmed_fields:
        confirmed_count = min(confirmed_count, 1)
        notes.append("⚠️ Model not confirmed - valuation has reduced confidence")
    
    confidence_pct = int((confirmed_count / total_fields) * 100)
    
    if confidence_pct >= 80:
        confidence_level = "high"
    elif confidence_pct >= 50:
        confidence_level = "medium"
    else:
        confidence_level = "low"
        # Further reduce estimates for low confidence
        base_price *= 0.9
        notes.append("Low confidence - estimates reduced by 10%")
    
    # Calculate bands
    low_estimate = int(base_price * cal["low_modifier"])
    fair_estimate = int(base_price * cal["fair_modifier"])
    high_estimate = int(base_price * cal["high_modifier"])
    
    # Round to nearest 100
    low_estimate = round(low_estimate / 100) * 100
    fair_estimate = round(fair_estimate / 100) * 100
    high_estimate = round(high_estimate / 100) * 100
    
    breakdown["calibration"] = cal["name"]
    
    return ValuationResult(
        low_estimate=low_estimate,
        fair_estimate=fair_estimate,
        high_estimate=high_estimate,
        confidence_level=confidence_level,
        confidence_percentage=confidence_pct,
        calibration_mode=cal["name"],
        notes=notes,
        breakdown=breakdown
    )

async def analyze_watch_image(image_base64: str) -> ImageAnalysisResult:
    """Analyze watch image using AI vision to detect visible attributes"""
    
    try:
        # Build the vision prompt - explicitly avoid authenticity/year
        prompt = """You are a watch identification assistant. Analyze this watch image and identify ONLY the following visible attributes:

1. **Brand** - Look for logo, crown, text on dial (e.g., Rolex, Omega, Patek Philippe, Audemars Piguet)
2. **Model Family** - Based on case shape, design elements (e.g., Submariner, Daytona, Nautilus, Royal Oak)
3. **Dial Color** - The actual color of the dial (e.g., Black, Blue, White, Green, Silver)
4. **Bezel Type** - What's on the bezel (e.g., Ceramic, Tachymeter, Fluted, Smooth, Pepsi, Batman)
5. **Bracelet Type** - The band style (e.g., Oyster, Jubilee, Rubber, Leather, Steel, NATO)

IMPORTANT RULES:
- NEVER attempt to determine authenticity - this is not an authentication tool
- NEVER guess the production year or age
- NEVER provide serial numbers or reference numbers from visual inspection
- Only report what is CLEARLY visible
- Provide confidence score (0.0-1.0) for each detected attribute
- If unsure, set confidence below 0.5

Respond in this exact JSON format:
{
    "detected": [
        {"field": "brand", "value": "detected value or null", "confidence": 0.0-1.0},
        {"field": "model_family", "value": "detected value or null", "confidence": 0.0-1.0},
        {"field": "dial_color", "value": "detected value or null", "confidence": 0.0-1.0},
        {"field": "bezel_type", "value": "detected value or null", "confidence": 0.0-1.0},
        {"field": "bracelet_type", "value": "detected value or null", "confidence": 0.0-1.0}
    ],
    "notes": "Any relevant observations about image quality or visibility"
}"""

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        # Parse the response
        response_text = response.choices[0].message.content
        
        # Extract JSON from response
        try:
            # Try to find JSON in the response
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                result_json = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
        except json.JSONDecodeError:
            # If JSON parsing fails, create a basic response
            return ImageAnalysisResult(
                success=False,
                detected_fields=[],
                error="Failed to parse AI response"
            )
        
        # Convert to our format
        detected_fields = []
        for item in result_json.get("detected", []):
            if item.get("value") and item["value"] != "null":
                detected_fields.append(DetectedField(
                    field_name=item["field"],
                    detected_value=item["value"],
                    confidence=float(item.get("confidence", 0.5)),
                    status="unconfirmed"
                ))
        
        return ImageAnalysisResult(
            success=True,
            detected_fields=detected_fields,
            analysis_notes=result_json.get("notes", "")
        )
        
    except Exception as e:
        logging.error(f"Image analysis error: {str(e)}")
        return ImageAnalysisResult(
            success=False,
            detected_fields=[],
            error=str(e)
        )

# ============== API ROUTES ==============
@api_router.get("/")
async def root():
    return {"message": "Crowntime AI - Watch Market Intelligence API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Crowntime AI"}

# Watch reference data endpoints
@api_router.get("/watch-data/brands")
async def get_brands():
    """Get list of supported watch brands"""
    return {"brands": list(WATCH_DATABASE.keys())}

@api_router.get("/watch-data/models/{brand}")
async def get_models(brand: str):
    """Get models for a specific brand"""
    brand_data = WATCH_DATABASE.get(brand)
    if not brand_data:
        raise HTTPException(status_code=404, detail=f"Brand '{brand}' not found")
    return {"brand": brand, "models": list(brand_data.keys())}

@api_router.get("/watch-data/attributes/{brand}/{model}")
async def get_model_attributes(brand: str, model: str):
    """Get available attributes for a specific model"""
    brand_data = WATCH_DATABASE.get(brand)
    if not brand_data:
        raise HTTPException(status_code=404, detail=f"Brand '{brand}' not found")
    
    model_data = brand_data.get(model)
    if not model_data:
        raise HTTPException(status_code=404, detail=f"Model '{model}' not found for {brand}")
    
    return {
        "brand": brand,
        "model": model,
        "dial_colors": model_data.get("dial_colors", []),
        "bezel_types": model_data.get("bezel_types", []),
        "bracelet_types": model_data.get("bracelet_types", [])
    }

@api_router.get("/watch-data/conditions")
async def get_conditions():
    """Get available condition grades"""
    return {"conditions": list(CONDITION_MULTIPLIERS.keys())}

@api_router.get("/calibration-modes")
async def get_calibration_modes():
    """Get available dealer calibration modes"""
    return {"modes": DEALER_CALIBRATION}

# Image analysis endpoint
@api_router.post("/analyze-image", response_model=ImageAnalysisResult)
async def analyze_image(file: UploadFile = File(...)):
    """Analyze a watch image to detect visible attributes"""
    
    # Read and encode image
    contents = await file.read()
    image_base64 = base64.b64encode(contents).decode('utf-8')
    
    # Analyze with AI vision
    result = await analyze_watch_image(image_base64)
    return result

@api_router.post("/analyze-image-base64", response_model=ImageAnalysisResult)
async def analyze_image_base64(data: dict):
    """Analyze a base64 encoded watch image"""
    
    image_base64 = data.get("image")
    if not image_base64:
        raise HTTPException(status_code=400, detail="No image data provided")
    
    # Remove data URL prefix if present
    if "base64," in image_base64:
        image_base64 = image_base64.split("base64,")[1]
    
    result = await analyze_watch_image(image_base64)
    return result

# Valuation endpoint
@api_router.post("/valuation", response_model=ValuationResult)
async def get_valuation(request: ValuationRequest):
    """Get conservative market valuation for a watch"""
    
    result = calculate_valuation(
        watch=request.watch,
        calibration_mode=request.calibration_mode,
        confirmed_fields=request.confirmed_fields
    )
    return result

# Status check endpoints (keeping original functionality)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
