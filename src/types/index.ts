export type BranchId = 'branch_store_a' | 'branch_store_b';

export interface Branch {
  id: BranchId;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  state: string;
  stateCode: string; // e.g. "03" for Punjab, "04" for Chandigarh
  isCentralHub: boolean;
}

export type UserRole =
  | 'super_admin' // Dealership Owner
  | 'branch_manager' // Showroom Manager
  | 'sales_executive' // Salesperson
  | 'technician' // Workshop Mechanic
  | 'accountant'; // Billing & Tax Staff

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedBranchId: BranchId | 'all';
  phone: string;
}

// Electric Vehicle Unit in Stock
export interface ElectricVehicle {
  id: string;
  chassisNumber: string; // VIN
  motorNumber: string;
  batterySerialNumber: string;
  brand: 'Ather' | 'Ola Electric' | 'TVS' | 'Bajaj' | 'Hero Vida' | 'Ampere';
  model: string;
  variant: string;
  color: string;
  batteryCapacityKwh: number;
  motorPowerKw: number;
  realWorldRangeKm: number;
  topSpeedKmph: number;
  branchId: BranchId;
  status: 'Available' | 'Booked' | 'Sold' | 'In Transit';
  purchaseDate: string;
  exFactoryPrice: number;
  freightAndHandling: number;
  totalLandedCost: number; // Purchase Cost
  sellingPriceExShowroom: number;
  gstRate: number; // 5% for EVs
  qrCodeUrl?: string;
  supplierId: string;
  supplierInvoiceNo: string;
  warrantyYears: number;
  batteryWarrantyYears: number;
}

// Spare Parts & Accessories
export interface SparePartItem {
  id: string;
  partNumber: string;
  name: string;
  category: 'Brakes' | 'Tyres' | 'Electrical' | 'Suspension' | 'Body Panel' | 'Consumables';
  brandCompatible: string;
  hsnCode: string; // e.g. "87141090"
  branchId: BranchId;
  quantityInStock: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  gstRate: number; // 18% or 28%
}

export interface AccessoryItem {
  id: string;
  code: string;
  name: string;
  category: 'Helmet' | 'Fast Charger' | 'Seat Cover' | 'Floor Mat' | 'Smart Lock' | 'Body Guard';
  branchId: BranchId;
  quantityInStock: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  gstRate: number; // 18% or 28%
}

export interface BatteryUnit {
  id: string;
  serialNumber: string;
  brand: string;
  capacityKwh: number;
  chemistry: 'LFP' | 'NMC';
  compatibleModel: string;
  branchId: BranchId;
  status: 'In Stock' | 'Installed' | 'Warranty Claim' | 'Scrapped';
  manufactureDate: string;
  purchaseCost: number;
  sellingPrice: number;
  gstRate: number; // 18%
}

// Customer Master
export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  gstin?: string;
  aadharOrPan?: string;
  createdAt: string;
  totalPurchases: number;
  vehiclesOwned: string[]; // Chassis numbers
}

// Lead & CRM
export type LeadStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Interested'
  | 'Showroom Visit'
  | 'Test Ride'
  | 'Price Quote'
  | 'Price Discussion'
  | 'Booked'
  | 'Delivered'
  | 'Lost';

