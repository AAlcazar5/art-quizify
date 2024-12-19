import nest_asyncio
nest_asyncio.apply()

import os
import json
import openai
from dotenv import load_dotenv
from typing import List

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from pydantic import BaseModel, Field, ValidationError, model_validator
from PIL import Image
import torch
from transformers import ViTForImageClassification, ViTImageProcessor
import io

# Load environment variables, ensure OPENAI_API_KEY is set
load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Load and Initialize Hugging Face Model
# --------------------------
processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224")
model = ViTForImageClassification.from_pretrained("google/vit-base-patch16-224")

# --------------------------
# Models and Schemas
# --------------------------
class ImageStyleRequest(BaseModel):
    image_style: str = Field(..., alias="imageStyle")

class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correctAnswer: str
    explanation: str

    @model_validator(mode="after")
    def check_correct_answer_in_options(self):
        if self.correctAnswer not in self.options:
            raise ValueError("correctAnswer must be one of the options")
        return self

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

# --------------------------
# Routes
# --------------------------
@app.get("/")
async def read_root():
    return {"message": "Hello, welcome to the Image Style Classifier API!"}

@app.post("/classify-image")
async def classify_image(image: UploadFile = File(...)):
    try:
        # Process the image and predict the image style
        image_data = await image.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)
        predictions = torch.softmax(outputs.logits, dim=1)
        predicted_class = model.config.id2label[predictions.argmax().item()]
        confidence = predictions.max().item()
        
        # Generate a description for the predicted image style using OpenAI API
        description_prompt = f"Provide a brief and informative description of the provided topic '{predicted_class}'."
        description_response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert historian."},
                {"role": "user", "content": description_prompt}
            ],
            max_tokens=100,
            temperature=0.7
        )

        description = description_response.choices[0].message.content.strip()

        return {
            "imageStyle": predicted_class,
            "confidence": confidence,
            "description": description
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/generate-quiz")
async def generate_quiz(request: ImageStyleRequest):
    system_instructions = """
You are an assistant that creates quiz questions about a given image.

Always respond with a JSON object that includes a "questions" key, which is an array of multiple choice questions. Each element in this array must be an object with the following keys:

- "question": A string containing the quiz question.
- "options": An array of exactly four plausible options (strings).
- "correctAnswer": A string that matches exactly one of the four provided options.
- "explanation": A string explaining why the correct answer is correct or why other options are not correct.

Do not include any additional text or commentary outside of this JSON object.
"""

    prompt = f"Create five quiz questions about the image '{request.image_style}' as specified."

    try:
        completion = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )

        raw_response = completion.choices[0].message.content.strip()

        # Try to parse the JSON
        try:
            data = json.loads(raw_response)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Invalid JSON response from LLM")

        # Validate against Pydantic schema
        try:
            quiz_response = QuizResponse(**data)
        except ValidationError as e:
            print("Validation error:", e)
            raise HTTPException(status_code=500, detail="Response schema validation failed.")

        return JSONResponse(quiz_response.dict())
    except Exception as e:
        print(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while generating the quiz questions: {str(e)}")
