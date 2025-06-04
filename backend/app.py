import os
from datetime import datetime
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import func, and_

# ========= Ініціалізація додатку =========
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"]
    }
})

# Конфігурація
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:password@postgres:5432/fitness_track"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# ========= Моделі =========
class Subject(db.Model):
    """Модель предмета"""
    __tablename__ = "subjects"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class TaskList(db.Model):
    """Модель завдання"""
    __tablename__ = "task_list"
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(200), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    priority = db.Column(db.Enum("Low", "High", name="priority_enum"), nullable=False)
    difficulty = db.Column(db.Enum("Easy", "Medium", "Hard", name="difficulty_enum"), nullable=False)
    deadline = db.Column(db.Date, nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    subject = db.relationship("Subject", backref=db.backref("tasks", lazy=True, cascade="all, delete-orphan"))

# ========= Допоміжні функції =========
def validate_task_data(data):
    """Валідація даних завдання"""
    required_fields = ["task_name", "subject_id", "priority", "difficulty", "deadline"]
    if missing := [field for field in required_fields if field not in data]:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    
    try:
        data["deadline"] = datetime.fromisoformat(data["deadline"]).date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    return None

# ========= API для завдань =========
@app.route("/tasks", methods=["GET"])
def get_tasks():
    """Отримати всі завдання з можливістю фільтрації"""
    try:
        tasks_query = TaskList.query
        
        # Фільтрація за статусом виконання
        if (completed_param := request.args.get("completed")) in ("true", "false"):
            tasks_query = tasks_query.filter(TaskList.is_completed == (completed_param == "true"))
        
        tasks = tasks_query.order_by(TaskList.deadline.asc()).all()
        
        return jsonify([{
            "id": task.id,
            "task_name": task.task_name,
            "subject_id": task.subject_id,
            "subject_name": task.subject.name,
            "priority": task.priority,
            "difficulty": task.difficulty,
            "deadline": task.deadline.isoformat(),
            "is_completed": task.is_completed
        } for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tasks", methods=["POST"])
def add_task():
    """Додати нове завдання"""
    try:
        data = request.get_json()
        if error := validate_task_data(data):
            return error

        if not Subject.query.get(data["subject_id"]):
            return jsonify({"error": "Subject not found"}), 404

        data.setdefault("is_completed", False)
        task = TaskList(**data)
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
def update_task(task_id):
    """Оновити завдання"""
    try:
        task = TaskList.query.get_or_404(task_id)
        data = request.get_json()
        
        # Перевірка обов'язкових полів
        required_fields = ["task_name", "subject_id", "priority", "difficulty", "deadline"]
        if missing := [field for field in required_fields if field not in data]:
            return jsonify({"error": f"Відсутні обов'язкові поля: {', '.join(missing)}"}), 400

        # Обробка дати з явним вказівкам формату
        try:
            deadline = datetime.strptime(data["deadline"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Невірний формат дати. Використовуйте YYYY-MM-DD"}), 400

        # Оновлення полів
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
            "deadline": task.deadline.isoformat(),  # <- ISO для виводу
            "is_completed": task.is_completed
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Помилка сервера: {str(e)}"}), 500

@app.route("/tasks/<int:task_id>/toggle", methods=["PATCH"])
def toggle_task_status(task_id):
    """Переключити статус виконання завдання"""
    try:
        task = TaskList.query.get_or_404(task_id)
        task.is_completed = not task.is_completed
        db.session.commit()
        return jsonify({
            "message": "Task status toggled",
            "is_completed": task.is_completed
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Видалити завдання"""
    try:
        task = TaskList.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ========= API для предметів =========
@app.route("/subjects", methods=["GET"])
def get_subjects():
    """Отримати всі предмети"""
    try:
        subjects = Subject.query.order_by(Subject.name.asc()).all()
        return jsonify([{"id": s.id, "name": s.name} for s in subjects])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/subjects", methods=["POST"])
def add_subject():
    """Додати новий предмет"""
    try:
        name = request.json.get("name")
        if not name:
            return jsonify({"error": "Name is required"}), 400

        if Subject.query.filter(func.lower(Subject.name) == func.lower(name)).first():
            return jsonify({"error": "Subject already exists"}), 400

        subject = Subject(name=name)
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
def update_subject(subject_id):
    """Оновити предмет"""
    try:
        subject = Subject.query.get_or_404(subject_id)
        name = request.json.get("name")
        if not name:
            return jsonify({"error": "Name is required"}), 400

        if Subject.query.filter(
            and_(
                func.lower(Subject.name) == func.lower(name),
                Subject.id != subject_id
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
def delete_subject(subject_id):
    """Видалити предмет"""
    try:
        subject = Subject.query.get_or_404(subject_id)
        TaskList.query.filter_by(subject_id=subject_id).delete()
        db.session.delete(subject)
        db.session.commit()
        return jsonify({"message": "Subject and related tasks deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ========= Запуск =========
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)