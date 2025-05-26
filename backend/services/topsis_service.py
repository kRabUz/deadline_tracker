import numpy as np
import pandas as pd
from datetime import datetime
from models import TaskList

def calculate_topsis():
    """Calculate task recommendations using TOPSIS method"""
    tasks = TaskList.query.all()
    
    if not tasks:
        return []
    
    # Prepare decision matrix
    tasks_matrix = []
    for task in tasks:
        priority = 2 if task.priority == 'High' else 1
        difficulty_map = {'Easy': 1, 'Medium': 2, 'Hard': 3}
        difficulty = difficulty_map.get(task.difficulty, 2)
        hours_left = (task.deadline - datetime.now().date()).days * 24
        hours_left = max(hours_left, 0)
        
        tasks_matrix.append({
            'id': task.id,
            'task_name': task.task_name,
            'subject_id': task.subject_id,
            'priority': priority,
            'difficulty': difficulty,
            'hours_left': hours_left,
            'original_data': {
                'priority': task.priority,
                'difficulty': task.difficulty,
                'deadline': task.deadline.isoformat()
            }
        })

    df = pd.DataFrame(tasks_matrix)
    
    # Criteria and weights
    criteria = ['priority', 'difficulty', 'hours_left']
    weights = [0.4, 0.3, 0.3]  # Priority has highest weight
    directions = [+1, -1, -1]   # Priority to maximize, others to minimize
    
    # Normalization
    norm_matrix = df[criteria] / np.sqrt((df[criteria] ** 2).sum(axis=0))
    
    # Weighted matrix
    weighted_matrix = norm_matrix * weights
    
    # Ideal and anti-ideal solutions
    ideal_best = weighted_matrix.max()
    ideal_worst = weighted_matrix.min()
    
    # Distances
    dist_best = np.sqrt(((weighted_matrix - ideal_best) ** 2).sum(axis=1))
    dist_worst = np.sqrt(((weighted_matrix - ideal_worst) ** 2).sum(axis=1))
    
    # Closeness coefficients
    df['score'] = dist_worst / (dist_best + dist_worst)
    
    # Prepare results
    result = df.sort_values('score', ascending=False)
    return result.to_dict('records')