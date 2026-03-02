"""
Machine Learning Service for integrating your trained models
Place your trained model files (.joblib) in aiagent/ml_models/

Multi-Model Architecture:
- Model A (RandomForest): Nutrition score predictor (0-100)
- Model B (XGBoost): Malnutrition classifier (Normal/MAM/SAM)
- Model C (Cosine Similarity): Food similarity recommender
"""
import os
import pickle
import joblib
import numpy as np
import pandas as pd
from django.conf import settings


class MLModelService:
    """
    Service for loading and using all three trained ML models for predictions
    """
    
    def __init__(self):
        """
        Initialize the ML service by loading all trained models and artifacts
        """
        self.base_path = os.path.join(settings.BASE_DIR, 'aiagent', 'ml_models')
        
        # Model A: RandomForest Nutrition Score Predictor
        self.nutrition_model = None
        self.label_encoders = None
        self.minmax_scaler = None
        
        # Model B: XGBoost Malnutrition Classifier
        self.malnutrition_model = None
        
        # Model C: Cosine Similarity Food Recommender
        self.cosine_sim_matrix = None
        self.food_indices_map = None
        self.processed_food_df = None
        
        # Multi-label encoders for allergens and health conditions
        self.mlb_allergens = None
        self.mlb_health = None
        
        self.load_all_models()
    
    def load_all_models(self):
        """Load all trained models and preprocessing artifacts from disk"""
        try:
            # Model A: RandomForest Nutrition Score Predictor (4.81 MB)
            nutrition_model_path = os.path.join(self.base_path, 'rf_nutrition_model.joblib')
            if os.path.exists(nutrition_model_path):
                self.nutrition_model = joblib.load(nutrition_model_path)
                print(f"✅ Model A (Nutrition Score) loaded from {nutrition_model_path}")
            else:
                print(f"⚠️  Model A not found at {nutrition_model_path}")
            
            # Model B: XGBoost Malnutrition Classifier (241 KB)
            malnutrition_model_path = os.path.join(self.base_path, 'xgb_malnutrition_model.joblib')
            if os.path.exists(malnutrition_model_path):
                self.malnutrition_model = joblib.load(malnutrition_model_path)
                print(f"✅ Model B (Malnutrition Classifier) loaded from {malnutrition_model_path}")
            else:
                print(f"⚠️  Model B not found at {malnutrition_model_path}")
            
            # Model C: Cosine Similarity Matrix
            cosine_sim_path = os.path.join(self.base_path, 'cosine_sim_matrix.joblib')
            if os.path.exists(cosine_sim_path):
                self.cosine_sim_matrix = joblib.load(cosine_sim_path)
                print(f"✅ Model C (Cosine Similarity) loaded from {cosine_sim_path}")
            else:
                print(f"⚠️  Model C not found at {cosine_sim_path}")
            
            # Load preprocessing artifacts
            self._load_preprocessing_artifacts()
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
    
    def _load_preprocessing_artifacts(self):
        """Load all preprocessing transformers and data"""
        artifacts = {
            'label_encoders.joblib': 'label_encoders',
            'minmax_scaler.joblib': 'minmax_scaler',
            'mlb_allergens.joblib': 'mlb_allergens',
            'mlb_health.joblib': 'mlb_health',
            'food_indices_map.joblib': 'food_indices_map',
            'processed_food_df.joblib': 'processed_food_df'
        }
        
        for filename, attr_name in artifacts.items():
            path = os.path.join(self.base_path, filename)
            if os.path.exists(path):
                setattr(self, attr_name, joblib.load(path))
                print(f"✅ Loaded {filename}")
            else:
                print(f"⚠️  {filename} not found")
    
    def predict_nutrition_score(self, user_profile, food_items=None):
        """
        Model A: Predict personalized nutrition scores (0-100) for food items
        
        Args:
            user_profile: Dictionary with user features
                {
                    'age': 25,
                    'budget_category': 'Medium',  # or monthly_budget_ugx: 500000
                    'health_conditions': ['Diabetes'],
                    'allergens': []
                }
            food_items: Optional list of food items to score. If None, scores all foods.
        
        Returns:
            List of dictionaries with food items and their scores
        """
        if not self.nutrition_model or self.processed_food_df is None:
            return self._fallback_nutrition_scores(user_profile)
        
        try:
            # Get food dataset
            food_df = self.processed_food_df.copy()
            
            # Transform user profile to match training features
            transformed_user = self._transform_user_profile(user_profile)
            
            # Add user features to each food row
            existing_cols = set(food_df.columns.tolist())
            for col, value in transformed_user.items():
                if col not in existing_cols:
                    food_df[col] = value
            
            # Ensure we have all required features
            model_features = self.nutrition_model.feature_names_in_ if hasattr(self.nutrition_model, 'feature_names_in_') else []
            
            if len(model_features) > 0:
                existing_cols = set(food_df.columns.tolist())
                # Add missing columns with default values
                for feature in model_features:
                    if feature not in existing_cols:
                        food_df[feature] = 0
                
                # Select only the features the model expects, in the right order
                food_df = food_df[list(model_features)]
            
            # Predict scores
            scores = self.nutrition_model.predict(food_df)
            
            # Format results
            results = []
            for idx, (_, food) in enumerate(self.processed_food_df.iterrows()):
                food_name = self._get_food_name(food)
                results.append({
                    'food_name': food_name,
                    'nutrition_score': round(float(scores[idx]), 2),
                    'category': food.get('category', food.get('Category', 'General')),
                    'region': food.get('region_common', food.get('Region', 'Uganda')),
                    'price': food.get('estimated_cost_ugx', food.get('Price_UGX', 5000))
                })
            
            # Sort by score descending
            results.sort(key=lambda x: x['nutrition_score'], reverse=True)
            
            return {
                'model_used': True,
                'recommendations': results[:10],  # Top 10
                'total_scored': len(results)
            }
            
        except Exception as e:
            print(f"❌ Model A prediction error: {e}")
            import traceback
            traceback.print_exc()
            return self._fallback_nutrition_scores(user_profile)
    
    def _transform_user_profile(self, user_profile):
        """Transform user profile to match model's expected features"""
        transformed = {}
        
        # Age
        transformed['age'] = user_profile.get('age', 25)
        
        # Budget: convert category to UGX amount
        budget = user_profile.get('monthly_budget_ugx')
        if budget is None:
            budget_category = user_profile.get('budget_category', 'Medium')
            budget_map = {
                'Low': 100000,
                'Medium': 300000,
                'High': 800000
            }
            budget = budget_map.get(budget_category, 300000)
        transformed['monthly_budget_ugx'] = budget
        
        # Health conditions: encode to numeric
        health_conditions = user_profile.get('health_conditions', [])
        if isinstance(health_conditions, list):
            # Simple encoding: 0=none, 1=diabetes, 2=hypertension, 3=hiv, 4=multiple
            if not health_conditions:
                transformed['health_condition_encoded'] = 0
            elif 'Diabetes' in health_conditions or 'diabetes' in str(health_conditions).lower():
                transformed['health_condition_encoded'] = 1
            elif 'Hypertension' in health_conditions or 'hypertension' in str(health_conditions).lower():
                transformed['health_condition_encoded'] = 2
            elif 'HIV' in health_conditions or 'hiv' in str(health_conditions).lower():
                transformed['health_condition_encoded'] = 3
            else:
                transformed['health_condition_encoded'] = 4
        else:
            transformed['health_condition_encoded'] = 0
        
        return transformed
    
    def _get_food_name(self, food_row):
        """Extract food name from row, trying multiple column names"""
        possible_names = ['Food_Item', 'food_name', 'name', 'food', 'item']
        for col in possible_names:
            if col in food_row.index and food_row[col]:
                return food_row[col]
        return 'Unknown'
    
    def classify_malnutrition(self, child_data):
        """
        Model B: Clinical screening for children under 5
        
        Args:
            child_data: Dictionary with child metrics
                {
                    'age_months': 24,
                    'weight_kg': 9.5,
                    'height_cm': 80,
                    'muac_cm': 11.2,  # Mid-Upper Arm Circumference
                    'whz_score': -3.2  # Weight-for-Height Z-score
                }
        
        Returns:
            Classification: 'Normal', 'MAM', or 'SAM'
        """
        if not self.malnutrition_model:
            return self._fallback_malnutrition_classification(child_data)
        
        try:
            # Prepare features
            features = self._prepare_malnutrition_features(child_data)
            
            # Predict (returns numeric code)
            prediction_code = self.malnutrition_model.predict(features)[0]
            probabilities = self.malnutrition_model.predict_proba(features)[0]
            
            # Map numeric prediction to class labels
            classes = ['Normal', 'MAM', 'SAM']  # Moderate/Severe Acute Malnutrition
            classification = classes[int(prediction_code)]
            
            return {
                'model_used': True,
                'classification': classification,
                'risk_level': classification,
                'confidence': {
                    classes[i]: round(float(prob), 3) 
                    for i, prob in enumerate(probabilities)
                },
                'recommendations': self._get_malnutrition_recommendations(classification, child_data),
                'clinical_notes': self._generate_clinical_notes(child_data, classification)
            }
            
        except Exception as e:
            print(f"❌ Model B prediction error: {e}")
            return self._fallback_malnutrition_classification(child_data)
    
    def recommend_similar_foods(self, food_name, n=5):
        """
        Model C: Find culturally and nutritionally similar Ugandan food alternatives
        
        Args:
            food_name: Name of the food item (e.g., 'Matooke')
            n: Number of similar foods to return
        
        Returns:
            List of similar food items with similarity scores
        """
        if self.cosine_sim_matrix is None or self.food_indices_map is None:
            return self._fallback_similar_foods(food_name)
        
        try:
            # Find food index - food_indices_map is a pandas Series
            food_name_str = str(food_name).strip()
            actual_key = None
            
            # pandas Series uses .loc for lookups
            try:
                if food_name_str in self.food_indices_map.index:
                    actual_key = food_name_str
            except:
                pass
            
            if actual_key is None:
                # Try case-insensitive match
                food_name_lower = food_name_str.lower()
                for key in self.food_indices_map.index:
                    try:
                        if str(key).lower() == food_name_lower:
                            actual_key = key
                            break
                    except:
                        continue
            
            if actual_key is None:
                return {
                    'model_used': False,
                    'message': f'Food "{food_name}" not found in database',
                    'similar_foods': []
                }
            
            # Get the index value (ensure it's an integer)
            idx = int(self.food_indices_map[actual_key])
            
            # Get similarity scores
            sim_scores = list(enumerate(self.cosine_sim_matrix[idx]))
            
            # Sort by similarity (excluding the food itself)
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:n+1]
            
            # Create reverse map: index -> food_name (pandas Series makes this easy)
            reverse_map = {int(v): k for k, v in self.food_indices_map.items()}
            
            similar_foods = []
            
            for food_idx, score in sim_scores:
                similar_food_name = reverse_map.get(int(food_idx), 'Unknown')
                food_info = self.processed_food_df.iloc[int(food_idx)] if self.processed_food_df is not None else {}
                
                similar_foods.append({
                    'food_name': similar_food_name,
                    'similarity_score': round(float(score), 3),
                    'category': food_info.get('Category', 'General'),
                    'region': food_info.get('Region', 'Uganda'),
                    'preparation': food_info.get('Preparation', 'Various')
                })
            
            return {
                'model_used': True,
                'original_food': food_name,
                'similar_foods': similar_foods
            }
            
        except Exception as e:
            print(f"❌ Model C prediction error: {e}")
            import traceback
            traceback.print_exc()
            return self._fallback_similar_foods(food_name)
    
    def _prepare_nutrition_features(self, user_df, food_df):
        """
        Prepare feature matrix for Model A (RandomForest)
        Dynamically generates features matching the training set
        """
        # Merge user and food features
        features_df = pd.concat([user_df.reset_index(drop=True), food_df.reset_index(drop=True)], axis=1)
        
        # Drop ID columns that shouldn't be used for prediction
        columns_to_drop = ['id', 'Id', 'ID', 'Food_Item', 'food_name', 'name']
        features_df = features_df.drop(columns=[col for col in columns_to_drop if col in features_df.columns], errors='ignore')
        
        # Apply label encoders if available
        if self.label_encoders:
            for col, encoder in self.label_encoders.items():
                if col in features_df.columns:
                    try:
                        features_df[col] = encoder.transform(features_df[col])
                    except:
                        features_df[col] = 0  # Default for unknown categories
        
        # Apply scaling if available
        if self.minmax_scaler:
            # Only scale numeric columns that were seen during training
            numeric_cols = features_df.select_dtypes(include=[np.number]).columns.tolist()
            
            # If scaler has feature_names_in_ attribute, use only those columns
            if hasattr(self.minmax_scaler, 'feature_names_in_'):
                # Get intersection of current numeric cols and training cols
                training_cols = set(self.minmax_scaler.feature_names_in_)
                numeric_cols = [col for col in numeric_cols if col in training_cols]
                
                # Ensure columns are in the order expected by scaler
                numeric_cols = [col for col in self.minmax_scaler.feature_names_in_ if col in features_df.columns]
            
            if numeric_cols:
                features_df[numeric_cols] = self.minmax_scaler.transform(features_df[numeric_cols])
        
        return features_df
    
    def _prepare_malnutrition_features(self, child_data):
        """
        Prepare features for Model B (XGBoost)
        Features: age_months, weight_kg, height_cm, muac_cm, whz_score
        """
        features = np.array([[
            child_data.get('age_months', 24),
            child_data.get('weight_kg', 10),
            child_data.get('height_cm', 80),
            child_data.get('muac_cm', 13.5),
            child_data.get('whz_score', 0)
        ]])
        return features
    
    def _get_malnutrition_recommendations(self, classification, child_data):
        """Generate food recommendations based on malnutrition classification"""
        recommendations = {
            'Normal': [
                'Continue balanced diet with variety',
                'Include Beans, Posho, and vegetables',
                'Regular health checkups every 3 months'
            ],
            'MAM': [
                'Increase protein: Beans, Groundnuts, Fish',
                'Energy-dense foods: Sweet Potato, Cassava',
                'Small frequent meals (5-6 times daily)',
                'Monitor MUAC weekly'
            ],
            'SAM': [
                '⚠️ URGENT: Seek medical attention immediately',
                'Therapeutic feeding required',
                'High-protein foods: Eggs, Milk, Tripe',
                'Ready-to-use therapeutic food (RUTF) if available',
                f'Critical indicators: MUAC={child_data.get("muac_cm", "N/A")}cm, WHZ={child_data.get("whz_score", "N/A")}'
            ]
        }
        return recommendations.get(classification, recommendations['Normal'])
    
    def _generate_clinical_notes(self, child_data, classification):
        """Generate clinical assessment notes"""
        muac = child_data.get('muac_cm', 0)
        whz = child_data.get('whz_score', 0)
        
        notes = []
        if muac < 11.5:
            notes.append(f"Severe wasting detected (MUAC: {muac}cm < 11.5cm)")
        elif muac < 12.5:
            notes.append(f"Moderate wasting detected (MUAC: {muac}cm)")
        
        if whz < -3:
            notes.append(f"Severe acute malnutrition (WHZ: {whz} < -3 SD)")
        elif whz < -2:
            notes.append(f"Moderate acute malnutrition (WHZ: {whz} < -2 SD)")
        
        if classification == 'SAM':
            notes.append("⚠️ REFERRAL NEEDED: Community health worker or clinic")
        
        return ' | '.join(notes) if notes else 'Normal growth indicators'
    
    def _fallback_nutrition_scores(self, user_profile):
        """Fallback when Model A is not available"""
        # Simple rule-based scoring
        common_foods = [
            {'food_name': 'Beans', 'nutrition_score': 85, 'category': 'Protein', 'region': 'All Uganda', 'price': 3000},
            {'food_name': 'Matooke', 'nutrition_score': 75, 'category': 'Staple', 'region': 'Central', 'price': 2000},
            {'food_name': 'Groundnuts', 'nutrition_score': 80, 'category': 'Protein', 'region': 'Northern', 'price': 2500},
            {'food_name': 'Posho', 'nutrition_score': 70, 'category': 'Staple', 'region': 'All Uganda', 'price': 1500},
            {'food_name': 'Sweet Potato', 'nutrition_score': 78, 'category': 'Staple', 'region': 'All Uganda', 'price': 1000},
        ]
        
        return {
            'model_used': False,
            'recommendations': common_foods,
            'total_scored': len(common_foods),
            'note': 'Using rule-based system. Deploy Model A for personalized scores.'
        }
    
    def _fallback_malnutrition_classification(self, child_data):
        """Fallback when Model B is not available"""
        muac = child_data.get('muac_cm', 13.5)
        whz = child_data.get('whz_score', 0)
        
        # Simple rule-based classification
        if muac < 11.5 or whz < -3:
            classification = 'SAM'
        elif muac < 12.5 or whz < -2:
            classification = 'MAM'
        else:
            classification = 'Normal'
        
        return {
            'model_used': False,
            'classification': classification,
            'risk_level': classification,
            'confidence': {'rule_based': 1.0},
            'recommendations': self._get_malnutrition_recommendations(classification, child_data),
            'clinical_notes': self._generate_clinical_notes(child_data, classification),
            'note': 'Using WHO standards. Deploy Model B for ML-based classification.'
        }
    
    def _fallback_similar_foods(self, food_name):
        """Fallback when Model C is not available"""
        # Predefined similar foods
        similarity_map = {
            'Matooke': ['Gonja', 'Sweet Potato', 'Bushera', 'Cassava'],
            'Posho': ['Rice', 'Chapati', 'Millet', 'Sorghum'],
            'Beans': ['Groundnuts', 'Peas', 'Lentils', 'Soya'],
            'Groundnuts': ['Beans', 'Simsim', 'Groundnut Sauce', 'G-nut Paste']
        }
        
        similar = similarity_map.get(food_name, ['Posho', 'Beans', 'Sweet Potato'])
        
        return {
            'model_used': False,
            'original_food': food_name,
            'similar_foods': [
                {'food_name': f, 'similarity_score': 0.8, 'category': 'General', 'region': 'Uganda', 'preparation': 'Various'}
                for f in similar
            ],
            'note': 'Using predefined groups. Deploy Model C for similarity matrix.'
        }
    
    def get_comprehensive_recommendation(self, user_profile, child_data=None, favorite_food=None):
        """
        Get comprehensive recommendations using all three models
        
        Args:
            user_profile: User demographics and health
            child_data: Optional child metrics for malnutrition screening
            favorite_food: Optional food name for similarity recommendations
        
        Returns:
            Complete recommendation package
        """
        results = {
            'timestamp': pd.Timestamp.now().isoformat(),
            'user_profile': user_profile
        }
        
        # Model A: Nutrition Scores
        results['nutrition_recommendations'] = self.predict_nutrition_score(user_profile)
        
        # Model B: Malnutrition Screening (if child data provided)
        if child_data:
            results['malnutrition_screening'] = self.classify_malnutrition(child_data)
        
        # Model C: Similar Foods (if favorite food provided)
        if favorite_food:
            results['similar_foods'] = self.recommend_similar_foods(favorite_food)
        
        return results


# Singleton instance
_ml_service_instance = None

def get_ml_service():
    """Get or create ML service singleton"""
    global _ml_service_instance
    if _ml_service_instance is None:
        _ml_service_instance = MLModelService()
    return _ml_service_instance
