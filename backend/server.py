from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import random
import base64
import io
import json
from jose import JWTError, jwt
from passlib.context import CryptContext
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContent


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent API Key
EMERGENT_API_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'crowntime-ai-secret-key-2024-very-secure')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== ENHANCED WATCH DATABASE ==============
# Comprehensive watch database with images and reference numbers
WATCH_DATA = {
    "Rolex": {
        "logo": "https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Rolex_logo.svg/200px-Rolex_logo.svg.png",
        "country": "Switzerland",
        "founded": 1905,
        "models": {
            "Submariner": {
                "base_value": 12500,
                "image": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400",
                "references": ["126610LN", "126610LV", "126613LB", "126618LN", "126619LB", "124060"],
                "case_size": "41mm",
                "movement": "Calibre 3235",
                "water_resistance": "300m",
                "description": "The quintessential diving watch, first introduced in 1953."
            },
            "Daytona": {
                "base_value": 23000,
                "image": "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=400",
                "references": ["126500LN", "126506", "126508", "126509", "116500LN", "116503", "116505", "116515LN"],
                "case_size": "40mm",
                "movement": "Calibre 4131",
                "water_resistance": "100m",
                "description": "Iconic chronograph created for professional racing drivers."
            },
            "GMT-Master II": {
                "base_value": 15000,
                "image": "https://images.unsplash.com/photo-1627037558426-c2d07beda3af?w=400",
                "references": ["126710BLRO", "126710BLNR", "126711CHNR", "126720VTNR", "126715CHNR"],
                "case_size": "40mm",
                "movement": "Calibre 3285",
                "water_resistance": "100m",
                "description": "Dual time zone watch designed for pilots and travelers."
            },
            "Datejust": {
                "base_value": 8500,
                "image": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400",
                "references": ["126334", "126331", "126333", "126300", "126301", "126234", "126231"],
                "case_size": "36mm/41mm",
                "movement": "Calibre 3235",
                "water_resistance": "100m",
                "description": "Classic dress watch with date function, introduced in 1945."
            },
            "Day-Date": {
                "base_value": 28000,
                "image": "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=400",
                "references": ["228238", "228239", "228235", "228236", "228349RBR"],
                "case_size": "40mm",
                "movement": "Calibre 3255",
                "water_resistance": "100m",
                "description": "The Presidents watch, displaying day and date in full."
            },
            "Explorer": {
                "base_value": 9000,
                "image": "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400",
                "references": ["124270", "226570", "124273"],
                "case_size": "36mm/40mm",
                "movement": "Calibre 3230/3285",
                "water_resistance": "100m",
                "description": "Rugged expedition watch worn on the first Everest summit."
            },
            "Sea-Dweller": {
                "base_value": 14000,
                "image": "https://images.unsplash.com/photo-1606744888344-493238951221?w=400",
                "references": ["126600", "126603", "136660"],
                "case_size": "43mm",
                "movement": "Calibre 3235",
                "water_resistance": "1220m",
                "description": "Professional diving watch for saturation diving."
            },
            "Yacht-Master": {
                "base_value": 12000,
                "image": "https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=400",
                "references": ["226658", "226659", "126621", "126622", "126655"],
                "case_size": "40mm/42mm",
                "movement": "Calibre 3235",
                "water_resistance": "100m",
                "description": "Nautical chronometer for sailors and regatta enthusiasts."
            },
            "Sky-Dweller": {
                "base_value": 35000,
                "image": "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=400",
                "references": ["336934", "336935", "336938", "336939"],
                "case_size": "42mm",
                "movement": "Calibre 9002",
                "water_resistance": "100m",
                "description": "Annual calendar with dual time zone for globetrotters."
            },
            "Milgauss": {
                "base_value": 9500,
                "image": "https://images.unsplash.com/photo-1618220179428-22790b461013?w=400",
                "references": ["116400GV"],
                "case_size": "40mm",
                "movement": "Calibre 3131",
                "water_resistance": "100m",
                "description": "Anti-magnetic watch designed for scientists and engineers."
            },
            "Air-King": {
                "base_value": 7500,
                "image": "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=400",
                "references": ["126900"],
                "case_size": "40mm",
                "movement": "Calibre 3230",
                "water_resistance": "100m",
                "description": "Aviation heritage watch with distinctive dial."
            }
        },
        "trend": 2.5,
        "volatility": "low"
    },
    "Patek Philippe": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Patek_Philippe_SA_logo.svg/200px-Patek_Philippe_SA_logo.svg.png",
        "country": "Switzerland",
        "founded": 1839,
        "models": {
            "Nautilus": {
                "base_value": 85000,
                "image": "https://images.unsplash.com/photo-1656249207961-7c7d39ffb5ee?w=400",
                "references": ["5711/1A", "5712/1A", "5726/1A", "5980/1A", "5990/1A", "5711/1R"],
                "case_size": "40mm",
                "movement": "Calibre 26-330 S C",
                "water_resistance": "120m",
                "description": "Iconic sports watch designed by Gerald Genta in 1976."
            },
            "Aquanaut": {
                "base_value": 45000,
                "image": "https://images.unsplash.com/photo-1629041236499-89f58e522fab?w=400",
                "references": ["5167A", "5168G", "5164A", "5968A", "5269R"],
                "case_size": "40mm/42mm",
                "movement": "Calibre 324 S C",
                "water_resistance": "120m",
                "description": "Modern sports watch with tropical rubber strap."
            },
            "Calatrava": {
                "base_value": 25000,
                "image": "https://images.unsplash.com/photo-1639037687665-4f33a7b6b573?w=400",
                "references": ["5227G", "5227R", "6119G", "6119R", "5196G"],
                "case_size": "39mm",
                "movement": "Calibre 324 S C",
                "water_resistance": "30m",
                "description": "The essence of round dress watch elegance since 1932."
            },
            "Grand Complications": {
                "base_value": 150000,
                "image": "https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?w=400",
                "references": ["5270P", "5270G", "5204P", "5204R", "6300G", "5320G"],
                "case_size": "41mm-47mm",
                "movement": "Various",
                "water_resistance": "30m",
                "description": "Masterpieces featuring perpetual calendars and minute repeaters."
            },
            "Complications": {
                "base_value": 55000,
                "image": "https://images.unsplash.com/photo-1612817159623-2a93c847c7e9?w=400",
                "references": ["5205G", "5205R", "5146G", "5146R", "5396G"],
                "case_size": "38mm-40mm",
                "movement": "Various",
                "water_resistance": "30m",
                "description": "Annual calendars and world time complications."
            },
            "Twenty~4": {
                "base_value": 18000,
                "image": "https://images.unsplash.com/photo-1612817288484-6f048d8a47bd?w=400",
                "references": ["7300/1200A", "7300/1200R", "4910/1200A"],
                "case_size": "36mm",
                "movement": "Calibre 324 S C",
                "water_resistance": "30m",
                "description": "Contemporary ladies watch for modern women."
            },
            "Golden Ellipse": {
                "base_value": 22000,
                "image": "https://images.unsplash.com/photo-1612817288637-d1d4f54b7d86?w=400",
                "references": ["5738P", "5738R"],
                "case_size": "34mm x 39mm",
                "movement": "Calibre 240",
                "water_resistance": "30m",
                "description": "Elliptical case based on golden ratio proportions."
            }
        },
        "trend": -1.2,
        "volatility": "medium"
    },
    "Audemars Piguet": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Audemars_Piguet_logo.svg/200px-Audemars_Piguet_logo.svg.png",
        "country": "Switzerland",
        "founded": 1875,
        "models": {
            "Royal Oak": {
                "base_value": 35000,
                "image": "https://images.unsplash.com/photo-1614946895824-23cda41b5903?w=400",
                "references": ["15500ST", "15202ST", "15510ST", "26331ST", "26315ST"],
                "case_size": "37mm/39mm/41mm",
                "movement": "Calibre 4302",
                "water_resistance": "50m",
                "description": "Revolutionary luxury sports watch designed by Gerald Genta."
            },
            "Royal Oak Offshore": {
                "base_value": 28000,
                "image": "https://images.unsplash.com/photo-1629041236493-871a2e1c1f38?w=400",
                "references": ["26470ST", "26405CE", "26420SO", "26238CE"],
                "case_size": "42mm/44mm",
                "movement": "Calibre 3126/3840",
                "water_resistance": "100m",
                "description": "Bold oversized chronograph for extreme sports."
            },
            "Royal Oak Concept": {
                "base_value": 95000,
                "image": "https://images.unsplash.com/photo-1612817159591-4be8c9f1c108?w=400",
                "references": ["26221FT", "26587TI", "26589IO"],
                "case_size": "44mm",
                "movement": "Various",
                "water_resistance": "100m",
                "description": "Avant-garde designs pushing horological boundaries."
            },
            "Code 11.59": {
                "base_value": 25000,
                "image": "https://images.unsplash.com/photo-1612817159637-2f4f2ca5e9d0?w=400",
                "references": ["15210BC", "26393BC", "26393CR"],
                "case_size": "41mm",
                "movement": "Calibre 4302",
                "water_resistance": "30m",
                "description": "Modern dress watch collection launched in 2019."
            },
            "Millenary": {
                "base_value": 18000,
                "image": "https://images.unsplash.com/photo-1612817159535-7efdc7c5ed4a?w=400",
                "references": ["77247BC", "77244BC"],
                "case_size": "39mm",
                "movement": "Calibre 5201",
                "water_resistance": "20m",
                "description": "Oval case with off-centered dial design."
            },
            "Jules Audemars": {
                "base_value": 22000,
                "image": "https://images.unsplash.com/photo-1612817159586-9e8b6e6c0c7c?w=400",
                "references": ["26150PT", "26320OR"],
                "case_size": "39mm-41mm",
                "movement": "Various",
                "water_resistance": "20m",
                "description": "Classic round watches honoring the co-founder."
            }
        },
        "trend": 1.8,
        "volatility": "medium"
    },
    "Omega": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Omega_Logo.svg/200px-Omega_Logo.svg.png",
        "country": "Switzerland",
        "founded": 1848,
        "models": {
            "Speedmaster": {
                "base_value": 6500,
                "image": "https://images.unsplash.com/photo-1639037687474-85b89e10d7ef?w=400",
                "references": ["310.30.42.50.01.001", "310.30.42.50.01.002", "310.32.42.50.01.001", "311.30.42.30.01.005"],
                "case_size": "42mm",
                "movement": "Calibre 3861",
                "water_resistance": "50m",
                "description": "The Moonwatch - first watch worn on the lunar surface."
            },
            "Seamaster": {
                "base_value": 5500,
                "image": "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=400",
                "references": ["210.30.42.20.01.001", "210.30.42.20.03.001", "210.32.42.20.01.001"],
                "case_size": "42mm",
                "movement": "Calibre 8800",
                "water_resistance": "300m",
                "description": "James Bond's watch of choice since 1995."
            },
            "Constellation": {
                "base_value": 4500,
                "image": "https://images.unsplash.com/photo-1612817159637-e6c6e8e0f9e7?w=400",
                "references": ["131.10.39.20.01.001", "131.10.39.20.02.001"],
                "case_size": "39mm/41mm",
                "movement": "Calibre 8900",
                "water_resistance": "50m",
                "description": "Precision chronometer with signature claw design."
            },
            "De Ville": {
                "base_value": 4000,
                "image": "https://images.unsplash.com/photo-1612817159678-9d9e9f9e0c7c?w=400",
                "references": ["434.13.41.21.01.001", "434.13.41.21.02.001"],
                "case_size": "41mm",
                "movement": "Calibre 8910",
                "water_resistance": "30m",
                "description": "Elegant dress watch collection with classic styling."
            },
            "Planet Ocean": {
                "base_value": 6000,
                "image": "https://images.unsplash.com/photo-1612817159699-0b9e9f9e0c7c?w=400",
                "references": ["215.30.44.21.01.001", "215.30.44.21.03.001"],
                "case_size": "43.5mm/45.5mm",
                "movement": "Calibre 8900",
                "water_resistance": "600m",
                "description": "Professional dive watch for deep-sea exploration."
            },
            "Aqua Terra": {
                "base_value": 5000,
                "image": "https://images.unsplash.com/photo-1612817159710-0b9e9f9e0c7c?w=400",
                "references": ["220.10.41.21.01.001", "220.10.41.21.03.001"],
                "case_size": "38mm/41mm",
                "movement": "Calibre 8900",
                "water_resistance": "150m",
                "description": "Versatile watch bridging sport and dress styles."
            }
        },
        "trend": 3.2,
        "volatility": "low"
    },
    "Tudor": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Tudor_logo.svg/200px-Tudor_logo.svg.png",
        "country": "Switzerland",
        "founded": 1926,
        "models": {
            "Black Bay": {
                "base_value": 3800,
                "image": "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?w=400",
                "references": ["M79000N", "M79230N", "M79360N", "M79830RB", "M7941A1A0RU"],
                "case_size": "39mm/41mm",
                "movement": "MT5602",
                "water_resistance": "200m",
                "description": "Rolex's sister brand dive watch with heritage appeal."
            },
            "Pelagos": {
                "base_value": 4200,
                "image": "https://images.unsplash.com/photo-1612817159721-0b9e9f9e0c7c?w=400",
                "references": ["M25600TN", "M25600TB", "M25407N"],
                "case_size": "39mm/42mm",
                "movement": "MT5612",
                "water_resistance": "500m",
                "description": "Professional titanium dive watch for extreme depths."
            },
            "Ranger": {
                "base_value": 2800,
                "image": "https://images.unsplash.com/photo-1612817159732-0b9e9f9e0c7c?w=400",
                "references": ["M79950"],
                "case_size": "39mm",
                "movement": "MT5402",
                "water_resistance": "100m",
                "description": "Field watch inspired by vintage military designs."
            },
            "Royal": {
                "base_value": 2500,
                "image": "https://images.unsplash.com/photo-1612817159743-0b9e9f9e0c7c?w=400",
                "references": ["M28600", "M28500", "M28400"],
                "case_size": "38mm/41mm",
                "movement": "T601",
                "water_resistance": "100m",
                "description": "Entry-level collection with classic styling."
            },
            "1926": {
                "base_value": 2200,
                "image": "https://images.unsplash.com/photo-1612817159754-0b9e9f9e0c7c?w=400",
                "references": ["M91650", "M91550", "M91450"],
                "case_size": "36mm/39mm/41mm",
                "movement": "ETA 2824",
                "water_resistance": "100m",
                "description": "Dress watch commemorating Tudor's founding year."
            },
            "Glamour": {
                "base_value": 2800,
                "image": "https://images.unsplash.com/photo-1612817159765-0b9e9f9e0c7c?w=400",
                "references": ["M55000", "M55003", "M55020"],
                "case_size": "36mm/42mm",
                "movement": "MT5601",
                "water_resistance": "100m",
                "description": "Double bezel design with automatic movement."
            }
        },
        "trend": 4.5,
        "volatility": "low"
    },
    "Cartier": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Cartier_Logo.svg/200px-Cartier_Logo.svg.png",
        "country": "France",
        "founded": 1847,
        "models": {
            "Santos": {
                "base_value": 7500,
                "image": "https://images.unsplash.com/photo-1612817159776-0b9e9f9e0c7c?w=400",
                "references": ["WSSA0018", "WSSA0030", "WGSA0034"],
                "case_size": "35mm/40mm",
                "movement": "Calibre 1847 MC",
                "water_resistance": "100m",
                "description": "The first pilot's wristwatch, created in 1904."
            },
            "Tank": {
                "base_value": 6000,
                "image": "https://images.unsplash.com/photo-1612817159787-0b9e9f9e0c7c?w=400",
                "references": ["WSTA0065", "WSTA0041", "W5200027"],
                "case_size": "Various",
                "movement": "Various",
                "water_resistance": "30m",
                "description": "Iconic rectangular watch inspired by WWI tanks."
            },
            "Ballon Bleu": {
                "base_value": 5500,
                "image": "https://images.unsplash.com/photo-1612817159798-0b9e9f9e0c7c?w=400",
                "references": ["WSBB0046", "W6920046", "W69012Z4"],
                "case_size": "33mm/36mm/42mm",
                "movement": "Calibre 076",
                "water_resistance": "30m",
                "description": "Round case with signature blue sapphire crown."
            },
            "Pasha": {
                "base_value": 6500,
                "image": "https://images.unsplash.com/photo-1612817159809-0b9e9f9e0c7c?w=400",
                "references": ["WSPA0009", "WSPA0012", "WSPA0018"],
                "case_size": "35mm/41mm",
                "movement": "Calibre 1847 MC",
                "water_resistance": "100m",
                "description": "Art Deco inspired with protective crown cap."
            },
            "Panthere": {
                "base_value": 4500,
                "image": "https://images.unsplash.com/photo-1612817159820-0b9e9f9e0c7c?w=400",
                "references": ["WSPN0007", "WSPN0019", "WJPN0008"],
                "case_size": "22mm/27mm",
                "movement": "Calibre 157",
                "water_resistance": "30m",
                "description": "Sleek ladies watch with integrated bracelet."
            },
            "Drive": {
                "base_value": 5000,
                "image": "https://images.unsplash.com/photo-1612817159831-0b9e9f9e0c7c?w=400",
                "references": ["WSNM0004", "WSNM0008"],
                "case_size": "41mm",
                "movement": "Calibre 1904-PS MC",
                "water_resistance": "30m",
                "description": "Cushion-shaped case for the modern gentleman."
            },
            "Ronde": {
                "base_value": 4000,
                "image": "https://images.unsplash.com/photo-1612817159842-0b9e9f9e0c7c?w=400",
                "references": ["WSRN0032", "WSRN0003"],
                "case_size": "36mm/40mm",
                "movement": "Calibre 049",
                "water_resistance": "30m",
                "description": "Classic round watch with Cartier elegance."
            }
        },
        "trend": 2.1,
        "volatility": "low"
    },
    "IWC": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/IWC_logo.svg/200px-IWC_logo.svg.png",
        "country": "Switzerland",
        "founded": 1868,
        "models": {
            "Portugieser": {
                "base_value": 8500,
                "image": "https://images.unsplash.com/photo-1612817159853-0b9e9f9e0c7c?w=400",
                "references": ["IW371605", "IW371609", "IW500705", "IW503501"],
                "case_size": "41mm/42mm",
                "movement": "Calibre 69355",
                "water_resistance": "30m",
                "description": "Elegant chronograph with maritime heritage."
            },
            "Pilot": {
                "base_value": 6500,
                "image": "https://images.unsplash.com/photo-1612817159864-0b9e9f9e0c7c?w=400",
                "references": ["IW388101", "IW388102", "IW329303", "IW377709"],
                "case_size": "41mm/43mm",
                "movement": "Calibre 69380",
                "water_resistance": "60m",
                "description": "Aviation watches with cockpit-inspired design."
            },
            "Portofino": {
                "base_value": 5500,
                "image": "https://images.unsplash.com/photo-1612817159875-0b9e9f9e0c7c?w=400",
                "references": ["IW356517", "IW356522", "IW391027"],
                "case_size": "39mm/40mm",
                "movement": "Calibre 35111",
                "water_resistance": "30m",
                "description": "Italian elegance meets Swiss precision."
            },
            "Aquatimer": {
                "base_value": 6000,
                "image": "https://images.unsplash.com/photo-1612817159886-0b9e9f9e0c7c?w=400",
                "references": ["IW329001", "IW329005"],
                "case_size": "42mm",
                "movement": "Calibre 32110",
                "water_resistance": "300m",
                "description": "Professional dive watch with SafeDive system."
            },
            "Ingenieur": {
                "base_value": 7000,
                "image": "https://images.unsplash.com/photo-1612817159897-0b9e9f9e0c7c?w=400",
                "references": ["IW357002", "IW357001"],
                "case_size": "40mm",
                "movement": "Calibre 32111",
                "water_resistance": "100m",
                "description": "Anti-magnetic watch for engineers since 1955."
            },
            "Da Vinci": {
                "base_value": 6500,
                "image": "https://images.unsplash.com/photo-1612817159908-0b9e9f9e0c7c?w=400",
                "references": ["IW376418", "IW393402"],
                "case_size": "40mm/42mm",
                "movement": "Calibre 89361",
                "water_resistance": "30m",
                "description": "Perpetual calendar with moon phase."
            }
        },
        "trend": 1.5,
        "volatility": "medium"
    },
    "Panerai": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Officine_Panerai_logo.svg/200px-Officine_Panerai_logo.svg.png",
        "country": "Italy",
        "founded": 1860,
        "models": {
            "Luminor": {
                "base_value": 7500,
                "image": "https://images.unsplash.com/photo-1612817159919-0b9e9f9e0c7c?w=400",
                "references": ["PAM01312", "PAM01316", "PAM01048", "PAM01084"],
                "case_size": "44mm",
                "movement": "P.9010",
                "water_resistance": "300m",
                "description": "Signature crown-protecting bridge device."
            },
            "Radiomir": {
                "base_value": 7000,
                "image": "https://images.unsplash.com/photo-1612817159930-0b9e9f9e0c7c?w=400",
                "references": ["PAM00995", "PAM00998", "PAM01348"],
                "case_size": "45mm",
                "movement": "P.999",
                "water_resistance": "100m",
                "description": "Wire lugs design with clean cushion case."
            },
            "Submersible": {
                "base_value": 9000,
                "image": "https://images.unsplash.com/photo-1612817159941-0b9e9f9e0c7c?w=400",
                "references": ["PAM01305", "PAM01229", "PAM00973"],
                "case_size": "42mm/47mm",
                "movement": "P.9010",
                "water_resistance": "300m",
                "description": "Professional dive watch with rotating bezel."
            },
            "Luminor Due": {
                "base_value": 6500,
                "image": "https://images.unsplash.com/photo-1612817159952-0b9e9f9e0c7c?w=400",
                "references": ["PAM01046", "PAM01249", "PAM01274"],
                "case_size": "38mm/42mm",
                "movement": "P.900",
                "water_resistance": "30m",
                "description": "Slimmer, dressier interpretation of Luminor."
            }
        },
        "trend": -0.5,
        "volatility": "medium"
    },
    "Breitling": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Breitling_logo.svg/200px-Breitling_logo.svg.png",
        "country": "Switzerland",
        "founded": 1884,
        "models": {
            "Navitimer": {
                "base_value": 6500,
                "image": "https://images.unsplash.com/photo-1612817159963-0b9e9f9e0c7c?w=400",
                "references": ["AB0127211B1A1", "AB0137211B1A1", "AB0138211B1A1"],
                "case_size": "41mm/43mm/46mm",
                "movement": "B01",
                "water_resistance": "30m",
                "description": "Iconic pilot's chronograph with slide rule bezel."
            },
            "Superocean": {
                "base_value": 4500,
                "image": "https://images.unsplash.com/photo-1612817159974-0b9e9f9e0c7c?w=400",
                "references": ["A17376211B1A1", "A17377211B1A1", "A17375E71G1A1"],
                "case_size": "42mm/44mm/46mm",
                "movement": "B20",
                "water_resistance": "500m",
                "description": "Professional dive watch for underwater exploration."
            },
            "Chronomat": {
                "base_value": 5500,
                "image": "https://images.unsplash.com/photo-1612817159985-0b9e9f9e0c7c?w=400",
                "references": ["AB0134101B1A1", "AB0134101K1A1", "AB0136251B1A1"],
                "case_size": "42mm",
                "movement": "B01",
                "water_resistance": "200m",
                "description": "All-purpose sports chronograph since 1984."
            },
            "Avenger": {
                "base_value": 5000,
                "image": "https://images.unsplash.com/photo-1612817159996-0b9e9f9e0c7c?w=400",
                "references": ["A13317101B1A1", "A13385101B1X1", "A32397101B1X1"],
                "case_size": "43mm/45mm/48mm",
                "movement": "B13",
                "water_resistance": "300m",
                "description": "Robust military-inspired chronograph."
            },
            "Premier": {
                "base_value": 5500,
                "image": "https://images.unsplash.com/photo-1612817160007-0b9e9f9e0c7c?w=400",
                "references": ["AB0118221G1P1", "AB0930371B1P1"],
                "case_size": "40mm/42mm",
                "movement": "B01",
                "water_resistance": "100m",
                "description": "Elegant chronograph with 1940s inspiration."
            },
            "Professional": {
                "base_value": 3500,
                "image": "https://images.unsplash.com/photo-1612817160018-0b9e9f9e0c7c?w=400",
                "references": ["E7936310A1B1S1", "E7632522A1S1"],
                "case_size": "43mm/46mm",
                "movement": "SuperQuartz",
                "water_resistance": "100m",
                "description": "High-precision quartz with multifunction display."
            }
        },
        "trend": 2.8,
        "volatility": "low"
    },
    "Jaeger-LeCoultre": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Jaeger-LeCoultre_logo.svg/200px-Jaeger-LeCoultre_logo.svg.png",
        "country": "Switzerland",
        "founded": 1833,
        "models": {
            "Reverso": {
                "base_value": 9000,
                "image": "https://images.unsplash.com/photo-1612817160029-0b9e9f9e0c7c?w=400",
                "references": ["Q3858520", "Q7138420", "Q2438522"],
                "case_size": "Various",
                "movement": "Calibre 822",
                "water_resistance": "30m",
                "description": "Iconic reversible case design from 1931."
            },
            "Master": {
                "base_value": 8000,
                "image": "https://images.unsplash.com/photo-1612817160040-0b9e9f9e0c7c?w=400",
                "references": ["Q1368420", "Q1308470", "Q4148420"],
                "case_size": "40mm",
                "movement": "Calibre 899/1",
                "water_resistance": "50m",
                "description": "Classic round case with 1000 Hours tested movement."
            },
            "Polaris": {
                "base_value": 10000,
                "image": "https://images.unsplash.com/photo-1612817160051-0b9e9f9e0c7c?w=400",
                "references": ["Q9068670", "Q9008470", "Q9068180"],
                "case_size": "42mm",
                "movement": "Calibre 898AC/1",
                "water_resistance": "200m",
                "description": "Sports watch inspired by vintage Memovox."
            },
            "Rendez-Vous": {
                "base_value": 8500,
                "image": "https://images.unsplash.com/photo-1612817160062-0b9e9f9e0c7c?w=400",
                "references": ["Q3448420", "Q3578420"],
                "case_size": "34mm/38mm",
                "movement": "Calibre 898A/1",
                "water_resistance": "50m",
                "description": "Elegant ladies collection with day/night indicator."
            },
            "Duometre": {
                "base_value": 25000,
                "image": "https://images.unsplash.com/photo-1612817160073-0b9e9f9e0c7c?w=400",
                "references": ["Q6062420", "Q6012420"],
                "case_size": "42mm",
                "movement": "Calibre 383",
                "water_resistance": "50m",
                "description": "Dual-wing mechanism for supreme precision."
            },
            "Atmos": {
                "base_value": 6000,
                "image": "https://images.unsplash.com/photo-1612817160084-0b9e9f9e0c7c?w=400",
                "references": ["Q5102201", "Q5111202"],
                "case_size": "N/A",
                "movement": "Calibre 528",
                "water_resistance": "N/A",
                "description": "Perpetual clock powered by temperature changes."
            }
        },
        "trend": 1.2,
        "volatility": "low"
    },
    "Vacheron Constantin": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Vacheron_Constantin_logo.svg/200px-Vacheron_Constantin_logo.svg.png",
        "country": "Switzerland",
        "founded": 1755,
        "models": {
            "Overseas": {
                "base_value": 28000,
                "image": "https://images.unsplash.com/photo-1612817160095-0b9e9f9e0c7c?w=400",
                "references": ["4500V/110A", "47040/000A", "5500V/110A"],
                "case_size": "41mm",
                "movement": "Calibre 5100",
                "water_resistance": "150m",
                "description": "Luxury sports watch with interchangeable straps."
            },
            "Patrimony": {
                "base_value": 22000,
                "image": "https://images.unsplash.com/photo-1612817160106-0b9e9f9e0c7c?w=400",
                "references": ["85180/000G", "81180/000R", "85180/000R"],
                "case_size": "40mm",
                "movement": "Calibre 2450 Q6",
                "water_resistance": "30m",
                "description": "Ultra-thin dress watch with pure aesthetics."
            },
            "Traditionnelle": {
                "base_value": 35000,
                "image": "https://images.unsplash.com/photo-1612817160117-0b9e9f9e0c7c?w=400",
                "references": ["82172/000G", "87172/000G", "82760/000G"],
                "case_size": "38mm/41mm",
                "movement": "Calibre 2460 QH",
                "water_resistance": "30m",
                "description": "Classic haute horlogerie with traditional finishing."
            },
            "Fiftysix": {
                "base_value": 15000,
                "image": "https://images.unsplash.com/photo-1612817160128-0b9e9f9e0c7c?w=400",
                "references": ["4600E/000A", "4600E/000R"],
                "case_size": "40mm",
                "movement": "Calibre 1326",
                "water_resistance": "30m",
                "description": "Entry-level collection inspired by 1956 reference."
            },
            "Historiques": {
                "base_value": 45000,
                "image": "https://images.unsplash.com/photo-1612817160139-0b9e9f9e0c7c?w=400",
                "references": ["86122/000P", "82035/000R"],
                "case_size": "Various",
                "movement": "Various",
                "water_resistance": "30m",
                "description": "Reissues of iconic historical references."
            },
            "Metiers d'Art": {
                "base_value": 85000,
                "image": "https://images.unsplash.com/photo-1612817160150-0b9e9f9e0c7c?w=400",
                "references": ["7600C/000G", "86073/000P"],
                "case_size": "40mm",
                "movement": "Various",
                "water_resistance": "30m",
                "description": "Artistic masterpieces with enameling and engraving."
            }
        },
        "trend": 0.8,
        "volatility": "medium"
    },
    "A. Lange & Söhne": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/A._Lange_%26_S%C3%B6hne_logo.svg/200px-A._Lange_%26_S%C3%B6hne_logo.svg.png",
        "country": "Germany",
        "founded": 1845,
        "models": {
            "Lange 1": {
                "base_value": 35000,
                "image": "https://images.unsplash.com/photo-1612817160161-0b9e9f9e0c7c?w=400",
                "references": ["191.032", "117.028", "109.032"],
                "case_size": "38.5mm",
                "movement": "L121.1",
                "water_resistance": "30m",
                "description": "Signature asymmetric dial with outsize date."
            },
            "Saxonia": {
                "base_value": 18000,
                "image": "https://images.unsplash.com/photo-1612817160172-0b9e9f9e0c7c?w=400",
                "references": ["219.032", "380.033", "842.032"],
                "case_size": "35mm/38.5mm",
                "movement": "L086.5",
                "water_resistance": "30m",
                "description": "Pure and understated dress watch."
            },
            "Zeitwerk": {
                "base_value": 75000,
                "image": "https://images.unsplash.com/photo-1612817160183-0b9e9f9e0c7c?w=400",
                "references": ["140.029", "145.029", "142.029"],
                "case_size": "41.9mm",
                "movement": "L043.1",
                "water_resistance": "30m",
                "description": "Revolutionary jumping numerals display."
            },
            "Datograph": {
                "base_value": 85000,
                "image": "https://images.unsplash.com/photo-1612817160194-0b9e9f9e0c7c?w=400",
                "references": ["405.035", "403.035", "410.038"],
                "case_size": "41mm",
                "movement": "L951.6",
                "water_resistance": "30m",
                "description": "Ultimate chronograph with flyback function."
            },
            "Richard Lange": {
                "base_value": 45000,
                "image": "https://images.unsplash.com/photo-1612817160205-0b9e9f9e0c7c?w=400",
                "references": ["232.032", "252.029", "238.032"],
                "case_size": "40.5mm",
                "movement": "L041.2",
                "water_resistance": "30m",
                "description": "Scientific regulator dial with constant force."
            },
            "1815": {
                "base_value": 28000,
                "image": "https://images.unsplash.com/photo-1612817160216-0b9e9f9e0c7c?w=400",
                "references": ["235.032", "233.032", "414.028"],
                "case_size": "38.5mm/40mm",
                "movement": "L051.1",
                "water_resistance": "30m",
                "description": "Tribute to Ferdinand A. Lange's birth year."
            }
        },
        "trend": 1.0,
        "volatility": "low"
    },
    "Hublot": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Hublot_logo.svg/200px-Hublot_logo.svg.png",
        "country": "Switzerland",
        "founded": 1980,
        "models": {
            "Big Bang": {
                "base_value": 15000,
                "image": "https://images.unsplash.com/photo-1612817160227-0b9e9f9e0c7c?w=400",
                "references": ["301.SX.130.RX", "411.NX.1170.RX", "441.NX.1171.RX"],
                "case_size": "42mm/44mm/45mm",
                "movement": "HUB4100",
                "water_resistance": "100m",
                "description": "Fusion of materials defining modern luxury."
            },
            "Classic Fusion": {
                "base_value": 8000,
                "image": "https://images.unsplash.com/photo-1612817160238-0b9e9f9e0c7c?w=400",
                "references": ["511.NX.1171.RX", "542.NX.1171.RX", "521.NX.1171.RX"],
                "case_size": "38mm/42mm/45mm",
                "movement": "HUB1110",
                "water_resistance": "50m",
                "description": "Refined interpretation of original Hublot design."
            },
            "Spirit of Big Bang": {
                "base_value": 18000,
                "image": "https://images.unsplash.com/photo-1612817160249-0b9e9f9e0c7c?w=400",
                "references": ["641.NX.0173.LR", "647.NX.1137.RX"],
                "case_size": "42mm",
                "movement": "HUB4700",
                "water_resistance": "100m",
                "description": "Tonneau-shaped Big Bang interpretation."
            },
            "Square Bang": {
                "base_value": 22000,
                "image": "https://images.unsplash.com/photo-1612817160260-0b9e9f9e0c7c?w=400",
                "references": ["821.NX.0170.RX", "821.OX.0180.RX"],
                "case_size": "43mm",
                "movement": "HUB1280",
                "water_resistance": "100m",
                "description": "Square case with integrated rubber strap."
            }
        },
        "trend": 1.5,
        "volatility": "medium"
    },
    "Richard Mille": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Richard_Mille_logo.svg/200px-Richard_Mille_logo.svg.png",
        "country": "Switzerland",
        "founded": 2001,
        "models": {
            "RM 011": {
                "base_value": 180000,
                "image": "https://images.unsplash.com/photo-1612817160271-0b9e9f9e0c7c?w=400",
                "references": ["RM011-FM", "RM011 Ti", "RM011 RG"],
                "case_size": "50mm",
                "movement": "RMAC3",
                "water_resistance": "50m",
                "description": "Flyback chronograph with annual calendar."
            },
            "RM 035": {
                "base_value": 150000,
                "image": "https://images.unsplash.com/photo-1612817160282-0b9e9f9e0c7c?w=400",
                "references": ["RM035-02", "RM035 AL"],
                "case_size": "48mm",
                "movement": "RMUL3",
                "water_resistance": "50m",
                "description": "Ultra-lightweight Rafael Nadal edition."
            },
            "RM 055": {
                "base_value": 120000,
                "image": "https://images.unsplash.com/photo-1612817160293-0b9e9f9e0c7c?w=400",
                "references": ["RM055 Ti", "RM055 ATZ"],
                "case_size": "49.9mm",
                "movement": "RMUL2",
                "water_resistance": "50m",
                "description": "Bubba Watson edition for golf enthusiasts."
            },
            "RM 067": {
                "base_value": 100000,
                "image": "https://images.unsplash.com/photo-1612817160304-0b9e9f9e0c7c?w=400",
                "references": ["RM067-01 Ti", "RM067-01 RG"],
                "case_size": "47.5mm",
                "movement": "CRMA6",
                "water_resistance": "30m",
                "description": "Extra-flat automatic with skeletonized dial."
            }
        },
        "trend": -2.0,
        "volatility": "high"
    },
    "Grand Seiko": {
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Grand_Seiko_logo.svg/200px-Grand_Seiko_logo.svg.png",
        "country": "Japan",
        "founded": 1960,
        "models": {
            "Heritage": {
                "base_value": 5500,
                "image": "https://images.unsplash.com/photo-1612817160315-0b9e9f9e0c7c?w=400",
                "references": ["SBGA211", "SBGA413", "SBGW231"],
                "case_size": "37mm-40mm",
                "movement": "9R65/9S65",
                "water_resistance": "100m",
                "description": "Traditional Japanese watchmaking excellence."
            },
            "Elegance": {
                "base_value": 4500,
                "image": "https://images.unsplash.com/photo-1612817160326-0b9e9f9e0c7c?w=400",
                "references": ["SBGK004", "SBGK006", "SBGZ003"],
                "case_size": "38.5mm",
                "movement": "9S63",
                "water_resistance": "30m",
                "description": "Refined dress watches with urushi lacquer dials."
            },
            "Sport": {
                "base_value": 6000,
                "image": "https://images.unsplash.com/photo-1612817160337-0b9e9f9e0c7c?w=400",
                "references": ["SBGE257", "SBGC231", "SBGA229"],
                "case_size": "40mm-44mm",
                "movement": "9R96/9R86",
                "water_resistance": "200m",
                "description": "Professional sports watches with Spring Drive."
            },
            "Evolution 9": {
                "base_value": 8000,
                "image": "https://images.unsplash.com/photo-1612817160348-0b9e9f9e0c7c?w=400",
                "references": ["SLGH005", "SLGH003", "SLGA001"],
                "case_size": "40mm",
                "movement": "9SA5",
                "water_resistance": "100m",
                "description": "Next-generation design with Hi-Beat movement."
            }
        },
        "trend": 5.0,
        "volatility": "low"
    }
}

