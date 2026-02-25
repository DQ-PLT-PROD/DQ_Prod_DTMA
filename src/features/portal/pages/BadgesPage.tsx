import React, { useEffect, useState } from "react";
import { Award, Trophy, Share2, ExternalLink, Info, Loader2, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
    getUserBadges,
    getUserXp,
    getXpLeaderboard,
    type UserBadge,
    type LeaderboardEntry,
} from "../services/achievementService";
import { Link } from "react-router-dom";
import { Button } from "@/components/Button";
import { Badge } from "@/components/ui/Badge";
import AchievementModal from "@/components/AchievementModal";

const BadgesPage: React.FC = () => {
    const { databaseUser, isDatabaseUserLoading } = useAuth();
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [totalXp, setTotalXp] = useState<number>(0);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"earned" | "leaderboard">("earned");
    const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!databaseUser?.id || isDatabaseUserLoading) {
                if (!isDatabaseUserLoading) setIsLoading(false);
                return;
            }

            try {
                const [badgeRows, xpRow, leaderboardRows] = await Promise.all([
                    getUserBadges(databaseUser.id),
                    getUserXp(databaseUser.id),
                    getXpLeaderboard(10),
                ]);

                if (!isMounted) return;

                setBadges(badgeRows);
                setTotalXp(xpRow?.totalXp ?? 0);
                setLeaderboard(leaderboardRows);
            } catch (error) {
                console.error("Failed to load badges data:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [databaseUser?.id, isDatabaseUserLoading]);

    const handleShare = (badge: UserBadge, e: React.MouseEvent) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/badges/share/${badge.shareToken}`;
        const shareText = `I just earned the "${badge.badge.title}" badge on Digital Qatalyst!`;

        if (navigator.share) {
            navigator.share({
                title: "My Learning Achievement",
                text: shareText,
                url: shareUrl,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert("Share link copied to clipboard!");
            });
        }
    };

    const openBadgeDetails = (badge: UserBadge) => {
        setSelectedBadge(badge);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <Loader2 className="h-12 w-12 text-[#1839AD] animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading your achievements...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 flex flex-col min-h-0 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Achievements</h1>
                        <p className="text-gray-500 mt-2 text-lg">
                            Track your progress, earn badges, and climb the leaderboard.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center gap-4 min-w-[200px]">
                        <div className="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center shrink-0">
                            <Trophy className="text-yellow-500" size={28} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total XP</p>
                            <p className="text-2xl font-bold text-gray-900 leading-tight">{totalXp.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("earned")}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === "earned"
                            ? "text-[#1839AD]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        My Badges ({badges.length})
                        {activeTab === "earned" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1839AD]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("leaderboard")}
                        className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === "leaderboard"
                            ? "text-[#1839AD]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Leaderboard
                        {activeTab === "leaderboard" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1839AD]" />
                        )}
                    </button>
                </div>

                {activeTab === "earned" ? (
                    <div className="space-y-6">
                        {badges.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center max-w-2xl mx-auto">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Award className="text-gray-300" size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">No badges yet</h2>
                                <p className="text-gray-500 mb-8 leading-relaxed">
                                    You haven't earned any badges yet. Start your learning journey today and badges will appear here as you reach milestones.
                                </p>
                                <Button asChild className="rounded-full px-8">
                                    <Link to="/courses">Browse Courses</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {badges.map((userBadge) => (
                                    <div
                                        key={userBadge.id}
                                        onClick={() => openBadgeDetails(userBadge)}
                                        className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="h-16 w-16 rounded-2xl bg-[#1839AD]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                {userBadge.badge.iconUrl ? (
                                                    <img src={userBadge.badge.iconUrl} alt={userBadge.badge.title} className="w-10 h-10 object-contain" />
                                                ) : (
                                                    <Award className="text-[#1839AD]" size={32} />
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => handleShare(userBadge, e)}
                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1839AD] transition-colors"
                                                title="Share Achievement"
                                            >
                                                <Share2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {userBadge.badge.category && (
                                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider px-1.5 py-0">
                                                        {userBadge.badge.category}
                                                    </Badge>
                                                )}
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    Earned {new Date(userBadge.earnedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1839AD] transition-colors">
                                                {userBadge.badge.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                {userBadge.badge.description}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex items-center text-[#1839AD] text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details <ExternalLink size={12} className="ml-1.5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Search size={18} className="text-gray-400" /> Top Learners
                            </h2>
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Top 10 Global</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {leaderboard.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No leaderboard data available yet.</div>
                            ) : (
                                leaderboard.map((entry, index) => {
                                    const isMe = entry.userId === databaseUser?.id;
                                    return (
                                        <div
                                            key={entry.userId}
                                            className={`flex items-center gap-4 p-4 transition-colors ${isMe ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="w-8 flex justify-center">
                                                {index === 0 ? (
                                                    <span className="text-xl">🥇</span>
                                                ) : index === 1 ? (
                                                    <span className="text-xl">🥈</span>
                                                ) : index === 2 ? (
                                                    <span className="text-xl">🥉</span>
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                                                )}
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm overflow-hidden">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name || entry.email || 'L')}&background=random`} 
                                                    alt={entry.name || 'Learner'} 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate flex items-center gap-2">
                                                    {entry.name || entry.email?.split('@')[0] || "Learner"}
                                                    {isMe && <Badge variant="default" className="text-[10px] h-4">You</Badge>}
                                                </p>
                                                <p className="text-xs text-gray-500">Certified Digital Qatalyst</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <span className="font-black text-gray-900">{entry.totalXp.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-[#1839AD] uppercase">XP</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-[#1839AD]/5 rounded-2xl p-6 border border-[#1839AD]/10 flex flex-col sm:flex-row items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                        <Info className="text-[#1839AD]" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">How to earn more badges?</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Badges are awarded for various achievements including completing courses, passing quizzes with high scores, and maintaining learning streaks. Each badge you earn adds to your XP and helps you climb the leaderboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Adapt AchievementModal for badge details if needed */}
            {selectedBadge && (
                <AchievementModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    score={100} // Dummy score for modal compatibility
                    courseName={selectedBadge.badge.title}
                    userName={databaseUser?.name || "Learner"}
                />
            )}
        </div>
    );
};

export default BadgesPage;
