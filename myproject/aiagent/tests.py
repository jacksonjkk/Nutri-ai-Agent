
from django.test import TestCase, Client
from django.urls import reverse
from .models import FoodItem, UserProfile, Assessment

class FoodItemModelTest(TestCase):
	def test_create_fooditem(self):
		food = FoodItem.objects.create(
			name='Test Food', region='Central', season='All year', price=1000,
			nutrition='Carbs', preparation='Boiled')
		self.assertEqual(str(food), 'Test Food')

class UserProfileModelTest(TestCase):
	def test_create_userprofile(self):
		user = UserProfile.objects.create(
			user_id='testuser', age=25, gender='M', life_stage='adult',
			activity_level='active', health_conditions='', language='en', literacy_level='literate')
		self.assertIn('testuser', str(user))

class AssessmentModelTest(TestCase):
	def setUp(self):
		self.user = UserProfile.objects.create(
			user_id='testuser', age=25, gender='M', life_stage='adult',
			activity_level='active', health_conditions='', language='en', literacy_level='literate')
	def test_create_assessment(self):
		a = Assessment.objects.create(user=self.user, weight_kg=60, height_cm=170)
		self.assertIn('testuser', str(a))

class ViewsTest(TestCase):
	def setUp(self):
		self.client = Client()
		self.user = UserProfile.objects.create(
			user_id='testuser', age=25, gender='M', life_stage='adult',
			activity_level='active', health_conditions='', language='en', literacy_level='literate')
		self.assessment = Assessment.objects.create(user=self.user, weight_kg=60, height_cm=170, notes='matooke, beans')
	def test_home_view(self):
		response = self.client.get(reverse('home'))
		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'AI Nutrition Agent')
	def test_personalized_assessment_view_redirects(self):
		response = self.client.get(reverse('personalized_assessment', args=['testuser']))
		self.assertEqual(response.status_code, 302)  # Should redirect to login
	def test_meal_plan_view_redirects(self):
		response = self.client.get(reverse('meal_plan', args=['testuser']))
		self.assertEqual(response.status_code, 302)
