"""
Water Quality Monitor - FastAPI Backend
Milestone 2: Real-Time Water Data & Maps
"""

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Query, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Enum, ForeignKey, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import func
from sqlalchemy import Boolean
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import enum
import httpx
import os
import shutil
import csv
from decimal import Decimal

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database Configuration - PostgreSQL only
db_url = os.environ.get("DATABASE_URL", "postgresql://postgres:3906DW82@localhost:5432/watermonitor")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ensure Neon requires SSL mode
if "neon.tech" in db_url and "sslmode=require" not in db_url:
    if "?" in db_url:
        db_url += "&sslmode=require"
    else:
        db_url += "?sslmode=require"

DATABASE_URL = db_url

# Create engine and session with connection resiliency for serverless databases
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # Verifies connection is alive before using it
    pool_recycle=1800,        # Recycles connections after 30 mins
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
import bcrypt
security = HTTPBearer()

# Initialize FastAPI app
app = FastAPI(title="Water Quality Monitor API", version="2.0.0")

# CORS Configuration - Allow frontend requests
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    origins = [frontend_url]
else:
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"  # Fallback wildcard for Vercel preview URLs if FRONTEND_URL is not explicitly set
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ENUMS ====================

class UserRole(str, enum.Enum):
    CITIZEN = "citizen"
    NGO = "ngo"
    AUTHORITY = "authority"
    ADMIN = "admin"

class ReportStatus(str, enum.Enum):
    PENDING_NGO = "pending_ngo"
    PENDING_ADMIN = "pending_admin"
    PENDING_AUTHORITY = "pending_authority"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class ParameterType(str, enum.Enum):
    PH = "pH"
    TURBIDITY = "turbidity"
    DO = "DO"
    LEAD = "lead"
    ARSENIC = "arsenic"
    E_COLI = "e_coli"
    IRON = "iron"
    TEMPERATURE = "temperature"

class SearchParameter(str, enum.Enum):
    REGION = "Region"
    COUNTRY = "Country"
    STATE = "State"
    WATER_STATION_NAME = "Water Station Name"
    WATER_STATION_ID = "Water Station ID"

# ==================== DATABASE MODELS ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(200), nullable=False)
    role = Column(String(50), default=UserRole.CITIZEN.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    reports = relationship("Report", back_populates="user")
    searches = relationship("Search", back_populates="user")

# class WaterStation(Base):
#     __tablename__ = "water_stations"
    
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(100), nullable=False)
#     location = Column(String(200), nullable=False)
#     region = Column(String(100))
#     state = Column(String(100))
#     country = Column(String(100), default="India")
#     latitude = Column(Numeric(10, 8), nullable=False)
#     longitude = Column(Numeric(11, 8), nullable=False)
#     managed_by = Column(String(100))
#     created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
#     # Relationships
#     readings = relationship("StationReading", back_populates="station", cascade="all, delete-orphan")
class WaterStation(Base):
    __tablename__ = "water_stations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)   # increased
    location = Column(String(500), nullable=False)  # increased
    region = Column(String(255))   # increased
    state = Column(String(255))    # increased
    country = Column(String(100), default="India")
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    managed_by = Column(String(255))  # increased
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    readings = relationship(
        "StationReading",
        back_populates="station",
        cascade="all, delete-orphan"
    )
class StationReading(Base):
    __tablename__ = "station_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("water_stations.id"), nullable=False)
    parameter = Column(String(50), nullable=False)  # Using string instead of enum for flexibility
    value = Column(Numeric(10, 4), nullable=False)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    station = relationship("WaterStation", back_populates="readings")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    photo_url = Column(String(500))
    location = Column(String(200))
    description = Column(Text)
    water_source = Column(String(100))
    status = Column(String(50), default=ReportStatus.PENDING_NGO.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="reports")

class Search(Base):
    __tablename__ = "searches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parameter = Column(String(50), nullable=False)
    value = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="searches")

# class Alert(Base):
#     __tablename__ = "alerts"
    
#     id = Column(Integer, primary_key=True, index=True)
#     message = Column(String(255), nullable=False)
#     severity = Column(String(50))  # 'Critical' or 'Warning'
#     timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
#     is_resolved = Column(Column, default=False)
class AlertType(str, enum.Enum):
    BOIL_NOTICE = "boil_notice"
    CONTAMINATION = "contamination"
    OUTAGE = "outage"

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("water_stations.id"), nullable=True)
    type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    location = Column(String(200))
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_resolved = Column(Boolean, default=False)
    source = Column(String(50), default="manual")  # "manual" or "predictive"

class CollaborationStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class Collaboration(Base):
    __tablename__ = "collaborations"
    
    id = Column(Integer, primary_key=True, index=True)
    ngo_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ngo_name = Column(String(150), nullable=False)
    project_name = Column(String(120), nullable=False)
    contact_email = Column(String(150), nullable=False)
    status = Column(String(50), default=CollaborationStatus.ACTIVE.value)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# Create all tables
# Base.metadata.create_all(bind=engine)
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


# ==================== PYDANTIC SCHEMAS ====================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "citizen"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class WaterStationCreate(BaseModel):
    name: str
    location: str
    region: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    latitude: float
    longitude: float
    managed_by: Optional[str] = None

class WaterStationResponse(BaseModel):
    id: int
    name: str
    location: str
    region: Optional[str]
    state: Optional[str]
    country: str
    latitude: float
    longitude: float
    managed_by: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class StationWithStatus(BaseModel):
    id: int
    name: str
    location: str
    region: Optional[str]
    state: Optional[str]
    country: str
    latitude: float
    longitude: float
    managed_by: Optional[str]
    created_at: datetime
    wqi: Optional[int]
    status: str

    class Config:
        from_attributes = True

class StationReadingCreate(BaseModel):
    parameter: str
    value: float

class StationReadingResponse(BaseModel):
    id: int
    station_id: int
    parameter: str
    value: float
    recorded_at: datetime
    
    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    location: str
    description: str
    water_source: str

class ReportResponse(BaseModel):
    id: int
    user_id: int
    photo_url: Optional[str]
    location: str
    description: str
    water_source: str
    status: str
    created_at: datetime
    user: Optional[UserResponse]
    
    class Config:
        from_attributes = True

class SearchCreate(BaseModel):
    parameter: str
    value: str

class SearchResponse(BaseModel):
    id: int
    user_id: int
    parameter: str
    value: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AlertCreate(BaseModel):
    type: str
    message: str
    location: Optional[str] = None

class AlertUpdate(BaseModel):
    is_resolved: Optional[bool] = None
    message: Optional[str] = None
    location: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    station_id: Optional[int] = None
    type: str
    message: str
    location: Optional[str]
    issued_at: datetime
    is_resolved: bool
    source: Optional[str] = "manual"
    
    class Config:
        from_attributes = True

class CollaborationCreate(BaseModel):
    project_name: str
    ngo_name: str
    contact_email: EmailStr

