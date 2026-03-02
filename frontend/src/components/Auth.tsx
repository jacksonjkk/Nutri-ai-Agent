
import React, { useState } from 'react';
import { login, signup } from '../services/apiService';
import { Card, Button, cn } from './UI';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const UGANDA_REGIONS: Record<string, string[]> = {
    'Central': ['Kampala', 'Mukono', 'Wakiso', 'Masaka', 'Mpigi', 'Luwero', 'Mubende', 'Kayunga', 'Rakai', 'Sembabule', 'Lyantonde', 'Mityana', 'Nakaseke'],
    'Western': ['Mbarara', 'Kabale', 'Fort Portal', 'Kasese', 'Bushenyi', 'Hoima', 'Ibanda', 'Kisoro', 'Masindi', 'Ntungamo', 'Rukungiri', 'Kamwenge'],
    'Eastern': ['Jinja', 'Mbale', 'Soroti', 'Tororo', 'Iganga', 'Busia', 'Kapchorwa', 'Kamuli', 'Bugiri', 'Mayuge', 'Butaleja', 'Namutumba'],
    'Northern': ['Gulu', 'Lira', 'Arua', 'Moroto', 'Kitgum', 'Apac', 'Adjumani', 'Nebbi', 'Yumbe', 'Kotido', 'Amuru', 'Oyam', 'Pader']
};

export const Auth = ({ onLogin }: { onLogin: () => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isVht, setIsVht] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [region, setRegion] = useState('');
    const [district, setDistrict] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const res = await login(email, password);
                if (res.success) {
                    onLogin();
                } else {
                    setError(res.error || 'Login failed');
                }
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                const additionalData = isVht ? {
                    role: 'vht',
                    full_name: fullName,
                    phone_number: phone,
                    region,
                    district
                } : {};

                const res = await signup(email, username, password, additionalData);
                if (res.success) {
                    setIsLogin(true);
                    setError('VHT Account created! Please login.');
                } else {
                    setError(res.error || 'Signup failed');
                }
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-4">
            <Card className="max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <User size={120} />
                </div>

                <div className="text-center mb-8 relative z-10">
                    <h1 className="text-4xl font-serif font-black text-[#5A5A40] tracking-tight mb-2">
                        Nutri <span className="text-[#F27D26]">Agent</span>
                    </h1>
                    <p className="text-stone-500 text-sm">
                        {isLogin ? 'Welcome back! Please login to your account.' : 'Join the NutriAgent community today!'}
                    </p>
                </div>

                {!isLogin && (
                    <div className="flex bg-stone-100 rounded-xl p-1 mb-6 relative z-10">
                        <button
                            onClick={() => setIsVht(false)}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", !isVht ? "bg-white text-[#5A5A40] shadow-sm" : "text-stone-400")}
                        >
                            Individual
                        </button>
                        <button
                            onClick={() => setIsVht(true)}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", isVht ? "bg-[#F27D26] text-white shadow-sm" : "text-stone-400")}
                        >
                            VHT Worker
                        </button>
                    </div>
                )}

                {error && (
                    <div className={cn(
                        "p-3 rounded-lg text-xs mb-6 text-center",
                        error.includes('successful') || error.includes('created') ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    {!isLogin && (
                        <>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                                    required={!isLogin}
                                />
                            </div>
                            {isVht && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <input
                                        type="text" placeholder="Full Name" value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F27D26]/20"
                                        required={isVht}
                                    />
                                    <input
                                        type="text" placeholder="Phone Number" value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F27D26]/20"
                                        required={isVht}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            value={region}
                                            onChange={(e) => { setRegion(e.target.value); setDistrict(''); }}
                                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm outline-none shadow-sm"
                                            required={isVht}
                                        >
                                            <option value="">Region</option>
                                            {Object.keys(UGANDA_REGIONS).map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={district}
                                            onChange={(e) => setDistrict(e.target.value)}
                                            disabled={!region}
                                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm outline-none shadow-sm disabled:opacity-50"
                                            required={isVht}
                                        >
                                            <option value="">District</option>
                                            {region && UGANDA_REGIONS[region].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <div className="relative animate-in slide-in-from-top-2">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all"
                                required={!isLogin}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className={cn(
                            "w-full h-12 rounded-2xl text-lg font-bold flex items-center justify-center gap-2",
                            isVht && !isLogin ? "bg-[#F27D26] hover:bg-[#d96a1b]" : ""
                        )}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : isVht ? 'Register VHT' : 'Create Account')}
                        {!isLoading && <ArrowRight size={20} />}
                    </Button>
                </form>

                <div className="mt-8 text-center text-sm text-stone-500">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="ml-2 text-[#F27D26] font-bold hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>
            </Card>
        </div>
    );
};
