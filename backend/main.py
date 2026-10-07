from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

from routers.auth import router as auth_router
from routers.tasks import router as tasks_router
from routers.users import router as users_router
from routers.google_auth import router as google_auth_router


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Tarun Task Manager API",
    description="Full Stack Task Management Application",
    version="2.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tarun-task-manager.vercel.app",
        "https://tarun-task-manager-frontend.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Tarun Task Manager API",
    description="Full Stack Task Management Application",
    version="2.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tarun-task-manager.vercel.app",
        "https://tarun-task-manager-frontend.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth_router
)

app.include_router(
    tasks_router
)

app.include_router(
    users_router
)

app.include_router(
    google_auth_router
)


# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Tarun Task Manager API 🚀",
        "version": "2.0.0"
    }
