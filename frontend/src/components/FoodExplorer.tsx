
import React, { useState } from 'react';
import { Search, Info, Leaf, Beef, Apple, Utensils, Star } from 'lucide-react';
import { UGANDAN_FOODS, FoodItem, UserProfile } from '../types';
import { Card, Badge, cn } from './UI';

const CategoryIcon = ({ category }: { category: FoodItem['category'] }) => {
  switch (category) {
    case 'staple': return <Utensils size={16} />;
    case 'protein': return <Beef size={16} />;
    case 'vegetable': return <Leaf size={16} />;
    case 'fruit': return <Apple size={16} />;
    default: return <Info size={16} />;
  }
};

export const FoodExplorer = ({ userProfile }: { userProfile: UserProfile }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodItem['category'] | 'all'>('all');

  const getRecommendation = (food: FoodItem) => {
    const goals = userProfile.goals || [];

    // Mapping: Weight Gain -> Malnutrition, Weight Loss -> Obesity
    if (goals.includes('malnutrition')) {
      if (food.calories > 300 || (food.category === 'protein' && food.protein > 15)) {
        return { label: "Excellent for Weight Gain", color: "bg-emerald-50 text-emerald-600 border-emerald-100" };
      }
    }

    if (goals.includes('obesity')) {
      if (food.calories < 100 && food.category === 'vegetable') {
        return { label: "Perfect for Weight Loss", color: "bg-blue-50 text-blue-600 border-blue-100" };
      }
    }

    if (food.id === 'nakati' || food.id === 'silver-fish') {
      return { label: "Superfood", color: "bg-amber-50 text-amber-600 border-amber-100" };
    }

    return null;
  };

  const filteredFoods = UGANDAN_FOODS.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase()) ||
      food.localName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search local foods (e.g. Matooke, Mukene)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-full pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
          {['all', 'staple', 'protein', 'vegetable', 'fruit'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                selectedCategory === cat
                  ? "bg-[#5A5A40] text-white"
                  : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.map((food) => {
          const rec = getRecommendation(food);
          return (
            <Card key={food.id} className="hover:shadow-md transition-shadow cursor-pointer group relative">
              {rec && (
                <div className={cn("absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 z-10", rec.color)}>
                  <Star size={10} fill="currentColor" />
                  {rec.label}
                </div>
              )}

              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-serif font-bold text-stone-800 group-hover:text-[#F27D26] transition-colors">
                    {food.name}
                  </h4>
                  <p className="text-xs text-stone-500 italic">{food.localName}</p>
                </div>
                <div className="p-2 bg-stone-50 rounded-xl text-[#5A5A40]">
                  <CategoryIcon category={food.category} />
                </div>
              </div>

              <p className="text-sm text-stone-600 mb-4 line-clamp-2">{food.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-stone-50 p-2 rounded-lg">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Calories</p>
                  <p className="text-sm font-mono font-bold text-stone-700">{food.calories} kcal</p>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Protein</p>
                  <p className="text-sm font-mono font-bold text-stone-700">{food.protein}g</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {food.seasonalAvailability.slice(0, 4).map(month => (
                  <Badge key={month} className="text-[9px] py-0.5">{month}</Badge>
                ))}
                {food.seasonalAvailability.length > 4 && <Badge className="text-[9px] py-0.5">...</Badge>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
