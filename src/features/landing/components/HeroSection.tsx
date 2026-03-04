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
        backgroundImage: `${BRAND_GRADIENT}, url('/images/landing/background-image.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        height: "100vh",
        backdropFilter: BRAND_BACKDROP_BLUR,
        WebkitBackdropFilter: BRAND_BACKDROP_BLUR,
      }}
      data-id={dataId}
    >
      {/* Blurred background image to soften details */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 scale-105 blur-sm"
          style={{
            backgroundImage: "url('/images/landing/background-image.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(3px)",
            transform: "scale(1.05)",
          }}
        ></div>
      </div>
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: BRAND_GRADIENT,
          opacity: 0.25,
          backdropFilter: BRAND_BACKDROP_BLUR,
          WebkitBackdropFilter: BRAND_BACKDROP_BLUR,
        }}
      ></div>
      {/* Deep navy tint to boost readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#030C2B",
          opacity: 0.4,
        }}
      ></div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#000000",
          opacity: 0.1,
        }}
      ></div>

      <PageContainer className="h-full py-16 md:py-24 flex flex-col justify-center items-center gap-8 relative z-10 text-center">
        <div className="space-y-5 w-full flex flex-col items-center text-center">
          <h1 className="text-[48px] md:text-[56px] leading-[1.2] font-bold text-white tracking-[-0.5px] max-w-3xl mx-auto">
            Master the Skills to Thrive in the Digital Era
          </h1>
          <p className="text-[18px] leading-[1.5] text-white/80 font-semibold max-w-2xl mx-auto">
            Acquire the skills and competencies needed to excel in the evolving
            digital landscape and drive successful transformation.
          </p>
        </div>

        {/* AI Prompt Interface removed as requested */}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleHeroAction}
            className="px-10 py-4 text-white font-semibold text-lg bg-primary rounded-full shadow-lg transform transition-all duration-300 hover:bg-primary-dark hover:-translate-y-1 hover:shadow-xl text-center flex items-center justify-center overflow-hidden group tracking-wide min-w-[260px]"
          >
            <span className="relative z-10">
              {user
                ? hasStarted
                  ? "Resume Course"
                  : "Start Course"
                : "Get Started"}
            </span>
            <span className="absolute inset-0 overflow-hidden rounded-lg">
              <span className="absolute inset-0 bg-white/20 transform scale-0 opacity-0 group-hover:scale-[2.5] group-hover:opacity-100 rounded-full transition-all duration-700 origin-center"></span>
            </span>
          </button>

          <button
            onClick={scrollToCategories}
            className="px-10 py-4 text-white font-semibold text-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-full shadow-lg transform transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 hover:shadow-xl text-center flex items-center justify-center overflow-hidden group tracking-wide min-w-[260px]"
          >
            <span className="relative z-10">Explore Courses</span>
            <span className="absolute inset-0 overflow-hidden rounded-lg">
              <span className="absolute inset-0 bg-white/20 transform scale-0 opacity-0 group-hover:scale-[2.5] group-hover:opacity-100 rounded-full transition-all duration-700 origin-center"></span>
            </span>
          </button>
        </div>
      </PageContainer>
    </div>
  );
};

export default HeroSection;
