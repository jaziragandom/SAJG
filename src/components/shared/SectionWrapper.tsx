"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function SectionWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.section
      /* شروع از پایین‌تر برای ایجاد حس ورود لایه‌ای */
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      /* مقدار 0.1 باعث می‌شود به محض ورود لبه سکشن، انیمیشن نرم شروع شود */
      viewport={{ once: false, amount: 0.1 }}
      /* 🪄 معجون جادویی برای حرکت نرم: */
      transition={{ 
        type: "spring", 
        stiffness: 30,  // کمتر کردن این عدد حرکت را "آهسته‌تر" و "رویایی‌تر" می‌کند
        damping: 18,    // جلوگیری از لرزش اضافی در انتهای حرکت
        mass: 0.8,      // سبک‌تر کردن لایه برای شروع سریع‌تر
        restDelta: 0.001
      }}
      className="w-full min-h-screen relative flex flex-col justify-center overflow-hidden"
    >
      {children}
    </motion.section>
  );
}