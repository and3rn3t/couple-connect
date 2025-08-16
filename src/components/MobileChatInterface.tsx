import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MobileButton } from '@/components/ui/mobile-button';
import { MobileInput } from '@/components/ui/mobile-input';
import {
  Heart,
  Users,
  Camera,
  Star,
  CheckCircle,
  Bell,
  MagicWand,
  Download,
} from '@/components/ui/InlineIcons';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Action, Issue } from '@/App';
import { Partner } from './PartnerSetup';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Chat message types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'reaction' | 'activity' | 'system';
  metadata?: {
    activityId?: string;
    imageUrl?: string;
    reactionEmoji?: string;
    systemType?: 'achievement' | 'milestone' | 'reminder';
    [key: string]: unknown;
  };
  isRead: boolean;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

export interface QuickReply {
  id: string;
  text: string;
  emoji: string;
  category: 'affection' | 'encouragement' | 'planning' | 'fun';
}

export interface ChatSuggestion {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  category: 'activity' | 'date' | 'challenge' | 'gift';
}

interface MobileChatInterfaceProps {
  _actions: Action[];
  _issues: Issue[];
  currentUser: Partner;
  partner: Partner;
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  suggestions: ChatSuggestion[];
  isTyping: boolean;
  onSendMessage: (content: string, type: ChatMessage['type']) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onQuickReply: (replyId: string) => void;
}

