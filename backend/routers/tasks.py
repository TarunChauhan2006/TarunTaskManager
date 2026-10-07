from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Task, User
from schemas import TaskCreate, TaskUpdate, TaskResponse
from auth import get_current_user
from services.gmail_service import send_email


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


# =========================================================
# CREATE TASK
# =========================================================

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED
)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignee = None

    # Validate assigned user
    if task_data.assignee_id is not None:

        assignee = db.query(User).filter(
            User.id == task_data.assignee_id
        ).first()

        if not assignee:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found"
            )

    # Create task
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        due_date=task_data.due_date,
        owner_id=current_user.id,
        assignee_id=task_data.assignee_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # -----------------------------------------------------
    # SEND EMAIL TO ASSIGNEE
    # -----------------------------------------------------

    if assignee:

        try:
            send_email(
                to_email=assignee.email,
                subject="New Task Assigned - Tarun Task Manager",
                body=f"""
Hello {assignee.name},

You have been assigned a new task.

Task: {new_task.title}
Priority: {new_task.priority}

Description:
{new_task.description or "No description provided"}

Assigned by:
{current_user.name}

Please login to Tarun Task Manager to view the task.

Regards,
Tarun Task Manager
"""
            )

        except Exception as e:
            print("Task assignment email failed:", e)

    return new_task


# =========================================================
# GET ALL TASKS
# =========================================================

@router.get(
    "/",
    response_model=list[TaskResponse]
)
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    tasks = db.query(Task).filter(
        (Task.owner_id == current_user.id) |
        (Task.assignee_id == current_user.id)
    ).order_by(
        Task.created_at.desc()
    ).all()

    return tasks


# =========================================================
# GET SINGLE TASK
# =========================================================

@router.get(
    "/{task_id}",
    response_model=TaskResponse
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    task = db.query(Task).filter(
        Task.id == task_id,
        (
            (Task.owner_id == current_user.id) |
            (Task.assignee_id == current_user.id)
        )
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


# =========================================================
# UPDATE TASK
# =========================================================

@router.put(
    "/{task_id}",
    response_model=TaskResponse
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    # Validate new assignee
    if task_data.assignee_id is not None:

        assignee = db.query(User).filter(
            User.id == task_data.assignee_id
        ).first()

        if not assignee:
            raise HTTPException(
                status_code=404,
                detail="Assigned user not found"
            )

    # Update only supplied fields
    update_data = task_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task


# =========================================================
# COMPLETE TASK
# =========================================================

@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse
)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    task = db.query(Task).filter(
        Task.id == task_id,
        (
            (Task.owner_id == current_user.id) |
            (Task.assignee_id == current_user.id)
        )
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    # Mark completed
    task.completed = True
    task.status = "Completed"

    db.commit()
    db.refresh(task)

    # -----------------------------------------------------
    # SEND COMPLETION EMAIL TO TASK OWNER
    # -----------------------------------------------------

    try:

        owner = db.query(User).filter(
            User.id == task.owner_id
        ).first()

        if owner:

            send_email(
                to_email=owner.email,
                subject="Task Completed - Tarun Task Manager",
                body=f"""
Hello {owner.name},

Your task has been completed.

Task:
{task.title}

Completed by:
{current_user.name}

The task status is now Completed.

Regards,
Tarun Task Manager
"""
            )

    except Exception as e:
        print("Task completion email failed:", e)

    return task


# =========================================================
# DELETE TASK
# =========================================================

@router.delete(
    "/{task_id}"
)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }