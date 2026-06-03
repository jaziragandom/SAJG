import React from "react";
import { motion } from "framer-motion";
import { Bot, X, Send, ShoppingBag } from "lucide-react";

const MiniProductSlider = ({ router, locale, setIsChatOpen }: { router: any, locale: string, setIsChatOpen: any }) => (
  <div className="w-full overflow-x-auto flex gap-3 pb-2 custom-scrollbar mt-2">
    {[1, 2, 3].map((item) => (
      <div key={item} className="shrink-0 w-32 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
        <div className="h-20 bg-amber-100 dark:bg-zinc-900 flex items-center justify-center">
           <ShoppingBag size={24} className="text-amber-500/50" />
        </div>
        <div className="p-2">
          <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">محصول ویژه {item}</p>
          <button 
            onClick={() => {
              router.push(`/${locale}/products`);
              setIsChatOpen(false);
            }}
            className="mt-1.5 w-full bg-amber-500 hover:bg-amber-400 transition-colors text-zinc-950 text-[10px] font-bold py-1 rounded-lg"
          >
            مشاهده صفحه
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
  inputRef: React.RefObject<HTMLInputElement | null>;
  isRtl: boolean; 
  router: any; 
  locale: string;
}

export default function ChatWindow({
  isChatOpen, setIsChatOpen, messages, input, setInput,
  handleSend, isTyping, messagesEndRef, inputRef, isRtl, router, locale
}: ChatWindowProps) {
  
  if (!isChatOpen) return null;

  const renderMessageContent = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(/(\[UI:SLIDER\]|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, index) => {
      if (part === '[UI:SLIDER]') {
        return <MiniProductSlider key={index} router={router} locale={locale} setIsChatOpen={setIsChatOpen} />;
      }
      
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [_, label, target] = match;
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
                // حفظ ایمن فیلترها (کوئری استرینگ‌ها) با استفاده از کلاس استاندارد URL
                let finalPath = target;
                if (target.startsWith('/')) {
                  const urlObj = new URL(target, 'http://localhost');
                  finalPath = `/${locale}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
                }
                router.push(finalPath);
                setIsChatOpen(false);
              }
            }}
            className="inline-flex items-center gap-1 mx-1 my-1 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:text-zinc-900 transition-all text-xs font-bold border border-amber-500/30 cursor-pointer"
          >
            {label} ↗
          </button>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      exit={{ opacity: 0, y: 20, scale: 0.95 }} 
      transition={{ duration: 0.2 }}
      // ارتفاع داینامیک تا زیر ناوبار: h-[calc(100vh-120px)]
      className="pointer-events-auto w-80 md:w-96 h-[calc(100vh-120px)] max-h-200 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-2"
    >
      <div className="bg-linear-to-r from-amber-500 to-orange-600 p-4 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><Bot size={20} /></div>
          <div>
            <h4 className="font-bold text-sm">JaziraGandum AI</h4>
            <div className="flex items-center gap-1.5 opacity-90 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span><span className="text-[10px] font-medium">Online</span></div>
          </div>
        </div>
        <button onClick={() => setIsChatOpen(false)} className="hover:text-white/80 transition-colors"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/30 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div dir="auto" className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-7 shadow-sm text-left ${msg.sender === 'user' ? 'bg-amber-500 text-zinc-950 rounded-br-none' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-bl-none'}`}>
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

      <form onSubmit={handleSend} className="p-3 border-t border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 shrink-0">
        <div className="relative flex items-center gap-2">
          <input ref={inputRef} dir="auto" type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={isRtl ? "پیام خود را بنویسید..." : "Type a message..."} className="flex-1 pl-4 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-transparent" />
          <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-500 text-zinc-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"><Send size={16} className={isRtl ? "rotate-180" : ""} /></button>
        </div>
      </form>
    </motion.div>
  );
}