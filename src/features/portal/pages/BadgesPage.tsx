import React, { useEffect, useState } from "react";
import { Award, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
    BADGE_DEFINITIONS,
    getUserBadges,
    getUserXp,
    getXpLeaderboard,
    type UserBadge,
    type LeaderboardEntry,
} from "../services/achievementService";

const BadgesPage: React.FC = () => {
    const { databaseUser, isDatabaseUserLoading } = useAuth();
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [totalXp, setTotalXp] = useState<number>(0);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!databaseUser?.id || isDatabaseUserLoading) {
                setIsLoading(false);
                return;
            }

            const [badgeRows, xpRow, leaderboardRows] = await Promise.all([
                getUserBadges(databaseUser.id),
                getUserXp(databaseUser.id),
                getXpLeaderboard(5),
            ]);

            if (!isMounted) return;

            setBadges(badgeRows);
            setTotalXp(xpRow?.totalXp ?? 0);
            setLeaderboard(leaderboardRows);
            setIsLoading(false);
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [databaseUser?.id, isDatabaseUserLoading]);

    return (
        <div className="p-3 md:p-4 w-full">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Badges & XP</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your progress and achievements.</p>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-gray-500">Loading achievements...</div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total XP</p>
                                <p className="text-2xl font-bold text-gray-900">{totalXp}</p>
                            </div>
                            <Trophy className="text-yellow-500" size={36} />
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Badges</h2>
                            {badges.length === 0 ? (
                                <p className="text-sm text-gray-500">No badges yet. Complete a quiz or course to earn one.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {badges.map((badge) => {
                                        const definition = BADGE_DEFINITIONS[badge.badgeKey as keyof typeof BADGE_DEFINITIONS];
                                        return (
                                            <div key={badge.id} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
                                                <div className="h-10 w-10 rounded-full bg-[#1839AD]/10 flex items-center justify-center">
                                                    <Award className="text-[#1839AD]" size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {definition?.title || badge.badgeKey}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {definition?.description || "Achievement unlocked."}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard</h2>
                            {leaderboard.length === 0 ? (
                                <p className="text-sm text-gray-500">No leaderboard data yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {leaderboard.map((entry, index) => (
                                        <div key={entry.userId} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
                                            <div>
                                                <p className="text-sm text-gray-500">#{index + 1}</p>
                                                <p className="font-medium text-gray-900">
                                                    {entry.name || entry.email || "Learner"}
                                                </p>
                                            </div>
                                            <div className="font-semibold text-gray-900">{entry.totalXp} XP</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BadgesPage;
