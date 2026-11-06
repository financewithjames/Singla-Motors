import React from 'react';
import { BarChart3, Download, FileSpreadsheet, Bike, Wrench, ShoppingCart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const ReportsModule: React.FC = () => {
  const { activeBranchId } = useApp();

  const invoices = db.getInvoices(activeBranchId);
  const vehicles = db.getVehicles(activeBranchId);
  const expenses = db.getExpenses(activeBranchId);
  const jobCards = db.getJobCards(activeBranchId);

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const handleExportSales = () => {
    let csv = 'Bill Number,Date,Customer Name,Phone,Showroom,Grand Total (₹),Paid (₹),Balance (₹)\n';
    for (const inv of invoices) {
      csv += `"${inv.invoiceNumber}","${inv.invoiceDate}","${inv.customerName}","${inv.customerMobile}","${inv.branchId}",${inv.grandTotal},${inv.amountPaid},${inv.balanceDue}\n`;
    }
    downloadCSV(`Sales_Report_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleExportStock = () => {
    let csv = 'Brand,Model,Variant,Color,Chassis (VIN),Motor Serial,Battery Serial,Purchase Cost (₹),Selling Price (₹),Status\n';
    for (const v of vehicles) {
      csv += `"${v.brand}","${v.model}","${v.variant}","${v.color}","${v.chassisNumber}","${v.motorNumber}","${v.batterySerialNumber}",${v.totalLandedCost},${v.sellingPriceExShowroom},"${v.status}"\n`;
    }
    downloadCSV(`Vehicle_Stock_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleExportExpenses = () => {
    let csv = 'Expense No,Date,Category,Description,Vendor,Amount (₹),Payment Mode,Approval Status\n';
    for (const e of expenses) {
      csv += `"${e.expenseNo}","${e.date}","${e.category}","${e.description}","${e.vendorName}",${e.amount},"${e.paymentMethod}","${e.approvalStatus}"\n`;
    }
    downloadCSV(`Shop_Expenses_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  const handleExportRepairs = () => {
    let csv = 'Job Card No,Date,Customer Name,Phone,Model,Chassis,Battery Health (%),Status,Total Bill (₹)\n';
    for (const j of jobCards) {
      csv += `"${j.jobCardNumber}","${j.date}","${j.customerName}","${j.customerMobile}","${j.vehicleModel}","${j.chassisNumber}",${j.batteryHealthPercent},"${j.status}",${j.totalAmount}\n`;
    }
    downloadCSV(`Service_Repairs_${new Date().toISOString().split('T')[0]}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#173B63] dark:text-sky-400" />
          Business Reports & Downloads
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Download clean spreadsheet files for your accountant, tax consultant, or showroom records
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sales Report */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Customer Sales Report</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete list of all customer bills, payment breakdown, and pending balances
              </p>
            </div>
          </div>
          <button
            onClick={handleExportSales}
            className="w-full py-2 px-3 rounded-lg bg-[#173B63] text-white text-xs font-semibold hover:bg-[#102a45] flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Sales CSV ({invoices.length} Bills)</span>
          </button>
        </div>

        {/* Vehicle Stock Report */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Vehicle Stock & Chassis List</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every scooter in stock with its chassis number, motor serial, and purchase cost
              </p>
            </div>
          </div>
          <button
            onClick={handleExportStock}
            className="w-full py-2 px-3 rounded-lg bg-[#173B63] text-white text-xs font-semibold hover:bg-[#102a45] flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Stock CSV ({vehicles.length} Units)</span>
          </button>
        </div>

        {/* Expenses Report */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Shop Expenses Report</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full breakdown of power bills, rent, refreshments, and vendor payments
              </p>
            </div>
          </div>
          <button
            onClick={handleExportExpenses}
            className="w-full py-2 px-3 rounded-lg bg-[#173B63] text-white text-xs font-semibold hover:bg-[#102a45] flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Expenses CSV ({expenses.length} Records)</span>
          </button>
        </div>

        {/* Workshop Service Report */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Workshop Repairs & Battery Health</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Service history, customer complaints, battery health percentage, and spare parts used
              </p>
            </div>
          </div>
          <button
            onClick={handleExportRepairs}
            className="w-full py-2 px-3 rounded-lg bg-[#173B63] text-white text-xs font-semibold hover:bg-[#102a45] flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Service CSV ({jobCards.length} Jobs)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
