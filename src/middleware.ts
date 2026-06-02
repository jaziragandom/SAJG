import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ۱. ساخت هسته اصلی تغییر زبان
const intlMiddleware = createMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'always'
});

const JWT_SECRET_KEY = process.env.JWT_SECRET || "Gandom_Island_Super_Secure_Key_2026_!@#";
const encodedKey = new TextEncoder().encode(JWT_SECRET_KEY);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- لایه امنیتی پنل ادمین ---
  const isAdminRoute = pathname.includes('/admin') && !pathname.includes('/admin/login');

  if (isAdminRoute) {
    const token = request.cookies.get('admin_token')?.value;
    const locale = pathname.split('/')[1] || 'fa'; 

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin/login`;
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(token, encodedKey);
    } catch (error) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin/login`;
      return NextResponse.redirect(url);
    }
  }
  // ------------------------------

  // ۲. دریافت کد کشور کاربر
  const country = request.headers.get('x-vercel-ip-country');
  const persianCountries = ['IR', 'AF', 'TJ'];

  if (country) {
    if (persianCountries.includes(country)) {
      request.headers.set('accept-language', 'fa-IR,fa;q=0.9');
    } else {
      request.headers.set('accept-language', 'en-US,en;q=0.9');
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(fa|en)/:path*']
};