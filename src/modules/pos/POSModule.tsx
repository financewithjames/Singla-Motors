import React, { useState } from 'react';
import {
  ShoppingCart,
  Bike,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Search,
  UserCheck,
  Shield,
  CreditCard,
  DollarSign,
  Receipt,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import {
  InvoiceItem,
  PaymentRecord,
  PaymentMethod,
  ElectricVehicle,
  AccessoryItem,
  Customer,
} from '../../types';
import { calculateGSTFromInclusivePrice } from '../../services/gstEngine';

export const POSModule: React.FC = () => {
  const {
    activeBranchId,
    currentUser,
    branches,
    openPrintInvoice,
    triggerRefresh,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'checkout' | 'invoices'>('checkout');

  // Active branch
  const operatingBranch =
    activeBranchId === 'all'
      ? branches[0]
      : branches.find((b) => b.id === activeBranchId) || branches[0];

  // Data from DB
  const availableVehicles = db
    .getVehicles(operatingBranch.id)
    .filter((v) => v.status === 'Available');
  const availableAccessories = db.getAccessories(operatingBranch.id);
  const customers = db.getCustomers();
  const invoices = db.getInvoices(operatingBranch.id);

  // Customer State
  const [customerMode, setCustomerMode] = useState<'new' | 'existing'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerState, setCustomerState] = useState(operatingBranch.state);
  const [customerGstin, setCustomerGstin] = useState('');

  // Cart State
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);

  // Payment Breakdown State
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'p_init',
      method: 'Cash',
      amount: 0,
      referenceNo: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Verified',
    },
  ]);

  // Cancel Invoice Modal State
  const [cancelModalInvoiceId, setCancelModalInvoiceId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Handle Existing Customer Select
  const handleSelectExistingCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setCustomerName(found.name);
      setCustomerMobile(found.mobile);
      setCustomerAddress(found.address);
      setCustomerState(found.state);
      setCustomerGstin(found.gstin || '');
    }
  };

  // Add Vehicle to Cart
  const handleAddVehicleToCart = (vehicle: ElectricVehicle) => {
    const isInterState = customerState !== operatingBranch.state;
    const gstCalc = calculateGSTFromInclusivePrice(
      vehicle.sellingPriceExShowroom,
      vehicle.gstRate,
      isInterState
    );

    const newItem: InvoiceItem = {
      id: `item_ev_${Date.now()}`,
      itemType: 'Vehicle',
      description: `${vehicle.brand} ${vehicle.model} (${vehicle.variant} - ${vehicle.color})`,
      chassisNumber: vehicle.chassisNumber,
      hsnSac: '87116090',
      quantity: 1,
      unitPrice: gstCalc.taxableValue,
      discount: 0,
      taxableValue: gstCalc.taxableValue,
      gstRate: vehicle.gstRate,
      cgstAmount: gstCalc.cgstAmount,
      sgstAmount: gstCalc.sgstAmount,
      igstAmount: gstCalc.igstAmount,
      totalAmount: gstCalc.totalAmount,
    };

    setCartItems([...cartItems, newItem]);
  };

  // Add Accessory to Cart
  const handleAddAccessoryToCart = (acc: AccessoryItem) => {
    const isInterState = customerState !== operatingBranch.state;
    const gstCalc = calculateGSTFromInclusivePrice(acc.sellingPrice, acc.gstRate, isInterState);

    const newItem: InvoiceItem = {
      id: `item_acc_${Date.now()}_${acc.id}`,
      itemType: 'Accessory',
      description: acc.name,
      hsnSac: '87141090',
      quantity: 1,
      unitPrice: gstCalc.taxableValue,
      discount: 0,
      taxableValue: gstCalc.taxableValue,
      gstRate: acc.gstRate,
      cgstAmount: gstCalc.cgstAmount,
      sgstAmount: gstCalc.sgstAmount,
      igstAmount: gstCalc.igstAmount,
      totalAmount: gstCalc.totalAmount,
    };

    setCartItems([...cartItems, newItem]);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(cartItems.filter((i) => i.id !== id));
  };

  // Totals
  const subTotal = cartItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const discountTotal = cartItems.reduce((acc, i) => acc + i.discount, 0);
  const totalTaxable = cartItems.reduce((acc, i) => acc + i.taxableValue, 0);
  const cgstTotal = cartItems.reduce((acc, i) => acc + i.cgstAmount, 0);
  const sgstTotal = cartItems.reduce((acc, i) => acc + i.sgstAmount, 0);
  const igstTotal = cartItems.reduce((acc, i) => acc + i.igstAmount, 0);
  const grandTotal = Math.round(cartItems.reduce((acc, i) => acc + i.totalAmount, 0));

  const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  const handleAddPaymentRow = () => {
    setPayments([
      ...payments,
      {
        id: `p_${Date.now()}`,
        method: 'Cash',
        amount: balanceDue > 0 ? balanceDue : 0,
        referenceNo: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Verified',
      },
    ]);
  };

  const handleRemovePaymentRow = (index: number) => {
    setPayments(payments.filter((_, idx) => idx !== index));
  };

  // Finalize Sale
  const handleFinalizeSale = () => {
    if (cartItems.length === 0) {
      alert('Please add a scooter or accessory to the bill first.');
      return;
    }
    if (!customerName || !customerMobile) {
      alert('Please enter customer full name and mobile number.');
      return;
    }

    const isInterState = customerState !== operatingBranch.state;

    const result = db.createSalesInvoice(
      {
        invoiceDate: new Date().toISOString().split('T')[0],
        branchId: operatingBranch.id,
        customerId: selectedCustomerId || `cust_${Date.now()}`,
        customerName,
        customerMobile,
        customerAddress: customerAddress || `${operatingBranch.city}, ${operatingBranch.state}`,
        customerGstin: customerGstin || undefined,
        placeOfSupply: customerState,
        isInterState,
        items: cartItems,
        subTotal: Math.round(subTotal * 100) / 100,
        discountTotal: Math.round(discountTotal * 100) / 100,
        totalTaxable: Math.round(totalTaxable * 100) / 100,
        cgstTotal: Math.round(cgstTotal * 100) / 100,
        sgstTotal: Math.round(sgstTotal * 100) / 100,
        igstTotal: Math.round(igstTotal * 100) / 100,
        grandTotal,
        roundOff: 0,
        payments: payments.filter((p) => p.amount > 0),
        amountPaid: totalPaid,
        balanceDue,
        salesExecutiveId: currentUser.id,
        salesExecutiveName: currentUser.name,
      },
      currentUser
    );

    if (result.success && result.invoice) {
      alert(`Sale completed! Invoice ${result.invoice.invoiceNumber} generated.`);
      openPrintInvoice(result.invoice);

      // Reset cart
      setCartItems([]);
      setCustomerName('');
      setCustomerMobile('');
      setCustomerAddress('');
      setCustomerGstin('');
      setPayments([
        {
          id: 'p_init',
          method: 'Cash',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          status: 'Verified',
        },
      ]);
      triggerRefresh();
    } else {
      alert(result.error || 'Could not complete sale.');
    }
  };

  // Handle Cancel Invoice
  const handleConfirmCancelInvoice = () => {
    if (!cancelModalInvoiceId || !cancelReason.trim()) {
      alert('Please state a reason for cancelling this bill.');
      return;
    }
    const res = db.cancelInvoice(cancelModalInvoiceId, cancelReason, currentUser);
    if (res.success) {
      alert('Invoice cancelled. Vehicle has been returned to available stock and accounts adjusted.');
      setCancelModalInvoiceId(null);
      setCancelReason('');
      triggerRefresh();
    } else {
      alert(res.error || 'Failed to cancel invoice.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Billing Counter & Checkout
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showroom checkout for {operatingBranch.name} · GSTIN: <span className="font-mono">{operatingBranch.gstin}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'checkout'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              New Bill
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'invoices'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Past Bills ({invoices.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'checkout' ? (
        /* Split Screen POS Terminal: Left catalog & customer, Right current bill */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Customer info & Items Catalog) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details Box */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Customer Details
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('new')}
                    className={`text-xs px-2 py-0.5 rounded-md ${
                      customerMode === 'new'
                        ? 'bg-[#173B63] text-white font-medium'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Walk-in / New Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('existing')}
                    className={`text-xs px-2 py-0.5 rounded-md ${
                      customerMode === 'existing'
                        ? 'bg-[#173B63] text-white font-medium'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Select Existing
                  </button>
                </div>
              </div>

              {customerMode === 'existing' ? (
                <div className="pt-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Customer
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">-- Choose registered customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile}) - {c.city}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Harpreet Singh"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Address
                    </label>
                    <input
                      type="text"
                      placeholder="House No., Street, City, State"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Available Scooters Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bike className="h-4 w-4 text-purple-600" />
                  <span>Choose Scooter in Stock ({availableVehicles.length} Available)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                {availableVehicles.length === 0 ? (
                  <div className="sm:col-span-2 py-6 text-center text-xs text-slate-400">
                    No vehicles available in this showroom. Please inward new units first.
                  </div>
                ) : (
                  availableVehicles.map((v) => {
                    const isAlreadyInCart = cartItems.some((i) => i.chassisNumber === v.chassisNumber);
                    return (
                      <div
                        key={v.id}
                        className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                          isAlreadyInCart
                            ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {v.brand} {v.model}
                            </div>
                            <div className="text-[11px] text-slate-500">{v.variant} · {v.color}</div>
                          </div>
                          <span className="text-xs font-bold font-mono text-[#173B63] dark:text-sky-400 tabular-nums">
                            ₹{v.sellingPriceExShowroom.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="text-[10px] font-mono text-slate-500 bg-white dark:bg-slate-800 p-1 rounded border border-slate-100 dark:border-slate-700">
                          VIN: {v.chassisNumber}
                        </div>

                        <button
                          type="button"
                          disabled={isAlreadyInCart}
                          onClick={() => handleAddVehicleToCart(v)}
                          className={`w-full py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1 transition-colors ${
                            isAlreadyInCart
                              ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed dark:bg-emerald-900/60 dark:text-emerald-200'
                              : 'bg-[#173B63] text-white hover:bg-[#102a45]'
                          }`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>{isAlreadyInCart ? 'Added to Bill' : 'Add to Bill'}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Add-on Accessories Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pb-3 border-b border-slate-100 dark:border-slate-800">
                Helmets & Add-on Accessories
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                {availableAccessories.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{acc.name}</div>
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
                        ₹{acc.sellingPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddAccessoryToCart(acc)}
                      className="mt-2 text-[11px] font-semibold text-[#173B63] hover:underline dark:text-sky-400 text-left flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Cart & Bill Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[#173B63] dark:text-sky-400" />
                  <span>Current Bill</span>
                </h3>
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCartItems([])}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Clear Bill
                  </button>
                )}
              </div>

              {/* Items List in Cart */}
              <div className="py-3 space-y-2.5 max-h-60 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No items on the bill yet. Pick a scooter or accessory from the left.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.description}
                        </div>
                        {item.chassisNumber && (
                          <div className="text-[10px] font-mono text-slate-500">
                            Chassis: {item.chassisNumber}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          HSN: {item.hsnSac} · GST: {item.gstRate}%
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 mt-1 inline-block"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown */}
              {cartItems.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Price Before GST:</span>
                    <span className="font-mono tabular-nums">₹{totalTaxable.toLocaleString('en-IN')}</span>
                  </div>

                  {customerState !== operatingBranch.state ? (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>IGST (Inter-state):</span>
                      <span className="font-mono tabular-nums">₹{igstTotal.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Central GST (CGST):</span>
                        <span className="font-mono tabular-nums">₹{cgstTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>State GST (SGST):</span>
                        <span className="font-mono tabular-nums">₹{sgstTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span>Total Amount to Pay:</span>
                    <span className="font-mono text-[#173B63] dark:text-sky-400 tabular-nums">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    How Customer is Paying
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPaymentRow}
                    className="text-[11px] text-[#173B63] font-semibold hover:underline dark:text-sky-400"
                  >
                    + Add Another Payment Method
                  </button>
                </div>

                <div className="space-y-2">
                  {payments.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Method</label>
                          <select
                            value={p.method}
                            onChange={(e) => {
                              const copy = [...payments];
                              copy[idx].method = e.target.value as PaymentMethod;
                              setPayments(copy);
                            }}
                            className="w-full rounded border border-slate-200 bg-white p-1 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                          >
                            <option value="Cash">Cash in Hand</option>
                            <option value="UPI">UPI (Google Pay / Paytm / PhonePe)</option>
                            <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                            <option value="Loan">Vehicle Loan (Financier)</option>
                            <option value="Old Bike Exchange">Old Bike Trade-in</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Amount (₹)</label>
                          <input
                            type="number"
                            value={p.amount}
                            onChange={(e) => {
                              const copy = [...payments];
                              copy[idx].amount = Number(e.target.value);
                              setPayments(copy);
                            }}
                            className="w-full rounded border border-slate-200 bg-white p-1 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                          />
                        </div>
                      </div>

                      {p.method === 'UPI' && (
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">UPI UTR Reference No.</label>
                          <input
                            type="text"
                            placeholder="12-digit UTR from phone"
                            value={p.referenceNo || ''}
                            onChange={(e) => {
                              const copy = [...payments];
                              copy[idx].referenceNo = e.target.value;
                              setPayments(copy);
                            }}
                            className="w-full rounded border border-slate-200 bg-white p-1 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      )}

                      {p.method === 'Loan' && (
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Financier Name</label>
                          <select
                            value={p.financierName || 'Bajaj Finserv'}
                            onChange={(e) => {
                              const copy = [...payments];
                              copy[idx].financierName = e.target.value;
                              setPayments(copy);
                            }}
                            className="w-full rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            <option value="Bajaj Finserv">Bajaj Finserv</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="Tata Capital">Tata Capital</option>
                            <option value="IDFC First Bank">IDFC First Bank</option>
                          </select>
                        </div>
                      )}

                      {p.method === 'Old Bike Exchange' && (
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">Old Scooter Details</label>
                          <input
                            type="text"
                            placeholder="e.g. 2017 Honda Activa 4G (PB-11-AB-1234)"
                            value={p.exchangeVehicleDetails || ''}
                            onChange={(e) => {
                              const copy = [...payments];
                              copy[idx].exchangeVehicleDetails = e.target.value;
                              setPayments(copy);
                            }}
                            className="w-full rounded border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      )}

                      {payments.length > 1 && (
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => handleRemovePaymentRow(idx)}
                            className="text-[10px] text-rose-500 hover:underline"
                          >
                            Remove this payment
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total Paid vs Balance Due */}
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Total Paid Now:</span>
                    <span className="font-mono font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</span>
                  </div>
                  {balanceDue > 0 && (
                    <div className="flex justify-between text-amber-700 dark:text-amber-300 font-bold">
                      <span>Remaining Balance Due:</span>
                      <span className="font-mono">₹{balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                type="button"
                onClick={handleFinalizeSale}
                disabled={cartItems.length === 0}
                className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#173B63] hover:bg-[#102a45] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Finish Sale & Generate Bill</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Past Bills Register */
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Past Customer Bills</h3>
              <p className="text-xs text-slate-500">Every sales invoice generated at {operatingBranch.name}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Bill No</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Vehicle / Item</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Bill Total (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{inv.invoiceDate}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400">{inv.customerMobile}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {inv.items[0]?.description}
                      {inv.items.length > 1 && ` (+${inv.items.length - 1} more)`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          inv.status === 'Finalized'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {inv.status === 'Finalized' ? 'Paid & Completed' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openPrintInvoice(inv)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Print Bill
                      </button>
                      {inv.status === 'Finalized' && currentUser.role === 'super_admin' && (
                        <button
                          onClick={() => setCancelModalInvoiceId(inv.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-rose-600 bg-rose-50 rounded-md hover:bg-rose-100 dark:bg-rose-950/40"
                        >
                          Cancel Bill
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Bill Confirmation Modal */}
      {cancelModalInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-rose-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Cancel Bill & Return Vehicle to Stock</span>
              </h3>
              <button
                onClick={() => setCancelModalInvoiceId(null)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Cancelling will return any vehicle sold under this bill back to available showroom stock and create an accounting credit note refund.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Customer cancelled booking due to loan rejection"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCancelModalInvoiceId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelInvoice}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
