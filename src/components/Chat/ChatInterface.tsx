import React, { useEffect, useState, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import {
  Message,
  MessageStatus,
  FileAttachment,
  ConnectionStatus,
  ReplyingTo,
} from "./types";
import { chatService } from "./ChatService";
import {
  MoreVerticalIcon,
  SearchIcon,
  XIcon,
  FlagIcon,
  VolumeXIcon,
  TrashIcon,
  WifiIcon,
  WifiOffIcon,
  AlertCircleIcon,
  LoaderIcon,
  BellOffIcon,
  CloudOffIcon,
  UndoIcon,
  MessageCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { ReportModal } from "../ReportModal";
import { BurgerMenuButton } from '../Sidebar';
export function ChatInterface(
  {
    setIsOpen,
    isLoggedIn,
  }: {
    setIsOpen: (isOpen: boolean) => void;
    isLoggedIn: boolean;
  }
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.IDLE
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [customReportReason, setCustomReportReason] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [deletedMessage, setDeletedMessage] = useState<{
    message: Message;
    deleteForEveryone: boolean;
    timeoutId: NodeJS.Timeout | null;
  } | null>(null);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  // User role - could be fetched from a user context or props in a real app
  const [userRole, setUserRole] = useState("user"); // 'user' or 'admin'
  // Automatic responses setting
  const [automaticResponsesEnabled, setAutomaticResponsesEnabled] =
    useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);
  const customReportModalRef = useRef<HTMLDivElement>(null);
  // For demo purposes, we'll use an empty state initially
  const [showEmptyState, setShowEmptyState] = useState(true);
  // Initialize messages from service and subscribe to updates
  useEffect(() => {
    // Get initial messages
    const initialMessages = chatService.getMessages();
    setMessages(initialMessages);
    // For demo purposes, show empty state if configured
    if (initialMessages.length === 0) {
      setShowEmptyState(true);
    } else {
      setShowEmptyState(false);
    }

    // Initialize automatic responses setting
    setAutomaticResponsesEnabled(chatService.getAutomaticResponsesEnabled());
    // Subscribe to message updates
    const unsubscribeMessages = chatService.subscribeToMessages(
      (updatedMessages) => {
        setMessages(updatedMessages);
        if (updatedMessages.length > 0) {
          setShowEmptyState(false);
        }
      }
    );
    // Subscribe to typing status updates
    const unsubscribeTyping = chatService.subscribeToTypingStatus(
      (typingStatus) => {
        setIsTyping(typingStatus);
      }
    );
    // Subscribe to connection status updates
    const unsubscribeConnection = chatService.subscribeToConnectionStatus(
      (status) => {
        setConnectionStatus(status);
      }
    );
    // Cleanup subscriptions when component unmounts
    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribeConnection();
      chatService.cleanup();
      // Clear any active deletion timeouts
      if (deletedMessage?.timeoutId) {
        clearTimeout(deletedMessage.timeoutId);
      }
    };
  }, []);
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowConfirmClear(false);
        setShowReportOptions(false);
      }
      if (
        isSearchOpen &&
        searchModalRef.current &&
        !searchModalRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
      if (
        showCustomReportModal &&
        customReportModalRef.current &&
        !customReportModalRef.current.contains(event.target as Node)
      ) {
        setShowCustomReportModal(false);
        setCustomReportReason("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, showCustomReportModal]);
  // Hide copy notification after 2 seconds
  useEffect(() => {
    if (showCopyNotification) {
      const timer = setTimeout(() => {
        setShowCopyNotification(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopyNotification]);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use scrollIntoView on the messages end ref element
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };
  const sendMessage = (
    content: string,
    attachment?: FileAttachment,
    replyToId?: string,
    voiceMessage?: {
      duration: number;
      audioUrl?: string;
    }
  ) => {
    chatService.sendMessage(content, attachment, replyToId, voiceMessage);
    setShowEmptyState(false);
  };
  const startConversation = () => {
    // Instead of sending an automatic message, just show the input area
    setShowEmptyState(false);
    // Focus the input field
    setTimeout(() => {
      const inputField = document.querySelector(
        ".chat-input"
      ) as HTMLInputElement;
      if (inputField) {
        inputField.focus();
      }
    }, 100);
  };
  const retryMessage = (messageId: string) => {
    chatService.retryMessage(messageId);
  };
  const handleReply = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setReplyingTo({
        messageId: message.id,
        content: message.content,
        sender: message.sender,
        name: message.name,
      });
    }
  };
  const cancelReply = () => {
    setReplyingTo(null);
  };
  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = messages.filter((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };
  const handleReconnect = () => {
    chatService.reconnect();
  };
  const toggleMuteNotifications = () => {
    setIsMuted(!isMuted);
    setIsMenuOpen(false);
    // Show confirmation toast
    alert(isMuted ? "Notifications unmuted" : "Notifications muted");
  };
  const handleReport = (reason: string) => {
    // In a real app, this would send the report to the backend
    alert(`Chat reported: ${reason}`);
    setShowReportOptions(false);
    setIsMenuOpen(false);
  };
  const handleReportOptionClick = (reason: string) => {
    if (reason === "Other") {
      setShowCustomReportModal(true);
    } else {
      handleReport(reason);
    }
  };
  const handleSubmitCustomReport = () => {
    if (customReportReason.trim()) {
      handleReport(customReportReason);
      setShowCustomReportModal(false);
      setCustomReportReason("");
    }
  };
  const handleClearChat = () => {
    // In a real app, this would clear the chat from the backend
    if (showConfirmClear) {
      chatService.clearMessages();
      setMessages([]);
      setShowEmptyState(true);
      setShowConfirmClear(false);
      setIsMenuOpen(false);
    } else {
      setShowConfirmClear(true);
    }
  };
  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
    setIsMenuOpen(false);
  };
  const handleDeleteMessage = (
    messageId: string,
    deleteForEveryone: boolean
  ) => {
    // Clear any existing deletion timeout
    if (deletedMessage?.timeoutId) {
      clearTimeout(deletedMessage.timeoutId);
    }
    // Find the message before deleting it
    const messageToDelete = messages.find((msg) => msg.id === messageId);
    if (messageToDelete) {
      // Delete the message
      chatService.deleteMessage(messageId, deleteForEveryone);
      // Set up undo functionality with a 7-second timeout
      const timeoutId = setTimeout(() => {
        setDeletedMessage(null);
      }, 7000);
      // Store the deleted message info for potential undo
      setDeletedMessage({
        message: messageToDelete,
        deleteForEveryone,
        timeoutId,
      });
    }
  };
  const handleUndoDelete = () => {
    if (deletedMessage) {
      // Clear the timeout
      if (deletedMessage.timeoutId) {
        clearTimeout(deletedMessage.timeoutId);
      }
      // Restore the message
      chatService.restoreMessage(deletedMessage.message);
      // Clear the deleted message state
      setDeletedMessage(null);
    }
  };
  const handleEditMessage = (messageId: string, newContent: string) => {
    chatService.editMessage(messageId, newContent);
  };
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setShowCopyNotification(true);
  };
  const getReplyMessage = (messageId?: string) => {
    if (!messageId) return null;
    return messages.find((msg) => msg.id === messageId) || null;
  };
  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTING:
        return (
          <div className="flex items-center text-amber-500">
            <LoaderIcon size={14} className="animate-spin mr-1" />
            <span className="text-xs">Connecting...</span>
          </div>
        );
      case ConnectionStatus.CONNECTED:
        return (
          <div className="flex items-center text-green-500">
            <WifiIcon size={14} className="mr-1" />
            <span className="text-xs">Online</span>
          </div>
        );
      case ConnectionStatus.ERROR:
        return (
          <div
            className="flex items-center text-red-500 cursor-pointer"
            onClick={handleReconnect}
          >
            <WifiOffIcon size={14} className="mr-1" />
            <span className="text-xs">Offline - Tap to reconnect</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <span className="text-xs">Offline</span>
          </div>
        );
    }
  };
  // Determine if the connection is offline (either ERROR or IDLE state)
  const isOffline =
    connectionStatus === ConnectionStatus.ERROR ||
    connectionStatus === ConnectionStatus.IDLE;
  // Empty state UI
  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MessageCircleIcon size={32} className="text-blue-500" />
        </div>
        <h3 className="text-md font-small text-gray-600 mb-2">
          No messages yet
        </h3>
        <button
          onClick={startConversation}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Start Conversation
        </button>
      </div>
    );
  };

  // Toggle between user and admin role for demo purposes
  const toggleRole = () => {
    setUserRole(userRole === "user" ? "admin" : "user");
  };

  // Toggle automatic responses
  const toggleAutomaticResponses = () => {
    const newValue = !automaticResponsesEnabled;
    setAutomaticResponsesEnabled(newValue);
    chatService.setAutomaticResponsesEnabled(newValue);
    setIsMenuOpen(false);
    // Show confirmation
    alert(
      newValue ? "Automatic responses enabled" : "Automatic responses disabled"
    );
  };

  // Manually trigger advisor response
  const triggerManualResponse = () => {
    const lastUserMessage = messages.filter((msg) => msg.sender === "me").pop();
    chatService.triggerAdvisorResponse(lastUserMessage?.id);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-[91vh] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with advisor info - Fixed at the top */}
      <div className=''>

        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className='flex gap-4'>
            <div className='lg:hidden'>
              <BurgerMenuButton
                onClick={() => setIsOpen(true)}
                isLoggedIn={isLoggedIn}
              />
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                  alt="Manor Hassan"
                  className="w-full h-full object-cover"
                />
                {connectionStatus === ConnectionStatus.CONNECTED && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white transform translate-x-1/3 translate-y-1/3 z-10"></div>
                )}
                {connectionStatus === ConnectionStatus.ERROR && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white transform translate-x-1/3 translate-y-1/3 z-10"></div>
                )}
              </div>
              <div>
                <h2 className="text-base font-medium text-gray-800">
                  Manor Hassan
                </h2>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">EJ Advisor</span>
                  {renderConnectionStatus()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {/* For demo purposes only - toggle role button */}
            {/* <button
            className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 hover:bg-gray-200"
            onClick={toggleRole}
          >
            Role: {userRole}
          </button> */}
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={handleSearchClick}
            >
              <SearchIcon size={20} />
            </button>
            <div className="relative">
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={handleMenuClick}
              >
                <MoreVerticalIcon size={20} />
              </button>
              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                >
                  {/* Mute Notifications */}
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={toggleMuteNotifications}
                  >
                    {isMuted ? (
                      <>
                        <BellOffIcon size={16} className="mr-2 text-gray-500" />
                        Unmute Notifications
                      </>
                    ) : (
                      <>
                        <VolumeXIcon size={16} className="mr-2 text-gray-500" />
                        Mute Notifications
                      </>
                    )}
                  </button>

                  {/* Automatic Responses Toggle */}
                  {/* <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={toggleAutomaticResponses}
                >
                  {automaticResponsesEnabled ? (
                    <>
                      <MessageCircleIcon
                        size={16}
                        className="mr-2 text-green-500"
                      />
                      Disable Auto Responses
                    </>
                  ) : (
                    <>
                      <MessageCircleIcon
                        size={16}
                        className="mr-2 text-gray-500"
                      />
                      Enable Auto Responses
                    </>
                  )}
                </button> */}

                  {/* Manual Response Trigger - only show when auto responses are disabled */}
                  {/* {!automaticResponsesEnabled &&
                  messages.some((msg) => msg.sender === "me") && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                      onClick={triggerManualResponse}
                    >
                      <MessageCircleIcon size={16} className="mr-2" />
                      Send Advisor Response
                    </button>
                  )} */}

                  {/* Report option */}
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={handleOpenReportModal}
                  >
                    <FlagIcon size={16} className="mr-2" />
                    Report
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  {/* Clear Chat - only visible for admin role */}
                  {userRole === "admin" &&
                    (!showConfirmClear ? (
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={handleClearChat}
                      >
                        <TrashIcon size={16} className="mr-2" />
                        Clear Chat
                      </button>
                    ) : (
                      <div className="px-4 py-2 text-sm">
                        <p className="text-gray-700 mb-2">
                          Clear this conversation?
                        </p>
                        <div className="flex space-x-2">
                          <button
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            onClick={handleClearChat}
                          >
                            Clear
                          </button>
                          <button
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                            onClick={() => setShowConfirmClear(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Connection error banner */}
      {connectionStatus === ConnectionStatus.ERROR && (
        <div className="bg-red-50 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center text-red-600">
            <AlertCircleIcon size={16} className="mr-2" />
            <span className="text-sm">
              Connection lost. Messages may not be delivered.
            </span>
          </div>
          <button
            className="text-sm font-medium text-red-600 hover:text-red-800"
            onClick={handleReconnect}
          >
            Reconnect
          </button>
        </div>
      )}
      {/* Undo Delete Toast */}
      {deletedMessage && (
        <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between animate-fade-in flex-shrink-0">
          <span className="text-sm">Message deleted</span>
          <button
            onClick={handleUndoDelete}
            className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            <UndoIcon size={16} className="mr-1" />
            Undo
          </button>
        </div>
      )}
      {/* Copy notification toast */}
      {showCopyNotification && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-md shadow-md flex items-center z-50">
          <CheckCircleIcon size={16} className="mr-2" />
          <span>Message copied to clipboard</span>
        </div>
      )}
      {/* Message area - This is the scrollable container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50"
        id="message-container"
      >
        {showEmptyState ? (
          renderEmptyState()
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRetry={() => retryMessage(message.id)}
                onReply={handleReply}
                replyMessage={getReplyMessage(message.replyTo)}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
                onCopyMessage={handleCopyMessage}
              />
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                    alt="Manor Hassan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{
                      animationDelay: "0ms",
                    }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{
                      animationDelay: "300ms",
                    }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style={{
                      animationDelay: "600ms",
                    }}
                  ></div>
                </div>
                <span>Manor is typing...</span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input area - Fixed at the bottom */}
      {!showEmptyState && (
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={sendMessage}
            isDisabled={connectionStatus !== ConnectionStatus.CONNECTED}
            replyingTo={replyingTo}
            onCancelReply={cancelReply}
          />
        </div>
      )}
      {/* Offline overlay - Shows when connection is offline */}
      {isOffline && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 z-30 flex flex-col items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <CloudOffIcon size={32} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              You're offline
            </h3>
            <p className="text-gray-600 mb-4">
              Check your internet connection and try again. Your messages will
              be sent when you're back online.
            </p>
            <button
              onClick={handleReconnect}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={searchModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Search in conversation
                </h3>
                <button
                  onClick={closeSearch}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <XIcon size={20} />
                </button>
              </div>
              <form onSubmit={handleSearch} className="mt-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <SearchIcon size={18} />
                  </div>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XIcon size={16} />
                    </button>
                  )}
                </div>
                <button type="submit" className="sr-only">
                  Search
                </button>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    {searchResults.length} result
                    {searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {searchResults.map((message) => (
                    <div
                      key={message.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        closeSearch();
                        // Find and scroll to the message
                        setTimeout(() => {
                          document
                            .getElementById(`message-${message.id}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                        }, 300);
                      }}
                    >
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                          <img
                            src={message.avatar || ""}
                            alt={message.name || "User"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {message.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {message.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {message.content.length > 100
                          ? `${message.content.substring(0, 100)}...`
                          : message.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Enter a search term to find messages
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={closeSearch}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Report Reason Modal */}
      {showCustomReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={customReportModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-5"
          >
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Report Conversation
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Please provide details about why you're reporting this
                conversation.
              </p>
            </div>
            <div className="mb-4">
              <label
                htmlFor="reportReason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason
              </label>
              <textarea
                id="reportReason"
                rows={4}
                placeholder="Please describe the issue..."
                value={customReportReason}
                onChange={(e) => setCustomReportReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCustomReportModal(false);
                  setCustomReportReason("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCustomReport}
                disabled={!customReportReason.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm flex items-center ${customReportReason.trim()
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-300 cursor-not-allowed"
                  }`}
              >
                <FlagIcon size={16} className="mr-2" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
