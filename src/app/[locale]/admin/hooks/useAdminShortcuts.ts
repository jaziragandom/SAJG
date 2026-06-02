"use client";
import { useEffect } from "react";

interface ShortcutProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  tabsList?: string[];
  closeModal?: () => void;
  onAddNew?: () => void;
}

export function useAdminShortcuts({ activeTab, setActiveTab, tabsList, closeModal, onAddNew }: ShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // پیدا کردن المنتی که در حال حاضر کیبورد روی آن فوکوس است (با تب کردن به آن رسیده‌ایم)
      const activeEl = document.activeElement as HTMLElement;

      // ۱. شورت‌کات Alt + N برای افزودن جدید
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (onAddNew) onAddNew();
        return;
      }

      // ۲. شورت‌کات Escape برای بستن پاپ‌آپ‌ها
      if (e.key === 'Escape') {
        if (closeModal) closeModal();
        return;
      }

      // ۳. شورت‌کات تب بعدی (Ctrl + ArrowLeft)
      if (e.ctrlKey && e.key === 'ArrowLeft' && activeTab && setActiveTab && tabsList) {
        e.preventDefault();
        const currIdx = tabsList.indexOf(activeTab);
        const nextIdx = (currIdx + 1) % tabsList.length;
        setActiveTab(tabsList[nextIdx]);
        return;
      }

      // ۴. شورت‌کات تب قبلی (Ctrl + ArrowRight)
      if (e.ctrlKey && e.key === 'ArrowRight' && activeTab && setActiveTab && tabsList) {
        e.preventDefault();
        const currIdx = tabsList.indexOf(activeTab);
        const prevIdx = (currIdx - 1 + tabsList.length) % tabsList.length;
        setActiveTab(tabsList[prevIdx]);
        return;
      }

      // ۵. استانداردسازی حرفه‌ایِ فرم‌ها (باز شدن دراپ‌داون‌ها با Enter یا Space)
      if ((e.key === 'Enter' || e.key === ' ') && activeEl) {
        // اگر فیلدی که رویش هستیم یک دراپ‌داون (select) است
        if (activeEl.tagName.toLowerCase() === 'select') {
          e.preventDefault(); // جلوگیری از ثبت ناخواسته فرم
          try {
            // متد مدرن جاوااسکریپت برای باز کردن فیزیکیِ منوی کشویی
            (activeEl as HTMLSelectElement).showPicker();
          } catch (err) {
            // مرورگرهای بسیار قدیمی که از این متد پشتیبانی نمی‌کنند
            // به صورت خودکار با زدن اسپیس یا جهت‌پایین باز می‌شوند
            console.log("Native dropdown fallback");
          }
        }
        
        // نکته: اگر روی دکمه‌ای مثل "محصول ویژه" باشیم، 
        // مرورگر خودش با زدن Space یا Enter آن را کلیک (تیک‌دار) می‌کند و نیازی به کد اضافه نیست.
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, setActiveTab, tabsList, closeModal, onAddNew]);
}