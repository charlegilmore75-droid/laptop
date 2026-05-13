'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, User } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface Conversation {
  id: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  user: { name?: string | null; email: string; avatar?: string | null };
  messages: Array<{ id: string; content?: string | null; isFromAdmin: boolean; createdAt: string }>;
}

export default function AdminMessagesClient({ conversations: initial, adminId, locale }: { conversations: Conversation[]; adminId: string; locale: string }) {
  const isRTL = locale === 'ar';
  const [conversations] = useState(initial);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Conversation['messages']>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/chat?conversationId=${selected.id}`)
      .then((r) => r.json())
      .then((d) => d.conversation?.messages && setMessages(d.conversation.messages))
      .catch(() => {});
  }, [selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !selected) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const optimistic = { id: Date.now().toString(), content: text, isFromAdmin: true, createdAt: new Date().toISOString() };
    setMessages((p) => [...p, optimistic]);
    try {
      await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: selected.id, content: text }) });
    } finally { setSending(false); }
  };

  return (
    <div className="flex gap-0 bg-card border border-border rounded-2xl overflow-hidden h-[calc(100vh-10rem)]">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-e border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-foreground">{isRTL ? 'المحادثات' : 'Conversations'}</h2>
          <p className="text-xs text-muted-foreground">{conversations.length} {isRTL ? 'محادثة' : 'conversations'}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              {isRTL ? 'لا توجد محادثات' : 'No conversations'}
            </div>
          ) : conversations.map((conv) => (
            <button key={conv.id} onClick={() => { setSelected(conv); setMessages([]); }} className={cn('w-full text-start p-4 border-b border-border hover:bg-accent/50 transition-colors', selected?.id === conv.id && 'bg-primary/10 border-s-2 border-s-primary')}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {conv.user.name?.[0]?.toUpperCase() || conv.user.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm line-clamp-1">{conv.user.name || conv.user.email}</p>
                  {conv.lastMessage && <p className="text-xs text-muted-foreground line-clamp-1">{conv.lastMessage}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground text-sm">{selected.user.name || selected.user.email}</p>
              <p className="text-xs text-muted-foreground">{selected.user.email}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex', msg.isFromAdmin ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-xs rounded-2xl px-4 py-2.5', msg.isFromAdmin ? 'bg-primary text-primary-foreground rounded-se-none' : 'bg-secondary text-foreground rounded-ss-none')}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={cn('text-xs mt-1', msg.isFromAdmin ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{formatDate(msg.createdAt, locale)}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()} placeholder={isRTL ? 'اكتب رداً...' : 'Type a reply...'} className="flex-1 border border-border rounded-xl px-4 py-2.5 bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={send} disabled={!input.trim() || sending} className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>{isRTL ? 'اختر محادثة للرد' : 'Select a conversation to reply'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
