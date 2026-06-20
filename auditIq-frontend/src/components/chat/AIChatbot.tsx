import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useAuditStore } from '@/store/audit-store';
import type { ChatMessage } from '@/lib/types';

const SUGGESTIONS = [
  'Show high-value transactions above ₹5L',
  'Which vendors have the highest fraud risk?',
  'List round-number transactions',
  'How many weekend postings were detected?',
  'Summarize the overall risk profile',
];

export const AIChatbot = () => {
  const { chatMessages, addChatMessage, flaggedTransactions, transactions, vendors, metrics } = useAuditStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('high value') || q.includes('high-value') || q.includes('above') || q.includes('5l') || q.includes('500000')) {
      const highVal = flaggedTransactions.filter(f => f.amount > 500000);
      return `Found **${highVal.length}** high-value transactions exceeding ₹5,00,000.\n\n${highVal.slice(0, 5).map(t =>
        `- **${t.transaction_id}** | ${t.vendor_name} | ₹${t.amount.toLocaleString('en-IN')} | Risk: ${t.risk_tier}`
      ).join('\n')}\n\n${highVal.length > 5 ? `*...and ${highVal.length - 5} more*` : ''}`;
    }

    if (q.includes('vendor') && (q.includes('risk') || q.includes('fraud'))) {
      const risky = [...vendors].sort((a, b) => b.vendor_risk_score - a.vendor_risk_score).slice(0, 5);
      return `**Top 5 High-Risk Vendors:**\n\n${risky.map((v, i) =>
        `${i + 1}. **${v.vendor_name}** — Risk Score: ${v.vendor_risk_score}/100 | ${v.fraud_count} flags | ₹${v.total_amount.toLocaleString('en-IN')} total`
      ).join('\n')}`;
    }

    if (q.includes('round') || q.includes('round number')) {
      const round = flaggedTransactions.filter(f => f.flags.some(fl => fl.category === 'Round Number'));
      return `Detected **${round.length}** round-number transactions.\n\nThese are amounts that are exact multiples of ₹1,000, which may indicate manufactured or estimated entries rather than legitimate business transactions.\n\n${round.slice(0, 5).map(t =>
        `- **${t.transaction_id}** | ₹${t.amount.toLocaleString('en-IN')} | ${t.vendor_name}`
      ).join('\n')}`;
    }

    if (q.includes('weekend')) {
      const weekend = flaggedTransactions.filter(f => f.flags.some(fl => fl.category === 'Weekend Posting'));
      return `Found **${weekend.length}** transactions posted on weekends.\n\nWeekend postings are flagged because they deviate from standard business operating hours, potentially indicating unauthorized or after-hours activity.\n\n${weekend.slice(0, 5).map(t =>
        `- **${t.transaction_id}** | ${t.date} | ₹${t.amount.toLocaleString('en-IN')}`
      ).join('\n')}`;
    }

    if (q.includes('summary') || q.includes('summarize') || q.includes('overview') || q.includes('risk profile')) {
      if (!metrics) return 'No data loaded yet. Please upload a dataset first.';
      return `**Audit Risk Profile Summary**\n\n- **Total Transactions:** ${metrics.total_transactions.toLocaleString()}\n- **Flagged Exceptions:** ${metrics.flagged_count} (${((metrics.flagged_count / metrics.total_transactions) * 100).toFixed(1)}%)\n- **Average Risk Score:** ${metrics.avg_risk_score}/100\n- **High-Risk Vendors:** ${metrics.high_risk_vendors}\n- **Total Fraud Amount:** ₹${metrics.total_fraud_amount.toLocaleString('en-IN')}\n\nThe system identified anomalies across duplicate invoices, round-number entries, weekend postings, and high-value threshold breaches.`;
    }

    if (q.includes('txn') || q.includes('why') || q.includes('flagged')) {
      const match = q.match(/txn[-\s]?(\d+)/i);
      if (match) {
        const txn = flaggedTransactions.find(f => f.transaction_id.includes(match[1]));
        if (txn) return `**${txn.transaction_id}** — Risk Score: ${txn.risk_score}/100 (${txn.risk_tier})\n\n${txn.ai_explanation}`;
      }
    }

    return `I analyzed your query against the loaded dataset of ${transactions.length} transactions.\n\nCould you try one of these queries?\n${SUGGESTIONS.map(s => `- "${s}"`).join('\n')}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content: input, timestamp: new Date() };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // Add a realistic randomized delay to simulate complex AI reasoning
    const thinkTime = Math.floor(Math.random() * 1500) + 1500; // 1.5s to 3.0s delay
    await new Promise(r => setTimeout(r, thinkTime));

    const response = generateResponse(input);
    const assistantMsg: ChatMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant', content: response, timestamp: new Date() };
    addChatMessage(assistantMsg);
    setIsTyping(false);
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
