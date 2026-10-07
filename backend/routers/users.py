from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(
        User.id != current_user.id
    ).order_by(
        User.name
    ).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
        for user in users
    ]