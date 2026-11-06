import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { QuickActionModal } from './components/modals/QuickActionModal';
import { PrintInvoiceModal } from './components/modals/PrintInvoiceModal';

// Sales & Customer Modules
import { OwnerDashboard } from './modules/dashboard/OwnerDashboard';
import { CRMModule } from './modules/crm/CRMModule';
import { POSModule } from './modules/pos/POSModule';

// Vehicle & Stock Modules
import { VehicleInventory } from './modules/inventory/VehicleInventory';
import { PartsInventory } from './modules/inventory/PartsInventory';
import { DeadStockReport } from './modules/inventory/DeadStockReport';
import { PurchaseModule } from './modules/purchase/PurchaseModule';

// Money & Accounts Modules
import { AccountingModule } from './modules/accounting/AccountingModule';
import { GSTModule } from './modules/gst/GSTModule';
import { ExpenseModule } from './modules/expenses/ExpenseModule';
import { CashBankModule } from './modules/cashbank/CashBankModule';
import { FinanceExchangeModule } from './modules/finance/FinanceExchangeModule';

// Service & Repairs Modules
import { ServiceModule } from './modules/service/ServiceModule';
import { WarrantyModule } from './modules/warranty/WarrantyModule';

// Team & Settings Modules
import { EmployeeModule } from './modules/employees/EmployeeModule';
import { ReportsModule } from './modules/reports/ReportsModule';
import { SecurityAuditModule } from './modules/security/SecurityAuditModule';
import { BranchManagement } from './modules/admin/BranchManagement';
import { SetupWizard } from './modules/setup/SetupWizard';

const MainLayout: React.FC = () => {
  const { activeModule, setIsGlobalSearchOpen, setIsQuickActionOpen } = useApp();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K => Quick Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      // Alt + N or Cmd/Ctrl + J => Quick Add
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') || (e.altKey && e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        setIsQuickActionOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen, setIsQuickActionOpen]);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <OwnerDashboard />;
      case 'crm':
        return <CRMModule />;
      case 'pos':
        return <POSModule />;
      case 'vehicles':
        return <VehicleInventory />;
      case 'parts':
        return <PartsInventory />;
      case 'dead_stock':
        return <DeadStockReport />;
      case 'purchase':
        return <PurchaseModule />;
      case 'accounting':
        return <AccountingModule />;
      case 'gst':
        return <GSTModule />;
      case 'expenses':
        return <ExpenseModule />;
      case 'cash_bank':
        return <CashBankModule />;
      case 'finance_exchange':
        return <FinanceExchangeModule />;
      case 'service':
        return <ServiceModule />;
      case 'warranty':
        return <WarrantyModule />;
      case 'employees':
        return <EmployeeModule />;
      case 'reports':
        return <ReportsModule />;
      case 'audit_security':
        return <SecurityAuditModule />;
      case 'branch_admin':
        return <BranchManagement />;
      case 'setup_wizard':
        return <SetupWizard />;
      default:
        return <OwnerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Touch Bottom Bar for Mobile Devices */}
      <MobileNav />

      {/* Global Modals */}
      <GlobalSearchModal />
      <QuickActionModal />
      <PrintInvoiceModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
