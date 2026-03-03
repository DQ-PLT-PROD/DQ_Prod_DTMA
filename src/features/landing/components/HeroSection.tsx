import React, { useEffect, useState } from "react";
import { Send, ArrowRight, Layers } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { PageContainer } from "@/components/layouts/PageContainer";
import {
  BRAND_BACKDROP_BLUR,
  BRAND_GRADIENT,
  BRAND_PRIMARY,
} from "@/constants/branding";

// Augment Window for Voiceflow chat widget
declare global {
  interface Window {
    voiceflow?: {
      chat?: {
        open?: () => void;
        show?: () => void;
        interact?: (payload: any) => void;
        load?: (config: any) => void;
        proactive?: { push?: (...args: any[]) => void };
      };
    };
  }
}

interface HeroSectionProps {
  "data-id"?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ "data-id": dataId }) => {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle sign in / hero action
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProgress = localStorage.getItem("courseProgress");
      setHasStarted(!!savedProgress);
    }
  }, []);

  const handleHeroAction = () => {
    if (user) {
      navigate("/portal");
    } else {
      login(); // Direct Microsoft auth
    }
  };

  const scrollToCategories = () => {
    const targetHash = "#d6-categories";
    if (location.pathname !== "/") {
      navigate({ pathname: "/", hash: targetHash });
      return;
    }
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    const el = document.getElementById("d6-categories");
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);

    try {
      // Check if Voiceflow is loaded and ready with proper type checking
      if (
        typeof window !== "undefined" &&
        window.voiceflow?.chat &&
        typeof window.voiceflow.chat.interact === "function"
      ) {
        console.log("Sending prompt to Voiceflow:", prompt);

        // Send the user's prompt as a text message to Voiceflow
        window.voiceflow.chat.interact({
          type: "text",
          payload: prompt,
        });

        // Open the chatbot widget after sending the message
        setTimeout(() => {
          // Try different methods to open the chat widget with proper type checking
          if (window.voiceflow?.chat) {
            if (typeof window.voiceflow.chat.open === "function") {
              window.voiceflow.chat.open();
            } else if (typeof window.voiceflow.chat.show === "function") {
              window.voiceflow.chat.show();
            } else {
              // Fallback: try to click the launcher button programmatically
              const launcherButton = document.querySelector(
                ".vfrc-launcher",
              ) as HTMLElement;
              if (launcherButton) {
                launcherButton.click();
              }
            }
          }

          setPrompt(""); // Clear the input
          setIsProcessing(false);
        }, 300);
      } else {
        console.error(
          "Voiceflow chat not available. Make sure KfBot component is loaded.",
        );

        // Fallback: Wait a bit and try again
        setTimeout(() => {
          if (
            window.voiceflow?.chat &&
            typeof window.voiceflow.chat.interact === "function"
          ) {
            window.voiceflow.chat.interact({
              type: "text",
              payload: prompt,
            });

            // Try to open the chatbot widget
            setTimeout(() => {
              if (window.voiceflow?.chat) {
                if (typeof window.voiceflow.chat.open === "function") {
                  window.voiceflow.chat.open();
                } else if (typeof window.voiceflow.chat.show === "function") {
                  window.voiceflow.chat.show();
                } else {
                  // Fallback: try to click the launcher button programmatically
                  const launcherButton = document.querySelector(
                    ".vfrc-launcher",
                  ) as HTMLElement;
                  if (launcherButton) {
                    launcherButton.click();
                  }
                }
              }
            }, 300);

            setPrompt("");
          } else {
            alert("Chat service is not ready. Please try again in a moment.");
          }
          setIsProcessing(false);
        }, 1000);
      }
    } catch (error) {
      console.error("Error sending message to Voiceflow:", error);
      alert("There was an error connecting to the chat. Please try again.");
      setIsProcessing(false);
    }
  };

  const scrollToMarketplaces = () => {
    const marketplacesSection = document.getElementById("marketplaces-section");
    if (marketplacesSection) {
      marketplacesSection.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  // Show suggestion pills with delay after focus
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearchFocused) {
      timer = setTimeout(() => {
        setShowSuggestions(true);
      }, 500);
    } else {
      setShowSuggestions(false);
    }
    return () => clearTimeout(timer);
  }, [isSearchFocused]);

  const suggestionPills = [
    "What skills do leaders need in the AI working era?",
    "How do I apply the 6XD Framework?",
    "Which DTMA courses help me redesign workflows?",
    "How can I earn the Digital Qatalyst badge?",
  ];

  // Handle suggestion pill clicks
  const handleSuggestionClick = async (suggestion: string) => {
    setPrompt(suggestion);
    setIsSearchFocused(true);

    // Auto-submit the suggestion
    setIsProcessing(true);

    try {
      // Check if Voiceflow is loaded and ready with proper type checking
      if (
        typeof window !== "undefined" &&
        window.voiceflow?.chat &&
        typeof window.voiceflow.chat.interact === "function"
      ) {
        console.log("Sending suggestion to Voiceflow:", suggestion);

        // Send the suggestion as a text message to Voiceflow
        window.voiceflow.chat.interact({
          type: "text",
          payload: suggestion,
        });

        // Open the chatbot widget after sending the message
        setTimeout(() => {
          // Try different methods to open the chat widget with proper type checking
          if (window.voiceflow?.chat) {
            if (typeof window.voiceflow.chat.open === "function") {
              window.voiceflow.chat.open();
            } else if (typeof window.voiceflow.chat.show === "function") {
              window.voiceflow.chat.show();
            } else {
              // Fallback: try to click the launcher button programmatically
              const launcherButton = document.querySelector(
                ".vfrc-launcher",
              ) as HTMLElement;
              if (launcherButton) {
                launcherButton.click();
              }
            }
          }

          setPrompt(""); // Clear the input
          setIsProcessing(false);
        }, 300);
      } else {
        console.error("Voiceflow chat not available for suggestion.");
        setIsProcessing(false);
        alert("Chat service is not ready. Please try again in a moment.");
      }
    } catch (error) {
      console.error("Error sending suggestion to Voiceflow:", error);
      setIsProcessing(false);
      alert("There was an error connecting to the chat. Please try again.");
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(10, 22, 40, 1) 0%, rgba(30, 58, 138, 1) 50%, rgba(10, 22, 40, 1) 100%)",
        height: "100vh",
      }}
      data-id={dataId}
    >
      {/* Network connection lines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="network"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="50" cy="50" r="2" fill="rgba(59, 130, 246, 0.6)" />
              <line
                x1="50"
                y1="50"
                x2="100"
                y2="0"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1"
              />
              <line
                x1="50"
                y1="50"
                x2="100"
                y2="100"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network)" />
        </svg>
      </div>

      {/* Animated gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(96, 165, 250, 0.12) 0%, transparent 50%)",
          animation: "pulse 10s ease-in-out infinite",
        }}
      ></div>

      {/* Digital particles - representing data points */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top left cluster */}
        <div
          className="absolute w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-float-slow"
          style={{ top: "15%", left: "8%" }}
        ></div>
        <div
          className="absolute w-2 h-2 bg-cyan-400/40 rounded-full animate-float-medium"
          style={{ top: "18%", left: "12%" }}
        ></div>

        {/* Top right cluster */}
        <div
          className="absolute w-2 h-2 bg-blue-300/50 rounded-full animate-float-fast"
          style={{ top: "20%", right: "15%" }}
        ></div>
        <div
          className="absolute w-1.5 h-1.5 bg-indigo-400/45 rounded-full animate-float-slow"
          style={{ top: "25%", right: "10%" }}
        ></div>

        {/* Middle scattered */}
        <div
          className="absolute w-2 h-2 bg-cyan-300/45 rounded-full animate-float-medium"
          style={{ top: "45%", left: "20%" }}
        ></div>
        <div
          className="absolute w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-float-fast"
          style={{ top: "50%", right: "25%" }}
        ></div>

        {/* Bottom clusters */}
        <div
          className="absolute w-2 h-2 bg-indigo-300/40 rounded-full animate-float-slow"
          style={{ bottom: "20%", left: "15%" }}
        ></div>
        <div
          className="absolute w-1.5 h-1.5 bg-blue-300/50 rounded-full animate-float-medium"
          style={{ bottom: "25%", right: "18%" }}
        ></div>
      </div>

      {/* Subtle tech grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      ></div>

      {/* Glowing accent orbs for professional depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl"
          style={{ top: "-10%", right: "10%" }}
        ></div>
        <div
          className="absolute w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-3xl"
          style={{ bottom: "-5%", left: "5%" }}
        ></div>
      </div>

      <PageContainer className="h-full py-16 md:py-24 flex flex-col justify-center items-center gap-8 relative z-10 text-center">
        <div className="space-y-6 w-full flex flex-col items-center text-center">
          {/* Main Headline */}
          <h1 className="text-[52px] md:text-[64px] lg:text-[72px] leading-[1.1] font-bold text-white tracking-[-1px] max-w-5xl mx-auto">
            Lead the Future of Digital Transformation
          </h1>

          {/* Sub-Headline */}
          <p className="text-[18px] md:text-[20px] leading-[1.6] text-white/90 font-medium max-w-3xl mx-auto px-4">
            Join the Digital Transformation Management Academy to master the
            skills required to drive change and lead innovation in the digital
            era.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4">
          {/* Primary CTA - Get Started */}
          <button
            onClick={handleHeroAction}
            className="px-10 py-4 text-white font-semibold text-lg bg-blue-600 rounded-full shadow-lg transform transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-2xl text-center flex items-center justify-center overflow-hidden group tracking-wide min-w-[200px]"
          >
            <span className="relative z-10 flex items-center gap-2">
              {user
                ? hasStarted
                  ? "Resume Course"
                  : "Start Course"
                : "Get Started"}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </span>
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 bg-white/20 transform scale-0 opacity-0 group-hover:scale-[2.5] group-hover:opacity-100 rounded-full transition-all duration-700 origin-center"></span>
            </span>
          </button>

          {/* Secondary CTA - Explore Courses */}
          <button
            onClick={scrollToCategories}
            className="px-10 py-4 text-white font-semibold text-lg bg-gray-700/80 backdrop-blur-sm rounded-full shadow-lg transform transition-all duration-300 hover:bg-gray-600 hover:-translate-y-1 hover:shadow-2xl text-center flex items-center justify-center overflow-hidden group tracking-wide min-w-[200px] border border-white/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Our Courses
              <Layers
                size={20}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </span>
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 bg-white/10 transform scale-0 opacity-0 group-hover:scale-[2.5] group-hover:opacity-100 rounded-full transition-all duration-700 origin-center"></span>
            </span>
          </button>
        </div>
      </PageContainer>
    </div>
  );
};

export default HeroSection;
