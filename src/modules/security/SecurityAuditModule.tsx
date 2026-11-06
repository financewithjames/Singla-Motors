import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, Clock, Search, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const SecurityAuditModule: React.FC = () => {
  const { activeBranchId, currentUser, triggerRefresh } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const auditLogs = db.getAuditLogs(activeBranchId);
  const alerts = db.getSecurityAlerts(activeBranchId);

  const handleResolveAlert = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'Resolved';
      alert.reviewedBy = currentUser.name;
      alert.reviewedAt = new Date().toISOString();
      triggerRefresh();
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-600" />
          Activity Log & Security Checks
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review staff actions, bills created, stock transfers, and cash counter difference notices
        </p>
      </div>

      {/* Security Notices / Action Items */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-white p-5 shadow-2xs dark:border-rose-900/60 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-rose-900/40">
            <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Showroom Notices Requiring Review ({alerts.filter((a) => a.status === 'Open').length} Open)</span>
            </h3>
          </div>

          <div className="space-y-2">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="p-3 rounded-lg border border-rose-100 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                    <span>{al.title}</span>
                    <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded dark:bg-rose-900/60 dark:text-rose-300">
                      {al.branchName}
                    </span>
                  </div>
                  <div className="text-rose-800 dark:text-rose-300 mt-0.5">{al.description}</div>
                </div>

                {al.status === 'Open' ? (
                  <button
                    onClick={() => handleResolveAlert(al.id)}
                    className="self-start sm:self-auto px-3 py-1 text-xs font-semibold bg-white border border-rose-300 text-rose-700 rounded-md hover:bg-rose-100 dark:bg-slate-800 dark:text-rose-300 shrink-0"
                  >
                    Mark as Checked
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Checked by {al.reviewedBy}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search activity by person, bill, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Sections</option>
            <option value="Sales Billing">Sales Billing</option>
            <option value="Vehicle Stock">Vehicle Stock</option>
            <option value="Customer Enquiries">Customer Enquiries</option>
            <option value="Shop Expenses">Shop Expenses</option>
            <option value="Cash Drawer">Cash Drawer</option>
            <option value="Service & Repairs">Service & Repairs</option>
          </select>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity History</h3>
          <p className="text-xs text-slate-500">Every action recorded with employee name and timestamp</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-4 font-semibold">Date & Time</th>
                <th className="py-2.5 px-4 font-semibold">Staff Member</th>
                <th className="py-2.5 px-4 font-semibold">Section</th>
                <th className="py-2.5 px-4 font-semibold">Action Taken</th>
                <th className="py-2.5 px-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{log.userName}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{log.userRole.replace('_', ' ')}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{log.module}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
