"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AnimatePresence } from "framer-motion";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex bg-slate-100/50 min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-5">
        <img
          src="/escola-ibira-app/assets/theme/plants.png"
          alt=""
          className="absolute -top-20 -left-20 w-80 h-80 rotate-12"
        />
        <img
          src="/escola-ibira-app/assets/theme/plants.png"
          alt=""
          className="absolute -bottom-20 -right-20 w-96 h-96 -rotate-12"
        />
        <img
          src="/escola-ibira-app/assets/theme/happy-child.png"
          alt=""
          className="absolute top-1/2 -right-10 w-48 h-48 -translate-y-1/2 opacity-20"
        />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative z-10">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
    </div>
  );
}
