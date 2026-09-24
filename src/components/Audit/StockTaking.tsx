import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StockAuditItem } from '../../types';
import { ClipboardCheck, CheckCircle2, AlertTriangle, Save, RefreshCw } from 'lucide-react';

export const StockTaking: React.FC = () => {
  const { products, recordStockAudit, stockAudits } = useApp();

  const [auditorName, setAuditorName] = useState('Master Admin');
  const [counts, setCounts] = useState<{ [productId: string]: number }>(() => {
    const initial: { [productId: string]: number } = {};
    products.forEach(p => {
      initial[p.id] = p.stockQty;
    });
    return initial;
  });

  const handleCountChange = (productId: string, val: number) => {
    setCounts(prev => ({
      ...prev,
      [productId]: Math.max(0, val)
    }));
  };

  // Build audit items
  const auditItems: StockAuditItem[] = products.map(p => {
    const counted = counts[p.id] !== undefined ? counts[p.id] : p.stockQty;
    const varianceQty = counted - p.stockQty;
    const varianceValueKes = varianceQty * p.buyingPrice;
    return {
      id: `audit-item-${p.id}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      imeiOrSerial: p.imeiOrSerial,
      systemQty: p.stockQty,
      countedQty: counted,
      varianceQty,
      buyingPrice: p.buyingPrice,
      varianceValueKes
    };
  });

  const totalVarianceValueKes = auditItems.reduce((sum, item) => sum + item.varianceValueKes, 0);

  const handleSaveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm(`Apply stock audit adjustments? Total inventory variance value: KES ${totalVarianceValueKes.toLocaleString()}`)) {
      recordStockAudit({
        auditDate: new Date().toISOString(),
        conductedBy: auditorName,
        items: auditItems,
        totalVarianceValueKes,
        status: 'Approved'
      });
      alert('Stock audit applied! Physical stock counts have been updated in inventory.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div className="erp-card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Physical Stock Taking & Inventory Variance Audit
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Count physical quantities on shelves. The system automatically computes shrinkage/loss in KES.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Auditor Name:</span>
              <input
                type="text"
                className="form-input"
                style={{ width: '160px', padding: '4px 8px', fontSize: '0.825rem' }}
                value={auditorName}
                onChange={e => setAuditorName(e.target.value)}
              />
            </div>
            <button
              onClick={handleSaveAudit}
              className="btn btn-primary"
              style={{ height: '36px' }}
            >
              <Save size={15} />
              <span>Apply & Lock Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Form Table */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardCheck size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Physical vs System Count Reconciliation
            </h3>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            Total Shrinkage / Variance Value:{' '}
            <span style={{ fontFamily: 'var(--font-mono)', color: totalVarianceValueKes < 0 ? '#e11d48' : totalVarianceValueKes > 0 ? '#10b981' : '#64748b' }}>
              KES {totalVarianceValueKes.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="erp-card-body" style={{ padding: 0 }}>
          <div className="erp-table-wrapper" style={{ border: 'none' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Product / SKU</th>
                  <th>Serial / IMEI</th>
                  <th>Unit Cost (KES)</th>
                  <th style={{ textAlign: 'center' }}>System Expected Qty</th>
                  <th style={{ textAlign: 'center' }}>Physical Count</th>
                  <th style={{ textAlign: 'center' }}>Qty Variance</th>
                  <th style={{ textAlign: 'right' }}>Monetary Variance (KES)</th>
                </tr>
              </thead>
              <tbody>
                {auditItems.map(item => (
                  <tr key={item.productId}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{item.productName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.sku}</div>
                    </td>
                    <td>
                      {item.imeiOrSerial ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#0284c7' }}>
                          {item.imeiOrSerial}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      KES {item.buyingPrice.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#475569' }}>
                      {item.systemQty}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        style={{ width: '70px', textAlign: 'center', padding: '4px 6px', fontWeight: 800 }}
                        value={item.countedQty}
                        onChange={e => handleCountChange(item.productId, Number(e.target.value))}
                      />
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>
                      <span style={{ color: item.varianceQty < 0 ? '#e11d48' : item.varianceQty > 0 ? '#10b981' : '#64748b' }}>
                        {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      <span style={{ color: item.varianceValueKes < 0 ? '#e11d48' : item.varianceValueKes > 0 ? '#10b981' : '#64748b' }}>
                        {item.varianceValueKes > 0 ? `+KES ${item.varianceValueKes.toLocaleString()}` : `KES ${item.varianceValueKes.toLocaleString()}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Past Audits Log */}
      {stockAudits.length > 0 && (
        <div className="erp-card">
          <div className="erp-card-header">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Past Stock Audits History ({stockAudits.length})
            </h3>
          </div>
          <div className="erp-card-body" style={{ padding: 0 }}>
            <div className="erp-table-wrapper" style={{ border: 'none' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Audit Date</th>
                    <th>Auditor</th>
                    <th>Items Audited</th>
                    <th>Total Variance Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stockAudits.map(audit => (
                    <tr key={audit.id}>
                      <td>{new Date(audit.auditDate).toLocaleString()}</td>
                      <td><strong>{audit.conductedBy}</strong></td>
                      <td>{audit.items.length} SKUs</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: audit.totalVarianceValueKes < 0 ? '#e11d48' : '#10b981' }}>
                        KES {audit.totalVarianceValueKes.toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-green">Approved & Synchronized</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