DIAL_COLORS = ["Black", "White", "Blue", "Silver", "Green", "Champagne", "Mother of Pearl", "Gray", "Brown", "Rose Gold", "Rhodium", "Salmon", "Tiffany Blue", "Burgundy", "Anthracite"]
BEZEL_TYPES = ["Smooth", "Fluted", "Ceramic", "Tachymeter", "Diamond", "Rotating", "Fixed", "Slide Rule", "GMT", "Countdown"]
BRACELET_TYPES = ["Oyster", "Jubilee", "President", "Leather", "Rubber", "NATO", "Mesh", "Bracelet", "Alligator", "Canvas", "Titanium"]
CONDITIONS = ["Unworn", "Excellent", "Very Good", "Good", "Fair"]
CONDITION_MULTIPLIERS = {"Unworn": 1.15, "Excellent": 1.05, "Very Good": 1.0, "Good": 0.9, "Fair": 0.75}

CURRENCY_RATES = {
    "USD": 1.0, "EUR": 0.92, "GBP": 0.79, "CHF": 0.88, "JPY": 149.50,
    "AUD": 1.53, "CAD": 1.36, "HKD": 7.82, "SGD": 1.34, "CNY": 7.24
}

# ============== USER AUTHENTICATION MODELS ==============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    hashed_password: str
    provider: str = "local"  # local, google
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    provider: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class GoogleAuthRequest(BaseModel):
    credential: str  # Google ID token

