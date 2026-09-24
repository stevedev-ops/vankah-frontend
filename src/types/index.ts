export type PaymentMethod = 'Mpesa' | 'Cash' | 'Split' | 'Credit';

export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  pin: string;
}

export interface DebtorCustomer {
  id: string;
  name: string;
  phone: string;
  businessOrCarReg: string;
  creditLimit: number;
  currentBalance: number;
  notes?: string;
  createdAt: string;
}

export interface DebtRecord {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  type: 'CREDIT_PURCHASE' | 'DEBT_REPAYMENT';
  amount: number;
  referenceNo: string;
  description: string;
  paymentMethod?: PaymentMethod;
  mpesaRef?: string;
  cashierName: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  imeiOrSerial?: string;
  category: 'Body Parts' | 'Electrical' | 'Engine & Transmission' | 'Consumables & Oils' | 'Tools & Accessories' | 'Custom Fabrication';
  buyingPrice: number;
  sellingPrice: number;
  stockQty: number;
  minAlertQty: number;
  location?: string;
  notes?: string;
}

export interface LaborItem {
  id: string;
  type: 'Panel Beating' | 'Welding' | 'Spray Painting' | 'Mechanical' | 'Electrical' | 'Custom Fabrication';
  description: string;
  mechanicName: string;
  cost: number;
}

export interface JobPartItem {
  id: string;
  partId?: string;
  name: string;
  quantity: number;
  unitCostPrice: number;
  unitSellingPrice: number;
  isOutsidePurchase: boolean;
  vendorName?: string;
  receiptNo?: string;
}

export type JobCardStatus = 'Intake' | 'In Progress' | 'Waiting Parts' | 'Ready' | 'Delivered';

export interface JobCard {
  id: string;
  jobNo: string;
  carRegNo: string;
  carMakeModel: string;
  customerName: string;
  customerPhone: string;
  status: JobCardStatus;
  laborItems: LaborItem[];
  parts: JobPartItem[];
  advanceDeposit: number;
  paymentMethod?: PaymentMethod;
  mpesaRef?: string;
  mpesaAmount?: number;
  cashAmount?: number;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface YardVehicle {
  id: string;
  carRegNo: string;
  customerName: string;
  customerPhone: string;
  bayNumber: string;
  arrivalDate: string;
  weeklyRate: number; // default 5000
  storagePenaltyPerDay: number; // default 500
  paidAmount: number;
  notes?: string;
  isCleared: boolean;
  gatePassNo?: string;
  clearedAt?: string;
}

export interface ToolItem {
  id: string;
  toolCode: string;
  name: string;
  category: 'Lifting & Jacks' | 'Hand Tools' | 'Welding' | 'Hydraulics' | 'Diagnostic';
  dailyRate: number;
  securityDeposit: number;
  status: 'Available' | 'Rented' | 'Maintenance';
  conditionNotes?: string;
}

export interface ToolRental {
  id: string;
  toolId: string;
  toolName: string;
  toolCode: string;
  hirerName: string;
  hirerPhone: string;
  hirerIdNumber: string;
  dateTaken: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  dailyRate: number;
  depositPaid: number;
  totalHireFee: number;
  damageFee: number;
  depositRefunded?: number;
  status: 'Active' | 'Returned' | 'Overdue';
  paymentMethod: PaymentMethod;
  mpesaRef?: string;
}

export interface Shift {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingFloat: number;
  closingCashActual?: number;
  totalCashExpected: number;
  totalMpesaExpected: number;
  discrepancy?: number;
  status: 'Open' | 'Closed';
  notes?: string;
}

export interface StockAuditItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  imeiOrSerial?: string;
  systemQty: number;
  countedQty: number;
  varianceQty: number;
  buyingPrice: number;
  varianceValueKes: number;
}

export interface StockAudit {
  id: string;
  auditDate: string;
  conductedBy: string;
  items: StockAuditItem[];
  totalVarianceValueKes: number;
  status: 'Draft' | 'Approved';
}

export interface Transaction {
  id: string;
  date: string;
  type: 'POS_SALE' | 'JOB_CARD' | 'YARD_FEE' | 'TOOL_RENTAL' | 'OUTSIDE_PURCHASE_EXPENSE' | 'DEBT_REPAYMENT';
  referenceId: string;
  referenceNo: string;
  description: string;
  grossAmount: number;
  costAmount: number;
  profitAmount: number;
  paymentMethod: PaymentMethod;
  mpesaAmount: number;
  cashAmount: number;
  mpesaRef?: string;
  cashierName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}
