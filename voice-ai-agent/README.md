🗣️ Voice AI Agent Project: Google ADK and W&B Weave Integration
This repository contains the code and steps for developing an end-to-end Voice AI Agent using the Google Agent Development Kit (ADK), integrated with Weights & Biases Weave for logging and tracing, and Weave Inference for model serving.

🌟 Project Overview
This codelab provides a complete, hands-on guide for creating a voice-enabled AI agent. The project includes setting up the agent, connecting it to a streaming API server for real-time communication, and deploying a simple web user interface (UI) for interaction. We demonstrate using the Google ADK with both W&B Weave Inference and the Gemini API.

📋 Requirements
To follow this project, you need:

A Google Gemini API Key.

A Weights & Biases API Key.

(Optional) Astral UV installed locally (for faster pip installs). If not installed, remove uv from the installation commands.

(Optional) Node.js installed locally (to run the UI).

💻 Setup and Repository Structure
We start by cloning the project repository and examining its structure.

Clone the repository:

Bash

git clone git@github.com/wandb/voice-ai-agent-project.git
Explore the folder structure:

The repository contains three main folders:

ui: The client-side web interface.

api: The server-side API for the core voice agent.

hello-world: A minimal example demonstrating basic ADK setup.

🧪 Hello World (LiteLLM & Weave Inference Example)
This section sets up a basic chat agent using Google ADK, configured to run against W&B Weave Inference.

Navigate to the folder:

Bash

cd hello-world
Install dependencies:

Bash

uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
Configure the .env file: Create a file named .env in the hello-world directory:

Ini, TOML

# in .env file
OPENAI_API_BASE=https://api.inference.wandb.ai/v1
OPENAI_API_KEY="YOUR_WANDB_KEY_HERE"

WANDB_API_KEY="YOUR_WANDB_KEY_HERE"
Run the agent's development UI:

Bash

adk web
This starts the ADK development UI, typically at http://localhost:8000. You can now start chatting with this basic ADK agent.

🎤 Voice AI Agent API (Gemini & Google Search Tool)
This section focuses on the main voice AI agent, powered by the Gemini API and featuring the Google Search Tool.

Navigate to the folder:

Bash

cd ../api
Install dependencies:

Bash

uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
Configure the .env file: Create a file named .env in the api directory:

Ini, TOML

# in .env file:
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
GOOGLE_GENAI_USE_VERTEXAI=false
Run the API server:

Bash

uvicorn main:app --reload
The server will start listening for client connections at http://localhost:8000.

Key Functionality: The main.py file is a FastAPI server that manages Server-Sent Events (SSE) for real-time streaming of text and audio between the client and the agent.

🌐 UI (The Client Interface)
Finally, we run the simple web interface that acts as the client for our streaming API server.

Navigate to the UI folder:

Bash

cd ../ui
Install Node dependencies:

Bash

pnpm i
Start the development server:

Bash

pnpm dev
The UI will spin up, usually at http://localhost:3000.

****
Ensure the connection state is green (Connected). If not, click the gear icon (settings) to confirm the correct API server URL (http://localhost:8000) is configured.

<img width="960" height="575" alt="voice ai " src="https://github.com/user-attachments/assets/c8a85afa-1dce-4172-8df0-630b7d2493dd" />

Click the Start Audio button to begin talking to the Voice AI Agent.

Test its capabilities by asking a question that requires a search, like "What was the score of the latest football match?"

🎉 Conclusion
By completing these steps, you successfully built a functional Voice AI agent. This demonstrates the efficiency of using Google ADK for voice applications and highlights the value of W&B Weave Inference for model management and deployment.
