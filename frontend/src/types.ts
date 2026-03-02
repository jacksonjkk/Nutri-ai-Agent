
export type Language = 'en' | 'lg' | 'sw' | 'ach';

export interface FoodItem {
  id: string;
  name: string;
  localName?: string;
  category: 'staple' | 'protein' | 'vegetable' | 'fruit' | 'fat' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  iron?: number;
  vitaminA?: number;
  zinc?: number;
  description: string;
  preparation?: string;
  seasonalAvailability: string[]; // months
  typicalPriceRange?: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'very_active';
  conditions: string[];
  goals: ('malnutrition' | 'obesity' | 'maintenance' | 'pregnancy' | 'child_growth')[];
  region: string;
  district?: string;
  phone_number?: string;
  language: Language;
}

export interface MealPlan {
  id: string;
  day: string;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: { foodId: string; portion: string }[];
    notes?: string;
  }[];
  totalNutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface DashboardData {
  bmi: number | null;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  avgCalories: number;
  consistencyScore: number;
  calorieTrend: string;
  aiInsight?: {
    summary: string;
    behavioral_insight: string;
    risk_level: string;
  };
}

export const UGANDAN_FOODS: FoodItem[] = [
  {
    id: 'matooke',
    name: 'Matooke',
    localName: 'Matooke',
    category: 'staple',
    calories: 122,
    protein: 1.3,
    carbs: 31,
    fat: 0.3,
    description: 'Steamed and mashed green bananas, the primary staple of Central Uganda.',
    preparation: 'Peel, wrap in banana leaves, steam for several hours, then mash.',
    seasonalAvailability: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    typicalPriceRange: 'medium'
  },
  {
    id: 'posho',
    name: 'Posho',
    localName: 'Kawunga',
    category: 'staple',
    calories: 365,
    protein: 9,
    carbs: 74,
    fat: 4,
    description: 'Maize flour cooked with water to a thick, dough-like consistency.',
    preparation: 'Boil water, add maize flour gradually while stirring vigorously until thick.',
    seasonalAvailability: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    typicalPriceRange: 'low'
  },
  {
    id: 'beans',
    name: 'Beans',
    localName: 'Bijanjalo',
    category: 'protein',
    calories: 347,
    protein: 21,
    carbs: 63,
    fat: 1.2,
    description: 'Common dried beans, a vital source of protein.',
    preparation: 'Boil until soft, often stewed with onions, tomatoes, and sometimes G-nut paste.',
    seasonalAvailability: ['Jun', 'Jul', 'Dec', 'Jan'],
    typicalPriceRange: 'low'
  },
  {
    id: 'gnuts',
    name: 'Groundnuts',
    localName: 'Ebinyebwa',
    category: 'protein',
    calories: 567,
    protein: 26,
    carbs: 16,
    fat: 49,
    description: 'Peanuts, often ground into a rich purple sauce.',
    preparation: 'Roast and grind into paste, then simmer with water and salt to make sauce.',
    seasonalAvailability: ['Jul', 'Aug', 'Dec', 'Jan'],
    typicalPriceRange: 'medium'
  },
  {
    id: 'nakati',
    name: 'Nakati',
    localName: 'Nakati',
    category: 'vegetable',
    calories: 35,
    protein: 3,
    carbs: 5,
    fat: 0.5,
    description: 'Ugandan bitter leaf/eggplant leaves, rich in iron.',
    preparation: 'Steam or sauté with onions and tomatoes.',
    seasonalAvailability: ['Mar', 'Apr', 'May', 'Sep', 'Oct', 'Nov'],
    typicalPriceRange: 'low'
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    localName: 'Lumonde',
    category: 'staple',
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    description: 'Orange or white fleshed tubers, excellent source of Vitamin A.',
    preparation: 'Boil or steam in skins.',
    seasonalAvailability: ['Jun', 'Jul', 'Aug', 'Dec', 'Jan', 'Feb'],
    typicalPriceRange: 'low'
  },
  {
    id: 'silver-fish',
    name: 'Silver Fish',
    localName: 'Mukene',
    category: 'protein',
    calories: 300,
    protein: 60,
    carbs: 0,
    fat: 6,
    description: 'Small dried fish from Lake Victoria, extremely nutrient-dense.',
    preparation: 'Wash thoroughly, fry or add to stews/G-nut sauce.',
    seasonalAvailability: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    typicalPriceRange: 'low'
  }
];
