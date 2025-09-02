"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  MessageSquareText,
  MessageCircleOff,
  MessageSquarePlus,
  PanelBottom,
  MessageCircleMore,
  MessageCircleReply
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface ChatbotProps {
  isAuthenticated?: boolean;
  user?: User | null;
  theme?: 'light' | 'dark';
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  pinned?: boolean;
  isTyping?: boolean;
}

interface ConversationHistory {
  messages: Message[];
  sessionId: string;
}

export default function Chatbot({ isAuthenticated = false, user, theme = 'dark' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationId, setConversationId] = useState<string>("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickTemplates = [
    "What's my portfolio risk?",
    "Analyze my BTC holdings",
    "Forecast ETH price", 
    "Set BTC alert at $45k",
    "Summarize my portfolio"
  ];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "/" && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      document.addEventListener("keydown", handleKeydown);
      return () => document.removeEventListener("keydown", handleKeydown);
    }
  }, [isOpen]);

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = useCallback((content: string, role: "user" | "assistant", isTyping = false) => {
    const newMessage: Message = {
      id: generateMessageId(),
      content,
      role,
      timestamp: new Date(),
      isTyping
    };

    setMessages(prev => [...prev, newMessage]);

    if (role === "assistant" && !isOpen) {
      setUnreadCount(prev => prev + 1);
    }

    return newMessage.id;
  }, [isOpen]);

  const updateMessage = useCallback((messageId: string, content: string, isTyping = false) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content, isTyping }
        : msg
    ));
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const classifyIntent = (input: string) => {
    const lower = input.toLowerCase();
    
    if (lower.includes("alert") || lower.includes("notification")) {
      return "alert";
    }
    if (lower.includes("portfolio") || lower.includes("risk") || lower.includes("holdings")) {
      return "portfolio";
    }
    if (lower.includes("forecast") || lower.includes("predict") || lower.includes("price")) {
      return "forecast";
    }
    if (lower.includes("analyze") || lower.includes("summary") || lower.includes("summarize")) {
      return "analysis";
    }
    return "general";
  };

  const handleQuickAction = async (intent: string, input: string) => {
    switch (intent) {
      case "alert":
        const match = input.match(/(\w+).*?(\d+(?:\.\d+)?k?)/i);
        if (match) {
          const [, symbol, price] = match;
          const priceValue = price.includes('k') 
            ? parseFloat(price.replace('k', '')) * 1000 
            : parseFloat(price);
          
          return `I can help you set up a ${symbol.toUpperCase()} alert at $${priceValue.toLocaleString()}. This would create an alert in your Alerts section. Would you like me to proceed?`;
        }
        return "I can help you set up price alerts. Please specify the cryptocurrency and target price (e.g., 'Set BTC alert at $45k').";
      
      case "portfolio":
        if (!isAuthenticated) {
          return "To analyze your portfolio, you'll need to sign in first. Portfolio analysis requires access to your holdings data.";
        }
        return "Based on your current portfolio composition, I'll need to analyze your holdings. Please note that detailed portfolio analysis requires your consent to share data with AI providers for enhanced insights.";
      
      case "forecast":
        return "I can provide technical analysis and market trends. However, please remember that this is not financial advice and cryptocurrency markets are highly volatile.";
      
      default:
        return isAuthenticated 
          ? `How can I help you with your crypto portfolio today, ${user?.displayName || 'there'}?`
          : "How can I help you with cryptocurrency information today?";
    }
  };

  const simulateAIResponse = async (input: string): Promise<string> => {
    const intent = classifyIntent(input);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const quickResponse = await handleQuickAction(intent, input);
    
    // Simulate more detailed responses
    const responses = {
      portfolio: isAuthenticated 
        ? "Your portfolio shows a balanced allocation across major cryptocurrencies. Current risk level appears moderate with 65% in Bitcoin and Ethereum. Consider diversifying into DeFi tokens for potential growth. *This is not financial advice.*"
        : "To provide portfolio analysis, please sign in to access your holdings data. I can offer general market insights without authentication.",
      forecast: "Based on current technical indicators, Bitcoin shows bullish momentum with strong support at $42k. However, market volatility remains high due to regulatory uncertainty. *This is not financial advice.*",
      analysis: isAuthenticated
        ? "Portfolio Summary: Total value $12,450 (+5.2% today). Top performer: ETH (+8.1%). Recommendation: Consider taking profits on outperforming assets. *This is not financial advice.*"
        : "For personalized analysis, please sign in. I can provide general market analysis and trends without authentication.",
      alert: quickResponse,
      general: isAuthenticated 
        ? `I'm here to help with your cryptocurrency portfolio analysis, price alerts, and market insights, ${user?.displayName || 'there'}. What would you like to know?`
        : "I'm here to help with cryptocurrency information, market insights, and general guidance. For personalized portfolio features, please sign in. What would you like to know?"
    };

    return responses[intent as keyof typeof responses] || responses.general;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    
    // Check if this is a sensitive query that needs consent
    const needsConsent = userMessage.toLowerCase().includes("portfolio") || 
                        userMessage.toLowerCase().includes("analyze");
    
    if (needsConsent && !consentGiven && isAuthenticated) {
      setShowConsent(true);
      return;
    }

    // Add user message
    addMessage(userMessage, "user");

    // Check rate limiting (simulate)
    if (messages.length > 50) {
      setRateLimitWarning(true);
      toast.error("Rate limit approached. Please wait before sending more messages.");
      return;
    }

    setIsLoading(true);
    setIsTyping(true);

    // Create abort controller for cancellation
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Add typing indicator
      const typingId = addMessage("", "assistant", true);

      // Simulate AI response
      const response = await simulateAIResponse(userMessage);
      
      // Update with actual response
      updateMessage(typingId, response, false);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.info("Message cancelled");
      } else {
        console.error("Chat error:", error);
        addMessage(
          "I'm experiencing some technical difficulties. Here's what I can tell you: Your portfolio data is stored securely and I can help with basic queries. *AI services temporarily unavailable*",
          "assistant"
        );
        toast.error("AI service unavailable - showing basic response");
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setAbortController(null);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleTemplateClick = (template: string) => {
    setInputValue(template);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const togglePin = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, pinned: !msg.pinned }
        : msg
    ));
  };

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowConsent(false);
    toast.success("Consent granted - you can now use advanced portfolio features");
  };

  const handleConsentDecline = () => {
    setShowConsent(false);
    toast.info("Basic features remain available without data sharing");
  };

  const exportConversation = () => {
    const exportData = {
      sessionId: conversationId,
      messages: messages.map(({ id, content, role, timestamp, pinned }) => ({
        id, content, role, timestamp: timestamp.toISOString(), pinned
      })),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Conversation exported successfully");
  };

  const clearHistory = () => {
    setMessages([]);
    setConversationId(`conv_${Date.now()}`);
    toast.success("Conversation history cleared");
  };

  return (
    <>
      {/* Launcher Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setUnreadCount(0);
            }
          }}
          size="lg"
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg relative"
          aria-label={`${isOpen ? 'Close' : 'Open'} chat assistant`}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent text-accent-foreground p-0 flex items-center justify-center text-xs font-medium"
              aria-label={`${unreadCount} unread messages`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-labelledby="chat-title"
            aria-describedby="chat-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-primary" />
                <h3 id="chat-title" className="font-medium">AI Assistant</h3>
                {isTyping && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isLoading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportConversation}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Export conversation"
                >
                  <PanelBottom className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close chat"
                >
                  <MessageCircleOff className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Consent Modal */}
            <AnimatePresence>
              {showConsent && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6 z-10"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-card border border-border rounded-lg p-6 max-w-sm"
                  >
                    <h4 className="font-medium mb-3">Data Sharing Consent</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This request requires sending your portfolio data to third-party AI providers for enhanced analysis. Your data will be processed securely and not stored permanently.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleConsentDecline}>
                        Decline
                      </Button>
                      <Button size="sm" onClick={handleConsentAccept}>
                        Accept
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div id="chat-description" className="sr-only">
                AI assistant chat interface for portfolio analysis and crypto insights
              </div>
              
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Hi{isAuthenticated && user?.displayName ? `, ${user.displayName}` : ''}! I'm your crypto portfolio assistant.<br />
                    {isAuthenticated ? 'Ask me about your holdings, set alerts, or get market insights.' : 'Ask me about crypto markets, set up an account for personalized features.'}
                  </p>
                  <p className="text-xs mt-2 opacity-75">
                    *Not financial advice
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] relative group ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    } rounded-lg px-3 py-2`}>
                      {message.pinned && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="h-4 w-4 p-0 rounded-full bg-accent text-accent-foreground">
                            📌
                          </Badge>
                        </div>
                      )}
                      
                      {message.isTyping ? (
                        <div className="flex items-center gap-2">
                          <div className="typing-animation flex gap-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <time className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </time>
                            {message.role === 'assistant' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePin(message.id)}
                                className="opacity-0 group-hover:opacity-100 h-auto p-0 text-xs hover:bg-transparent"
                                aria-label={message.pinned ? 'Unpin message' : 'Pin message'}
                              >
                                {message.pinned ? '📌' : '📌'}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Quick Templates */}
            {messages.length === 0 && (
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickTemplates.slice(0, 3).map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleTemplateClick(template)}
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Rate Limit Warning */}
            {rateLimitWarning && (
              <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
                <p className="text-xs text-destructive">
                  Rate limit warning: Please slow down your requests
                </p>
              </div>
            )}

            {/* Auth Prompt */}
            {!isAuthenticated && messages.length > 0 && (
              <div className="px-4 py-2 bg-primary/10 border-t border-primary/20">
                <p className="text-xs text-primary">
                  Sign in for personalized portfolio features and advanced AI insights
                </p>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isAuthenticated ? "Ask about your portfolio..." : "Ask about crypto..."}
                  disabled={isLoading}
                  className="flex-1"
                  aria-label="Chat message input"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press "/" to focus • ESC to close • Not financial advice
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}