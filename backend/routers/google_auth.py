import os

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth

from database import get_db
from models import User
from auth import create_access_token


router = APIRouter(
    prefix="/auth/google",
    tags=["Google Authentication"]
)


oauth = OAuth()

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)


@router.get("/login")
async def google_login(request: Request):
    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "http://127.0.0.1:8000/auth/google/callback"
    )

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


@router.get("/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")

        if not user_info:
            raise HTTPException(
                status_code=400,
                detail="Unable to retrieve Google user information"
            )

        email = user_info["email"]
        name = user_info.get("name", email.split("@")[0])

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            user = User(
                name=name,
                email=email,
                password="GOOGLE_OAUTH_USER"
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        access_token = create_access_token(user.id)

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173"
        )

        return RedirectResponse(
            url=f"{frontend_url}/oauth-success?token={access_token}"
        )

    except Exception as e:
        print("Google OAuth error:", e)

        raise HTTPException(
            status_code=400,
            detail="Google authentication failed"
        )