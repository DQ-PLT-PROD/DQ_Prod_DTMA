import React, { useEffect, useState } from 'react';
import { Send, ChevronDown, ArrowRight, Layers } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { AnimatedText, FadeInUpOnScroll, StaggeredFadeIn } from '../../components/AnimationUtils';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '@/lib/auth';
import { PageContainer } from '../../components/layouts/PageContainer';
import { BRAND_BACKDROP_BLUR, BRAND_GRADIENT, BRAND_PRIMARY } from '../../constants/branding';

interface HeroSectionProps {
  'data-id'?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  'data-id': dataId
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle sign in / hero action
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('courseProgress');
      setHasStarted(!!savedProgress);
    }
  }, []);

  const handleHeroAction = () => {
    if (user) {
      navigate('/portal');
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
      if (typeof window !== 'undefined' &&
        window.voiceflow?.chat &&
        typeof window.voiceflow.chat.interact === 'function') {

        console.log('Sending prompt to Voiceflow:', prompt);

        // Send the user's prompt as a text message to Voiceflow
        window.voiceflow.chat.interact({
          type: 'text',
          payload: prompt
        });

        // Open the chatbot widget after sending the message
        setTimeout(() => {
          // Try different methods to open the chat widget with proper type checking
          if (window.voiceflow?.chat) {
            if (typeof window.voiceflow.chat.open === 'function') {
              window.voiceflow.chat.open();
            } else if (typeof window.voiceflow.chat.show === 'function') {
              window.voiceflow.chat.show();
            } else {
              // Fallback: try to click the launcher button programmatically
              const launcherButton = document.querySelector('.vfrc-launcher') as HTMLElement;
              if (launcherButton) {
                launcherButton.click();
              }
            }
          }

          setPrompt(''); // Clear the input
          setIsProcessing(false);
        }, 300);

      } else {
        console.error('Voiceflow chat not available. Make sure KfBot component is loaded.');

        // Fallback: Wait a bit and try again
        setTimeout(() => {
          if (window.voiceflow?.chat &&
            typeof window.voiceflow.chat.interact === 'function') {
            window.voiceflow.chat.interact({
              type: 'text',
              payload: prompt
            });

            // Try to open the chatbot widget
            setTimeout(() => {
              if (window.voiceflow?.chat) {
                if (typeof window.voiceflow.chat.open === 'function') {
                  window.voiceflow.chat.open();
                } else if (typeof window.voiceflow.chat.show === 'function') {
                  window.voiceflow.chat.show();
                } else {
                  // Fallback: try to click the launcher button programmatically
                  const launcherButton = document.querySelector('.vfrc-launcher') as HTMLElement;
                  if (launcherButton) {
                    launcherButton.click();
                  }
                }
              }
            }, 300);

            setPrompt('');
          } else {
            alert('Chat service is not ready. Please try again in a moment.');
          }
          setIsProcessing(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message to Voiceflow:', error);
      alert('There was an error connecting to the chat. Please try again.');
      setIsProcessing(false);
    }
  };

  const scrollToMarketplaces = () => {
    const marketplacesSection = document.getElementById('marketplaces-section');
    if (marketplacesSection) {
      marketplacesSection.scrollIntoView({
        behavior: 'smooth'
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
    "How can I earn the Digital Qatalyst badge?"
  ];

  // Handle suggestion pill clicks
  const handleSuggestionClick = async (suggestion: string) => {
    setPrompt(suggestion);
    setIsSearchFocused(true);

    // Auto-submit the suggestion
    setIsProcessing(true);

    try {
      // Check if Voiceflow is loaded and ready with proper type checking
      if (typeof window !== 'undefined' &&
        window.voiceflow?.chat &&
        typeof window.voiceflow.chat.interact === 'function') {

        console.log('Sending suggestion to Voiceflow:', suggestion);

        // Send the suggestion as a text message to Voiceflow
        window.voiceflow.chat.interact({
          type: 'text',
          payload: suggestion
        });

        // Open the chatbot widget after sending the message
        setTimeout(() => {
          // Try different methods to open the chat widget with proper type checking
          if (window.voiceflow?.chat) {
            if (typeof window.voiceflow.chat.open === 'function') {
              window.voiceflow.chat.open();
            } else if (typeof window.voiceflow.chat.show === 'function') {
              window.voiceflow.chat.show();
            } else {
              // Fallback: try to click the launcher button programmatically
              const launcherButton = document.querySelector('.vfrc-launcher') as HTMLElement;
              if (launcherButton) {
                launcherButton.click();
              }
            }
          }

          setPrompt(''); // Clear the input
          setIsProcessing(false);
        }, 300);

      } else {
        console.error('Voiceflow chat not available for suggestion.');
        setIsProcessing(false);
        alert('Chat service is not ready. Please try again in a moment.');
      }
    } catch (error) {
      console.error('Error sending suggestion to Voiceflow:', error);
      setIsProcessing(false);
      alert('There was an error connecting to the chat. Please try again.');
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `${BRAND_GRADIENT}, url('/images/landing/background-image.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        height: '100vh',
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
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px)',
            transform: 'scale(1.05)',
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
          animation: 'pulse-gradient 8s ease-in-out infinite alternate',
        }}
      ></div>
      {/* Deep navy tint to boost readability */}
      <div className="absolute inset-0 pointer-events-none bg-[#030C2B]/40"></div>
      <div className="absolute inset-0 pointer-events-none bg-black/10"></div>

      <PageContainer className="h-full py-16 md:py-24 flex flex-col justify-center items-center gap-8 relative z-10 text-center">
        <FadeInUpOnScroll className="space-y-5 w-full flex flex-col items-center">
          <div className="space-y-5 w-full flex flex-col items-center text-center">
            <h1 className="text-[48px] md:text-[56px] leading-[1.2] font-bold text-white tracking-[-0.5px] max-w-3xl mx-auto">
              Every Skill to Grow and Scale in the Digital Economy
            </h1>
            <p className="text-[18px] leading-[1.5] text-white/80 font-semibold max-w-2xl mx-auto">
              Start your digital transformation journey with easy‑to‑follow lessons that help you understand, improve, and innovate at your own pace.
            </p>
          </div>
        </FadeInUpOnScroll>

        {/* AI Prompt Interface removed as requested */}

        <Button
          variant="primary"
          size="lg"
          onClick={handleHeroAction}
          className="min-w-[200px] text-lg font-semibold py-6"
          rightIcon={<ArrowRight size={20} />}
        >
          {user ? (hasStarted ? "Resume Course" : "Start Course") : "Get Started"}
        </Button>

      </PageContainer>

      {/* Scroll indicator with animation */}
      <div
        className="absolute bottom-8 inset-x-0 flex justify-center animate-bounce cursor-pointer"
        onClick={() => {
          const nextSection = document.querySelector('main > div:nth-child(2)');
          nextSection?.scrollIntoView({
            behavior: 'smooth'
          });
        }}
      >
        <ChevronDown size={24} className="text-white" />
        <span className="sr-only">Scroll down</span>
      </div>

      {/* Add keyframes for gradient animation */}
      <style>{`
        @keyframes pulse-gradient {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div >
  );
};

export default HeroSection;
