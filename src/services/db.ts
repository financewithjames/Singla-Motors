import {
  Branch,
  BranchId,
  User,
  ElectricVehicle,
  SparePartItem,
  AccessoryItem,
  BatteryUnit,
  Customer,
  Lead,
  SalesInvoice,
  ExpenseRecord,
  CashRegisterClosing,
  BankAccount,
  FinanceApplication,
  OldVehicleExchange,
  JobCard,
  WarrantyRecord,
  Supplier,
  Employee,
  AccountLedger,
  JournalEntry,
  AuditLog,
  SecurityAlert,
} from '../types';

import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_VEHICLES,
  INITIAL_PARTS,
  INITIAL_ACCESSORIES,
  INITIAL_BATTERIES,
  INITIAL_CUSTOMERS,
  INITIAL_LEADS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
  INITIAL_CASH_CLOSINGS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_FINANCE_APPS,
  INITIAL_EXCHANGES,
  INITIAL_JOBCARDS,
  INITIAL_WARRANTIES,
  INITIAL_SUPPLIERS,
  INITIAL_EMPLOYEES,
  INITIAL_LEDGERS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SECURITY_ALERTS,
} from './mockData';

interface DbState {
  branches: Branch[];
  users: User[];
  vehicles: ElectricVehicle[];
  parts: SparePartItem[];
  accessories: AccessoryItem[];
  batteries: BatteryUnit[];
  customers: Customer[];
  leads: Lead[];
  invoices: SalesInvoice[];
  expenses: ExpenseRecord[];
  cashClosings: CashRegisterClosing[];
  bankAccounts: BankAccount[];
  financeApps: FinanceApplication[];
  exchanges: OldVehicleExchange[];
  jobCards: JobCard[];
  warranties: WarrantyRecord[];
  suppliers: Supplier[];
  employees: Employee[];
  ledgers: AccountLedger[];
  journalEntries: JournalEntry[];
  auditLogs: AuditLog[];
  securityAlerts: SecurityAlert[];
  isDemoMode: boolean;
}

const STORAGE_KEY = 'singla_motors_db_v2';

