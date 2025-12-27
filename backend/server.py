from fastapi import FastAPI, APIRouter, HTTPException
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
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Watch brands and their models
WATCH_DATA = {
    "Rolex": {
        "models": ["Submariner", "Daytona", "GMT-Master II", "Datejust", "Day-Date", "Explorer", "Sea-Dweller", "Yacht-Master", "Sky-Dweller", "Milgauss", "Air-King"],
        "base_values": {"Submariner": 12500, "Daytona": 23000, "GMT-Master II": 15000, "Datejust": 8500, "Day-Date": 28000, "Explorer": 9000, "Sea-Dweller": 14000, "Yacht-Master": 12000, "Sky-Dweller": 35000, "Milgauss": 9500, "Air-King": 7500}
    },
    "Patek Philippe": {
        "models": ["Nautilus", "Aquanaut", "Calatrava", "Grand Complications", "Complications", "Twenty~4", "Golden Ellipse"],
        "base_values": {"Nautilus": 85000, "Aquanaut": 45000, "Calatrava": 25000, "Grand Complications": 150000, "Complications": 55000, "Twenty~4": 18000, "Golden Ellipse": 22000}
    },
    "Audemars Piguet": {
        "models": ["Royal Oak", "Royal Oak Offshore", "Royal Oak Concept", "Code 11.59", "Millenary", "Jules Audemars"],
        "base_values": {"Royal Oak": 35000, "Royal Oak Offshore": 28000, "Royal Oak Concept": 95000, "Code 11.59": 25000, "Millenary": 18000, "Jules Audemars": 22000}
    },
    "Omega": {
        "models": ["Speedmaster", "Seamaster", "Constellation", "De Ville", "Planet Ocean", "Aqua Terra"],
        "base_values": {"Speedmaster": 6500, "Seamaster": 5500, "Constellation": 4500, "De Ville": 4000, "Planet Ocean": 6000, "Aqua Terra": 5000}
    },
    "Tudor": {
        "models": ["Black Bay", "Pelagos", "Ranger", "Royal", "1926", "Glamour"],
        "base_values": {"Black Bay": 3800, "Pelagos": 4200, "Ranger": 2800, "Royal": 2500, "1926": 2200, "Glamour": 2800}
    },
    "Cartier": {
        "models": ["Santos", "Tank", "Ballon Bleu", "Pasha", "Panthere", "Drive", "Ronde"],
        "base_values": {"Santos": 7500, "Tank": 6000, "Ballon Bleu": 5500, "Pasha": 6500, "Panthere": 4500, "Drive": 5000, "Ronde": 4000}
    },
    "IWC": {
        "models": ["Portugieser", "Pilot", "Portofino", "Aquatimer", "Ingenieur", "Da Vinci"],
        "base_values": {"Portugieser": 8500, "Pilot": 6500, "Portofino": 5500, "Aquatimer": 6000, "Ingenieur": 7000, "Da Vinci": 6500}
    },
    "Panerai": {
        "models": ["Luminor", "Radiomir", "Submersible", "Luminor Due"],
        "base_values": {"Luminor": 7500, "Radiomir": 7000, "Submersible": 9000, "Luminor Due": 6500}
    },
    "Breitling": {
        "models": ["Navitimer", "Superocean", "Chronomat", "Avenger", "Premier", "Professional"],
        "base_values": {"Navitimer": 6500, "Superocean": 4500, "Chronomat": 5500, "Avenger": 5000, "Premier": 5500, "Professional": 3500}
    },
    "Jaeger-LeCoultre": {
        "models": ["Reverso", "Master", "Polaris", "Rendez-Vous", "Duometre", "Atmos"],
        "base_values": {"Reverso": 9000, "Master": 8000, "Polaris": 10000, "Rendez-Vous": 8500, "Duometre": 25000, "Atmos": 6000}
    },
    "Vacheron Constantin": {
        "models": ["Overseas", "Patrimony", "Traditionnelle", "Fiftysix", "Historiques", "Metiers d'Art"],
        "base_values": {"Overseas": 28000, "Patrimony": 22000, "Traditionnelle": 35000, "Fiftysix": 15000, "Historiques": 45000, "Metiers d'Art": 85000}
    },
    "A. Lange & Söhne": {
        "models": ["Lange 1", "Saxonia", "Zeitwerk", "Datograph", "Richard Lange", "1815"],
        "base_values": {"Lange 1": 35000, "Saxonia": 18000, "Zeitwerk": 75000, "Datograph": 85000, "Richard Lange": 45000, "1815": 28000}
    }
}

