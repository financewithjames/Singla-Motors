import React from 'react';
import { Users, DollarSign, Award, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const EmployeeModule: React.FC = () => {
  const { activeBranchId } = useApp();
  const employees = db.getEmployees(activeBranchId);

  const totalPayroll = employees.reduce(
    (acc, e) => acc + e.monthlyBaseSalary + e.commissionEarnedThisMonth,
    0
  );
  const totalIncentives = employees.reduce((acc, e) => acc + e.commissionEarnedThisMonth, 0);

  const formatRole = (role: string) => {
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
        return 'Accounts & Billing';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-[#173B63] dark:text-sky-400" />
          Staff & Salaries
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showroom staff directory, monthly fixed pay, and sales incentives per vehicle sold
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Total Staff Members</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {employees.length} Employees
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across Patiala & Chandigarh</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Sales Incentives Earned This Month</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            ₹{totalIncentives.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Bonus on electric vehicle deliveries</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Total Monthly Salary & Bonus</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            ₹{totalPayroll.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Fixed pay + unit sales incentives</div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-4 font-semibold">Staff Name</th>
                <th className="py-2.5 px-4 font-semibold">Role</th>
                <th className="py-2.5 px-4 font-semibold">Showroom</th>
                <th className="py-2.5 px-4 font-semibold">Contact</th>
                <th className="py-2.5 px-4 font-semibold text-right">Fixed Monthly Pay (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Per-Scooter Bonus (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Scooters Sold</th>
                <th className="py-2.5 px-4 font-semibold text-right">Total Pay This Month (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{formatRole(emp.role)}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {emp.branchId === 'branch_store_a' ? 'Patiala Hub' : 'Chandigarh'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{emp.phone}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    ₹{emp.monthlyBaseSalary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600">
                    ₹{emp.commissionPerUnit.toLocaleString('en-IN')} / EV
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    {emp.unitsSoldThisMonth}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    ₹{(emp.monthlyBaseSalary + emp.commissionEarnedThisMonth).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
