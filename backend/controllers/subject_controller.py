from flask import jsonify, request
from services.subject_service import SubjectService
from utils.decorators import token_required
from utils.exceptions import NotFoundError, ValidationError


class SubjectController:
    @staticmethod
    @token_required
    def get_subjects(current_user):
        try:
            subjects = SubjectService.get_subjects(current_user.id)
            return (
                jsonify(
                    [{"id": subject.id, "name": subject.name} for subject in subjects]
                ),
                200,
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @token_required
    def create_subject(current_user):
        try:
            name = request.json.get("name")
            if not name:
                return jsonify({"error": "Name is required"}), 400

            subject = SubjectService.create_subject(current_user.id, name)
            return (
                jsonify(
                    {
                        "message": "Subject added",
                        "subject": {"id": subject.id, "name": subject.name},
                    }
                ),
                201,
            )
        except ValidationError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    @token_required
    def update_subject(current_user, subject_id):
        try:
            name = request.json.get("name")
            if not name:
                return jsonify({"error": "Name is required"}), 400

            subject = SubjectService.update_subject(current_user.id, subject_id, name)
            return (
                jsonify(
                    {
                        "message": "Subject updated",
                        "subject": {"id": subject.id, "name": subject.name},
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
    def delete_subject(current_user, subject_id):
        try:
            SubjectService.delete_subject(current_user.id, subject_id)
            return jsonify({"message": "Subject and related tasks deleted"}), 200
        except NotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
