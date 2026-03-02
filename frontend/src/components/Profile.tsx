
import React, { useState, useEffect } from 'react';
import { User, Save, Info, AlertCircle, CheckCircle2, TrendingUp, Target, Activity, Heart, Baby } from 'lucide-react';
import { UserProfile } from '../types';
import { Card, Button, cn } from './UI';
import { completeOnboarding } from '../services/apiService';

interface ProfileProps {
    userProfile: UserProfile;
    onUpdate: (updatedProfile: UserProfile) => void;
}

const UGANDA_REGIONS: Record<string, string[]> = {
    'Central': ['Kampala', 'Mukono', 'Wakiso', 'Masaka', 'Mpigi', 'Luwero', 'Mubende', 'Kayunga', 'Rakai', 'Sembabule', 'Lyantonde', 'Mityana', 'Nakaseke'],
    'Western': ['Mbarara', 'Kabale', 'Fort Portal', 'Kasese', 'Bushenyi', 'Hoima', 'Ibanda', 'Kisoro', 'Masindi', 'Ntungamo', 'Rukungiri', 'Kamwenge'],
    'Eastern': ['Jinja', 'Mbale', 'Soroti', 'Tororo', 'Iganga', 'Busia', 'Kapchorwa', 'Kamuli', 'Bugiri', 'Mayuge', 'Butaleja', 'Namutumba'],
    'Northern': ['Gulu', 'Lira', 'Arua', 'Moroto', 'Kitgum', 'Apac', 'Adjumani', 'Nebbi', 'Yumbe', 'Kotido', 'Amuru', 'Oyam', 'Pader']
};

