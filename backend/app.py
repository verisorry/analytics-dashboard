from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Union, Optional
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
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
            
manager = ConnectionManager()

# load sample data
def load_data():
    with open("data.json", "r") as f:
        return json.load(f)

settings_data = load_data()

def random_date():
    start = datetime.now() - timedelta(days=365)
    end = datetime.now()
    diff = (end - start).total_seconds()
    random_seconds = random.randint(0, int(diff))
    random_date = start + timedelta(seconds=random_seconds)
    return int(random_date.timestamp())

# generate + broadcast random data
async def generate_data():
    fridge_id = random.randint(1, 10)
    instrument_name = random.choice(["instrument_one", "instrument_two", "instrument_three", "instrument_four", "instrument_five"])
    parameter_name = random.choice(["temperature", "power_level", "current_bias", "voltage", "flux_bias"])
    applied_value = random.uniform(0, 100)
    
    data = {
        "fridge_id": fridge_id,
        "instrument_name": instrument_name,
        "parameter_name": parameter_name,
        "applied_value": applied_value,
        "timestamp": random_date()
    }
    
    await manager.broadcast(json.dumps(data))
    await asyncio.sleep(1)

# base settings with filters
@app.get("/settings")
async def get_settings(
    page: int = 1,
    page_size: int = 10,
):
    total_items = len(load_data()["data"])
    start = (page - 1) * page_size
    end = min(start + page_size, total_items)
    
    data = []
    for item in range(start, end):
        timestamp = random_date()
        data.append({
            "fridge_id": random.randint(1, 4),
            "instrument_name": random.choice(["instrument_one", "instrument_two", "instrument_three", "instrument_four", "instrument_five"]),
            "parameter_name": random.choice(["temperature", "power_level", "current_bias", "voltage", "flux_bias"]),
            "applied_value": round(random.uniform(0, 100), 2),
            "timestamp": timestamp
        })

    return {
        "data": data,
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": (total_items + page_size - 1) // page_size
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        task = asyncio.create_task(generate_data())
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        task.cancel()
            

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)