# ============== WATCH MODELS ==============
class WatchValuationRequest(BaseModel):
    brand: str
    model: str
    dial_color: Optional[str] = None
    bezel_type: Optional[str] = None
    bracelet_type: Optional[str] = None
    reference_number: Optional[str] = None
    condition: str = "Very Good"
    has_box_papers: bool = False
    calibration_mode: str = "market_neutral"
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
    watch_image: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RecentScan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    brand: str
    model: str
    valuation: float
    currency: str
    watch_image: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PortfolioWatch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
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
    watch_image: Optional[str] = None
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

class ImageAnalysisResult(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    dial_color: Optional[str] = None
    bezel_type: Optional[str] = None
    bracelet_type: Optional[str] = None
    reference_number: Optional[str] = None
    condition: Optional[str] = None
    confidence: float = 0.0
    description: str = ""

# ============== AUTH HELPER FUNCTIONS ==============
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        user_doc = await db.users.find_one({"id": user_id})
        if user_doc:
            return User(**user_doc)
        return None
    except JWTError:
        return None

async def get_required_user(current_user: Optional[User] = Depends(get_current_user)) -> User:
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user

# ============== CALCULATION FUNCTIONS ==============
def get_model_data(brand: str, model: str) -> Dict[str, Any]:
    """Get model data from enhanced database"""
    if brand not in WATCH_DATA:
        raise ValueError(f"Unknown brand: {brand}")
    brand_data = WATCH_DATA[brand]
    if model not in brand_data["models"]:
        raise ValueError(f"Unknown model: {model}")
    return brand_data["models"][model]

def calculate_valuation(brand: str, model: str, condition: str, has_box_papers: bool, calibration_mode: str, currency: str) -> Dict[str, Any]:
    model_data = get_model_data(brand, model)
    base_value = model_data["base_value"]
    
    condition_mult = CONDITION_MULTIPLIERS.get(condition, 1.0)
    value = base_value * condition_mult
    
    if has_box_papers:
        value *= 1.12
    
    if calibration_mode == "ultra_conservative":
        low, mid, high = value * 0.75, value * 0.85, value * 0.92
    elif calibration_mode == "patient_retail":
        low, mid, high = value * 0.95, value * 1.10, value * 1.25
    else:
        low, mid, high = value * 0.88, value * 1.0, value * 1.12
    
    variance = random.uniform(-0.03, 0.03)
    low, mid, high = low * (1 + variance), mid * (1 + variance), high * (1 + variance)
    
    rate = CURRENCY_RATES.get(currency, 1.0)
    return {
        "low_estimate": round(low * rate, -2),
        "mid_estimate": round(mid * rate, -2),
        "high_estimate": round(high * rate, -2),
        "watch_image": model_data.get("image")
    }

def generate_price_history(brand: str, model: str, months: int = 12) -> List[Dict[str, Any]]:
    model_data = get_model_data(brand, model)
    base_value = model_data["base_value"]
    trend = WATCH_DATA[brand].get("trend", 0) / 12
    volatility = WATCH_DATA[brand].get("volatility", "medium")
    vol_factor = {"low": 0.02, "medium": 0.04, "high": 0.06}.get(volatility, 0.03)
    
    history = []
    current_value = base_value
    for i in range(months, 0, -1):
        date = datetime.now(timezone.utc) - timedelta(days=i * 30)
        noise = random.uniform(-vol_factor, vol_factor)
        monthly_change = (trend / 100) + noise
        current_value = current_value * (1 - monthly_change)
        history.append({"date": date.strftime("%Y-%m-%d"), "value": round(current_value, -2), "change_pct": round(monthly_change * 100, 2)})
    history.reverse()
    current_value = base_value
    for entry in reversed(history):
        entry["value"] = round(current_value, -2)
        current_value = current_value / (1 + (trend / 100) + random.uniform(-vol_factor/2, vol_factor/2))
    return history

# ============== AUTH ROUTES ==============
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=get_password_hash(user_data.password),
        provider="local"
    )
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(id=user.id, email=user.email, name=user.name, provider=user.provider)
    )

