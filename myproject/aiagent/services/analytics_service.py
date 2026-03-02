import pandas as pd
import numpy as np
from datetime import timedelta
from django.utils import timezone

class AnalyticsService:
    @staticmethod
    def calculate_bmi(profile):
        """
        Calculate BMI and return value + category.
        Handles age-specific interpretation for children/teens vs adults.
        """
        if not profile.weight or not profile.height or profile.weight <= 0 or profile.height <= 0:
            return None, "Unknown"
        
        height_m = profile.height / 100
        bmi_value = profile.weight / (height_m ** 2)
        age = profile.age or 25 # Default to adult if age missing
        
        # Adult Categories (20+ years)
        if age >= 20:
            if bmi_value < 18.5:
                category = "Underweight"
            elif 18.5 <= bmi_value < 25:
                category = "Normal Weight"
            elif 25 <= bmi_value < 30:
                category = "Overweight"
            else:
                category = "Obesity"
        else:
            # For children and teens, BMI is interpreted as percentiles.
            # We provide a simplified growth-aware category label.
            if bmi_value < 15:
                category = "Child: Underweight"
            elif 15 <= bmi_value < 22:
                category = "Child: Healthy Growth"
            else:
                category = "Child: Above Average"
            
        return round(bmi_value, 1), category

    @staticmethod
    def calculate_bmr(profile):
        """
        Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation.
        """
        if not all([profile.weight, profile.height, profile.age, profile.gender]):
            return 0
        
        # weight in kg, height in cm, age in years
        if profile.gender.lower() == 'male':
            return (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5
        else:
            return (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161

    @staticmethod
    def calculate_tdee(bmr, activity_level):
        """
        Calculate Total Daily Energy Expenditure.
        """
        multipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderately_active': 1.55,
            'very_active': 1.725,
            'extra_active': 1.9
        }
        factor = multipliers.get(activity_level.lower().replace(' ', '_'), 1.2)
        return bmr * factor

    @staticmethod
    def analyze_behavior(user_logs):
        """
        Process DailyLogs using Pandas to detect trends.
        """
        if not user_logs.exists():
            return {
                "avg_calories": 0.0,
                "avg_sleep": 0.0,
                "weekend_spike": False,
                "consistency_score": 0.0,
                "calorie_trend": "stable",
                "sample_size": 0
            }

        df = pd.DataFrame(list(user_logs.values()))
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # 1. Weekly Averages
        avg_calories = df['calories'].tail(7).mean()
        avg_sleep = df['sleep_hours'].tail(7).mean()

        # 2. Weekend Spike Detection
        df['is_weekend'] = df['date'].dt.dayofweek >= 4 # Fri, Sat, Sun
        weekend_avg = df[df['is_weekend']]['calories'].mean()
        weekday_avg = df[~df['is_weekend']]['calories'].mean()
        
        has_weekend_spike = False
        if not np.isnan(weekend_avg) and not np.isnan(weekday_avg):
            has_weekend_spike = weekend_avg > (weekday_avg * 1.15)

        # 3. Consistency Score (0-100)
        # Based on how many logs exist in the last 7 days
        last_7_days = timezone.now().date() - timedelta(days=7)
        recent_logs = df[df['date'].dt.date >= last_7_days]
        consistency_score = (len(recent_logs) / 7.0) * 100

        # 4. Monthly Weight Trends (if weights were logged in DailyLog)
        # Assuming we just have calorie trends for now
        calorie_trend = "stable"
        if len(df) >= 7:
            diff = df['calories'].tail(3).mean() - df['calories'].iloc[-7:-4].mean()
            if diff > 200: calorie_trend = "increasing"
            elif diff < -200: calorie_trend = "decreasing"

        return {
            "avg_calories": float(avg_calories),
            "avg_sleep": float(avg_sleep),
            "weekend_spike": bool(has_weekend_spike),
            "consistency_score": float(consistency_score),
            "calorie_trend": calorie_trend,
            "sample_size": len(df)
        }
