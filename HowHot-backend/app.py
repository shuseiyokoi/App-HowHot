from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import logging
import os
import uuid
import boto3
import torch
from torchvision import models, transforms
import traceback
from io import BytesIO
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()


# DB setup
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String, nullable=False)
    predicted_spice_level = Column(Integer, nullable=False)  # 👈 NEW
    actual_spice_level = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    

# Logging
logging.basicConfig(level=logging.INFO)

# HEIC support
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    logging.info("✅ pillow-heif registered")
except Exception as e:
    logging.error(f"❌ Failed to register pillow-heif: {e}")

# FastAPI app
app = FastAPI()

@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"message": "HowHot API is running!"}

@app.get("/ping")
def ping():
    return {"ping": "pong"}

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
model = models.resnet18(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, 6)

try:
    model.load_state_dict(torch.load("MODEL_PATH", map_location=torch.device("cpu")))
    model.eval()
    logging.info("✅ Model loaded successfully.")
    Base.metadata.create_all(bind=engine)
    logging.info("✅ PostgreSQL feedback table ready.")

except Exception as e:
    logging.error(f"❌ Model failed to load: {e}")

# Image transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def predict_spice(image: Image.Image):
    image = image.convert("RGB")
    image_tensor = transform(image).unsqueeze(0)
    with torch.no_grad():
        outputs = model(image_tensor)
        _, predicted = torch.max(outputs, 1)
    return predicted.item()

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        filename = file.filename.lower()
        content_type = file.content_type
        logging.info(f"📥 Received file: {filename}, Content-Type: {content_type}")

        image_bytes = await file.read()

        try:
            image = Image.open(BytesIO(image_bytes))
            image.verify()
            image = Image.open(BytesIO(image_bytes))
            logging.info("✅ Image loaded successfully")
        except Exception as err:
            logging.error(f"❌ Image open failed: {err}")
            return JSONResponse(
                status_code=415,
                content={"detail": f"Unsupported or corrupted image: {err}"}
            )

        spice_level = predict_spice(image)
        return {"spice_level": spice_level}

    except Exception as e:
        logging.error(f"❌ Unexpected error: {e}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": f"Image processing failed: {str(e)}"}
        )

# ============================
# ✅ /feedback endpoint
# ============================

# S3 Config
S3_BUCKET = os.getenv("S3_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION", "your-region")

s3 = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

def upload_to_s3(image_bytes, filename):
    unique_key = f"{uuid.uuid4()}_{filename}"
    try:
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=unique_key,
            Body=image_bytes,
            ContentType="image/jpeg"
        )
        return f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{unique_key}"
    except Exception as e:
        logging.error(f"❌ S3 Upload failed: {e}")
        return None


@app.post("/feedback")
async def submit_feedback(
    file: UploadFile = File(...),
    actual_spice_level: int = Form(...),
    predicted_spice_level: int = Form(...)  # 👈 NEW
):
    try:
        filename = file.filename
        image_bytes = await file.read()
        image_url = upload_to_s3(image_bytes, filename)

        if not image_url:
            return JSONResponse(
                status_code=500,
                content={"detail": "Failed to upload image to S3"}
            )

        # ✅ Save to Postgres
        db = SessionLocal()
        feedback = Feedback(
            image_url=image_url,
            actual_spice_level=actual_spice_level,
            predicted_spice_level=predicted_spice_level  # 👈 NEW
        )

        db.add(feedback)
        db.commit()
        db.close()

        logging.info(f"✅ Feedback logged: {actual_spice_level} 🔥 → {image_url}")

        return {
            "status": "success",
            "image_url": image_url,
            "actual_spice_level": actual_spice_level
        }

    except Exception as e:
        logging.error(f"❌ Feedback submission error: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Feedback failed: {str(e)}"}
        )
