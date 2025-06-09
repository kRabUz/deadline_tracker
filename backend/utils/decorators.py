from functools import wraps

import jwt
from config import Config
from extensions import db
from flask import jsonify, request
from models.user import User


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return "", 200

        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split()[1]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user = db.session.get(User, data["user_id"])
            if not current_user:
                raise ValueError("User not found")
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({"error": "Token is invalid!", "details": str(e)}), 401

    return decorated
