from datetime import datetime, timedelta

import jwt
from config import Config
from extensions import db
from models.user import User
from utils.exceptions import AuthError, ValidationError
from werkzeug.security import check_password_hash, generate_password_hash


class AuthService:
    @staticmethod
    def register(username, password, confirm_password):
        if not all([username, password, confirm_password]):
            raise ValidationError(
                "Username, password and confirm_password are required!"
            )

        if password != confirm_password:
            raise ValidationError("Passwords do not match!")

        if User.query.filter_by(username=username).first():
            raise ValidationError("Username already exists!")

        user = User(username=username, password_hash=generate_password_hash(password))
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def login(username, password):
        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password_hash, password):
            raise AuthError("Invalid credentials!")

        return user

    @staticmethod
    def generate_token(user_id):
        return jwt.encode(
            {
                "user_id": user_id,
                "exp": datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
            },
            Config.SECRET_KEY,
            algorithm="HS256",
        )
