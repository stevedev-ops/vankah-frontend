import { 
  Product, JobCard, YardVehicle, ToolItem, ToolRental, 
  DebtorCustomer, DebtRecord, Shift, StockAudit, Transaction, 
  User, UserRole, CartItem, PaymentMethod 
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(role: UserRole, pin: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, pin }),
    });
    return handleResponse<User>(res);
  },

  // Products
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products/`);
    return handleResponse<Product[]>(res);
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return handleResponse<Product>(res);
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return handleResponse<Product>(res);
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}/`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Job Cards
  async getJobCards(): Promise<JobCard[]> {
    const res = await fetch(`${API_BASE}/job-cards/`);
    return handleResponse<JobCard[]>(res);
  },

  async createJobCard(jobCard: Omit<JobCard, 'id' | 'jobNo' | 'createdAt'>): Promise<JobCard> {
    const now = new Date();
    const jobNo = `JOB-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      ...jobCard,
      jobNo,
      createdAt: now.toISOString(),
      status: jobCard.status || 'Intake',
    };
    const res = await fetch(`${API_BASE}/job-cards/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<JobCard>(res);
  },

  async updateJobCard(id: string, updates: Partial<JobCard>): Promise<JobCard> {
    const res = await fetch(`${API_BASE}/job-cards/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<JobCard>(res);
  },

  async settleJobCard(id: string, paymentMethod: PaymentMethod, mpesaAmount: number, cashAmount: number, mpesaRef?: string): Promise<JobCard> {
    const res = await fetch(`${API_BASE}/job-cards/${id}/settle/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod, mpesaAmount, cashAmount, mpesaRef }),
    });
    return handleResponse<JobCard>(res);
  },

  // Yard Vehicles
  async getYardVehicles(): Promise<YardVehicle[]> {
    const res = await fetch(`${API_BASE}/yard-vehicles/`);
    return handleResponse<YardVehicle[]>(res);
  },

  async addYardVehicle(vehicle: Omit<YardVehicle, 'id' | 'isCleared'>): Promise<YardVehicle> {
    const res = await fetch(`${API_BASE}/yard-vehicles/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vehicle, isCleared: false }),
    });
    return handleResponse<YardVehicle>(res);
  },

  async updateYardVehicle(id: string, updates: Partial<YardVehicle>): Promise<YardVehicle> {
    const res = await fetch(`${API_BASE}/yard-vehicles/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<YardVehicle>(res);
  },

  async settleYardVehicle(id: string, paymentMethod: PaymentMethod, amountPaid: number, mpesaRef?: string): Promise<YardVehicle> {
    const res = await fetch(`${API_BASE}/yard-vehicles/${id}/settle/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod, amountPaid, mpesaRef }),
    });
    return handleResponse<YardVehicle>(res);
  },

  // Tools
  async getTools(): Promise<ToolItem[]> {
    const res = await fetch(`${API_BASE}/tools/`);
    return handleResponse<ToolItem[]>(res);
  },

  async addToolItem(tool: Omit<ToolItem, 'id'>): Promise<ToolItem> {
    const res = await fetch(`${API_BASE}/tools/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tool),
    });
    return handleResponse<ToolItem>(res);
  },

  async updateToolItem(id: string, updates: Partial<ToolItem>): Promise<ToolItem> {
    const res = await fetch(`${API_BASE}/tools/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<ToolItem>(res);
  },

  // Tool Rentals
  async getToolRentals(): Promise<ToolRental[]> {
    const res = await fetch(`${API_BASE}/tool-rentals/`);
    return handleResponse<ToolRental[]>(res);
  },

  async rentOutTool(rental: Omit<ToolRental, 'id' | 'status'>): Promise<ToolRental> {
    const res = await fetch(`${API_BASE}/tool-rentals/rent/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rental),
    });
    return handleResponse<ToolRental>(res);
  },

  async returnTool(rentalId: string, damageFee: number, depositRefunded: number): Promise<ToolRental> {
    const res = await fetch(`${API_BASE}/tool-rentals/${rentalId}/return/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ damageFee, depositRefunded }),
    });
    return handleResponse<ToolRental>(res);
  },

  // Debtors
  async getDebtors(): Promise<DebtorCustomer[]> {
    const res = await fetch(`${API_BASE}/debtors/`);
    return handleResponse<DebtorCustomer[]>(res);
  },

  async addDebtorCustomer(debtor: Omit<DebtorCustomer, 'id' | 'createdAt' | 'currentBalance'>): Promise<DebtorCustomer> {
    const res = await fetch(`${API_BASE}/debtors/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...debtor, currentBalance: 0 }),
    });
    return handleResponse<DebtorCustomer>(res);
  },

  async updateDebtorCustomer(id: string, updates: Partial<DebtorCustomer>): Promise<DebtorCustomer> {
    const res = await fetch(`${API_BASE}/debtors/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse<DebtorCustomer>(res);
  },

  async recordDebtRepayment(debtorId: string, amount: number, paymentMethod: PaymentMethod, mpesaRef?: string): Promise<{ debtor: DebtorCustomer; debtRecord: DebtRecord }> {
    const res = await fetch(`${API_BASE}/debtors/${debtorId}/repay/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, paymentMethod, mpesaRef }),
    });
    return handleResponse<{ debtor: DebtorCustomer; debtRecord: DebtRecord }>(res);
  },

  // Debt Records
  async getDebtRecords(): Promise<DebtRecord[]> {
    const res = await fetch(`${API_BASE}/debt-records/`);
    return handleResponse<DebtRecord[]>(res);
  },

  // Shifts
  async getShifts(): Promise<Shift[]> {
    const res = await fetch(`${API_BASE}/shifts/`);
    return handleResponse<Shift[]>(res);
  },

  async getActiveShift(): Promise<Shift | null> {
    const res = await fetch(`${API_BASE}/shifts/active/`);
    return handleResponse<Shift | null>(res);
  },

  async startShift(cashierName: string, openingFloat: number): Promise<Shift> {
    const res = await fetch(`${API_BASE}/shifts/start/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cashierName, openingFloat }),
    });
    return handleResponse<Shift>(res);
  },

  async endShift(shiftId: string, actualClosingCash: number, notes?: string): Promise<Shift> {
    const res = await fetch(`${API_BASE}/shifts/${shiftId}/close/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualClosingCash, notes }),
    });
    return handleResponse<Shift>(res);
  },

  // Stock Audits
  async getStockAudits(): Promise<StockAudit[]> {
    const res = await fetch(`${API_BASE}/stock-audits/`);
    return handleResponse<StockAudit[]>(res);
  },

  async recordStockAudit(audit: Omit<StockAudit, 'id'>): Promise<StockAudit> {
    const res = await fetch(`${API_BASE}/stock-audits/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(audit),
    });
    return handleResponse<StockAudit>(res);
  },

  // POS Sales & Transactions
  async processPOSSale(
    cart: CartItem[], 
    paymentMethod: PaymentMethod, 
    mpesaAmount: number, 
    cashAmount: number, 
    mpesaRef?: string, 
    debtorId?: string
  ): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/pos-sale/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, paymentMethod, mpesaAmount, cashAmount, mpesaRef, debtorId }),
    });
    return handleResponse<Transaction>(res);
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE}/transactions/`);
    return handleResponse<Transaction[]>(res);
  },

  // Vehicle History
  async getVehicleHistory(carRegNo: string): Promise<any> {
    const res = await fetch(`${API_BASE}/vehicle-history/${encodeURIComponent(carRegNo)}/`);
    return handleResponse<any>(res);
  }
};
