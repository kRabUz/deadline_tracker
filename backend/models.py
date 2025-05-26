from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

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