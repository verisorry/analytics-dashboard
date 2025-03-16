from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Union, Optional
from pydantic import BaseModel
import json
import uvicorn
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

# load sample data
def load_data():
    with open("data.json", "r") as f:
        return json.load(f)

settings_data = load_data()

# base settings with filters
@app.get("/settings")
async def get_settings(
    fridge_id: Optional[int] = None,
    instrument_name: Optional[str] = None,
    parameter_name: Optional[str] = None,
):
    data = load_data()["data"]
    if fridge_id:
        data = [item for item in data if item["fridge_id"] == fridge_id]
    if instrument_name:
        data = [item for item in data if item["instrument_name"] == instrument_name]
    if parameter_name:
        data = [item for item in data if item["parameter_name"] == parameter_name]
    return {"data": data}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)