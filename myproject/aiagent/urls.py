from django.urls import path
from . import api_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # --- ROOT MESSAGE ---
    path('', api_views.APIRoot.as_view(), name='api_root'),
    
    # --- API ENDPOINTS (NutriAgent Core) ---
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard/', api_views.DashboardAPIView.as_view(), name='api_dashboard'),
    path('api/logs/', api_views.DailyLogAPIView.as_view(), name='api_logs'),
    path('api/signup/', api_views.SignupAPIView.as_view(), name='api_signup'),
    path('api/onboarding/', api_views.OnboardingAPIView.as_view(), name='api_onboarding'),
    path('api/meal-plan/', api_views.MealPlanAPIView.as_view(), name='api_meal_plan'),
    path('api/chat/', api_views.ChatAPIView.as_view(), name='api_chat'),
    
    # --- VHT SPECIALIZED ENDPOINTS ---
    path('api/vht/dashboard/', api_views.VHTDashboardAPIView.as_view(), name='api_vht_dashboard'),
    path('api/vht/register-user/', api_views.VHTRegisterIndividualAPIView.as_view(), name='api_vht_register'),
]
