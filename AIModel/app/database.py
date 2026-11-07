import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
load_dotenv(Path(__file__).resolve().parents[2] / "server" / ".env")

MONGO_URI = os.getenv("MONGO_URI") or os.getenv(
    "MONGODB_URI", "mongodb://localhost:27017"
)
DB_NAME = os.getenv("DB_NAME")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME] if DB_NAME else client.get_default_database(default="test")

def get_database():
    return db