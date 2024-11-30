import nest_asyncio
nest_asyncio.apply()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_index.core.tools import FunctionTool
from llama_index.llms.openai import OpenAI
from llama_index.core.agent import (
    StructuredPlannerAgent,
    FunctionCallingAgentWorker,
)
import wikipediaapi
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a Pydantic model for the request body
class AnimalRequest(BaseModel):
    animal_name: str

# Function to simplify the animal name for Wikipedia search
def simplify_animal_name(animal_name: str) -> str:
    """Simplify the animal name for Wikipedia search."""
    return animal_name.split(',')[0].strip()

# Function to retrieve full Wikipedia page content
def get_wikipedia_page(animal_name: str) -> str:
    simplified_name = simplify_animal_name(animal_name)
    wiki_wiki = wikipediaapi.Wikipedia(
        language='en',
        user_agent='LlamaIndex'  # Set user agent to "LlamaIndex"
    )
    page = wiki_wiki.page(simplified_name)
    if page.exists():
        return page.text  # Return the full page content
    else:
        raise HTTPException(status_code=404, detail="Animal not found on Wikipedia")

# Define the AI agent
def create_ai_agent():
    def is_dangerous_tool(description: str) -> str:
        """Determine if the animal described is dangerous and answer if they are dangerous in the first sentence AS THE MOST IMPORTANT PART OF THE RESPONSE. If you can't provide a description for that specific sub-species of the animal, default to whether or not the whole animal species is dangerous. Explain your rationale and walk through the steps that lead to your conclusion."""
        return f"Is the animal dangerous? Description: {description}"

    is_dangerous_function_tool = FunctionTool.from_defaults(fn=is_dangerous_tool)
    llm = OpenAI(model="gpt-4o")
    worker = FunctionCallingAgentWorker.from_tools([is_dangerous_function_tool], llm=llm, verbose=True)
    agent = StructuredPlannerAgent(worker, [is_dangerous_function_tool], verbose=True)
    return agent

# Create the AI agent
agent = create_ai_agent()

@app.get("/")
async def read_root():
    return {"message": "Hello"}

# Endpoint to check if the animal is dangerous
@app.post("/check-animal")
async def check_if_dangerous(request: AnimalRequest):
    full_page_content = get_wikipedia_page(request.animal_name)
    response = await agent.achat(f"Is the animal '{request.animal_name}' dangerous? Description: {full_page_content}")
    
    # Log the entire response to understand its structure and rationale
    print("AI Agent Response:", response)

    # Assuming the response has a 'text' attribute or similar
    response_text = response.text if hasattr(response, 'text') else str(response)

    # Determine if the animal is dangerous based on the response text
    is_dangerous = "not considered a dangerous animal" not in response_text.lower()
    
    return {
        "full_page_content": full_page_content,
        "is_dangerous": is_dangerous,
        "rationale": response_text  # Include the rationale in the response
    }