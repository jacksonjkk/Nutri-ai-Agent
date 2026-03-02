
import React, { useState } from 'react';
import { Calendar, RefreshCw, ChefHat, Info } from 'lucide-react';
import { getMealPlan } from '../services/apiService';
import { UserProfile, MealPlan, UGANDAN_FOODS } from '../types';
import { Card, Button, Badge, cn } from './UI';

export const MealPlanner = ({ userProfile }: { userProfile: UserProfile }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    setIsGenerating(true);
    const plan = await getMealPlan(userProfile);
    if (plan && plan.meals) {
      setMealPlan(plan);
    } else {
      console.error("Invalid Meal Plan received:", plan);
      // Optionally show an error to user
    }
    setIsGenerating(false);
  };

  const getFoodName = (id: string) => {
    const food = UGANDAN_FOODS.find(f => f.id === id);
    if (!food) return id.charAt(0).toUpperCase() + id.slice(1);

    // If name and localName are basically the same, just show name
    if (food.localName && food.localName.toLowerCase() !== food.name.toLowerCase()) {
      return `${food.name} (${food.localName})`;
    }
    return food.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-800">Daily Meal Plan</h2>
          <p className="text-sm text-stone-500">Personalized for {userProfile.name}'s goals</p>
        </div>
        <Button
          onClick={generatePlan}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <ChefHat size={18} />}
          {mealPlan ? 'Regenerate Plan' : 'Generate Plan'}
        </Button>
      </div>

      {!mealPlan && !isGenerating && (
        <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4 text-stone-300">
            <Calendar size={32} />
          </div>
          <h3 className="text-lg font-medium text-stone-600 mb-2">No plan generated yet</h3>
          <p className="text-sm text-stone-400 max-w-xs">
            Click the button above to create a personalized Ugandan meal plan based on your profile.
          </p>
        </Card>
      )}

      {isGenerating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-stone-100 rounded-[32px]" />
          ))}
        </div>
      )}

      {mealPlan && mealPlan.meals && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mealPlan.meals.map((meal, idx) => (
              <Card key={idx} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <ChefHat size={64} />
                </div>
                <Badge className="mb-3 bg-[#F27D26]/10 text-[#F27D26]">{meal.type}</Badge>
                <div className="space-y-3">
                  {meal.items.map((item, i) => (
                    <div key={i} className="flex flex-col border-b border-stone-50 pb-2">
                      <span className="text-stone-700 font-medium">{item.portion} of {getFoodName(item.foodId)}</span>
                    </div>
                  ))}
                </div>
                {meal.notes && (
                  <div className="mt-4 flex gap-2 items-start text-xs text-stone-500 bg-stone-50 p-3 rounded-xl">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <p>{meal.notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <Card className="bg-[#5A5A40] text-white">
            <h4 className="text-lg font-serif mb-4">Daily Nutritional Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs opacity-70 uppercase tracking-widest mb-1">Calories</p>
                <p className="text-2xl font-mono font-bold">{mealPlan.totalNutrients.calories}</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-70 uppercase tracking-widest mb-1">Protein</p>
                <p className="text-2xl font-mono font-bold">{mealPlan.totalNutrients.protein}g</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-70 uppercase tracking-widest mb-1">Carbs</p>
                <p className="text-2xl font-mono font-bold">{mealPlan.totalNutrients.carbs}g</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-70 uppercase tracking-widest mb-1">Fat</p>
                <p className="text-2xl font-mono font-bold">{mealPlan.totalNutrients.fat}g</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
