"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToast({ message, type, id });
    
    // پاپ‌آپ بعد از ۴ ثانیه خودکار محو می‌شود
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border pointer-events-auto ${
                toast.type === "success" ? "bg-emerald-50/80 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400" :
                toast.type === "error" ? "bg-red-50/80 dark:bg-red-950/80 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400" :
                toast.type === "warning" ? "bg-amber-50/80 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400" :
                "bg-blue-50/80 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400"
              }`}
              dir="rtl"
            >
              <div className="shrink-0">
                {toast.type === "success" && <CheckCircle2 size={24} />}
                {toast.type === "error" && <AlertTriangle size={24} />}
                {toast.type === "warning" && <AlertTriangle size={24} />}
                {toast.type === "info" && <Info size={24} />}
              </div>
              
              <p className="text-sm font-bold flex-1 leading-relaxed">
                {toast.message}
              </p>

              <button 
                onClick={() => setToast(null)}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};