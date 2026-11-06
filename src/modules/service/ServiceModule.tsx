import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  BatteryCharging,
  Zap,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { JobCard, BranchId } from '../../types';

export const ServiceModule: React.FC = () => {
  const { activeBranchId, currentUser, branches, triggerRefresh } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);

  const jobCards = db.getJobCards(activeBranchId);
  const parts = db.getParts(activeBranchId);

  // New Job Card Form
  const [jobForm, setJobForm] = useState({
    date: new Date().toISOString().split('T')[0],
    branchId: activeBranchId === 'all' ? 'branch_store_a' : activeBranchId,
    customerName: '',
    customerMobile: '',
    vehicleModel: 'Ather 450X Gen 3',
    chassisNumber: '',
    registrationNumber: '',
    odometerReadingKm: 1500,
    serviceType: '1st Free Service' as JobCard['serviceType'],
    complaints: '',
    technicianName: 'Jaswinder Singh',
    batteryHealthPercent: 98,
    batteryChargeCycles: 22,
    motorCondition: 'Healthy' as JobCard['motorCondition'],
    laborCharges: 0,
    selectedPartId: '',
  });

  const handleCreateJobCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.customerName || !jobForm.customerMobile || !jobForm.chassisNumber) {
      alert('Please fill customer name, mobile, and vehicle chassis number.');
      return;
    }

    const partsUsed = [];
    if (jobForm.selectedPartId) {
      const part = parts.find((p) => p.id === jobForm.selectedPartId);
      if (part) {
        partsUsed.push({
          partId: part.id,
          partName: part.name,
          quantity: 1,
          unitPrice: part.sellingPrice,
          total: part.sellingPrice,
        });
      }
    }

    const partsTotal = partsUsed.reduce((acc, p) => acc + p.total, 0);
    const totalAmount = partsTotal + Number(jobForm.laborCharges);

    db.addJobCard(
      {
        date: jobForm.date,
        branchId: jobForm.branchId as BranchId,
        customerId: `cust_${Date.now()}`,
        customerName: jobForm.customerName,
        customerMobile: jobForm.customerMobile,
        vehicleModel: jobForm.vehicleModel,
        chassisNumber: jobForm.chassisNumber.toUpperCase(),
        registrationNumber: jobForm.registrationNumber || undefined,
        odometerReadingKm: Number(jobForm.odometerReadingKm),
        serviceType: jobForm.serviceType,
        customerComplaints: jobForm.complaints ? [jobForm.complaints] : ['General Routine Checkup'],
        technicianName: jobForm.technicianName,
        batteryHealthPercent: Number(jobForm.batteryHealthPercent),
        batteryChargeCycles: Number(jobForm.batteryChargeCycles),
        motorCondition: jobForm.motorCondition,
        partsUsed,
        laborCharges: Number(jobForm.laborCharges),
        totalAmount,
        status: 'In Progress',
      },
      currentUser
    );

    setIsAddJobModalOpen(false);
    triggerRefresh();
  };

  const handleUpdateStatus = (jobId: string, status: JobCard['status']) => {
    db.updateJobCardStatus(jobId, status, currentUser);
    triggerRefresh();
  };

  const filteredJobs = jobCards.filter((j) => {
    const matchesSearch =
      j.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.customerMobile.includes(searchQuery) ||
      j.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || j.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-sky-600" />
            Repair & Service Workshop
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Repair job cards, battery health percentage, mechanic work, and spare parts used
          </p>
        </div>

        <button
          onClick={() => setIsAddJobModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#173B63] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#102a45]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Repair Job Card</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Total Job Cards</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {jobCards.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Workshop history</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Currently in Service</div>
          <div className="text-lg font-bold font-mono tabular-nums text-amber-600 mt-1">
            {jobCards.filter((j) => j.status === 'In Progress').length}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Being worked on</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Ready for Customer Pickup</div>
          <div className="text-lg font-bold font-mono tabular-nums text-sky-600 mt-1">
            {jobCards.filter((j) => j.status === 'Ready for Delivery').length}
          </div>
          <div className="text-[11px] text-sky-600 mt-0.5">Service complete</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Delivered to Customer</div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {jobCards.filter((j) => j.status === 'Delivered').length}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">Finished & paid</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by job card #, customer, or chassis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Job Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="font-mono">{job.jobCardNumber}</span>
                  <span className="text-slate-400">·</span>
                  <span>{job.vehicleModel}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Chassis: {job.chassisNumber} {job.registrationNumber ? `· Reg: ${job.registrationNumber}` : ''}
                </div>
              </div>

              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                  job.status === 'Ready for Delivery'
                    ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                    : job.status === 'In Progress'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}
              >
                {job.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px]">
              <div>
                <span className="text-slate-400">Customer:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{job.customerName}</div>
                <div className="text-slate-500">{job.customerMobile}</div>
              </div>

              <div>
                <span className="text-slate-400">Mechanic Assigned:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{job.technicianName}</div>
                <div className="text-slate-500 font-mono">{job.serviceType}</div>
              </div>
            </div>

            {/* Battery & Motor Diagnostics */}
            <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Battery Health</div>
                <div className="font-mono font-bold text-emerald-600 mt-0.5">{job.batteryHealthPercent}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Charge Cycles</div>
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {job.batteryChargeCycles}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Motor Condition</div>
                <div className="font-bold text-sky-600 mt-0.5">{job.motorCondition}</div>
              </div>
            </div>

            {/* Customer Complaints */}
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Customer Issue:</span>
              <div className="text-slate-500 italic mt-0.5">
                "{job.customerComplaints.join(', ')}"
              </div>
            </div>

            {/* Parts & Total Cost */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-500">Service Bill Total: </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  ₹{job.totalAmount.toLocaleString('en-IN')}
                </span>
                {job.laborCharges === 0 && <span className="text-[10px] text-emerald-600 ml-1">(Free Service)</span>}
              </div>

              <select
                value={job.status}
                onChange={(e) => handleUpdateStatus(job.id, e.target.value as JobCard['status'])}
                className="text-[11px] rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="In Progress">In Progress</option>
                <option value="Ready for Delivery">Ready for Pickup</option>
                <option value="Delivered">Delivered to Customer</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* New Job Card Modal */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                New Repair & Service Job Card
              </h3>
              <button
                onClick={() => setIsAddJobModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJobCard} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Customer name"
                    value={jobForm.customerName}
                    onChange={(e) => setJobForm({ ...jobForm, customerName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={jobForm.customerMobile}
                    onChange={(e) => setJobForm({ ...jobForm, customerMobile: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.vehicleModel}
                    onChange={(e) => setJobForm({ ...jobForm, vehicleModel: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chassis Number (VIN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Chassis VIN"
                    value={jobForm.chassisNumber}
                    onChange={(e) => setJobForm({ ...jobForm, chassisNumber: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service Type *
                  </label>
                  <select
                    value={jobForm.serviceType}
                    onChange={(e) => setJobForm({ ...jobForm, serviceType: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="1st Free Service">1st Free Service</option>
                    <option value="2nd Free Service">2nd Free Service</option>
                    <option value="General Paid Service">General Paid Service</option>
                    <option value="Battery Issue">Battery Health Check</option>
                    <option value="Motor Repair">Motor / Controller Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mechanic Assigned *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobForm.technicianName}
                    onChange={(e) => setJobForm({ ...jobForm, technicianName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Battery Diagnostic Fields */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Battery Health Percentage (0-100%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={jobForm.batteryHealthPercent}
                    onChange={(e) => setJobForm({ ...jobForm, batteryHealthPercent: Number(e.target.value) })}
                    className="w-full rounded border border-slate-200 bg-white p-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Motor Condition
                  </label>
                  <select
                    value={jobForm.motorCondition}
                    onChange={(e) => setJobForm({ ...jobForm, motorCondition: e.target.value as any })}
                    className="w-full rounded border border-slate-200 bg-white p-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Healthy">Healthy (Good)</option>
                    <option value="Needs Check">Needs Deep Check</option>
                    <option value="Faulty">Faulty (Warranty Claim)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Complaints & Issues Reported
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Front brake squeaking, headlight loose"
                  value={jobForm.complaints}
                  onChange={(e) => setJobForm({ ...jobForm, complaints: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Spare Part Used (Optional)
                  </label>
                  <select
                    value={jobForm.selectedPartId}
                    onChange={(e) => setJobForm({ ...jobForm, selectedPartId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">-- No Parts Used --</option>
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.sellingPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Labor / Service Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={jobForm.laborCharges}
                    onChange={(e) => setJobForm({ ...jobForm, laborCharges: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddJobModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#173B63] text-white font-semibold hover:bg-[#102a45]"
                >
                  Create Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
