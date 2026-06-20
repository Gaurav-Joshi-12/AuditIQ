import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useAuditStore } from '@/store/audit-store';
import api from '@/lib/api';
import type { ChatMessage } from '@/lib/types';

const SUGGESTIONS = [
  'Are there any duplicate payments or suspicious high value transactions?',
  'Which vendors have the highest fraud risk?',
  'List round-number transactions',
  'How many weekend postings were detected?',
  'Summarize the overall risk profile',
];

export const AIChatbot = () => {
  const { chatMessages, addChatMessage, activeCompanyIdForRag, activeUploadIdForRag } = useAuditStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content: input, timestamp: new Date() };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('http://localhost:8082/api/query', {
        query: input,
        companyId: activeCompanyIdForRag || 1,
        uploadId: activeUploadIdForRag || null
      });

      const data = response.data;
      
      let answerText = data.answer || "I'm sorry, I couldn't generate an answer at this time.";
      if (data.matchedAnomalies && data.matchedAnomalies.length > 0 && !data.answer) {
         answerText = `I found ${data.matchedAnomalies.length} related records, but couldn't generate a text summary.`;
      }

      const assistantMsg: ChatMessage = { 
        id: `msg-${Date.now() + 1}`, 
        role: 'assistant', 
        content: answerText, 
        timestamp: new Date() 
      };
      addChatMessage(assistantMsg);
    } catch (error) {
      console.error("Query failed", error);
      const errorMsg: ChatMessage = { 
        id: `msg-${Date.now() + 1}`, 
        role: 'assistant', 
        content: "Sorry, I encountered an error connecting to the AI backend. Please make sure the server is running.", 
        timestamp: new Date() 
      };
      addChatMessage(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">AI Audit Assistant</h2>
        <p className="text-sm text-muted-foreground mt-1">Query your financial data using natural language</p>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => setInput(s)}
            className="px-3 py-1.5 rounded-md border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 animate-professional whitespace-nowrap">
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-card rounded-lg border border-border p-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Bot size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ask questions about your audit data</p>
          </div>
        )}
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot size={14} className="text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface border border-border text-foreground'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <User size={14} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <Bot size={14} className="text-primary-foreground" />
            </div>
            <div className="bg-surface border border-border shadow-sm rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">AI Analyzing</span>
              <div className="flex gap-1.5 items-center justify-center pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gentle" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gentle" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gentle" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask the AI about your financial data..."
          className="flex-1 h-10 rounded-md border border-border bg-card px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="h-10 w-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:opacity-90 animate-professional"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
