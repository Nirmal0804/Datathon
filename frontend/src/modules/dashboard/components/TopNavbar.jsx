import React from 'react';
import { Search, Bell, Menu, Plus, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopNavbar({ toggleMobileMenu }) {
  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-inset-top">
      <div className="flex items-center gap-4 w-full md:w-auto">
        {/* Mobile hamburger */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden btn-ghost btn-icon"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block w-80 lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search cases, districts… (Ctrl+K)"
            className="input pl-10 text-sm h-9"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Quick action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="hidden sm:flex btn-primary btn-sm"
        >
          <Plus className="w-4 h-4" />
          New Report
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative btn-ghost btn-icon"
          aria-label="Notifications (3 unread)"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger border border-surface rounded-full glow-danger" />
        </motion.button>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center font-bold text-xs text-text-secondary shrink-0 select-none">
            JD
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text-primary leading-tight">John Doe</p>
            <p className="text-2xs text-text-muted mt-0.5 uppercase tracking-wider">Intelligence Analyst</p>
          </div>
          <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
