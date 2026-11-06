import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch, BranchId, User, SalesInvoice } from '../types';
import { db } from '../services/db';

export type ActiveModule =
  | 'dashboard'
  | 'crm'
  | 'pos'
  | 'vehicles'
  | 'parts'
  | 'dead_stock'
  | 'purchase'
  | 'accounting'
  | 'gst'
  | 'expenses'
  | 'cash_bank'
  | 'finance_exchange'
  | 'service'
  | 'warranty'
  | 'employees'
  | 'reports'
  | 'audit_security'
  | 'branch_admin'
  | 'setup_wizard';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  activeBranchId: BranchId | 'all';
  setActiveBranchId: (branchId: BranchId | 'all') => void;
  currentBranch: Branch | undefined;
  branches: Branch[];
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (open: boolean) => void;
  isPrintModalOpen: boolean;
  printInvoice: SalesInvoice | null;
  openPrintInvoice: (invoice: SalesInvoice) => void;
  closePrintInvoice: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = db.getUsers();
  const branches = db.getBranches();

  const [currentUser, setCurrentUser] = useState<User>(() => {
    return users.find((u) => u.role === 'super_admin') || users[0];
  });

  const [activeBranchId, setActiveBranchIdState] = useState<BranchId | 'all'>('all');
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<SalesInvoice | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sm_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sm_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setActiveBranchId = (branchId: BranchId | 'all') => {
    if (currentUser.assignedBranchId !== 'all' && branchId !== currentUser.assignedBranchId) {
      alert(`Notice: Your employee account is assigned only to this showroom.`);
      return;
    }
    setActiveBranchIdState(branchId);
  };

  useEffect(() => {
    if (currentUser.assignedBranchId !== 'all') {
      setActiveBranchIdState(currentUser.assignedBranchId);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const openPrintInvoice = (invoice: SalesInvoice) => {
    setPrintInvoice(invoice);
    setIsPrintModalOpen(true);
  };

  const closePrintInvoice = () => {
    setPrintInvoice(null);
    setIsPrintModalOpen(false);
  };

  const currentBranch = activeBranchId === 'all' ? undefined : branches.find((b) => b.id === activeBranchId);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: users,
        activeBranchId,
        setActiveBranchId,
        currentBranch,
        branches,
        activeModule,
        setActiveModule,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        isQuickActionOpen,
        setIsQuickActionOpen,
        isPrintModalOpen,
        printInvoice,
        openPrintInvoice,
        closePrintInvoice,
        refreshTrigger,
        triggerRefresh: () => setRefreshTrigger((p) => p + 1),
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
