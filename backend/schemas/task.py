from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int

    name: str

    email: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):

    access_token: str

    token_type: str


class TaskCreate(BaseModel):

    title: str

    description: Optional[str] = None

    priority: str = "Medium"

    status: str = "Pending"

    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):

    title: Optional[str] = None

    description: Optional[str] = None

    priority: Optional[str] = None

    status: Optional[str] = None

    due_date: Optional[datetime] = None

    completed: Optional[bool] = None


class TaskResponse(BaseModel):

    id: int

    title: str

    description: Optional[str]

    priority: str

    status: str

    due_date: Optional[datetime]

    completed: bool

    created_at: datetime

    class Config:
        from_attributes = True