@api_router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user_doc = await db.users.find_one({"email": form_data.username})
    if not user_doc or not verify_password(form_data.password, user_doc.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user_doc["id"]})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(id=user_doc["id"], email=user_doc["email"], name=user_doc["name"], provider=user_doc.get("provider", "local"), avatar_url=user_doc.get("avatar_url"))
    )

@api_router.post("/auth/google", response_model=Token)
async def google_auth(auth_data: GoogleAuthRequest):
    """Authenticate with Google ID token"""
    try:
        # Verify Google token
        async with httpx.AsyncClient() as client:
            response = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={auth_data.credential}")
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google token")
            google_user = response.json()
        
        email = google_user.get("email")
        name = google_user.get("name", email.split("@")[0])
        picture = google_user.get("picture")
        
        # Check if user exists
        user_doc = await db.users.find_one({"email": email})
        
        if user_doc:
            # Update existing user
            await db.users.update_one(
                {"email": email},
                {"$set": {"avatar_url": picture, "name": name}}
            )
            user_id = user_doc["id"]
        else:
            # Create new user
            user = User(
                email=email,
                name=name,
                hashed_password="",
                provider="google",
                avatar_url=picture
            )
            user_doc = user.model_dump()
            user_doc['created_at'] = user_doc['created_at'].isoformat()
            await db.users.insert_one(user_doc)
            user_id = user.id
        
        access_token = create_access_token(data={"sub": user_id})
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(id=user_id, email=email, name=name, provider="google", avatar_url=picture)
        )
    except Exception as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(status_code=401, detail="Google authentication failed")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_required_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        provider=current_user.provider,
        avatar_url=current_user.avatar_url
    )

