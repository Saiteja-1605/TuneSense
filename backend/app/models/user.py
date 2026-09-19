from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import datetime

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, json_schema_extra={"example": "Alex Rivera"})
    email: EmailStr = Field(..., json_schema_extra={"example": "alex@example.com"})
    password: str = Field(..., min_length=6, max_length=100, json_schema_extra={"example": "securePassword123"})

class UserLogin(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "alex@example.com"})
    password: str = Field(..., json_schema_extra={"example": "securePassword123"})

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
