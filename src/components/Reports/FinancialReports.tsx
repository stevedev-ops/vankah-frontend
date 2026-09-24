import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, CircleDollarSign, Smartphone, Download, Printer, Filter, Calendar } from 'lucide-react';

export const FinancialReports: React.FC = () => {
  const { transactions } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredTransactions = transactions.filter(t => {
    const txTime = new Date(t.date).getTime();
    if (dateFilter === 'today') return txTime >= todayStart;
    if (dateFilter === 'month') return txTime >= monthStart;
    return true;
  });

  const totalGross = filteredTransactions.reduce((s, t) => s + t.grossAmount, 0);
  const totalCost = filteredTransactions.reduce((s, t) => s + t.costAmount, 0);
  const totalProfit = filteredTransactions.reduce((s, t) => s + t.profitAmount, 0);
  const totalMpesa = filteredTransactions.reduce((s, t) => s + t.mpesaAmount, 0);
  const totalCash = filteredTransactions.reduce((s, t) => s + t.cashAmount, 0);

  // By Stream
  const posSales = filteredTransactions.filter(t => t.type === 'POS_SALE');
  const posGross = posSales.reduce((s, t) => s + t.grossAmount, 0);
  const posProfit = posSales.reduce((s, t) => s + t.profitAmount, 0);

  const jobCards = filteredTransactions.filter(t => t.type === 'JOB_CARD');
  const jobGross = jobCards.reduce((s, t) => s + t.grossAmount, 0);
  const jobProfit = jobCards.reduce((s, t) => s + t.profitAmount, 0);

  const yardFees = filteredTransactions.filter(t => t.type === 'YARD_FEE');
  const yardGross = yardFees.reduce((s, t) => s + t.grossAmount, 0);

  const toolHires = filteredTransactions.filter(t => t.type === 'TOOL_RENTAL');
  const toolGross = toolHires.reduce((s, t) => s + t.grossAmount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Filter Banner */}
      <div className="erp-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#2563eb" />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setDateFilter('all')}
              className={`btn btn-sm ${dateFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`btn btn-sm ${dateFilter === 'month' ? 'btn-primary' : 'btn-outline'}`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`btn btn-sm ${dateFilter === 'today' ? 'btn-primary' : 'btn-outline'}`}
            >
              Today Only
            </button>
          </div>
        </div>

        <button onClick={handlePrint} className="btn btn-secondary">
          <Printer size={15} />
          <span>Print Financial Statement</span>
        </button>
      </div>

      {/* P&L Financial Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="erp-card" style={{ padding: '18px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Gross Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            KES {totalGross.toLocaleString()}
          </div>
        </div>

        <div className="erp-card" style={{ padding: '18px', borderLeft: '4px solid #e11d48' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cost of Goods & Expenses</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e11d48', fontFamily: 'var(--font-mono)' }}>
            KES {totalCost.toLocaleString()}
          </div>
        </div>

        <div className="erp-card" style={{ padding: '18px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Net Profit / Margin</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
            KES {totalProfit.toLocaleString()}
          </div>
        </div>

        <div className="erp-card" style={{ padding: '18px', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>M-Pesa vs Cash Breakdown</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>M-Pesa:</span> KES {totalMpesa.toLocaleString()}<br />
            <span style={{ color: '#059669', fontWeight: 700 }}>Cash:</span> KES {totalCash.toLocaleString()}
          </div>
        </div>
      </div>

      {/* PROFIT & LOSS BREAKDOWN TABLE */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Profit & Loss Breakdown by Business Stream
          </h3>
        </div>
        <div className="erp-card-body" style={{ padding: 0 }}>
          <div className="erp-table-wrapper" style={{ border: 'none' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Stream / Department</th>
                  <th>Transactions Count</th>
                  <th>Gross Turnover (KES)</th>
                  <th>Direct Costs (COGS)</th>
                  <th>Net Profit (KES)</th>
                  <th>Margin %</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1. Spare Parts Counter POS</strong></td>
                  <td>{posSales.length} Sales</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>KES {posGross.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>KES {(posGross - posProfit).toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>+KES {posProfit.toLocaleString()}</td>
                  <td>{posGross > 0 ? ((posProfit / posGross) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td><strong>2. Garage Workshop & Builds (Panel/Welding)</strong></td>
                  <td>{jobCards.length} Jobs</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>KES {jobGross.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>KES {(jobGross - jobProfit).toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>+KES {jobProfit.toLocaleString()}</td>
                  <td>{jobGross > 0 ? ((jobProfit / jobGross) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                  <td><strong>3. Yard & Field Storage (5,000 KES/wk)</strong></td>
                  <td>{yardFees.length} Entries</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>KES {yardGross.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>KES 0</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>+KES {yardGross.toLocaleString()}</td>
                  <td>100.0%</td>
                </tr>
                <tr>
                  <td><strong>4. Tool & Machinery Hire Desk</strong></td>
                  <td>{toolHires.length} Hires</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>KES {toolGross.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>KES 0</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>+KES {toolGross.toLocaleString()}</td>
                  <td>100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAILED TRANSACTION AUDIT LEDGER */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Master Transaction & Audit Trail ({filteredTransactions.length} records)
          </h3>
        </div>
        <div className="erp-card-body" style={{ padding: 0 }}>
          <div className="erp-table-wrapper" style={{ border: 'none' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Ref Number</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Gross (KES)</th>
                  <th>Payment Mode</th>
                  <th>M-Pesa Ref</th>
                  <th>Cashier / Admin</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(tx.date).toLocaleString()}</td>
                    <td><strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{tx.referenceNo}</strong></td>
                    <td>
                      <span className="badge badge-gray">{tx.type}</span>
                    </td>
                    <td style={{ fontSize: '0.825rem' }}>{tx.description}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0f172a' }}>
                      KES {tx.grossAmount.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${tx.paymentMethod === 'Mpesa' ? 'badge-blue' : tx.paymentMethod === 'Cash' ? 'badge-green' : 'badge-amber'}`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0284c7' }}>
                      {tx.mpesaRef || '-'}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{tx.cashierName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
