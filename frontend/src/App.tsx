
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  MessageSquare,
  UserCircle,
  ChevronRight,
  Heart,
  TrendingUp,
  Globe,
  LogOut,
  ClipboardList
} from 'lucide-react';
import { UserProfile, Language, DashboardData } from './types';
import { Card, Button, Badge, cn } from './components/UI';
import { NutritionChat } from './components/NutritionChat';
import { FoodExplorer } from './components/FoodExplorer';
import { MealPlanner } from './components/MealPlanner';
import { Auth } from './components/Auth';
import { Onboarding } from './components/Onboarding';
import { Profile } from './components/Profile';
import { DailyLogger } from './components/DailyLogger';
import { VHTDashboard } from './components/VHTDashboard';
import { getAuthToken, logout, getMe, completeOnboarding } from './services/apiService';

const INITIAL_PROFILE: UserProfile = {
  name: "Guest",
  age: 25,
  gender: "male",
  weight: 65,
  height: 170,
  activityLevel: "moderate",
  conditions: [],
  goals: ["maintenance"],
  region: "Uganda",
  language: "en"
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'chat' | 'foods' | 'planner' | 'profile'>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [userRole, setUserRole] = useState<'user' | 'vht'>('user');

  useEffect(() => {
    if (isAuthenticated) {
      checkUserStatus();
    }
  }, [isAuthenticated]);

  const checkUserStatus = async () => {
    const data = await getMe();
    if (!data) return;

    if (data.role) {
      setUserRole(data.role as any);
    }

    if (data.onboarding_completed === false) {
      setNeedsOnboarding(true);
    } else if (data.profile_summary) {
      const profile = data.profile_summary;

      // ... same profile mapping ...
      let activityLevel = profile.activity_level || 'moderate';
      if (activityLevel === 'very active') activityLevel = 'very_active';

      let currentGoal = profile.goal || 'maintenance';
      if (currentGoal === 'gain weight') currentGoal = 'malnutrition';
      if (currentGoal === 'lose weight') currentGoal = 'obesity';

      setUserProfile({
        name: profile.full_name || data.username || "Anonymous",
        age: profile.age || 25,
        gender: profile.gender || 'male',
        weight: profile.weight || 65,
        height: profile.height || 170,
        activityLevel: activityLevel as any,
        conditions: profile.medical_conditions || [],
        goals: [currentGoal as any],
        region: profile.region || "Region Not Set",
        language: profile.preferred_language || "en"
      });

      if (data.goal_progress && data.nutrition_metrics) {
        setDashboardData({
          bmi: data.goal_progress.bmi,
          bmiCategory: data.goal_progress.bmi_category,
          bmr: data.goal_progress.bmr,
          tdee: data.goal_progress.tdee,
          avgCalories: data.nutrition_metrics.avg_calories,
          consistencyScore: data.nutrition_metrics.consistency_score,
          calorieTrend: data.nutrition_metrics.calorie_trend,
          aiInsight: data.ai_insight ? {
            summary: data.ai_insight.summary,
            behavioral_insight: data.ai_insight.behavioral_insight,
            risk_level: data.ai_insight.risk_level
          } : undefined
        });
      }
      setNeedsOnboarding(false);
    }
  };

  const handleOnboardingComplete = async (onboardingData: any) => {
    const res = await completeOnboarding(onboardingData);
    if (!res.error) {
      setNeedsOnboarding(false);
      checkUserStatus();
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setNeedsOnboarding(false);
    window.location.reload();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logs', label: 'Daily Log', icon: ClipboardList },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'foods', label: 'Food Explorer', icon: UtensilsCrossed },
    { id: 'planner', label: 'Meal Planner', icon: TrendingUp },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'lg', label: 'Luganda' },
    { id: 'sw', label: 'Swahili' },
  ];

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (userRole === 'vht') {
    return <VHTDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-stone-800 font-sans selection:bg-[#F27D26]/30">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:bottom-0 md:w-64 bg-white border-t md:border-t-0 md:border-r border-stone-200 z-50">
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-serif font-black text-[#5A5A40] tracking-tight">
            Nutri <span className="text-[#F27D26]">Agent</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mt-1">Uganda Nutrition AI Agent</p>
        </div>

        <div className="flex md:flex-col p-2 md:p-4 gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-3 md:px-4 md:py-3 rounded-2xl transition-all min-w-[64px] md:min-w-0",
                activeTab === item.id
                  ? "bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20"
                  : "text-stone-500 hover:bg-stone-50"
              )}
            >
              <item.icon size={20} />
              <span className="hidden md:block md:text-sm font-medium">{item.label}</span>
              <span className="md:hidden text-[8px] font-bold mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="hidden md:block absolute bottom-8 left-6 right-6">
          <Card className="p-4 bg-stone-50 border-none rounded-2xl relative group">
            <button
              onClick={handleLogout}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#F27D26] flex items-center justify-center text-white">
                <UserCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold">{userProfile.name}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider">{userProfile.region}</p>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {userProfile.goals.map(goal => {
                const goalMap: any = {
                  'malnutrition': 'Gain Weight',
                  'obesity': 'Lose Weight',
                  'maintenance': 'Maintenance',
                  'pregnancy': 'Pregnancy',
                  'child_growth': 'Child Growth'
                };
                return <Badge key={goal} className="text-[8px] px-2 py-0.5 bg-white border-stone-100">{goalMap[goal] || goal}</Badge>;
              })}
            </div>
          </Card>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-10 pb-24 md:pb-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">
              {activeTab === 'dashboard' && `Hello, ${userProfile.name}`}
              {activeTab === 'logs' && "Daily Health Log"}
              {activeTab === 'chat' && "Nutrition Assistant"}
              {activeTab === 'foods' && "Ugandan Food Database"}
              {activeTab === 'planner' && "Your Meal Plan"}
            </h2>
            <p className="text-stone-500 mt-1">
              {activeTab === 'dashboard' && "Here's your nutritional overview for today."}
              {activeTab === 'logs' && "Track your meals, water, and sleep to fuel the AI."}
              {activeTab === 'chat' && "Ask anything about local foods and healthy living."}
              {activeTab === 'foods' && "Explore the nutritional value of local staples."}
              {activeTab === 'planner' && "Balanced meals using affordable ingredients."}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-stone-200 shadow-sm self-start">
            <Globe size={14} className="ml-3 text-stone-400" />
            {languages.map(lang => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  language === lang.id ? "bg-[#5A5A40] text-white" : "text-stone-500 hover:text-stone-800"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </header>

        {/* Tab Content */}
        <div className="max-w-5xl">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <Heart size={120} />
                </div>
                <div className="relative z-10">
                  <Badge className={cn(
                    "mb-4 border",
                    dashboardData?.aiInsight?.risk_level === 'Low' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      dashboardData?.aiInsight?.risk_level === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        dashboardData?.aiInsight?.risk_level === 'High' ? "bg-red-50 text-red-600 border-red-100" :
                          "bg-stone-50 text-stone-600 border-stone-100"
                  )}>
                    Health Status: {dashboardData?.aiInsight?.risk_level === 'Low' ? 'Stable' :
                      dashboardData?.aiInsight?.risk_level === 'Medium' ? 'Warning' :
                        dashboardData?.aiInsight?.risk_level === 'High' ? 'Action Required' : 'Analyzing...'}
                  </Badge>
                  <h3 className="text-2xl font-serif font-bold mb-2">
                    {dashboardData?.aiInsight?.summary || "Personalized Health AI Analysis"}
                  </h3>
                  <p className="text-stone-500 text-sm mb-6 max-w-md">
                    {dashboardData?.aiInsight?.behavioral_insight ||
                      "Log your meals and activities so our AI Agent can provide targeted nutritional insights grounded in Ugandan food data."}
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={() => setActiveTab('planner')}>View Meal Plan</Button>
                    <Button variant="outline" onClick={() => setActiveTab('chat')}>Ask AI Advice</Button>
                  </div>
                </div>
              </Card>

              <Card className="bg-[#F27D26] text-white">
                <h3 className="text-lg font-serif font-bold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 border-b border-white/20 pb-3">
                    <span className="text-[10px] uppercase tracking-wider opacity-70">Body Mass Index (BMI)</span>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-mono font-black">{dashboardData?.bmi || '---'}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold",
                        (() => {
                          const cat = dashboardData?.bmiCategory.toLowerCase() || '';
                          if (cat.includes('normal') || cat.includes('healthy')) return "bg-emerald-500 text-white";
                          if (cat.includes('underweight') || cat.includes('overweight') || cat.includes('obesity') || cat.includes('average')) return "bg-red-500 text-white";
                          return "bg-white/20 text-white";
                        })()
                      )}>
                        {dashboardData?.bmiCategory || 'Not Calc'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-xs opacity-80">Daily Goal (TDEE)</span>
                    <span className="font-mono font-bold text-sm">{dashboardData?.tdee.toLocaleString() || '---'} kcal</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-xs opacity-80">Metabolic Rate (BMR)</span>
                    <span className="font-mono font-bold text-sm">{dashboardData?.bmr.toLocaleString() || '---'} kcal</span>
                  </div>
                </div>
                <div className="mt-6 p-3 bg-white/10 rounded-2xl text-[10px] leading-relaxed">
                  Tip: Drinking water before meals can help with portion control during lunch.
                </div>
              </Card>

              <div className="md:col-span-3">
                <h4 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                  <UtensilsCrossed size={20} className="text-[#F27D26]" />
                  Featured Local Superfoods
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Mukene', 'Nakati', 'Millet'].map(food => (
                    <Card key={food} className="p-4 flex items-center justify-between hover:border-[#F27D26]/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center text-[#5A5A40]">
                          <Heart size={18} />
                        </div>
                        <span className="font-medium">{food}</span>
                      </div>
                      <ChevronRight size={16} className="text-stone-300" />
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && <DailyLogger onLogSaved={checkUserStatus} />}
          {activeTab === 'chat' && <NutritionChat userProfile={userProfile} />}
          {activeTab === 'foods' && <FoodExplorer userProfile={userProfile} />}
          {activeTab === 'planner' && <MealPlanner userProfile={userProfile} />}
          {activeTab === 'profile' && (
            <>
              <Profile
                userProfile={userProfile}
                onUpdate={() => {
                  checkUserStatus();
                  setActiveTab('dashboard');
                }}
              />
              {/* Mobile Logout (Ends Profile Page) */}
              <div className="md:hidden mt-12 pb-12 pt-8 border-t border-stone-200 flex flex-col items-center">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors px-8 py-3 text-sm"
                >
                  <LogOut size={16} />
                  Logout
                </Button>
                <p className="text-center text-stone-400 text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">
                  Stay healthy, stay consistent.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
