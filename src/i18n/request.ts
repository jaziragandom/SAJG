import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export default getRequestConfig(async (context) => {
  // ۱. حل مشکل بزرگ Next.js 15: پارامتر زبان باید حتماً await شود!
  let currentLocale = context.locale;
  if (context.requestLocale) {
    currentLocale = await context.requestLocale;
  }

  const validLocale = currentLocale || 'fa';

  if (!['fa', 'en'].includes(validLocale)) notFound();

  // ۲. وارد کردن مستقیم و ایمن فایل‌ها (برای جلوگیری از باگ Turbopack)
  let userMessages;
  if (validLocale === 'en') {
    // خواندن فایل انگلیسی
    const enFile = await import('../messages/en.json');
    userMessages = enFile.default || enFile;
  } else {
    // خواندن فایل فارسی
    const faFile = await import('../messages/fa.json');
    userMessages = faFile.default || faFile;
  }

  return {
    locale: validLocale,
    messages: userMessages
  };
});