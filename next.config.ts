import createNextIntlPlugin from 'next-intl/plugin';

// آدرس فایل i18n
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // معرفی دامنه سایت برای جلوگیری از بلاک شدن لاگین توسط Next.js
      allowedOrigins: ['jazirahgandumco.com', 'www.jazirahgandumco.com']
    }
  }
};

export default withNextIntl(nextConfig);