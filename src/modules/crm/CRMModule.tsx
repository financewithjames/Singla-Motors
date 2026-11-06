import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  X,
  Edit2,
  ChevronRight,
  Bike,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { Lead, LeadStatus, Customer } from '../../types';

export const CRMModule: React.FC = () => {
  const { activeBranchId, currentUser, branches } = useApp();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'customers'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Load leads and customers
  const leads = db.getLeads(activeBranchId);
  const customers = db.getCustomers();

  // Form State for Add / Edit Lead
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    preferredModel: 'Ather 450X Gen 3',
    budgetRange: '₹1.2L - ₹1.5L',
    status: 'New Lead' as LeadStatus,
    source: 'Walk-in' as Lead['source'],
    testRideTaken: false,
    notes: '',
    followUpDate: '',
  });

  const stages: { status: LeadStatus; label: string; color: string }[] = [
    { status: 'New Lead', label: 'New Enquiry', color: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20' },
    { status: 'Contacted', label: 'Contacted', color: 'border-sky-400 bg-sky-50/50 dark:bg-sky-950/20' },
    { status: 'Interested', label: 'Interested', color: 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20' },
    { status: 'Showroom Visit', label: 'Visited Showroom', color: 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' },
    { status: 'Test Ride', label: 'Took Test Ride', color: 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20' },
    { status: 'Price Quote', label: 'Price Quotation Given', color: 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' },
    { status: 'Price Discussion', label: 'Price Discussion', color: 'border-orange-400 bg-orange-50/50 dark:bg-orange-950/20' },
    { status: 'Booked', label: 'Booked (Advance Paid)', color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' },
    { status: 'Delivered', label: 'Delivered / Sold', color: 'border-green-600 bg-green-50/50 dark:bg-green-950/20' },
    { status: 'Lost', label: 'Lost / Cancelled', color: 'border-slate-300 bg-slate-50/50 dark:bg-slate-900/30' },
  ];

  const handleOpenNewLead = () => {
    setEditingLead(null);
    setFormData({
      customerName: '',
      mobile: '',
      email: '',
      preferredModel: 'Ather 450X Gen 3',
      budgetRange: '₹1.2L - ₹1.5L',
      status: 'New Lead',
      source: 'Walk-in',
      testRideTaken: false,
      notes: '',
      followUpDate: '',
    });
    setIsLeadModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      customerName: lead.customerName,
      mobile: lead.mobile,
      email: lead.email || '',
      preferredModel: lead.preferredModel,
      budgetRange: lead.budgetRange,
      status: lead.status,
      source: lead.source,
      testRideTaken: lead.testRideTaken,
      notes: lead.notes,
      followUpDate: lead.followUpDate || '',
    });
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobile) {
      alert('Please enter customer name and valid 10-digit mobile number');
      return;
    }

    if (!editingLead) {
      const duplicate = leads.find((l) => l.mobile === formData.mobile.trim());
      if (duplicate) {
        if (!confirm(`Notice: An enquiry with mobile ${formData.mobile} already exists (${duplicate.customerName} - ${duplicate.status}). Do you still want to add this?`)) {
          return;
        }
      }
    }

    const branch = activeBranchId === 'all' ? 'branch_store_a' : activeBranchId;

    db.saveLead(
      {
        id: editingLead ? editingLead.id : undefined,
        customerName: formData.customerName,
        mobile: formData.mobile,
        email: formData.email,
        branchId: branch,
        preferredModel: formData.preferredModel,
        budgetRange: formData.budgetRange,
        status: formData.status,
        source: formData.source,
        assignedTo: currentUser.id,
        assignedToName: currentUser.name,
        testRideTaken: formData.testRideTaken,
        testRideDate: formData.testRideTaken ? new Date().toISOString().split('T')[0] : undefined,
        notes: formData.notes,
        followUpDate: formData.followUpDate,
      },
      currentUser
    );

    setIsLeadModalOpen(false);
  };

  const handleSendWhatsApp = (lead: Lead) => {
    const text = `Hello ${lead.customerName}! Thank you for enquiring about the *${lead.preferredModel}* at Singla Motors. Would you like to take a free test ride at our showroom this week? We are happy to assist you!`;
    const url = `https://wa.me/91${lead.mobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleStageChange = (lead: Lead, newStatus: LeadStatus) => {
    db.saveLead(
      {
        ...lead,
        status: newStatus,
        testRideTaken: newStatus === 'Test Ride' ? true : lead.testRideTaken,
      },
      currentUser
    );
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.mobile.includes(searchQuery) ||
      l.preferredModel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatusFilter === 'all' || l.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Leads & Enquiries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track showroom walk-ins, phone enquiries, test rides, and customer contacts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'pipeline'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Enquiry Stages
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'customers'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All Customers ({customers.length})
            </button>
          </div>

          <button
            onClick={handleOpenNewLead}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#173B63] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#102a45]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add New Enquiry</span>
          </button>
        </div>
      </div>

      {activeTab === 'pipeline' ? (
        /* Enquiry Stages Pipeline View */
        <div className="space-y-4">
          {/* Search & Filter Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 w-full sm:w-72">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or scooter model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="all">All Stages ({leads.length})</option>
                {stages.map((st) => (
                  <option key={st.status} value={st.status}>
                    {st.label} ({leads.filter((l) => l.status === st.status).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Horizontal Scrolling Kanban Columns */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.status === stage.status);

              return (
                <div
                  key={stage.status}
                  className="w-72 shrink-0 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/60 flex flex-col max-h-[70vh]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-3">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {stage.label}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full dark:bg-slate-800">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-slate-400">
                        No enquiries in this stage
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {lead.customerName}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span>{lead.mobile}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleEditLead(lead)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                            <span className="font-medium truncate max-w-[150px]">{lead.preferredModel}</span>
                            <span className="text-emerald-600 font-semibold">{lead.budgetRange}</span>
                          </div>

                          {lead.testRideTaken && (
                            <div className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded flex items-center gap-1 dark:bg-purple-950/40 dark:text-purple-300 font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Test Ride Done ({lead.testRideDate})</span>
                            </div>
                          )}

                          {lead.notes && (
                            <div className="text-[11px] text-slate-500 line-clamp-2 italic">
                              "{lead.notes}"
                            </div>
                          )}

                          {/* Action Buttons: WhatsApp & Move Stage */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => handleSendWhatsApp(lead)}
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold hover:underline"
                            >
                              <MessageSquare className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </button>

                            <select
                              value={lead.status}
                              onChange={(e) => handleStageChange(lead, e.target.value as LeadStatus)}
                              className="text-[10px] rounded border border-slate-200 bg-white px-1.5 py-0.5 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium"
                            >
                              {stages.map((st) => (
                                <option key={st.status} value={st.status}>
                                  Move to: {st.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Customer Master View */
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Database</h3>
              <p className="text-xs text-slate-500">All registered customers, phone numbers, and scooters bought</p>
            </div>
            <div className="text-xs font-semibold text-slate-500 font-mono">
              Total: {customers.length} Customers
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Customer Name</th>
                  <th className="py-2.5 px-4 font-semibold">Mobile Number</th>
                  <th className="py-2.5 px-4 font-semibold">City / Address</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Vehicles Bought</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total Purchases (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{c.mobile}</td>
                    <td className="py-3 px-4 text-slate-500">{c.address || c.city}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-purple-600">
                      {c.vehiclesOwned.length} Unit(s)
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{c.totalPurchases.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`https://wa.me/91${c.mobile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Chat</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Enquiry Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingLead ? 'Edit Enquiry Details' : 'New Customer Enquiry'}
              </h3>
              <button
                onClick={() => setIsLeadModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaspreet Brar"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
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
                    placeholder="10-digit phone"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scooter Model Interested In
                  </label>
                  <select
                    value={formData.preferredModel}
                    onChange={(e) => setFormData({ ...formData, preferredModel: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Ather 450X Gen 3">Ather 450X Gen 3</option>
                    <option value="Ola S1 Pro Gen 2">Ola S1 Pro Gen 2</option>
                    <option value="TVS iQube ST">TVS iQube ST</option>
                    <option value="Bajaj Chetak Premium">Bajaj Chetak Premium</option>
                    <option value="Hero Vida V1 Pro">Hero Vida V1 Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Budget Range
                  </label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Under ₹1.2 Lakh">Under ₹1.2 Lakh</option>
                    <option value="₹1.2L - ₹1.4L">₹1.2L - ₹1.4L</option>
                    <option value="₹1.4L - ₹1.6L">₹1.4L - ₹1.6L</option>
                    <option value="Above ₹1.6 Lakh">Above ₹1.6 Lakh</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enquiry Stage
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {stages.map((st) => (
                      <option key={st.status} value={st.status}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    How Did Customer Reach Us?
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value as Lead['source'] })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Walk-in">Showroom Walk-in</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Website">Website Form</option>
                    <option value="Referral">Friend / Family Referral</option>
                    <option value="Social Media">Instagram / Facebook Ad</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <input
                  type="checkbox"
                  id="testRideTaken"
                  checked={formData.testRideTaken}
                  onChange={(e) => setFormData({ ...formData, testRideTaken: e.target.checked })}
                  className="rounded text-[#173B63]"
                />
                <label htmlFor="testRideTaken" className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Customer has taken a test ride today
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sales Notes & Customer Preferences
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Wants white color, asking about Bajaj finance loan and trade-in of old petrol scooter"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#173B63] text-white font-semibold hover:bg-[#102a45]"
                >
                  {editingLead ? 'Save Changes' : 'Save Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
