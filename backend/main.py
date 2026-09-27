import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from routers.auth import router as auth_router
from routers.tasks import router as tasks_router


Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="Tarun Task Manager API",
    description="Full Stack Task Management Application",
    version="2.0.0"
)


# Frontend URL
frontend_url = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


app.include_router(
    auth_router
)

app.include_router(
    tasks_router
)


@app.get("/")
def root():

    return {
        "message": "Tarun Task Manager API 🚀",
        "version": "2.0.0"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }