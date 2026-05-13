'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, Loader2, MessageCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content?: string | null;
  imageUrl?: string | null;
  isFromAdmin: boolean;
  createdAt: string;
}

export default function ChatWindow({ locale }: { locale: string }) {
  const isRTL = locale === 'ar';
  const [conversation, setConversation] = useState<{ id: string; messages: Message[] } | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/chat')
      .then((r) => r.json())
      .then((data) => {
        setConversation(data.conversation);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const sendMessage = async () => {
    if (!message.trim() || !conversation) return;
    const text = message.trim();
    setMessage('');
    setSending(true);

    const optimistic: Message = {
      id: Date.now().toString(),
      content: text,
      isFromAdmin: false,
      createdAt: new Date().toISOString(),
    };
    setConversation((prev) => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id, content: text }),
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-border bg-gradient-to-r from-primary to-blue-400">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">{isRTL ? 'دعم LaptopStore' : 'LaptopStore Support'}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="text-white/70 text-xs">{isRTL ? 'متصل' : 'Online'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!conversation?.messages.length && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isRTL ? 'ابدأ محادثة مع فريق الدعم' : 'Start a conversation with our support team'}</p>
          </div>
        )}
        {conversation?.messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className={cn('flex', msg.isFromAdmin ? 'justify-start' : 'justify-end')}
          >
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3 space-y-1',
                msg.isFromAdmin
                  ? 'bg-secondary text-foreground rounded-ss-none'
                  : 'bg-primary text-primary-foreground rounded-se-none'
              )}
            >
              {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
              <p className={cn('text-xs', msg.isFromAdmin ? 'text-muted-foreground' : 'text-primary-foreground/60')}>
                {formatDate(msg.createdAt, locale)}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
            className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            className="w-11 h-11 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
