import {
  Message,
  MessageStatus,
  FileAttachment,
  ConnectionStatus,
} from "./types";
// Simulated advisor responses
const advisorResponses = [
  "I'll process your request right away. Is there anything else you need assistance with?",
  "Thank you for your message. I've noted your request and will follow up with the relevant information shortly.",
  "I'm looking into this for you. I'll have an answer prepared within the next business day.",
  "Thanks for sharing that information. Is there any specific aspect of this you'd like me to focus on?",
  "I understand your concern. Let me connect you with our specialized team who can provide more detailed guidance on this matter.",
  "That's a great question. Based on your business profile, I recommend reviewing the resources in your document wallet under 'Financial Planning'.",
  "I've added this information to your application. You can view the updated status in the Service Requests section.",
  "Would you like me to schedule a call with one of our financial advisors to discuss this in more detail?",
];
// For demo purposes, start with empty messages
const initialMessages: Message[] = [];
// Type for message change listeners
type MessageListener = (messages: Message[]) => void;
type TypingStatusListener = (isTyping: boolean) => void;
type ConnectionStatusListener = (status: ConnectionStatus) => void;
class ChatService {
  private messages: Message[] = [...initialMessages];
  private messageListeners: MessageListener[] = [];
  private typingStatusListeners: TypingStatusListener[] = [];
  private connectionStatusListeners: ConnectionStatusListener[] = [];
  private isAdvisorTyping: boolean = false;
  private connectionStatus: ConnectionStatus = ConnectionStatus.IDLE;
  private typingTimeout: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private userAvatar =
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80";
  private advisorAvatar =
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80";
  private deletedMessages: Message[] = [];
  private automaticResponsesEnabled: boolean = false;
  constructor() {
    // Initialize with existing messages
    this.simulateConnection();
  }
  // Simulate connection process
  private simulateConnection(): void {
    this.setConnectionStatus(ConnectionStatus.CONNECTING);
    // Simulate connection process with random success/failure
    this.connectionTimeout = setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 10% chance of failure for demo purposes
      if (isSuccess) {
        this.setConnectionStatus(ConnectionStatus.CONNECTED);
      } else {
        this.setConnectionStatus(ConnectionStatus.ERROR);
        // Auto retry after error
        setTimeout(() => {
          this.simulateConnection();
        }, 3000);
      }
    }, 1500);
  }
  // Get all messages
  getMessages(): Message[] {
    return [...this.messages];
  }
  // Get current connection status
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // Get automatic responses setting
  getAutomaticResponsesEnabled(): boolean {
    return this.automaticResponsesEnabled;
  }

  // Enable or disable automatic responses
  setAutomaticResponsesEnabled(enabled: boolean): void {
    this.automaticResponsesEnabled = enabled;
  }

  // Manually trigger an advisor response (for when automatic responses are disabled)
  triggerAdvisorResponse(replyToId?: string, withVoice: boolean = false): void {
    // Show typing indicator
    this.setAdvisorTyping(true);
    // Simulate advisor typing and responding
    const typingTime = 1500 + Math.random() * 2000; // Random typing time between 1.5-3.5 seconds
    this.typingTimeout = setTimeout(() => {
      this.setAdvisorTyping(false);
      this.simulateAdvisorResponse(replyToId, withVoice);
    }, typingTime);
  }
  // Subscribe to message changes
  subscribeToMessages(listener: MessageListener): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(
        (l) => l !== listener
      );
    };
  }
  // Subscribe to typing status changes
  subscribeToTypingStatus(listener: TypingStatusListener): () => void {
    this.typingStatusListeners.push(listener);
    return () => {
      this.typingStatusListeners = this.typingStatusListeners.filter(
        (l) => l !== listener
      );
    };
  }
  // Subscribe to connection status changes
  subscribeToConnectionStatus(listener: ConnectionStatusListener): () => void {
    this.connectionStatusListeners.push(listener);
    // Immediately notify with current status
    listener(this.connectionStatus);
    return () => {
      this.connectionStatusListeners = this.connectionStatusListeners.filter(
        (l) => l !== listener
      );
    };
  }
  // Clear all messages
  clearMessages(): void {
    this.messages = [];
    this.notifyMessageListeners();
  }
  // Notify all message listeners
  private notifyMessageListeners(): void {
    this.messageListeners.forEach((listener) => listener([...this.messages]));
  }
  // Notify all typing status listeners
  private notifyTypingStatusListeners(): void {
    this.typingStatusListeners.forEach((listener) =>
      listener(this.isAdvisorTyping)
    );
  }
  // Notify all connection status listeners
  private notifyConnectionStatusListeners(): void {
    this.connectionStatusListeners.forEach((listener) =>
      listener(this.connectionStatus)
    );
  }
  // Set connection status
  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.notifyConnectionStatusListeners();
  }
  // Set advisor typing status
  private setAdvisorTyping(isTyping: boolean): void {
    this.isAdvisorTyping = isTyping;
    this.notifyTypingStatusListeners();
  }
  // Send a message
  sendMessage(
    content: string,
    attachment?: FileAttachment,
    replyToId?: string,
    voiceMessage?: { duration: number; audioUrl?: string }
  ): void {
    // Check if connected
    if (this.connectionStatus !== ConnectionStatus.CONNECTED) {
      // Try to reconnect
      this.simulateConnection();
      setTimeout(
        () => this.sendMessage(content, attachment, replyToId, voiceMessage),
        1500
      );
      return;
    }
    // Create a new message
    const newMessage: Message = {
      id: Date.now().toString(),
      content: voiceMessage ? "Voice message" : content,
      sender: "me",
      timestamp: new Date(),
      status: MessageStatus.SENDING,
      attachment,
      avatar: this.userAvatar,
      name: "You",
      usertype: "sender",
      replyTo: replyToId,
      voiceMessage: voiceMessage
        ? {
            duration: voiceMessage.duration,
            audioUrl: voiceMessage.audioUrl,
          }
        : undefined,
    };
    // Add message to local storage
    this.messages.push(newMessage);
    this.notifyMessageListeners();
    // Simulate network delay for sending
    setTimeout(() => {
      // Update message status to sent
      this.updateMessageStatus(newMessage.id, MessageStatus.SENT);
      // Simulate delivered status after a short delay
      setTimeout(() => {
        this.updateMessageStatus(newMessage.id, MessageStatus.DELIVERED);
        // Simulate read status after another delay
        setTimeout(() => {
          this.updateMessageStatus(newMessage.id, MessageStatus.READ);
          
          // Only show typing indicator and respond if automatic responses are enabled
          if (this.automaticResponsesEnabled) {
            // Show typing indicator
            this.setAdvisorTyping(true);
            // Simulate advisor typing and responding
            const typingTime = 1500 + Math.random() * 2000; // Random typing time between 1.5-3.5 seconds
            this.typingTimeout = setTimeout(() => {
              this.setAdvisorTyping(false);
              this.simulateAdvisorResponse(
                newMessage.id,
                voiceMessage ? true : false
              );
            }, typingTime);
          }
        }, 500); // Read status delay
      }, 500); // Delivered status delay
    }, 500); // Sent status delay
  }
  // Simulate advisor response
  private simulateAdvisorResponse(
    replyToId?: string,
    withVoice: boolean = false
  ): void {
    // 30% chance to reply to the message
    const shouldReply = Math.random() < 0.3 && replyToId;
    // 20% chance to reply with voice if the original message was voice
    const shouldReplyWithVoice = withVoice && Math.random() < 0.2;
    // Select a random response
    const responseIndex = Math.floor(Math.random() * advisorResponses.length);
    const responseContent = shouldReplyWithVoice
      ? "Voice message"
      : advisorResponses[responseIndex];
    // For demo purposes, create a sample audio URL for voice messages
    // In a real app, this would be a real audio file URL
    const audioUrl = shouldReplyWithVoice
      ? "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3"
      : undefined;
    // Create the advisor's response
    const responseMessage: Message = {
      id: Date.now().toString(),
      content: responseContent,
      sender: "them",
      timestamp: new Date(),
      status: MessageStatus.READ,
      avatar: this.advisorAvatar,
      name: "Manor Hassan",
      usertype: "receiver",
      replyTo: shouldReply ? replyToId : undefined,
      voiceMessage: shouldReplyWithVoice
        ? {
            duration: 5 + Math.floor(Math.random() * 25),
            audioUrl,
          }
        : undefined,
    };
    // Add message to storage
    this.messages.push(responseMessage);
    this.notifyMessageListeners();
  }
  // Update message status
  private updateMessageStatus(messageId: string, status: MessageStatus): void {
    this.messages = this.messages.map((msg) =>
      msg.id === messageId ? { ...msg, status } : msg
    );
    this.notifyMessageListeners();
  }
  // Retry sending a failed message
  retryMessage(messageId: string): void {
    const message = this.messages.find((msg) => msg.id === messageId);
    if (!message || message.sender !== "me") return;
    // Update status to sending
    this.updateMessageStatus(messageId, MessageStatus.SENDING);
    // Simulate retry process
    setTimeout(() => {
      this.updateMessageStatus(messageId, MessageStatus.SENT);
      setTimeout(() => {
        this.updateMessageStatus(messageId, MessageStatus.DELIVERED);
        setTimeout(() => {
          this.updateMessageStatus(messageId, MessageStatus.READ);
        }, 500);
      }, 500);
    }, 800);
  }
  // Reconnect if there was an error
  reconnect(): void {
    if (this.connectionStatus === ConnectionStatus.ERROR) {
      this.simulateConnection();
    }
  }
  // Clean up any pending timeouts
  cleanup(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }
  }
  // Delete message
  deleteMessage(messageId: string, deleteForEveryone: boolean): void {
    // Find the message
    const message = this.messages.find((msg) => msg.id === messageId);
    if (!message) return;
    // Store the message in deletedMessages for potential undo
    this.deletedMessages.push({ ...message });
    if (deleteForEveryone) {
      // Remove the message completely
      this.messages = this.messages.filter((msg) => msg.id !== messageId);
    } else {
      // Just mark as deleted for the current user
      this.messages = this.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: "This message was deleted",
              isDeletedForMe: true,
            }
          : msg
      );
    }
    this.notifyMessageListeners();
  }
  // Restore a deleted message
  restoreMessage(message: Message): void {
    // Check if the message was completely removed or just marked as deleted
    const existingMessage = this.messages.find((msg) => msg.id === message.id);
    if (existingMessage && existingMessage.isDeletedForMe) {
      // If the message exists but was marked as deleted, restore its content
      this.messages = this.messages.map((msg) =>
        msg.id === message.id ? { ...message, isDeletedForMe: false } : msg
      );
    } else {
      // If the message was completely removed, add it back in the right position
      // Find the right position based on timestamp
      const index = this.messages.findIndex(
        (msg) => msg.timestamp.getTime() > message.timestamp.getTime()
      );
      if (index === -1) {
        // If no message with a later timestamp exists, append to the end
        this.messages.push(message);
      } else {
        // Insert at the correct position
        this.messages.splice(index, 0, message);
      }
    }
    // Remove from deleted messages
    this.deletedMessages = this.deletedMessages.filter(
      (msg) => msg.id !== message.id
    );
    this.notifyMessageListeners();
  }
  // Edit message
  editMessage(messageId: string, newContent: string): void {
    // Find and update the message
    const message = this.messages.find((msg) => msg.id === messageId);
    if (!message || message.sender !== "me") return;
    this.messages = this.messages.map((msg) =>
      msg.id === messageId
        ? { ...msg, content: newContent, isEdited: true }
        : msg
    );
    this.notifyMessageListeners();
  }
}
// Create and export a singleton instance
export const chatService = new ChatService();
