import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DebtorCustomer, PaymentMethod } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  CircleDollarSign, 
  Smartphone, 
  CheckCircle, 
  FileText, 
  Printer, 
  AlertTriangle,
  UserPlus,
  ArrowDownLeft,
  X
} from 'lucide-react';

export const DebtorsLedger: React.FC = () => {
  const { debtors, debtRecords, addDebtorCustomer, updateDebtorCustomer, recordDebtRepayment } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorCustomer | null>(null);

  // Statement modal
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementDebtor, setStatementDebtor] = useState<DebtorCustomer | null>(null);

  // Add Debtor state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessOrCarReg, setBusinessOrCarReg] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(30000);
  const [notes, setNotes] = useState('');

  // Repayment state
  const [repayAmount, setRepayAmount] = useState<number>(0);
  const [repayMethod, setRepayMethod] = useState<PaymentMethod>('Mpesa');
  const [mpesaRef, setMpesaRef] = useState('');

  const filteredDebtors = debtors.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.businessOrCarReg.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstandingDebt = debtors.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalCreditLimit = debtors.reduce((sum, d) => sum + d.creditLimit, 0);

  const handleOpenAdd = () => {
    setName('');
    setPhone('');
    setBusinessOrCarReg('');
    setCreditLimit(30000);
    setNotes('');
    setShowAddModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Customer Name and Phone are required.');
      return;
    }

    addDebtorCustomer({
      name,
      phone,
      businessOrCarReg,
      creditLimit: Number(creditLimit),
      notes
    });

    alert(`Credit account registered for ${name}!`);
    setShowAddModal(false);
  };

  const handleOpenRepay = (debtor: DebtorCustomer) => {
    setSelectedDebtor(debtor);
    setRepayAmount(debtor.currentBalance);
    setMpesaRef('');
    setShowRepayModal(true);
  };

  const handleConfirmRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtor) return;
    if (repayAmount <= 0) {
      alert('Enter a valid repayment amount.');
      return;
    }

    recordDebtRepayment(selectedDebtor.id, repayAmount, repayMethod, mpesaRef);
    alert(`Payment of KES ${repayAmount.toLocaleString()} recorded for ${selectedDebtor.name}!`);
    setShowRepayModal(false);
    setSelectedDebtor(null);
  };

  const handleOpenStatement = (debtor: DebtorCustomer) => {
    setStatementDebtor(debtor);
    setShowStatementModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '0' }}>
      
      {/* 1. TOP SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        <div className="erp-card" style={{ padding: '16px', borderLeft: '4px solid #e11d48' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Outstanding Debt (Madeni Yote)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e11d48', fontFamily: 'var(--font-mono)' }}>
            KES {totalOutstandingDebt.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            From {debtors.filter(d => d.currentBalance > 0).length} active debtors
          </div>
        </div>

        <div className="erp-card" style={{ padding: '16px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Total Credit Limit Allowed
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            KES {totalCreditLimit.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>
            {totalCreditLimit > 0 ? (((totalCreditLimit - totalOutstandingDebt) / totalCreditLimit) * 100).toFixed(0) : 0}% Available Credit Cushion
          </div>
        </div>

        <div className="erp-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Registered Debtors
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
            {debtors.length} Accounts
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Fleet operators, mechanics & regulars
          </div>
        </div>
      </div>

      {/* 2. SEARCH & ACTIONS */}
      <div className="erp-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search customer, phone, car/fleet..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <UserPlus size={16} />
          <span>+ Register New Credit Customer</span>
        </button>
      </div>

      {/* 3. DEBTORS TABLE */}
      <div className="erp-card">
        <div className="erp-card-header" style={{ padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#2563eb" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Customer Credit & Debtors Registry (*Kitabu cha Madeni*)
            </h3>
          </div>
        </div>

        <div className="erp-card-body" style={{ padding: 0 }}>
          <div className="erp-table-wrapper" style={{ border: 'none' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Customer / Business</th>
                  <th>Contact Phone</th>
                  <th>Vehicle / Fleet Ref</th>
                  <th>Credit Limit</th>
                  <th>Current Debt (Madeni)</th>
                  <th>Credit Health</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDebtors.map(debtor => {
                  const usagePct = debtor.creditLimit > 0 ? (debtor.currentBalance / debtor.creditLimit) * 100 : 0;
                  const isHighDebt = usagePct > 80;

                  return (
                    <tr key={debtor.id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{debtor.name}</strong>
                        {debtor.notes && <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{debtor.notes}</div>}
                      </td>

                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#334155' }}>{debtor.phone}</span>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e40af' }}>{debtor.businessOrCarReg || 'General'}</span>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        KES {debtor.creditLimit.toLocaleString()}
                      </td>

                      <td>
                        <strong style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.95rem',
                          color: debtor.currentBalance > 0 ? '#e11d48' : '#059669'
                        }}>
                          KES {debtor.currentBalance.toLocaleString()}
                        </strong>
                      </td>

                      <td style={{ width: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px' }}>
                          <span>{usagePct.toFixed(0)}% Used</span>
                          {isHighDebt && <span style={{ color: '#e11d48', fontWeight: 700 }}>⚠️ Limit Close</span>}
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, usagePct)}%`,
                            height: '100%',
                            background: isHighDebt ? '#e11d48' : usagePct > 50 ? '#f59e0b' : '#10b981'
                          }}></div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {debtor.currentBalance > 0 && (
                            <button
                              onClick={() => handleOpenRepay(debtor)}
                              className="btn btn-success btn-sm"
                              style={{ padding: '3px 8px' }}
                              title="Receive Payment for Debt"
                            >
                              <CircleDollarSign size={13} />
                              <span>Receive Pay</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenStatement(debtor)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 8px' }}
                            title="Print / View Statement"
                          >
                            <FileText size={13} />
                            <span>Statement</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REGISTER NEW DEBTOR MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Register New Customer Credit Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <form onSubmit={handleSaveAdd}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Customer / Business Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Maina Transport / Sammy Driver"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="07XX XXX XXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Vehicle Reg / Fleet Tag</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. KCR 411T"
                      value={businessOrCarReg}
                      onChange={e => setBusinessOrCarReg(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Approved Credit Limit (KES)</label>
                  <input
                    type="number"
                    min="1000"
                    className="form-input"
                    value={creditLimit}
                    onChange={e => setCreditLimit(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Terms & Agreement Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Weekly settlement every Monday"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVE REPAYMENT MODAL */}
      {showRepayModal && selectedDebtor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Receive Debt Payment: {selectedDebtor.name}
              </h3>
              <button onClick={() => setShowRepayModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <form onSubmit={handleConfirmRepay}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Debt Owed:</span>
                    <strong style={{ color: '#e11d48', fontFamily: 'var(--font-mono)' }}>KES {selectedDebtor.currentBalance.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Repayment Amount (KES) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedDebtor.currentBalance}
                    className="form-input"
                    style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                    value={repayAmount}
                    onChange={e => setRepayAmount(Number(e.target.value))}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Channel</label>
                    <select
                      className="form-select"
                      value={repayMethod}
                      onChange={e => setRepayMethod(e.target.value as PaymentMethod)}
                    >
                      <option value="Mpesa">M-Pesa</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">M-Pesa Ref (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. RBL88201K"
                      value={mpesaRef}
                      onChange={e => setMpesaRef(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ background: '#ecfdf5', padding: '10px 12px', borderRadius: '8px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>Remaining Debt Balance:</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#166534', fontFamily: 'var(--font-mono)' }}>
                    KES {Math.max(0, selectedDebtor.currentBalance - repayAmount).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowRepayModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-success">Receive Payment & Update Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATEMENT MODAL */}
      {showStatementModal && statementDebtor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Credit Account Statement: {statementDebtor.name}
              </h3>
              <button onClick={() => setShowStatementModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <div className="modal-body printable-area" style={{ background: '#ffffff', padding: '18px' }}>
              <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>AUTO-MASTER DEBTOR STATEMENT</h2>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Statement & Repayment Log</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.8rem' }}>
                <div>
                  <div><strong>Customer:</strong> {statementDebtor.name}</div>
                  <div><strong>Phone:</strong> {statementDebtor.phone}</div>
                </div>
                <div>
                  <div><strong>Vehicle / Tag:</strong> {statementDebtor.businessOrCarReg}</div>
                  <div><strong>Credit Limit:</strong> KES {statementDebtor.creditLimit.toLocaleString()}</div>
                </div>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px' }}>Account Activity History:</h4>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {debtRecords.filter(r => r.customerId === statementDebtor.id).map(rec => (
                    <tr key={rec.id}>
                      <td style={{ fontSize: '0.75rem' }}>{new Date(rec.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${rec.type === 'CREDIT_PURCHASE' ? 'badge-rose' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                          {rec.type === 'CREDIT_PURCHASE' ? 'Credit Purchase' : 'Repayment'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>{rec.description}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: rec.type === 'CREDIT_PURCHASE' ? '#e11d48' : '#059669' }}>
                        {rec.type === 'CREDIT_PURCHASE' ? `+${rec.amount.toLocaleString()}` : `-${rec.amount.toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '6px', marginTop: '12px', border: '1px solid #cbd5e1' }}>
                <strong>CURRENT BALANCE DUE:</strong>
                <strong style={{ color: '#e11d48', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>
                  KES {statementDebtor.currentBalance.toLocaleString()}
                </strong>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowStatementModal(false)} className="btn btn-outline">Close</button>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={15} />
                <span>Print Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