# ============== WATCH DATA ROUTES ==============
@api_router.get("/")
async def root():
    return {"message": "Crowntime AI API - Watch Market Intelligence"}

@api_router.get("/brands")
async def get_brands():
    brands_info = []
    for brand, data in WATCH_DATA.items():
        brands_info.append({
            "name": brand,
            "logo": data.get("logo"),
            "country": data.get("country"),
            "founded": data.get("founded"),
            "model_count": len(data["models"])
        })
    return {"brands": brands_info}

@api_router.get("/brands/{brand}/models")
async def get_brand_models(brand: str):
    if brand not in WATCH_DATA:
        raise HTTPException(status_code=404, detail=f"Brand '{brand}' not found")
    models_info = []
    for model_name, model_data in WATCH_DATA[brand]["models"].items():
        models_info.append({
            "name": model_name,
            "base_value": model_data["base_value"],
            "image": model_data.get("image"),
            "case_size": model_data.get("case_size"),
            "references": model_data.get("references", []),
            "description": model_data.get("description", "")
        })
    return {"models": models_info, "brand_info": {"logo": WATCH_DATA[brand].get("logo"), "country": WATCH_DATA[brand].get("country")}}

@api_router.get("/models/{brand}/{model}/references")
async def get_model_references(brand: str, model: str):
    """Get reference numbers for a specific model"""
    model_data = get_model_data(brand, model)
    return {
        "brand": brand,
        "model": model,
        "references": model_data.get("references", []),
        "case_size": model_data.get("case_size"),
        "movement": model_data.get("movement"),
        "water_resistance": model_data.get("water_resistance"),
        "description": model_data.get("description"),
        "image": model_data.get("image")
    }

