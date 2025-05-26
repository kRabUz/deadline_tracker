from flask import jsonify
from services.topsis_service import calculate_topsis

def init_topsis_routes(app):
    @app.route('/api/tasks/recommendations', methods=['GET'])
    def get_recommendations():
        try:
            recommendations = calculate_topsis()
            return jsonify(recommendations)
        except Exception as e:
            return jsonify({"error": str(e)}), 500