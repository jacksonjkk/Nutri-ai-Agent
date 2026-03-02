
import React, { useState } from 'react';
import { Card, Button, cn } from './UI';
import { User, Activity, Target, MapPin, ArrowRight, Loader2, ChevronRight, ChevronLeft, Heart, Baby, TrendingUp } from 'lucide-react';

const UGANDA_REGIONS: Record<string, string[]> = {
    'Central': ['Kampala', 'Mukono', 'Wakiso', 'Masaka', 'Mpigi', 'Luwero', 'Mubende', 'Kayunga', 'Rakai', 'Sembabule', 'Lyantonde', 'Mityana', 'Nakaseke'],
    'Western': ['Mbarara', 'Kabale', 'Fort Portal', 'Kasese', 'Bushenyi', 'Hoima', 'Ibanda', 'Kisoro', 'Masindi', 'Ntungamo', 'Rukungiri', 'Kamwenge'],
    'Eastern': ['Jinja', 'Mbale', 'Soroti', 'Tororo', 'Iganga', 'Busia', 'Kapchorwa', 'Kamuli', 'Bugiri', 'Mayuge', 'Butaleja', 'Namutumba'],
    'Northern': ['Gulu', 'Lira', 'Arua', 'Moroto', 'Kitgum', 'Apac', 'Adjumani', 'Nebbi', 'Yumbe', 'Kotido', 'Amuru', 'Oyam', 'Pader']
};

interface OnboardingData {
    full_name: string;
    age: number;
    gender: string;
    height: number;
    weight: number;
    activity_level: string;
    goal: string;
    region: string;
    district: string;
}

export const Onboarding = ({ onComplete }: { onComplete: (data: OnboardingData) => void }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        full_name: '',
        age: 25,
        gender: 'male',
        height: 170,
        weight: 65,
        activity_level: 'moderate',
        goal: 'maintenance',
        region: '',
        district: ''
    });

    const goals = [
        { id: 'malnutrition', label: 'Gain Weight', icon: Target },
        { id: 'obesity', label: 'Lose Weight', icon: TrendingUp },
        { id: 'maintenance', label: 'Maintenance', icon: Activity },
        { id: 'pregnancy', label: 'Pregnancy', icon: Heart },
        { id: 'child_growth', label: 'Child Growth', icon: Baby },
    ];

    const activityLevels = [
        { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
        { id: 'moderate', label: 'Moderate', desc: '1-3 days / week' },
        { id: 'active', label: 'Active', desc: '4-5 days / week' },
    ];

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleSubmit();
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        // We'll call the API from the parent App component
        onComplete(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-4">
            <Card className="max-w-xl w-full p-10 shadow-2xl">
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F27D26]">Onboarding</span>
                        <span className="text-[10px] font-bold text-stone-400">Step {step} of 3</span>
                    </div>
                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#F27D26] transition-all duration-500"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-3xl font-serif font-bold text-stone-800">Tell us about yourself</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={data.full_name}
                                    onChange={(e) => setData({ ...data, full_name: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">Region</label>
                                <select
                                    value={data.region}
                                    onChange={(e) => setData({ ...data, region: e.target.value, district: '' })}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm"
                                >
                                    <option value="">Select Region</option>
                                    {Object.keys(UGANDA_REGIONS).map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">District</label>
                                <select
                                    value={data.district}
                                    onChange={(e) => setData({ ...data, district: e.target.value })}
                                    disabled={!data.region}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm disabled:opacity-50"
                                >
                                    <option value="">Select District</option>
                                    {data.region && UGANDA_REGIONS[data.region].map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">Age</label>
                                <input
                                    type="number"
                                    value={data.age}
                                    onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">Gender</label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm appearance-none"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={data.weight}
                                    onChange={(e) => setData({ ...data, weight: parseFloat(e.target.value) })}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">Height (cm)</label>
                                <input
                                    type="number"
                                    value={data.height}
                                    onChange={(e) => setData({ ...data, height: parseFloat(e.target.value) })}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-3xl font-serif font-bold text-stone-800">Your Activity Level</h2>
                        <div className="space-y-3">
                            {activityLevels.map((lvl) => (
                                <button
                                    key={lvl.id}
                                    onClick={() => setData({ ...data, activity_level: lvl.id })}
                                    className={cn(
                                        "w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between group",
                                        data.activity_level === lvl.id
                                            ? "bg-[#5A5A40] border-[#5A5A40] text-white"
                                            : "bg-white border-stone-200 hover:border-stone-400"
                                    )}
                                >
                                    <div>
                                        <p className="font-bold">{lvl.label}</p>
                                        <p className={cn(
                                            "text-xs",
                                            data.activity_level === lvl.id ? "text-white/70" : "text-stone-400"
                                        )}>{lvl.desc}</p>
                                    </div>
                                    <ChevronRight className={cn(
                                        "transition-transform",
                                        data.activity_level === lvl.id ? "translate-x-1" : "text-stone-300"
                                    )} size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-3xl font-serif font-bold text-stone-800">What is your goal?</h2>
                        <div className="grid grid-cols-1 gap-3">
                            {goals.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => setData({ ...data, goal: g.id })}
                                    className={cn(
                                        "w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between",
                                        data.goal === g.id
                                            ? "bg-[#F27D26] border-[#F27D26] text-white"
                                            : "bg-white border-stone-200 hover:border-stone-400"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            data.goal === g.id ? "bg-white/20" : "bg-stone-50 text-[#F27D26]"
                                        )}>
                                            <g.icon size={20} />
                                        </div>
                                        <p className="font-bold">{g.label}</p>
                                    </div>
                                    <ChevronRight size={20} className={data.goal === g.id ? "text-white" : "text-stone-300"} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-3 mt-10">
                    {step > 1 && (
                        <Button
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            className="px-6 rounded-2xl"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                    )}
                    <Button
                        onClick={handleNext}
                        className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (step === 3 ? 'Get Started' : 'Continue')}
                        {!isLoading && <ArrowRight size={20} />}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

// end of file