@api_router.get("/options")
async def get_options():
    return {
        "brands": list(WATCH_DATA.keys()),
        "dial_colors": DIAL_COLORS,
        "bezel_types": BEZEL_TYPES,
        "bracelet_types": BRACELET_TYPES,
        "conditions": CONDITIONS,
        "currencies": list(CURRENCY_RATES.keys())
    }

@api_router.post("/valuate", response_model=WatchValuation)
async def valuate_watch(request: WatchValuationRequest, current_user: Optional[User] = Depends(get_current_user)):
    try:
        valuation_data = calculate_valuation(
            brand=request.brand, model=request.model, condition=request.condition,
            has_box_papers=request.has_box_papers, calibration_mode=request.calibration_mode,
            currency=request.currency
        )
        
        confidence = sum([20 if request.brand else 0, 20 if request.model else 0,
                         15 if request.dial_color else 0, 15 if request.bezel_type else 0,
                         15 if request.bracelet_type else 0, 15 if request.reference_number else 0])
        
        valuation = WatchValuation(
            brand=request.brand, model=request.model, dial_color=request.dial_color,
            bezel_type=request.bezel_type, bracelet_type=request.bracelet_type,
            reference_number=request.reference_number, condition=request.condition,
            has_box_papers=request.has_box_papers, calibration_mode=request.calibration_mode,
            currency=request.currency, confidence_score=confidence,
            watch_image=valuation_data.get("watch_image"),
            low_estimate=valuation_data["low_estimate"],
            mid_estimate=valuation_data["mid_estimate"],
            high_estimate=valuation_data["high_estimate"]
        )
        
        scan = RecentScan(
            user_id=current_user.id if current_user else None,
            brand=request.brand, model=request.model,
            valuation=valuation_data["mid_estimate"], currency=request.currency,
            watch_image=valuation_data.get("watch_image")
        )
        scan_doc = scan.model_dump()
        scan_doc['timestamp'] = scan_doc['timestamp'].isoformat()
        await db.recent_scans.insert_one(scan_doc)
        
        return valuation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/recent-scans", response_model=List[RecentScan])
