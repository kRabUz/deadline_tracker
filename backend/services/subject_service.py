from models import db, Subject
from sqlalchemy import func, and_

def get_all_subjects():
    """Get all subjects ordered by ID"""
    subjects = Subject.query.order_by(Subject.id).all()
    return [{"id": s.id, "name": s.name} for s in subjects]

def create_new_subject(name):
    """Create new subject"""
    if not name:
        return {"error": "Name is required"}, 400

    if Subject.query.filter(func.lower(Subject.name) == func.lower(name)).first():
        return {"error": "Subject already exists"}, 400

    subject = Subject(name=name)
    db.session.add(subject)
    db.session.commit()
    return {"message": "Subject added", "id": subject.id}

def update_subject(subject_id, name):
    """Update existing subject"""
    subject = Subject.query.get_or_404(subject_id)
    
    if not name:
        return {"error": "Name is required"}, 400

    if Subject.query.filter(
        and_(
            func.lower(Subject.name) == func.lower(name),
            Subject.id != subject_id
        )
    ).first():
        return {"error": "Subject already exists"}, 400

    subject.name = name
    db.session.commit()
    return {"message": "Subject updated"}

def delete_subject(subject_id):
    """Delete subject and related tasks"""
    subject = Subject.query.get_or_404(subject_id)
    TaskList.query.filter_by(subject_id=subject_id).delete()
    db.session.delete(subject)
    db.session.commit()
    return {"message": "Subject and related tasks deleted"}