import React, { useState, useEffect } from "react";
import {
  Trophy,
  Star,
  Medal,
  X,
  Share2,
  ArrowRight,
  Sparkles,
  Award,
} from "lucide-react";

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
  userName = "Champion"
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Determine badge based on score
  const getBadgeInfo = () => {
    if (score >= 90) {
      return {
        icon: Trophy,
        name: "Master",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        message: `🎉 Outstanding! You've earned the Master Badge with ${score}%! You're officially a ${courseName} expert!`
      };
    } else if (score >= 80) {
      return {
        icon: Medal,
        name: "Expert",
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        message: `🌟 Excellent work! You've unlocked the Expert Badge with ${score}%! You've truly mastered this course!`
      };
    } else {
      return {
        icon: Award,
        name: "Achiever",
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        message: `🎊 Well done! You've earned the Achiever Badge with ${score}%! You've successfully completed the course!`
      };
    }
  };

  const badgeInfo = getBadgeInfo();
  const BadgeIcon = badgeInfo.icon;

  // Animation sequence
  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      
      // Animation phases
      const timer1 = setTimeout(() => setAnimationPhase(1), 300);
      const timer2 = setTimeout(() => setAnimationPhase(2), 800);
      const timer3 = setTimeout(() => setAnimationPhase(3), 1300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  const handleShare = () => {
    const shareText = `🎉 I just completed "${courseName}" and earned the ${badgeInfo.name} Badge with ${score}%! 🏆 #LearningAchievement #DigitalBuilder`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Course Achievement',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Achievement copied to clipboard! Share it with your network!');
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className={`w-2 h-2 rounded-full ${
                ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]
              }`} />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <div className={`bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden transform transition-all duration-500 ${
        animationPhase >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#1839AD] via-[#2E469E] to-[#4A5FC7] opacity-10" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="relative p-8 text-center">
          {/* Badge Icon with Animation */}
          <div className={`mb-6 transform transition-all duration-700 delay-300 ${
            animationPhase >= 2 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${badgeInfo.bgColor} ${badgeInfo.borderColor} border-4 mb-4 relative`}>
              <BadgeIcon size={48} className={badgeInfo.color} />
              
              {/* Sparkle effects */}
              <Sparkles size={16} className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
              <Star size={12} className="absolute -bottom-1 -left-1 text-yellow-400 animate-ping" />
            </div>
            
            <div className={`inline-block px-4 py-2 rounded-full ${badgeInfo.bgColor} ${badgeInfo.borderColor} border-2`}>
              <span className={`font-bold text-lg ${badgeInfo.color}`}>
                {badgeInfo.name} Badge
              </span>
            </div>
          </div>

          {/* Congratulatory Message */}
          <div className={`mb-8 transform transition-all duration-700 delay-500 ${
            animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎉 Congratulations, {userName}!
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {badgeInfo.message}
            </p>

            {/* Score Display */}
            <div className="bg-gradient-to-r from-[#1839AD] to-[#2E469E] text-white rounded-2xl p-4 mb-6">
              <div className="text-3xl font-bold mb-1">{score}%</div>
              <div className="text-sm opacity-90">Final Score</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`space-y-3 transform transition-all duration-700 delay-700 ${
            animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
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

          {/* Motivational Footer */}
          <div className={`mt-6 pt-6 border-t border-gray-100 transform transition-all duration-700 delay-900 ${
            animationPhase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <p className="text-sm text-gray-500 italic">
              "Every expert was once a beginner. Keep up the amazing work! 🚀"
            </p>
            
            <div className="mt-4 text-xs text-gray-400">
              Ready for the next challenge? Check out more courses to continue your journey!
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1839AD] via-[#2E469E] to-[#4A5FC7]" />
      </div>
    </div>
  );
};

export default AchievementModal;