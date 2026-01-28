/**
 * AI Widget Container (Dev D - Feature D3)
 *
 * Container component that manages AI Widget state and provides
 * integration with the DTMA application
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AIWidget } from "./AIWidget";
import { useAIWidget } from "../hooks/useAIWidget";
import { getIntentById, getFallbackResponse } from "../utils/intentRegistry";

interface AIWidgetContainerProps {
  className?: string;
  autoOpen?: boolean;
  showOnPages?: string[]; // Pages where widget should be visible
}

export const AIWidgetContainer: React.FC<AIWidgetContainerProps> = ({
  className = "",
  autoOpen = false,
  showOnPages = [], // Empty array means show on all pages
}) => {
  const navigate = useNavigate();
  const aiWidget = useAIWidget({ autoOpen, trackAnalytics: true });

  // Initialize with welcome message
  useEffect(() => {
    if (aiWidget.messages.length === 0) {
      aiWidget.addMessage({
        type: "bot",
        content: `Hi! I'm your DTMA assistant. I can help you find courses, explain how to use the platform, or answer questions about digital transformation learning. What would you like to know?`,
      });
    }
  }, [aiWidget.messages.length, aiWidget.addMessage]);

  // Handle page visibility
  const location = useLocation();
  const currentPath = location.pathname; // use location hook for reactivity
  const shouldShow =
    showOnPages.length === 0 ||
    showOnPages.some((page) => currentPath.includes(page));

  // Determine positioning class based on route
  // Portal pages have a bottom nav on mobile (~70px height + padding)
  const isPortalPage = currentPath.includes("/portal");
  const positionClass = isPortalPage
    ? "bottom-[90px] right-4" // Higher on portal mobile to clear nav
    : "bottom-4 right-4"; // Default position

  if (!shouldShow) {
    return null;
  }

  const handleSendMessage = async (content: string, intentId?: string) => {
    if (!content.trim() && !intentId) return;

    let matchedIntent = null;

    if (intentId) {
      // Handle quick action
      matchedIntent = getIntentById(intentId);

      aiWidget.addMessage({
        type: "user",
        content: `Quick action: ${matchedIntent?.response.split(".")[0] || intentId
          }`,
      });
    } else {
      // Process user input
      matchedIntent = await aiWidget.processUserInput(content);
    }

    // Generate bot response
    let botResponse: string;

    if (matchedIntent) {
      botResponse = matchedIntent.response;

      // Execute action if present
      if (matchedIntent.action) {
        setTimeout(() => {
          executeAction(matchedIntent.action!);
        }, 1000); // Give user time to read response
      }
    } else {
      // Fallback response with suggestions
      botResponse = `${getFallbackResponse()}\n\n• Browse our course catalog\n• Learn about DTMA\n• Get help with enrollment\n• Track your progress`;
    }

    // Add bot response
    aiWidget.addMessage({
      type: "bot",
      content: botResponse,
      intent: matchedIntent || undefined,
    });
  };

  const executeAction = (action: any) => {
    if (!action) return;

    switch (action.type) {
      case "navigate":
        if (action.target) {
          navigate(action.target);
          // Close widget after navigation for better UX
          setTimeout(() => aiWidget.closeWidget(), 500);
        }
        break;
      case "scroll":
        if (action.target) {
          const element = document.querySelector(action.target);
          element?.scrollIntoView({ behavior: "smooth" });
        }
        break;
      default:
        break;
    }
  };

  return (
    <AIWidget
      className={`${className} ${positionClass}`}
      isOpen={aiWidget.isOpen}
      messages={aiWidget.messages}
      isTyping={aiWidget.isTyping}
      unreadCount={aiWidget.unreadCount}
      onToggle={aiWidget.toggleWidget}
      onSendMessage={handleSendMessage}
    />
  );
};

export default AIWidgetContainer;
