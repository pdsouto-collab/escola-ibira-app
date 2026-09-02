"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AnimatePresence } from "framer-motion";
import { ChatNotificationProvider } from "@/components/chat/chat-notification-provider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChatNotificationProvider>
      <div id="main-app-container" className="flex bg-slate-100/50 min-h-screen">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </div>
    </ChatNotificationProvider>
  );
}
