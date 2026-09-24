import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, CircleDollarSign, Smartphone, AlertTriangle, CheckCircle, Lock, Play } from 'lucide-react';

export const ShiftManagement: React.FC = () => {
  const { activeShift, shiftHistory, startShift, endShift, transactions } = useApp();

  const [cashierName, setCashierName] = useState('Owner / Master Admin');
  const [openingFloat, setOpeningFloat] = useState<number>(5000);
  const [actualClosingCash, setActualClosingCash] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    startShift(cashierName, openingFloat);
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    endShift(actualClosingCash, notes);
    setShowCloseModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. CURRENT ACTIVE SHIFT STATUS */}
      <div className="erp-card" style={{ borderLeft: activeShift ? '4px solid #10b981' : '4px solid #ef4444' }}>
        <div className="erp-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color={activeShift ? '#10b981' : '#ef4444'} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              {activeShift ? 'Current Active Register Shift' : 'No Active Shift (Register Closed)'}
            </h3>
          </div>
          {activeShift && (
            <button
              onClick={() => {
                setActualClosingCash(activeShift.totalCashExpected);
                setShowCloseModal(true);
              }}
              className="btn btn-danger btn-sm"
            >
              <Lock size={14} />
              <span>Close Shift & Reconcile Drawer</span>
            </button>
          )}
        </div>

        <div className="erp-card-body">
          {activeShift ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Shift Operator:</div>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{activeShift.cashierName}</strong>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                  Started: {new Date(activeShift.startTime).toLocaleTimeString()}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Opening Float:</div>
                <strong style={{ fontSize: '1.15rem', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                  KES {activeShift.openingFloat.toLocaleString()}
                </strong>
              </div>

              <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #86efac' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534' }}>Expected Cash in Drawer:</div>
                <strong style={{ fontSize: '1.15rem', color: '#166534', fontFamily: 'var(--font-mono)' }}>
                  KES {activeShift.totalCashExpected.toLocaleString()}
                </strong>
              </div>

              <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>Expected M-Pesa Total:</div>
                <strong style={{ fontSize: '1.15rem', color: '#1e40af', fontFamily: 'var(--font-mono)' }}>
                  KES {activeShift.totalMpesaExpected.toLocaleString()}
                </strong>
              </div>
            </div>
          ) : (
            <form onSubmit={handleStartShift} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label className="form-label">Operator / Cashier Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={cashierName}
                  onChange={e => setCashierName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Opening Cash Float (KES)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={openingFloat}
                  onChange={e => setOpeningFloat(Number(e.target.value))}
                />
              </div>
              <button type="submit" className="btn btn-success" style={{ height: '38px' }}>
                <Play size={16} />
                <span>Open Shift</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 2. SHIFT HANDOVER HISTORY */}
      <div className="erp-card">
        <div className="erp-card-header">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Shift Drawer Reconciliation History ({shiftHistory.length})
          </h3>
        </div>
        <div className="erp-card-body" style={{ padding: 0 }}>
          {shiftHistory.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              No closed shifts recorded yet. Closed shifts will appear here with cash variance audits.
            </div>
          ) : (
            <div className="erp-table-wrapper" style={{ border: 'none' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Date / Operator</th>
                    <th>Opening Float</th>
                    <th>M-Pesa Recorded</th>
                    <th>Expected Cash</th>
                    <th>Actual Cash Count</th>
                    <th>Discrepancy / Variance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftHistory.map(shift => (
                    <tr key={shift.id}>
                      <td>
                        <strong>{shift.cashierName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(shift.startTime).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        KES {shift.openingFloat.toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                        KES {shift.totalMpesaExpected.toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        KES {shift.totalCashExpected.toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        KES {(shift.closingCashActual || 0).toLocaleString()}
                      </td>
                      <td>
                        <strong style={{
                          fontFamily: 'var(--font-mono)',
                          color: (shift.discrepancy || 0) < 0 ? '#e11d48' : (shift.discrepancy || 0) > 0 ? '#10b981' : '#64748b'
                        }}>
                          {(shift.discrepancy || 0) === 0 ? 'Exact Match (0)' : `KES ${(shift.discrepancy || 0).toLocaleString()}`}
                        </strong>
                      </td>
                      <td>
                        <span className="badge badge-gray">Closed & Audited</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CLOSE SHIFT MODAL */}
      {showCloseModal && activeShift && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                End Shift & Count Cash Drawer
              </h3>
              <button onClick={() => setShowCloseModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <form onSubmit={handleCloseShift}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Expected Cash in Drawer:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {activeShift.totalCashExpected.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Expected M-Pesa:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#0284c7' }}>KES {activeShift.totalMpesaExpected.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Cash Counted in Drawer (KES) *</label>
                  <input
                    type="number"
                    required
                    className="form-input"
                    value={actualClosingCash}
                    onChange={e => setActualClosingCash(Number(e.target.value))}
                  />
                </div>

                {/* Variance Preview */}
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: actualClosingCash - activeShift.totalCashExpected < 0 ? '#fff1f2' : actualClosingCash - activeShift.totalCashExpected > 0 ? '#ecfdf5' : '#f8fafc',
                  border: '1px solid',
                  borderColor: actualClosingCash - activeShift.totalCashExpected < 0 ? '#fda4af' : '#cbd5e1'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800 }}>
                    <span>Drawer Shortage / Variance:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: actualClosingCash - activeShift.totalCashExpected < 0 ? '#e11d48' : '#10b981' }}>
                      KES {(actualClosingCash - activeShift.totalCashExpected).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Closing Notes / Handover Comments</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Handed over float to night manager"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCloseModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm Close Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
