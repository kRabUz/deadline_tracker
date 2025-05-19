import os
from datetime import datetime, timedelta
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
    """Отримати всі завдання"""
    try:
        tasks = TaskList.query.all()
        return jsonify([{
            "id": task.id,
            "task_name": task.task_name,
            "subject_id": task.subject_id,
            "subject_name": task.subject.name,
            "priority": task.priority,
            "difficulty": task.difficulty,
            "deadline": task.deadline.isoformat(),
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

        task = TaskList(**data)
        db.session.add(task)
        db.session.commit()
        return jsonify({"message": "Task added", "id": task.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    """Оновити завдання"""
    try:
        task = TaskList.query.get_or_404(task_id)
        data = request.get_json()
        
        if error := validate_task_data(data):
            return error

        for field in ["task_name", "subject_id", "priority", "difficulty", "deadline"]:
            setattr(task, field, data[field])
        
        db.session.commit()
        return jsonify({"message": "Task updated"}), 200
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
        subjects = Subject.query.order_by(Subject.id).all()  # Додано сортування за ID
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
        return jsonify({"message": "Subject added", "id": subject.id}), 201
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

        # Перевірка на унікальність (крім поточного предмета)
        if Subject.query.filter(
            and_(
                func.lower(Subject.name) == func.lower(name),
                Subject.id != subject_id
            )
        ).first():
            return jsonify({"error": "Subject already exists"}), 400

        subject.name = name
        db.session.commit()
        return jsonify({"message": "Subject updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/subjects/<int:subject_id>", methods=["DELETE"])
def delete_subject(subject_id):
    """Видалити предмет"""
    try:
        subject = Subject.query.get_or_404(subject_id)
        
        # Спочатку видаляємо всі пов'язані завдання
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