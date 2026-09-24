import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  CircleDollarSign, 
  Smartphone, 
  Package, 
  Wrench, 
  ParkingSquare, 
  Hammer, 
  ArrowUpRight, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface OverviewTabProps {
  onOpenQuickAction: () => void;
  onSelectJob?: (jobId: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onOpenQuickAction }) => {
  const { 
    transactions, 
    products, 
    jobCards, 
    yardVehicles, 
    toolRentals, 
    setActiveTab 
  } = useApp();

  // Financial aggregates
  const totalGrossRevenue = transactions.reduce((sum, t) => sum + t.grossAmount, 0);
  const totalCost = transactions.reduce((sum, t) => sum + t.costAmount, 0);
  const totalNetProfit = transactions.reduce((sum, t) => sum + t.profitAmount, 0);
  const totalMpesa = transactions.reduce((sum, t) => sum + t.mpesaAmount, 0);
  const totalCash = transactions.reduce((sum, t) => sum + t.cashAmount, 0);

  // Revenue by stream
  const posRevenue = transactions.filter(t => t.type === 'POS_SALE').reduce((s, t) => s + t.grossAmount, 0);
  const jobRevenue = transactions.filter(t => t.type === 'JOB_CARD').reduce((s, t) => s + t.grossAmount, 0);
  const yardRevenue = transactions.filter(t => t.type === 'YARD_FEE').reduce((s, t) => s + t.grossAmount, 0);
  const toolRevenue = transactions.filter(t => t.type === 'TOOL_RENTAL').reduce((s, t) => s + t.grossAmount, 0);

  // Stock valuation
  const totalStockCostValuation = products.reduce((s, p) => s + p.stockQty * p.buyingPrice, 0);
  const totalStockRetailValuation = products.reduce((s, p) => s + p.stockQty * p.sellingPrice, 0);
  const lowStockItems = products.filter(p => p.stockQty <= p.minAlertQty);

  // Active operations
  const activeJobs = jobCards.filter(j => j.status !== 'Delivered');
  const activeYardCars = yardVehicles.filter(y => !y.isCleared);
  const activeRentals = toolRentals.filter(t => t.status === 'Active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. TOP EXECUTIVE FINANCIAL KPIS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '16px'
      }}>
        {/* Gross Revenue Card */}
        <div className="erp-card" style={{ padding: '20px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Gross Revenue
            </span>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            KES {totalGrossRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#10b981', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> Unified Multi-Stream Ledger
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="erp-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Net Profit Margin
            </span>
            <span style={{ background: '#ecfdf5', color: '#10b981', padding: '6px', borderRadius: '8px' }}>
              <CircleDollarSign size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
            KES {totalNetProfit.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '4px' }}>
            {totalGrossRevenue > 0 ? ((totalNetProfit / totalGrossRevenue) * 100).toFixed(1) : 0}% Net Return on Turnover
          </div>
        </div>

        {/* M-Pesa vs Cash Drawer */}
        <div className="erp-card" style={{ padding: '20px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Payment Balances
            </span>
            <span style={{ background: '#f0f9ff', color: '#0284c7', padding: '6px', borderRadius: '8px' }}>
              <Smartphone size={18} />
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: '#0284c7', fontWeight: 600 }}>M-Pesa Collections:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {totalMpesa.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: '#059669', fontWeight: 600 }}>Cash in Drawer:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {totalCash.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Stock Asset Valuation */}
        <div className="erp-card" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Stock Asset Value
            </span>
            <span style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '6px', borderRadius: '8px' }}>
              <Package size={18} />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            KES {totalStockRetailValuation.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '4px' }}>
            Cost Base: KES {totalStockCostValuation.toLocaleString()} ({products.length} SKUs)
          </div>
        </div>
      </div>

      {/* 2. REVENUE STREAMS BREAKDOWN & FAST ACTION PROMPTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Revenue Distribution */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Revenue Channels Breakdown
            </h3>
            <span className="badge badge-blue">Real-Time</span>
          </div>
          <div className="erp-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Parts POS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                  <Package size={14} color="#2563eb" /> Spare Parts Counter POS
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {posRevenue.toLocaleString()}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalGrossRevenue > 0 ? (posRevenue / totalGrossRevenue) * 100 : 0}%`, height: '100%', background: '#2563eb', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Garage Jobs */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                  <Wrench size={14} color="#8b5cf6" /> Garage Job Cards (Panel/Welding/Repairs)
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {jobRevenue.toLocaleString()}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalGrossRevenue > 0 ? (jobRevenue / totalGrossRevenue) * 100 : 0}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Yard & Storage */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                  <ParkingSquare size={14} color="#f59e0b" /> Yard Parking & Field Money (5k/wk)
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {yardRevenue.toLocaleString()}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalGrossRevenue > 0 ? (yardRevenue / totalGrossRevenue) * 100 : 0}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* Tool Rentals */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                  <Hammer size={14} color="#10b981" /> Tool & Equipment Hire (Body Jacks, Handles)
                </span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {toolRevenue.toLocaleString()}</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalGrossRevenue > 0 ? (toolRevenue / totalGrossRevenue) * 100 : 0}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Status Radar */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Live Workshop & Yard Radar
            </h3>
            <button onClick={onOpenQuickAction} className="btn btn-sm btn-outline">
              + New Entry
            </button>
          </div>
          <div className="erp-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Active Jobs */}
            <div 
              onClick={() => setActiveTab('garage')}
              style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#2563eb', marginBottom: '4px' }}>
                <Wrench size={18} />
                <span className="badge badge-blue">{activeJobs.length} Active</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{activeJobs.length} Cars</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>In Panel / Welding / Build</div>
            </div>

            {/* Yard Cars */}
            <div 
              onClick={() => setActiveTab('yard')}
              style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#8b5cf6', marginBottom: '4px' }}>
                <ParkingSquare size={18} />
                <span className="badge badge-purple">{activeYardCars.length} Parked</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{activeYardCars.length} Vehicles</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Accruing 5k/Wk Field Rate</div>
            </div>

            {/* Tool Rentals */}
            <div 
              onClick={() => setActiveTab('tools')}
              style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981', marginBottom: '4px' }}>
                <Hammer size={18} />
                <span className="badge badge-green">{activeRentals.length} Out</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{activeRentals.length} Tools</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Body Jacks, Handles on Hire</div>
            </div>

            {/* Low Stock Warnings */}
            <div 
              onClick={() => setActiveTab('inventory')}
              style={{ background: lowStockItems.length > 0 ? '#fffbeb' : '#f8fafc', padding: '14px', borderRadius: '8px', border: lowStockItems.length > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: lowStockItems.length > 0 ? '#d97706' : '#64748b', marginBottom: '4px' }}>
                <AlertTriangle size={18} />
                <span className={`badge ${lowStockItems.length > 0 ? 'badge-amber' : 'badge-gray'}`}>
                  {lowStockItems.length} Low
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{lowStockItems.length} SKUs</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Below Safety Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE CAR BUILDS & RECENT TRANSACTIONS TABLE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Active Garage Builds */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={16} color="#2563eb" /> Active Garage Works & Car Builds
            </h3>
            <button onClick={() => setActiveTab('garage')} className="btn btn-sm btn-outline">
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="erp-card-body" style={{ padding: 0 }}>
            {activeJobs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No active vehicles in the workshop</div>
            ) : (
              <div className="erp-table-wrapper" style={{ border: 'none' }}>
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Vehicle / Plate</th>
                      <th>Stage / Scope</th>
                      <th>Total Bill</th>
                      <th>Deposit Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeJobs.map(job => {
                      const totalLabor = job.laborItems.reduce((s, l) => s + l.cost, 0);
                      const totalParts = job.parts.reduce((s, p) => s + p.quantity * p.unitSellingPrice, 0);
                      const totalBill = totalLabor + totalParts;
                      return (
                        <tr key={job.id}>
                          <td>
                            <strong style={{ color: '#0f172a' }}>{job.carRegNo}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.carMakeModel}</div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.775rem', color: '#334155' }}>
                              {job.laborItems.map(l => l.type).join(', ')}
                            </div>
                            {job.parts.some(p => p.isOutsidePurchase) && (
                              <span className="badge badge-purple" style={{ fontSize: '0.675rem', padding: '1px 5px', marginTop: '2px' }}>
                                Outside Part
                              </span>
                            )}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            KES {totalBill.toLocaleString()}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: '#059669' }}>
                            KES {job.advanceDeposit.toLocaleString()}
                          </td>
                          <td>
                            <span className={`badge ${job.status === 'Ready' ? 'badge-green' : 'badge-blue'}`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Ledger Activity */}
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#059669" /> Recent Operations Ledger
            </h3>
            <button onClick={() => setActiveTab('reports')} className="btn btn-sm btn-outline">
              Full Statement <ChevronRight size={14} />
            </button>
          </div>
          <div className="erp-card-body" style={{ padding: 0 }}>
            <div className="erp-table-wrapper" style={{ border: 'none' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Ref / Type</th>
                    <th>Description</th>
                    <th>Payment</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map(tx => (
                    <tr key={tx.id}>
                      <td>
                        <strong style={{ fontSize: '0.775rem' }}>{tx.referenceNo}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{tx.type.replace('_', ' ')}</div>
                      </td>
                      <td style={{ fontSize: '0.775rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description}
                      </td>
                      <td>
                        <span className={`badge ${tx.paymentMethod === 'Mpesa' ? 'badge-blue' : tx.paymentMethod === 'Cash' ? 'badge-green' : 'badge-amber'}`}>
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                        KES {tx.grossAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
