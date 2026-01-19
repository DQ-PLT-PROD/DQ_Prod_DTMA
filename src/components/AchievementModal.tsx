import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, X, Share2, ArrowRight, Sparkles, Star } from "lucide-react";
import { Dialog } from "./ui/Dialog";

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

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
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
                className={`w-2 h-2 rounded-full ${["bg-yellow-400", "bg-blue-400", "bg-green-400", "bg-red-400", "bg-purple-400"][Math.floor(Math.random() * 5)]
                  }`}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isOpen}
        onClose={onClose}
        headline="Congratulations!"
        icon={null} // We render custom icon in children for animation
      >
        <div className="flex flex-col items-center text-center">
          {/* Animated Icon */}
          <div
            className={`mb-4 transform transition-all duration-700 delay-300 ${animationPhase >= 2 ? "scale-100 rotate-0" : "scale-0 rotate-180"
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
            className={`flex flex-col items-center w-full transform transition-all duration-700 delay-500 ${animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
          >
            <p className="text-on-surface-variant text-body-lg leading-relaxed mb-6">
              Outstanding! You're officially a <strong className="text-primary">{courseName}</strong> expert!
            </p>

            <div className="bg-primary-container text-on-primary-container rounded-xl p-4 mb-6 shadow-sm w-full max-w-[200px]">
              <div className="text-display-sm font-bold mb-1">{score}%</div>
              <div className="text-label-md opacity-80">Final Score</div>
            </div>
          </div>

          <div
            className={`w-full space-y-3 transform transition-all duration-700 delay-700 ${animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
          >
            <button
              onClick={handleShare}
              className="w-full bg-surface-container-highest border border-outline text-primary py-2.5 px-6 rounded-full font-medium hover:bg-surface-variant transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Share2 size={18} />
              Share Achievement
            </button>

            <button
              onClick={onClose}
              className="w-full bg-primary text-on-primary py-2.5 px-6 rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-elevation-1"
            >
              Continue Learning
              <ArrowRight size={18} />
            </button>
          </div>

          <div
            className={`mt-6 pt-4 border-t border-outline-variant w-full transform transition-all duration-700 delay-900 ${animationPhase >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
          >
            <p className="text-body-sm text-on-surface-variant italic">"Every expert was once a beginner. Keep up the amazing work!"</p>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AchievementModal;
