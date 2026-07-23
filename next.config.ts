import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// آدرس فایل i18n
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // معرفی دامنه سایت برای جلوگیری از بلاک شدن لاگین توسط Next.js
      allowedOrigins: ['jazirahgandumco.com', 'www.jazirahgandumco.com']
    }
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // اجازه پردازش فرمت SVG برای سایت‌هایی مثل placehold.co
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jazirahgandumco.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.jazirahgandumco.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // اضافه شدن اجازه دسترسی به عکس‌های تستی
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      }
    ],
  }
};

export default withNextIntl(nextConfig);