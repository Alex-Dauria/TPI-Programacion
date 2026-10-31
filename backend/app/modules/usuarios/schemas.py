from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    """Entrada de POST /auth/register. El rol no se envía: el registro público siempre crea "user"."""

    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    # Máximo 72: es el límite de bcrypt.
    password: str = Field(min_length=8, max_length=72)


class UserPublic(SQLModel):
    """Datos públicos del usuario: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
