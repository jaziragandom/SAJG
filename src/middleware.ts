import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

// ۱. ساخت هسته اصلی تغییر زبان
const intlMiddleware = createMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // ۲. دریافت کد کشور کاربر (این قابلیت روی سرورهای واقعی مثل Vercel فعال می‌شود)
  const country = request.headers.get('x-vercel-ip-country');
  
  // ۳. لیست کدهای ISO برای کشورهای فارسی‌زبان (ایران، افغانستان، تاجیکستان)
  const persianCountries = ['IR', 'AF', 'TJ'];

  // ۴. منطق مسیریابی هوشمند
  if (country) {
    if (persianCountries.includes(country)) {
      // اگر از کشورهای فارسی‌زبان بود، به مرورگر می‌گوییم اولویت ۱۰۰٪ با زبان فارسی است
      request.headers.set('accept-language', 'fa-IR,fa;q=0.9');
    } else {
      // اگر از هر جای دیگر دنیا بود، اولویت را به انگلیسی تغییر می‌دهیم
      request.headers.set('accept-language', 'en-US,en;q=0.9');
    }
  }

  // ۵. پاس دادن درخواست دستکاری شده به موتور next-intl
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(fa|en)/:path*']
};