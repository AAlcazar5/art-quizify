import nest_asyncio
nest_asyncio.apply()

import os
import json
from openai import OpenAI
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
key = os.environ.get("OPENAI_API_KEY")

client = OpenAI()

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
processor = ViTImageProcessor.from_pretrained("./vit_finetune")
model = ViTForImageClassification.from_pretrained("./vit_finetune")

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
    return {"message": "Hello, welcome to the Image Classifier API!"}

# Endpoint for generating quiz for Image Analysis page
@app.post("/generate-quiz/image-analysis")
async def generate_image_analysis_quiz(request: ImageStyleRequest):
    # We specify the exact JSON format in our prompt:
    prompt = (
        f"Create five quiz questions about the art style '{request.image_style}'. "
        "Return only valid JSON, with this exact structure:\n\n"
        "{\n"
        "  \"questions\": [\n"
        "    {\n"
        "      \"question\": \"string\",\n"
        "      \"options\": [\"string\", \"string\", \"string\", \"string\"],\n"
        "      \"correctAnswer\": \"string\",\n"
        "      \"explanation\": \"string\"\n"
        "    },\n"
        "    ...\n"
        "  ]\n"
        "}\n\n"
        "Make sure:\n"
        "- The top-level key is \"questions\".\n"
        "- Each question object has exactly 4 fields: question, options, correctAnswer, explanation.\n"
        "- correctAnswer must be exactly one of the four options.\n"
        "Do not include any additional keys or text outside of the JSON."
    )

    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an art historian and quiz creator."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=1000,
            temperature=0.8,  # Lower temperature to reduce output variation
        )

        response_content = completion.choices[0].message.content.strip()
        print("Raw GPT Response (Image Analysis):", response_content)  # Debug print

        data = json.loads(response_content)

        # If "quiz" is present, rename it to "questions" (just in case)
        if "quiz" in data:
            data["questions"] = data.pop("quiz")

        # Validate response
        quiz_response = QuizResponse(**data)

        return JSONResponse(quiz_response.dict())
    except json.JSONDecodeError as e:
        print("JSON Decode Error:", e)  # Log parsing error
        raise HTTPException(status_code=500, detail="Invalid JSON response from OpenAI.")
    except ValidationError as e:
        print("Validation Error:", e)  # Log validation issues
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")
    except Exception as e:
        print("General Error:", e)
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")


# Endpoint for generating quiz for Practice page
@app.post("/generate-quiz/practice")
async def generate_practice_quiz(request: ImageStyleRequest):
    """
    Create 10 quiz questions about the specified art style,
    or a remix of multiple recognized art styles.
    """
    style = request.image_style

    if style == "Random":
        # Revised prompt for random styles, higher temperature
        quiz_prompt = """
You are an art historian and quiz creator. 
Create ten quiz questions that each reference a different recognized art style. 
Pick these styles from distinct periods, cultures, or movements — for example: 
Impressionism, African sculpture, Baroque, Surrealism, Pop Art, Rococo, Japanese Ukiyo-e, 
Renaissance, Expressionism, Futurism, Romanticism, etc.

In each question, explicitly name the style you are referencing. 
For example: "Which of the following characteristics is most associated with Surrealism?"

Do NOT treat 'Random' or 'Remix' as a real art style. 
Use only actual art styles from art history. 
Use a variety of them so each question focuses on a different style.

Return strictly valid JSON in this structure (no disclaimers or text outside the JSON):

{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    },
    ...
  ]
}

Requirements:
- The top-level key is "questions".
- Exactly 10 question objects.
- Each question object has 4 fields: question, options, correctAnswer, explanation.
- correctAnswer must be one of the four options.
- Provide diverse recognized styles; do not repeat the same style in more than one question.
- Temperature = 0.8 to increase variety.
"""
    else:
        # Normal style
        quiz_prompt = f"""
You are an art historian and quiz creator. 
Create ten quiz questions about the art style '{style}'.

Return strictly valid JSON in this structure (no disclaimers or text outside the JSON):

{{
  "questions": [
    {{
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }},
    ...
  ]
}}

Requirements:
- The top-level key is "questions".
- Exactly 10 question objects.
- Each question object has 4 fields: question, options, correctAnswer, explanation.
- correctAnswer must be one of the four options.
- Temperature = 0.8 to keep it creative.
"""

    try:
        completion = client.chat.completions.create(
            model="gpt-4",  # or "gpt-3.5-turbo" if GPT-4 unavailable
            messages=[
                {"role": "system", "content": "You are an art historian and quiz creator. Return valid JSON only."},
                {"role": "user", "content": quiz_prompt},
            ],
            max_tokens=1500,
            temperature=0.8 
        )

        response_content = completion.choices[0].message.content.strip()
        print("GPT Practice Quiz Response (Remix or Style):", response_content)  # Debug

        data = json.loads(response_content)
        return data

    except json.JSONDecodeError as e:
        print("Invalid JSON from GPT (practice):", e)
        raise HTTPException(status_code=500, detail="GPT returned invalid JSON for practice quiz.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating practice quiz: {str(e)}")



# Endpoint to classify uploaded image
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
        description_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert historian."},
                {"role": "user", "content": description_prompt},
            ],
            max_tokens=100,
            temperature=0.7,
        )

        description = description_response.choices[0].message.content.strip()

        return {
            "imageStyle": predicted_class,
            "confidence": confidence,
            "description": description,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Define the Pydantic model here
class CanvasData(BaseModel):
    imageData: str

@app.post("/critique-canvas")
async def critique_canvas(data: CanvasData):
    """
    Accepts a base64-encoded PNG and provides a critique of the drawing using OpenAI.
    """
    try:
        # Extract base64 portion if prefixed with data scheme
        image_base64 = data.imageData.split(",")[1] if "," in data.imageData else data.imageData

        # Basic instruction to provide an art critique, no mention of a title
        prompt = (
            "You are a seasoned art critic analyzing a user-submitted drawing. "
            "Please provide a constructive and encouraging critique. "
            "Focus on artistic techniques, composition, and possible improvements, "
            "without mentioning any AI limitations or disclaimers."
        )

        # Call OpenAI (adjust model if needed)
        completion = client.chat.completions.create(
            model="gpt-4",  # or gpt-3.5-turbo
            messages=[
                {"role": "system", "content": "You are an expert art critic."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=300,
            temperature=0.7,
        )

        critique_text = completion.choices[0].message.content.strip()
        return {"critique": critique_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating critique: {str(e)}")