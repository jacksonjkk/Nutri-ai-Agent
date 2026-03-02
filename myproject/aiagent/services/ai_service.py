import os
import json
from groq import Groq
from django.conf import settings
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if self.api_key:
            self.client = Groq(api_key=self.api_key)
            self.model_name = 'llama-3.3-70b-versatile'
        else:
            self.client = None

    def generate_behavioral_insight(self, profile_data, analytics_data):
        """
        Calls Groq to interpret processed data and return structured insights.
        """
        if not self.client:
            return self._offline_fallback()

        prompt = f"""
        Role: Senior Clinical Nutritionist & Behavioral Coach.
        System Context: interpret mathematical analytics for a health platform in Uganda.
        
        Input Data (JSON):
        {{
            "profile": {{
                "goal": "{profile_data.get('goal')}",
                "conditions": {json.dumps(profile_data.get('conditions', []))}
            }},
            "analytics": {{
                "avg_calories": {analytics_data.get('avg_calories', 0)},
                "weekend_spike": {analytics_data.get('weekend_spike', False)},
                "sleep_avg": {analytics_data.get('avg_sleep', 0)},
                "consistency": {analytics_data.get('consistency_score', 0)},
                "trend": "{analytics_data.get('calorie_trend', 'stable')}"
            }}
        }}

        Task: Provide a structured analysis.
        Output MUST be valid JSON with the following keys:
        - summary: 1-sentence overview.
        - behavioral_insight: Deep dive into the "Why" behind the data.
        - risk_level: "Low", "Medium", or "High".
        - recommendations: List of 3 actionable items.
        - motivation: A brief encouraging message.
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a professional nutritionist. Respond only in JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model_name,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"AI Service Error: {e}")
            return self._offline_fallback()

    def generate_meal_plan(self, profile_data, food_items_list):
        """
        Generates a structured meal plan that matches the frontend MealPlan interface.
        """
        if not self.client:
            return None

        # Provide IDs so the frontend can map them back to its metadata
        food_info = ", ".join([f"{f.name} (id: {f.id or f.name.lower()})" for f in food_items_list])
        
        prompt = f"""
        Role: Nutrition Planner for Uganda.
        Goal: {profile_data.get('goal', 'maintenance')}.
        Conditions: {json.dumps(profile_data.get('conditions', []))}.
        Available Foods: {food_info}.

        Task: Create a 1-day balanced Ugandan meal plan.
        Output MUST be a valid JSON object matching this EXACT structure:
        {{
            "meals": [
                {{
                    "type": "breakfast",
                    "items": [{{ "foodId": "id_from_list", "portion": "e.g. 2 fingers" }}],
                    "notes": "Healthy tip"
                }},
                {{
                    "type": "lunch",
                    "items": [{{ "foodId": "id_from_list", "portion": "e.g. 1 medium plate" }}],
                    "notes": "Cultural tip"
                }},
                {{
                    "type": "dinner",
                    "items": [{{ "foodId": "id_from_list", "portion": "e.g. 2 pieces" }}],
                    "notes": "Light meal tip"
                }}
            ],
            "totalNutrients": {{
                "calories": 0,
                "protein": 0,
                "carbs": 0,
                "fat": 0
            }}
        }}

        CRITICAL: 
        1. Use ONLY the IDs provided in the Available Foods list for "foodId".
        2. Use REALISTIC Ugandan portion units: 'fingers' (for matooke/bananas), 'pieces' (for meat/tubers), 'plates', 'bowls', or 'tablespoons'. DO NOT use 'cups' for solid local foods.
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a precise meal planning expert. Respond only in JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model_name,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Meal Plan Error: {e}")
            return None

    def generate_hybrid_insight(self, profile_data, ml_results):
        """
        Takes raw results from the local ML Brain and uses Groq to find the best way to explain them.
        """
        if not self.client:
            return self._offline_fallback()

        prompt = f"""
        Role: Ugandan Health Communicator.
        Context: Our local ML Model (The Brain) has analyzed the user data and produced these results:
        {json.dumps(ml_results)}

        User Profile: {json.dumps(profile_data)}

        Task: Translate these technical ML results into a friendly, culturally relevant message.
        - CRITICAL: Tailor advice to their goal: "{profile_data.get('goal', 'General Health')}".
        - If the goal is "Gain Weight", focus on healthy calorie density (e.g., groundnuts, avocados, oils).
        - If the goal is "Lose Weight", focus on volume and fiber.
        - The summary should be empowering.
        - The behavioral_insight should explain WHAT the results mean for their specific "{profile_data.get('goal')}" goal.
        - include 3 specific Ugandan food recommendations.
        
        Output MUST be valid JSON with keys: summary, behavioral_insight, risk_level, recommendations, motivation.
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a friendly health coach. Respond only in JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model_name,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Hybrid AI Error: {e}")
            return self._offline_fallback()

    def chat_response(self, user_message, profile_data):
        """
        Provides direct conversation with the user.
        """
        if not self.client:
            return "I am currently offline. Please check back later."

        prompt = f"""
        Role: Nutri Agent (Ugandan Nutrition Assistant).
        User Goal: {profile_data.get('goal', 'General Health')}.
        User Profile: {json.dumps(profile_data)}.
        
        User Message: "{user_message}"
        
        Task: Provide a helpful, culturally relevant, and scientifically sound response.
        - Mention specific Ugandan foods where applicable.
        - Be encouraging and professional.
        - Keep the local context (Uganda) in mind.
        - Focus on their goal: "{profile_data.get('goal')}".
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful Ugandan nutrition assistant. Speak English, but you can use some common Luganda or Swahili words if appropriate."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model_name,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Chat Error: {e}")
            return "I am sorry, I am having trouble thinking right now."

    def _offline_fallback(self):
        return {
            "summary": "Data analysis complete. AI reasoning is currently offline.",
            "behavioral_insight": "Your metrics show stable patterns. We recommend maintaining consistency.",
            "risk_level": "Low",
            "recommendations": ["Eat more local greens", "Stay hydrated", "Walk for 30 minutes"],
            "motivation": "You are doing great! Keep showing up for yourself."
        }
