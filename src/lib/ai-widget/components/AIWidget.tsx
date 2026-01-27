/**
 * AI Widget Component (Dev D - Feature D3)
 *
 * Rule-based, informational-only chat widget for DTMA
 * Provides instant responses to common questions and deep-links to relevant pages
 *
 * @see docs/DTMA_Jan29_DevD_Feature_Specs.md
 */

import React, { useRef, useEffect, useState } from "react";
import { MessageCircle, X, Send, ExternalLink, HelpCircle } from "lucide-react";
import { quickActions } from "../utils/intentRegistry";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  intent?: any;
}

interface AIWidgetProps {
  className?: string;
  isOpen?: boolean;
  messages?: ChatMessage[];
  isTyping?: boolean;
  unreadCount?: number;
  onToggle?: () => void;
  onSendMessage?: (content: string, intentId?: string) => void;
}

export const AIWidget: React.FC<AIWidgetProps> = ({
  className = "",
  isOpen = false,
  messages = [],
  isTyping = false,
  unreadCount = 0,
  onToggle,
  onSendMessage,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    onSendMessage?.(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find((a) => a.id === actionId);
    if (action) {
      onSendMessage?.("", action.intent);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
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
                <p className="text-blue-100 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.type === "user"
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
                    className={`text-xs mt-1 ${
                      message.type === "user"
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
                onClick={handleSendMessage}
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
        onClick={onToggle}
        className={`w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? "rotate-0" : "hover:scale-110"
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
      {!isOpen && unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </div>
      )}
    </div>
  );
};

export default AIWidget;
