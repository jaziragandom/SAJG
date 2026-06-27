import React from "react";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <div className="grow">
        {children}
      </div>
    </div>
  );
}