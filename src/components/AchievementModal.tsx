import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, X, Share2, ArrowRight, Sparkles, Star } from "lucide-react";
import { type BadgeDefinition } from "@/features/portal/services/achievementService";

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  courseName: string;
  userName?: string;
  badge?: {
    definition: BadgeDefinition;
    shareToken?: string;
  };
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  score,
  courseName,
  userName = "Learner",
  badge,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  const getBadgeInfo = () => {
    if (badge?.definition.iconUrl) {
      return { 
        icon: null, 
        imgUrl: badge.definition.iconUrl,
        color: "text-blue-500", 
        bgColor: "bg-blue-50", 
        borderColor: "border-blue-200" 
      };
    }
    if (score >= 90) {
      return { icon: Trophy, color: "text-yellow-500", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
    }
    if (score >= 80) {
      return { icon: Medal, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" };
    }
    return { icon: Award, color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" };
  };

  const badgeInfo = getBadgeInfo();
  const BadgeIcon = badgeInfo.icon;

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const t1 = setTimeout(() => setAnimationPhase(1), 300);
      const t2 = setTimeout(() => setAnimationPhase(2), 700);
      const t3 = setTimeout(() => setAnimationPhase(3), 1100);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isOpen]);

  const handleShare = () => {
    const shareUrl = badge?.shareToken 
      ? `${window.location.origin}/badges/share/${badge.shareToken}`
      : window.location.href;
    
    const shareText = badge 
      ? `I just earned the "${badge.definition.title}" badge on Digital Qatalyst!`
      : `I just completed "${courseName}" with a score of ${score}%! #LearningAchievement #DigitalBuilder`;

    if (navigator.share) {
      navigator.share({ 
        title: badge ? "My Achievement Badge" : "Course Achievement", 
        text: shareText, 
        url: shareUrl 
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => alert("Share link copied to clipboard!"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${2 + Math.random() * 1.5}s`,
              }}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  ["bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-red-400", "bg-purple-400"][Math.floor(Math.random() * 5)]
                }`}
              />
            </div>
          ))}
        </div>
      )}

      <div
        className={`bg-white rounded-[32px] max-w-lg w-full relative overflow-hidden transform transition-all duration-500 shadow-2xl ${
          animationPhase >= 1 ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#1839AD] to-[#2e469e] opacity-5" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
        >
          <X size={18} className="text-gray-400" />
        </button>

        <div className="relative p-8 md:p-10 text-center overflow-y-auto" style={{ maxHeight: "90vh" }}>
          <div
            className={`mb-6 transform transition-all duration-700 delay-300 ${
              animationPhase >= 2 ? "scale-100 rotate-0" : "scale-0 rotate-180"
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${badgeInfo.bgColor} ${badgeInfo.borderColor} border-4 mb-2 relative shadow-inner`}
            >
              {badgeInfo.imgUrl ? (
                <img src={badgeInfo.imgUrl} alt="Badge" className="w-16 h-16 object-contain" />
              ) : (
                BadgeIcon && <BadgeIcon size={56} className={badgeInfo.color} />
              )}
              <Sparkles size={20} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
              <Star size={16} className="absolute -bottom-1 -left-1 text-yellow-400 animate-ping" />
            </div>
          </div>

          <div
            className={`mb-8 transform transition-all duration-700 delay-500 ${
              animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#1839AD]/10 text-[#1839AD] text-xs font-black uppercase tracking-widest mb-4">
              {badge ? "Badge Earned" : "Achievement Unlocked"}
            </span>
            <h2 className="text-3xl font-black text-gray-900 mb-3 leading-tight">
                {badge ? `Congratulations, ${userName}!` : "🎉 Amazing Work!"}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              {badge 
                ? `You've earned the "${badge.definition.title}" badge for your outstanding progress.` 
                : `Outstanding! You've successfully completed "${courseName}"!`}
            </p>
            
            {!badge && (
                <div className="bg-[#1839AD] text-white rounded-3xl p-6 mb-4 shadow-xl shadow-blue-900/20">
                    <div className="text-5xl font-black mb-1">{score}%</div>
                    <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Final Score</div>
                </div>
            )}
          </div>

          <div
            className={`space-y-4 transform transition-all duration-700 delay-700 ${
              animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <button
              onClick={handleShare}
              className="w-full bg-[#1839AD] text-white h-14 rounded-full font-bold hover:bg-[#132b7c] transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-900/10 group"
            >
              <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
              Share Your Achievement
            </button>

            <button
              onClick={onClose}
              className="w-full h-14 border-2 border-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-50 hover:border-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              Continue Journey
              <ArrowRight size={20} />
            </button>
          </div>

          <div
            className={`mt-10 pt-8 border-t border-gray-100 transform transition-all duration-700 delay-900 ${
              animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-sm text-gray-400 font-medium italic">"Every expert was once a beginner. Keep up the amazing work!"</p>
          </div>
        </div>

        <div className="h-2 bg-gradient-to-r from-yellow-400 via-[#1839AD] to-blue-400" />
      </div>
    </div>
  );
};

export default AchievementModal;
