from extensions import db


class Subject(db.Model):
    __tablename__ = "subjects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="subjects")
    tasks = db.relationship(
        "Task", back_populates="subject", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Subject {self.name}>"
