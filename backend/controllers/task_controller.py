from flask import jsonify, request
from recommendations.topsis import TOPSIS
from services.task_service import TaskService
from utils.decorators import token_required
from utils.exceptions import NotFoundError, ValidationError
from utils.validators import validate_task_data


class TaskController:
    @staticmethod
    @token_required
    def get_tasks(current_user):
        try:
            completed = request.args.get("completed")
            if completed in ("true", "false"):
                completed = completed == "true"
            else:
                completed = None

            tasks = TaskService.get_tasks(current_user.id, completed)
            return (
                jsonify(
                    [
                        {
                            "id": task.id,
                            "task_name": task.task_name,
                            "subject_id": task.subject_id,
                            "subject_name": (
                                task.subject.name
                                if task.subject
                                else "Невідомий предмет"
                            ),
                            "priority": task.priority,
                            "difficulty": task.difficulty,
                            "deadline": task.deadline.isoformat(),
                            "is_completed": task.is_completed,
                        }
                        for task in tasks
                    ]
                ),
                200,
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @token_required
    def create_task(current_user):
        try:
            data = request.get_json()
            if error := validate_task_data(data):
                return error

            task = TaskService.create_task(current_user.id, data)
            return (
                jsonify(
                    {
                        "message": "Task created",
                        "task": {
                            "id": task.id,
                            "task_name": task.task_name,
                            "subject_id": task.subject_id,
                            "priority": task.priority,
                            "difficulty": task.difficulty,
                            "deadline": task.deadline.isoformat(),
                            "is_completed": task.is_completed,
                        },
                    }
                ),
                201,
            )
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        except NotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @token_required
    def update_task(current_user, task_id):
        try:
            data = request.get_json()
            if error := validate_task_data(data):
                return error

            task = TaskService.update_task(current_user.id, task_id, data)
            return (
                jsonify(
                    {
                        "id": task.id,
                        "task_name": task.task_name,
                        "subject_id": task.subject_id,
                        "priority": task.priority,
                        "difficulty": task.difficulty,
                        "deadline": task.deadline.isoformat(),
                        "is_completed": task.is_completed,
                    }
                ),
                200,
            )
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        except NotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @token_required
    def toggle_task_status(current_user, task_id):
        try:
            task = TaskService.toggle_task_status(current_user.id, task_id)
            return (
                jsonify(
                    {
                        "message": "Task status updated",
                        "is_completed": task.is_completed,
                    }
                ),
                200,
            )
        except NotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @token_required
    def delete_task(current_user, task_id):
        try:
            TaskService.delete_task(current_user.id, task_id)
            return jsonify({"message": "Task deleted"}), 200
        except NotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @token_required
    def get_recommendations(current_user):
        try:
            weights_param = request.args.get("weights", "0.2,0.2,0.6")
            directions_param = request.args.get("directions", "max,max,min")

            weights = [float(w) for w in weights_param.split(",")]
            directions = directions_param.split(",")

            recommendations = TOPSIS.calculate_recommendations(
                current_user.id, weights=weights, directions=directions
            )

            return (
                jsonify(
                    {
                        "parameters": {
                            "weights": weights,
                            "criteria_directions": directions,
                            "criteria_names": ["priority", "difficulty", "deadline"],
                        },
                        "tasks": [
                            {
                                "id": task.id,
                                "task_name": task.task_name,
                                "subject_id": task.subject_id,
                                "subject": task.subject.name,
                                "priority": task.priority,
                                "difficulty": task.difficulty,
                                "deadline": task.deadline.isoformat(),
                                "topsis_score": score,
                            }
                            for task, score in recommendations
                        ],
                    }
                ),
                200,
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500
