import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ToolItem, ToolRental } from '../../types';
import { Hammer, Plus, Search, CheckCircle, RotateCcw, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { RentToolModal } from './RentToolModal';

export const ToolRentalDesk: React.FC = () => {
  const { tools, toolRentals, returnTool, addToolItem } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabSub, setActiveTabSub] = useState<'available' | 'rentals'>('available');

  const [selectedToolForRent, setSelectedToolForRent] = useState<ToolItem | null>(null);
  const [returningRental, setReturningRental] = useState<ToolRental | null>(null);
  const [damageFee, setDamageFee] = useState<number>(0);

  // Add new Tool Modal State
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [toolName, setToolName] = useState('');
  const [toolCode, setToolCode] = useState('');
  const [toolCategory, setToolCategory] = useState<ToolItem['category']>('Lifting & Jacks');
  const [dailyRate, setDailyRate] = useState<number>(1000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(3000);
  const [conditionNotes, setConditionNotes] = useState('New / Good working condition');

  const availableTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.toolCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeRentals = toolRentals.filter(r =>
    r.hirerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.toolCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddTool = () => {
    setToolName('');
    setToolCode(`TOOL-${Math.floor(100 + Math.random() * 900)}`);
    setToolCategory('Lifting & Jacks');
    setDailyRate(1000);
    setSecurityDeposit(3000);
    setConditionNotes('Inspected & working');
    setShowAddToolModal(true);
  };

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !toolCode.trim()) {
      alert('Tool name and code are required');
      return;
    }

    addToolItem({
      name: toolName,
      toolCode: toolCode.toUpperCase(),
      category: toolCategory,
      dailyRate: Number(dailyRate),
      securityDeposit: Number(securityDeposit),
      status: 'Available',
      conditionNotes
    });

    alert(`Tool "${toolName}" registered for hire successfully!`);
    setShowAddToolModal(false);
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningRental) return;

    const refund = Math.max(0, returningRental.depositPaid - damageFee);
    returnTool(returningRental.id, damageFee, refund);
    alert(`Tool returned! Security deposit refunded: KES ${refund.toLocaleString()}`);
    setReturningRental(null);
    setDamageFee(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '0' }}>
      
      {/* Top Controls */}
      <div className="erp-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search tools (Body Jack, Handle)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveTabSub('available')}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.775rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: activeTabSub === 'available' ? '#2563eb' : '#e2e8f0',
                background: activeTabSub === 'available' ? '#2563eb' : '#ffffff',
                color: activeTabSub === 'available' ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              Tool Inventory ({tools.length})
            </button>
            <button
              onClick={() => setActiveTabSub('rentals')}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.775rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: activeTabSub === 'rentals' ? '#2563eb' : '#e2e8f0',
                background: activeTabSub === 'rentals' ? '#2563eb' : '#ffffff',
                color: activeTabSub === 'rentals' ? '#ffffff' : '#475569',
                cursor: 'pointer'
              }}
            >
              Active Hires ({toolRentals.filter(r => r.status === 'Active').length})
            </button>
          </div>
        </div>

        {/* Register New Tool Button */}
        <button onClick={handleOpenAddTool} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>+ Add New Hire Tool / Gear</span>
        </button>
      </div>

      {/* VIEW 1: AVAILABLE TOOLS INVENTORY */}
      {activeTabSub === 'available' && (
        <div className="erp-card">
          <div className="erp-card-header" style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hammer size={18} color="#10b981" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                Workshop Tool & Heavy Gear Inventory
              </h3>
            </div>
          </div>
          <div className="erp-card-body" style={{ padding: 0 }}>
            <div className="erp-table-wrapper" style={{ border: 'none' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Tool Code</th>
                    <th>Tool Name / Category</th>
                    <th>Hire Rate / Day</th>
                    <th>Required Deposit</th>
                    <th>Condition / Notes</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableTools.map(t => (
                    <tr key={t.id}>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#0f172a' }}>{t.toolCode}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{t.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.category}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                        KES {t.dailyRate.toLocaleString()} / day
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
                        KES {t.securityDeposit.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {t.conditionNotes || 'Inspected & working'}
                      </td>
                      <td>
                        <span className={`badge ${t.status === 'Available' ? 'badge-green' : t.status === 'Rented' ? 'badge-amber' : 'badge-rose'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        {t.status === 'Available' ? (
                          <button
                            onClick={() => setSelectedToolForRent(t)}
                            className="btn btn-primary btn-sm"
                          >
                            + Rent Out
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>In Use</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE RENTALS DESK */}
      {activeTabSub === 'rentals' && (
        <div className="erp-card">
          <div className="erp-card-header" style={{ padding: '12px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={18} color="#2563eb" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                Active Tool Hires & Return Tracker
              </h3>
            </div>
          </div>
          <div className="erp-card-body" style={{ padding: 0 }}>
            <div className="erp-table-wrapper" style={{ border: 'none' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Tool / Code</th>
                    <th>Hirer Details</th>
                    <th>Hire Date</th>
                    <th>Expected Return</th>
                    <th>Deposit Held</th>
                    <th>Total Hire Fee</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRentals.map(rental => (
                    <tr key={rental.id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{rental.toolName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>{rental.toolCode}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{rental.hirerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rental.hirerPhone} (ID: {rental.hirerIdNumber || 'N/A'})</div>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {new Date(rental.dateTaken).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {new Date(rental.expectedReturnDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#0284c7', fontWeight: 600 }}>
                        KES {rental.depositPaid.toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0f172a' }}>
                        KES {rental.totalHireFee.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${rental.status === 'Active' ? 'badge-blue' : 'badge-green'}`}>
                          {rental.status}
                        </span>
                      </td>
                      <td>
                        {rental.status === 'Active' && (
                          <button
                            onClick={() => setReturningRental(rental)}
                            className="btn btn-success btn-sm"
                          >
                            <CheckCircle size={14} />
                            <span>Return & Refund</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW HIRE TOOL */}
      {showAddToolModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hammer size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Register New Tool / Machine for Hire</h3>
              </div>
              <button onClick={() => setShowAddToolModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveTool}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tool / Machine Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Hydraulic Body Check Handle or ARC Welding Machine"
                    value={toolName}
                    onChange={e => setToolName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Tool Code / Tag *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. BJ-03 or CH-12"
                      value={toolCode}
                      onChange={e => setToolCode(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={toolCategory}
                      onChange={e => setToolCategory(e.target.value as any)}
                    >
                      <option value="Lifting & Jacks">Lifting & Jacks</option>
                      <option value="Hand Tools">Hand Tools (Check Handles, Dollies)</option>
                      <option value="Welding">Welding Rigs</option>
                      <option value="Hydraulics">Hydraulics & Pullers</option>
                      <option value="Diagnostic">Diagnostic Computers</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Hire Rate Per Day (KES) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={dailyRate}
                      onChange={e => setDailyRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Security Deposit (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-input"
                      value={securityDeposit}
                      onChange={e => setSecurityDeposit(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition & Accessories Included</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Tested, includes handle and clamp"
                    value={conditionNotes}
                    onChange={e => setConditionNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddToolModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Tool to Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENT OUT MODAL */}
      {selectedToolForRent && (
        <RentToolModal
          tool={selectedToolForRent}
          onClose={() => setSelectedToolForRent(null)}
        />
      )}

      {/* RETURN INSPECTION MODAL */}
      {returningRental && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Tool Return & Inspection: {returningRental.toolName}
              </h3>
              <button onClick={() => setReturningRental(null)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <form onSubmit={handleProcessReturn}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Hirer:</span>
                    <strong>{returningRental.hirerName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Security Deposit Held:</span>
                    <strong style={{ color: '#0284c7' }}>KES {returningRental.depositPaid.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Damage / Late Penalty Surcharge (KES)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={damageFee}
                    onChange={e => setDamageFee(Number(e.target.value))}
                  />
                  <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    Enter 0 if returned in good working condition.
                  </span>
                </div>

                <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>Refund to Hirer:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#166534', fontFamily: 'var(--font-mono)' }}>
                    KES {Math.max(0, returningRental.depositPaid - damageFee).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setReturningRental(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-success">Complete Return & Release Deposit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
