import os
import django
import json

# 1. Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from aiagent.models import NutriUser, DailyLog, AIInsight, UserProfile
from aiagent.tasks import process_ai_insights_task
from django.utils import timezone

def run_hybrid_test():
    print("🚀 Starting Hybrid AI Test...")

    # 2. Get or Create a test user
    user = NutriUser.objects.filter(username='jacksonjk').first()
    if not user:
        print("❌ Test user 'jacksonjk' not found. please create it first.")
        return

    # 3. Ensure Onboarding is done
    user.onboarding_completed = True
    user.save()
    profile, _ = UserProfile.objects.get_or_create(user=user)
    # Force update for testing different scenarios
    profile.age = 24
    profile.goal = "gain weight"
    profile.medical_conditions = ["None"]
    profile.save()

    # 4. Create a fresh log entry
    DailyLog.objects.get_or_create(
        user=user, 
        date=timezone.now().date(),
        defaults={
            "calories": 2100,
            "protein": 60.5,
            "carbs": 250.0,
            "fats": 45.0,
            "sleep_hours": 7.5
        }
    )
    print("✅ Test data prepared (User, Profile, DailyLog).")

    # 5. Run the Hybrid Task (Synchronously for testing)
    print("🧠 Running Brain (Local ML) + Communicator (Groq)...")
    result = process_ai_insights_task(user.id)
    print(f"📡 Task Status: {result}")

    # 6. Verify the Result
    latest_insight = AIInsight.objects.filter(user=user).order_by('-created_at').first()
    if latest_insight:
        print("\n--- 📝 LATEST HYBRID INSIGHT ---")
        print(f"Summary: {latest_insight.summary}")
        print(f"Behavioral Insight: {latest_insight.behavioral_insight}")
        print(f"Risk Level: {latest_insight.risk_level}")
        print(f"Recommendations: {latest_insight.recommendations}")
        print(f"Motivation: {latest_insight.motivation}")
        print("--------------------------------\n")
    else:
        print("❌ No insight was generated. Check the error logs.")

if __name__ == "__main__":
    run_hybrid_test()
