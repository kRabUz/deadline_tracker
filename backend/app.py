from config import Config
from controllers.auth_controller import AuthController
from controllers.subject_controller import SubjectController
from controllers.task_controller import TaskController
from extensions import cors, db
from flask import Flask


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Ініціалізація розширень
    db.init_app(app)
    cors.init_app(
        app,
        resources={r"/*": {"origins": Config.CORS_ORIGINS}},
        supports_credentials=True,
    )

    # Реєстрація маршрутів
    app.add_url_rule("/register", "register", AuthController.register, methods=["POST"])
    app.add_url_rule("/login", "login", AuthController.login, methods=["POST"])

    # Tasks routes
    app.add_url_rule("/tasks", "get_tasks", TaskController.get_tasks, methods=["GET"])
    app.add_url_rule(
        "/tasks", "create_task", TaskController.create_task, methods=["POST"]
    )
    app.add_url_rule(
        "/tasks/<int:task_id>",
        "update_task",
        TaskController.update_task,
        methods=["PUT"],
    )
    app.add_url_rule(
        "/tasks/<int:task_id>/toggle",
        "toggle_task",
        TaskController.toggle_task_status,
        methods=["PATCH"],
    )
    app.add_url_rule(
        "/tasks/<int:task_id>",
        "delete_task",
        TaskController.delete_task,
        methods=["DELETE"],
    )
    app.add_url_rule(
        "/tasks/recommendations",
        "get_recommendations",
        TaskController.get_recommendations,
        methods=["GET", "OPTIONS"],
    )

    # Subjects routes
    app.add_url_rule(
        "/subjects", "get_subjects", SubjectController.get_subjects, methods=["GET"]
    )
    app.add_url_rule(
        "/subjects",
        "create_subject",
        SubjectController.create_subject,
        methods=["POST"],
    )
    app.add_url_rule(
        "/subjects/<int:subject_id>",
        "update_subject",
        SubjectController.update_subject,
        methods=["PUT"],
    )
    app.add_url_rule(
        "/subjects/<int:subject_id>",
        "delete_subject",
        SubjectController.delete_subject,
        methods=["DELETE"],
    )

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)
