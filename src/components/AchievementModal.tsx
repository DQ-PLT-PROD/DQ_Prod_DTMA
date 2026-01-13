import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, X, Share2, ArrowRight, Sparkles, Star } from "lucide-react";

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  courseName: string;
  userName?: string;
}

const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  onClose,
  score,
  courseName,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  const getBadgeInfo = () => {
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
    const shareText = `I just completed "${courseName}" with a score of ${score}%! #LearningAchievement #DigitalBuilder`;
    if (navigator.share) {
      navigator.share({ title: "Course Achievement", text: shareText, url: window.location.href });
    } else {
      navigator.clipboard.writeText(shareText).then(() => alert("Achievement copied to clipboard! Share it with your network!"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
        className={`bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden transform transition-all duration-500 ${
          animationPhase >= 1 ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-[#1839AD] via-[#2E469E] to-[#4A5FC7] opacity-10" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="relative p-6 text-center overflow-y-auto" style={{ maxHeight: "90vh" }}>
          <div
            className={`mb-4 transform transition-all duration-700 delay-300 ${
              animationPhase >= 2 ? "scale-100 rotate-0" : "scale-0 rotate-180"
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${badgeInfo.bgColor} ${badgeInfo.borderColor} border-4 mb-2 relative`}
            >
              <BadgeIcon size={40} className={badgeInfo.color} />
              <Sparkles size={14} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
              <Star size={12} className="absolute -bottom-1 -left-1 text-yellow-400 animate-ping" />
            </div>
          </div>

          <div
            className={`mb-6 transform transition-all duration-700 delay-500 ${
              animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-3">🎉 Congratulations!</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-5">
              Outstanding! You're officially a Perfecting Life Transactions: A Digital Builder's Blueprint expert!
            </p>
            <div className="bg-[#1839AD] text-white rounded-2xl p-4 mb-4 shadow-sm">
              <div className="text-3xl font-bold mb-1">{score}%</div>
              <div className="text-sm opacity-90">Final Score</div>
            </div>
          </div>

          <div
            className={`space-y-3 transform transition-all duration-700 delay-700 ${
              animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <Share2 size={20} />
              Share Your Achievement
            </button>

            <button
              onClick={onClose}
              className="w-full bg-[#1839AD] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#132b7c] transition-colors flex items-center justify-center gap-2"
            >
              Continue Learning
              <ArrowRight size={20} />
            </button>
          </div>

          <div
            className={`mt-5 pt-5 border-t border-gray-100 transform transition-all duration-700 delay-900 ${
              animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <p className="text-sm text-gray-500 italic">"Every expert was once a beginner. Keep up the amazing work!"</p>
            <div className="mt-3 text-xs text-gray-400">
              Ready for the next challenge? Check out more courses to continue your journey!
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1839AD] via-[#2E469E] to-[#4A5FC7]" />
      </div>
    </div>
  );
};

export default AchievementModal;
