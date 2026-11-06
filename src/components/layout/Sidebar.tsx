import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Bike,
  Wrench,
  BookOpen,
  Receipt,
  FileSpreadsheet,
  Wallet,
  Landmark,
  CalendarCheck,
  Shield,
  BarChart3,
  ShieldAlert,
  Building,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Clock,
  Truck,
} from 'lucide-react';
import { useApp, ActiveModule } from '../../context/AppContext';

interface NavItem {
  id: ActiveModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useApp();

  const navGroups: NavGroup[] = [
    {
      title: 'SALES & CUSTOMERS',
      items: [
        { id: 'dashboard', label: 'Owner Dashboard', icon: LayoutDashboard },
        { id: 'crm', label: 'Customer Leads', icon: Users },
        { id: 'pos', label: 'Billing Counter', icon: ShoppingCart },
      ],
    },
    {
      title: 'VEHICLES & STOCK',
      items: [
        { id: 'vehicles', label: 'Scooters & Bikes', icon: Bike },
        { id: 'parts', label: 'Spare Parts & Battery', icon: Wrench },
        { id: 'dead_stock', label: 'Slow & Old Stock', icon: Clock },
        { id: 'purchase', label: 'Factory Purchases', icon: Truck },
      ],
    },
    {
      title: 'MONEY & ACCOUNTS',
      items: [
        { id: 'accounting', label: 'Accounts & Books', icon: BookOpen },
        { id: 'gst', label: 'GST Tax Reports', icon: Receipt },
        { id: 'expenses', label: 'Shop Expenses', icon: FileSpreadsheet },
        { id: 'cash_bank', label: 'Cash Drawer & Banks', icon: Wallet },
        { id: 'finance_exchange', label: 'Loans & Old Bike Exchange', icon: Landmark },
      ],
    },
    {
      title: 'SERVICE & REPAIRS',
      items: [
        { id: 'service', label: 'Repair Job Cards', icon: CalendarCheck },
        { id: 'warranty', label: 'Vehicle Warranties', icon: Shield },
      ],
    },
    {
      title: 'TEAM & SETTINGS',
      items: [
        { id: 'employees', label: 'Staff & Salaries', icon: Users },
        { id: 'reports', label: 'Business Reports', icon: BarChart3 },
        { id: 'audit_security', label: 'Activity Log & Security', icon: ShieldAlert },
        { id: 'branch_admin', label: 'Showroom Branches', icon: Building },
        { id: 'setup_wizard', label: 'Quick Setup & Reset', icon: Sliders },
      ],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 no-print shrink-0 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!isSidebarCollapsed && (
              <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 tracking-wider">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#173B63] text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate whitespace-nowrap text-left">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-slate-200 p-2 dark:border-slate-800">
        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="flex w-full items-center justify-center gap-2 rounded-lg p-2 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
