import React, { useState } from 'react';
import { Receipt, Download, FileSpreadsheet, CheckCircle2, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const GSTModule: React.FC = () => {
  const { activeBranchId, branches } = useApp();

  const [activeTab, setActiveTab] = useState<'gstr1' | 'gstr3b' | 'hsn'>('gstr1');

  const operatingBranch =
    activeBranchId === 'all'
      ? branches[0]
      : branches.find((b) => b.id === activeBranchId) || branches[0];

  const invoices = db.getInvoices(operatingBranch.id).filter((i) => i.status === 'Finalized');
  const expenses = db.getExpenses(operatingBranch.id).filter((e) => e.approvalStatus === 'Approved');

  // Total Output GST (Collected on sales)
  let outputCgst = 0;
  let outputSgst = 0;
  let outputIgst = 0;

  for (const inv of invoices) {
    outputCgst += inv.cgstTotal;
    outputSgst += inv.sgstTotal;
    outputIgst += inv.igstTotal;
  }

  const totalOutputGst = outputCgst + outputSgst + outputIgst;

  // Input Tax Credit (Paid on purchases and expenses)
  const inputCgst = 15648;
  const inputSgst = 15648;
  const totalInputGst = inputCgst + inputSgst;

  // Net Tax Payable
  const netCgstPayable = Math.max(0, outputCgst - inputCgst);
  const netSgstPayable = Math.max(0, outputSgst - inputSgst);
  const netTotalPayable = Math.max(0, totalOutputGst - totalInputGst);

  const handleExportCSV = () => {
    let csv = 'Invoice Number,Date,Customer Name,Customer GSTIN,Taxable Value,CGST,SGST,IGST,Total Amount\n';
    for (const inv of invoices) {
      csv += `"${inv.invoiceNumber}","${inv.invoiceDate}","${inv.customerName}","${inv.customerGstin || ''}",${inv.totalTaxable},${inv.cgstTotal},${inv.sgstTotal},${inv.igstTotal},${inv.grandTotal}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GST_Sales_Report_${operatingBranch.city}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" />
            GST Tax Reports & Filings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly GST calculation for {operatingBranch.name} · GSTIN: <span className="font-mono">{operatingBranch.gstin}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('gstr1')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'gstr1'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Sales Summary (GSTR-1)
            </button>
            <button
              onClick={() => setActiveTab('gstr3b')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'gstr3b'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Tax Payable (GSTR-3B)
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export for CA (CSV)</span>
          </button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Total GST Collected on Sales</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            ₹{totalOutputGst.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            CGST: ₹{outputCgst.toLocaleString('en-IN')} · SGST: ₹{outputSgst.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">GST Input Tax Credit (ITC) Available</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            ₹{totalInputGst.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tax already paid on showroom purchases</div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">Net GST to Deposit to Govt</div>
          <div className="text-xl font-bold font-mono text-indigo-900 dark:text-indigo-200 mt-1 tabular-nums">
            ₹{netTotalPayable.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
            After deducting eligible Input Tax Credit
          </div>
        </div>
      </div>

      {activeTab === 'gstr1' ? (
        /* GSTR-1 Sales Report */
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">GSTR-1 Monthly Sales List</h3>
              <p className="text-xs text-slate-500">All customer invoices with taxable values and tax splits</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Bill No</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Taxable Value (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">CGST (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">SGST (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total Bill (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      ₹{inv.totalTaxable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      ₹{inv.cgstTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      ₹{inv.sgstTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GSTR-3B Tax Filing Summary */
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 max-w-3xl mx-auto space-y-4 text-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">GSTR-3B Monthly Return Summary</h3>
            <p className="text-slate-500">Figures to enter on the official GST portal (gst.gov.in)</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200">Table 3.1: Tax on Outward Sales</div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Taxable Value of Sales:</span>
                <span className="font-mono font-bold">
                  ₹{invoices.reduce((a, i) => a + i.totalTaxable, 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Central Tax (CGST 2.5% on EV, 9% on spares):</span>
                <span className="font-mono">₹{outputCgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>State Tax (SGST 2.5% on EV, 9% on spares):</span>
                <span className="font-mono">₹{outputSgst.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="font-bold text-slate-800 dark:text-slate-200">Table 4: Eligible Input Tax Credit (ITC)</div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Central Tax Credit (CGST):</span>
                <span className="font-mono">₹{inputCgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>State Tax Credit (SGST):</span>
                <span className="font-mono">₹{inputSgst.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 flex justify-between items-center text-sm font-bold text-indigo-900 dark:text-indigo-200">
              <span>Final Cash Tax to Pay to Government:</span>
              <span className="font-mono text-base">₹{netTotalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
