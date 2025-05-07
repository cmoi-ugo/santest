from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..services import auth
from ..models import user as user_model
from ..schemas.user import UserCreate
from ..config.database import get_db
from ..config.constants import (
    HTTP_400_BAD_REQUEST, 
    HTTP_401_UNAUTHORIZED, 
    ACCOUNT_ALREADY_EXISTS, 
    USER_CREATED, 
    INVALID_IDS, 
    TOKEN_TYPE,
)


router = APIRouter()

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)): 
    existing_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail=ACCOUNT_ALREADY_EXISTS
        )
    hashed_password = auth.get_password_hash(user.password)
    new_user = user_model.User(
        email=user.email, 
        hashed_password=hashed_password,
        is_admin=user.is_admin 
    )
    db.add(new_user)
    db.commit()
    return {"msg": USER_CREATED}

@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail=INVALID_IDS
        )
    token = auth.create_access_token(data={"sub": db_user.email, "is_admin": db_user.is_admin})
    return {
        "access_token": token,
        "token_type": TOKEN_TYPE,
        "is_admin": db_user.is_admin
    }
