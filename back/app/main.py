from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
import os
from typing import Dict, Any

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database directory exists
DB_DIR = Path("database/rooms")
DB_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/api/rooms")
async def create_room(room: Dict[str, Any]):
    try:
        file_path = DB_DIR / f"{room['room']['id']}.json"
        with open(file_path, "w") as f:
            json.dump(room, f, indent=2)
        return room
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/rooms/{room_id}")
async def get_room(room_id: str):
    try:
        file_path = DB_DIR / f"{room_id}.json"
        with open(file_path) as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Room not found")

@app.get("/api/rooms")
async def list_rooms():
    rooms = []
    for file_path in DB_DIR.glob("*.json"):
        with open(file_path) as f:
            rooms.append(json.load(f))
    return rooms 