class DealershipDatabase {
  private data: DbState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): DbState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return this.getInitialState();
  }

  private getInitialState(): DbState {
    return {
      branches: INITIAL_BRANCHES,
      users: INITIAL_USERS,
      vehicles: INITIAL_VEHICLES,
      parts: INITIAL_PARTS,
      accessories: INITIAL_ACCESSORIES,
      batteries: INITIAL_BATTERIES,
      customers: INITIAL_CUSTOMERS,
      leads: INITIAL_LEADS,
      invoices: INITIAL_INVOICES,
      expenses: INITIAL_EXPENSES,
      cashClosings: INITIAL_CASH_CLOSINGS,
      bankAccounts: INITIAL_BANK_ACCOUNTS,
      financeApps: INITIAL_FINANCE_APPS,
      exchanges: INITIAL_EXCHANGES,
      jobCards: INITIAL_JOBCARDS,
      warranties: INITIAL_WARRANTIES,
      suppliers: INITIAL_SUPPLIERS,
      employees: INITIAL_EMPLOYEES,
      ledgers: INITIAL_LEDGERS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      auditLogs: INITIAL_AUDIT_LOGS,
      securityAlerts: INITIAL_SECURITY_ALERTS,
      isDemoMode: true,
    };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // storage quota or error
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        // ignore
      }
    }
  }

  public logAction(
    user: User,
    branchId: BranchId | 'all',
    module: string,
    action: string,
    details: string
  ): void {
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      branchId,
      module,
      action,
      details,
    };
    this.data.auditLogs.unshift(log);
    // keep max 500 logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  // --- Read Methods ---
  public getBranches(): Branch[] {
    return this.data.branches;
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public getVehicles(branchFilter?: BranchId | 'all'): ElectricVehicle[] {
    if (!branchFilter || branchFilter === 'all') return this.data.vehicles;
    return this.data.vehicles.filter((v) => v.branchId === branchFilter);
  }

  public getInvoices(branchFilter?: BranchId | 'all'): SalesInvoice[] {
    if (!branchFilter || branchFilter === 'all') return this.data.invoices;
    return this.data.invoices.filter((i) => i.branchId === branchFilter);
  }

  public getExpenses(branchFilter?: BranchId | 'all'): ExpenseRecord[] {
    if (!branchFilter || branchFilter === 'all') return this.data.expenses;
    return this.data.expenses.filter((e) => e.branchId === branchFilter);
  }

  public getParts(branchFilter?: BranchId | 'all'): SparePartItem[] {
    if (!branchFilter || branchFilter === 'all') return this.data.parts;
    return this.data.parts.filter((p) => p.branchId === branchFilter);
  }

  public getAccessories(branchFilter?: BranchId | 'all'): AccessoryItem[] {
    if (!branchFilter || branchFilter === 'all') return this.data.accessories;
    return this.data.accessories.filter((a) => a.branchId === branchFilter);
  }

  public getBatteries(branchFilter?: BranchId | 'all'): BatteryUnit[] {
    if (!branchFilter || branchFilter === 'all') return this.data.batteries;
    return this.data.batteries.filter((b) => b.branchId === branchFilter);
  }

  public getSuppliers(): Supplier[] {
    return this.data.suppliers;
  }

  public getBankAccounts(): BankAccount[] {
    return this.data.bankAccounts;
  }

  public getCashClosings(branchFilter?: BranchId | 'all'): CashRegisterClosing[] {
    if (!branchFilter || branchFilter === 'all') return this.data.cashClosings;
    return this.data.cashClosings.filter((c) => c.branchId === branchFilter);
  }

  public getFinanceApps(branchFilter?: BranchId | 'all'): FinanceApplication[] {
    if (!branchFilter || branchFilter === 'all') return this.data.financeApps;
    return this.data.financeApps.filter((f) => f.branchId === branchFilter);
  }

  public getExchanges(branchFilter?: BranchId | 'all'): OldVehicleExchange[] {
    if (!branchFilter || branchFilter === 'all') return this.data.exchanges;
    return this.data.exchanges.filter((e) => e.branchId === branchFilter);
  }

  public getJobCards(branchFilter?: BranchId | 'all'): JobCard[] {
    if (!branchFilter || branchFilter === 'all') return this.data.jobCards;
    return this.data.jobCards.filter((j) => j.branchId === branchFilter);
  }

  public getWarranties(): WarrantyRecord[] {
    return this.data.warranties;
  }

  public getEmployees(branchFilter?: BranchId | 'all'): Employee[] {
    if (!branchFilter || branchFilter === 'all') return this.data.employees;
    return this.data.employees.filter((e) => e.branchId === branchFilter);
  }

  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getLeads(branchFilter?: BranchId | 'all'): Lead[] {
    if (!branchFilter || branchFilter === 'all') return this.data.leads;
    return this.data.leads.filter((l) => l.branchId === branchFilter);
  }

  public getLedgers(): AccountLedger[] {
    return this.data.ledgers;
  }

  public getJournalEntries(branchFilter?: BranchId | 'all'): JournalEntry[] {
    if (!branchFilter || branchFilter === 'all') return this.data.journalEntries;
    return this.data.journalEntries.filter((j) => j.branchId === branchFilter);
  }

  public getAuditLogs(branchFilter?: BranchId | 'all'): AuditLog[] {
    if (!branchFilter || branchFilter === 'all') return this.data.auditLogs;
    return this.data.auditLogs.filter((a) => a.branchId === branchFilter || a.branchId === 'all');
  }

  public getSecurityAlerts(branchFilter?: BranchId | 'all'): SecurityAlert[] {
    if (!branchFilter || branchFilter === 'all') return this.data.securityAlerts;
    return this.data.securityAlerts.filter((a) => a.branchId === branchFilter);
  }

  public isDemoModeActive(): boolean {
    return this.data.isDemoMode;
  }

  // --- Reset & Demo Actions ---
  public restoreDemoData(): void {
    this.data = this.getInitialState();
    this.save();
  }

  public resetToFreshData(): void {
    this.data = {
      branches: INITIAL_BRANCHES,
      users: INITIAL_USERS,
      vehicles: [],
      parts: [],
      accessories: [],
      batteries: [],
      customers: [],
      leads: [],
      invoices: [],
      expenses: [],
      cashClosings: [],
      bankAccounts: INITIAL_BANK_ACCOUNTS,
      financeApps: [],
      exchanges: [],
      jobCards: [],
      warranties: [],
      suppliers: INITIAL_SUPPLIERS,
      employees: INITIAL_EMPLOYEES,
      ledgers: INITIAL_LEDGERS,
      journalEntries: [],
      auditLogs: [],
      securityAlerts: [],
      isDemoMode: false,
    };
    this.save();
  }

  // --- EV Inventory Operations ---
  public addVehicle(
    vehicle: Omit<ElectricVehicle, 'id' | 'status'>,
    currentUser: User
  ): { success: boolean; error?: string; vehicle?: ElectricVehicle } {
    const cleanChassis = vehicle.chassisNumber.trim().toUpperCase();
    const cleanMotor = vehicle.motorNumber.trim().toUpperCase();
    const cleanBattery = vehicle.batterySerialNumber.trim().toUpperCase();

    // Check duplicate chassis number
    const duplicateChassis = this.data.vehicles.find((v) => v.chassisNumber.toUpperCase() === cleanChassis);
    if (duplicateChassis) {
      return { success: false, error: `Vehicle with Chassis No. ${cleanChassis} already exists in stock.` };
    }

    // Check duplicate motor number
    const duplicateMotor = this.data.vehicles.find((v) => v.motorNumber.toUpperCase() === cleanMotor);
    if (duplicateMotor) {
      return { success: false, error: `Vehicle with Motor No. ${cleanMotor} already exists in stock.` };
    }

    // Check duplicate battery serial
    const duplicateBattery = this.data.vehicles.find((v) => v.batterySerialNumber.toUpperCase() === cleanBattery);
    if (duplicateBattery) {
      return { success: false, error: `Battery Serial No. ${cleanBattery} already exists in another vehicle.` };
    }

    const newVehicle: ElectricVehicle = {
      ...vehicle,
      id: `ev_${Date.now()}`,
      chassisNumber: cleanChassis,
      motorNumber: cleanMotor,
      batterySerialNumber: cleanBattery,
      status: 'Available',
    };

    this.data.vehicles.unshift(newVehicle);

    // Create journal entry for inventory purchase
    const journal: JournalEntry = {
      id: `jnl_inward_${Date.now()}`,
      entryNumber: `JNL-PUR-${Date.now().toString().slice(-4)}`,
      date: vehicle.purchaseDate,
      branchId: vehicle.branchId,
      referenceType: 'Purchase',
      referenceId: newVehicle.id,
      narration: `Added ${newVehicle.brand} ${newVehicle.model} (Chassis: ${newVehicle.chassisNumber}) to stock`,
      lines: [
        { accountId: 'acc_stock_ev', accountName: 'Electric Vehicle Stock', debit: newVehicle.totalLandedCost, credit: 0 },
        { accountId: 'acc_payable_oem', accountName: 'Trade Payables (Manufacturers)', debit: 0, credit: newVehicle.totalLandedCost },
      ],
      createdBy: currentUser.name,
    };
    this.data.journalEntries.unshift(journal);

    this.logAction(
      currentUser,
      vehicle.branchId,
      'Vehicle Stock',
      'Add Vehicle to Stock',
      `Added ${vehicle.brand} ${vehicle.model} (Chassis: ${cleanChassis}) to showroom stock`
    );

    this.save();
    return { success: true, vehicle: newVehicle };
  }

  public transferVehicle(
    vehicleId: string,
    targetBranchId: BranchId,
    reason: string,
    currentUser: User
  ): { success: boolean; error?: string } {
    const v = this.data.vehicles.find((item) => item.id === vehicleId);
    if (!v) return { success: false, error: 'Vehicle not found' };
    if (v.status !== 'Available') return { success: false, error: `Vehicle is currently marked as ${v.status}` };
    if (v.branchId === targetBranchId) return { success: false, error: 'Target branch is the same as current branch' };

    const fromBranch = this.data.branches.find((b) => b.id === v.branchId)?.name || v.branchId;
    const toBranch = this.data.branches.find((b) => b.id === targetBranchId)?.name || targetBranchId;

    v.branchId = targetBranchId;

    this.logAction(
      currentUser,
      targetBranchId,
      'Vehicle Stock',
      'Stock Transfer',
      `Transferred ${v.model} (${v.chassisNumber}) from ${fromBranch} to ${toBranch}. Reason: ${reason || 'Stock balance'}`
    );

    this.save();
    return { success: true };
  }

  // --- Lead & CRM Operations ---
  public saveLead(leadData: Partial<Lead>, currentUser: User): Lead {
    if (leadData.id) {
      const idx = this.data.leads.findIndex((l) => l.id === leadData.id);
      if (idx !== -1) {
        this.data.leads[idx] = {
          ...this.data.leads[idx],
          ...leadData,
          updatedAt: new Date().toISOString(),
        } as Lead;
        this.logAction(
          currentUser,
          this.data.leads[idx].branchId,
          'Customer Enquiries',
          'Update Lead',
          `Updated enquiry for ${this.data.leads[idx].customerName} (${this.data.leads[idx].preferredModel})`
        );
        this.save();
        return this.data.leads[idx];
      }
    }

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      customerName: leadData.customerName || 'Walk-in Customer',
      mobile: leadData.mobile || '',
      email: leadData.email,
      branchId: (leadData.branchId as BranchId) || 'branch_store_a',
      preferredModel: leadData.preferredModel || 'Ather 450X',
      budgetRange: leadData.budgetRange || '₹1.2L - ₹1.5L',
      status: leadData.status || 'New Lead',
      source: leadData.source || 'Walk-in',
      assignedTo: leadData.assignedTo || currentUser.id,
      assignedToName: leadData.assignedToName || currentUser.name,
      testRideTaken: Boolean(leadData.testRideTaken),
      testRideDate: leadData.testRideDate,
      notes: leadData.notes || '',
      followUpDate: leadData.followUpDate,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    this.data.leads.unshift(newLead);
    this.logAction(
      currentUser,
      newLead.branchId,
      'Customer Enquiries',
      'New Enquiry',
      `Added enquiry for ${newLead.customerName} (${newLead.preferredModel})`
    );
    this.save();
    return newLead;
  }

  // --- Expense Management with Owner Approval ---
  public addExpense(
    expense: Omit<ExpenseRecord, 'id' | 'expenseNo' | 'approvalStatus' | 'approvedBy' | 'approvedAt'>,
    currentUser: User
  ): ExpenseRecord {
    const branchExpenses = this.data.expenses.filter((e) => e.branchId === expense.branchId).length;
    const branchCode = expense.branchId === 'branch_store_a' ? 'PTA' : 'CHD';
    const expenseNo = `EXP-${branchCode}-${String(branchExpenses + 1).padStart(4, '0')}`;

    // Needs owner approval if amount > 5000 and user is not super_admin
    const requiresApproval = expense.amount > 5000 && currentUser.role !== 'super_admin';
    const status = requiresApproval ? 'Pending' : 'Approved';

    const newExpense: ExpenseRecord = {
      ...expense,
      id: `exp_${Date.now()}`,
      expenseNo,
      approvalStatus: status,
      approvedBy: requiresApproval ? undefined : currentUser.name,
      approvedAt: requiresApproval ? undefined : new Date().toISOString(),
    };

    // If auto approved, create journal entry
    if (status === 'Approved') {
      const journal: JournalEntry = {
        id: `jnl_exp_${Date.now()}`,
        entryNumber: `JNL-EXP-${Date.now().toString().slice(-4)}`,
        date: expense.date,
        branchId: expense.branchId,
        referenceType: 'Expense',
        referenceId: newExpense.id,
        narration: `Paid for ${expense.category}: ${expense.description}`,
        lines: [
          { accountId: 'acc_exp_power', accountName: `${expense.category} Expense`, debit: expense.amount, credit: 0 },
          {
            accountId: expense.paymentMethod === 'Cash' ? 'acc_cash' : 'acc_bank_hdfc',
            accountName: expense.paymentMethod === 'Cash' ? 'Cash in Hand (Counter Drawer)' : 'HDFC Bank Current A/c',
            debit: 0,
            credit: expense.amount,
          },
        ],
        createdBy: currentUser.name,
      };
      this.data.journalEntries.unshift(journal);
    } else {
      // Add alert for owner
      const branchName = this.data.branches.find((b) => b.id === expense.branchId)?.name || expense.branchId;
      this.data.securityAlerts.unshift({
        id: `alert_exp_${Date.now()}`,
        timestamp: new Date().toISOString(),
        branchId: expense.branchId,
        branchName,
        severity: 'low',
        title: `Expense Approval Needed (> ₹5,000)`,
        description: `Expense ${expenseNo} for ₹${expense.amount.toLocaleString('en-IN')} (${expense.category}) is waiting for owner sign-off.`,
        status: 'Open',
      });
    }

    this.data.expenses.unshift(newExpense);
    this.logAction(
      currentUser,
      expense.branchId,
      'Shop Expenses',
      'Record Expense',
      `Logged expense of ₹${expense.amount.toLocaleString('en-IN')} for ${expense.category} (${status})`
    );

    this.save();
    return newExpense;
  }

  public approveExpense(expenseId: string, currentUser: User): boolean {
    const exp = this.data.expenses.find((e) => e.id === expenseId);
    if (!exp) return false;

    exp.approvalStatus = 'Approved';
    exp.approvedBy = currentUser.name;
    exp.approvedAt = new Date().toISOString();

    const journal: JournalEntry = {
      id: `jnl_exp_${Date.now()}`,
      entryNumber: `JNL-EXP-${Date.now().toString().slice(-4)}`,
      date: exp.date,
      branchId: exp.branchId,
      referenceType: 'Expense',
      referenceId: exp.id,
      narration: `Approved expense for ${exp.category}: ${exp.description}`,
      lines: [
        { accountId: 'acc_exp_power', accountName: `${exp.category} Expense`, debit: exp.amount, credit: 0 },
        {
          accountId: exp.paymentMethod === 'Cash' ? 'acc_cash' : 'acc_bank_hdfc',
          accountName: exp.paymentMethod === 'Cash' ? 'Cash in Hand (Counter Drawer)' : 'HDFC Bank Current A/c',
          debit: 0,
          credit: exp.amount,
        },
      ],
      createdBy: currentUser.name,
    };
    this.data.journalEntries.unshift(journal);

    // Resolve alert if exists
    const alert = this.data.securityAlerts.find((a) => a.title.includes(exp.expenseNo));
    if (alert) {
      alert.status = 'Resolved';
      alert.reviewedBy = currentUser.name;
      alert.reviewedAt = new Date().toISOString();
    }

    this.logAction(
      currentUser,
      exp.branchId,
      'Shop Expenses',
      'Approve Expense',
      `Owner approved expense ${exp.expenseNo} for ₹${exp.amount.toLocaleString('en-IN')}`
    );

    this.save();
    return true;
  }

  public rejectExpense(expenseId: string, currentUser: User): boolean {
    const exp = this.data.expenses.find((e) => e.id === expenseId);
    if (!exp) return false;

    exp.approvalStatus = 'Rejected';
    exp.approvedBy = currentUser.name;
    exp.approvedAt = new Date().toISOString();

    this.logAction(
      currentUser,
      exp.branchId,
      'Shop Expenses',
      'Reject Expense',
      `Owner rejected expense ${exp.expenseNo} for ₹${exp.amount.toLocaleString('en-IN')}`
    );

    this.save();
    return true;
  }

  // --- Sales & POS Billing ---
  public createSalesInvoice(
    invoiceData: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'status' | 'createdAt'>,
    currentUser: User
  ): { success: boolean; invoice?: SalesInvoice; error?: string } {
    const branchInvoices = this.data.invoices.filter((i) => i.branchId === invoiceData.branchId).length;
    const branchCode = invoiceData.branchId === 'branch_store_a' ? 'PTA' : 'CHD';
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${branchCode}-${year}-${String(branchInvoices + 1).padStart(4, '0')}`;

    // Mark vehicle as Sold
    for (const item of invoiceData.items) {
      if (item.itemType === 'Vehicle' && item.chassisNumber) {
        const vehicle = this.data.vehicles.find((v) => v.chassisNumber === item.chassisNumber);
        if (vehicle) {
          vehicle.status = 'Sold';
        }
      }
    }

    // Customer record update or creation
    let customer = this.data.customers.find((c) => c.mobile === invoiceData.customerMobile);
    if (!customer) {
      customer = {
        id: `cust_${Date.now()}`,
        name: invoiceData.customerName,
        mobile: invoiceData.customerMobile,
        address: invoiceData.customerAddress,
        city: invoiceData.customerAddress.split(',')[0]?.trim() || 'Patiala',
        state: invoiceData.placeOfSupply,
        gstin: invoiceData.customerGstin,
        createdAt: new Date().toISOString().split('T')[0],
        totalPurchases: invoiceData.grandTotal,
        vehiclesOwned: invoiceData.items
          .filter((i) => i.itemType === 'Vehicle' && i.chassisNumber)
          .map((i) => i.chassisNumber as string),
      };
      this.data.customers.unshift(customer);
    } else {
      customer.totalPurchases += invoiceData.grandTotal;
      const newChassis = invoiceData.items
        .filter((i) => i.itemType === 'Vehicle' && i.chassisNumber)
        .map((i) => i.chassisNumber as string);
      customer.vehiclesOwned = [...customer.vehiclesOwned, ...newChassis];
    }

    const newInvoice: SalesInvoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      invoiceNumber,
      status: 'Finalized',
      createdAt: new Date().toISOString(),
    };

    this.data.invoices.unshift(newInvoice);

    // Create journal entry for sale
    const lines = [];

    // Debit payment modes
    for (const p of invoiceData.payments) {
      if (p.method === 'Cash') {
        lines.push({ accountId: 'acc_cash', accountName: 'Cash in Hand (Counter Drawer)', debit: p.amount, credit: 0 });
      } else if (p.method === 'UPI' || p.method === 'Bank Transfer') {
        lines.push({ accountId: 'acc_bank_hdfc', accountName: 'HDFC Bank Current A/c', debit: p.amount, credit: 0 });
      } else if (p.method === 'Loan') {
        lines.push({ accountId: 'acc_bank_hdfc', accountName: `Financier Disbursal (${p.financierName || 'Loan'})`, debit: p.amount, credit: 0 });
      } else if (p.method === 'Old Bike Exchange') {
        lines.push({ accountId: 'acc_stock_spares', accountName: 'Old Vehicle Exchange Stock', debit: p.amount, credit: 0 });
      }
    }

    // Debit any pending customer balance
    if (invoiceData.balanceDue > 0) {
      lines.push({ accountId: 'acc_receivable_customer', accountName: 'Customer Receivables', debit: invoiceData.balanceDue, credit: 0 });
    }

    // Credit sales revenue and taxes
    const vehicleSalesTotal = invoiceData.items
      .filter((i) => i.itemType === 'Vehicle')
      .reduce((acc, i) => acc + i.taxableValue, 0);

    const accessoriesSalesTotal = invoiceData.items
      .filter((i) => i.itemType !== 'Vehicle')
      .reduce((acc, i) => acc + i.taxableValue, 0);

    if (vehicleSalesTotal > 0) {
      lines.push({ accountId: 'acc_sales_ev', accountName: 'Sales Revenue - Electric Vehicles', debit: 0, credit: vehicleSalesTotal });
    }
    if (accessoriesSalesTotal > 0) {
      lines.push({ accountId: 'acc_sales_spares', accountName: 'Sales Revenue - Accessories & Parts', debit: 0, credit: accessoriesSalesTotal });
    }

    if (invoiceData.cgstTotal > 0) {
      lines.push({ accountId: 'acc_gst_output_cgst', accountName: 'Output Tax Payable - CGST', debit: 0, credit: invoiceData.cgstTotal });
    }
    if (invoiceData.sgstTotal > 0) {
      lines.push({ accountId: 'acc_gst_output_sgst', accountName: 'Output Tax Payable - SGST', debit: 0, credit: invoiceData.sgstTotal });
    }
    if (invoiceData.igstTotal > 0) {
      lines.push({ accountId: 'acc_gst_output_cgst', accountName: 'Output Tax Payable - IGST', debit: 0, credit: invoiceData.igstTotal });
    }

    const journal: JournalEntry = {
      id: `jnl_inv_${Date.now()}`,
      entryNumber: `JNL-SALE-${Date.now().toString().slice(-4)}`,
      date: invoiceData.invoiceDate,
      branchId: invoiceData.branchId,
      referenceType: 'Sale',
      referenceId: newInvoice.id,
      narration: `Bill ${invoiceNumber} created for ${invoiceData.customerName}`,
      lines,
      createdBy: currentUser.name,
    };
    this.data.journalEntries.unshift(journal);

    this.logAction(
      currentUser,
      invoiceData.branchId,
      'Sales Billing',
      'Create Bill',
      `Created invoice ${invoiceNumber} for ₹${invoiceData.grandTotal.toLocaleString('en-IN')} (${invoiceData.customerName})`
    );

    this.save();
    return { success: true, invoice: newInvoice };
  }

  public cancelInvoice(
    invoiceId: string,
    reason: string,
    currentUser: User
  ): { success: boolean; error?: string } {
    const inv = this.data.invoices.find((i) => i.id === invoiceId);
    if (!inv) return { success: false, error: 'Invoice not found' };
    if (inv.status === 'Cancelled') return { success: false, error: 'Invoice is already cancelled' };

    inv.status = 'Cancelled';
    inv.cancellationReason = reason;
    inv.cancelledBy = currentUser.name;
    inv.cancelledAt = new Date().toISOString();

    // Revert sold vehicles back to Available
    for (const item of inv.items) {
      if (item.itemType === 'Vehicle' && item.chassisNumber) {
        const v = this.data.vehicles.find((veh) => veh.chassisNumber === item.chassisNumber);
        if (v) {
          v.status = 'Available';
        }
      }
    }

    // Create reversing journal entry
    const journal: JournalEntry = {
      id: `jnl_rev_${Date.now()}`,
      entryNumber: `JNL-CN-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      branchId: inv.branchId,
      referenceType: 'Cancellation',
      referenceId: inv.id,
      narration: `Reversal Credit Note for cancelled invoice ${inv.invoiceNumber}. Reason: ${reason}`,
      lines: [
        { accountId: 'acc_sales_ev', accountName: 'Sales Returns / Reversals', debit: inv.totalTaxable, credit: 0 },
        { accountId: 'acc_cash', accountName: 'Cash / Bank Refund to Customer', debit: 0, credit: inv.amountPaid },
      ],
      createdBy: currentUser.name,
    };
    this.data.journalEntries.unshift(journal);

    this.logAction(
      currentUser,
      inv.branchId,
      'Sales Billing',
      'Cancel Bill',
      `Cancelled invoice ${inv.invoiceNumber} (₹${inv.grandTotal.toLocaleString('en-IN')}). Reason: ${reason}`
    );

    this.save();
    return { success: true };
  }

  // --- Daily Cash Counter Closing ---
  public submitCashClosing(
    closing: Omit<CashRegisterClosing, 'id' | 'status' | 'createdAt'>,
    currentUser: User
  ): CashRegisterClosing {
    const hasDiff = Math.abs(closing.difference) > 0;
    const status = hasDiff ? 'Flagged' : 'Approved';

    const newClosing: CashRegisterClosing = {
      ...closing,
      id: `closing_${Date.now()}`,
      status,
      createdAt: new Date().toISOString(),
    };

    if (hasDiff) {
      const branchName = this.data.branches.find((b) => b.id === closing.branchId)?.name || closing.branchId;
      this.data.securityAlerts.unshift({
        id: `alert_cash_${Date.now()}`,
        timestamp: new Date().toISOString(),
        branchId: closing.branchId,
        branchName,
        severity: Math.abs(closing.difference) > 1000 ? 'critical' : 'high',
        title: `Cash Difference (${closing.difference < 0 ? 'Shortage' : 'Excess'} of ₹${Math.abs(closing.difference)})`,
        description: `Physical count was ₹${closing.physicalCashCounted.toLocaleString('en-IN')} vs expected ₹${closing.systemExpectedCash.toLocaleString('en-IN')} at ${branchName}. Reason: ${closing.differenceReason || 'None given'}`,
        status: 'Open',
      });
    }

    this.data.cashClosings.unshift(newClosing);

    this.logAction(
      currentUser,
      closing.branchId,
      'Cash Drawer',
      'Daily Cash Closing',
      `Closed cash register for ${closing.date}: Expected ₹${closing.systemExpectedCash.toLocaleString('en-IN')}, Counted ₹${closing.physicalCashCounted.toLocaleString('en-IN')} (Difference: ₹${closing.difference})`
    );

    this.save();
    return newClosing;
  }

  // --- Customer Finance & Loan Tracking ---
  public addFinanceApp(
    app: Omit<FinanceApplication, 'id' | 'applicationNo' | 'createdAt'>,
    currentUser: User
  ): FinanceApplication {
    const appNo = `FIN-${app.financierName.split(' ')[0].toUpperCase()}-${new Date().getFullYear()}-${String(this.data.financeApps.length + 1).padStart(3, '0')}`;
    const newApp: FinanceApplication = {
      ...app,
      id: `fin_${Date.now()}`,
      applicationNo: appNo,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.data.financeApps.unshift(newApp);

    this.logAction(
      currentUser,
      app.branchId,
      'Vehicle Loans',
      'New Loan Application',
      `Submitted ${app.financierName} loan application for ${app.customerName} (₹${app.loanAmountApplied.toLocaleString('en-IN')})`
    );

    this.save();
    return newApp;
  }

  public updateFinanceStatus(
    appId: string,
    status: FinanceApplication['status'],
    utr?: string,
    currentUser?: User
  ): boolean {
    const app = this.data.financeApps.find((f) => f.id === appId);
    if (!app) return false;

    app.status = status;
    if (status === 'Disbursed' && utr) {
      app.bankUtrReference = utr;
      app.disbursementReceivedInBank = true;
      app.disbursedAt = new Date().toISOString().split('T')[0];
    }

    if (currentUser) {
      this.logAction(
        currentUser,
        app.branchId,
        'Vehicle Loans',
        'Update Loan Status',
        `Updated loan status for ${app.customerName} to ${status}`
      );
    }

    this.save();
    return true;
  }

  // --- Old Vehicle Trade-In Exchange ---
  public addExchange(
    exc: Omit<OldVehicleExchange, 'id' | 'exchangeNo' | 'createdAt'>,
    currentUser: User
  ): OldVehicleExchange {
    const excNo = `EXC-${new Date().getFullYear()}-${String(this.data.exchanges.length + 1).padStart(3, '0')}`;
    const newExc: OldVehicleExchange = {
      ...exc,
      id: `exc_${Date.now()}`,
      exchangeNo: excNo,
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.data.exchanges.unshift(newExc);

    this.logAction(
      currentUser,
      exc.branchId,
      'Old Bike Exchange',
      'Add Old Bike Trade-In',
      `Evaluated trade-in for ${exc.brand} ${exc.model} (${exc.registrationNumber}) at ₹${exc.agreedExchangeValue.toLocaleString('en-IN')}`
    );

    this.save();
    return newExc;
  }

  // --- Workshop Job Cards ---
  public addJobCard(job: Omit<JobCard, 'id' | 'jobCardNumber'>, currentUser: User): JobCard {
    const jobNo = `JOB-${new Date().getFullYear()}-${String(this.data.jobCards.length + 1).padStart(4, '0')}`;
    const newJob: JobCard = {
      ...job,
      id: `job_${Date.now()}`,
      jobCardNumber: jobNo,
    };
    this.data.jobCards.unshift(newJob);

    this.logAction(
      currentUser,
      job.branchId,
      'Service & Repairs',
      'Create Job Card',
      `Created repair job card ${jobNo} for ${job.customerName} (${job.vehicleModel})`
    );

    this.save();
    return newJob;
  }

  public updateJobCardStatus(jobId: string, status: JobCard['status'], currentUser: User): boolean {
    const j = this.data.jobCards.find((job) => job.id === jobId);
    if (!j) return false;

    j.status = status;
    if (status === 'Delivered') {
      j.completedAt = new Date().toISOString();
    }

    this.logAction(
      currentUser,
      j.branchId,
      'Service & Repairs',
      'Update Job Status',
      `Updated job card ${j.jobCardNumber} to ${status}`
    );

    this.save();
    return true;
  }
}

export const db = new DealershipDatabase();
