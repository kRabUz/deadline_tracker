from models import db, TaskList, Subject
from datetime import datetime

def validate_task_data(data):
    """Validate task data"""
    required_fields = ["task_name", "subject_id", "priority", "difficulty", "deadline"]
    if missing := [field for field in required_fields if field not in data]:
        return {"error": f"Missing fields: {', '.join(missing)}"}, 400
    
    try:
        data["deadline"] = datetime.fromisoformat(data["deadline"]).date()
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}, 400
    
    return None

def get_all_tasks():
    """Get all tasks with subject names"""
    tasks = TaskList.query.all()
    return [{
        "id": task.id,
        "task_name": task.task_name,
        "subject_id": task.subject_id,
        "subject_name": task.subject.name,
        "priority": task.priority,
        "difficulty": task.difficulty,
        "deadline": task.deadline.isoformat(),
    } for task in tasks]

def create_new_task(data):
    """Create new task"""
    if not Subject.query.get(data["subject_id"]):
        return {"error": "Subject not found"}, 404
    
    task = TaskList(**data)
    db.session.add(task)
    db.session.commit()
    return {"message": "Task added", "id": task.id}

def update_existing_task(task_id, data):
    """Update existing task"""
    task = TaskList.query.get_or_404(task_id)
    for field in ["task_name", "subject_id", "priority", "difficulty", "deadline"]:
        setattr(task, field, data[field])
    db.session.commit()
    return {"message": "Task updated"}

def delete_existing_task(task_id):
    """Delete task"""
    task = TaskList.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return {"message": "Task deleted"}