from datetime import datetime

import numpy as np
from models.task import Task


class TOPSIS:
    @staticmethod
    def calculate_recommendations(user_id, weights=None, directions=None):
        default_weights = [0.2, 0.2, 0.6]
        default_directions = ["max", "max", "min"]

        weights = weights or default_weights
        directions = directions or default_directions

        # Перетворення напрямків у числові значення
        direction_map = {"max": 1, "min": -1}
        criteria_directions = np.array([direction_map[d.lower()] for d in directions])

        # Отримання завдань з бази даних
        tasks = Task.query.filter_by(is_completed=False, user_id=user_id).all()
        if not tasks:
            return []

        now = datetime.now()
        decision_matrix = []

        # Побудова матриці рішень
        for task in tasks:
            priority = 1 if task.priority == "Low" else 2
            difficulty_map = {"Easy": 1, "Medium": 3, "Hard": 5}
            difficulty = difficulty_map[task.difficulty]
            deadline_dt = datetime.combine(task.deadline, datetime.min.time())
            hours_left = max(0, (deadline_dt - now).total_seconds() / 3600)
            decision_matrix.append([priority, difficulty, hours_left])

        decision_matrix = np.array(decision_matrix)

        # Нормалізація матриці
        norm_matrix = decision_matrix / np.sqrt((decision_matrix**2).sum(axis=0))

        # Вагова нормалізація
        weighted_matrix = norm_matrix * weights

        # Ідеальні та анти-ідеальні рішення
        PIS = np.where(
            criteria_directions == 1,
            weighted_matrix.max(axis=0),
            weighted_matrix.min(axis=0),
        )
        NIS = np.where(
            criteria_directions == 1,
            weighted_matrix.min(axis=0),
            weighted_matrix.max(axis=0),
        )

        # Відстані до ідеального та анти-ідеального рішень
        dist_to_PIS = np.sqrt(((weighted_matrix - PIS) ** 2).sum(axis=1))
        dist_to_NIS = np.sqrt(((weighted_matrix - NIS) ** 2).sum(axis=1))

        # Відносна близькість до ідеального рішення
        closeness = dist_to_NIS / (dist_to_PIS + dist_to_NIS + 1e-10)

        # Сортування завдань за значенням близькості
        sorted_tasks = sorted(zip(tasks, closeness), key=lambda x: x[1], reverse=True)

        return sorted_tasks
