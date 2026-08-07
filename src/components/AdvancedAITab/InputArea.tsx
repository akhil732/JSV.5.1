import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic, MicOff, CornerDownLeft } from 'lucide-react';

interface InputAreaProps {
  onSend: (queryText: string) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  language?: 'en' | 'hi' | 'te';
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  language = 'en'
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey || !e.shiftKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || isLoading || disabled) return;
    onSend(text);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  return (
    <div className="input-area border-t border-ds-secondary/15 bg-ds-surface-container p-3 sm:p-4 space-y-2 sticky bottom-0 z-20 shadow-xs">
      <div className="relative flex items-center bg-ds-surface border border-ds-secondary/15 focus-within:border-ds-primary/60 rounded-2xl transition-all p-2 shadow-sm">
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent text-xs sm:text-sm text-ds-secondary placeholder:text-ds-on-surface-variant/50 focus:outline-none resize-none px-3 py-1.5 min-h-[44px] max-h-[120px] font-medium"
          placeholder="Ask your astrological query... (e.g. When will I get married? What does my 10th house say?)"
          rows={1}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          aria-label="Astrological Query Input"
        />

        {/* Voice Input Toggle Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-2 rounded-xl transition-colors cursor-pointer mr-1 ${
            isListening
              ? 'bg-rose-500/10 text-rose-600 animate-pulse border border-rose-200'
              : 'text-ds-on-surface-variant hover:text-ds-primary'
          }`}
          title="Toggle Voice Input"
          aria-label="Toggle Voice Input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-ds-on-surface-variant px-1 font-bold">
        <span className="hidden sm:inline">
          Cmd/Ctrl + Enter to send
        </span>

        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="ml-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="ml-auto px-5 py-2 bg-ds-primary hover:bg-ds-primary/90 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask Question</span>
          </button>
        )}
      </div>
    </div>
  );
};
