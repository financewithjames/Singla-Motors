import React, { useState } from 'react';
import {
  Bike,
  Plus,
  QrCode,
  ArrowRightLeft,
  Search,
  Filter,
  CheckCircle2,
  X,
  ShieldCheck,
  BatteryCharging,
  Gauge,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { ElectricVehicle, BranchId } from '../../types';

export const VehicleInventory: React.FC = () => {
  const { activeBranchId, currentUser, branches, triggerRefresh } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [qrVehicle, setQrVehicle] = useState<ElectricVehicle | null>(null);
  const [transferVehicle, setTransferVehicle] = useState<ElectricVehicle | null>(null);
  const [transferTargetBranch, setTransferTargetBranch] = useState<BranchId>('branch_store_b');
  const [transferReason, setTransferReason] = useState('');

  // Load vehicles
  const vehicles = db.getVehicles(activeBranchId);

  // New Vehicle Inward Form
  const [inwardForm, setInwardForm] = useState({
    chassisNumber: '',
    motorNumber: '',
    batterySerialNumber: '',
    brand: 'Ather' as ElectricVehicle['brand'],
    model: '450X Gen 3',
    variant: 'Pro Pack 3.7 kWh',
    color: 'Space Grey',
    batteryCapacityKwh: 3.7,
    motorPowerKw: 6.4,
    realWorldRangeKm: 110,
    topSpeedKmph: 90,
    branchId: activeBranchId === 'all' ? 'branch_store_a' : activeBranchId,
    purchaseDate: new Date().toISOString().split('T')[0],
    exFactoryPrice: 128000,
    freightAndHandling: 2500,
    sellingPriceExShowroom: 144999,
    supplierId: 'supp_ather',
    supplierInvoiceNo: '',
    warrantyYears: 3,
    batteryWarrantyYears: 5,
  });

  const handleInwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inwardForm.chassisNumber || !inwardForm.motorNumber || !inwardForm.batterySerialNumber) {
      alert('Chassis Number, Motor Number, and Battery Serial Number are mandatory.');
      return;
    }

    const totalLandedCost = Number(inwardForm.exFactoryPrice) + Number(inwardForm.freightAndHandling);

    const result = db.addVehicle(
      {
        ...inwardForm,
        branchId: inwardForm.branchId as BranchId,
        exFactoryPrice: Number(inwardForm.exFactoryPrice),
        freightAndHandling: Number(inwardForm.freightAndHandling),
        totalLandedCost,
        sellingPriceExShowroom: Number(inwardForm.sellingPriceExShowroom),
        batteryCapacityKwh: Number(inwardForm.batteryCapacityKwh),
        motorPowerKw: Number(inwardForm.motorPowerKw),
        realWorldRangeKm: Number(inwardForm.realWorldRangeKm),
        topSpeedKmph: Number(inwardForm.topSpeedKmph),
        gstRate: 5,
      },
      currentUser
    );

    if (result.success) {
      alert(`Vehicle added to stock! Chassis: ${result.vehicle?.chassisNumber}`);
      setIsInwardModalOpen(false);
      triggerRefresh();
    } else {
      alert(result.error || 'Failed to add vehicle.');
    }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferVehicle) return;

    const res = db.transferVehicle(
      transferVehicle.id,
      transferTargetBranch,
      transferReason,
      currentUser
    );
    if (!res.success) {
      alert(res.error);
    } else {
      alert(`Vehicle transferred successfully to ${branches.find((b) => b.id === transferTargetBranch)?.name}`);
      setTransferVehicle(null);
      setTransferReason('');
      triggerRefresh();
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.motorNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrand === 'all' || v.brand === selectedBrand;
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;

    return matchesSearch && matchesBrand && matchesStatus;
  });

  const availableCount = vehicles.filter((v) => v.status === 'Available').length;
  const bookedCount = vehicles.filter((v) => v.status === 'Booked').length;
  const soldCount = vehicles.filter((v) => v.status === 'Sold').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Scooters & Bikes in Stock
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track each vehicle with its unique Chassis and Motor number
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#173B63] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#102a45]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Vehicle to Stock</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Total Vehicles Tracked</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {vehicles.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">In this showroom</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Ready to Sell</div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {availableCount}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">Available on floor</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Advance Booked</div>
          <div className="text-lg font-bold font-mono tabular-nums text-amber-600 mt-1">
            {bookedCount}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Token paid by customer</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Delivered & Sold</div>
          <div className="text-lg font-bold font-mono tabular-nums text-sky-600 mt-1">
            {soldCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Bill generated</div>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by Chassis VIN, Motor No, or Model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Brands</option>
            <option value="Ather">Ather</option>
            <option value="Ola Electric">Ola Electric</option>
            <option value="TVS">TVS</option>
            <option value="Bajaj">Bajaj</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available (Ready to Sell)</option>
            <option value="Booked">Booked</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-4 font-semibold">Vehicle & Model</th>
                <th className="py-2.5 px-4 font-semibold">Chassis (VIN) & Motor</th>
                <th className="py-2.5 px-4 font-semibold">Showroom</th>
                <th className="py-2.5 px-4 font-semibold text-right">Purchase Cost (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Selling Price (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No vehicles found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {v.brand} {v.model}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {v.variant} · <span className="font-medium text-slate-700 dark:text-slate-300">{v.color}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {v.chassisNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Motor: {v.motorNumber}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {v.branchId === 'branch_store_a' ? 'Patiala Hub' : 'Chandigarh Showroom'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      ₹{v.totalLandedCost.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{v.sellingPriceExShowroom.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          v.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : v.status === 'Booked'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {v.status === 'Available' ? 'Ready to Sell' : v.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setQrVehicle(v)}
                        className="p-1 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="View Vehicle Specs & QR Card"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>

                      {v.status === 'Available' && (
                        <button
                          onClick={() => {
                            setTransferVehicle(v);
                            setTransferTargetBranch(
                              v.branchId === 'branch_store_a' ? 'branch_store_b' : 'branch_store_a'
                            );
                          }}
                          className="p-1 rounded text-[#173B63] hover:bg-slate-100 dark:text-sky-400 dark:hover:bg-slate-800"
                          title="Transfer to Other Showroom"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle QR Card Modal */}
      {qrVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {qrVehicle.brand} {qrVehicle.model}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Chassis: {qrVehicle.chassisNumber}</p>
              </div>
              <button
                onClick={() => setQrVehicle(null)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <BatteryCharging className="h-3 w-3 text-emerald-600" />
                  <span>Battery Capacity</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white font-mono">
                  {qrVehicle.batteryCapacityKwh} kWh
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Gauge className="h-3 w-3 text-sky-600" />
                  <span>Real World Range</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white font-mono">
                  {qrVehicle.realWorldRangeKm} km
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Zap className="h-3 w-3 text-purple-600" />
                  <span>Motor Power</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white font-mono">
                  {qrVehicle.motorPowerKw} kW ({qrVehicle.topSpeedKmph} km/h)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-0.5">
                <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-amber-600" />
                  <span>Warranty</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {qrVehicle.warrantyYears} Yrs / {qrVehicle.batteryWarrantyYears} Yrs Battery
                </div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 space-y-0.5">
              <div>Motor Serial: {qrVehicle.motorNumber}</div>
              <div>Battery Serial: {qrVehicle.batterySerialNumber}</div>
              <div>Received on: {qrVehicle.purchaseDate}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setQrVehicle(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Vehicle Modal */}
      {transferVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4 text-[#173B63]" />
                <span>Move Vehicle to Another Showroom</span>
              </h3>
              <button
                onClick={() => setTransferVehicle(null)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {transferVehicle.brand} {transferVehicle.model} ({transferVehicle.color})
                </div>
                <div className="font-mono text-slate-500">Chassis: {transferVehicle.chassisNumber}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Showroom *
                </label>
                <select
                  value={transferTargetBranch}
                  onChange={(e) => setTransferTargetBranch(e.target.value as BranchId)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.id === transferVehicle.branchId}>
                      {b.name} ({b.city}) {b.id === transferVehicle.branchId ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Transfer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer delivery scheduled at Chandigarh branch"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferVehicle(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#173B63] text-white font-semibold hover:bg-[#102a45]"
                >
                  Transfer Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Vehicle (Inward) Modal */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add New Electric Vehicle to Stock
              </h3>
              <button
                onClick={() => setIsInwardModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInwardSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand *
                  </label>
                  <select
                    value={inwardForm.brand}
                    onChange={(e) => setInwardForm({ ...inwardForm, brand: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Ather">Ather</option>
                    <option value="Ola Electric">Ola Electric</option>
                    <option value="TVS">TVS</option>
                    <option value="Bajaj">Bajaj</option>
                    <option value="Hero Vida">Hero Vida</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Model & Variant *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 450X Gen 3 Pro Pack"
                    value={inwardForm.model}
                    onChange={(e) => setInwardForm({ ...inwardForm, model: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chassis Number (VIN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="17-character unique VIN"
                    value={inwardForm.chassisNumber}
                    onChange={(e) => setInwardForm({ ...inwardForm, chassisNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Space Grey / White"
                    value={inwardForm.color}
                    onChange={(e) => setInwardForm({ ...inwardForm, color: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Motor Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Motor serial"
                    value={inwardForm.motorNumber}
                    onChange={(e) => setInwardForm({ ...inwardForm, motorNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Battery Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Battery pack serial"
                    value={inwardForm.batterySerialNumber}
                    onChange={(e) => setInwardForm({ ...inwardForm, batterySerialNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Showroom Branch *
                  </label>
                  <select
                    value={inwardForm.branchId}
                    onChange={(e) => setInwardForm({ ...inwardForm, branchId: e.target.value as BranchId })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Received Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={inwardForm.purchaseDate}
                    onChange={(e) => setInwardForm({ ...inwardForm, purchaseDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Price from Factory (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={inwardForm.exFactoryPrice}
                    onChange={(e) => setInwardForm({ ...inwardForm, exFactoryPrice: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price in Showroom (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={inwardForm.sellingPriceExShowroom}
                    onChange={(e) => setInwardForm({ ...inwardForm, sellingPriceExShowroom: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInwardModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#173B63] text-white font-semibold hover:bg-[#102a45]"
                >
                  Add Vehicle to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
