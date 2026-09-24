import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, X, Search, Wrench, Package, Calendar, User, DollarSign } from 'lucide-react';

interface VehicleHistoryModalProps {
  initialCarRegNo?: string;
  onClose: () => void;
}

export const VehicleHistoryModal: React.FC<VehicleHistoryModalProps> = ({ initialCarRegNo = '', onClose }) => {
  const { getVehicleHistory } = useApp();
  const [searchReg, setSearchReg] = useState(initialCarRegNo);

  const history = getVehicleHistory(searchReg);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              Vehicle Lifetime Service & Build History
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Search Registration Input */}
          <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase' }}
                placeholder="Enter Number Plate (e.g. KDG 482B or KCY 912M)..."
                value={searchReg}
                onChange={e => setSearchReg(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {/* Aggregated Overview */}
          {searchReg.trim() && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700 }}>Total Garage Visits</div>
                <strong style={{ fontSize: '1.25rem', color: '#1e3a8a' }}>{history.jobCards.length} Visits</strong>
              </div>
              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #86efac', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>Total Lifetime Spend</div>
                <strong style={{ fontSize: '1.25rem', color: '#166534', fontFamily: 'var(--font-mono)' }}>
                  KES {history.totalSpent.toLocaleString()}
                </strong>
              </div>
              <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '8px', border: '1px solid #d8b4fe', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 700 }}>Total Parts Fitted</div>
                <strong style={{ fontSize: '1.25rem', color: '#6b21a8' }}>{history.partsFitted.length} Parts</strong>
              </div>
            </div>
          )}

          {/* Visits Timeline */}
          {history.jobCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <Wrench size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
              <p style={{ fontSize: '0.85rem' }}>
                {searchReg.trim() ? `No past workshop records found for plate "${searchReg}".` : 'Enter a number plate above to lookup past visits.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', margin: 0 }}>
                Chronological Service Logs for {searchReg}:
              </h4>

              {history.jobCards.map((job, idx) => {
                const totalLabor = job.laborItems.reduce((s, l) => s + l.cost, 0);
                const totalParts = job.parts.reduce((s, p) => s + p.quantity * p.unitSellingPrice, 0);

                return (
                  <div
                    key={job.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '14px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-blue">{job.jobNo}</span>
                        <strong style={{ fontSize: '0.9rem' }}>{job.carMakeModel}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {new Date(job.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.8rem' }}>
                      {/* Labor Done */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>
                          🛠️ Labor / Repairs Done:
                        </div>
                        {job.laborItems.map(l => (
                          <div key={l.id} style={{ color: '#334155', marginBottom: '2px' }}>
                            • <strong>{l.type}:</strong> {l.description} (Mechanic: {l.mechanicName || 'N/A'}) - KES {l.cost.toLocaleString()}
                          </div>
                        ))}
                      </div>

                      {/* Parts Replaced */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                          📦 Parts & Materials Fitted:
                        </div>
                        {job.parts.length === 0 ? (
                          <div style={{ color: '#94a3b8' }}>None recorded</div>
                        ) : (
                          job.parts.map(p => (
                            <div key={p.id} style={{ color: '#334155', marginBottom: '2px' }}>
                              • {p.quantity}x {p.name} {p.isOutsidePurchase && '(Outside Purchase)'}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: '#64748b' }}>Notes: {job.notes || 'Routine repair'}</span>
                      <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                        Visit Total: KES {(totalLabor + totalParts).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">Close</button>
        </div>
      </div>
    </div>
  );
};
