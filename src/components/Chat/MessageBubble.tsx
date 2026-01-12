import React, { useEffect, useState, useRef, createElement } from 'react';
import {
    CheckIcon,
    CheckCheckIcon,
    ClockIcon,
    AlertCircleIcon,
    CornerUpLeftIcon,
    PlayIcon,
    PauseIcon,
    MoreHorizontalIcon,
    TrashIcon,
    PencilIcon,
    CopyIcon,
    XIcon,
} from 'lucide-react';
import { Message, MessageStatus } from './types';
import { FileAttachment } from './FileAttachment';
interface MessageBubbleProps {
    message: Message;
    onRetry: () => void;
    onReply: (messageId: string) => void;
    replyMessage?: Message | null;
    onDeleteMessage?: (messageId: string, deleteForEveryone: boolean) => void;
    onEditMessage?: (messageId: string, newContent: string) => void;
    onCopyMessage?: (content: string) => void;
}
export function MessageBubble({
    message,
    onRetry,
    onReply,
    replyMessage,
    onDeleteMessage,
    onEditMessage,
    onCopyMessage,
}: MessageBubbleProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const [voiceProgress, setVoiceProgress] = useState(0);
    const [playbackInterval, setPlaybackInterval] =
        useState<NodeJS.Timeout | null>(null);
    const [showMessageMenu, setShowMessageMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);
    const [showDeleteOptions, setShowDeleteOptions] = useState(false);
    const messageMenuRef = useRef<HTMLDivElement>(null);
    const editInputRef = useRef<HTMLTextAreaElement>(null);
    const messageRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    // Handle audio playback
    useEffect(() => {
        const audioElement = audioRef.current;
        if (audioElement) {
            // Set up event listeners for the audio element
            const handlePlay = () => {
                setIsPlayingVoice(true);
                updateProgress();
            };
            const handlePause = () => {
                setIsPlayingVoice(false);
                if (playbackInterval) {
                    clearInterval(playbackInterval);
                    setPlaybackInterval(null);
                }
            };
            const handleEnded = () => {
                setIsPlayingVoice(false);
                setVoiceProgress(0);
                if (playbackInterval) {
                    clearInterval(playbackInterval);
                    setPlaybackInterval(null);
                }
            };
            // Add event listeners
            audioElement.addEventListener('play', handlePlay);
            audioElement.addEventListener('pause', handlePause);
            audioElement.addEventListener('ended', handleEnded);
            // Clean up event listeners
            return () => {
                audioElement.removeEventListener('play', handlePlay);
                audioElement.removeEventListener('pause', handlePause);
                audioElement.removeEventListener('ended', handleEnded);
            };
        }
    }, []);
    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            if (playbackInterval) {
                clearInterval(playbackInterval);
            }
        };
    }, [playbackInterval]);
    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                messageMenuRef.current &&
                !messageMenuRef.current.contains(event.target as Node)
            ) {
                setShowMessageMenu(false);
                setShowDeleteOptions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    // Focus edit input when editing starts
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            // Place cursor at the end
            editInputRef.current.selectionStart = editInputRef.current.value.length;
        }
    }, [isEditing]);
    const updateProgress = () => {
        const audioElement = audioRef.current;
        if (audioElement && isPlayingVoice) {
            // Update progress based on current time
            const interval = setInterval(() => {
                if (audioElement.duration) {
                    const progress =
                        (audioElement.currentTime / audioElement.duration) * 100;
                    setVoiceProgress(progress);
                }
            }, 100);
            setPlaybackInterval(interval);
        }
    };
    const toggleVoicePlayback = () => {
        const audioElement = audioRef.current;
        if (audioElement) {
            if (isPlayingVoice) {
                audioElement.pause();
            } else {
                audioElement.play().catch((error) => {
                    console.error('Error playing audio:', error);
                });
            }
        } else if (message.voiceMessage) {
            // Fallback for when there's no real audio - simulate playback
            setIsPlayingVoice(!isPlayingVoice);
            if (!isPlayingVoice) {
                // Simulate playback with progress updates
                const interval = setInterval(() => {
                    setVoiceProgress((prev) => {
                        const newProgress =
                            prev + 100 / (message.voiceMessage?.duration || 30);
                        if (newProgress >= 100) {
                            setIsPlayingVoice(false);
                            clearInterval(interval);
                            return 0;
                        }
                        return newProgress;
                    });
                }, 1000);
                setPlaybackInterval(interval);
            } else if (playbackInterval) {
                clearInterval(playbackInterval);
                setPlaybackInterval(null);
            }
        }
    };
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audioElement = audioRef.current;
        const progressElement = progressRef.current;
        if (audioElement && progressElement && audioElement.duration) {
            // Calculate click position relative to the progress bar
            const rect = progressElement.getBoundingClientRect();
            const clickPosition = (e.clientX - rect.left) / rect.width;
            // Set the audio time based on click position
            audioElement.currentTime = clickPosition * audioElement.duration;
            setVoiceProgress(clickPosition * 100);
        }
    };
    const renderStatusIcon = () => {
        switch (message.status) {
            case MessageStatus.SENDING:
                return <ClockIcon size={14} className="text-gray-400" />;
            case MessageStatus.SENT:
                return <CheckIcon size={14} className="text-gray-400" />;
            case MessageStatus.DELIVERED:
                return <CheckCheckIcon size={14} className="text-gray-400" />;
            case MessageStatus.READ:
                return <CheckCheckIcon size={14} className="text-blue-500" />;
            case MessageStatus.ERROR:
                return (
                    <div className="flex items-center space-x-1">
                        <AlertCircleIcon size={14} className="text-red-500" />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRetry();
                            }}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                            Retry
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };
    const toggleExpand = () => {
        if (message.content.length > 150) {
            setIsExpanded(!isExpanded);
        }
    };
    const handleCopyMessage = () => {
        try {
            // Use a more robust approach to copying text
            // First try the Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard
                    .writeText(message.content)
                    .then(() => {
                        if (onCopyMessage) {
                            onCopyMessage(message.content);
                        }
                        setShowMessageMenu(false);
                    })
                    .catch((err) => {
                        console.error('Failed to copy text using Clipboard API:', err);
                        // Fallback to the older document.execCommand method
                        fallbackCopy();
                    });
            } else {
                // Fallback for browsers that don't support Clipboard API
                fallbackCopy();
            }
        } catch (error) {
            console.error('Error copying message:', error);
            alert(
                'Failed to copy message. Please try selecting and copying manually.',
            );
        }
    };
    // Fallback copy method using document.execCommand
    const fallbackCopy = () => {
        try {
            // Create a temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = message.content;
            // Make the textarea out of viewport
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            // Select and copy the text
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            // Clean up
            document.body.removeChild(textArea);
            if (successful) {
                if (onCopyMessage) {
                    onCopyMessage(message.content);
                }
                setShowMessageMenu(false);
            } else {
                console.error('Fallback copy failed');
                alert(
                    'Failed to copy message. Please try selecting and copying manually.',
                );
            }
        } catch (err) {
            console.error('Fallback copy error:', err);
            alert(
                'Failed to copy message. Please try selecting and copying manually.',
            );
        }
    };
    const handleStartEdit = () => {
        setIsEditing(true);
        setShowMessageMenu(false);
    };
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(message.content);
    };
    const handleSaveEdit = () => {
        if (editedContent.trim() && onEditMessage) {
            onEditMessage(message.id, editedContent);
            setIsEditing(false);
        }
    };
    const handleDeleteClick = () => {
        setShowDeleteOptions(true);
    };
    const handleDelete = (deleteForEveryone: boolean) => {
        if (onDeleteMessage) {
            onDeleteMessage(message.id, deleteForEveryone);
        }
        setShowMessageMenu(false);
        setShowDeleteOptions(false);
    };
    const handleReply = () => {
        onReply(message.id);
        setShowMessageMenu(false);
    };
    const toggleMessageMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMessageMenu(!showMessageMenu);
        setShowDeleteOptions(false);
    };
    const displayContent =
        isExpanded || message.content.length <= 150
            ? message.content
            : `${message.content.substring(0, 150)}...`;
    const isOutgoing = message.sender === 'me';
    // Render voice message UI
    const renderVoiceMessage = () => {
        if (!message.voiceMessage) return null;
        return (
            <div
                className={`flex items-center mt-1 space-x-2 ${isOutgoing ? 'text-blue-100' : 'text-gray-600'}`}
            >
                <button
                    onClick={toggleVoicePlayback}
                    className={`p-2 rounded-full ${isOutgoing ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    {isPlayingVoice ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                </button>
                <div className="flex-1 h-8 flex flex-col justify-center">
                    {/* Hidden audio element for playing the voice message */}
                    {message.voiceMessage.audioUrl && (
                        <audio
                            ref={audioRef}
                            src={message.voiceMessage.audioUrl}
                            preload="metadata"
                            className="hidden"
                        />
                    )}
                    {/* Progress bar */}
                    <div
                        ref={progressRef}
                        className={`h-1 rounded-full w-full ${isOutgoing ? 'bg-blue-400 bg-opacity-40' : 'bg-gray-300'} cursor-pointer`}
                        onClick={handleProgressClick}
                    >
                        <div
                            className={`h-1 rounded-full ${isOutgoing ? 'bg-white' : 'bg-blue-500'}`}
                            style={{
                                width: `${voiceProgress}%`,
                            }}
                        ></div>
                    </div>
                    <div className="text-xs mt-1">
                        {formatDuration(message.voiceMessage.duration)}
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div
            ref={messageRef}
            id={`message-${message.id}`}
            className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4`}
        >
            {/* Avatar for incoming messages (shown on the left) */}
            {!isOutgoing && message.avatar && (
                <div className="flex-shrink-0 mr-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                            src={message.avatar}
                            alt={message.name || 'User avatar'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col max-w-[75%]">
                {/* Replied message reference */}
                {message.replyTo && replyMessage && (
                    <div
                        className={`rounded-lg px-3 py-1.5 mb-1 text-xs ${isOutgoing ? 'bg-blue-400 text-white mr-2' : 'bg-gray-200 text-gray-700 ml-2'} border-l-2 ${isOutgoing ? 'border-blue-600' : 'border-gray-400'}`}
                    >
                        <div className="font-medium mb-0.5">
                            {replyMessage.sender === 'me' ? 'You' : replyMessage.name}
                        </div>
                        <div className="line-clamp-1">{replyMessage.content}</div>
                    </div>
                )}

                <div
                    className={`rounded-lg px-4 py-2.5 ${isOutgoing ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}
                >
                    {/* Editing mode */}
                    {isEditing ? (
                        <div className="flex flex-col space-y-2">
                            <textarea
                                ref={editInputRef}
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className={`text-sm w-full min-h-[60px] p-2 rounded border ${isOutgoing ? 'bg-blue-600 text-white border-blue-400' : 'bg-white text-gray-800 border-gray-300'}`}
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={handleCancelEdit}
                                    className={`text-xs px-2 py-1 rounded ${isOutgoing ? 'bg-blue-600 hover:bg-blue-700 text-blue-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className={`text-xs px-2 py-1 rounded ${isOutgoing ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Regular message content */}
                            {!message.voiceMessage && (
                                <div className="text-sm whitespace-pre-wrap">
                                    {displayContent}
                                    {message.content.length > 150 && (
                                        <button
                                            onClick={toggleExpand}
                                            className={`text-xs ml-1 underline ${isOutgoing ? 'text-blue-100' : 'text-blue-500'}`}
                                        >
                                            {isExpanded ? 'Show less' : 'Read more'}
                                        </button>
                                    )}
                                </div>
                            )}
                            {/* Voice message UI */}
                            {message.voiceMessage && renderVoiceMessage()}
                            {/* File attachment */}
                            {message.attachment && (
                                <div className="mt-2">
                                    <FileAttachment
                                        file={message.attachment}
                                        isOutgoing={isOutgoing}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div
                    className={`flex items-center mt-1 text-xs text-gray-500 ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                >
                    {/* Message menu button - now visible for all messages */}
                    {!isEditing && (
                        <div className="relative mr-2">
                            <button
                                onClick={toggleMessageMenu}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <MoreHorizontalIcon size={14} className="text-gray-500" />
                            </button>
                            {/* Message options menu - appears when three dots are clicked */}
                            {showMessageMenu && (
                                <div
                                    ref={messageMenuRef}
                                    className="absolute bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200"
                                    style={{
                                        [isOutgoing ? 'right' : 'left']: '0',
                                        top: '100%',
                                        marginTop: '10px',
                                        width: '180px',
                                    }}
                                >
                                    {!showDeleteOptions ? (
                                        <>
                                            <button
                                                className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                onClick={handleReply}
                                            >
                                                <CornerUpLeftIcon
                                                    size={14}
                                                    className="mr-2 text-gray-500"
                                                />
                                                Reply
                                            </button>
                                            <button
                                                className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                onClick={handleCopyMessage}
                                            >
                                                <CopyIcon size={14} className="mr-2 text-gray-500" />
                                                Copy Message
                                            </button>
                                            {/* Only show edit and delete for outgoing messages */}
                                            {isOutgoing && (
                                                <>
                                                    <button
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        onClick={handleStartEdit}
                                                    >
                                                        <PencilIcon
                                                            size={14}
                                                            className="mr-2 text-gray-500"
                                                        />
                                                        Edit Message
                                                    </button>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                    <button
                                                        className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                        onClick={handleDeleteClick}
                                                    >
                                                        <TrashIcon size={14} className="mr-2" />
                                                        Delete Message
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="px-4 py-1 text-xs text-gray-500">
                                                Delete options:
                                            </div>
                                            <button
                                                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                onClick={() => handleDelete(false)}
                                            >
                                                Delete for me
                                            </button>
                                            <button
                                                className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                                onClick={() => handleDelete(true)}
                                            >
                                                Delete for everyone
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                className="w-full px-4 py-2 text-sm text-left text-gray-600 hover:bg-gray-100"
                                                onClick={() => setShowDeleteOptions(false)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <span>{formatTime(message.timestamp)}</span>
                    {isOutgoing && <span className="ml-1">{renderStatusIcon()}</span>}
                </div>
            </div>

            {/* Avatar for outgoing messages (shown on the right) */}
            {isOutgoing && message.avatar && (
                <div className="flex-shrink-0 ml-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                            src={message.avatar}
                            alt={message.name || 'Your avatar'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
