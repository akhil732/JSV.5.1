import React from 'react';
import { Search, Moon, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
          RVA
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">RVA</span>
          <span className="text-gray-500 font-medium text-sm">RVA Software</span>
        </div>
      </div>

      {/* Right Utility Group */}
      <div className="flex items-center space-x-3">
        {/* Search Input */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search..."
            className="w-48 md:w-64 pl-3 pr-8 py-1 text-xs border border-gray-200 rounded-md bg-gray-50 focus:outline-hidden focus:bg-white focus:border-purple-500 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-[10px] text-gray-400 bg-gray-200 px-1 rounded">
            <span>⌘K</span>
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          title="Toggle Theme"
          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <button
          title="User Account"
          className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center hover:bg-purple-100 transition-colors"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