export const Profile = ({ userProfile, onUpdate }: ProfileProps) => {
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sync state if navigation happens or props update
    useEffect(() => {
        setFormData(userProfile);
    }, [userProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        const backendData = {
            ...formData,
            full_name: formData.name,
            goal: (formData.goals && formData.goals.length > 0) ? formData.goals[0] : 'maintenance',
            region: formData.region,
            district: formData.district,
            preferred_language: formData.language
        };

        const result = await completeOnboarding(backendData);

        if (!result.error) {
            setMessage({ type: 'success', text: 'Health Brain Updated!' });
            onUpdate(formData);
        } else {
            setMessage({ type: 'error', text: 'Sync Error. Please try again.' });
        }
        setIsSaving(false);
    };

    const activities = [
        { id: 'sedentary', label: 'Sedentary', desc: 'Little movement', icon: Activity },
        { id: 'moderate', label: 'Moderate', desc: '1-3 days active', icon: Activity },
        { id: 'active', label: 'Active', desc: 'Busy & daily gym', icon: TrendingUp },
        { id: 'very_active', label: 'Very Active', desc: 'Heavy athlete', icon: Target }
    ];

    const goalsList = [
        { id: 'malnutrition', label: 'Gain Weight', desc: 'Build strength & mass', icon: Target },
        { id: 'obesity', label: 'Lose Weight', desc: 'Burn fat sustainably', icon: TrendingUp },
        { id: 'maintenance', label: 'Maintain', desc: 'Balance energy & life', icon: Activity },
        { id: 'pregnancy', label: 'Pregnancy', desc: 'Maternal health', icon: Heart },
        { id: 'child_growth', label: 'Child Growth', desc: 'Early development', icon: Baby }
    ];

    const isGoalActive = (id: string) => (formData.goals || []).includes(id as any);
    const isActivityActive = (id: string) => formData.activityLevel === id;

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
            <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-serif font-bold text-stone-800">Health Profile</h2>
                    <p className="text-stone-500">Your data drives the AI Nutrition Brain</p>
                </div>
                <div className="w-16 h-16 bg-[#F27D26] rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3">
                    <User size={32} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Measurements Card */}
                <Card className="p-8 bg-white/50 backdrop-blur-sm">
                    <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                        <div className="w-2 h-6 bg-[#5A5A40] rounded-full" />
                        Body Measurements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white border border-stone-100 rounded-2xl px-5 py-3 text-stone-700 focus:ring-4 focus:ring-[#5A5A40]/5 focus:border-[#5A5A40] outline-none transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Region</label>
                            <select
                                value={formData.region}
                                onChange={e => setFormData({ ...formData, region: e.target.value, district: '' })}
                                className="w-full bg-white border border-stone-100 rounded-2xl px-5 py-3 text-stone-700 focus:ring-4 focus:ring-[#5A5A40]/5 focus:border-[#5A5A40] outline-none transition-all shadow-sm appearance-none"
                            >
                                <option value="">Select Region</option>
                                {Object.keys(UGANDA_REGIONS).map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">District</label>
                            <select
                                value={formData.district}
                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                disabled={!formData.region}
                                className="w-full bg-white border border-stone-100 rounded-2xl px-5 py-3 text-stone-700 focus:ring-4 focus:ring-[#5A5A40]/5 focus:border-[#5A5A40] outline-none transition-all shadow-sm appearance-none disabled:opacity-50"
                            >
                                <option value="">Select District</option>
                                {formData.region && UGANDA_REGIONS[formData.region].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                                className="w-full bg-white border border-stone-100 rounded-2xl px-5 py-3 text-stone-700 focus:ring-4 focus:ring-[#5A5A40]/5 focus:border-[#5A5A40] outline-none transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Weight (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.weight}
                                onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                className="w-full bg-white border border-stone-100 rounded-2xl px-5 py-3 text-stone-700 focus:ring-4 focus:ring-[#5A5A40]/5 focus:border-[#5A5A40] outline-none transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Height (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.height}
                                onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                                className="w-full bg-white border border-stone-100 rounded-2xl px-5 py-3 text-stone-700 focus:ring-4 focus:ring-[#5A5A40]/5 focus:border-[#5A5A40] outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </Card>

                {/* Goals Selection */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2 px-2">
                        <div className="w-2 h-6 bg-[#F27D26] rounded-full" />
                        Active Nutrition Goal
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {goalsList.map((g) => {
                            const active = isGoalActive(g.id);
                            return (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, goals: [g.id as any] })}
                                    className={cn(
                                        "p-5 rounded-[28px] border-2 text-left transition-all relative group flex flex-col h-full",
                                        active
                                            ? "border-[#F27D26] bg-[#F27D26]/5 shadow-[0_20px_40px_-15px_rgba(242,125,38,0.2)] scale-[1.02] z-10"
                                            : "border-white bg-white hover:border-stone-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                        active ? "bg-[#F27D26] text-white" : "bg-stone-50 text-stone-400"
                                    )}>
                                        <g.icon size={20} />
                                    </div>
                                    <div className="font-bold text-stone-800 mb-1">{g.label}</div>
                                    <div className="text-[11px] text-stone-400 leading-tight mb-2">{g.desc}</div>
                                    {active && (
                                        <div className="mt-auto flex items-center gap-1.5 text-[10px] font-bold text-[#F27D26] uppercase">
                                            <CheckCircle2 size={12} />
                                            Current Target
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2 px-2">
                        <div className="w-2 h-6 bg-[#5A5A40] rounded-full" />
                        Daily Activity Level
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activities.map((lvl) => {
                            const active = isActivityActive(lvl.id);
                            return (
                                <button
                                    key={lvl.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, activityLevel: lvl.id as any })}
                                    className={cn(
                                        "p-5 rounded-[28px] border-2 text-left transition-all relative group flex flex-col h-full",
                                        active
                                            ? "border-[#5A5A40] bg-[#5A5A40]/5 shadow-sm scale-[1.02] z-10"
                                            : "border-white bg-white hover:border-stone-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                        active ? "bg-[#5A5A40] text-white" : "bg-stone-50 text-stone-300 group-hover:text-stone-400"
                                    )}>
                                        <lvl.icon size={20} />
                                    </div>
                                    <div className="font-bold text-stone-800 mb-1">{lvl.label}</div>
                                    <div className="text-[11px] text-stone-400 leading-tight mb-2">{lvl.desc}</div>
                                    {active && (
                                        <div className="mt-auto flex items-center gap-1.5 text-[10px] font-bold text-[#5A5A40] uppercase">
                                            <CheckCircle2 size={12} />
                                            Current Level
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {message && (
                    <div className={cn(
                        "p-5 rounded-[24px] flex items-center gap-4 text-sm font-medium animate-in zoom-in-95",
                        message.type === 'success' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    )}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", message.type === 'success' ? "bg-emerald-100" : "bg-rose-100")}>
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </div>
                        {message.text}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-3 py-6 rounded-[28px] text-lg font-serif shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                >
                    {isSaving ? "Synchronizing Brain..." : "Update Health Profile"}
                    <Save size={20} />
                </Button>
            </form>

            <div className="bg-stone-800 rounded-[32px] p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                <div className="flex gap-4 items-start relative z-10">
                    <Info size={24} className="text-[#F27D26] shrink-0" />
                    <div className="space-y-2">
                        <h4 className="font-serif font-bold text-lg">Did you know?</h4>
                        <p className="text-sm text-stone-400 leading-relaxed">
                            When you update your weight or activity level, our **Ugandan LLM Brain** immediately re-adjusts your portion sizes (like Matooke fingers) to ensure you stay on track for your goal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
