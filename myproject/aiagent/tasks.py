from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import NutriUser, DailyLog, AIInsight, UserProfile
from .services.analytics_service import AnalyticsService
from .services.ai_service import AIService
from .services.ml_service import MLService

@shared_task
def process_ai_insights_task(user_id):
    """
    Background task implementing Hybrid AI:
    1. Analytics (Math)
    2. ML Service (Logic Brain - Local)
    3. AI Service (Communicator - Groq)
    """
    try:
        user = NutriUser.objects.get(id=user_id)
        profile = user.profile
        logs = DailyLog.objects.filter(user=user).order_by('-date')

        # 1. Run Core Analytics
        analytics = AnalyticsService.analyze_behavior(logs)
        
        # 2. Run the "ML Brain" (Local Logic)
        ml_service = MLService()
        ml_nutrition = ml_service.predict_nutrition_score({"age": profile.age, "goal": profile.goal})
        
        # 3. Call "AI Communicator" (Groq) to explain results
        ai_service = AIService()
        profile_data = {
            "goal": profile.goal,
            "conditions": profile.medical_conditions,
            "age": profile.age
        }
        
        # Prepare the hybrid data package
        ml_results = {
            "nutrition_prediction": ml_nutrition,
            "behavior_metircs": analytics
        }
        
        insight_json = ai_service.generate_hybrid_insight(profile_data, ml_results)

        # 4. Save Insight
        AIInsight.objects.create(
            user=user,
            summary=insight_json.get('summary', ''),
            behavioral_insight=insight_json.get('behavioral_insight', ''),
            risk_level=insight_json.get('risk_level', 'Low'),
            recommendations=insight_json.get('recommendations', []),
            motivation=insight_json.get('motivation', '')
        )
        
        return f"Successfully generated Hybrid AI insight for {user.email}"
    except Exception as e:
        return f"Hybrid Task failed: {str(e)}"
