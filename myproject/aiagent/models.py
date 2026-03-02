from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# --- AUTHENTICATION LAYER ---
class NutriUser(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'Individual User'),
        ('vht', 'Village Health Team'),
    ]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    language = models.CharField(max_length=50, default='en')
    country = models.CharField(max_length=100, default='Uganda')
    onboarding_completed = models.BooleanField(default=False)
    registered_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='registered_individuals')

    REQUIRED_FIELDS = ['username']
    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email

# --- PROFILE LAYER ---
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile', null=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female')], null=True, blank=True)
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    activity_level = models.CharField(max_length=50, null=True, blank=True)
    goal = models.CharField(max_length=50, null=True, blank=True)
    region = models.CharField(max_length=100, null=True, blank=True)
    preferred_language = models.CharField(max_length=10, default='en', null=True, blank=True)
    medical_conditions = models.JSONField(default=list, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Profile of {self.user.email}"

# --- LOGGING LAYER ---
class DailyLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_logs', null=True)
    date = models.DateField()
    calories = models.IntegerField(default=0)
    protein = models.FloatField(default=0.0)
    carbs = models.FloatField(default=0.0)
    fats = models.FloatField(default=0.0)
    sleep_hours = models.FloatField(default=0.0)
    exercise_minutes = models.IntegerField(default=0)
    water_intake = models.FloatField(default=0.0, help_text="Water in liters")

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Log for {self.user.email} on {self.date}"

# --- AI INSIGHTS LAYER ---
class AIInsight(models.Model):
    RISK_LEVELS = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_insights', null=True)
    summary = models.TextField()
    behavioral_insight = models.TextField()
    risk_level = models.CharField(max_length=10, choices=RISK_LEVELS)
    recommendations = models.JSONField() # List of recommendations
    motivation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Insight for {self.user.email} at {self.created_at}"

# --- KNOWLEDGE BASE ---
class FoodItem(models.Model):
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    season = models.CharField(max_length=100, help_text="Seasonal availability")
    price = models.DecimalField(max_digits=8, decimal_places=2, help_text="Average price per kg")
    nutrition = models.TextField(help_text="Nutritional information (JSON or text)")
    preparation = models.TextField(help_text="Traditional preparation methods")

    def __str__(self):
        return self.name
