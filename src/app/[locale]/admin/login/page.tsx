"use client";
import { useLocale } from "next-intl";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, Mail, Eye, EyeOff, ArrowRight, Wheat, Calculator, RefreshCcw } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // استیت‌های مربوط به کپچا
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // تولید اعداد تصادفی برای کپچا در زمان لود صفحه
  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // ۱. بررسی کپچا
    if (parseInt(captchaInput) !== num1 + num2) {
      setTimeout(() => {
        setIsLoading(false);
        setError("پاسخ کپچا نادرست است. لطفاً دوباره تلاش کنید.");
        generateCaptcha(); // تغییر کپچا بعد از اشتباه
      }, 500);
      return;
    }

    // ۲. شبیه‌ساز بررسی امنیتی (ایمیل و رمز عبور)
    setTimeout(() => {
      if (email === "admin@gandom.com" && password === "admin123") {
        
        // نکته: منطق وریفای ایمیل (Two-Factor Auth) در آینده اینجا قرار می‌گیرد.
        // فعلاً مستقیماً کلید صادر کرده و وارد می‌شویم:
        
        sessionStorage.setItem("isJazirehAdmin", "true"); 
        router.push(`/${locale}/admin`); 
      } else {
        setIsLoading(false);
        setError("اطلاعات ورود نادرست است. دسترسی رد شد.");
        generateCaptcha();
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center relative overflow-hidden select-none" dir="rtl">
      
      {/* ذرات نوری و تکه‌های معلق لوکس در پس‌زمینه */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[15%] left-[15%] w-12 h-12 bg-amber-500/10 rounded-full blur-xs" />
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[20%] right-[15%] w-16 h-16 bg-red-500/10 rounded-xl blur-xs" />
      </div>

      {/* باکس اصلی لاگین با انیمیشن ورود از بالا و لرزش در صورت خطا */}
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={error ? { x: [-10, 10, -10, 10, 0], y: 0, opacity: 1, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={error ? { duration: 0.4, ease: "easeInOut" } : { type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 mx-4"
      >
        {/* هدر سربرگ لاگین */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
            className="w-16 h-16 bg-amber-400 text-gray-950 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-amber-400/20"
          >
            <Wheat size={32} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-2xl font-black text-white tracking-tight">احراز هویت مدیران</h1>
          <p className="text-xs text-gray-400 mt-2 font-medium">پورتال دسترسی امن به لایه مدیریت</p>
        </div>

        {/* فرم دریافت اطلاعات */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-300 pr-1">پست الکترونیک امنیتی</label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@domain.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-sm text-white focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all font-medium ltr text-right"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-300 pr-1">رمز عبور سیستم</label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pr-12 pl-12 text-sm text-white focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all font-mono ltr text-right"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* فیلد کپچای امنیتی */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-300 pr-1">تاییدیه امنیتی (کپچا)</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Calculator size={18} />
                </span>
                <input
                  type="number"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="حاصل جمع؟"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-sm text-white focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all font-medium text-right"
                />
              </div>
              <div className="h-12.5 px-4 bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-lg font-mono font-bold text-amber-400 tracking-widest shrink-0">
                <span>{num1} + {num2}</span>
                <button type="button" onClick={generateCaptcha} className="text-gray-500 hover:text-white transition-colors" title="تغییر کپچا">
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* نمایش پیام خطا با افکت انیمیشنی نرم */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 flex items-start gap-3 text-xs font-bold leading-relaxed overflow-hidden"
              >
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* دکمه ارسال با شبیه‌ساز لودینگ */}
          <button
            type="submit"
            disabled={isLoading || !captchaInput}
            className="w-full py-4 mt-2 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/30 disabled:text-gray-900/50 text-gray-950 font-black rounded-xl transition-all duration-300 shadow-xl shadow-amber-400/10 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>ورود به سیستم امن</span>
                <ArrowRight size={16} className="transform rotate-180 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-4">
          <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">Secure Shield v1.5 | Jazirah Gandom</span>
        </div>
      </motion.div>
    </div>
  );
}