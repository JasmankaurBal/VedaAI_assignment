"use client";

import { useState } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm flex items-center justify-between h-16 px-4 lg:px-8">
      {/* Left side: hamburger for mobile and branding */}
      <div className="flex items-center space-x-3">
        <button
          className="lg:hidden p-2 rounded hover:bg-gray-100"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-1 text-[#FF5522]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
          </svg>
          Exams
        </span>
      </div>

      {/* Right side utilities */}
      <div className="flex items-center space-x-4">
        {/* Help icon */}
        <button className="p-2 rounded hover:bg-gray-100 text-gray-600" aria-label="Help">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h4M8 13h4M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        {/* Notification bell with orange dot */}
        <button className="relative p-2 rounded hover:bg-gray-100 text-gray-600" aria-label="Notifications">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-[#FF5522] ring-2 ring-white" />
        </button>
        {/* AI Toolkit shortcut */}
        <button className="p-2 rounded hover:bg-gray-100 text-gray-600" aria-label="AI Toolkit">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
          </svg>
        </button>
        {/* Avatar with dropdown */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100"
            onClick={() => setAvatarOpen(!avatarOpen)}
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-white">
              MR
            </div>
            <span className="hidden sm:inline-block text-gray-800 font-medium">Madhur Rastogi</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {avatarOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg py-1">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
