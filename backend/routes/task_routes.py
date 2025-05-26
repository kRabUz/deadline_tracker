from flask import jsonify, request
from services.task_service import (
    validate_task_data,
    get_all_tasks,
    create_new_task,
    update_existing_task,
    delete_existing_task
)

def init_task_routes(app):
    @app.route("/tasks", methods=["GET"])
    def get_tasks_route():
        try:
            tasks = get_all_tasks()
            return jsonify(tasks)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/tasks", methods=["POST"])
    def add_task_route():
        try:
            data = request.get_json()
            if error := validate_task_data(data):
                return jsonify(error[0]), error[1]
            
            result = create_new_task(data)
            if "error" in result:
                return jsonify(result[0]), result[1]
            return jsonify(result), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route("/tasks/<int:task_id>", methods=["PUT"])
    def update_task_route(task_id):
        try:
            data = request.get_json()
            if error := validate_task_data(data):
                return jsonify(error[0]), error[1]
            
            result = update_existing_task(task_id, data)
            return jsonify(result), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route("/tasks/<int:task_id>", methods=["DELETE"])
    def delete_task_route(task_id):
        try:
            result = delete_existing_task(task_id)
            return jsonify(result), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500