async def get_recent_scans(limit: int = 10, current_user: Optional[User] = Depends(get_current_user)):
    query = {"user_id": current_user.id} if current_user else {}
    scans = await db.recent_scans.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    for scan in scans:
        if isinstance(scan.get('timestamp'), str):
            scan['timestamp'] = datetime.fromisoformat(scan['timestamp'])
    return scans

@api_router.delete("/recent-scans")
async def clear_recent_scans(current_user: Optional[User] = Depends(get_current_user)):
    query = {"user_id": current_user.id} if current_user else {}
    await db.recent_scans.delete_many(query)
    return {"message": "Recent scans cleared"}

# Portfolio routes
@api_router.get("/portfolio", response_model=List[PortfolioWatch])
async def get_portfolio(current_user: Optional[User] = Depends(get_current_user)):
    query = {"user_id": current_user.id} if current_user else {}
    watches = await db.portfolio.find(query, {"_id": 0}).sort("timestamp", -1).to_list(100)
    for watch in watches:
        if isinstance(watch.get('timestamp'), str):
            watch['timestamp'] = datetime.fromisoformat(watch['timestamp'])
    return watches

@api_router.post("/portfolio", response_model=PortfolioWatch)
async def add_to_portfolio(watch: PortfolioWatchCreate, current_user: Optional[User] = Depends(get_current_user)):
    try:
        valuation_data = calculate_valuation(
            brand=watch.brand, model=watch.model, condition=watch.condition,
            has_box_papers=watch.has_box_papers, calibration_mode="market_neutral", currency="USD"
        )
        current_valuation = valuation_data["mid_estimate"]
        watch_image = valuation_data.get("watch_image")
    except Exception:
        current_valuation = None
        watch_image = None
    
    portfolio_watch = PortfolioWatch(
        **watch.model_dump(),
        user_id=current_user.id if current_user else None,
        current_valuation=current_valuation,
        watch_image=watch_image
    )
    doc = portfolio_watch.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.portfolio.insert_one(doc)
    return portfolio_watch

