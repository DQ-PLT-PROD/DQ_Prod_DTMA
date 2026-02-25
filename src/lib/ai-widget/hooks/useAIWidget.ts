/**
 * AI Widget Hook (Dev D - Feature D3)
 *
 * Custom hook for managing AI Widget state and interactions
 * Provides centralized state management and analytics tracking
 */

import { useState, useCallback, useRef } from "react";
import { matchIntent, IntentResponse } from "../utils/intentRegistry";

interface UseAIWidgetOptions {
  autoOpen?: boolean;
  trackAnalytics?: boolean;
}

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  intent?: IntentResponse;
}

export function useAIWidget(options: UseAIWidgetOptions = {}) {
  const { autoOpen = false, trackAnalytics = true } = options;

  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const sessionId = useRef(`session-${Date.now()}`);

  // Analytics tracking
  const trackEvent = useCallback(
    (event: string, data?: any) => {
      if (!trackAnalytics) return;

      // In a real implementation, this would send to analytics service
      console.log("AI Widget Analytics:", {
        event,
        sessionId: sessionId.current,
        timestamp: new Date().toISOString(),
        data,
      });
    },
    [trackAnalytics]
  );

  const openWidget = useCallback(() => {
    setIsOpen(true);
    trackEvent("widget_opened");
  }, [trackEvent]);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    trackEvent("widget_closed", {
      messageCount: messages.length,
      sessionDuration: Date.now() - parseInt(sessionId.current.split("-")[1]),
    });
  }, [trackEvent, messages.length]);

  const toggleWidget = useCallback(() => {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }, [isOpen, openWidget, closeWidget]);

  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: `${message.type}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);

      // Track message
      trackEvent("message_sent", {
        type: message.type,
        hasIntent: !!message.intent,
        intentId: message.intent?.id,
        contentLength: message.content.length,
      });

      return newMessage;
    },
    [trackEvent]
  );

  const processUserInput = useCallback(
    async (input: string): Promise<IntentResponse | null> => {
      if (!input.trim()) return null;

      // Add user message
      addMessage({
        type: "user",
        content: input,
      });

      setIsTyping(true);

      // Simulate processing delay (keep under 300ms as per spec)
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Match intent
      const matchedIntent = matchIntent(input);

      // Track intent matching
      trackEvent("intent_processed", {
        input: input.substring(0, 50), // Truncate for privacy
        matched: !!matchedIntent,
        intentId: matchedIntent?.id,
        category: matchedIntent?.category,
      });

      setIsTyping(false);

      return matchedIntent;
    },
    [addMessage, trackEvent]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    trackEvent("messages_cleared");
  }, [trackEvent]);

  const getUnreadCount = useCallback(() => {
    if (isOpen) return 0;
    return messages.filter((m) => m.type === "bot").length;
  }, [isOpen, messages]);

  return {
    // State
    isOpen,
    messages,
    isTyping,
    sessionId: sessionId.current,

    // Actions
    openWidget,
    closeWidget,
    toggleWidget,
    addMessage,
    processUserInput,
    clearMessages,

    // Computed
    unreadCount: getUnreadCount(),
    hasMessages: messages.length > 0,

    // Internal state setters (for component use)
    setIsTyping,
    setMessages,
  };
}

export type AIWidgetHook = ReturnType<typeof useAIWidget>;
