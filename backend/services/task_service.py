
from extensions import db
from models.subject import Subject
from models.task import Task
from utils.exceptions import NotFoundError


class TaskService:
    @staticmethod
    def get_tasks(user_id, completed=None):
        query = Task.query.filter_by(user_id=user_id)

        if completed in (True, False):
            query = query.filter(Task.is_completed == completed)

        return query.order_by(Task.deadline.asc()).all()

    @staticmethod
    def create_task(user_id, task_data):
        subject = Subject.query.filter_by(
            id=task_data["subject_id"], user_id=user_id
        ).first()

        if not subject:
            raise NotFoundError("Subject not found or doesn't belong to you")

        task = Task(user_id=user_id, **task_data)
        db.session.add(task)
        db.session.commit()
        return task

    @staticmethod
    def update_task(user_id, task_id, task_data):
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            raise NotFoundError("Task not found")

        subject = Subject.query.filter_by(
            id=task_data["subject_id"], user_id=user_id
        ).first()
        if not subject:
            raise NotFoundError("Subject not found")

        for key, value in task_data.items():
            setattr(task, key, value)

        db.session.commit()
        return task

    @staticmethod
    def delete_task(user_id, task_id):
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            raise NotFoundError("Task not found")

        db.session.delete(task)
        db.session.commit()

    @staticmethod
    def toggle_task_status(user_id, task_id):
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()
        if not task:
            raise NotFoundError("Task not found")

        task.is_completed = not task.is_completed
        db.session.commit()
        return task