DIAL_COLORS = ["Black", "White", "Blue", "Silver", "Green", "Champagne", "Mother of Pearl", "Gray", "Brown", "Rose Gold", "Rhodium"]
BEZEL_TYPES = ["Smooth", "Fluted", "Ceramic", "Tachymeter", "Diamond", "Rotating", "Fixed"]
BRACELET_TYPES = ["Oyster", "Jubilee", "President", "Leather", "Rubber", "NATO", "Mesh", "Bracelet"]
CONDITIONS = ["Unworn", "Excellent", "Very Good", "Good", "Fair"]
CONDITION_MULTIPLIERS = {"Unworn": 1.15, "Excellent": 1.05, "Very Good": 1.0, "Good": 0.9, "Fair": 0.75}

# Currency exchange rates (relative to USD)
CURRENCY_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "CHF": 0.88,
    "JPY": 149.50,
    "AUD": 1.53,
    "CAD": 1.36,
    "HKD": 7.82,
    "SGD": 1.34,
    "CNY": 7.24
}

# Define Models
class WatchValuationRequest(BaseModel):
    brand: str
    model: str
    dial_color: Optional[str] = None
    bezel_type: Optional[str] = None
    bracelet_type: Optional[str] = None
    reference_number: Optional[str] = None
    condition: str = "Very Good"
    has_box_papers: bool = False
    calibration_mode: str = "market_neutral"  # ultra_conservative, market_neutral, patient_retail
    currency: str = "USD"

class WatchValuation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    model: str
    dial_color: Optional[str] = None
    bezel_type: Optional[str] = None
    bracelet_type: Optional[str] = None
    reference_number: Optional[str] = None
    condition: str
    has_box_papers: bool
    calibration_mode: str
    low_estimate: float
    mid_estimate: float
    high_estimate: float
    currency: str
    confidence_score: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RecentScan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    model: str
    valuation: float
    currency: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PortfolioWatch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    model: str
    dial_color: Optional[str] = None
    bezel_type: Optional[str] = None
    bracelet_type: Optional[str] = None
    reference_number: Optional[str] = None
    condition: str = "Very Good"
    has_box_papers: bool = False
    purchase_price: Optional[float] = None
    purchase_date: Optional[str] = None
    notes: Optional[str] = None
    current_valuation: Optional[float] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PortfolioWatchCreate(BaseModel):
    brand: str
    model: str
    dial_color: Optional[str] = None
    bezel_type: Optional[str] = None
    bracelet_type: Optional[str] = None
    reference_number: Optional[str] = None
    condition: str = "Very Good"
    has_box_papers: bool = False
    purchase_price: Optional[float] = None
    purchase_date: Optional[str] = None
    notes: Optional[str] = None

def calculate_valuation(brand: str, model: str, condition: str, has_box_papers: bool, calibration_mode: str, currency: str) -> Dict[str, Any]:
    """Calculate watch valuation based on inputs"""
    if brand not in WATCH_DATA:
        raise ValueError(f"Unknown brand: {brand}")
    
    brand_data = WATCH_DATA[brand]
    if model not in brand_data["base_values"]:
        raise ValueError(f"Unknown model: {model}")
    
    base_value = brand_data["base_values"][model]
    
    # Apply condition multiplier
    condition_mult = CONDITION_MULTIPLIERS.get(condition, 1.0)
    value = base_value * condition_mult
    
    # Apply box & papers premium (10-15%)
    if has_box_papers:
        value *= 1.12
    
    # Apply calibration mode adjustments
    if calibration_mode == "ultra_conservative":
        low = value * 0.75
        mid = value * 0.85
        high = value * 0.92
    elif calibration_mode == "patient_retail":
        low = value * 0.95
        mid = value * 1.10
        high = value * 1.25
    else:  # market_neutral
        low = value * 0.88
        mid = value * 1.0
        high = value * 1.12
    
    # Add some market variance (±3%)
    variance = random.uniform(-0.03, 0.03)
    low *= (1 + variance)
    mid *= (1 + variance)
    high *= (1 + variance)
    
    # Convert to target currency
    rate = CURRENCY_RATES.get(currency, 1.0)
    low *= rate
    mid *= rate
    high *= rate
    
    return {
        "low_estimate": round(low, -2),  # Round to nearest 100
        "mid_estimate": round(mid, -2),
        "high_estimate": round(high, -2)
    }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Crowntime AI API - Watch Market Intelligence"}

@api_router.get("/brands")
async def get_brands():
    """Get list of all watch brands"""
    return {"brands": list(WATCH_DATA.keys())}

@api_router.get("/brands/{brand}/models")
async def get_brand_models(brand: str):
    """Get models for a specific brand"""
    if brand not in WATCH_DATA:
        raise HTTPException(status_code=404, detail=f"Brand '{brand}' not found")
    return {"models": WATCH_DATA[brand]["models"]}

@api_router.get("/options")
async def get_options():
    """Get all dropdown options"""
    return {
        "brands": list(WATCH_DATA.keys()),
        "dial_colors": DIAL_COLORS,
        "bezel_types": BEZEL_TYPES,
        "bracelet_types": BRACELET_TYPES,
        "conditions": CONDITIONS,
        "currencies": list(CURRENCY_RATES.keys())
    }

