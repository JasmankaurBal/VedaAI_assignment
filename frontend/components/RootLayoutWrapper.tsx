"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

interface WrapperProps {
  children: React.ReactNode;
}

export default function RootLayoutWrapper({ children }: WrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen w-full bg-[#f5f3f0]">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/10 md:hidden" onClick={toggleSidebar} />
      )}

      <Sidebar
        className={
          sidebarOpen
            ? 'fixed inset-y-3 left-3 z-50 md:hidden'
            : 'hidden md:flex'
        }
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
