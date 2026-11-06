import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  Building2,
  ChevronDown,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    activeBranchId,
    setActiveBranchId,
    branches,
    setIsGlobalSearchOpen,
    setIsQuickActionOpen,
    setIsMobileMenuOpen,
    theme,
    toggleTheme,
    triggerRefresh,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);

  const isDemo = db.isDemoModeActive();

  const handleResetData = () => {
    if (confirm('Start with a clean empty database? All sample bills and vehicles will be cleared.')) {
      db.resetToFreshData();
      triggerRefresh();
    }
  };

  const handleRestoreDemo = () => {
    if (confirm('Load sample showroom data with pre-filled scooters, customer bills, and accounts?')) {
      db.restoreDemoData();
      triggerRefresh();
    }
  };

  const activeBranchName =
    activeBranchId === 'all'
      ? 'All Showrooms (Consolidated)'
      : branches.find((b) => b.id === activeBranchId)?.name || 'Selected Showroom';

  const formatRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Dealership Owner';
      case 'branch_manager':
        return 'Showroom Manager';
      case 'sales_executive':
        return 'Salesperson';
      case 'technician':
        return 'Workshop Mechanic';
      case 'accountant':
        return 'Billing & Accounts';
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-6 dark:border-slate-800 dark:bg-slate-900/95 no-print">
      {/* Zone 1: Logo & Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173B63] text-white shadow-xs font-bold tracking-wider text-sm">
            SM
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              SINGLA MOTORS
            </span>
            <span className="hidden lg:inline text-xs text-slate-500 dark:text-slate-400 ml-2">
              EV Dealership
            </span>
          </div>
        </div>

        {/* Demo Data Indicator */}
        {isDemo ? (
          <button
            onClick={handleResetData}
            title="Click to start fresh with an empty database"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          >
            <Sparkles className="h-3 w-3" />
            <span>Sample Data Loaded</span>
          </button>
        ) : (
          <button
            onClick={handleRestoreDemo}
            title="Click to load sample test data"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Load Sample Data</span>
          </button>
        )}
      </div>

      {/* Zone 2: Search Shortcut & Branch Selector */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Global Search Bar */}
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-white md:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden md:inline">Find chassis, customer, bill...</span>
          <span className="md:hidden">Search...</span>
          <kbd className="ml-auto hidden rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 md:inline dark:bg-slate-700 dark:text-slate-300">
            ⌘K
          </kbd>
        </button>

        {/* Branch Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60"
          >
            <Building2 className="h-3.5 w-3.5 text-[#173B63] dark:text-sky-400 shrink-0" />
            <span className="max-w-[120px] truncate sm:max-w-[180px]">{activeBranchName}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </button>

          {isBranchMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Showroom
              </div>
              {currentUser.assignedBranchId === 'all' && (
                <button
                  onClick={() => {
                    setActiveBranchId('all');
                    setIsBranchMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left ${
                    activeBranchId === 'all'
                      ? 'bg-[#173B63] text-white font-medium'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Both Showrooms Combined</span>
                  <span className="text-[10px] opacity-75">Full View</span>
                </button>
              )}
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBranchId(b.id);
                    setIsBranchMenuOpen(false);
                  }}
                  disabled={currentUser.assignedBranchId !== 'all' && currentUser.assignedBranchId !== b.id}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left mt-0.5 ${
                    activeBranchId === b.id
                      ? 'bg-[#173B63] text-white font-medium'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  } ${
                    currentUser.assignedBranchId !== 'all' && currentUser.assignedBranchId !== b.id
                      ? 'opacity-40 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span className="text-[10px] opacity-75 ml-2 font-mono shrink-0">{b.city}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Quick Add, Theme & User Switcher */}
      <div className="flex items-center gap-2">
        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickActionOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#173B63] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#102a45] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Quick Add</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>

        {/* Role Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 text-left text-xs shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[#173B63] font-bold text-xs dark:bg-slate-700 dark:text-sky-300">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden xl:block">
              <div className="font-semibold text-slate-800 dark:text-slate-100 max-w-[110px] truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
                {formatRoleName(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
              <div className="border-b border-slate-100 pb-2 mb-2 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  Logged in as: {formatRoleName(currentUser.role)}
                </div>
              </div>

              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch User Account (Test Permissions)
              </div>

              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setIsRoleMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-left mb-0.5 ${
                    currentUser.id === u.id
                      ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div>{u.name}</div>
                    <div className="text-[10px] text-slate-400">{formatRoleName(u.role)}</div>
                  </div>
                  {currentUser.id === u.id && (
                    <span className="text-[10px] text-emerald-600 font-medium">Current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
