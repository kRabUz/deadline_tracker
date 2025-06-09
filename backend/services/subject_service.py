from extensions import db
from models.subject import Subject
from models.task import Task
from sqlalchemy import and_, func
from utils.exceptions import NotFoundError, ValidationError


class SubjectService:
    @staticmethod
    def get_subjects(user_id):
        return (
            Subject.query.filter_by(user_id=user_id).order_by(Subject.name.asc()).all()
        )

    @staticmethod
    def create_subject(user_id, name):
        if not name:
            raise ValidationError("Name is required")

        if Subject.query.filter_by(name=name, user_id=user_id).first():
            raise ValidationError("Subject already exists")

        subject = Subject(name=name, user_id=user_id)
        db.session.add(subject)
        db.session.commit()
        return subject

    @staticmethod
    def update_subject(user_id, subject_id, name):
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()
        if not subject:
            raise NotFoundError("Subject not found")

        if not name:
            raise ValidationError("Name is required")

        if Subject.query.filter(
            and_(
                func.lower(Subject.name) == func.lower(name),
                Subject.id != subject_id,
                Subject.user_id == user_id,
            )
        ).first():
            raise ValidationError("Subject already exists")

        subject.name = name
        db.session.commit()
        return subject

    @staticmethod
    def delete_subject(user_id, subject_id):
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()
        if not subject:
            raise NotFoundError("Subject not found")

        Task.query.filter_by(subject_id=subject_id, user_id=user_id).delete()
        db.session.delete(subject)
        db.session.commit()
