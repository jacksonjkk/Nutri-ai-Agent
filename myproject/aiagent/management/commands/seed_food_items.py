"""
Management command to seed FoodItem database from ML model data
"""
import os
import joblib
from django.core.management.base import BaseCommand
from django.conf import settings
from aiagent.models import FoodItem


class Command(BaseCommand):
    help = 'Seeds the FoodItem database from processed_food_df.joblib'

    def handle(self, *args, **options):
        # Load the processed food dataframe
        ml_models_dir = os.path.join(settings.BASE_DIR, 'aiagent', 'ml_models')
        food_df_path = os.path.join(ml_models_dir, 'processed_food_df.joblib')
        
        if not os.path.exists(food_df_path):
            self.stdout.write(self.style.ERROR(f'❌ {food_df_path} not found'))
            return
        
        try:
            # Load food data
            food_df = joblib.load(food_df_path)
            self.stdout.write(self.style.SUCCESS(f'✅ Loaded {len(food_df)} food items from joblib'))
            
            # Clear existing food items
            deleted_count = FoodItem.objects.all().delete()[0]
            self.stdout.write(self.style.WARNING(f'🗑️  Deleted {deleted_count} existing food items'))
            
            # Seed database
            created_count = 0
            for idx, row in food_df.iterrows():
                try:
                    # Map columns from dataframe to model fields
                    food_name = row.get('Food_Item', row.get('name', f'Food_{idx}'))
                    region = row.get('Region', 'Uganda')
                    season = row.get('Season', row.get('Seasonal_Availability', 'Year-round'))
                    price = float(row.get('Price_UGX', row.get('price', 5000))) / 1000  # Convert to thousands
                    category = row.get('Category', 'General')
                    preparation = row.get('Preparation', row.get('preparation', 'Various methods'))
                    
                    # Create nutrition summary from available data
                    nutrition_data = {
                        'category': category,
                        'calories': float(row.get('Calories', 0)) if 'Calories' in row else None,
                        'protein': float(row.get('Protein_g', 0)) if 'Protein_g' in row else None,
                        'carbs': float(row.get('Carbohydrates_g', 0)) if 'Carbohydrates_g' in row else None,
                        'fats': float(row.get('Fat_g', 0)) if 'Fat_g' in row else None,
                        'fiber': float(row.get('Fiber_g', 0)) if 'Fiber_g' in row else None,
                        'vitamin_a': float(row.get('Vitamin_A_mcg', 0)) if 'Vitamin_A_mcg' in row else None,
                        'iron': float(row.get('Iron_mg', 0)) if 'Iron_mg' in row else None,
                    }
                    
                    # Remove None values
                    nutrition_data = {k: v for k, v in nutrition_data.items() if v is not None}
                    
                    # Create FoodItem
                    FoodItem.objects.create(
                        name=food_name,
                        region=region,
                        season=season,
                        price=price,
                        nutrition=str(nutrition_data),  # Store as string or convert to JSON
                        preparation=preparation
                    )
                    created_count += 1
                    
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'⚠️  Failed to create food item {idx}: {e}'))
                    continue
            
            self.stdout.write(self.style.SUCCESS(f'✅ Successfully seeded {created_count} food items'))
            
            # Display sample
            sample_foods = FoodItem.objects.all()[:5]
            self.stdout.write(self.style.SUCCESS('\n📋 Sample food items:'))
            for food in sample_foods:
                self.stdout.write(f'   • {food.name} ({food.region}) - UGX {food.price*1000:.0f}/kg')
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error loading food data: {e}'))
            import traceback
            traceback.print_exc()
