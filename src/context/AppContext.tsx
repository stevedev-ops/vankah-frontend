import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  JobCard,
  YardVehicle,
  ToolItem,
  ToolRental,
  Shift,
  StockAudit,
  Transaction,
  PaymentMethod,
  CartItem,
  LaborItem,
  JobPartItem,
  User,
  UserRole,
  DebtorCustomer,
  DebtRecord
} from '../types';
import { api } from '../services/api';

interface VehicleHistoryResult {
  jobCards: JobCard[];
  yardStays: YardVehicle[];
  totalSpent: number;
  totalLaborDone: number;
  partsFitted: { name: string; quantity: number; date: string }[];
}

interface AppContextType {
  // Auth state
  currentUser: User | null;
  login: (role: UserRole, pin: string) => boolean;
  logout: () => void;

  // Data state
  products: Product[];
  jobCards: JobCard[];
  yardVehicles: YardVehicle[];
  tools: ToolItem[];
  toolRentals: ToolRental[];
  debtors: DebtorCustomer[];
  debtRecords: DebtRecord[];
  activeShift: Shift | null;
  shiftHistory: Shift[];
  stockAudits: StockAudit[];
  transactions: Transaction[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  processPOSSale: (cart: CartItem[], paymentMethod: PaymentMethod, mpesaAmount: number, cashAmount: number, mpesaRef?: string, debtorId?: string) => Transaction;
  
  createJobCard: (jobCard: Omit<JobCard, 'id' | 'jobNo' | 'createdAt'>) => JobCard;
  updateJobCard: (id: string, updates: Partial<JobCard>) => void;
  settleJobCard: (id: string, paymentMethod: PaymentMethod, mpesaAmount: number, cashAmount: number, mpesaRef?: string) => void;
  
  addYardVehicle: (vehicle: Omit<YardVehicle, 'id' | 'isCleared'>) => void;
  updateYardVehicle: (id: string, updates: Partial<YardVehicle>) => void;
  settleYardVehicle: (id: string, paymentMethod: PaymentMethod, amountPaid: number, mpesaRef?: string) => void;
  
  addToolItem: (tool: Omit<ToolItem, 'id'>) => void;
  updateToolItem: (id: string, updates: Partial<ToolItem>) => void;
  rentOutTool: (rental: Omit<ToolRental, 'id' | 'status'>) => void;
  returnTool: (rentalId: string, damageFee: number, depositRefunded: number) => void;
  
  // Debtors & Credit actions
  addDebtorCustomer: (debtor: Omit<DebtorCustomer, 'id' | 'createdAt' | 'currentBalance'>) => void;
  updateDebtorCustomer: (id: string, updates: Partial<DebtorCustomer>) => void;
  recordDebtRepayment: (debtorId: string, amount: number, paymentMethod: PaymentMethod, mpesaRef?: string) => void;

  // Vehicle History Lookup
  getVehicleHistory: (carRegNo: string) => VehicleHistoryResult;

  startShift: (cashierName: string, openingFloat: number) => void;
  endShift: (actualClosingCash: number, notes?: string) => void;

  recordStockAudit: (audit: Omit<StockAudit, 'id'>) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [yardVehicles, setYardVehicles] = useState<YardVehicle[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [toolRentals, setToolRentals] = useState<ToolRental[]>([]);
  const [debtors, setDebtors] = useState<DebtorCustomer[]>([]);
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
  const [stockAudits, setStockAudits] = useState<StockAudit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Fetch initial data from Django backend
  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          prods, jobs, yards, tls, rents, dbts, dbtRecs, shifts, txs, audits, curShift
        ] = await Promise.all([
          api.getProducts().catch(() => []),
          api.getJobCards().catch(() => []),
          api.getYardVehicles().catch(() => []),
          api.getTools().catch(() => []),
          api.getToolRentals().catch(() => []),
          api.getDebtors().catch(() => []),
          api.getDebtRecords().catch(() => []),
          api.getShifts().catch(() => []),
          api.getTransactions().catch(() => []),
          api.getStockAudits().catch(() => []),
          api.getActiveShift().catch(() => null),
        ]);

        if (prods.length > 0) setProducts(prods);
        if (jobs.length > 0) setJobCards(jobs);
        if (yards.length > 0) setYardVehicles(yards);
        if (tls.length > 0) setTools(tls);
        if (rents.length > 0) setToolRentals(rents);
        if (dbts.length > 0) setDebtors(dbts);
        if (dbtRecs.length > 0) setDebtRecords(dbtRecs);
        if (shifts.length > 0) setShiftHistory(shifts);
        if (txs.length > 0) setTransactions(txs);
        if (audits.length > 0) setStockAudits(audits);
        if (curShift) setActiveShift(curShift);

        setIsOnline(true);
      } catch (err) {
        console.warn('Django backend unreachable, continuing in client mode:', err);
        setIsOnline(false);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('erp_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('erp_currentUser');
    }
  }, [currentUser]);

  // Authentication
  const login = (role: UserRole, pin: string): boolean => {
    // Check built-in fallback roles
    if (role === 'ADMIN' && (pin === '1234' || pin === 'admin')) {
      const adminUser: User = {
        id: 'user-admin',
        name: 'Director / General Manager',
        role: 'ADMIN',
        title: 'Managing Director & Workshop Owner',
        pin: '1234'
      };
      setCurrentUser(adminUser);
      setActiveTab('overview');
      return true;
    } else if (role === 'STAFF' && (pin === '0000' || pin === 'staff')) {
      const staffUser: User = {
        id: 'user-staff',
        name: 'Workshop Operations Staff',
        role: 'STAFF',
        title: 'POS Cashier & Workshop Operator',
        pin: '0000'
      };
      setCurrentUser(staffUser);
      setActiveTab('pos');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Product / Stock actions
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const created = await api.addProduct(productData);
      setProducts(prev => [created, ...prev]);
    } catch {
      const fallback: Product = { ...productData, id: `prod-${Date.now()}` };
      setProducts(prev => [fallback, ...prev]);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await api.updateProduct(id, updates);
    } catch (e) {
      console.warn('Backend updateProduct failed:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await api.deleteProduct(id);
    } catch (e) {
      console.warn('Backend deleteProduct failed:', e);
    }
  };

  // Process POS Counter Sale
  const processPOSSale = (
    cart: CartItem[],
    paymentMethod: PaymentMethod,
    mpesaAmount: number,
    cashAmount: number,
    mpesaRef?: string,
    debtorId?: string
  ): Transaction => {
    const totalGross = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalCost = cart.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const totalProfit = totalGross - totalCost;

    // Local optimistic update
    setProducts(prev => prev.map(prod => {
      const inCart = cart.find(c => c.product.id === prod.id);
      if (inCart) {
        return {
          ...prod,
          stockQty: Math.max(0, prod.stockQty - inCart.quantity)
        };
      }
      return prod;
    }));

    const txNo = `POS-${Date.now().toString().slice(-5)}`;

    if (paymentMethod === 'Credit' && debtorId) {
      const targetDebtor = debtors.find(d => d.id === debtorId);
      setDebtors(prev => prev.map(d => d.id === debtorId ? { ...d, currentBalance: d.currentBalance + totalGross } : d));
      const creditRecord: DebtRecord = {
        id: `rec-${Date.now()}`,
        customerId: debtorId,
        customerName: targetDebtor?.name || 'Debtor',
        date: new Date().toISOString(),
        type: 'CREDIT_PURCHASE',
        amount: totalGross,
        referenceNo: txNo,
        description: `POS Credit: ${cart.map(c => `${c.quantity}x ${c.product.name}`).join(', ')}`,
        cashierName: currentUser ? currentUser.name : 'Cashier'
      };
      setDebtRecords(prev => [creditRecord, ...prev]);
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'POS_SALE',
      referenceId: txNo,
      referenceNo: txNo,
      description: paymentMethod === 'Credit' 
        ? `Credit Sale to ${debtors.find(d => d.id === debtorId)?.name || 'Debtor'} (${cart.map(c => `${c.quantity}x ${c.product.name}`).join(', ')})`
        : `POS Sale (${cart.map(c => `${c.quantity}x ${c.product.name}`).join(', ')})`,
      grossAmount: totalGross,
      costAmount: totalCost,
      profitAmount: totalProfit,
      paymentMethod,
      mpesaAmount: paymentMethod === 'Credit' ? 0 : mpesaAmount,
      cashAmount: paymentMethod === 'Credit' ? 0 : cashAmount,
      mpesaRef,
      cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Cashier')
    };

    setTransactions(prev => [newTx, ...prev]);

    if (activeShift && activeShift.status === 'Open' && paymentMethod !== 'Credit') {
      setActiveShift(prev => prev ? ({
        ...prev,
        totalCashExpected: prev.totalCashExpected + cashAmount,
        totalMpesaExpected: prev.totalMpesaExpected + mpesaAmount
      }) : null);
    }

    // Call backend API in background
    api.processPOSSale(cart, paymentMethod, mpesaAmount, cashAmount, mpesaRef, debtorId).catch(err => {
      console.warn('Backend POS sync:', err);
    });

    return newTx;
  };

  // Job Cards actions
  const createJobCard = (jobCardData: Omit<JobCard, 'id' | 'jobNo' | 'createdAt'>): JobCard => {
    const newJob: JobCard = {
      ...jobCardData,
      id: `job-${Date.now()}`,
      jobNo: `JOB-2026-${(jobCards.length + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString()
    };

    if (newJob.advanceDeposit > 0) {
      const depositTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'JOB_CARD',
        referenceId: newJob.id,
        referenceNo: newJob.jobNo,
        description: `Advance Deposit for ${newJob.carRegNo} (${newJob.carMakeModel})`,
        grossAmount: newJob.advanceDeposit,
        costAmount: 0,
        profitAmount: newJob.advanceDeposit,
        paymentMethod: newJob.paymentMethod || 'Mpesa',
        mpesaAmount: newJob.mpesaAmount || (newJob.paymentMethod === 'Mpesa' ? newJob.advanceDeposit : 0),
        cashAmount: newJob.cashAmount || (newJob.paymentMethod === 'Cash' ? newJob.advanceDeposit : 0),
        mpesaRef: newJob.mpesaRef,
        cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Cashier')
      };
      setTransactions(prev => [depositTx, ...prev]);

      if (activeShift && activeShift.status === 'Open') {
        setActiveShift(prev => prev ? ({
          ...prev,
          totalCashExpected: prev.totalCashExpected + depositTx.cashAmount,
          totalMpesaExpected: prev.totalMpesaExpected + depositTx.mpesaAmount
        }) : null);
      }
    }

    setJobCards(prev => [newJob, ...prev]);

    api.createJobCard(jobCardData).then(created => {
      setJobCards(prev => prev.map(j => j.id === newJob.id ? created : j));
    }).catch(err => console.warn('Backend createJobCard:', err));

    return newJob;
  };

  const updateJobCard = async (id: string, updates: Partial<JobCard>) => {
    setJobCards(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
    try {
      await api.updateJobCard(id, updates);
    } catch (e) {
      console.warn('Backend updateJobCard:', e);
    }
  };

  const settleJobCard = (
    id: string,
    paymentMethod: PaymentMethod,
    mpesaAmount: number,
    cashAmount: number,
    mpesaRef?: string
  ) => {
    const targetJob = jobCards.find(j => j.id === id);
    if (!targetJob) return;

    const totalPartsCost = targetJob.parts.reduce((s, p) => s + p.quantity * p.unitCostPrice, 0);
    const amountSettled = mpesaAmount + cashAmount;

    setProducts(prev => prev.map(prod => {
      const partUsed = targetJob.parts.find(p => !p.isOutsidePurchase && p.partId === prod.id);
      if (partUsed) {
        return { ...prod, stockQty: Math.max(0, prod.stockQty - partUsed.quantity) };
      }
      return prod;
    }));

    setJobCards(prev => prev.map(j => j.id === id ? {
      ...j,
      status: 'Delivered',
      completedAt: new Date().toISOString()
    } : j));

    const settleTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'JOB_CARD',
      referenceId: targetJob.id,
      referenceNo: targetJob.jobNo,
      description: `Final Settlement for ${targetJob.carRegNo} (${targetJob.carMakeModel})`,
      grossAmount: amountSettled,
      costAmount: totalPartsCost,
      profitAmount: amountSettled - totalPartsCost,
      paymentMethod,
      mpesaAmount,
      cashAmount,
      mpesaRef,
      cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Cashier')
    };

    setTransactions(prev => [settleTx, ...prev]);

    if (activeShift && activeShift.status === 'Open') {
      setActiveShift(prev => prev ? ({
        ...prev,
        totalCashExpected: prev.totalCashExpected + cashAmount,
        totalMpesaExpected: prev.totalMpesaExpected + mpesaAmount
      }) : null);
    }

    api.settleJobCard(id, paymentMethod, mpesaAmount, cashAmount, mpesaRef).catch(e => {
      console.warn('Backend settleJobCard:', e);
    });
  };

  // Yard Vehicles
  const addYardVehicle = async (vehicleData: Omit<YardVehicle, 'id' | 'isCleared'>) => {
    const localVehicle: YardVehicle = {
      ...vehicleData,
      id: `yard-${Date.now()}`,
      isCleared: false
    };
    setYardVehicles(prev => [localVehicle, ...prev]);
    try {
      const created = await api.addYardVehicle(vehicleData);
      setYardVehicles(prev => prev.map(v => v.id === localVehicle.id ? created : v));
    } catch (e) {
      console.warn('Backend addYardVehicle:', e);
    }
  };

  const updateYardVehicle = async (id: string, updates: Partial<YardVehicle>) => {
    setYardVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    try {
      await api.updateYardVehicle(id, updates);
    } catch (e) {
      console.warn('Backend updateYardVehicle:', e);
    }
  };

  const settleYardVehicle = (
    id: string,
    paymentMethod: PaymentMethod,
    amountPaid: number,
    mpesaRef?: string
  ) => {
    const target = yardVehicles.find(v => v.id === id);
    if (!target) return;

    const gatePass = `GP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setYardVehicles(prev => prev.map(v => v.id === id ? {
      ...v,
      paidAmount: v.paidAmount + amountPaid,
      isCleared: true,
      gatePassNo: gatePass,
      clearedAt: new Date().toISOString()
    } : v));

    if (amountPaid > 0) {
      const yardTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'YARD_FEE',
        referenceId: target.id,
        referenceNo: gatePass,
        description: `Yard Parking & Holding Fee Clearance (${target.carRegNo})`,
        grossAmount: amountPaid,
        costAmount: 0,
        profitAmount: amountPaid,
        paymentMethod,
        mpesaAmount: paymentMethod === 'Mpesa' ? amountPaid : 0,
        cashAmount: paymentMethod === 'Cash' ? amountPaid : 0,
        mpesaRef,
        cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Yard Security')
      };
      setTransactions(prev => [yardTx, ...prev]);

      if (activeShift && activeShift.status === 'Open') {
        setActiveShift(prev => prev ? ({
          ...prev,
          totalCashExpected: prev.totalCashExpected + (paymentMethod === 'Cash' ? amountPaid : 0),
          totalMpesaExpected: prev.totalMpesaExpected + (paymentMethod === 'Mpesa' ? amountPaid : 0)
        }) : null);
      }
    }

    api.settleYardVehicle(id, paymentMethod, amountPaid, mpesaRef).catch(e => {
      console.warn('Backend settleYardVehicle:', e);
    });
  };

  // Tools
  const addToolItem = async (toolData: Omit<ToolItem, 'id'>) => {
    const localTool: ToolItem = { ...toolData, id: `tool-${Date.now()}` };
    setTools(prev => [...prev, localTool]);
    try {
      const created = await api.addToolItem(toolData);
      setTools(prev => prev.map(t => t.id === localTool.id ? created : t));
    } catch (e) {
      console.warn('Backend addToolItem:', e);
    }
  };

  const updateToolItem = async (id: string, updates: Partial<ToolItem>) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      await api.updateToolItem(id, updates);
    } catch (e) {
      console.warn('Backend updateToolItem:', e);
    }
  };

  const rentOutTool = (rentalData: Omit<ToolRental, 'id' | 'status'>) => {
    const newRental: ToolRental = {
      ...rentalData,
      id: `rent-${Date.now()}`,
      status: 'Active'
    };

    setTools(prev => prev.map(t => t.id === rentalData.toolId ? { ...t, status: 'Rented' } : t));
    setToolRentals(prev => [newRental, ...prev]);

    const totalPaid = rentalData.totalHireFee + rentalData.depositPaid;
    const rentTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'TOOL_RENTAL',
      referenceId: newRental.id,
      referenceNo: `RENT-${newRental.toolCode}`,
      description: `Tool Hire (${newRental.toolName}) + Deposit to ${newRental.hirerName}`,
      grossAmount: totalPaid,
      costAmount: 0,
      profitAmount: newRental.totalHireFee,
      paymentMethod: newRental.paymentMethod,
      mpesaAmount: newRental.paymentMethod === 'Mpesa' ? totalPaid : 0,
      cashAmount: newRental.paymentMethod === 'Cash' ? totalPaid : 0,
      mpesaRef: newRental.mpesaRef,
      cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Tool Clerk')
    };
    setTransactions(prev => [rentTx, ...prev]);

    if (activeShift && activeShift.status === 'Open') {
      setActiveShift(prev => prev ? ({
        ...prev,
        totalCashExpected: prev.totalCashExpected + rentTx.cashAmount,
        totalMpesaExpected: prev.totalMpesaExpected + rentTx.mpesaAmount
      }) : null);
    }

    api.rentOutTool(rentalData).catch(e => {
      console.warn('Backend rentOutTool:', e);
    });
  };

  const returnTool = (rentalId: string, damageFee: number, depositRefunded: number) => {
    const targetRental = toolRentals.find(r => r.id === rentalId);
    if (!targetRental) return;

    setTools(prev => prev.map(t => t.id === targetRental.toolId ? { ...t, status: 'Available' } : t));

    setToolRentals(prev => prev.map(r => r.id === rentalId ? {
      ...r,
      damageFee,
      depositRefunded,
      actualReturnDate: new Date().toISOString(),
      status: 'Returned'
    } : r));

    api.returnTool(rentalId, damageFee, depositRefunded).catch(e => {
      console.warn('Backend returnTool:', e);
    });
  };

  // Debtors
  const addDebtorCustomer = async (debtorData: Omit<DebtorCustomer, 'id' | 'createdAt' | 'currentBalance'>) => {
    const localDebtor: DebtorCustomer = {
      ...debtorData,
      id: `debtor-${Date.now()}`,
      currentBalance: 0,
      createdAt: new Date().toISOString()
    };
    setDebtors(prev => [...prev, localDebtor]);
    try {
      const created = await api.addDebtorCustomer(debtorData);
      setDebtors(prev => prev.map(d => d.id === localDebtor.id ? created : d));
    } catch (e) {
      console.warn('Backend addDebtorCustomer:', e);
    }
  };

  const updateDebtorCustomer = async (id: string, updates: Partial<DebtorCustomer>) => {
    setDebtors(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    try {
      await api.updateDebtorCustomer(id, updates);
    } catch (e) {
      console.warn('Backend updateDebtorCustomer:', e);
    }
  };

  const recordDebtRepayment = (debtorId: string, amount: number, paymentMethod: PaymentMethod, mpesaRef?: string) => {
    const targetDebtor = debtors.find(d => d.id === debtorId);
    if (!targetDebtor) return;

    setDebtors(prev => prev.map(d => d.id === debtorId ? { ...d, currentBalance: Math.max(0, d.currentBalance - amount) } : d));

    const recNo = `REP-${Date.now().toString().slice(-6)}`;
    const newRecord: DebtRecord = {
      id: `rec-${Date.now()}`,
      customerId: debtorId,
      customerName: targetDebtor.name,
      date: new Date().toISOString(),
      type: 'DEBT_REPAYMENT',
      amount,
      referenceNo: recNo,
      description: `Debt Repayment received from ${targetDebtor.name}`,
      paymentMethod,
      mpesaRef,
      cashierName: currentUser ? currentUser.name : 'Cashier'
    };
    setDebtRecords(prev => [newRecord, ...prev]);

    const repayTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'DEBT_REPAYMENT',
      referenceId: debtorId,
      referenceNo: recNo,
      description: `Credit Debt Repayment - ${targetDebtor.name}`,
      grossAmount: amount,
      costAmount: 0,
      profitAmount: amount,
      paymentMethod,
      mpesaAmount: paymentMethod === 'Mpesa' ? amount : 0,
      cashAmount: paymentMethod === 'Cash' ? amount : 0,
      mpesaRef,
      cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Cashier')
    };
    setTransactions(prev => [repayTx, ...prev]);

    if (activeShift && activeShift.status === 'Open') {
      setActiveShift(prev => prev ? ({
        ...prev,
        totalCashExpected: prev.totalCashExpected + repayTx.cashAmount,
        totalMpesaExpected: prev.totalMpesaExpected + repayTx.mpesaAmount
      }) : null);
    }

    api.recordDebtRepayment(debtorId, amount, paymentMethod, mpesaRef).catch(e => {
      console.warn('Backend recordDebtRepayment:', e);
    });
  };

  // Vehicle History
  const getVehicleHistory = (carRegNo: string): VehicleHistoryResult => {
    const norm = carRegNo.replace(/\s+/g, '').toUpperCase();
    const relatedJobs = jobCards.filter(j => j.carRegNo.replace(/\s+/g, '').toUpperCase() === norm);
    const relatedYards = yardVehicles.filter(y => y.carRegNo.replace(/\s+/g, '').toUpperCase() === norm);

    const totalSpent = relatedJobs.reduce((sum, j) => {
      const labor = j.laborItems.reduce((s, l) => s + l.cost, 0);
      const parts = j.parts.reduce((s, p) => s + p.quantity * p.unitSellingPrice, 0);
      return sum + labor + parts;
    }, 0);

    const totalLaborDone = relatedJobs.reduce((sum, j) => {
      return sum + j.laborItems.reduce((s, l) => s + l.cost, 0);
    }, 0);

    const partsFitted: { name: string; quantity: number; date: string }[] = [];
    relatedJobs.forEach(j => {
      j.parts.forEach(p => {
        partsFitted.push({
          name: p.name,
          quantity: p.quantity,
          date: j.createdAt.split('T')[0]
        });
      });
    });

    return {
      jobCards: relatedJobs,
      yardStays: relatedYards,
      totalSpent,
      totalLaborDone,
      partsFitted
    };
  };

  // Shift management
  const startShift = async (cashierName: string, openingFloat: number) => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      cashierName,
      startTime: new Date().toISOString(),
      openingFloat,
      totalCashExpected: openingFloat,
      totalMpesaExpected: 0,
      status: 'Open'
    };
    setActiveShift(newShift);
    try {
      const created = await api.startShift(cashierName, openingFloat);
      setActiveShift(created);
    } catch (e) {
      console.warn('Backend startShift:', e);
    }
  };

  const endShift = async (actualClosingCash: number, notes?: string) => {
    if (!activeShift) return;
    const discrepancy = actualClosingCash - activeShift.totalCashExpected;
    const closedShift: Shift = {
      ...activeShift,
      closingCashActual: actualClosingCash,
      discrepancy,
      endTime: new Date().toISOString(),
      status: 'Closed',
      notes
    };
    setShiftHistory(prev => [closedShift, ...prev]);
    const shiftId = activeShift.id;
    setActiveShift(null);

    try {
      await api.endShift(shiftId, actualClosingCash, notes);
    } catch (e) {
      console.warn('Backend endShift:', e);
    }
  };

  // Stock Audit
  const recordStockAudit = async (auditData: Omit<StockAudit, 'id'>) => {
    const newAudit: StockAudit = {
      ...auditData,
      id: `audit-${Date.now()}`
    };
    setStockAudits(prev => [newAudit, ...prev]);
    try {
      await api.recordStockAudit(auditData);
    } catch (e) {
      console.warn('Backend recordStockAudit:', e);
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        products,
        jobCards,
        yardVehicles,
        tools,
        toolRentals,
        debtors,
        debtRecords,
        activeShift,
        shiftHistory,
        stockAudits,
        transactions,
        activeTab,
        setActiveTab,
        isOnline,
        addProduct,
        updateProduct,
        deleteProduct,
        processPOSSale,
        createJobCard,
        updateJobCard,
        settleJobCard,
        addYardVehicle,
        updateYardVehicle,
        settleYardVehicle,
        addToolItem,
        updateToolItem,
        rentOutTool,
        returnTool,
        addDebtorCustomer,
        updateDebtorCustomer,
        recordDebtRepayment,
        getVehicleHistory,
        startShift,
        endShift,
        recordStockAudit,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
