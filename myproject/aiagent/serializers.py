from rest_framework import serializers
from .models import NutriUser, UserProfile, DailyLog, AIInsight, FoodItem

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = NutriUser
        fields = ['id', 'email', 'username', 'password', 'language', 'country', 'onboarding_completed', 'role', 'registered_by']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['full_name', 'age', 'gender', 'height', 'weight', 'activity_level', 'goal', 'region', 'preferred_language', 'medical_conditions', 'phone_number', 'district']

class DailyLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = '__all__'
        read_only_fields = ['user']

class AIInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInsight
        fields = '__all__'
