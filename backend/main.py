import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import candidates, constituencies, analytics
from services.polling_service import poll_election_data, ws_clients


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background polling task
    task = asyncio.create_task(poll_election_data())
    print("[App] Election data polling started")
    yield
    task.cancel()
    print("[App] Election data polling stopped")


app = FastAPI(
    title="Nepal Election Intelligence API",
    description="Real-time election analytics for Nepal 2082",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(candidates.router)
app.include_router(constituencies.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    return {
        "name": "Nepal Election Intelligence API",
        "version": "1.0.0",
        "endpoints": [
            "/api/candidates",
            "/api/constituencies",
            "/api/analytics/national",
            "/api/analytics/parties",
            "/api/analytics/closest-races",
            "/api/analytics/rising-candidates",
            "/api/analytics/demographics",
            "/api/analytics/drama-index",
            "/api/analytics/events",
            "/ws",
        ]
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    ws_clients.add(websocket)
    print(f"[WS] Client connected. Total: {len(ws_clients)}")
    try:
        while True:
            # Keep connection alive, receive pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_clients.discard(websocket)
        print(f"[WS] Client disconnected. Total: {len(ws_clients)}")
    except Exception:
        ws_clients.discard(websocket)
