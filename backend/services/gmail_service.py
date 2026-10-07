import os
import base64
from email.mime.text import MIMEText

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


def send_email(to_email: str, subject: str, body: str):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN")

    if not all([client_id, client_secret, refresh_token]):
        print("Gmail credentials not configured")
        return False

    credentials = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=["https://www.googleapis.com/auth/gmail.send"],
    )

    service = build("gmail", "v1", credentials=credentials)

    message = MIMEText(body)
    message["to"] = to_email
    message["subject"] = subject

    raw = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()

    service.users().messages().send(
        userId="me",
        body={"raw": raw}
    ).execute()

    return True