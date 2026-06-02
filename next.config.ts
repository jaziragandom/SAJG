import createNextIntlPlugin from 'next-intl/plugin';

// آدرس فایل i18n که در قدم قبل ساختیم را اینجا می‌دهیم
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // تنظیمات دیگر شما (اگر دارید) اینجا قرار می‌گیرد
};

export default withNextIntl(nextConfig);