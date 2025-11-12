# import base64
# import os
# from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
# from opentelemetry.sdk import trace as trace_sdk
# from opentelemetry.sdk.trace.export import SimpleSpanProcessor
# from opentelemetry import trace

# from google.adk.agents import LlmAgent
# from google.adk.models.lite_llm import LiteLlm
# from dotenv import load_dotenv

# load_dotenv()

# # Configure Weave endpoint and authentication
# WANDB_BASE_URL = "https://trace.wandb.ai"
# PROJECT_ID = "wandb/hydpy-agent-test"  # e.g., "myteam/myproject"
# OTEL_EXPORTER_OTLP_ENDPOINT = f"{WANDB_BASE_URL}/otel/v1/traces"

# # Set up authentication
# WANDB_API_KEY = os.getenv("WANDB_API_KEY")
# AUTH = base64.b64encode(f"api:{WANDB_API_KEY}".encode()).decode()

# OTEL_EXPORTER_OTLP_HEADERS = {
#     "Authorization": f"Basic {AUTH}",
#     "project_id": PROJECT_ID,
# }

# # Create the OTLP span exporter with endpoint and headers
# exporter = OTLPSpanExporter(
#     endpoint=OTEL_EXPORTER_OTLP_ENDPOINT,
#     headers=OTEL_EXPORTER_OTLP_HEADERS,
# )

# # Create a tracer provider and add the exporter
# tracer_provider = trace_sdk.TracerProvider()
# tracer_provider.add_span_processor(SimpleSpanProcessor(exporter))

# # Set the global tracer provider BEFORE importing/using ADK
# trace.set_tracer_provider(tracer_provider)

# # Create an LLM agent
# root_agent = LlmAgent(
#     name="chatai_agent",
#     model=LiteLlm(model="openai/openai/gpt-oss-20b"),
#     instruction=(
#         "You are a helpful agent who can chat with the user."
#     ),
#     tools=[],
# )

import base64
import os
from dotenv import load_dotenv

from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk import trace as trace_sdk
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry import trace

from google.adk.agents import LlmAgent
from google.adk.models.lite_llm import LiteLlm

# ===========================
# Load environment variables
# ===========================
load_dotenv()

# Choose your LLM provider dynamically
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# ===========================
# Configure WANDB + Tracing
# ===========================
WANDB_BASE_URL = "https://trace.wandb.ai"
PROJECT_ID = "wandb/hydpy-agent-test"  # Example project
OTEL_EXPORTER_OTLP_ENDPOINT = f"{WANDB_BASE_URL}/otel/v1/traces"

# Set up authentication
WANDB_API_KEY = os.getenv("WANDB_API_KEY")
if not WANDB_API_KEY:
    raise ValueError("❌ Missing WANDB_API_KEY in .env")

AUTH = base64.b64encode(f"api:{WANDB_API_KEY}".encode()).decode()
OTEL_EXPORTER_OTLP_HEADERS = {
    "Authorization": f"Basic {AUTH}",
    "project_id": PROJECT_ID,
}

# Create the OTLP span exporter with endpoint and headers
exporter = OTLPSpanExporter(
    endpoint=OTEL_EXPORTER_OTLP_ENDPOINT,
    headers=OTEL_EXPORTER_OTLP_HEADERS,
)

# Create tracer provider and add exporter
tracer_provider = trace_sdk.TracerProvider()
tracer_provider.add_span_processor(SimpleSpanProcessor(exporter))
trace.set_tracer_provider(tracer_provider)

# ===========================
# Configure LLM Agent
# ===========================
# You can easily switch between providers here:
if OPENAI_API_KEY:
    os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
    model_name = "openai/gpt-4o-mini"
elif GOOGLE_API_KEY:
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
    model_name = "google/gemini-1.5-flash"
else:
    raise ValueError("❌ No valid API key found. Please add OPENAI_API_KEY or GOOGLE_API_KEY to .env")

root_agent = LlmAgent(
    name="chatai_agent",
    model=LiteLlm(model=model_name),
    instruction="You are a helpful AI assistant that chats naturally and provides concise, thoughtful answers.",
    tools=[],
)

print(f"✅ Voice Agent loaded using model: {model_name}")
