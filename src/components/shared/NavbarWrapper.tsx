import React from 'react';
import Navbar from './Navbar';
import { getNavbarData } from '@/actions/navbar';

export default async function NavbarWrapper() {
  // دریافت اطلاعات زنده از دیتابیس در سمت سرور
  const navbarResponse = await getNavbarData();
  const { brands = [], categories = [], siteLogo = null } = navbarResponse.data || {};

  // ارسال اطلاعات به کامپوننت کلاینت‌ساید ناوبار
  return <Navbar brands={brands} categories={categories} siteLogo={siteLogo} />;
}