@api_router.delete("/portfolio/{watch_id}")
async def remove_from_portfolio(watch_id: str, current_user: Optional[User] = Depends(get_current_user)):
    query = {"id": watch_id}
    if current_user:
        query["user_id"] = current_user.id
    result = await db.portfolio.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Watch not found")
    return {"message": "Watch removed from portfolio"}

@api_router.get("/portfolio/summary")
async def get_portfolio_summary(current_user: Optional[User] = Depends(get_current_user)):
    query = {"user_id": current_user.id} if current_user else {}
    watches = await db.portfolio.find(query, {"_id": 0}).to_list(100)
    total_value = sum(w.get('current_valuation', 0) or 0 for w in watches)
    total_cost = sum(w.get('purchase_price', 0) or 0 for w in watches)
    return {
        "total_watches": len(watches),
        "total_value": total_value,
        "total_cost": total_cost,
        "total_gain_loss": total_value - total_cost if total_cost > 0 else 0,
        "gain_loss_percentage": ((total_value - total_cost) / total_cost * 100) if total_cost > 0 else 0
    }

@api_router.get("/compare")
async def compare_watches(brand1: str, model1: str, brand2: str, model2: str, currency: str = "USD"):
    try:
        val1 = calculate_valuation(brand1, model1, "Very Good", True, "market_neutral", currency)
        val2 = calculate_valuation(brand2, model2, "Very Good", True, "market_neutral", currency)
        return {
            "watch1": {"brand": brand1, "model": model1, "image": val1.get("watch_image"), **{k: v for k, v in val1.items() if k != "watch_image"}},
            "watch2": {"brand": brand2, "model": model2, "image": val2.get("watch_image"), **{k: v for k, v in val2.items() if k != "watch_image"}},
            "difference": val1["mid_estimate"] - val2["mid_estimate"],
            "currency": currency
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/analyze-image", response_model=ImageAnalysisResult)
async def analyze_watch_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        media_type = file.content_type or "image/jpeg"
        
        brands_list = ", ".join(WATCH_DATA.keys())
        
        # Use emergentintegrations LlmChat for image analysis
        chat = LlmChat(
            api_key=EMERGENT_API_KEY,
            session_id=f"watch-analysis-{uuid.uuid4()}",
            system_message=f"""You are an expert luxury watch appraiser. Analyze watch images and identify:
1. Brand (from: {brands_list})
2. Model family
3. Dial color
4. Bezel type
5. Bracelet type
6. Reference number (if visible)
7. Condition
Always respond in valid JSON format: {{"brand": "", "model": "", "dial_color": "", "bezel_type": "", "bracelet_type": "", "reference_number": "", "condition": "", "confidence": 0.0, "description": ""}}"""
        )
        
        # Create file content for image
        file_content = FileContent(content_type=media_type, file_content_base64=base64_image)
        
        # Send message with image
        response_text = await chat.send_message(
            UserMessage(
                text="Analyze this watch image and identify all details. Return only valid JSON.",
                file_contents=[file_content]
            )
        )
        
        # Parse the response
        result_text = response_text
        try:
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1].split("```")[0]
            result_data = json.loads(result_text.strip())
        except json.JSONDecodeError:
            result_data = {"description": result_text, "confidence": 0.5}
        
        return ImageAnalysisResult(**{k: result_data.get(k) for k in ["brand", "model", "dial_color", "bezel_type", "bracelet_type", "reference_number", "condition", "confidence", "description"]})
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@api_router.get("/price-history/{brand}/{model}")
async def get_price_history(brand: str, model: str, months: int = 12):
    model_data = get_model_data(brand, model)
    history = generate_price_history(brand, model, months)
    return {
        "brand": brand, "model": model,
        "current_price": model_data["base_value"],
        "image": model_data.get("image"),
        "history": history,
        "trend": WATCH_DATA[brand].get("trend", 0),
        "volatility": WATCH_DATA[brand].get("volatility", "medium")
    }

@api_router.get("/market-trends")
async def get_market_trends():
    trends = []
    for brand, data in WATCH_DATA.items():
        models = data["models"]
        avg_value = sum(m["base_value"] for m in models.values()) / len(models)
        top_model = max(models.items(), key=lambda x: x[1]["base_value"])
        trends.append({
            "brand": brand, "logo": data.get("logo"),
            "average_value": round(avg_value, -2),
            "trend_yoy": data.get("trend", 0),
            "volatility": data.get("volatility", "medium"),
            "top_model": top_model[0],
            "top_model_value": top_model[1]["base_value"],
            "top_model_image": top_model[1].get("image")
        })
    trends.sort(key=lambda x: x["trend_yoy"], reverse=True)
    total_avg = sum(t["average_value"] for t in trends) / len(trends)
    avg_trend = sum(t["trend_yoy"] for t in trends) / len(trends)
    return {
        "brands": trends,
        "market_summary": {
            "average_brand_value": round(total_avg, -2),
            "average_trend_yoy": round(avg_trend, 2),
            "top_performer": trends[0]["brand"] if trends else None,
            "most_stable": min(trends, key=lambda x: abs(x["trend_yoy"]))["brand"] if trends else None,
            "total_brands": len(trends)
        }
    }

@api_router.get("/portfolio/export")
async def export_portfolio(format: str = "csv", current_user: Optional[User] = Depends(get_current_user)):
    query = {"user_id": current_user.id} if current_user else {}
    watches = await db.portfolio.find(query, {"_id": 0}).to_list(100)
    if format == "json":
        return {"portfolio": watches}
    csv_data = "Brand,Model,Condition,Box & Papers,Purchase Price,Current Value,Purchase Date,Notes\n"
    for w in watches:
        csv_data += f"{w.get('brand','')},{w.get('model','')},{w.get('condition','')},{'Yes' if w.get('has_box_papers') else 'No'},{w.get('purchase_price','')},{w.get('current_valuation','')},{w.get('purchase_date','')},\"{w.get('notes','')}\"\n"
    return StreamingResponse(io.StringIO(csv_data), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=portfolio.csv"})

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
