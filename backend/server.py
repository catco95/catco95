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
from datetime import datetime, timezone, timedelta
import base64
import json
import httpx
import random
from emergentintegrations.llm.openai import LlmChat, ImageContent, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM Key
EMERGENT_KEY = os.environ.get('EMERGENT_KEY')

# Exchange rate cache
exchange_rate_cache = {
    "rates": {},
    "last_updated": None
}

# Create the main app
app = FastAPI(title="Crowntime AI - Watch Market Intelligence")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== WATCH DATA ==============
# Comprehensive luxury watch database with trade-level pricing (USD base)
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
        },
        "Sky-Dweller": {
            "reference_patterns": ["326934", "326933", "326935", "336934"],
            "base_trade_price": 22000,
            "dial_colors": ["Blue", "White", "Black", "Champagne"],
            "bezel_types": ["Fluted Command"],
            "bracelet_types": ["Oyster", "Jubilee", "Oysterflex"],
            "price_modifiers": {"Blue": 1.1}
        },
        "Yacht-Master": {
            "reference_patterns": ["126621", "126622", "226659", "126655"],
            "base_trade_price": 14000,
            "dial_colors": ["Slate", "Blue", "Black", "White"],
            "bezel_types": ["Platinum", "Rose Gold", "Ceramic"],
            "bracelet_types": ["Oyster", "Oysterflex"],
            "price_modifiers": {"Ceramic": 1.15}
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
        },
        "Grand Complications": {
            "reference_patterns": ["5270", "5204", "5320", "6300"],
            "base_trade_price": 180000,
            "dial_colors": ["White", "Blue", "Salmon", "Black"],
            "bezel_types": ["Smooth"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {"Salmon": 1.2}
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
        },
        "Code 11.59": {
            "reference_patterns": ["15210", "26393", "26396"],
            "base_trade_price": 25000,
            "dial_colors": ["Blue", "Grey", "Burgundy", "Green"],
            "bezel_types": ["Octagonal"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {"Burgundy": 1.1}
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
        },
        "Seamaster Planet Ocean": {
            "reference_patterns": ["215.30", "215.32", "232.30"],
            "base_trade_price": 5800,
            "dial_colors": ["Black", "Blue", "Orange"],
            "bezel_types": ["Ceramic"],
            "bracelet_types": ["Steel", "Rubber"],
            "price_modifiers": {"Orange": 1.05}
        },
        "Constellation": {
            "reference_patterns": ["131.30", "131.10", "123.10"],
            "base_trade_price": 4500,
            "dial_colors": ["Silver", "Blue", "Green", "Black"],
            "bezel_types": ["Fluted"],
            "bracelet_types": ["Steel", "Leather"],
            "price_modifiers": {}
        }
    },
    "Tudor": {
        "Black Bay": {
            "reference_patterns": ["79230", "79360", "79830"],
            "base_trade_price": 3200,
            "dial_colors": ["Black", "Blue", "Red"],
            "bezel_types": ["Aluminum", "Steel"],
            "bracelet_types": ["Steel", "Fabric", "Leather"],
            "price_modifiers": {"Red": 1.05}
        },
        "Black Bay 58": {
            "reference_patterns": ["79030", "79030B", "79030N"],
            "base_trade_price": 3500,
            "dial_colors": ["Black", "Blue", "Bronze"],
            "bezel_types": ["Aluminum"],
            "bracelet_types": ["Steel", "Fabric"],
            "price_modifiers": {"Bronze": 1.1}
        },
        "Pelagos": {
            "reference_patterns": ["25600", "25610"],
            "base_trade_price": 4200,
            "dial_colors": ["Black", "Blue"],
            "bezel_types": ["Ceramic"],
            "bracelet_types": ["Titanium", "Rubber"],
            "price_modifiers": {}
        },
        "Royal": {
            "reference_patterns": ["28600", "28300"],
            "base_trade_price": 2800,
            "dial_colors": ["Black", "Blue", "Champagne"],
            "bezel_types": ["Knurled"],
            "bracelet_types": ["Steel"],
            "price_modifiers": {}
        }
    },
    "Cartier": {
        "Santos": {
            "reference_patterns": ["WSSA0018", "WSSA0037", "WGSA0029"],
            "base_trade_price": 6500,
            "dial_colors": ["Silver", "Blue", "Grey", "Green"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Steel", "Leather", "QuickSwitch"],
            "price_modifiers": {"Green": 1.1}
        },
        "Tank": {
            "reference_patterns": ["WSTA0065", "WSTA0041", "W5200027"],
            "base_trade_price": 5500,
            "dial_colors": ["Silver", "Blue", "Black"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather", "Steel"],
            "price_modifiers": {}
        },
        "Ballon Bleu": {
            "reference_patterns": ["WSBB0060", "W69012Z4", "W6920071"],
            "base_trade_price": 5000,
            "dial_colors": ["Silver", "Blue", "Pink"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Steel", "Leather"],
            "price_modifiers": {}
        },
        "Pasha": {
            "reference_patterns": ["WSPA0009", "WSPA0013"],
            "base_trade_price": 7500,
            "dial_colors": ["Silver", "Blue", "Grey"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Steel", "Leather"],
            "price_modifiers": {}
        }
    },
    "IWC": {
        "Portugieser": {
            "reference_patterns": ["IW371605", "IW500714", "IW371615"],
            "base_trade_price": 7500,
            "dial_colors": ["White", "Blue", "Silver", "Black"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather", "Steel"],
            "price_modifiers": {"Blue": 1.05}
        },
        "Pilot": {
            "reference_patterns": ["IW388101", "IW377709", "IW329301"],
            "base_trade_price": 5500,
            "dial_colors": ["Black", "Blue", "Green"],
            "bezel_types": ["Matte"],
            "bracelet_types": ["Leather", "Steel", "Textile"],
            "price_modifiers": {"Green": 1.1}
        },
        "Big Pilot": {
            "reference_patterns": ["IW501001", "IW329303", "IW501012"],
            "base_trade_price": 12000,
            "dial_colors": ["Black", "Blue"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather", "Steel"],
            "price_modifiers": {}
        },
        "Aquatimer": {
            "reference_patterns": ["IW329001", "IW356802"],
            "base_trade_price": 5000,
            "dial_colors": ["Black", "Blue"],
            "bezel_types": ["Rotating"],
            "bracelet_types": ["Rubber", "Steel"],
            "price_modifiers": {}
        }
    },
    "Breitling": {
        "Navitimer": {
            "reference_patterns": ["AB0127", "AB0139", "AB0121"],
            "base_trade_price": 7000,
            "dial_colors": ["Black", "Blue", "Silver", "Green"],
            "bezel_types": ["Slide Rule"],
            "bracelet_types": ["Leather", "Steel"],
            "price_modifiers": {"Green": 1.1}
        },
        "Superocean": {
            "reference_patterns": ["A17367", "A17375", "A17376"],
            "base_trade_price": 3800,
            "dial_colors": ["Black", "Blue", "Orange", "Green"],
            "bezel_types": ["Ceramic", "Unidirectional"],
            "bracelet_types": ["Steel", "Rubber"],
            "price_modifiers": {"Orange": 1.05}
        },
        "Chronomat": {
            "reference_patterns": ["AB0134", "AB0136", "AB0115"],
            "base_trade_price": 6500,
            "dial_colors": ["Black", "Blue", "Copper", "Silver"],
            "bezel_types": ["Rider Tabs"],
            "bracelet_types": ["Steel", "Rubber", "Leather"],
            "price_modifiers": {"Copper": 1.1}
        },
        "Avenger": {
            "reference_patterns": ["A13317", "A17318", "A32397"],
            "base_trade_price": 4500,
            "dial_colors": ["Black", "Blue", "Yellow"],
            "bezel_types": ["Unidirectional"],
            "bracelet_types": ["Steel", "Leather", "Military"],
            "price_modifiers": {}
        }
    },
    "Panerai": {
        "Luminor": {
            "reference_patterns": ["PAM01312", "PAM01392", "PAM01088"],
            "base_trade_price": 7500,
            "dial_colors": ["Black", "Blue", "Green"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather", "Rubber"],
            "price_modifiers": {"Green": 1.1}
        },
        "Submersible": {
            "reference_patterns": ["PAM01305", "PAM00973", "PAM01070"],
            "base_trade_price": 9000,
            "dial_colors": ["Black", "Blue", "Green"],
            "bezel_types": ["Rotating Ceramic"],
            "bracelet_types": ["Rubber", "Steel"],
            "price_modifiers": {}
        },
        "Radiomir": {
            "reference_patterns": ["PAM00753", "PAM00995", "PAM01184"],
            "base_trade_price": 6500,
            "dial_colors": ["Black", "Brown", "Blue"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {}
        }
    },
    "Vacheron Constantin": {
        "Overseas": {
            "reference_patterns": ["4500V", "5500V", "2300V"],
            "base_trade_price": 22000,
            "dial_colors": ["Blue", "Silver", "Black", "Green"],
            "bezel_types": ["Maltese Cross"],
            "bracelet_types": ["Steel", "Rubber", "Leather"],
            "price_modifiers": {"Blue": 1.1, "Green": 1.15}
        },
        "Patrimony": {
            "reference_patterns": ["81180", "85180", "81530"],
            "base_trade_price": 18000,
            "dial_colors": ["Silver", "White", "Blue"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {}
        },
        "Traditionnelle": {
            "reference_patterns": ["87172", "82172", "43075"],
            "base_trade_price": 25000,
            "dial_colors": ["Silver", "Grey", "Blue"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {}
        }
    },
    "Jaeger-LeCoultre": {
        "Reverso": {
            "reference_patterns": ["Q3858520", "Q2438520", "Q7068420"],
            "base_trade_price": 8500,
            "dial_colors": ["Silver", "Black", "Blue", "Grey"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather", "Steel"],
            "price_modifiers": {}
        },
        "Master Ultra Thin": {
            "reference_patterns": ["Q1288420", "Q1368420", "Q1378420"],
            "base_trade_price": 9500,
            "dial_colors": ["Silver", "Blue", "Black"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather", "Steel"],
            "price_modifiers": {}
        },
        "Polaris": {
            "reference_patterns": ["Q9068670", "Q842843J", "Q9028480"],
            "base_trade_price": 8000,
            "dial_colors": ["Black", "Blue", "Grey"],
            "bezel_types": ["Rotating"],
            "bracelet_types": ["Steel", "Rubber"],
            "price_modifiers": {}
        }
    },
    "A. Lange & Söhne": {
        "Lange 1": {
            "reference_patterns": ["191.032", "191.039", "117.028"],
            "base_trade_price": 35000,
            "dial_colors": ["Silver", "Black", "Blue", "Grey"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {"Blue": 1.1}
        },
        "Saxonia": {
            "reference_patterns": ["380.032", "380.033", "219.026"],
            "base_trade_price": 18000,
            "dial_colors": ["Silver", "Black", "Blue"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {}
        },
        "Odysseus": {
            "reference_patterns": ["363.068", "363.179"],
            "base_trade_price": 45000,
            "dial_colors": ["Grey", "Blue"],
            "bezel_types": ["Integrated"],
            "bracelet_types": ["Steel", "Rubber"],
            "price_modifiers": {}
        }
    },
    "Hublot": {
        "Big Bang": {
            "reference_patterns": ["301.SB", "411.NM", "441.NX"],
            "base_trade_price": 12000,
            "dial_colors": ["Black", "Blue", "Grey"],
            "bezel_types": ["Ceramic", "Titanium"],
            "bracelet_types": ["Rubber", "Steel"],
            "price_modifiers": {"Ceramic": 1.1}
        },
        "Classic Fusion": {
            "reference_patterns": ["511.NX", "542.NX", "565.NX"],
            "base_trade_price": 6500,
            "dial_colors": ["Black", "Blue", "Grey", "Racing Grey"],
            "bezel_types": ["Titanium", "Ceramic"],
            "bracelet_types": ["Rubber", "Leather"],
            "price_modifiers": {}
        },
        "Spirit of Big Bang": {
            "reference_patterns": ["601.NM", "642.NX"],
            "base_trade_price": 14000,
            "dial_colors": ["Black", "Blue"],
            "bezel_types": ["Titanium", "Ceramic"],
            "bracelet_types": ["Rubber"],
            "price_modifiers": {}
        }
    },
    "TAG Heuer": {
        "Carrera": {
            "reference_patterns": ["CBN2A1B", "CBS2210", "CBK2110"],
            "base_trade_price": 4500,
            "dial_colors": ["Black", "Blue", "Silver", "Green"],
            "bezel_types": ["Tachymeter", "Ceramic"],
            "bracelet_types": ["Steel", "Leather"],
            "price_modifiers": {"Green": 1.05}
        },
        "Monaco": {
            "reference_patterns": ["CBL2111", "CAW211P", "CBL2113"],
            "base_trade_price": 5500,
            "dial_colors": ["Blue", "Black", "Grey", "Green"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather", "Steel"],
            "price_modifiers": {}
        },
        "Aquaracer": {
            "reference_patterns": ["WBP201B", "WBP2010", "WAY201A"],
            "base_trade_price": 2500,
            "dial_colors": ["Black", "Blue", "Green"],
            "bezel_types": ["Ceramic", "Aluminum"],
            "bracelet_types": ["Steel", "Rubber"],
            "price_modifiers": {}
        }
    },
    "Zenith": {
        "Chronomaster": {
            "reference_patterns": ["03.3200", "03.3300", "03.2040"],
            "base_trade_price": 7500,
            "dial_colors": ["Black", "White", "Blue"],
            "bezel_types": ["Tachymeter"],
            "bracelet_types": ["Steel", "Leather"],
            "price_modifiers": {}
        },
        "Defy": {
            "reference_patterns": ["95.9000", "95.9005", "87.9000"],
            "base_trade_price": 8000,
            "dial_colors": ["Blue", "Black", "Grey"],
            "bezel_types": ["Integrated"],
            "bracelet_types": ["Steel", "Rubber"],
            "price_modifiers": {}
        },
        "Pilot": {
            "reference_patterns": ["29.2430", "03.2430"],
            "base_trade_price": 5500,
            "dial_colors": ["Black", "Bronze"],
            "bezel_types": ["Polished"],
            "bracelet_types": ["Leather"],
            "price_modifiers": {"Bronze": 1.1}
        }
    }
}

# Currency data with exchange rates (base USD)
CURRENCIES = {
    "USD": {"symbol": "$", "name": "US Dollar", "rate": 1.0},
    "GBP": {"symbol": "£", "name": "British Pound", "rate": 0.79},
    "EUR": {"symbol": "€", "name": "Euro", "rate": 0.92},
    "CHF": {"symbol": "CHF", "name": "Swiss Franc", "rate": 0.88},
    "JPY": {"symbol": "¥", "name": "Japanese Yen", "rate": 149.50},
    "AUD": {"symbol": "A$", "name": "Australian Dollar", "rate": 1.53},
    "CAD": {"symbol": "C$", "name": "Canadian Dollar", "rate": 1.36},
    "HKD": {"symbol": "HK$", "name": "Hong Kong Dollar", "rate": 7.82},
    "SGD": {"symbol": "S$", "name": "Singapore Dollar", "rate": 1.34},
    "AED": {"symbol": "د.إ", "name": "UAE Dirham", "rate": 3.67}
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

# Scan history model
class ScanHistoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    brand: Optional[str] = None
    model_family: Optional[str] = None
    dial_color: Optional[str] = None
    bezel_type: Optional[str] = None
    bracelet_type: Optional[str] = None
    valuation_low: Optional[int] = None
    valuation_fair: Optional[int] = None
    valuation_high: Optional[int] = None
    confidence_level: Optional[str] = None
    image_thumbnail: Optional[str] = None  # Small base64 thumbnail

class SaveScanRequest(BaseModel):
    watch: WatchDetails
    valuation: Optional[ValuationResult] = None
    image_thumbnail: Optional[str] = None

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
        system_prompt = """You are a watch identification assistant. When shown a watch image, identify ONLY visible attributes.

IMPORTANT RULES:
- NEVER attempt to determine authenticity - this is not an authentication tool
- NEVER guess the production year or age
- NEVER provide serial numbers or reference numbers from visual inspection
- Only report what is CLEARLY visible
- Provide confidence score (0.0-1.0) for each detected attribute
- If unsure, set confidence below 0.5

Always respond in this exact JSON format:
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

        user_prompt = """Analyze this watch image and identify:
1. Brand - Look for logo, crown, text on dial (e.g., Rolex, Omega, Patek Philippe, Audemars Piguet)
2. Model Family - Based on case shape, design elements (e.g., Submariner, Daytona, Nautilus, Royal Oak)
3. Dial Color - The actual color of the dial (e.g., Black, Blue, White, Green, Silver)
4. Bezel Type - What's on the bezel (e.g., Ceramic, Tachymeter, Fluted, Smooth, Pepsi, Batman)
5. Bracelet Type - The band style (e.g., Oyster, Jubilee, Rubber, Leather, Steel, NATO)

Respond with JSON only."""

        # Create LlmChat instance with vision model
        llm = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=str(uuid.uuid4()),
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        # Create user message with image
        image_content = ImageContent(image_base64=image_base64)
        user_message = UserMessage(text=user_prompt, file_contents=[image_content])
        
        # Send message and get response
        response_text = await llm.send_message(user_message)
        
        # Extract JSON from response
        try:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                result_json = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
        except json.JSONDecodeError:
            return ImageAnalysisResult(
                success=False,
                detected_fields=[],
                error="Failed to parse AI response"
            )
        
        # Convert to our format
        detected_fields = []
        for item in result_json.get("detected", []):
            if item.get("value") and item["value"] != "null" and item["value"] is not None:
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

@api_router.get("/currencies")
async def get_currencies():
    """Get available currencies with exchange rates"""
    return {"currencies": CURRENCIES}

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

# Scan history endpoints
@api_router.post("/scan-history", response_model=ScanHistoryItem)
async def save_scan(request: SaveScanRequest):
    """Save a watch scan to history"""
    
    scan_item = ScanHistoryItem(
        brand=request.watch.brand,
        model_family=request.watch.model_family,
        dial_color=request.watch.dial_color,
        bezel_type=request.watch.bezel_type,
        bracelet_type=request.watch.bracelet_type,
        valuation_low=request.valuation.low_estimate if request.valuation else None,
        valuation_fair=request.valuation.fair_estimate if request.valuation else None,
        valuation_high=request.valuation.high_estimate if request.valuation else None,
        confidence_level=request.valuation.confidence_level if request.valuation else None,
        image_thumbnail=request.image_thumbnail
    )
    
    doc = scan_item.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.scan_history.insert_one(doc)
    return scan_item

@api_router.get("/scan-history", response_model=List[ScanHistoryItem])
async def get_scan_history(limit: int = 10):
    """Get recent scan history"""
    
    scans = await db.scan_history.find(
        {}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    for scan in scans:
        if isinstance(scan.get('timestamp'), str):
            scan['timestamp'] = datetime.fromisoformat(scan['timestamp'])
    
    return scans

@api_router.delete("/scan-history/{scan_id}")
async def delete_scan(scan_id: str):
    """Delete a scan from history"""
    
    result = await db.scan_history.delete_one({"id": scan_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scan not found")
    return {"message": "Scan deleted"}

@api_router.delete("/scan-history")
async def clear_scan_history():
    """Clear all scan history"""
    
    await db.scan_history.delete_many({})
    return {"message": "History cleared"}

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
