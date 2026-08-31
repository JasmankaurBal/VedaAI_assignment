'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      ),
    },
    {
      name: 'My Classroom',
      href: '#',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 18V8.5A2.5 2.5 0 0 1 6.5 6H9l2 2h6.5A2.5 2.5 0 0 1 20 10.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
        </svg>
      ),
    },
    {
      name: 'Assignments',
      href: '#',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 4.75A2.75 2.75 0 0 1 9.75 2h4.5A2.75 2.75 0 0 1 17 4.75V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6.75A2.75 2.75 0 0 1 7 4.75ZM9 7h6M9 11h6M9 15h3" />
        </svg>
      ),
    },
    {
      name: 'Exams',
      href: '/',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 3.75A2.75 2.75 0 0 1 9.75 1h4.5A2.75 2.75 0 0 1 17 3.75V5h1.75A2.75 2.75 0 0 1 21.5 7.75v10.5A2.75 2.75 0 0 1 18.75 21H5.25A2.75 2.75 0 0 1 2.5 18.25V7.75A2.75 2.75 0 0 1 5.25 5H7V3.75Zm2 1.25h6M7 9h10M7 13h10M7 17h6" />
        </svg>
      ),
    },
    {
      name: 'Question Papers',
      href: '#',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 4.5A2.5 2.5 0 0 1 9.5 2H16a2 2 0 0 1 2 2v12.5A2.5 2.5 0 0 1 15.5 19H9.5A2.5 2.5 0 0 1 7 16.5V4.5ZM9.5 7.5h5M9.5 11.5h5M9.5 15.5h3" />
        </svg>
      ),
    },
    {
      name: 'My Library',
      href: '#',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 6.5A2.5 2.5 0 0 1 7.5 4H18a2 2 0 0 1 2 2v10.5A2.5 2.5 0 0 1 17.5 19H7.5A2.5 2.5 0 0 1 5 16.5V6.5Zm3 0h8M8 10h8M8 14h6" />
        </svg>
      ),
    },
  ];

  return (
    <aside className={`${className} ${collapsed ? 'w-[72px]' : 'w-[260px]'} flex h-[calc(100vh-2rem)] shrink-0 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out`}>
      <div className="flex w-full flex-col">
        <div className={`flex items-center justify-between border-b border-slate-200 px-4 ${collapsed ? 'py-3' : 'py-4'}`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#111827] text-[11px] font-bold text-white shadow-sm">V</div>
            {!collapsed && <span className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900">VedaAI</span>}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        <div className="px-4 py-4">
          <button
            type="button"
            className={`flex w-full items-center justify-center gap-2 rounded-full border border-[#f2a785] bg-[#171717] px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-105 ${collapsed ? 'px-2' : ''}`}
          >
            <span className="text-base">✦</span>
            {!collapsed && <span>AI Teacher&apos;s Toolkit</span>}
          </button>
        </div>

        <nav className="flex-1 px-3 py-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.name === 'Exams' && pathname === '/');
              return (
                <li key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
                      isActive
                        ? 'bg-[#f3f4f6] text-slate-900'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 pb-3 pt-1">
          <div className={`flex items-center gap-3 rounded-2xl bg-[#f5f5f4] p-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7e5e4] text-lg shadow-inner">🏫</div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-slate-800">Delhi Public School</div>
                <div className="text-[12px] text-slate-500">Bokaro Steel City</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
