import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Award, ShieldCheck, Calendar, Share2, ArrowRight, Loader2, Trophy, ExternalLink } from "lucide-react";
import { getBadgeByShareToken, type UserBadge } from "../services/achievementService";
import { Button } from "@/components/Button";

const BadgeSharePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [badge, setBadge] = useState<UserBadge | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBadge = async () => {
            if (!token) {
                setError("Invalid share link.");
                setIsLoading(false);
                return;
            }

            try {
                const data = await getBadgeByShareToken(token);
                if (data) {
                    setBadge(data);
                } else {
                    setError("Badge not found or link has expired.");
                }
            } catch (err) {
                console.error("Error loading share badge:", err);
                setError("Failed to load badge details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadBadge();
    }, [token]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
                <Loader2 className="h-12 w-12 text-[#1839AD] animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-lg">Verifying achievement...</p>
            </div>
        );
    }

    if (error || !badge) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <Award className="text-red-300" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
                <p className="text-gray-500 mb-8 max-w-md">{error || "This badge achievement could not be found."}</p>
                <Button asChild className="rounded-full px-8 bg-[#1839AD]">
                    <Link to="/">Go to Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center">
                        <img src="/logo/dtma-logo-white.svg" alt="DTMA" className="h-8 w-auto brightness-0" />
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
                        <ShieldCheck className="text-green-600" size={14} />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Verified Achievement</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-12 flex items-center justify-center">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 gap-8 bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">
                    {/* Visual Section */}
                    <div className="md:col-span-2 bg-gradient-to-br from-[#1839AD] to-[#2e469e] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <Trophy size={300} className="absolute -top-20 -right-20 rotate-12" />
                            <Award size={200} className="absolute -bottom-10 -left-10 -rotate-12" />
                        </div>
                        
                        <div className="relative">
                            <div className="h-40 w-40 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/20 flex items-center justify-center mb-8 shadow-inner animate-pulse-slow">
                                {badge.badge.iconUrl ? (
                                    <img src={badge.badge.iconUrl} alt={badge.badge.title} className="w-24 h-24 object-contain filter drop-shadow-lg" />
                                ) : (
                                    <Award className="text-white" size={80} />
                                )}
                            </div>
                            <div className="inline-block px-4 py-1.5 rounded-full bg-yellow-400 text-[#1839AD] text-xs font-black uppercase tracking-widest mb-2 shadow-lg">
                                Certified
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight mb-2">
                            {badge.badge.title}
                        </h2>
                        <div className="w-16 h-1 bg-white/30 mx-auto rounded-full mb-4" />
                        <p className="text-white/80 text-sm font-medium">
                            Digital Qatalyst Learning Portal
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="md:col-span-3 p-8 md:p-12 flex flex-col">
                        <div className="mb-8">
                            <span className="text-xs font-bold text-[#1839AD] uppercase tracking-[0.2em] mb-3 block">Achievement Details</span>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                This badge was earned by <span className="text-[#1839AD]">{(badge as any).userName}</span>
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                {badge.badge.description}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Date Earned</span>
                                    </div>
                                    <p className="font-bold text-gray-900">
                                        {new Date(badge.earnedAt).toLocaleDateString(undefined, { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Trophy size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Category</span>
                                    </div>
                                    <p className="font-bold text-gray-900">{badge.badge.category || "Skill Mastery"}</p>
                                </div>
                            </div>
                        </div>

                        {badge.badge.criteriaText && (
                            <div className="mb-8 p-5 rounded-2xl border border-gray-200 bg-white">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-[#1839AD]" /> Earning Criteria
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed italic">
                                    "{badge.badge.criteriaText}"
                                </p>
                            </div>
                        )}

                        <div className="mt-auto space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="flex-1 rounded-full bg-[#1839AD] h-14 text-lg font-bold group" asChild>
                                    <Link to="/courses">
                                        Start Your Journey <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <Button variant="outline" className="rounded-full h-14 px-8 border-gray-200 hover:bg-gray-50 group" onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: `Badge Earned: ${badge.badge.title}`,
                                            url: window.location.href
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href).then(() => alert("Link copied!"));
                                    }
                                }}>
                                    <Share2 className="text-gray-400 group-hover:text-[#1839AD] transition-colors" />
                                </Button>
                            </div>
                            <p className="text-center text-xs text-gray-400">
                                Empowering learners to build the digital future of Abu Dhabi. 
                                <a href="https://dtma.ae" className="text-[#1839AD] font-bold ml-1 inline-flex items-center">
                                    Learn more <ExternalLink size={10} className="ml-0.5" />
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-8 px-6 text-center">
                <p className="text-sm text-gray-500 font-medium">
                    &copy; {new Date().getFullYear()} Digital Qatalyst Learning Portal. All Rights Reserved.
                </p>
            </footer>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default BadgeSharePage;
