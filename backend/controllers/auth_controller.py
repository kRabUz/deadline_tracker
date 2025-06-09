from flask import jsonify, request
from services.auth_service import AuthService
from utils.exceptions import AuthError, ValidationError


class AuthController:
    @staticmethod
    def register():
        try:
            data = request.get_json()
            user = AuthService.register(
                data["username"], data["password"], data["confirm_password"]
            )
            token = AuthService.generate_token(user.id)
            return (
                jsonify(
                    {
                        "message": "User registered successfully",
                        "token": token,
                        "user_id": user.id,
                        "username": user.username,
                    }
                ),
                201,
            )
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def login():
        try:
            data = request.get_json()
            user = AuthService.login(data["username"], data["password"])
            token = AuthService.generate_token(user.id)
            return (
                jsonify(
                    {"token": token, "user_id": user.id, "username": user.username}
                ),
                200,
            )
        except AuthError as e:
            return jsonify({"error": str(e)}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 500