export const MobileChatInterface = ({
  _actions,
  _issues,
  currentUser,
  partner,
  messages,
  quickReplies,
  suggestions,
  isTyping,
  onSendMessage,
  onReaction,
  onMarkAsRead,
  onQuickReply,
}: MobileChatInterfaceProps) => {
  const { triggerHaptic } = useHapticFeedback();
  const [newMessage, setNewMessage] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = messages.filter((msg) => !msg.isRead && msg.senderId !== currentUser.id);
    unreadMessages.forEach((msg) => {
      onMarkAsRead(msg.id);
    });
  }, [messages, currentUser.id, onMarkAsRead]);

  // Handle send message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      triggerHaptic('medium');
      onSendMessage(newMessage.trim(), 'text');
      setNewMessage('');
      setShowQuickReplies(false);
    }
  };

  // Handle quick reply
  const handleQuickReply = (reply: QuickReply) => {
    triggerHaptic('light');
    onQuickReply(reply.id);
    setShowQuickReplies(false);
  };

  // Handle reaction
  const handleReaction = (messageId: string, emoji: string) => {
    triggerHaptic('light');
    onReaction(messageId, emoji);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  // Get message icon
  const getMessageIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'activity':
        return <Star className="w-3 h-3 text-blue-500" />;
      case 'image':
        return <Camera className="w-3 h-3 text-green-500" />;
      case 'reaction':
        return <Heart className="w-3 h-3 text-red-500" />;
      case 'system':
        return <Bell className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  // Group messages by sender for better UI
  const groupedMessages = messages.reduce((groups, message, index) => {
    const prevMessage = messages[index - 1];
    const isNewGroup =
      !prevMessage ||
      prevMessage.senderId !== message.senderId ||
      message.timestamp.getTime() - prevMessage.timestamp.getTime() > 5 * 60 * 1000; // 5 minutes

    if (isNewGroup) {
      groups.push([message]);
    } else {
      groups[groups.length - 1].push(message);
    }

    return groups;
  }, [] as ChatMessage[][]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{partner.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="font-semibold text-gray-900">{partner.name}</h1>
            <p className="text-sm text-gray-600">{isTyping ? 'Typing...' : 'Active now'}</p>
          </div>

          <div className="flex gap-2">
            <MobileButton
              variant="outline"
              size="sm"
              onClick={() => {
                triggerHaptic('light');
                setShowSuggestions(!showSuggestions);
              }}
            >
              <MagicWand className="w-4 h-4" />
            </MobileButton>

            <MobileButton
              variant="outline"
              size="sm"
              onClick={() => {
                triggerHaptic('light');
                toast.info('Video call feature coming soon!');
              }}
            >
              <Users className="w-4 h-4" />
            </MobileButton>
          </div>
        </div>
      </div>

      {/* Chat Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-200 px-4 py-3"
          >
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Suggestions</h3>
              <div className="flex gap-2 overflow-x-auto">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <MobileButton
                    key={suggestion.id}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap text-xs flex-shrink-0"
                    onClick={() => {
                      triggerHaptic('medium');
                      suggestion.action();
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion.icon}
                    <span className="ml-1">{suggestion.title}</span>
                  </MobileButton>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((messageGroup, groupIndex) => {
          const firstMessage = messageGroup[0];
          const isCurrentUser = firstMessage.senderId === currentUser.id;

          return (
            <motion.div
              key={groupIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-end gap-2',
                isCurrentUser ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar (only for partner messages) */}
              {!isCurrentUser && (
                <Avatar className="w-8 h-8 mb-1">
                  <AvatarFallback className="text-xs">
                    {firstMessage.senderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Message Group */}
              <div
                className={cn(
                  'flex flex-col gap-1 max-w-[75%]',
                  isCurrentUser ? 'items-end' : 'items-start'
                )}
              >
                {messageGroup.map((message, messageIndex) => (
                  <div
                    key={message.id}
                    className={cn(
                      'relative group',
                      isCurrentUser ? 'flex flex-col items-end' : 'flex flex-col items-start'
                    )}
                  >
                    {/* Message Bubble */}
                    <Card
                      className={cn(
                        'border-0 shadow-sm',
                        isCurrentUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-900',
                        messageIndex === 0 && !isCurrentUser && 'rounded-tl-sm',
                        messageIndex === 0 && isCurrentUser && 'rounded-tr-sm',
                        messageIndex === messageGroup.length - 1 &&
                          !isCurrentUser &&
                          'rounded-bl-sm',
                        messageIndex === messageGroup.length - 1 && isCurrentUser && 'rounded-br-sm'
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          {getMessageIcon(message.type)}

                          <div className="flex-1">
                            {/* Message Content */}
                            <p className="text-sm leading-relaxed break-words">{message.content}</p>

                            {/* System Message Metadata */}
                            {message.type === 'system' && message.metadata?.systemType && (
                              <div className="mt-2 text-xs opacity-75">
                                <Badge
                                  className={cn(
                                    'text-xs',
                                    isCurrentUser
                                      ? 'bg-blue-400 text-white'
                                      : 'bg-gray-100 text-gray-700'
                                  )}
                                >
                                  {message.metadata.systemType}
                                </Badge>
                              </div>
                            )}

                            {/* Activity Message */}
                            {message.type === 'activity' && (
                              <MobileButton
                                variant="outline"
                                size="sm"
                                className={cn(
                                  'mt-2 text-xs',
                                  isCurrentUser
                                    ? 'border-blue-300 text-blue-100 hover:bg-blue-400'
                                    : 'border-gray-200 text-gray-600'
                                )}
                                onClick={() => {
                                  triggerHaptic('light');
                                  toast.info('Activity details coming soon!');
                                }}
                              >
                                View Activity
                              </MobileButton>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1 ml-2">
                        {message.reactions.slice(0, 3).map((reaction, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-full px-2 py-1 text-xs shadow-sm border flex items-center gap-1"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-gray-600">{reaction.userName.charAt(0)}</span>
                          </div>
                        ))}
                        {message.reactions.length > 3 && (
                          <div className="bg-white rounded-full px-2 py-1 text-xs shadow-sm border">
                            +{message.reactions.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timestamp (only on last message of group) */}
                    {messageIndex === messageGroup.length - 1 && (
                      <div
                        className={cn(
                          'text-xs text-gray-500 mt-1 px-1',
                          isCurrentUser ? 'text-right' : 'text-left'
                        )}
                      >
                        {formatTimestamp(message.timestamp)}
                        {isCurrentUser && (
                          <span className="ml-1">
                            {message.isRead ? (
                              <CheckCircle className="w-3 h-3 inline text-blue-500" />
                            ) : (
                              <CheckCircle className="w-3 h-3 inline text-gray-400" />
                            )}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reaction Quick Actions (on long press simulation - click) */}
                    <div
                      className={cn(
                        'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity',
                        'flex gap-1 text-xs',
                        isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'
                      )}
                    >
                      {['❤️', '👍', '😂', '😮'].map((emoji) => (
                        <MobileButton
                          key={emoji}
                          variant="outline"
                          size="sm"
                          className="w-6 h-6 p-0 text-xs hover:scale-110 transition-transform"
                          onClick={() => handleReaction(message.id, emoji)}
                        >
                          {emoji}
                        </MobileButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">
                {partner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-t border-gray-200 px-4 py-3"
          >
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Quick Replies</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.slice(0, 4).map((reply) => (
                  <MobileButton
                    key={reply.id}
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => handleQuickReply(reply)}
                  >
                    <span className="mr-2">{reply.emoji}</span>
                    {reply.text}
                  </MobileButton>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-3">
          {/* Additional Actions */}
          <div className="flex gap-2">
            <MobileButton
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={() => {
                triggerHaptic('light');
                toast.info('Photo sharing coming soon!');
              }}
            >
              <Camera className="w-4 h-4" />
            </MobileButton>

            <MobileButton
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={() => {
                triggerHaptic('light');
                setShowQuickReplies(!showQuickReplies);
              }}
            >
              <Heart className="w-4 h-4" />
            </MobileButton>
          </div>

          {/* Message Input */}
          <div className="flex-1 flex gap-2">
            <MobileInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <MobileButton
              className={cn(
                'px-4 transition-all duration-200',
                newMessage.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 scale-100'
                  : 'bg-gray-300 scale-95'
              )}
              disabled={!newMessage.trim()}
              onClick={handleSendMessage}
            >
              <Download className="w-4 h-4 rotate-90" />
            </MobileButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileChatInterface;
