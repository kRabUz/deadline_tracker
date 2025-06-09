
from extensions import db


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(200), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subjects.id"), nullable=False)
    priority = db.Column(db.Enum("Low", "High", name="priority_enum"), nullable=False)
    difficulty = db.Column(
        db.Enum("Easy", "Medium", "Hard", name="difficulty_enum"), nullable=False
    )
    deadline = db.Column(db.Date, nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    subject = db.relationship("Subject", back_populates="tasks")
    user = db.relationship("User", back_populates="tasks")

    def __repr__(self):
        return f"<Task {self.task_name}>"
