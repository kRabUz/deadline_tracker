from flask import jsonify, request
from services.subject_service import (
    get_all_subjects,
    create_new_subject,
    update_subject,
    delete_subject
)

def init_subject_routes(app):
    @app.route("/subjects", methods=["GET"])
    def get_subjects_route():
        try:
            subjects = get_all_subjects()
            return jsonify(subjects)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route("/subjects", methods=["POST"])
    def add_subject_route():
        try:
            name = request.json.get("name")
            result = create_new_subject(name)
            if "error" in result:
                return jsonify(result[0]), result[1]
            return jsonify(result), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route("/subjects/<int:subject_id>", methods=["PUT"])
    def update_subject_route(subject_id):
        try:
            name = request.json.get("name")
            result = update_subject(subject_id, name)
            if "error" in result:
                return jsonify(result[0]), result[1]
            return jsonify(result), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route("/subjects/<int:subject_id>", methods=["DELETE"])
    def delete_subject_route(subject_id):
        try:
            result = delete_subject(subject_id)
            return jsonify(result), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500