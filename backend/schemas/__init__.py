from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "Medium"
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    assignee_id: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: str
    status: str
    due_date: Optional[datetime]
    completed: bool
    created_at: datetime
    owner_id: int
    assignee_id: Optional[int]

    class Config:
        from_attributes = True