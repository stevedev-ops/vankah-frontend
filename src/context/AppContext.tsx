import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Product, JobCard, YardVehicle, ToolItem, ToolRental, 
  DebtorCustomer, DebtRecord, Shift, StockAudit, Transaction, 
  User, UserRole, CartItem, PaymentMethod 
} from '../types';
import { api } from '../services/api';

export interface VehicleHistoryResult {
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

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadSaved('erp_currentUser', null));

  const [products, setProducts] = useState<Product[]>(() => loadSaved('erp_products', []));
  const [jobCards, setJobCards] = useState<JobCard[]>(() => loadSaved('erp_jobCards', []));
  const [yardVehicles, setYardVehicles] = useState<YardVehicle[]>(() => loadSaved('erp_yardVehicles', []));
  const [tools, setTools] = useState<ToolItem[]>(() => loadSaved('erp_tools', []));
  const [toolRentals, setToolRentals] = useState<ToolRental[]>(() => loadSaved('erp_toolRentals', []));
  const [debtors, setDebtors] = useState<DebtorCustomer[]>(() => loadSaved('erp_debtors', []));
  const [debtRecords, setDebtRecords] = useState<DebtRecord[]>(() => loadSaved('erp_debtRecords', []));
  const [activeShift, setActiveShift] = useState<Shift | null>(() => loadSaved('erp_activeShift', null));
  const [shiftHistory, setShiftHistory] = useState<Shift[]>(() => loadSaved('erp_shiftHistory', []));
  const [stockAudits, setStockAudits] = useState<StockAudit[]>(() => loadSaved('erp_stockAudits', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadSaved('erp_transactions', []));
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Sync state changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('erp_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('erp_currentUser');
    }
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('erp_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('erp_jobCards', JSON.stringify(jobCards)); }, [jobCards]);
  useEffect(() => { localStorage.setItem('erp_yardVehicles', JSON.stringify(yardVehicles)); }, [yardVehicles]);
  useEffect(() => { localStorage.setItem('erp_tools', JSON.stringify(tools)); }, [tools]);
  useEffect(() => { localStorage.setItem('erp_toolRentals', JSON.stringify(toolRentals)); }, [toolRentals]);
  useEffect(() => { localStorage.setItem('erp_debtors', JSON.stringify(debtors)); }, [debtors]);
  useEffect(() => { localStorage.setItem('erp_debtRecords', JSON.stringify(debtRecords)); }, [debtRecords]);
  useEffect(() => { 
    if (activeShift) {
      localStorage.setItem('erp_activeShift', JSON.stringify(activeShift));
    } else {
      localStorage.removeItem('erp_activeShift');
    }
  }, [activeShift]);
  useEffect(() => { localStorage.setItem('erp_shiftHistory', JSON.stringify(shiftHistory)); }, [shiftHistory]);
  useEffect(() => { localStorage.setItem('erp_stockAudits', JSON.stringify(stockAudits)); }, [stockAudits]);
  useEffect(() => { localStorage.setItem('erp_transactions', JSON.stringify(transactions)); }, [transactions]);

  // Fetch initial data from Django backend
  useEffect(() => {
    async function fetchAll() {
      try {
        const [
          prods, jobs, yards, tls, rents, dbts, dbtRecs, shifts, txs, audits, curShift
        ] = await Promise.all([
          api.getProducts().catch(() => null),
          api.getJobCards().catch(() => null),
          api.getYardVehicles().catch(() => null),
          api.getTools().catch(() => null),
          api.getToolRentals().catch(() => null),
          api.getDebtors().catch(() => null),
          api.getDebtRecords().catch(() => null),
          api.getShifts().catch(() => null),
          api.getTransactions().catch(() => null),
          api.getStockAudits().catch(() => null),
          api.getActiveShift().catch(() => null),
        ]);

        if (Array.isArray(prods) && prods.length > 0) setProducts(prods);
        if (Array.isArray(jobs) && jobs.length > 0) setJobCards(jobs);
        if (Array.isArray(yards) && yards.length > 0) setYardVehicles(yards);
        if (Array.isArray(tls) && tls.length > 0) setTools(tls);
        if (Array.isArray(rents) && rents.length > 0) setToolRentals(rents);
        if (Array.isArray(dbts) && dbts.length > 0) setDebtors(dbts);
        if (Array.isArray(dbtRecs) && dbtRecs.length > 0) setDebtRecords(dbtRecs);
        if (Array.isArray(shifts) && shifts.length > 0) setShiftHistory(shifts);
        if (Array.isArray(txs) && txs.length > 0) setTransactions(txs);
        if (Array.isArray(audits) && audits.length > 0) setStockAudits(audits);
        if (curShift) setActiveShift(curShift);

        setIsOnline(true);
      } catch (err) {
        console.warn('Django backend unreachable, continuing in offline/client mode:', err);
        setIsOnline(false);
      }
    }
    fetchAll();
  }, []);

  // Authentication
  const login = (role: UserRole, pin: string): boolean => {
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
    const localProd: Product = { ...productData, id: `prod-${Date.now()}` };
    setProducts(prev => [localProd, ...prev]);

    try {
      const created = await api.addProduct(productData);
      setProducts(prev => prev.map(p => p.id === localProd.id ? created : p));
    } catch (e) {
      console.warn('Backend addProduct failed (stored locally):', e);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    try {
      await api.updateProduct(id, updates);
    } catch (e) {
      console.warn('Backend updateProduct failed (stored locally):', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await api.deleteProduct(id);
    } catch (e) {
      console.warn('Backend deleteProduct failed (stored locally):', e);
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

    // Optimistic stock reduction
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
        customerName: targetDebtor ? targetDebtor.name : 'Credit Customer',
        date: new Date().toISOString(),
        type: 'CREDIT_PURCHASE',
        amount: totalGross,
        referenceNo: txNo,
        description: cart.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
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
      description: cart.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
      grossAmount: totalGross,
      costAmount: totalCost,
      profitAmount: totalProfit,
      paymentMethod,
      mpesaAmount: paymentMethod === 'Mpesa' ? totalGross : (paymentMethod === 'Split' ? mpesaAmount : 0),
      cashAmount: paymentMethod === 'Cash' ? totalGross : (paymentMethod === 'Split' ? cashAmount : 0),
      mpesaRef,
      cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Cashier')
    };

    setTransactions(prev => [newTx, ...prev]);

    // Update active shift float expected
    if (activeShift && activeShift.status === 'Open' && paymentMethod !== 'Credit') {
      setActiveShift(prev => prev ? ({
        ...prev,
        totalCashExpected: prev.totalCashExpected + newTx.cashAmount,
        totalMpesaExpected: prev.totalMpesaExpected + newTx.mpesaAmount
      }) : null);
    }

    // Sync to backend
    api.processPOSSale(cart, paymentMethod, mpesaAmount, cashAmount, mpesaRef, debtorId).catch(e => {
      console.warn('Backend processPOSSale failed (stored locally):', e);
    });

    return newTx;
  };

  // Job Cards
  const createJobCard = (jobCardData: Omit<JobCard, 'id' | 'jobNo' | 'createdAt'>): JobCard => {
    const now = new Date();
    const jobNo = `JOB-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newJob: JobCard = {
      ...jobCardData,
      id: `job-${Date.now()}`,
      jobNo,
      createdAt: now.toISOString(),
      status: jobCardData.status || 'Intake',
    };

    setJobCards(prev => [newJob, ...prev]);

    if (newJob.advanceDeposit > 0) {
      const advTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'JOB_ADVANCE',
        referenceId: newJob.id,
        referenceNo: newJob.jobNo,
        description: `Advance Deposit for ${newJob.carRegNo} (${newJob.carMakeModel})`,
        grossAmount: newJob.advanceDeposit,
        costAmount: 0,
        profitAmount: newJob.advanceDeposit,
        paymentMethod: 'Cash',
        mpesaAmount: 0,
        cashAmount: newJob.advanceDeposit,
        cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Service Advisor')
      };
      setTransactions(prev => [advTx, ...prev]);

      if (activeShift && activeShift.status === 'Open') {
        setActiveShift(prev => prev ? ({
          ...prev,
          totalCashExpected: prev.totalCashExpected + newJob.advanceDeposit
        }) : null);
      }
    }

    api.createJobCard(jobCardData).then(created => {
      setJobCards(prev => prev.map(j => j.id === newJob.id ? created : j));
    }).catch(e => {
      console.warn('Backend createJobCard:', e);
    });

    return newJob;
  };

  const updateJobCard = (id: string, updates: Partial<JobCard>) => {
    setJobCards(prev => prev.map(j => {
      if (j.id === id) {
        const updated = { ...j, ...updates };
        if (updates.status === 'Delivered' && !j.completedAt) {
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      }
      return j;
    }));

    api.updateJobCard(id, updates).catch(e => {
      console.warn('Backend updateJobCard:', e);
    });
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

    const totalLabor = targetJob.laborItems.reduce((sum, item) => sum + item.cost, 0);
    const totalPartsSelling = targetJob.parts.reduce((sum, p) => sum + p.unitSellingPrice * p.quantity, 0);
    const totalPartsCost = targetJob.parts.reduce((sum, p) => sum + p.unitCostPrice * p.quantity, 0);
    const totalBill = totalLabor + totalPartsSelling;
    const remainingBalance = totalBill - targetJob.advanceDeposit;

    setJobCards(prev => prev.map(j => {
      if (j.id === id) {
        return {
          ...j,
          status: 'Delivered',
          paymentMethod,
          mpesaAmount,
          cashAmount,
          mpesaRef,
          completedAt: new Date().toISOString()
        };
      }
      return j;
    }));

    if (remainingBalance > 0) {
      const settlementTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'JOB_CARD',
        referenceId: targetJob.id,
        referenceNo: targetJob.jobNo,
        description: `Final Settlement for ${targetJob.carRegNo} (${targetJob.carMakeModel})`,
        grossAmount: remainingBalance,
        costAmount: totalPartsCost,
        profitAmount: remainingBalance - totalPartsCost,
        paymentMethod,
        mpesaAmount: paymentMethod === 'Mpesa' ? remainingBalance : (paymentMethod === 'Split' ? mpesaAmount : 0),
        cashAmount: paymentMethod === 'Cash' ? remainingBalance : (paymentMethod === 'Split' ? cashAmount : 0),
        mpesaRef,
        cashierName: currentUser ? currentUser.name : (activeShift ? activeShift.cashierName : 'Cashier')
      };
      setTransactions(prev => [settlementTx, ...prev]);

      if (activeShift && activeShift.status === 'Open') {
        setActiveShift(prev => prev ? ({
          ...prev,
          totalCashExpected: prev.totalCashExpected + settlementTx.cashAmount,
          totalMpesaExpected: prev.totalMpesaExpected + settlementTx.mpesaAmount
        }) : null);
      }
    }

    api.settleJobCard(id, paymentMethod, mpesaAmount, cashAmount, mpesaRef).catch(e => {
      console.warn('Backend settleJobCard:', e);
    });
  };

  // Yard Vehicles
  const addYardVehicle = (vehicleData: Omit<YardVehicle, 'id' | 'isCleared'>) => {
    const localVehicle: YardVehicle = {
      ...vehicleData,
      id: `yard-${Date.now()}`,
      isCleared: false
    };
    setYardVehicles(prev => [localVehicle, ...prev]);

    api.addYardVehicle(vehicleData).then(created => {
      setYardVehicles(prev => prev.map(v => v.id === localVehicle.id ? created : v));
    }).catch(e => {
      console.warn('Backend addYardVehicle:', e);
    });
  };

  const updateYardVehicle = (id: string, updates: Partial<YardVehicle>) => {
    setYardVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    api.updateYardVehicle(id, updates).catch(e => {
      console.warn('Backend updateYardVehicle:', e);
    });
  };

  const settleYardVehicle = (
    id: string,
    paymentMethod: PaymentMethod,
    amountPaid: number,
    mpesaRef?: string
  ) => {
    const targetVehicle = yardVehicles.find(v => v.id === id);
    if (!targetVehicle) return;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanPlate = targetVehicle.carRegNo.replace(/\s+/g, '').toUpperCase();
    const gatePassNo = `GP-${dateStr}-${cleanPlate}`;

    setYardVehicles(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          paidAmount: v.paidAmount + amountPaid,
          isCleared: true,
          gatePassNo,
          clearedAt: new Date().toISOString()
        };
      }
      return v;
    }));

    if (amountPaid > 0) {
      const yardTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'YARD_FEE',
        referenceId: targetVehicle.id,
        referenceNo: gatePassNo,
        description: `Yard Storage Fee Clearance for ${targetVehicle.carRegNo}`,
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
          totalCashExpected: prev.totalCashExpected + yardTx.cashAmount,
          totalMpesaExpected: prev.totalMpesaExpected + yardTx.mpesaAmount
        }) : null);
      }
    }

    api.settleYardVehicle(id, paymentMethod, amountPaid, mpesaRef).catch(e => {
      console.warn('Backend settleYardVehicle:', e);
    });
  };

  // Tools & Rental
  const addToolItem = (toolData: Omit<ToolItem, 'id'>) => {
    const localTool: ToolItem = { ...toolData, id: `tool-${Date.now()}` };
    setTools(prev => [...prev, localTool]);

    api.addToolItem(toolData).then(created => {
      setTools(prev => prev.map(t => t.id === localTool.id ? created : t));
    }).catch(e => {
      console.warn('Backend addToolItem:', e);
    });
  };

  const updateToolItem = (id: string, updates: Partial<ToolItem>) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    api.updateToolItem(id, updates).catch(e => {
      console.warn('Backend updateToolItem:', e);
    });
  };

  const rentOutTool = (rentalData: Omit<ToolRental, 'id' | 'status'>) => {
    const newRental: ToolRental = {
      ...rentalData,
      id: `rent-${Date.now()}`,
      status: 'Active'
    };

    setToolRentals(prev => [newRental, ...prev]);
    setTools(prev => prev.map(t => t.id === rentalData.toolId ? { ...t, status: 'Rented' } : t));

    const totalPaid = newRental.totalHireFee + newRental.depositPaid;
    const rentTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'TOOL_RENTAL',
      referenceId: newRental.id,
      referenceNo: `RENT-${newRental.toolCode}`,
      description: `Tool Hire: ${newRental.toolName} to ${newRental.hirerName}`,
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
      const parts = j.parts.reduce((sum, p) => sum + p.quantity * p.unitSellingPrice, 0);
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
      if (created && created.id) {
        setActiveShift(created);
      }
    } catch (e) {
      console.warn('Backend startShift (saved locally):', e);
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
      console.warn('Backend endShift (saved locally):', e);
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
      console.warn('Backend recordStockAudit (saved locally):', e);
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
