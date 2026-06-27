import React from "react";

export const metadata = {
  title: "مجله گندم - اخبار و مقالات",
  description: "داستان‌ها، اخبار و مقالات تخصصی از دنیای نوشیدنی‌ها و سبک زندگی سالم در مجله اختصاصی جزیره گندم.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-transparent relative overflow-x-hidden">
      {/* فضای محتوای مقالات وبلاگ */}
      <div className="grow w-full relative">
        {children}
      </div>
    </div>
  );
}