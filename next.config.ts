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
      }
    ],
  }
};

export default withNextIntl(nextConfig);