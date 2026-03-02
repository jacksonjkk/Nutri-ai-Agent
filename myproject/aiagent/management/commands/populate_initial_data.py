from django.core.management.base import BaseCommand
from aiagent.models import FoodItem, UserProfile

class Command(BaseCommand):
    help = 'Populate initial FoodItem and UserProfile data for Uganda'

    def handle(self, *args, **kwargs):
        foods = [
            {'name': 'Matooke', 'region': 'Central', 'season': 'All year', 'price': 2000, 'nutrition': 'Carbs, Potassium', 'preparation': 'Steamed, mashed'},
            {'name': 'Posho', 'region': 'Nationwide', 'season': 'All year', 'price': 1500, 'nutrition': 'Carbs', 'preparation': 'Boiled'},
            {'name': 'Beans', 'region': 'Nationwide', 'season': 'All year', 'price': 2500, 'nutrition': 'Protein, Iron', 'preparation': 'Boiled, stewed'},
            {'name': 'Sweet Potatoes', 'region': 'Eastern', 'season': 'Rainy', 'price': 1800, 'nutrition': 'Carbs, Vitamin A', 'preparation': 'Boiled, roasted'},
            {'name': 'Groundnuts', 'region': 'Eastern', 'season': 'Rainy', 'price': 3500, 'nutrition': 'Protein, Fat', 'preparation': 'Roasted, paste'},
        ]
        for food in foods:
            FoodItem.objects.get_or_create(
                name=food['name'],
                defaults={
                    'region': food['region'],
                    'season': food['season'],
                    'price': food['price'],
                    'nutrition': food['nutrition'],
                    'preparation': food['preparation'],
                }
            )
        users = [
            {'user_id': 'user1', 'age': 30, 'gender': 'M', 'life_stage': 'adult', 'activity_level': 'active', 'health_conditions': '', 'language': 'en', 'literacy_level': 'literate'},
            {'user_id': 'user2', 'age': 5, 'gender': 'F', 'life_stage': 'child', 'activity_level': 'sedentary', 'health_conditions': '', 'language': 'lg', 'literacy_level': 'low-literacy'},
        ]
        for user in users:
            UserProfile.objects.get_or_create(
                user_id=user['user_id'],
                defaults={
                    'age': user['age'],
                    'gender': user['gender'],
                    'life_stage': user['life_stage'],
                    'activity_level': user['activity_level'],
                    'health_conditions': user['health_conditions'],
                    'language': user['language'],
                    'literacy_level': user['literacy_level'],
                }
            )
        self.stdout.write(self.style.SUCCESS('Sample FoodItem and UserProfile data populated.'))
