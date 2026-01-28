/**
 * AI Widget Standalone Component (Dev D - Feature D3)
 *
 * Self-contained rule-based chat widget for DTMA
 * Can be dropped into any page without additional setup
 *
 * @see docs/DTMA_Jan29_DevD_Feature_Specs.md
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ExternalLink, HelpCircle, Minus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  matchIntent,
  getFallbackResponse,
  getIntentById,
  quickActions,
  IntentResponse,
} from "../utils/intentRegistry";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  intent?: IntentResponse;
}

interface AIWidgetStandaloneProps {
  className?: string;
  showOnPages?: string[]; // Pages where widget should be visible
}

export const AIWidgetStandalone: React.FC<AIWidgetStandaloneProps> = ({
  className = "",
  showOnPages = [], // Empty array means show on all pages
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if widget should be visible on current page
  const currentPath = location.pathname;
  const shouldShow =
    showOnPages.length === 0 ||
    showOnPages.some((page) => currentPath.includes(page));

  // Determine positioning class based on route
  // Portal pages have a bottom nav on mobile (~70px height + padding)
  const isPortalPage = currentPath.includes("/portal");
  const defaultPosition = isPortalPage
    ? "bottom-[90px] right-4" // Higher on portal mobile to clear nav
    : "bottom-4 right-4"; // Default position

  // Use passed className if provided, otherwise use calculated default
  // Just appending calculated class might not work if className has conflicting values
  // detailed strategy: use style for bottom if portal, OR rely on this string. 
  // Let's use the string + className but make sure to include defaultPosition.
  const finalClassName = className ? `${defaultPosition} ${className}` : defaultPosition;


  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "bot",
        content: `Hi! I'm your DTMA assistant. I can help you find courses, explain how to use the platform, or answer questions about digital transformation learning. What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const handleSendMessage = async (content: string, intentId?: string) => {
    if (!content.trim() && !intentId) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: content || `Quick action: ${intentId}`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate processing delay for better UX (but keep under 300ms as per spec)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Match intent
    let matchedIntent: IntentResponse | null = null;

    if (intentId) {
      matchedIntent = getIntentById(intentId);
    } else {
      matchedIntent = matchIntent(content);
    }

    let botResponse: string;
    let responseIntent: IntentResponse | undefined;

    if (matchedIntent) {
      botResponse = matchedIntent.response;
      responseIntent = matchedIntent;

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

    const botMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      type: "bot",
      content: botResponse,
      timestamp: new Date(),
      intent: responseIntent,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, botMessage]);

    // Analytics tracking (console log for MVP)
    console.log("AI Widget Analytics:", {
      userInput: content.substring(0, 50), // Truncate for privacy
      intentMatched: !!matchedIntent,
      intentId: matchedIntent?.id,
      timestamp: new Date().toISOString(),
    });
  };

  const executeAction = (action: IntentResponse["action"]) => {
    if (!action) return;

    switch (action.type) {
      case "navigate":
        if (action.target) {
          navigate(action.target);
          // Close widget after navigation for better UX
          setTimeout(() => setIsOpen(false), 500);
        }
        break;
      case "scroll":
        if (action.target) {
          const element = document.querySelector(action.target);
          element?.scrollIntoView({ behavior: "smooth" });
        }
        break;
      case "modal":
        // Future: Open modal with action.data
        console.log("Modal action:", action.data);
        break;
      default:
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find((a) => a.id === actionId);
    if (action) {
      handleSendMessage("", action.intent);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Don't render if not supposed to show on this page
  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${finalClassName}`}>
      {/* Chat Widget */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">DTMA Assistant</h3>
                <p className="text-blue-100 text-xs">
                  Always here to help • Beta
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleWidget}
                className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                aria-label="Minimize chat"
                title="Minimize chat"
              >
                <Minus size={20} />
              </button>
              <button
                onClick={toggleWidget}
                className="text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                aria-label="Close chat"
                title="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100"
                    }`}
                >
                  <p className="text-sm whitespace-pre-line">
                    {message.content}
                  </p>
                  {message.intent?.action && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <ExternalLink size={12} />
                        Taking you there...
                      </p>
                    </div>
                  )}
                  <p
                    className={`text-xs mt-1 ${message.type === "user"
                        ? "text-blue-100"
                        : "text-gray-400"
                      }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 mb-3">Quick actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about DTMA..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Support Link */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href="mailto:support@dtma.academy"
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                <HelpCircle size={12} />
                Need human support? Contact us
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Chat Bubble */}
      <button
        onClick={toggleWidget}
        className={`w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${isOpen ? "rotate-0" : "hover:scale-110"
          }`}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        {isOpen ? (
          <X size={24} className="transition-transform duration-200" />
        ) : (
          <MessageCircle
            size={24}
            className="transition-transform duration-200 group-hover:scale-110"
          />
        )}
      </button>

      {/* Notification Badge (when closed and has unread) */}
      {!isOpen && messages.length > 1 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          !
        </div>
      )}
    </div>
  );
};

export default AIWidgetStandalone;
