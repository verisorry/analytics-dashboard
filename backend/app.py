from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
import json
import uvicorn
import random
import asyncio
from datetime import datetime, timedelta

app = FastAPI()
class Settings(BaseModel):
    fridge_id: int
    instrument_name: str
    parameter_name: str
    applied_value: float
    timestamp: int
    
class LiveData(BaseModel):
    data: List[Settings]
    total: int
    page: int
    page_size: int
    has_next: bool
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
            
manager = ConnectionManager()

# load dummy data
def load_data():
    try:
        with open("data.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

dummy_data = load_data()

# generate a random timestamp
_date_range_start = datetime.now() - timedelta(days=365)
_date_range_end = datetime.now()
_date_range_diff = (_date_range_end - _date_range_start).total_seconds()

def random_date():
    random_seconds = random.randint(0, int(_date_range_diff))
    random_date = _date_range_start + timedelta(seconds=random_seconds)
    return int(random_date.timestamp())

# generate one random data point
def generate_data():
    fridge_id = random.randint(1, 10)
    instrument_name = random.choice(["instrument_one", "instrument_two", "instrument_three", "instrument_four", "instrument_five"])
    parameter_name = random.choice(["temperature", "power_level", "current_bias", "voltage", "flux_bias"])
    applied_value = round(random.uniform(0, 100), 2)
    
    data = {
        "fridge_id": fridge_id,
        "instrument_name": instrument_name,
        "parameter_name": parameter_name,
        "applied_value": applied_value,
        "timestamp": random_date()
    }
    
    return data

# generate a set of random data points
def generate_sample_data(count: int = 5):
    data = []
    for _ in range(count):
        data.append(generate_data())
    return data

# generate a page of historical data
def generate_historical_data(count):
    data = []
    
    for _ in range(count):
        setting = generate_data()
        data.append(setting)
        
    return sorted(data, key=lambda x: x['timestamp'], reverse=True)

# dummy mode 
@app.get("/dummy")
async def get_dummy_data():
    return dummy_data

# live mode
@app.get("/live")
async def get_live_data(
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0, le=100),
):
    data = generate_sample_data(page_size)
    
    return {
        "data": data,
        "total": 1000,
        "page": page,
        "page_size": page_size,
        "has_next": page * page_size < 1000
    }

@app.websocket("/ws/live")
async def live_websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = generate_data()
            
            await websocket.send_json(data)
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# historical data mode
@app.get('/historical', response_model=LiveData)
async def get_historical_data(
    page: int = Query(1, gt=0),
    page_size: int = Query(10, gt=0, le=1000),
):
    data = generate_historical_data(page_size)
    total_items = 1000
    
    return {
        "data": data,
        "total": total_items,
        "page": page,
        "page_size": page_size,
        "has_next": page * page_size < total_items
    }
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)