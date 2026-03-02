from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import NutriUser, UserProfile, DailyLog, AIInsight, FoodItem

@admin.register(NutriUser)
class NutriUserAdmin(UserAdmin):
    list_display = ("email", "username", "country", "language", "onboarding_completed", "is_staff")
    search_fields = ("email", "username", "country")
    fieldsets = UserAdmin.fieldsets + (
        ("NutriAgent Meta", {"fields": ("country", "language", "onboarding_completed")}),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "age", "gender", "activity_level", "goal")
    search_fields = ("user__email", "user__username")

@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ("user", "date", "calories", "protein", "carbs", "fats")
    list_filter = ("date",)
    search_fields = ("user__email",)

@admin.register(AIInsight)
class AIInsightAdmin(admin.ModelAdmin):
    list_display = ("user", "risk_level", "created_at")
    list_filter = ("risk_level", "created_at")

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ("name", "region", "season", "price")
    search_fields = ("name", "region", "season")