export interface Lead {
  id: string;
  customerName: string;
  mobile: string;
  email?: string;
  branchId: BranchId;
  preferredModel: string;
  budgetRange: string;
  status: LeadStatus;
  source: 'Walk-in' | 'Website' | 'Phone Call' | 'Referral' | 'Social Media';
  assignedTo: string; // User ID
  assignedToName: string;
  testRideTaken: boolean;
  testRideDate?: string;
  notes: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

// POS & Billing
export interface InvoiceItem {
  id: string;
  itemType: 'Vehicle' | 'SparePart' | 'Accessory' | 'Battery' | 'Labor';
  description: string;
  chassisNumber?: string;
  hsnSac: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableValue: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Loan' | 'Old Bike Exchange';

export interface PaymentRecord {
  id: string;
  method: PaymentMethod;
  amount: number;
  referenceNo?: string; // UTR or receipt number
  financierName?: string;
  exchangeVehicleDetails?: string;
  date: string;
  status: 'Verified' | 'Pending';
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  branchId: BranchId;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  customerGstin?: string;
  placeOfSupply: string;
  isInterState: boolean;
  items: InvoiceItem[];
  subTotal: number;
  discountTotal: number;
  totalTaxable: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  roundOff: number;
  payments: PaymentRecord[];
  amountPaid: number;
  balanceDue: number;
  salesExecutiveId: string;
  salesExecutiveName: string;
  status: 'Finalized' | 'Cancelled';
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
}

// Operational Expenses
export type ExpenseCategory =
  | 'Showroom Rent'
  | 'Electricity'
  | 'Staff Refreshments'
  | 'Office Supplies'
  | 'Marketing & Ads'
  | 'Internet & Utilities'
  | 'Transportation & Freight'
  | 'Loading & Unloading'
  | 'Bank Charges'
  | 'Repairs & Maintenance'
  | 'Miscellaneous';

export interface ExpenseRecord {
  id: string;
  expenseNo: string;
  date: string;
  branchId: BranchId;
  category: ExpenseCategory;
  description: string;
  amount: number;
  gstAmount: number;
  vendorName: string;
  vendorGstin?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI';
  paidBy: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
  receiptUrl?: string;
}

// Daily Cash Counter Closing
export interface CashRegisterClosing {
  id: string;
  branchId: BranchId;
  date: string;
  closedBy: string;
  openingCash: number;
  cashSalesToday: number;
  cashExpensesToday: number;
  systemExpectedCash: number;
  physicalCashCounted: number;
  difference: number; // positive = excess, negative = shortage
  differenceReason?: string;
  status: 'Approved' | 'Flagged';
  createdAt: string;
}

// Bank Account
export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: 'Current' | 'Overdraft' | 'Cash Credit';
  currentBalance: number;
  assignedBranchId: BranchId | 'all';
}

// Vehicle Loan
export interface FinanceApplication {
  id: string;
  applicationNo: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  vehicleModel: string;
  vehiclePrice: number;
  financierName: 'Bajaj Finserv' | 'HDFC Bank' | 'Tata Capital' | 'IDFC First Bank' | 'Cholamandalam' | 'L&T Finance';
  loanAmountApplied: number;
  downPayment: number;
  interestRate: number;
  tenureMonths: number;
  status: 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected';
  sanctionLetterNo?: string;
  bankUtrReference?: string;
  disbursedAmount?: number;
  disbursementReceivedInBank: boolean;
  branchId: BranchId;
  createdAt: string;
  disbursedAt?: string;
}

// Old Bike Trade-In Exchange
export interface OldVehicleExchange {
  id: string;
  exchangeNo: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  brand: string;
  model: string;
  registrationNumber: string;
  chassisNumber?: string;
  yearOfMfg: number;
  odometerReadingKm: number;
  conditionGrade: 'A (Excellent)' | 'B (Good)' | 'C (Fair)' | 'D (Poor)';
  evaluatedValue: number;
  agreedExchangeValue: number;
  approvedBy: string;
  status: 'Inspected' | 'Approved' | 'Deducted in Sale' | 'Resold';
  branchId: BranchId;
  photos: string[];
  createdAt: string;
}

// Workshop Service & Repair Job Card
export interface JobCard {
  id: string;
  jobCardNumber: string;
  date: string;
  branchId: BranchId;
  customerId: string;
  customerName: string;
  customerMobile: string;
  vehicleModel: string;
  chassisNumber: string;
  registrationNumber?: string;
  odometerReadingKm: number;
  serviceType: '1st Free Service' | '2nd Free Service' | 'General Paid Service' | 'Battery Issue' | 'Motor Repair' | 'Accident Repair';
  customerComplaints: string[];
  technicianName: string;
  batteryHealthPercent: number; // 0 - 100%
  batteryChargeCycles: number;
  motorCondition: 'Healthy' | 'Needs Check' | 'Faulty';
  partsUsed: {
    partId: string;
    partName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  laborCharges: number;
  totalAmount: number;
  status: 'Open' | 'In Progress' | 'Ready for Delivery' | 'Delivered';
  completedAt?: string;
}

// Warranty
export interface WarrantyRecord {
  id: string;
  chassisNumber: string;
  customerName: string;
  customerMobile: string;
  vehicleModel: string;
  saleDate: string;
  vehicleWarrantyExpires: string;
  batteryWarrantyExpires: string;
  motorWarrantyExpires: string;
  batterySerial: string;
  motorNumber: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

// Supplier
export interface Supplier {
  id: string;
  name: string;
  category: 'EV Manufacturer (OEM)' | 'Spare Parts' | 'Batteries' | 'Accessories';
  gstin: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  currentPayableBalance: number;
}

// Employee
export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  role: UserRole;
  branchId: BranchId;
  phone: string;
  email: string;
  joinDate: string;
  monthlyBaseSalary: number;
  commissionPerUnit: number;
  unitsSoldThisMonth: number;
  commissionEarnedThisMonth: number;
}

// Double Entry Accounting
export type AccountCategory = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export interface AccountLedger {
  id: string;
  accountCode: string;
  name: string;
  category: AccountCategory;
  openingBalance: number;
  currentBalance: number;
  isDebitNormal: boolean;
}

export interface JournalLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  branchId: BranchId;
  referenceType: 'Sale' | 'Purchase' | 'Expense' | 'CashClosing' | 'Adjustment' | 'Cancellation';
  referenceId: string;
  narration: string;
  lines: JournalLine[];
  createdBy: string;
}

// Activity Log
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  branchId: BranchId | 'all';
  module: string;
  action: string;
  details: string;
  ipAddress?: string;
}

// Security Check Alert
export interface SecurityAlert {
  id: string;
  timestamp: string;
  branchId: BranchId;
  branchName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'Open' | 'Reviewed' | 'Resolved';
  reviewedBy?: string;
  reviewedAt?: string;
}