@api_router.post("/valuate", response_model=WatchValuation)
async def valuate_watch(request: WatchValuationRequest):
    """Get valuation for a watch"""
    try:
        valuation_data = calculate_valuation(
            brand=request.brand,
            model=request.model,
            condition=request.condition,
            has_box_papers=request.has_box_papers,
            calibration_mode=request.calibration_mode,
            currency=request.currency
        )
        
        # Calculate confidence score based on provided fields
        confidence = 0
        if request.brand:
            confidence += 20
        if request.model:
            confidence += 20
        if request.dial_color:
            confidence += 15
        if request.bezel_type:
            confidence += 15
        if request.bracelet_type:
            confidence += 15
        if request.reference_number:
            confidence += 15
        
        valuation = WatchValuation(
            brand=request.brand,
            model=request.model,
            dial_color=request.dial_color,
            bezel_type=request.bezel_type,
            bracelet_type=request.bracelet_type,
            reference_number=request.reference_number,
            condition=request.condition,
            has_box_papers=request.has_box_papers,
            calibration_mode=request.calibration_mode,
            currency=request.currency,
            confidence_score=confidence,
            **valuation_data
        )
        
        # Save to recent scans
        scan = RecentScan(
            brand=request.brand,
            model=request.model,
            valuation=valuation_data["mid_estimate"],
            currency=request.currency
        )
        scan_doc = scan.model_dump()
        scan_doc['timestamp'] = scan_doc['timestamp'].isoformat()
        await db.recent_scans.insert_one(scan_doc)
        
        return valuation
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/recent-scans", response_model=List[RecentScan])
async def get_recent_scans(limit: int = 10):
    """Get recent watch scans"""
    scans = await db.recent_scans.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    for scan in scans:
        if isinstance(scan['timestamp'], str):
            scan['timestamp'] = datetime.fromisoformat(scan['timestamp'])
    return scans

@api_router.delete("/recent-scans")
async def clear_recent_scans():
    """Clear all recent scans"""
    await db.recent_scans.delete_many({})
    return {"message": "Recent scans cleared"}

# Portfolio routes
@api_router.get("/portfolio", response_model=List[PortfolioWatch])
async def get_portfolio():
    """Get all watches in portfolio"""
    watches = await db.portfolio.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    for watch in watches:
        if isinstance(watch.get('timestamp'), str):
            watch['timestamp'] = datetime.fromisoformat(watch['timestamp'])
    return watches

@api_router.post("/portfolio", response_model=PortfolioWatch)
async def add_to_portfolio(watch: PortfolioWatchCreate):
    """Add a watch to portfolio"""
    # Calculate current valuation
    try:
        valuation_data = calculate_valuation(
            brand=watch.brand,
            model=watch.model,
            condition=watch.condition,
            has_box_papers=watch.has_box_papers,
            calibration_mode="market_neutral",
            currency="USD"
        )
        current_valuation = valuation_data["mid_estimate"]
    except Exception:
        current_valuation = None
    
    portfolio_watch = PortfolioWatch(
        **watch.model_dump(),
        current_valuation=current_valuation
    )
    
    doc = portfolio_watch.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.portfolio.insert_one(doc)
    
    return portfolio_watch

@api_router.delete("/portfolio/{watch_id}")
async def remove_from_portfolio(watch_id: str):
    """Remove a watch from portfolio"""
    result = await db.portfolio.delete_one({"id": watch_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Watch not found")
    return {"message": "Watch removed from portfolio"}

@api_router.get("/portfolio/summary")
async def get_portfolio_summary():
    """Get portfolio summary with total value"""
    watches = await db.portfolio.find({}, {"_id": 0}).to_list(100)
    
    total_value = 0
    total_cost = 0
    
    for watch in watches:
        if watch.get('current_valuation'):
            total_value += watch['current_valuation']
        if watch.get('purchase_price'):
            total_cost += watch['purchase_price']
    
    return {
        "total_watches": len(watches),
        "total_value": total_value,
        "total_cost": total_cost,
        "total_gain_loss": total_value - total_cost if total_cost > 0 else 0,
        "gain_loss_percentage": ((total_value - total_cost) / total_cost * 100) if total_cost > 0 else 0
    }

@api_router.get("/compare")
async def compare_watches(brand1: str, model1: str, brand2: str, model2: str, currency: str = "USD"):
    """Compare two watches"""
    try:
        val1 = calculate_valuation(brand1, model1, "Very Good", True, "market_neutral", currency)
        val2 = calculate_valuation(brand2, model2, "Very Good", True, "market_neutral", currency)
        
        return {
            "watch1": {
                "brand": brand1,
                "model": model1,
                **val1
            },
            "watch2": {
                "brand": brand2,
                "model": model2,
                **val2
            },
            "difference": val1["mid_estimate"] - val2["mid_estimate"],
            "currency": currency
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
