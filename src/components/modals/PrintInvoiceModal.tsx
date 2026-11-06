import React, { useState } from 'react';
import { X, Printer, Share2, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const PrintInvoiceModal: React.FC = () => {
  const { isPrintModalOpen, closePrintInvoice, printInvoice } = useApp();
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');

  if (!isPrintModalOpen || !printInvoice) return null;

  const branches = db.getBranches();
  const branch = branches.find((b) => b.id === printInvoice.branchId) || branches[0];

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `Dear ${printInvoice.customerName},\n\nThank you for choosing *Singla Motors*! Here is your bill summary:\n\n*Bill No:* ${printInvoice.invoiceNumber}\n*Date:* ${printInvoice.invoiceDate}\n*Showroom:* ${branch.name}\n*Total Amount:* ₹${printInvoice.grandTotal.toLocaleString('en-IN')}\n*Amount Paid:* ₹${printInvoice.amountPaid.toLocaleString('en-IN')}\n\nFor any service assistance, please visit us or call ${branch.phone}.\n\nRide safe and green! ⚡🛵`;
    const url = `https://wa.me/91${printInvoice.customerMobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden my-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 no-print">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#173B63] dark:text-sky-400" />
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Tax Invoice {printInvoice.invoiceNumber}
              </span>
              <span className="text-xs text-slate-500 ml-2">({branch.city} Showroom)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-medium dark:bg-slate-700">
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  printFormat === 'a4'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                A4 Tax Invoice
              </button>
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  printFormat === 'thermal'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                3-Inch POS Receipt
              </button>
            </div>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#173B63] hover:bg-[#102a45]"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Bill</span>
            </button>

            <button
              onClick={closePrintInvoice}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-6 overflow-y-auto max-h-[75vh] bg-white text-slate-900 font-sans print:p-0 print:m-0 print:max-h-none">
          {printFormat === 'a4' ? (
            /* Standard A4 GST Tax Invoice */
            <div className="border border-slate-300 p-6 rounded-lg space-y-6 text-xs text-slate-800 print:border-0 print:p-0">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                    SINGLA MOTORS
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">Authorised Multi-Brand Electric Vehicle Showroom</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm">{branch.address}</p>
                  <p className="text-[11px] text-slate-500">Phone: {branch.phone} · Email: {branch.email}</p>
                  <p className="text-[11px] font-bold font-mono text-slate-700 mt-0.5">
                    GSTIN: {branch.gstin} · State: {branch.state} (Code: {branch.stateCode})
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block border border-slate-300 px-3 py-1 font-bold text-xs uppercase bg-slate-50 tracking-wider">
                    TAX INVOICE
                  </div>
                  <div className="mt-2 text-xs font-mono">
                    <div><strong>Bill No:</strong> {printInvoice.invoiceNumber}</div>
                    <div><strong>Date:</strong> {printInvoice.invoiceDate}</div>
                    <div><strong>Place of Supply:</strong> {printInvoice.placeOfSupply}</div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 border border-slate-200 p-3 rounded-md bg-slate-50/50">
                <div>
                  <div className="font-bold text-[11px] uppercase text-slate-500">Customer Details:</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{printInvoice.customerName}</div>
                  <div className="text-slate-600 mt-0.5">Mobile: {printInvoice.customerMobile}</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{printInvoice.customerAddress}</div>
                  {printInvoice.customerGstin && (
                    <div className="font-mono text-[11px] font-semibold text-slate-700 mt-0.5">
                      Customer GSTIN: {printInvoice.customerGstin}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-[11px] uppercase text-slate-500">Showroom Sales Person:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{printInvoice.salesExecutiveName}</div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Payment Status: <span className="font-bold text-emerald-700">PAID & VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-2 border-r border-slate-200">#</th>
                      <th className="p-2 border-r border-slate-200">Item Description</th>
                      <th className="p-2 border-r border-slate-200 text-center">HSN/SAC</th>
                      <th className="p-2 border-r border-slate-200 text-center">Qty</th>
                      <th className="p-2 border-r border-slate-200 text-right">Price Before GST</th>
                      <th className="p-2 border-r border-slate-200 text-center">GST %</th>
                      <th className="p-2 text-right">Total Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {printInvoice.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-2 border-r border-slate-200 font-mono">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-medium">
                          <div>{item.description}</div>
                          {item.chassisNumber && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Chassis (VIN): {item.chassisNumber}
                            </div>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">{item.hsnSac}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">{item.quantity}</td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono tabular-nums">
                          ₹{item.taxableValue.toLocaleString('en-IN')}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">{item.gstRate}%</td>
                        <td className="p-2 text-right font-mono font-bold tabular-nums">
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50 font-bold">
                      <td colSpan={4} className="p-2 text-right">Total Price Before GST:</td>
                      <td colSpan={3} className="p-2 text-right font-mono tabular-nums">
                        ₹{printInvoice.totalTaxable.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {!printInvoice.isInterState ? (
                      <>
                        <tr className="bg-slate-50 font-medium">
                          <td colSpan={4} className="p-2 text-right text-slate-600">Central GST (CGST):</td>
                          <td colSpan={3} className="p-2 text-right font-mono tabular-nums">
                            ₹{printInvoice.cgstTotal.toLocaleString('en-IN')}
                          </td>
                        </tr>
                        <tr className="bg-slate-50 font-medium">
                          <td colSpan={4} className="p-2 text-right text-slate-600">State GST (SGST):</td>
                          <td colSpan={3} className="p-2 text-right font-mono tabular-nums">
                            ₹{printInvoice.sgstTotal.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr className="bg-slate-50 font-medium">
                        <td colSpan={4} className="p-2 text-right text-slate-600">Integrated GST (IGST):</td>
                        <td colSpan={3} className="p-2 text-right font-mono tabular-nums">
                          ₹{printInvoice.igstTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-slate-800 bg-slate-100 text-sm font-bold">
                      <td colSpan={4} className="p-2.5 text-right uppercase">Final Total Amount:</td>
                      <td colSpan={3} className="p-2.5 text-right font-mono text-base tabular-nums">
                        ₹{printInvoice.grandTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payments Breakdown */}
              <div className="border border-slate-200 p-3 rounded-md bg-slate-50/50">
                <div className="font-bold text-[11px] uppercase text-slate-500 mb-1.5">
                  How Customer Paid:
                </div>
                <div className="space-y-1">
                  {printInvoice.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs">
                      <span>
                        • <strong>{p.method}</strong>
                        {p.financierName && ` (${p.financierName})`}
                        {p.referenceNo && ` · Ref: ${p.referenceNo}`}
                        {p.exchangeVehicleDetails && ` · ${p.exchangeVehicleDetails}`}
                      </span>
                      <span className="font-mono font-bold tabular-nums">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Footer */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-[10px] text-slate-500">
                <div>
                  <strong>Terms & Conditions:</strong>
                  <ol className="list-decimal pl-3 mt-0.5 space-y-0.5">
                    <li>Warranty claims are subject to terms set by vehicle and battery manufacturer.</li>
                    <li>Always use authorized chargers for warranty validity.</li>
                    <li>Goods once sold will not be returned or exchanged.</li>
                    <li>Subject to {branch.city} jurisdiction only.</li>
                  </ol>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="mt-8 font-semibold text-slate-800">For SINGLA MOTORS</div>
                  <div className="text-[10px] text-slate-500 mt-1">Authorized Signatory</div>
                </div>
              </div>
            </div>
          ) : (
            /* 3-Inch Thermal Receipt Format */
            <div className="max-w-[320px] mx-auto border border-dashed border-slate-300 p-4 font-mono text-[11px] space-y-3 bg-white text-slate-900">
              <div className="text-center">
                <div className="font-bold text-sm tracking-wider">SINGLA MOTORS</div>
                <div>{branch.name}</div>
                <div>{branch.city} · Ph: {branch.phone}</div>
                <div className="mt-1 font-bold">GSTIN: {branch.gstin}</div>
                <div className="border-b border-dashed border-slate-400 my-2"></div>
                <div className="font-bold">CASH / BILL RECEIPT</div>
              </div>

              <div className="space-y-0.5 text-[10px]">
                <div>Bill: {printInvoice.invoiceNumber}</div>
                <div>Date: {printInvoice.invoiceDate}</div>
                <div>Customer: {printInvoice.customerName}</div>
                <div>Phone: {printInvoice.customerMobile}</div>
              </div>

              <div className="border-b border-dashed border-slate-400 my-1"></div>

              <div className="space-y-1">
                {printInvoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <div>{item.description}</div>
                      {item.chassisNumber && <div className="text-[9px] text-slate-500">VIN: {item.chassisNumber}</div>}
                    </div>
                    <div className="font-bold">₹{item.totalAmount.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-400 my-1"></div>

              <div className="space-y-0.5 text-right font-bold text-xs">
                <div className="flex justify-between">
                  <span>GRAND TOTAL:</span>
                  <span>₹{printInvoice.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 my-1"></div>

              <div className="text-[10px] space-y-0.5">
                <div className="font-bold">Paid via:</div>
                {printInvoice.payments.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span>{p.method}</span>
                    <span>₹{p.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-400 my-2"></div>

              <div className="text-center text-[10px] space-y-1">
                <div>*** THANK YOU! DRIVE ELECTRIC ***</div>
                <div>Service Help: {branch.phone}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