class CollaborationOut(BaseModel):
    id: int
    ngo_user_id: int
    ngo_name: str
    project_name: str
    contact_email: str
    status: str
    created_at: datetime
    report_count: int = 0
    
    class Config:
        from_attributes = True

class UserRoleUpdate(BaseModel):
    role: str

# ==================== HELPER FUNCTIONS ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password: str, hashed_password: str):
    try:
        return bcrypt.checkpw(plain_password[:72].encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str):
    return bcrypt.hashpw(password[:72].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user

def require_role(roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Calculate WQI (Water Quality Index) for a station
def calculate_station_wqi(readings: List[StationReading]):
    """Calculate Water Quality Index based on available readings"""
    params = {}
    for r in readings:
        params[r.parameter] = float(r.value)
    
    if not params:
        return None
    
    # Simple WQI calculation (can be enhanced)
    wqi = 85  # Default good
    
    if "pH" in params:
        ph = params["pH"]
        if 6.5 <= ph <= 8.5:
            wqi = min(wqi, 100)
        elif 6.0 <= ph < 6.5 or 8.5 < ph <= 9.0:
            wqi = min(wqi, 80)
        else:
            wqi = min(wqi, 50)
    
    if "turbidity" in params:
        turb = params["turbidity"]
        if turb <= 1:
            wqi = min(wqi, 100)
        elif turb <= 5:
            wqi = min(wqi, 80)
        else:
            wqi = min(wqi, 60)
    
    if "DO" in params:
        do = params["DO"]
        if do >= 6:
            wqi = min(wqi, 100)
        elif do >= 4:
            wqi = min(wqi, 80)
        else:
            wqi = min(wqi, 60)
    
    return wqi

def get_station_status(wqi):
    if wqi is None:
        return "Unknown"
    if wqi >= 90:
        return "Excellent"
    elif wqi >= 80:
        return "Good"
    elif wqi >= 60:
        return "Fair"
    else:
        return "Poor"

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.put("/api/auth/profile", response_model=UserResponse)
def update_profile(
    name: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if name:
        current_user.name = name
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/api/auth/change-password")
def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not verify_password(old_password, current_user.password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.password = get_password_hash(new_password)
    db.commit()
    return {"message": "Password updated successfully"}


async def fetch_usgs_data(state_code: str):
    """Fetch live data from USGS for a given state"""
    try:
        url = f"https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd={state_code}&parameterCd=00010,00400,00300,00095&siteType=ST&siteStatus=active"
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(url, timeout=30.0)
            data = response.json()
            
            sites_data = {}
            for ts in data.get('value', {}).get('timeSeries', []):
                site_info = ts.get('sourceInfo', {})
                site_code = site_info.get('siteCode', [{}])[0].get('value', '')
                if not site_code: continue
                
                if site_code not in sites_data:
                    lat = site_info.get('geoLocation', {}).get('geogLocation', {}).get('latitude', 0.0)
                    lon = site_info.get('geoLocation', {}).get('geogLocation', {}).get('longitude', 0.0)
                    sites_data[site_code] = {
                        'id': hash(site_code) % (10**8),
                        'name': site_info.get('siteName', f'USGS-{site_code}'),
                        'location': site_info.get('siteName', f'USGS-{site_code}'),
                        'region': state_code.upper(),
                        'state': state_code.upper(),
                        'country': 'USA',
                        'latitude': lat,
                        'longitude': lon,
                        'managed_by': 'USGS',
                        'created_at': datetime.now(timezone.utc),
                        'readings': []
                    }
                
                param_code = ts.get('variable', {}).get('variableCode', [{}])[0].get('value')
                values = ts.get('values', [{}])[0].get('value', [])
                if values:
                    val = float(values[0].get('value', 0.0))
                    param_name = None
                    if param_code == '00010': param_name = 'temperature'
                    elif param_code == '00400': param_name = 'pH'
                    elif param_code == '00300': param_name = 'DO'
                    elif param_code == '00095': param_name = 'conductivity'
                    
                    if param_name:
                        class MockReading:
                            def __init__(self, p, v):
                                self.parameter = p
                                self.value = v
                        sites_data[site_code]['readings'].append(MockReading(param_name, val))
            
            results = []
            for site_code, s_data in sites_data.items():
                wqi = calculate_station_wqi(s_data['readings'])
                status = get_station_status(wqi)
                
                results.append({
                    "id": s_data['id'],
                    "name": s_data['name'],
                    "location": s_data['location'],
                    "region": s_data['region'],
                    "state": s_data['state'],
                    "country": s_data['country'],
                    "latitude": float(s_data['latitude']),
                    "longitude": float(s_data['longitude']),
                    "managed_by": s_data['managed_by'],
                    "created_at": s_data['created_at'],
                    "wqi": wqi,
                    "status": status
                })
                
            return results
    except Exception as e:
        print(f"Error fetching USGS data: {e}")
        return []

async def _fetch_usgs_alerts_for_state(state_code: str):
    """Fetch USGS alerts for a single state (used concurrently)"""
    alerts = []
    try:
        url = f"https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd={state_code}&parameterCd=00010,00400,00300,00095&siteType=ST&siteStatus=active"
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(url, timeout=10.0)
            data = response.json()
            
            for ts in data.get('value', {}).get('timeSeries', []):
                site_info = ts.get('sourceInfo', {})
                site_name = site_info.get('siteName', 'Unknown USGS Site')
                site_code_val = site_info.get('siteCode', [{}])[0].get('value', '')
                
                param_code = ts.get('variable', {}).get('variableCode', [{}])[0].get('value')
                values = ts.get('values', [{}])[0].get('value', [])
                
                if not values:
                    continue
                
                val = float(values[0].get('value', 0.0))
                timestamp = values[0].get('dateTime', datetime.now(timezone.utc).isoformat())
                
                # pH check (param 00400)
                if param_code == '00400' and (val < 6.5 or val > 8.5):
                    alert_id = -(abs(hash(f"{site_code_val}_ph_{timestamp}")) % (10**8))
                    alerts.append({
                        "id": alert_id,
                        "type": AlertType.CONTAMINATION.value,
                        "message": f"pH Level unsafe at {site_name} ({state_code.upper()}): {val}",
                        "location": f"{site_name}, {state_code.upper()}, USA",
                        "issued_at": timestamp,
                        "is_resolved": False
                    })
                
                # Temperature check (param 00010)
                if param_code == '00010':
                    if val > 100:
                        alert_id = -(abs(hash(f"{site_code_val}_temp_boil_{timestamp}")) % (10**8))
                        alerts.append({
                            "id": alert_id,
                            "type": AlertType.BOIL_NOTICE.value,
                            "message": f"Extreme Temperature at {site_name} ({state_code.upper()}): {val}°C. Boil notice issued.",
                            "location": f"{site_name}, {state_code.upper()}, USA",
                            "issued_at": timestamp,
                            "is_resolved": False
                        })
                    elif val > 35:
                        alert_id = -(abs(hash(f"{site_code_val}_temp_{timestamp}")) % (10**8))
                        alerts.append({
                            "id": alert_id,
                            "type": AlertType.CONTAMINATION.value,
                            "message": f"High Temperature at {site_name} ({state_code.upper()}): {val}°C",
                            "location": f"{site_name}, {state_code.upper()}, USA",
                            "issued_at": timestamp,
                            "is_resolved": False
                        })
                
                # Dissolved Oxygen check (param 00300)
                if param_code == '00300' and val < 4.0:
                    alert_id = -(abs(hash(f"{site_code_val}_do_{timestamp}")) % (10**8))
                    alerts.append({
                        "id": alert_id,
                        "type": AlertType.CONTAMINATION.value,
                        "message": f"Low Dissolved Oxygen at {site_name} ({state_code.upper()}): {val} mg/L",
                        "location": f"{site_name}, {state_code.upper()}, USA",
                        "issued_at": timestamp,
                        "is_resolved": False
                    })
                
                # Conductivity check (param 00095)
                if param_code == '00095' and val > 1500:
                    alert_id = -(abs(hash(f"{site_code_val}_cond_{timestamp}")) % (10**8))
                    alerts.append({
                        "id": alert_id,
                        "type": AlertType.CONTAMINATION.value,
                        "message": f"High Conductivity at {site_name} ({state_code.upper()}): {val} µS/cm",
                        "location": f"{site_name}, {state_code.upper()}, USA",
                        "issued_at": timestamp,
                        "is_resolved": False
                    })
    except Exception as e:
        print(f"Error fetching USGS alerts for {state_code}: {e}")
    
    return alerts

async def fetch_usgs_alerts(state_codes=None):
    """Fetch live USGS data concurrently for all states and generate threshold alerts"""
    import asyncio
    if state_codes is None:
        state_codes = ['ca', 'tx', 'ny', 'fl', 'co', 'il', 'pa', 'oh']
    
    # Fetch all states concurrently instead of sequentially
    tasks = [_fetch_usgs_alerts_for_state(sc) for sc in state_codes]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_alerts = []
    for result in results:
        if isinstance(result, list):
            all_alerts.extend(result)
    
    return all_alerts

@app.get("/api/stations", response_model=List[StationWithStatus])
async def get_stations(
    region: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = "India",
    search: Optional[str] = None,
    refresh: bool = False,
    db: Session = Depends(get_db)
):
    if country and country.upper() == "USA":
        state_code = (state or 'CA').lower()
        if len(state_code) > 2:
            state_code = state_code[:2]
        
        usgs_stations = await fetch_usgs_data(state_code)
        
        if search:
            usgs_stations = [s for s in usgs_stations if search.lower() in s['name'].lower()]
            
        return usgs_stations

    station_count = db.query(WaterStation).count()

    # if refresh or station_count == 0:
    #     gov_stations = await fetch_government_water_stations()
    #     if gov_stations:
    #         sync_stations_to_db(gov_stations, db)
    #     else:
    #         csv_stations = load_stations_from_csv()
    #         if csv_stations:
    #             sync_stations_to_db(csv_stations, db)

    from sqlalchemy.orm import joinedload
    query = db.query(WaterStation).options(joinedload(WaterStation.readings))

    if region and region.strip() and region.lower() != "all":
        query = query.filter(WaterStation.region.ilike(f"%{region}%"))
    if state and state.strip() and state.lower() != "all":
        query = query.filter(WaterStation.state.ilike(f"%{state}%"))
    if search and search.strip():
        query = query.filter(
            (WaterStation.name.ilike(f"%{search}%")) |
            (WaterStation.location.ilike(f"%{search}%"))
        )

    stations = query.all()

    result = []

    for station in stations:
        # Sort loaded readings in memory
        readings = sorted(station.readings, key=lambda x: x.recorded_at, reverse=True)[:20]

        wqi = calculate_station_wqi(readings)
        status = get_station_status(wqi)

        result.append({
            "id": station.id,
            "name": station.name,
            "location": station.location,
            "region": station.region,
            "state": station.state,
            "country": station.country,
            "latitude": float(station.latitude),
            "longitude": float(station.longitude),
            "managed_by": station.managed_by,
            "created_at": station.created_at,
            "wqi": wqi,
            "status": status
        })

    return result
    

# ==================== REMOTE SEEDING ENDPOINT ====================
from fastapi import BackgroundTasks

def run_seed_background():
    import csv, os
    from sqlalchemy import text
    
    db = SessionLocal()
    try:
        current_count = db.query(WaterStation).count()
        if current_count == 1991:
            print("Database already perfectly seeded.")
            return
        elif current_count > 0:
            db.execute(text("TRUNCATE TABLE water_stations CASCADE;"))
            db.commit()
            
        csv_path = os.path.join(os.path.dirname(__file__), "water_dataX.csv")
        if not os.path.exists(csv_path):
            print(f"CSV file not found at {csv_path}")
            return
            
        stations_added = 0
        with open(csv_path, mode='r', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            for index, row in enumerate(reader):
                try: ph_val = float(row.get('PH', 7.0))
                except: ph_val = 7.0
                
                try: temp_val = float(row.get('Temp', 25.0))
                except: temp_val = 25.0
                
                try: turb_val = float(row.get('B.O.D.', 1.0))
                except: turb_val = 1.0

                import random
                station = WaterStation(
                    name=f"Station {row.get('STATION CODE', 'Unknown')}"[:250],
                    location=str(row.get('LOCATIONS', 'Unknown'))[:490],
                    state=str(row.get('STATE', 'Unknown'))[:250],
                    country="India",
                    latitude=random.uniform(8.4, 37.6),
                    longitude=random.uniform(68.7, 97.2),
                    managed_by="Government"
                )
                db.add(station)
                db.flush()
                
                readings = [
                    StationReading(station_id=station.id, parameter="pH", value=ph_val),
                    StationReading(station_id=station.id, parameter="temperature", value=temp_val),
                    StationReading(station_id=station.id, parameter="turbidity", value=turb_val),
                ]
                db.add_all(readings)
                
                # Mock auto-alerts for bad water quality
                if ph_val < 6.5 or ph_val > 8.5 or turb_val > 5.0:
                    alert = Alert(
                        station_id=station.id,
                        type=AlertType.CONTAMINATION.value if turb_val > 5.0 else "water_quality",
                        message=f"Critical water quality parameters detected: pH={ph_val}, Turbidity={turb_val}",
                        location=station.location,
                        source="predictive"
                    )
                    db.add(alert)
                    
                stations_added += 1
                
            db.commit()
        print(f"Successfully background injected {stations_added} stations!")
    except Exception as e:
        print(f"Background seed failed: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/api/system/seed_data")
def seed_database_render(background_tasks: BackgroundTasks):
    """
    Seeds the Neon Database directly from the Render server.
    This bypasses local network firewalls AND Render's 60s timeout!
    """
    background_tasks.add_task(run_seed_background)
    return {"message": "Data injection started in the background! Please wait 2-3 minutes for the 1,991 stations to finish loading, then refresh your dashboard."}

# ✅ FIX: STATIC ROUTE MUST COME BEFORE DYNAMIC ROUTE
@app.get("/api/stations/count")
def get_stations_count(db: Session = Depends(get_db)):
    count = db.query(WaterStation).count()
    return {"total_stations": count}


# DYNAMIC ROUTE AFTER STATIC ROUTE
@app.get("/api/stations/{station_id}", response_model=WaterStationResponse)
def get_station(station_id: int, db: Session = Depends(get_db)):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station


@app.post("/api/stations", response_model=WaterStationResponse)
def create_station(
    station: WaterStationCreate,
    current_user: User = Depends(require_role(["admin", "authority"])),
    db: Session = Depends(get_db)
):
    db_station = WaterStation(**station.dict())
    db.add(db_station)
    db.commit()
    db.refresh(db_station)
    return db_station


@app.put("/api/stations/{station_id}", response_model=WaterStationResponse)
def update_station(
    station_id: int,
    station: WaterStationCreate,
    current_user: User = Depends(require_role(["admin", "authority"])),
    db: Session = Depends(get_db)
):
    db_station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not db_station:
        raise HTTPException(status_code=404, detail="Station not found")

    for key, value in station.dict().items():
        setattr(db_station, key, value)

    db.commit()
    db.refresh(db_station)
    return db_station


@app.delete("/api/stations/{station_id}")
def delete_station(
    station_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    db_station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not db_station:
        raise HTTPException(status_code=404, detail="Station not found")

    db.delete(db_station)
    db.commit()
    return {"message": "Station deleted successfully"}

# ==================== STATION READINGS ENDPOINTS ====================

@app.get("/api/stations/{station_id}/readings")
def get_station_readings(
    station_id: int,
    parameter: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    query = db.query(StationReading).filter(StationReading.station_id == station_id)
    
    if parameter:
        query = query.filter(StationReading.parameter == parameter)
    
    readings = query.order_by(StationReading.recorded_at.desc()).limit(limit).all()
    return readings

@app.get("/api/stations/{station_id}/readings/history")
def get_station_readings_history(
    station_id: int,
    period: str = "daily",  # hourly, daily, weekly, monthly, yearly
    parameter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    # Calculate time range based on period
    now = datetime.now(timezone.utc)
    if period == "hourly":
        start_time = now - timedelta(hours=24)
    elif period == "daily":
        start_time = now - timedelta(days=7)
    elif period == "weekly":
        start_time = now - timedelta(weeks=4)
    elif period == "monthly":
        start_time = now - timedelta(days=365)
    elif period == "yearly":
        start_time = now - timedelta(days=365*5)
    else:
        start_time = now - timedelta(days=7)
    
    query = db.query(StationReading).filter(
        StationReading.station_id == station_id,
        StationReading.recorded_at >= start_time
    )
    
    if parameter:
        query = query.filter(StationReading.parameter == parameter)
    
    readings = query.order_by(StationReading.recorded_at.asc()).all()
    
    # Format for chart data
    chart_data = []
    for r in readings:
        chart_data.append({
            "time": r.recorded_at.strftime("%H:%M" if period == "hourly" else "%Y-%m-%d"),
            "parameter": r.parameter,
            "value": float(r.value)
        })
    
    return {
        "station_id": station_id,
        "period": period,
        "readings": readings,
        "chart_data": chart_data
    }

@app.get("/api/stations/{station_id}/current")
def get_station_current_readings(station_id: int, db: Session = Depends(get_db)):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    # Get latest reading for each parameter
    parameters = ["pH", "turbidity", "DO", "lead", "arsenic", "e_coli", "iron", "temperature"]
    current_readings = {}
    
    for param in parameters:
        reading = db.query(StationReading).filter(
            StationReading.station_id == station_id,
            StationReading.parameter == param
        ).order_by(StationReading.recorded_at.desc()).first()
        
        if reading:
            current_readings[param] = {
                "value": float(reading.value),
                "recorded_at": reading.recorded_at
            }
    
    # Calculate WQI
    all_readings = db.query(StationReading).filter(
        StationReading.station_id == station_id
    ).order_by(StationReading.recorded_at.desc()).limit(50).all()
    
    wqi = calculate_station_wqi(all_readings)
    status = get_station_status(wqi)
    
    return {
        "station": station,
        "current_readings": current_readings,
        "wqi": wqi,
        "status": status
    }

@app.post("/api/stations/{station_id}/readings")
def create_reading(
    station_id: int,
    reading: StationReadingCreate,
    current_user: User = Depends(require_role(["admin", "authority", "ngo", "citizen"])),
    db: Session = Depends(get_db)
):
    station = db.query(WaterStation).filter(WaterStation.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    db_reading = StationReading(
        station_id=station_id,
        parameter=reading.parameter,
        value=reading.value
    )
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    
    # Predictive Analytics integration
    from services.predictive_engine import predict_future_value
    prediction = predict_future_value(db, station_id, reading.parameter, reading.value)
    
    if prediction.get("alert_flag"):
        alert_type = AlertType.CONTAMINATION.value
        # Additional context logic
        if "temperature" in reading.parameter.lower() and float(reading.value) > 100:
            alert_type = AlertType.BOIL_NOTICE.value
            
        alert = Alert(
            type=alert_type,
            message=prediction["alert_message"],
            location=station.location,
            source="predictive"
        )
        db.add(alert)
        db.commit()
        
    return {
        "id": getattr(db_reading, 'id', 0),
        "station_id": station_id,
        "parameter": reading.parameter,
        "value": reading.value,
        "recorded_at": getattr(db_reading, 'recorded_at', None),
        "current_value": reading.value,
        "predicted_value": prediction.get("predicted_value"),
        "confidence": prediction.get("confidence_score"),
        "alert": prediction.get("alert_message", "")
    }






"""
Water Quality Monitor - FastAPI Backend
Milestone 2: Real-Time Water Data & Maps
"""



# ==================================================
# EXTRA ENDPOINTS REMAINING FROM SECOND PART
# ==================================================

def get_latest_readings(db: Session = Depends(get_db)):
    """Get latest readings from all stations"""
    stations = db.query(WaterStation).all()
    result = []
    
    for station in stations:
        readings = db.query(StationReading).filter(
            StationReading.station_id == station.id
        ).order_by(StationReading.recorded_at.desc()).limit(10).all()
        
        if readings:
            wqi = calculate_station_wqi(readings)
            result.append({
                "station": station,
                "latest_readings": readings,
                "wqi": wqi,
                "status": get_station_status(wqi)
            })
    
    return result


def search_stations(
    q: Optional[str] = None,
    region: Optional[str] = None,
    state: Optional[str] = None,
    station_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(WaterStation)
    
    if q:
        query = query.filter(
            (WaterStation.name.ilike(f"%{q}%")) |
            (WaterStation.location.ilike(f"%{q}%"))
        )
    
    if region:
        query = query.filter(WaterStation.region.ilike(f"%{region}%"))
    
    if state:
        query = query.filter(WaterStation.state.ilike(f"%{state}%"))
    
    if station_id:
        query = query.filter(WaterStation.id == station_id)
    
    stations = query.all()
    
    # Get current status for each station
    results = []
    for station in stations:
        readings = db.query(StationReading).filter(
            StationReading.station_id == station.id
        ).order_by(StationReading.recorded_at.desc()).limit(10).all()
        
        wqi = calculate_station_wqi(readings)
        results.append({
            "station": station,
            "wqi": wqi,
            "status": get_station_status(wqi)
        })
    
    return results


def log_search(
    search: SearchCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_search = Search(
        user_id=current_user.id,
        parameter=search.parameter,
        value=search.value
    )
    db.add(db_search)
    db.commit()
    db.refresh(db_search)
    return db_search


def get_search_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    searches = db.query(Search).filter(
        Search.user_id == current_user.id
    ).order_by(Search.created_at.desc()).limit(20).all()
    return searches


def get_my_reports(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    reports = db.query(Report).filter(
        Report.user_id == current_user.id
    ).order_by(Report.created_at.desc()).all()
    return reports


def get_all_reports(
    current_user: User = Depends(require_role(["admin", "ngo", "authority"])),
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    
    if status_filter:
        query = query.filter(Report.status == status_filter)
    
    reports = query.order_by(Report.created_at.desc()).all()
    return reports


def get_report(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Check if user owns the report or has admin/ngo role
    if report.user_id != current_user.id and current_user.role not in ["admin", "ngo", "authority"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this report")
    
    return report


def create_report(
    report: ReportCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_report = Report(
        user_id=current_user.id,
        location=report.location,
        description=report.description,
        water_source=report.water_source,
        status=ReportStatus.PENDING_NGO.value
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def upload_report_photo(
    report_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Save file
    upload_dir = "uploads/reports"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = f"{upload_dir}/{report_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    report.photo_url = f"/{file_path}"
    db.commit()
    
    return {"photo_url": report.photo_url}


def update_report_status(
    report_id: int,
    status: str,
    current_user: User = Depends(require_role(["admin", "ngo", "authority"])),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    role = current_user.role
    current_status = report.status
    
    valid_transition = False
    if role == "ngo" and current_status == ReportStatus.PENDING_NGO.value:
        if status in [ReportStatus.RESOLVED.value, ReportStatus.PENDING_ADMIN.value]:
            valid_transition = True
    elif role == "admin" and current_status == ReportStatus.PENDING_ADMIN.value:
        if status in [ReportStatus.REJECTED.value, ReportStatus.PENDING_AUTHORITY.value]:
            valid_transition = True
    elif role == "authority" and current_status == ReportStatus.PENDING_AUTHORITY.value:
        if status == ReportStatus.RESOLVED.value:
            valid_transition = True
            
    if not valid_transition:
        raise HTTPException(status_code=400, detail="Invalid status transition for user role")
    
    report.status = status
    db.commit()
    db.refresh(report)
    return report


@app.get("/api/alerts")
async def get_alerts(
    type: Optional[str] = None,
    country: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    try:
        results = []

        # ---------------- INDIA (DB alerts) ----------------
        if not country or country.upper() == "INDIA":
            query = db.query(Alert)

            if type:
                query = query.filter(Alert.type == type)

            db_alerts = query.order_by(Alert.issued_at.desc()).limit(limit).all()

            db_alerts = [
                {
                    "id": a.id,
                    "type": a.type,
                    "message": a.message,
                    "location": a.location,
                    "issued_at": a.issued_at,
                    "is_resolved": a.is_resolved,
                    "source": a.source,
                    "country": "India"
                }
                for a in db_alerts
            ]

            results.extend(db_alerts)

        # ---------------- USA (API alerts) ----------------
        if not country or country.upper() == "USA":
            usgs_alerts = await fetch_usgs_alerts()

            for a in usgs_alerts:
                a["country"] = "USA"
                a["source"] = "api"

                # 🔥 Ensure issued_at exists
                if "issued_at" not in a or not a["issued_at"]:
                    a["issued_at"] = datetime.now(timezone.utc)

            results.extend(usgs_alerts)

        # ---------------- FIX DATETIME ISSUE ----------------
        def parse_date(x):
            val = x.get("issued_at")

            if not val:
                return datetime.min.replace(tzinfo=timezone.utc)

            # Convert string → datetime
            if isinstance(val, str):
                try:
                    dt = datetime.fromisoformat(val.replace("Z", "+00:00"))
                except:
                    return datetime.min.replace(tzinfo=timezone.utc)
            else:
                dt = val

            # 🔥 Fix naive vs aware issue
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)

            return dt

        # 🔥 Remove invalid entries
        results = [r for r in results if r.get("issued_at")]

        # 🔥 Safe sorting
        results = sorted(results, key=parse_date, reverse=True)

        print("TOTAL ALERTS:", len(results))  # Debug

        return results[:limit]

    except Exception as e:
        print("ERROR:", e)
        return []


def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


async def create_alert(
    alert: AlertCreate,
    current_user: User = Depends(require_role(["admin", "authority"])),
    db: Session = Depends(get_db)
):
    # Use deduplication helper for manual alerts too
    db_alert = await create_alert_with_dedupe(
        db=db,
        station_id=None,  # Manual alerts may not have station_id
        alert_type=alert.type,
        message=alert.message,
        location=alert.location or "",
        source="manual"
    )
    return db_alert


def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    current_user: User = Depends(require_role(["admin", "authority"])),
    db: Session = Depends(get_db)
):
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert_update.is_resolved is not None:
        db_alert.is_resolved = alert_update.is_resolved
    if alert_update.message:
        db_alert.message = alert_update.message
    if alert_update.location:
        db_alert.location = alert_update.location
        
    db.commit()
    db.refresh(db_alert)
    return db_alert


def resolve_alert(
    alert_id: int,
    current_user: User = Depends(require_role(["admin", "authority"])),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_resolved = True
    db.commit()
    return {"message": "Alert resolved"}


def delete_alert(
    alert_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted"}


async def websocket_alerts(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


async def generate_predictive_alerts(
    current_user: User = Depends(require_role(["admin", "authority"])),
    db: Session = Depends(get_db)
):
    """Run predictive engine across all stations and generate alerts"""
    generated = 0
    skipped = 0
    
    stations = db.query(WaterStation).all()
    
    for station in stations:
        triggered = analyse_station(station.id, db)
        for alert_data in triggered:
            alert_type = AlertType.CONTAMINATION.value
            if alert_data["parameter"] == "temperature" and alert_data["rule_triggered"] == "BREACH":
                alert_type = AlertType.BOIL_NOTICE.value
            
            # Addition 2 & 3: Use centralized dedupe helper
            res = await create_alert_with_dedupe(
                db=db,
                station_id=station.id,
                alert_type=alert_type,
                message=alert_data["alert_message"],
                location=alert_data["location"],
                source="predictive"
            )
            if res:
                generated += 1
            else:
                skipped += 1
    
    return {"generated": generated, "skipped": skipped}


def get_predictive_alerts(
    location: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get active predictive alerts, optionally filtered by location"""
    query = db.query(Alert).filter(
        Alert.source == "predictive",
        Alert.is_resolved == False
    )
    if location:
        query = query.filter(Alert.location.ilike(f"%{location}%"))
    
    alerts = query.order_by(Alert.issued_at.desc()).limit(10).all()
    return [{
        "id": a.id,
        "type": a.type,
        "message": a.message,
        "location": a.location,
        "issued_at": a.issued_at.isoformat() if a.issued_at else None,
        "is_resolved": a.is_resolved,
        "source": a.source or "manual"
    } for a in alerts]


def get_aggregate_readings(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily averages per parameter for all stations over the given time window"""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    results = db.query(
        func.date(StationReading.recorded_at).label("date"),
        StationReading.parameter,
        func.avg(StationReading.value).label("avg_value")
    ).filter(
        StationReading.recorded_at >= start_date
    ).group_by(
        func.date(StationReading.recorded_at),
        StationReading.parameter
    ).order_by(func.date(StationReading.recorded_at)).all()
    
    # Organize by parameter
    data = {}
    for row in results:
        param = row.parameter
        if param not in data:
            data[param] = []
        data[param].append({
            "date": str(row.date),
            "avg_value": round(float(row.avg_value), 4)
        })
    
    return {
        "parameters": data,
        "who_thresholds": WHO_THRESHOLDS,
        "days": days
    }


def create_collaboration(
    collab: CollaborationCreate,
    current_user: User = Depends(require_role(["ngo", "admin"])),
    db: Session = Depends(get_db)
):
    db_collab = Collaboration(
        ngo_user_id=current_user.id,
        ngo_name=collab.ngo_name,
        project_name=collab.project_name,
        contact_email=collab.contact_email,
        status=CollaborationStatus.ACTIVE.value
    )
    db.add(db_collab)
    db.commit()
    db.refresh(db_collab)
    
    result = CollaborationOut.model_validate(db_collab)
    result.report_count = 0
    return result


def get_collaborations(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Collaboration)
    if current_user.role != "admin":
        query = query.filter(Collaboration.ngo_user_id == current_user.id)
    
    if status:
        query = query.filter(Collaboration.status == status)
        
    collabs = query.all()
    results = []
    
    for c in collabs:
        station = db.query(WaterStation).filter(WaterStation.managed_by == c.ngo_name).first()
        r_count = 0
        if station:
            r_count = db.query(Report).filter(Report.location.ilike(f"%{station.name}%")).count()
        
        out = CollaborationOut.model_validate(c)
        out.report_count = r_count
        results.append(out)
        
    return results


def get_reports_v1(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if current_user.role == "citizen":
        query = query.filter(Report.user_id == current_user.id)
    
    if status:
        query = query.filter(Report.status == status)
        
    return query.order_by(Report.created_at.asc()).all()


def patch_report_status(
    report_id: int,
    status_update: dict,
    current_user: User = Depends(require_role(["authority", "admin"])),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    new_status = status_update.get("status")
    if new_status not in [ReportStatus.PENDING_AUTHORITY.value, ReportStatus.RESOLVED.value, ReportStatus.REJECTED.value]:
        raise HTTPException(status_code=422, detail="Invalid status")
        
    report.status = new_status
    db.commit()
    db.refresh(report)
    return report


def get_aggregate_readings(
    days: int = 30,
    db: Session = Depends(get_db)
):
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
    readings = db.query(StationReading).filter(StationReading.recorded_at >= cutoff_date).all()
    
    parameters = ["pH", "turbidity", "DO", "lead", "arsenic"]
    who_thresholds = {
        "pH": {"min": 6.5, "max": 8.5},
        "turbidity": {"max": 4.0},
        "DO": {"min": 6.0},
        "lead": {"max": 0.01},
        "arsenic": {"max": 0.01}
    }
    
    aggregated = {}
    for param in parameters:
        aggregated[param] = []
        param_readings = [r for r in readings if r.parameter == param]
        
        date_groups = {}
        for r in param_readings:
            d = r.recorded_at.strftime("%Y-%m-%d")
            if d not in date_groups:
                date_groups[d] = []
            date_groups[d].append(float(r.value))
            
        for d, vals in date_groups.items():
            aggregated[param].append({
                "date": d,
                "avg_value": sum(vals) / len(vals)
            })
            
        aggregated[param] = sorted(aggregated[param], key=lambda x: x["date"])
        
    return {
        "aggregates": aggregated,
        "who_thresholds": who_thresholds
    }


def get_all_users(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at
        })
    return results


def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if role_update.role not in ["citizen", "ngo", "authority", "admin"]:
        raise HTTPException(status_code=422, detail="Invalid role")
        
    user.role = role_update.role
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


async def get_epa_data(
    state: Optional[str] = None,
    county: Optional[str] = None
):
    """Fetch water quality data from US EPA Water Quality Data Portal"""
    try:
        # EPA Water Quality Data Portal
        base_url = "https://www.waterqualitydata.us/data/Result/search"
        params = {
            "mimeType": "json",
            "zip": "no",
            "count": 10
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(base_url, params=params, timeout=30.0)
            if response.status_code == 200:
                return {"source": "EPA", "data": response.json()}
    except Exception as e:
        pass
    
    # Return local data if external API fails
    return {
        "source": "local",
        "message": "External API unavailable, using local data",
        "data": []
    }


async def get_who_data():
    """Fetch water quality guidelines from WHO"""
    try:
        # WHO has limited public APIs for water quality
        # Return standard WHO guidelines
        return {
            "source": "WHO Guidelines",
            "standards": {
                "pH": {"min": 6.5, "max": 8.5},
                "turbidity": {"max": 5.0, "unit": "NTU"},
                "arsenic": {"max": 0.01, "unit": "mg/L"},
                "lead": {"max": 0.01, "unit": "mg/L"},
                "e_coli": {"max": 0, "unit": "CFU/100mL"}
            }
        }
    except Exception as e:
        return {"error": str(e)}


async def get_cpcb_data(
    state: Optional[str] = None,
    station: Optional[str] = None
):
    """Fetch water quality data from CPCB India"""
    try:
        # CPCB India Open Data (if available)
        # For now, return local station data
        return {
            "source": "CPCB India",
            "message": "Using local monitoring station data",
            "data": []
        }
    except Exception as e:
        return {"error": str(e)}


def legacy_register(user: UserCreate, db: Session = Depends(get_db)):
    return register(user, db)


def legacy_login(user: UserLogin, db: Session = Depends(get_db)):
    return login(user, db)


def legacy_get_sensor_data(db: Session = Depends(get_db)):
    """Legacy endpoint for dashboard compatibility"""
    readings = db.query(StationReading).order_by(StationReading.recorded_at.desc()).limit(10).all()
    
    output = []
    for r in readings:
        output.append({
            "time": r.recorded_at.strftime("%H:%M"),
            "date": r.recorded_at.strftime("%Y-%m-%d"),
            "ph": float(r.value) if r.parameter == "pH" else 7.0,
            "turbidity": float(r.value) if r.parameter == "turbidity" else 1.5,
            "chlorine": 0.8,
            "temp": float(r.value) if r.parameter == "temperature" else 18.6,
            "status": "Stable"
        })
    
    latest = output[0] if output else {"ph": 7.0, "turbidity": 1.5, "chlorine": 0.8, "temp": 18.6}
    
    return {
        "current": latest,
        "history": output[::-1]
    }


def legacy_get_alerts(db: Session = Depends(get_db)):
    """Legacy endpoint for alerts"""
    return get_alerts(limit=15, db=db)


def legacy_sensor_update(data: dict, db: Session = Depends(get_db)):
    """Legacy endpoint for sensor data updates"""
    # Create or get a default station
    station = db.query(WaterStation).first()
    if not station:
        station = WaterStation(
            name="Default Station",
            location="Default Location",
            latitude=17.3850,
            longitude=78.4867
        )
        db.add(station)
        db.commit()
        db.refresh(station)
    
    # Add readings
    if "ph" in data:
        reading = StationReading(
            station_id=station.id,
            parameter="pH",
            value=data["ph"]
        )
        db.add(reading)
    
    if "turbidity" in data:
        reading = StationReading(
            station_id=station.id,
            parameter="turbidity",
            value=data["turbidity"]
        )
        db.add(reading)
    
    if "temp" in data:
        reading = StationReading(
            station_id=station.id,
            parameter="temperature",
            value=data["temp"]
        )
        db.add(reading)
    
    db.commit()
    return {"message": "Data received and logged"}


def root():
    return {
        "status": "success",
        "message": "Water Quality Monitor API v2.0 is online",
        "docs": "/docs"
    }


def seed_data(db: Session = Depends(get_db)):
    """Seed initial data for testing from CSV file"""
    # Load stations from CSV file
    csv_stations = load_stations_from_csv()
    
    print(f"Loaded {len(csv_stations)} stations from CSV file")
    
    # Clear existing stations to ensure fresh data
    db.query(StationReading).delete()
    db.query(Alert).delete()
    db.commit()
    db.query(WaterStation).delete()
    db.commit()
    
    created_count = 0
    for station_data in csv_stations:
        station = WaterStation(
            name=station_data['name'],
            location=station_data['location'],
            region=station_data.get('region'),
            state=station_data.get('state'),
            country=station_data.get('country', 'India'),
            latitude=Decimal(str(station_data['latitude'])),
            longitude=Decimal(str(station_data['longitude'])),
            managed_by=station_data.get('managed_by')
        )
        db.add(station)
        created_count += 1
    
    db.commit()
    
    # Add sample readings for each station
    all_stations = db.query(WaterStation).all()
    
    import random
    for station in all_stations:
        # Check if station already has readings
        existing_readings = db.query(StationReading).filter(
            StationReading.station_id == station.id
        ).first()
        
        if not existing_readings:
            # Add current readings
            readings_data = [
                ("pH", round(random.uniform(6.5, 8.5), 2)),
                ("turbidity", round(random.uniform(0.5, 3.0), 2)),
                ("DO", round(random.uniform(5.0, 8.0), 2)),
                ("temperature", round(random.uniform(20.0, 30.0), 2)),
                ("arsenic", round(random.uniform(0.001, 0.008), 4)),
                ("lead", round(random.uniform(0.001, 0.005), 4)),
                ("iron", round(random.uniform(0.1, 0.5), 2)),
                ("e_coli", random.randint(0, 50))
            ]
            
            for param, value in readings_data:
                reading = StationReading(
                    station_id=station.id,
                    parameter=param,
                    value=value
                )
                db.add(reading)
    #     if not existing_readings:

    #             readings_data = [
    #     ("pH", round(random.uniform(4.0, 9.5), 2)),
    #     ("turbidity", round(random.uniform(0.5, 10.0), 2)),
    #     ("DO", round(random.uniform(3.0, 8.0), 2)),
    #     ("temperature", round(random.uniform(20.0, 45.0), 2)),
    #     ("arsenic", round(random.uniform(0.001, 0.02), 4)),
    #     ("lead", round(random.uniform(0.001, 0.02), 4)),
    #     ("iron", round(random.uniform(0.1, 1.0), 2)),
    #     ("e_coli", random.randint(0, 100))
    # ]

    # for param, value in readings_data:

    #     reading = StationReading(
    #         station_id=station.id,
    #         parameter=param,
    #         value=value
    #     )
    #     db.add(reading)

    #     # ALERT TRIGGERS

    #     if param == "pH" and (value < 6.5 or value > 8.5):
    #         alert = Alert(
    #             type=AlertType.CONTAMINATION.value,
    #             message=f"pH Level unsafe at {station.name} (Value: {value})",
    #             location=station.location
    #         )
    #         db.add(alert)

    #     if param == "turbidity" and value > 5:
    #         alert = Alert(
    #             type=AlertType.CONTAMINATION.value,
    #             message=f"High Turbidity detected at {station.name}: {value} NTU",
    #             location=station.location
    #         )
    #         db.add(alert)

    #     if param == "temperature":
    #         if value > 100:
    #             alert = Alert(
    #                 type=AlertType.BOIL_NOTICE.value,
    #                 message=f"Extreme temperature at {station.name}: {value}°C",
    #                 location=station.location
    #             )
    #             db.add(alert)

    #         elif value > 35:
    #             alert = Alert(
    #                 type=AlertType.CONTAMINATION.value,
    #                 message=f"High temperature detected at {station.name}: {value}°C",
    #                 location=station.location
    #             )
    #             db.add(alert)

    #     if param == "e_coli" and value > 0:
    #         alert = Alert(
    #             type=AlertType.CONTAMINATION.value,
    #             message=f"E.coli detected at {station.name}: {value}",
    #             location=station.location
    #         )
    #         db.add(alert)
    
    db.commit()
    
    return {
        "message": "Seed data created successfully",
        "stations_created": created_count,
        "total_stations": len(all_stations),
        "data_source": "water_dataX.csv"
    }


@app.get("/api/auto-alerts")
async def get_auto_alerts():
    """
    Auto-generate predictive alerts using ML model on combined India+USA data.
    This endpoint is separate from existing simulation functionality.
    """
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import RandomForestRegressor
    import httpx
    import traceback
    
    try:
        import warnings
        warnings.filterwarnings('ignore', category=UserWarning, message='.*feature names.*')
        
        # Step 1: Load Indian data from CSV
        indian_data_path = os.path.join(os.path.dirname(__file__), "water_dataX.csv")
        if not os.path.exists(indian_data_path):
            raise HTTPException(status_code=500, detail="Indian water quality data file not found")
        
        # Try multiple encodings to handle special characters
        for encoding in ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']:
            try:
                df_india = pd.read_csv(indian_data_path, encoding=encoding)
                break
            except UnicodeDecodeError:
                continue
        
        # Normalize Indian data columns (mapping from CSV format to standard format)
        # CSV has: STATION CODE, LOCATIONS, STATE, Temp, D.O., PH, CONDUCTIVITY, B.O.D., NITRATE, FECAL COLIFORM, TOTAL COLIFORM, year
        df_india = df_india.rename(columns={
            'STATION CODE': 'station_id',
            'LOCATIONS': 'location',
            'STATE': 'state',
            'Temp': 'temperature',
            'PH': 'ph',
        })
        
        # Convert columns to numeric - handle errors gracefully
        df_india['ph'] = pd.to_numeric(df_india['ph'], errors='coerce')
        df_india['temperature'] = pd.to_numeric(df_india['temperature'], errors='coerce')
        
        # Use B.O.D. as turbidity proxy, or set to 0 if not available
        if 'B.O.D.' in df_india.columns:
            df_india['turbidity'] = pd.to_numeric(df_india['B.O.D.'], errors='coerce')
        else:
            df_india['turbidity'] = 0.0
        
        # Fill NaN values with defaults
        df_india['ph'] = df_india['ph'].fillna(7.0)
        df_india['temperature'] = df_india['temperature'].fillna(25.0)
        df_india['turbidity'] = df_india['turbidity'].fillna(0.0)
        
        # Step 2: Fetch USA data from USGS API (simplified - just getting a sample for demo)
        # In production, you'd fetch actual USGS data
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Fetching sample data from USGS for demonstration
                # Real implementation would query specific parameters
                response = await client.get(
                    "https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=CA&siteType=GW&siteStatus=all",
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    usgs_data = response.json()
                    # Parse USGS data (simplified for demo)
                    usa_readings = []
                    if 'value' in usgs_data and 'timeSeries' in usgs_data['value']:
                        for series in usgs_data['value']['timeSeries'][:10]:  # Limit to 10 stations
                            station_code = series.get('sourceInfo', {}).get('siteCode', [{}])[0].get('value', 'USA_UNKNOWN')
                            values = series.get('values', [{}])[0].get('value', [])
                            if values:
                                latest_value = float(values[-1].get('value', 7.0))
                                usa_readings.append({
                                    'station_id': f'USA_{station_code}',
                                    'ph': latest_value,
                                    'temperature': 20.0,  # Default for demo
                                    'turbidity': 0.0,  # Default for demo
                                    'timestamp': datetime.now()
                                })
                    
                    df_usa = pd.DataFrame(usa_readings) if usa_readings else pd.DataFrame()
                else:
                    df_usa = pd.DataFrame()
        except Exception as e:
            # If USGS API fails, create mock USA data for demo purposes
            print(f"USGS API fetch failed (using mock data): {str(e)}")
            df_usa = pd.DataFrame({
                'station_id': [f'USA_{i:03d}' for i in range(1, 6)],
                'ph': [7.2, 6.8, 8.1, 7.5, 6.3],
                'temperature': [22.5, 23.1, 21.8, 24.2, 25.0],
                'turbidity': [1.2, 2.1, 1.5, 1.8, 3.2]
            })
        
        # Step 3: Combine datasets
        # Select only common columns from Indian data
        df_india_normalized = df_india[['station_id', 'ph', 'temperature', 'turbidity']].copy()
        df_india_normalized['timestamp'] = datetime.now()
        
        # Combine both datasets
        if not df_usa.empty:
            df_combined = pd.concat([df_india_normalized, df_usa], ignore_index=True)
        else:
            df_combined = df_india_normalized
        
        # Step 4: Train ML Model (RandomForestRegressor)
        # Features: temperature, turbidity
        # Target: ph
        X = df_combined[['temperature', 'turbidity']].dropna()
        y = df_combined.loc[X.index, 'ph'].dropna()
        
        if len(X) < 10:
            # Not enough data for training, use simple threshold-based prediction
            model_trained = False
        else:
            model = RandomForestRegressor(n_estimators=10, random_state=42)
            model.fit(X, y)
            model_trained = True
        
        # Step 5: Generate predictions per station
        alerts = []
        unique_stations = df_combined['station_id'].unique()
        
        for station_id in unique_stations:
            station_data = df_combined[df_combined['station_id'] == station_id]
            
            # Get last 5 records (or all if less than 5)
            recent_data = station_data.tail(5)
            
            # Compute average values
            avg_ph = recent_data['ph'].mean()
            avg_temp = recent_data['temperature'].mean()
            avg_turbidity = recent_data['turbidity'].mean()
            
            # Predict future value
            if model_trained:
                try:
                    predicted_ph = model.predict([[avg_temp, avg_turbidity]])[0]
                except:
                    predicted_ph = avg_ph
            else:
                predicted_ph = avg_ph
            
            # Calculate risk score (0-100 scale based on deviation from neutral pH 7.0)
            risk_score = min(100, abs(predicted_ph - 7.0) * 20)
            
            # Step 6: Apply threshold rules for alerts
            alert_type = None
            severity = None
            
            if predicted_ph < 6.5:
                alert_type = "Acidic Contamination"
                severity = "HIGH"
            elif predicted_ph > 8.5:
                alert_type = "Alkaline Contamination"
                severity = "MEDIUM"
            elif predicted_ph < 6.8 or predicted_ph > 8.2:
                alert_type = "pH Warning"
                severity = "LOW"
            
            # Only add alert if threshold breached
            if alert_type:
                alerts.append({
                    "station_id": str(station_id),
                    "predicted_ph": round(float(predicted_ph), 2),
                    "alert_type": alert_type,
                    "severity": severity,
                    "timestamp": datetime.now().isoformat(),
                    "risk_score": round(risk_score, 2)
                })
        
        # Sort by severity (HIGH first)
        severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        alerts.sort(key=lambda x: severity_order.get(x["severity"], 3))
        
        return {
            "alerts": alerts,
            "total_stations_analyzed": len(unique_stations),
            "total_alerts_generated": len(alerts),
            "model_used": "RandomForestRegressor" if model_trained else "Threshold-based",
            "generated_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        # Print full traceback for debugging
        print("ERROR in /api/auto-alerts:")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error generating auto alerts: {str(e)}"
        )

