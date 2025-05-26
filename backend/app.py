import os
from flask import Flask
from flask_cors import CORS
from models import db
from routes.task_routes import init_task_routes
from routes.subject_routes import init_subject_routes
from routes.topsis_routes import init_topsis_routes

def create_app():
    app = Flask(__name__)
    
    # Конфігурація
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", 
        "postgresql://user:password@postgres:5432/fitness_track"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Ініціалізація розширень
    db.init_app(app)
    CORS(app, resources={
        r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}
    })
    
    # Реєстрація маршрутів
    init_task_routes(app)
    init_subject_routes(app)
    init_topsis_routes(app)
    
    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)