'use client';

import { useState, useRef, useCallback } from 'react';
import { usePaper } from '@/context/PaperContext';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

interface ChatPanelProps {
  paperTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const SMART_ENTRY_POINTS = [
  'Summarize key contributions',
  'What are the limitations?',
  'Explain methodology step-by-step',
];

export default function ChatPanel({ paperTitle, isOpen, onClose }: ChatPanelProps) {
  const [mode, setMode] = useState<'beginner' | 'technical'>('beginner');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your research assistant. I've analyzed *${paperTitle}*. How can I help you explore it today?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { paperData } = usePaper();

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const loadingId = `loading-${Date.now()}`;
    const loadingMsg: ChatMessage = {
      id: loadingId,
      role: 'assistant',
      content: 'Thinking...',
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    try {
      const paperContent = paperData?.sections.map(s => `${s.heading}\n${s.content}`).join('\n\n') || '';
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode,
          paperContent,
        }),
      });

      if (!res.ok) {
        throw new Error('API Error');
      }

      const data = await res.json();
      
      setMessages((prev) => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, id: `assistant-${Date.now()}`, content: data.reply }
          : msg
      ));
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, id: `assistant-${Date.now()}`, content: "Sorry, I encountered an error. Please try again later." }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    sendMessage(text);
  }, [inputValue, mode, paperData, isLoading]);

  const handleSmartEntry = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [mode, paperData, isLoading]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          chat-panel
          fixed top-0 right-0 h-full z-40
          w-[320px] bg-white
          border-l border-slate-200/60
          flex flex-col
          transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0 lg:z-0
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Mode Toggle */}
        <div className="px-5 pt-5 pb-3">
          {/* Mobile close button */}
          <div className="flex items-center justify-between mb-3 lg:hidden">
            <span className="text-sm font-semibold text-slate-700">Research Assistant</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setMode('beginner')}
              className={`
                flex-1 px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase
                rounded-md transition-all duration-200 cursor-pointer
                ${mode === 'beginner'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              Beginner
            </button>
            <button
              onClick={() => setMode('technical')}
              className={`
                flex-1 px-4 py-2 text-xs font-semibold tracking-[0.1em] uppercase
                rounded-md transition-all duration-200 cursor-pointer
                ${mode === 'technical'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              Technical
            </button>
          </div>
        </div>

        {/* Smart Entry Points */}
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase mb-3">
            Smart Entry Points
          </p>
          <div className="space-y-2">
            {SMART_ENTRY_POINTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSmartEntry(prompt)}
                className="
                  smart-entry-btn
                  w-full text-left px-3.5 py-2.5
                  text-[13px] text-slate-600
                  bg-slate-50 rounded-lg border border-slate-100
                  hover:bg-slate-100 hover:border-slate-200
                  transition-all duration-200
                  cursor-pointer
                "
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 chat-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
              )}

              <div
                className={`
                  max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed
                  ${msg.role === 'assistant'
                    ? 'bg-slate-50 text-slate-700 border border-slate-100'
                    : 'bg-slate-700 text-white ml-auto'
                  }
                `}
              >
                {msg.content.split(/(\*[^*]+\*)/).map((part, i) => {
                  if (part.startsWith('*') && part.endsWith('*')) {
                    return (
                      <em key={i} className="font-medium not-italic" style={{ fontFamily: 'var(--font-serif)' }}>
                        {part.slice(1, -1)}
                      </em>
                    );
                  }
                  return part;
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-1 focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-200 transition-all duration-200">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the paper..."
              className="flex-1 bg-transparent py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                transition-all duration-200 cursor-pointer flex-shrink-0
                ${inputValue.trim()
                  ? 'bg-slate-700 text-white hover:bg-slate-800 shadow-sm'
                  : 'bg-slate-200 text-slate-400'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
