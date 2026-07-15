import React from "react";
import { motion } from "framer-motion";
import { Bot, X, Send, ShoppingBag } from "lucide-react";

// اضافه کردن isRtl به پروپ‌های اسلایدر برای دوزبانه شدن متون
const MiniProductSlider = ({ router, locale, setIsChatOpen, isRtl }: { router: any, locale: string, setIsChatOpen: any, isRtl: boolean }) => (
  <div className="w-full overflow-x-auto flex gap-3 pb-2 custom-scrollbar mt-2">
    {[1, 2, 3].map((item) => (
      <div key={item} className="shrink-0 w-32 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
        <div className="h-20 bg-amber-100/50 dark:bg-zinc-900/50 flex items-center justify-center">
           <ShoppingBag size={24} className="text-amber-500/50" />
        </div>
        <div className="p-2">
          {/* دوزبانه شدن عنوان محصول */}
          <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">
            {isRtl ? `محصول ویژه ${item}` : `Featured Product ${item}`}
          </p>
          <button 
            onClick={() => {
              router.push(`/${locale}/products`);
              setIsChatOpen(false);
            }}
            className="mt-1.5 w-full bg-amber-500/90 hover:bg-amber-400 transition-colors text-zinc-950 text-[10px] font-bold py-1 rounded-lg"
          >
            {/* دوزبانه شدن متن دکمه */}
            {isRtl ? 'مشاهده صفحه' : 'View Page'}
          </button>
        </div>
      </div>
    ))}
  </div>
);

interface ChatWindowProps {
  isChatOpen: boolean; 
  setIsChatOpen: (val: boolean) => void;
  messages: any[]; 
  input: string; 
  setInput: (val: string) => void;
  handleSend: (e: React.FormEvent) => void; 
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<any>; 
  isRtl: boolean; 
  router: any; 
  locale: string;
}

export default function ChatWindow({
  isChatOpen, setIsChatOpen, messages, input, setInput,
  handleSend, isTyping, messagesEndRef, inputRef, isRtl, router, locale
}: ChatWindowProps) {
  
  if (!isChatOpen) return null;

  const handleSystemAction = (actionType: string) => {
    if (actionType === 'THEME_DARK') document.documentElement.classList.add('dark');
    if (actionType === 'THEME_LIGHT') document.documentElement.classList.remove('dark');
  };

  const renderMessageContent = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(/(\[UI:SLIDER\]|\[ACTION:[A-Z_]+\]|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, index) => {
      if (part === '[UI:SLIDER]') {
        return <MiniProductSlider key={index} router={router} locale={locale} setIsChatOpen={setIsChatOpen} isRtl={isRtl} />;
      }
      
      const actionMatch = part.match(/\[ACTION:([A-Z_]+)\]/);
      if (actionMatch) {
        return (
          <button
            key={index}
            onClick={() => handleSystemAction(actionMatch[1])}
            className="inline-flex items-center mx-1 my-1 px-3 py-1.5 rounded-xl bg-zinc-900/10 dark:bg-white/10 backdrop-blur-sm text-zinc-800 dark:text-zinc-200 hover:scale-105 transition-all text-xs font-bold border border-zinc-300 dark:border-zinc-700"
          >
            {/* دوزبانه شدن دکمه‌های سیستمی */}
            ⚡ {isRtl ? 'اعمال تنظیمات' : 'Apply Action'} ({actionMatch[1]})
          </button>
        );
      }
      
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [_, label, target] = linkMatch;
        return (
          <button
            key={index}
            onClick={() => {
              if (target === 'retry') {
                const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
                if (lastUserMsg) {
                  setInput(lastUserMsg.text);
                  setTimeout(() => handleSend({ preventDefault: () => {} } as React.FormEvent), 100);
                }
              } else if (target.startsWith('http')) {
                window.open(target, '_blank');
              } else {
                let cleanTarget = target.trim().replace(/['"]/g, '');
                if (!cleanTarget.startsWith('/')) cleanTarget = '/' + cleanTarget;
                
                const urlObj = new URL(cleanTarget, 'http://localhost');
                let path = urlObj.pathname;
                
                if (path.startsWith('/fa/')) path = path.replace('/fa', '');
                else if (path === '/fa') path = '';
                else if (path.startsWith('/en/')) path = path.replace('/en', '');
                else if (path === '/en') path = '';
                
                const finalPath = `/${locale}${path}${urlObj.search}${urlObj.hash}`;
                
                router.push(finalPath);
                setIsChatOpen(false);
              }
            }}
            className="inline-flex items-center gap-1 mx-1 my-1 px-3 py-1.5 rounded-full bg-amber-500/10 backdrop-blur-sm text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:text-zinc-900 transition-all text-xs font-bold border border-amber-500/30 cursor-pointer shadow-sm"
          >
            {label} ↗
          </button>
        );
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      exit={{ opacity: 0, y: 20, scale: 0.95 }} 
      transition={{ duration: 0.2 }}
      className="pointer-events-auto w-80 md:w-96 h-[calc(100vh-120px)] max-h-200 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-2"
    >
      <div className="bg-linear-to-r from-amber-500 to-orange-600 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><Bot size={20} /></div>
          <div>
            <h4 className="font-bold text-sm drop-shadow-sm">Jazirah Gandum AI</h4>
            <div className="flex items-center gap-1.5 opacity-90 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              {/* دوزبانه شدن وضعیت آنلاین */}
              <span className="text-[10px] font-medium">{isRtl ? 'آنلاین' : 'Online'}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsChatOpen(false)} className="hover:text-white/80 transition-colors"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/30 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div dir="auto" className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-7 shadow-sm text-left whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-amber-500 text-zinc-950 rounded-br-none' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-bl-none'}`}>
              {msg.sender === 'bot' ? renderMessageContent(msg.text) : msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-zinc-100 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0">
        <div className="relative flex items-center gap-2">
          <textarea 
            ref={inputRef} 
            dir="auto" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isTyping) {
                  handleSend(e as unknown as React.FormEvent);
                }
              }
            }}
            rows={1}
            placeholder={isRtl ? "پیام خود را بنویسید..." : "Type a message..."} 
            className="flex-1 pl-4 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-transparent resize-none overflow-hidden h-11.5 leading-5.5 custom-scrollbar" 
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-500 text-zinc-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"><Send size={16} className={isRtl ? "rotate-180" : ""} /></button>
        </div>
      </form>
    </motion.div>
  );
}