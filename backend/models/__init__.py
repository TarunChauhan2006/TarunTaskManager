from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Tasks created by this user
    tasks = relationship(
        "Task",
        back_populates="owner",
        foreign_keys="Task.owner_id",
        cascade="all, delete-orphan"
    )

    # Tasks assigned to this user
    assigned_tasks = relationship(
        "Task",
        back_populates="assignee",
        foreign_keys="Task.assignee_id"
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    priority = Column(
        String(20),
        default="Medium",
        nullable=False
    )

    status = Column(
        String(30),
        default="Pending",
        nullable=False
    )

    due_date = Column(
        DateTime,
        nullable=True
    )

    completed = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # User who created the task
    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # User who is assigned the task
    assignee_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    owner = relationship(
        "User",
        back_populates="tasks",
        foreign_keys=[owner_id]
    )

    assignee = relationship(
        "User",
        back_populates="assigned_tasks",
        foreign_keys=[assignee_id]
    )