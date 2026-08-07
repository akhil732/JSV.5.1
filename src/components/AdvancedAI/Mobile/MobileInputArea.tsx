import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Mic, MicOff, Square, Sparkles } from 'lucide-react';

interface MobileInputAreaProps {
  onSend: (queryText: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  language?: 'en' | 'hi' | 'te';
}

export const MobileInputArea: React.FC<MobileInputAreaProps> = ({
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  language = 'en'
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading || disabled) return;

    try {
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(10);
      }
    } catch (e) {}

    onSend(text);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Mobile Enter or Cmd+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setInput(val);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 80);
        textareaRef.current.style.height = `${newHeight}px`;
      }
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        try {
          if (window.navigator?.vibrate) window.navigator.vibrate([10, 30, 10]);
        } catch (e) {}
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  return (
    <div className="mobile-input-area border-t border-ds-secondary/15 bg-ds-surface p-2.5 sm:p-3 sticky bottom-0 z-20 space-y-1.5 text-ds-on-surface">
      {isRecording && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-ds-primary/10 border border-ds-primary/30 rounded-xl text-ds-primary text-xs font-mono animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-ds-primary animate-bounce" />
            <span>Listening... Speak your query clear &amp; slow</span>
          </div>
          <button
            type="button"
            onClick={toggleVoiceInput}
            className="text-[10px] underline hover:text-ds-on-surface"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="relative flex items-end gap-2 bg-ds-surface-container border border-ds-secondary/15 focus-within:border-ds-primary/60 rounded-[22px] p-2 shadow-sm transition-all">
        {/* Growing textarea */}
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent text-xs sm:text-sm text-ds-on-surface placeholder:text-ds-on-surface-variant/70 focus:outline-none resize-none px-3 py-1.5 min-h-[38px] max-h-[80px] leading-relaxed"
          placeholder="Ask query... (e.g., When will I get married?)"
          rows={1}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          maxLength={500}
          aria-label="Type your query"
        />

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={disabled || isLoading}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isRecording
                ? 'bg-ds-error-crimson/10 text-ds-error-crimson animate-pulse border border-ds-error-crimson/30'
                : 'text-ds-on-surface-variant hover:text-ds-primary hover:bg-ds-surface'
            }`}
            title="Voice Input"
            aria-label="Voice Input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Stop / FAB Send button */}
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="w-8 h-8 rounded-full bg-ds-error-crimson hover:bg-ds-error-crimson/90 text-ds-on-error flex items-center justify-center cursor-pointer shadow-md transition-transform active:scale-90"
              title="Stop Generation"
              aria-label="Stop Generation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            input.trim().length > 0 && (
              <button
                type="button"
                onClick={handleSend}
                disabled={disabled}
                className="w-8 h-8 rounded-full bg-ds-primary hover:bg-ds-primary/90 text-ds-on-primary flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-90"
                title="Send Message"
                aria-label="Send Message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Footer Character Count */}
      <div className="flex items-center justify-between text-[10px] font-mono text-ds-on-surface-variant px-2">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-ds-primary/70" />
          <span>KP Cusp Sub-Lord Verified</span>
        </span>
        <span>{input.length}/500</span>
      </div>
    </div>
  );
};

