import os
import numpy as np
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func, and_
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps

# ========= Ініціалізація додатку =========
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"]
    }
})

# Конфігурація з .env
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.getenv("JWT_SECRET")
app.config["JWT_EXPIRATION_HOURS"] = int(os.getenv("JWT_EXPIRATION_HOURS", 24))
db = SQLAlchemy(app)

# ========= Моделі =========
class User(db.Model):
    """Модель користувача"""
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)

class Subject(db.Model):
    """Модель предмета"""
    __tablename__ = "subjects"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", backref=db.backref("subjects", lazy=True))

class Task(db.Model):
    """Модель завдання"""
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(200), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    priority = db.Column(db.Enum("Low", "High", name="priority_enum"), nullable=False)
    difficulty = db.Column(db.Enum("Easy", "Medium", "Hard", name="difficulty_enum"), nullable=False)
    deadline = db.Column(db.Date, nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    subject = db.relationship("Subject", backref=db.backref("tasks", lazy=True, cascade="all, delete-orphan"))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", backref=db.backref("tasks", lazy=True))

# ========= Допоміжні функції =========
def token_required(f):
    """Декоратор для захисту маршрутів"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split()[1]
        if not token:
            return jsonify({"error": "Token is missing!"}), 401
        
        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            current_user = User.query.get(data["user_id"])
        except Exception as e:
            return jsonify({"error": "Token is invalid!", "details": str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

def validate_task_data(data):
    """Валідація даних завдання"""
    required_fields = ["task_name", "subject_id", "priority", "difficulty", "deadline"]
    if missing := [field for field in required_fields if field not in data]:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    
    try:
        if isinstance(data["deadline"], str):
            data["deadline"] = datetime.fromisoformat(data["deadline"]).date()
        elif isinstance(data["deadline"], dict):
            data["deadline"] = datetime(data["deadline"]["year"], 
                                      data["deadline"]["month"], 
                                      data["deadline"]["day"]).date()
    except (ValueError, TypeError, KeyError) as e:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD", "details": str(e)}), 400
    
    return None

# ========= API для авторизації =========
@app.route("/register", methods=["POST"])
def register():
    """Реєстрація нового користувача"""
    try:
        data = request.get_json()
        if not all(k in data for k in ["username", "password", "confirm_password"]):
            return jsonify({"error": "Username, password and confirm_password are required!"}), 400

        if data["password"] != data["confirm_password"]:
            return jsonify({"error": "Passwords do not match!"}), 400

        if User.query.filter_by(username=data["username"]).first():
            return jsonify({"error": "Username already exists!"}), 400

        user = User(
            username=data["username"],
            password_hash=generate_password_hash(data["password"])
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    """Вхід в систему"""
    try:
        data = request.get_json()
        user = User.query.filter_by(username=data["username"]).first()
        
        if not user or not check_password_hash(user.password_hash, data["password"]):
            return jsonify({"error": "Invalid credentials!"}), 401

        token = jwt.encode({
            "user_id": user.id,
            "exp": datetime.utcnow() + timedelta(hours=app.config["JWT_EXPIRATION_HOURS"])
        }, app.config["SECRET_KEY"], algorithm="HS256")
        
        return jsonify({
            "token": token,
            "user_id": user.id,
            "username": user.username
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========= API для завдань =========
@app.route("/tasks", methods=["GET"])
@token_required
def get_tasks(current_user):
    """Отримати всі завдання користувача"""
    try:
        tasks_query = Task.query.filter_by(user_id=current_user.id)  # Додано фільтрацію по user_id
        
        if (completed_param := request.args.get("completed")) in ("true", "false"):
            tasks_query = tasks_query.filter(Task.is_completed == (completed_param == "true"))
        
        tasks = tasks_query.order_by(Task.deadline.asc()).all()
        
        return jsonify([{
            "id": task.id,
            "task_name": task.task_name,
            "subject_id": task.subject_id,
            "subject_name": task.subject.name if task.subject else "Невідомий предмет",
            "priority": task.priority,
            "difficulty": task.difficulty,
            "deadline": task.deadline.isoformat(),
            "is_completed": task.is_completed
        } for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tasks", methods=["POST"])
@token_required
def add_task(current_user):
    """Додати нове завдання"""
    try:
        data = request.get_json()
        if error := validate_task_data(data):
            return error

        # Перевіряємо, чи subject належить поточному користувачу
        subject = Subject.query.filter_by(id=data["subject_id"], user_id=current_user.id).first()
        if not subject:
            return jsonify({"error": "Subject not found or doesn't belong to you"}), 404

        # Додаємо user_id до завдання
        task = Task(
            user_id=current_user.id,
            **data
        )
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            "message": "Task added",
            "task": {
                "id": task.id,
                "is_completed": task.is_completed,
                **{k: v for k, v in data.items() if k != "deadline"},
                "deadline": task.deadline.isoformat()
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/<int:task_id>", methods=["PUT"])
@token_required
def update_task(current_user, task_id):
    """Оновити завдання"""
    try:
        task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
        data = request.get_json()
        
        required_fields = ["task_name", "subject_id", "priority", "difficulty", "deadline"]
        if missing := [field for field in required_fields if field not in data]:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        try:
            deadline = datetime.fromisoformat(data["deadline"]).date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        subject = Subject.query.filter_by(id=data["subject_id"], user_id=current_user.id).first()
        if not subject:
            return jsonify({"error": "Subject not found"}), 404

        task.task_name = data["task_name"]
        task.subject_id = data["subject_id"]
        task.priority = data["priority"]
        task.difficulty = data["difficulty"]
        task.deadline = deadline
        task.is_completed = data.get("is_completed", task.is_completed)
        
        db.session.commit()
        
        return jsonify({
            "id": task.id,
            "task_name": task.task_name,
            "subject_id": task.subject_id,
            "priority": task.priority,
            "difficulty": task.difficulty,
            "deadline": task.deadline.isoformat(),
            "is_completed": task.is_completed
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/<int:task_id>/toggle", methods=["PATCH"])
@token_required
def toggle_task_status(current_user, task_id):
    """Змінити статус виконання завдання"""
    try:
        task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
        task.is_completed = not task.is_completed
        db.session.commit()
        return jsonify({
            "message": "Task status updated",
            "is_completed": task.is_completed
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_user, task_id):
    """Видалити завдання"""
    try:
        task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ========= API для предметів =========
@app.route("/subjects", methods=["GET"])
@token_required
def get_subjects(current_user):
    """Отримати всі предмети користувача"""
    try:
        subjects = Subject.query.filter_by(user_id=current_user.id).order_by(Subject.name.asc()).all()
        return jsonify([{"id": s.id, "name": s.name} for s in subjects])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/subjects", methods=["POST"])
@token_required
def add_subject(current_user):
    """Додати новий предмет"""
    try:
        name = request.json.get("name")
        if not name:
            return jsonify({"error": "Name is required"}), 400

        if Subject.query.filter_by(name=name, user_id=current_user.id).first():
            return jsonify({"error": "Subject already exists"}), 400

        subject = Subject(name=name, user_id=current_user.id)
        db.session.add(subject)
        db.session.commit()
        return jsonify({
            "message": "Subject added",
            "subject": {"id": subject.id, "name": subject.name}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/subjects/<int:subject_id>", methods=["PUT"])
@token_required
def update_subject(current_user, subject_id):
    """Оновити предмет"""
    try:
        subject = Subject.query.filter_by(id=subject_id, user_id=current_user.id).first_or_404()
        name = request.json.get("name")
        if not name:
            return jsonify({"error": "Name is required"}), 400

        if Subject.query.filter(
            and_(
                func.lower(Subject.name) == func.lower(name),
                Subject.id != subject_id,
                Subject.user_id == current_user.id
            )
        ).first():
            return jsonify({"error": "Subject already exists"}), 400

        subject.name = name
        db.session.commit()
        return jsonify({
            "message": "Subject updated",
            "subject": {"id": subject.id, "name": subject.name}
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/subjects/<int:subject_id>", methods=["DELETE"])
@token_required
def delete_subject(current_user, subject_id):
    """Видалити предмет"""
    try:
        subject = Subject.query.filter_by(id=subject_id, user_id=current_user.id).first_or_404()
        Task.query.filter_by(subject_id=subject_id, user_id=current_user.id).delete()
        db.session.delete(subject)
        db.session.commit()
        return jsonify({"message": "Subject and related tasks deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/recommendations", methods=["GET"])
@token_required
def get_recommendations(current_user):
    """Отримати рекомендації завдань"""
    try:
        default_weights = "0.2,0.2,0.6"
        default_directions = "max,max,min"

        weights_param = request.args.get("weights", default_weights)
        directions_param = request.args.get("directions", default_directions)

        try:
            weights = [float(w) for w in weights_param.split(",")]
            if len(weights) != 3 or not all(w >= 0 for w in weights):
                raise ValueError
            weights = np.array(weights) / sum(weights)
        except ValueError:
            return jsonify({
                "error": "Invalid weights format. Use three comma-separated numbers, e.g. 0.2,0.2,0.6",
                "example": default_weights
            }), 400

        try:
            directions = []
            for d in directions_param.split(","):
                if d.strip().lower() == "min":
                    directions.append(-1)
                else:
                    directions.append(+1)
            if len(directions) != 3:
                raise ValueError
            criteria_directions = np.array(directions)
        except ValueError:
            return jsonify({
                "error": "Invalid directions format. Use three comma-separated values (min/max), e.g. max,min,min",
                "example": default_directions
            }), 400

        tasks = Task.query.filter_by(is_completed=False, user_id=current_user.id).all()
        
        if not tasks:
            return jsonify([])
        
        now = datetime.now()
        decision_matrix = []
        for task in tasks:
            priority = 1 if task.priority == "Low" else 2
            difficulty_map = {"Easy": 1, "Medium": 3, "Hard": 5}
            difficulty = difficulty_map[task.difficulty]
            deadline_dt = datetime.combine(task.deadline, datetime.min.time())
            hours_left = max(0, (deadline_dt - now).total_seconds() / 3600)
            decision_matrix.append([priority, difficulty, hours_left])
        
        decision_matrix = np.array(decision_matrix)
        norm_matrix = decision_matrix / np.sqrt((decision_matrix ** 2).sum(axis=0))
        weighted_matrix = norm_matrix * weights
        
        PIS = np.where(criteria_directions == 1, 
                      weighted_matrix.max(axis=0),
                      weighted_matrix.min(axis=0))
        NIS = np.where(criteria_directions == 1,
                      weighted_matrix.min(axis=0),
                      weighted_matrix.max(axis=0))
        
        dist_to_PIS = np.sqrt(((weighted_matrix - PIS) ** 2).sum(axis=1))
        dist_to_NIS = np.sqrt(((weighted_matrix - NIS) ** 2).sum(axis=1))
        closeness = dist_to_NIS / (dist_to_PIS + dist_to_NIS + 1e-10)
        
        sorted_tasks = sorted(zip(tasks, closeness), key=lambda x: x[1], reverse=True)
        
        result = {
            "parameters": {
                "weights": [float(w) for w in weights],
                "criteria_directions": ["max" if d == 1 else "min" for d in criteria_directions],
                "criteria_names": ["priority", "difficulty", "deadline"]
            },
            "tasks": []
        }
        
        for task, score in sorted_tasks:
            task_data = {
                "id": task.id,
                "task_name": task.task_name,
                "subject_id": task.subject_id,
                "subject": task.subject.name,
                "priority": task.priority,
                "difficulty": task.difficulty,
                "deadline": task.deadline.isoformat(),
                "hours_until_deadline": round((datetime.combine(task.deadline, datetime.min.time()) - now).total_seconds() / 3600, 1),
                "topsis_score": round(float(score), 4)
            }
            result["tasks"].append(task_data)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========= Запуск =========
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)