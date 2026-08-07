import React, { useState } from 'react';
import { Bot, User, Copy, Check, Search, MessageSquare, Globe, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ConversationMessage } from '../../lib/services/EnhancedGeminiConsultationService';

interface MessageBubbleProps {
  message: ConversationMessage;
  onOpenInspector?: () => void;
  onSendFollowUp?: (queryText: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onOpenInspector,
  onSendFollowUp
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-wrapper flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-ds-primary/10 border border-ds-primary/30 text-ds-primary flex items-center justify-center shrink-0 mt-1 shadow-2xs">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`message-container max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
        <div
          className={`message-bubble p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-ds-primary text-white font-bold rounded-tr-none shadow-sm'
              : 'bg-ds-surface border border-ds-secondary/15 text-ds-secondary rounded-tl-none shadow-xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose max-w-none text-xs sm:text-sm">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-sm font-serif font-bold text-ds-secondary mt-2 mb-1 border-b border-ds-secondary/15 pb-1">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xs sm:text-sm font-serif font-bold text-ds-secondary mt-2 mb-1">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-serif font-bold text-ds-primary mt-1.5 mb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="my-1.5 leading-relaxed text-ds-on-surface-variant font-medium">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-1.5 space-y-1 list-disc pl-4 text-xs sm:text-sm text-ds-on-surface-variant">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-ds-on-surface-variant my-0.5">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-ds-secondary">{children}</strong>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Metadata Badges & Follow-up Actions */}
              <div className="pt-3 border-t border-ds-secondary/15 mt-3 space-y-2">
                {message.metadata?.queryDomain && (
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                    <span className="bg-ds-primary/10 text-ds-primary border border-ds-primary/20 px-2 py-0.5 rounded-full font-bold">
                      Domain: {message.metadata.queryDomain}
                    </span>
                    {message.metadata.confidence && (
                      <span className="bg-ds-success-green/10 text-ds-success-green border border-ds-success-green/20 px-2 py-0.5 rounded-full font-bold">
                        {message.metadata.confidence}% Confidence
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {onOpenInspector && (
                    <button
                      onClick={onOpenInspector}
                      className="px-2.5 py-1 rounded-lg bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-success-green/50 text-[11px] font-bold font-mono text-ds-success-green flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <Search className="w-3 h-3" />
                      <span>Inspect Ground Truth</span>
                    </button>
                  )}

                  {onSendFollowUp && (
                    <button
                      onClick={() => onSendFollowUp(`Tell me more about: ${message.content.slice(0, 40)}...`)}
                      className="px-2.5 py-1 rounded-lg bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/50 text-[11px] font-bold font-mono text-ds-primary flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Follow-up</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-lg bg-ds-surface-container border border-ds-secondary/15 hover:border-ds-primary/50 text-ds-on-surface-variant hover:text-ds-secondary text-[11px] font-mono flex items-center gap-1 ml-auto cursor-pointer transition-all shadow-2xs"
                    title="Copy response"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-ds-success-green" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`text-[10px] text-ds-on-surface-variant/60 font-mono font-bold px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-ds-secondary text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
