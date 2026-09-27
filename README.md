# 🚀 Tarun Task Manager

A modern full-stack task management application built with React and FastAPI.

## ✨ Features

- 🔐 User Registration & Login
- 📝 Create, Edit & Delete Tasks
- ✅ Mark Tasks as Completed
- 🔎 Search Tasks
- 🎯 Filter Tasks by Status & Priority
- 📊 Dashboard Statistics
- 🌙 Dark Mode
- 🔒 JWT Authentication
- ⚡ FastAPI Backend
- ⚛️ React Frontend
- 📱 Responsive User Interface

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- JWT Authentication

### Database

- SQLite (Development)
- PostgreSQL (Production)

## 📁 Project Structure

```text
TarunTaskManager/
├── backend/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/TarunChauhan2006/TarunTaskManager.git
cd TarunTaskManager
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend runs at:

`http://127.0.0.1:8000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## 🔑 API Documentation

Once the backend is running, FastAPI Swagger documentation is available at:

`http://127.0.0.1:8000/docs`

## 🔐 Authentication

The application uses JWT-based authentication to protect user-specific task data.

Users can:

- Register an account
- Login securely
- Access authenticated tasks
- Create and manage their own tasks

## 📊 Dashboard

The dashboard provides:

- Total Tasks
- Completed Tasks
- Pending Tasks
- Task Search
- Priority Filtering
- Status Filtering
- Quick Task Management

## 🗄️ Database

SQLite is used for local development.

For production deployment, PostgreSQL will be used for persistent database storage.

## 🚀 Deployment

Planned production architecture:

```text
React Frontend
      ↓
    Vercel
      ↓
FastAPI Backend
      ↓
    Render
      ↓
 PostgreSQL
```

## 🔮 Future Improvements

- 📂 Projects
- 🏷️ Tags
- ☑️ Subtasks
- 📋 Kanban Board
- 📅 Calendar
- 📈 Advanced Analytics
- 🤖 AI Task Assistant
- 🔔 Notifications
- 👥 Team Collaboration

## 👨‍💻 Author

**Tarun Chauhan**

GitHub: [@TarunChauhan2006](https://github.com/TarunChauhan2006)

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.
