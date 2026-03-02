from rest_framework import status, views
from rest_framework.response import Response
from .models import DailyLog, AIInsight, UserProfile, NutriUser, FoodItem
from .serializers import DailyLogSerializer, ProfileSerializer, AIInsightSerializer, UserSerializer, FoodItemSerializer
from .services.analytics_service import AnalyticsService
from .services.ai_service import AIService
from .tasks import process_ai_insights_task
from rest_framework.permissions import IsAuthenticated, AllowAny

class APIRoot(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({
            "message": "NutriAgent Headless API is LIVE 🚀",
            "status": "Healthy",
            "version": "1.0.0",
            "endpoints": [
                "/api/token/ (Login)",
                "/api/signup/ (Register)",
                "/api/dashboard/ (Protected)",
                "/api/logs/ (Protected)"
            ]
        })

class DashboardAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Profile Check (Onboarding Check)
        if not user.onboarding_completed:
            return Response({"error": "Onboarding required", "onboarding_completed": False}, status=status.HTTP_403_FORBIDDEN)

        # 2. Get Data
        profile = user.profile
        logs = DailyLog.objects.filter(user=user).order_by('-date')
        latest_insight = AIInsight.objects.filter(user=user).order_by('-created_at').first()
        
        # 3. Process Analytics (Fast mathematical stuff)
        bmr = AnalyticsService.calculate_bmr(profile)
        tdee = AnalyticsService.calculate_tdee(bmr, profile.activity_level or 'sedentary')
        bmi_value, bmi_category = AnalyticsService.calculate_bmi(profile)
        behavior = AnalyticsService.analyze_behavior(logs)

        # 4. Construct Response
        data = {
            "username": user.username,
            "email": user.email,
            "profile_summary": ProfileSerializer(profile).data,
            "goal_progress": {
                "bmr": bmr,
                "tdee": tdee,
                "bmi": bmi_value,
                "bmi_category": bmi_category,
                "target_goal": profile.goal
            },
            "nutrition_metrics": behavior,
            "trend_data": list(logs[:7].values('date', 'calories', 'protein', 'carbs', 'fats')),
            "ai_insight": AIInsightSerializer(latest_insight).data if latest_insight else None,
            "role": user.role
        }
        
        return Response(data)

class DailyLogAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        date_str = request.data.get('date')
        if not date_str:
            return Response({"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Get or create the log for this user and date
        log, created = DailyLog.objects.get_or_create(user=request.user, date=date_str)

        # 2. Accumulate nutritional values (Adding on)
        log.calories += int(request.data.get('calories', 0))
        log.protein += float(request.data.get('protein', 0.0))
        log.carbs += float(request.data.get('carbs', 0.0))
        log.fats += float(request.data.get('fats', 0.0))
        log.exercise_minutes += int(request.data.get('exercise_minutes', 0))

        # 3. Update lifestyle values (Take the latest slider position)
        if 'water_intake' in request.data:
            log.water_intake = float(request.data.get('water_intake', 0.0))
        
        if 'sleep_hours' in request.data:
            log.sleep_hours = float(request.data.get('sleep_hours', 0.0))

        log.save()
        
        # TRIGGER CELERY TASK (Async AI Processing)
        process_ai_insights_task.delay(request.user.id)
        
        serializer = DailyLogSerializer(log)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)

    def get(self, request):
        logs = DailyLog.objects.filter(user=request.user).order_by('-date')[:30]
        serializer = DailyLogSerializer(logs, many=True)
        return Response(serializer.data)

class SignupAPIView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(request.data.get('password'))
            # Set role from request if provided, default to user
            user.role = request.data.get('role', 'user')
            if user.role == 'vht':
                user.onboarding_completed = True
            user.save()
            
            # Create profile and fill with any provided profile data (full_name, phone, etc)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            ps = ProfileSerializer(profile, data=request.data, partial=True)
            if ps.is_valid():
                ps.save()
                
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VHTDashboardAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'vht':
            return Response({"error": "VHT access only"}, status=status.HTTP_403_FORBIDDEN)
        
        users = NutriUser.objects.filter(registered_by=request.user).order_by('-date_joined')
        data = []
        for u in users:
            p = getattr(u, 'profile', None)
            data.append({
                "id": u.id,
                "email": u.email,
                "username": u.username,
                "onboarding_completed": u.onboarding_completed,
                "profile": ProfileSerializer(p).data if p else None,
                "date_joined": u.date_joined
            })
        
        return Response({
            "vht_name": request.user.username,
            "registered_count": len(data),
            "individuals": data
        })

class VHTRegisterIndividualAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'vht':
            return Response({"error": "VHT access only"}, status=status.HTTP_403_FORBIDDEN)
        
        full_name = request.data.get('full_name', 'Unnamed Individual')
        email = request.data.get('email')
        
        # If no email provided (for people without smart phones), generate one
        if not email:
            import time
            import uuid
            # Create a unique internal identifier
            name_slug = full_name.lower().replace(' ', '_')
            unique_id = str(uuid.uuid4())[:8]
            email = f"{name_slug}_{unique_id}@nutri.internal"
            
        if NutriUser.objects.filter(email=email).exists():
            return Response({"error": "User with this name/email already exists in system"}, status=status.HTTP_400_BAD_REQUEST)

        # Create basic account
        user = NutriUser.objects.create(
            email=email,
            username=email.split('@')[0],
            role='user',
            registered_by=request.user
        )
        # Use a random strong password for the internal account
        import secrets
        user.set_password(request.data.get('password', secrets.token_urlsafe(16)))
        user.save()

        # Fill profile data
        profile, _ = UserProfile.objects.get_or_create(user=user)
        ps = ProfileSerializer(profile, data=request.data, partial=True)
        if ps.is_valid():
            ps.save()
            user.onboarding_completed = True
            user.save()
            return Response({"message": "Individual registered successfully!", "id": user.id}, status=status.HTTP_201_CREATED)
        
        return Response(ps.errors, status=status.HTTP_400_BAD_REQUEST)

class OnboardingAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user.onboarding_completed = True
            user.save()
            return Response(ProfileSerializer(profile).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MealPlanAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        food_items = list(FoodItem.objects.all())
        
        # Fallback to core Ugandan foods if DB is empty or contains placeholders
        if not food_items or (len(food_items) > 0 and "Food_" in food_items[0].name):
            # Create mock objects that AIService can use (needs .name and .id)
            class MockFood:
                def __init__(self, name, id):
                    self.name = name
                    self.id = id
            
            food_items = [
                MockFood("Matooke", "matooke"),
                MockFood("Posho", "posho"),
                MockFood("Beans", "beans"),
                MockFood("G-Nut Sauce", "gnuts"),
                MockFood("Nakati", "nakati"),
                MockFood("Sweet Potato", "sweet-potato"),
                MockFood("Silver Fish (Mukene)", "silver-fish")
            ]
        
        ai_service = AIService()
        profile_data = {
            "conditions": profile.medical_conditions,
            "goal": profile.goal
        }
        
        meal_plan = ai_service.generate_meal_plan(profile_data, food_items)
        if meal_plan:
            return Response(meal_plan)
        return Response({"error": "Failed to generate meal plan"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChatAPIView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        profile = user.profile
        
        profile_data = {
            "name": user.username,
            "age": profile.age,
            "gender": profile.gender,
            "goal": profile.goal,
            "conditions": profile.medical_conditions
        }
        
        ai_service = AIService()
        reply = ai_service.chat_response(message, profile_data)
        
        return Response({"reply": reply})
