import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Bike,
  Menu,
  X,
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
  Clock,
  Truck,
} from 'lucide-react';
import { useApp, ActiveModule } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp();

  const primaryMobileTabs: { id: ActiveModule; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Billing', icon: ShoppingCart },
    { id: 'vehicles', label: 'Vehicles', icon: Bike },
    { id: 'crm', label: 'Leads', icon: Users },
  ];

  const allModulesList: { id: ActiveModule; label: string; group: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Owner Dashboard', group: 'Sales & Customers', icon: LayoutDashboard },
    { id: 'crm', label: 'Customer Leads', group: 'Sales & Customers', icon: Users },
    { id: 'pos', label: 'Billing Counter', group: 'Sales & Customers', icon: ShoppingCart },
    { id: 'vehicles', label: 'Scooters & Bikes', group: 'Vehicles & Stock', icon: Bike },
    { id: 'parts', label: 'Spare Parts & Battery', group: 'Vehicles & Stock', icon: Wrench },
    { id: 'dead_stock', label: 'Slow & Old Stock', group: 'Vehicles & Stock', icon: Clock },
    { id: 'purchase', label: 'Factory Purchases', group: 'Vehicles & Stock', icon: Truck },
    { id: 'accounting', label: 'Accounts & Books', group: 'Money & Accounts', icon: BookOpen },
    { id: 'gst', label: 'GST Tax Reports', group: 'Money & Accounts', icon: Receipt },
    { id: 'expenses', label: 'Shop Expenses', group: 'Money & Accounts', icon: FileSpreadsheet },
    { id: 'cash_bank', label: 'Cash Drawer & Banks', group: 'Money & Accounts', icon: Wallet },
    { id: 'finance_exchange', label: 'Loans & Old Bike Exchange', group: 'Money & Accounts', icon: Landmark },
    { id: 'service', label: 'Repair Job Cards', group: 'Service & Repairs', icon: CalendarCheck },
    { id: 'warranty', label: 'Vehicle Warranties', group: 'Service & Repairs', icon: Shield },
    { id: 'employees', label: 'Staff & Salaries', group: 'Team & Settings', icon: Users },
    { id: 'reports', label: 'Business Reports', group: 'Team & Settings', icon: BarChart3 },
    { id: 'audit_security', label: 'Activity Log & Security', group: 'Team & Settings', icon: ShieldAlert },
    { id: 'branch_admin', label: 'Showroom Branches', group: 'Team & Settings', icon: Building },
    { id: 'setup_wizard', label: 'Quick Setup & Reset', group: 'Team & Settings', icon: Sliders },
  ];

  return (
    <>
      {/* Bottom Sticky Mobile Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-900/95 no-print">
        {primaryMobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-[#173B63] dark:text-sky-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* Slide-over Mobile Drawer for Full Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-4/5 max-w-sm flex-col bg-white p-4 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white">All Showroom Sections</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {['Sales & Customers', 'Vehicles & Stock', 'Money & Accounts', 'Service & Repairs', 'Team & Settings'].map(
                (grp) => (
                  <div key={grp} className="space-y-1">
                    <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {grp}
                    </div>
                    {allModulesList
                      .filter((m) => m.group === grp)
                      .map((mod) => {
                        const Icon = mod.icon;
                        const isActive = activeModule === mod.id;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => {
                              setActiveModule(mod.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium ${
                              isActive
                                ? 'bg-[#173B63] text-white font-semibold'
                                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{mod.label}</span>
                          </button>
                        );
                      })}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
