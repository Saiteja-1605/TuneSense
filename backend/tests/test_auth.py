import pytest
from app.auth.security import hash_password, verify_password
from app.auth.jwt import create_access_token
import jwt
from app.config import settings

def test_password_hashing():
    raw_pwd = "MySecretPassword123!"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_lifecycle():
    user_data = {"sub": "user_12345", "email": "test@tunesense.io"}
    token = create_access_token(user_data)
    assert isinstance(token, str)
    
    decoded = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == "user_12345"
    assert decoded["email"] == "test@tunesense.io"
    assert "exp" in decoded
