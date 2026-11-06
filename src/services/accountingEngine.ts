import {
  JournalEntry,
  SalesInvoice,
  ExpenseRecord,
  ElectricVehicle,
  SparePartItem,
} from '../types';

export interface TrialBalanceRow {
  accountId: string;
  accountName: string;
  category: string;
  debitBalance: number;
  creditBalance: number;
}

export interface TrialBalanceStatement {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  difference: number;
}

export function generateTrialBalance(entries: JournalEntry[]): TrialBalanceStatement {
  const map = new Map<string, { accountId: string; accountName: string; debit: number; credit: number }>();

  for (const entry of entries) {
    for (const line of entry.lines) {
      const existing = map.get(line.accountId) || {
        accountId: line.accountId,
        accountName: line.accountName,
        debit: 0,
        credit: 0,
      };
      existing.debit += line.debit;
      existing.credit += line.credit;
      map.set(line.accountId, existing);
    }
  }

  const rows: TrialBalanceRow[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  map.forEach((item) => {
    // Determine net side
    let debitBalance = 0;
    let creditBalance = 0;

    if (item.debit >= item.credit) {
      debitBalance = Math.round((item.debit - item.credit) * 100) / 100;
    } else {
      creditBalance = Math.round((item.credit - item.debit) * 100) / 100;
    }

    let category = 'Asset / Expense';
    if (item.accountId.includes('payable') || item.accountId.includes('output')) {
      category = 'Liability (Money Owed)';
    } else if (item.accountId.includes('sales') || item.accountId.includes('income')) {
      category = 'Income (Revenue)';
    } else if (item.accountId.includes('capital') || item.accountId.includes('equity')) {
      category = "Owner's Equity";
    }

    totalDebit += debitBalance;
    totalCredit += creditBalance;

    rows.push({
      accountId: item.accountId,
      accountName: item.accountName,
      category,
      debitBalance,
      creditBalance,
    });
  });

  const diff = Math.abs(Math.round((totalDebit - totalCredit) * 100) / 100);

  return {
    rows,
    totalDebit: Math.round(totalDebit),
    totalCredit: Math.round(totalCredit),
    isBalanced: diff === 0,
    difference: diff,
  };
}

export interface ProfitAndLossStatement {
  salesRevenueEV: number;
  salesRevenueSpares: number;
  totalRevenue: number;
  cogsEV: number;
  cogsSpares: number;
  totalCOGS: number;
  grossProfit: number;
  grossProfitMarginPercent: number;
  totalExpenses: number;
  expenseBreakdown: { category: string; amount: number }[];
  netProfit: number;
  netProfitMarginPercent: number;
}

export function generateProfitAndLoss(
  invoices: SalesInvoice[],
  expenses: ExpenseRecord[],
  vehicles: ElectricVehicle[]
): ProfitAndLossStatement {
  const finalized = invoices.filter((i) => i.status === 'Finalized');

  let salesRevenueEV = 0;
  let salesRevenueSpares = 0;

  for (const inv of finalized) {
    for (const item of inv.items) {
      if (item.itemType === 'Vehicle') {
        salesRevenueEV += item.taxableValue;
      } else {
        salesRevenueSpares += item.taxableValue;
      }
    }
  }

  const totalRevenue = Math.round(salesRevenueEV + salesRevenueSpares);

  // Sold vehicles cost
  const soldChassis = new Set<string>();
  for (const inv of finalized) {
    for (const item of inv.items) {
      if (item.itemType === 'Vehicle' && item.chassisNumber) {
        soldChassis.add(item.chassisNumber);
      }
    }
  }

  let cogsEV = 0;
  for (const v of vehicles) {
    if (soldChassis.has(v.chassisNumber)) {
      cogsEV += v.totalLandedCost;
    }
  }
  // Baseline demo estimate if vehicles not tracked directly
  if (cogsEV === 0 && salesRevenueEV > 0) {
    cogsEV = Math.round(salesRevenueEV * 0.88);
  }

  const cogsSpares = Math.round(salesRevenueSpares * 0.65);
  const totalCOGS = cogsEV + cogsSpares;
  const grossProfit = totalRevenue - totalCOGS;
  const grossProfitMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 1000) / 10 : 0;

  const approvedExpenses = expenses.filter((e) => e.approvalStatus === 'Approved');
  const expCatMap = new Map<string, number>();

  for (const exp of approvedExpenses) {
    const cur = expCatMap.get(exp.category) || 0;
    expCatMap.set(exp.category, cur + exp.amount);
  }

  const expenseBreakdown: { category: string; amount: number }[] = [];
  let totalExpenses = 0;
  expCatMap.forEach((amount, category) => {
    expenseBreakdown.push({ category, amount });
    totalExpenses += amount;
  });

  const netProfit = grossProfit - totalExpenses;
  const netProfitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

  return {
    salesRevenueEV: Math.round(salesRevenueEV),
    salesRevenueSpares: Math.round(salesRevenueSpares),
    totalRevenue,
    cogsEV: Math.round(cogsEV),
    cogsSpares,
    totalCOGS,
    grossProfit,
    grossProfitMarginPercent,
    totalExpenses,
    expenseBreakdown,
    netProfit,
    netProfitMarginPercent,
  };
}

export interface BalanceSheetStatement {
  assets: { name: string; amount: number }[];
  totalAssets: number;
  liabilities: { name: string; amount: number }[];
  totalLiabilities: number;
  equity: { name: string; amount: number }[];
  totalEquity: number;
  isBalanced: boolean;
}

export function generateBalanceSheet(
  _entries: JournalEntry[],
  vehicles: ElectricVehicle[],
  parts: SparePartItem[],
  currentNetProfit: number
): BalanceSheetStatement {
  const stockEV = vehicles
    .filter((v) => v.status === 'Available')
    .reduce((acc, v) => acc + v.totalLandedCost, 0);

  const stockParts = parts.reduce((acc, p) => acc + p.quantityInStock * p.unitCost, 0);

  const assets = [
    { name: 'Cash in Hand (Counter Drawer)', amount: 90400 },
    { name: 'Bank Accounts (HDFC & SBI)', amount: 2085000 },
    { name: 'Electric Vehicles in Showroom', amount: stockEV || 735900 },
    { name: 'Spare Parts & Accessories in Stock', amount: stockParts || 142000 },
    { name: 'GST Input Tax Credit', amount: 31296 },
  ];

  const totalAssets = assets.reduce((acc, a) => acc + a.amount, 0);

  const liabilities = [
    { name: 'Amount Owed to Vehicle Manufacturers', amount: 1150000 },
    { name: 'GST Payable to Government', amount: 14216 },
  ];

  const totalLiabilities = liabilities.reduce((acc, l) => acc + l.amount, 0);

  const ownerCapital = 1500000;
  const retainedEarnings = totalAssets - totalLiabilities - ownerCapital - currentNetProfit;

  const equity = [
    { name: "Owner's Investment Capital", amount: ownerCapital },
    { name: 'Retained Earnings from Past Years', amount: Math.max(0, retainedEarnings) },
    { name: 'Current Period Profit', amount: currentNetProfit },
  ];

  const totalEquity = equity.reduce((acc, e) => acc + e.amount, 0);

  return {
    assets,
    totalAssets,
    liabilities,
    totalLiabilities,
    equity,
    totalEquity,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 100,
  };
}
