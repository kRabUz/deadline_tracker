from datetime import datetime

from flask import jsonify


def validate_task_data(data):
    required_fields = ["task_name", "subject_id", "priority", "difficulty", "deadline"]
    if missing := [field for field in required_fields if field not in data]:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        if isinstance(data["deadline"], str):
            data["deadline"] = datetime.fromisoformat(data["deadline"]).date()
        elif isinstance(data["deadline"], dict):
            data["deadline"] = datetime(
                data["deadline"]["year"],
                data["deadline"]["month"],
                data["deadline"]["day"],
            ).date()
    except (ValueError, TypeError, KeyError) as e:
        return (
            jsonify(
                {"error": "Invalid date format. Use YYYY-MM-DD", "details": str(e)}
            ),
            400,
        )

    return None
