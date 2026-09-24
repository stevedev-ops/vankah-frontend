import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { YardVehicle, PaymentMethod } from '../../types';
import { ParkingSquare, Plus, Search, ShieldCheck, Clock, CircleDollarSign, CheckCircle2, QrCode, Edit3, X } from 'lucide-react';
import { GatePassModal } from './GatePassModal';

export const YardTracker: React.FC = () => {
  const { yardVehicles, addYardVehicle, updateYardVehicle, settleYardVehicle } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<YardVehicle | null>(null);

  // Edit Active Days Modal
  const [showEditDaysModal, setShowEditDaysModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<YardVehicle | null>(null);
  const [customDays, setCustomDays] = useState<number>(1);

  const [showGatePass, setShowGatePass] = useState(false);
  const [clearedVehicleForPass, setClearedVehicleForPass] = useState<YardVehicle | null>(null);

  // Add form fields
  const [carRegNo, setCarRegNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bayNumber, setBayNumber] = useState('Bay 01 (Yard)');
  const [weeklyRate, setWeeklyRate] = useState<number>(5000);
  const [storagePenaltyPerDay, setStoragePenaltyPerDay] = useState<number>(500);
  const [paidAmount, setPaidAmount] = useState<number>(5000);
  const [initialDaysStayed, setInitialDaysStayed] = useState<number>(1);
  const [notes, setNotes] = useState('');

  // Settle form fields
  const [settleMethod, setSettleMethod] = useState<PaymentMethod>('Mpesa');
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [mpesaRef, setMpesaRef] = useState<string>('');

  const calculateYardFees = (vehicle: YardVehicle) => {
    const arrivalTime = new Date(vehicle.arrivalDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.max(1, Math.ceil((nowTime - arrivalTime) / (1000 * 60 * 60 * 24)));
    const weeksAccrued = Math.ceil(diffDays / 7);
    const totalWeeklyFee = weeksAccrued * vehicle.weeklyRate;
    
    // If overstay beyond paid weeks
    const paidWeeks = Math.floor(vehicle.paidAmount / vehicle.weeklyRate);
    const unpaidWeeks = Math.max(0, weeksAccrued - paidWeeks);
    const overstayDays = Math.max(0, diffDays - (paidWeeks * 7));
    const storagePenalty = unpaidWeeks > 0 ? (overstayDays % 7) * vehicle.storagePenaltyPerDay : 0;

    const totalDue = totalWeeklyFee + storagePenalty;
    const balanceOwed = Math.max(0, totalDue - vehicle.paidAmount);

    return { diffDays, weeksAccrued, totalWeeklyFee, storagePenalty, totalDue, balanceOwed };
  };

  const filtered = yardVehicles.filter(v =>
    v.carRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.bayNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setCarRegNo('');
    setCustomerName('');
    setCustomerPhone('');
    setBayNumber('Bay 01 (Yard)');
    setWeeklyRate(5000);
    setPaidAmount(5000);
    setInitialDaysStayed(1);
    setNotes('');
    setShowAddModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carRegNo.trim() || !customerName.trim()) {
      alert('Registration Number and Customer Name required');
      return;
    }

    // Calculate arrival date based on initial days stayed entered
    const daysOffset = Math.max(1, Number(initialDaysStayed) || 1) - 1;
    const computedArrivalDate = new Date(Date.now() - (daysOffset * 86400000)).toISOString();

    addYardVehicle({
      carRegNo: carRegNo.toUpperCase(),
      customerName,
      customerPhone,
      bayNumber,
      arrivalDate: computedArrivalDate,
      weeklyRate,
      storagePenaltyPerDay,
      paidAmount,
      notes
    });

    setShowAddModal(false);
  };

  const handleOpenEditDays = (v: YardVehicle) => {
    const { diffDays } = calculateYardFees(v);
    setEditingVehicle(v);
    setCustomDays(diffDays);
    setShowEditDaysModal(true);
  };

  const handleSaveEditedDays = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const days = Math.max(1, customDays);
    const newArrivalDate = new Date(Date.now() - ((days - 1) * 86400000)).toISOString();

    updateYardVehicle(editingVehicle.id, {
      arrivalDate: newArrivalDate
    });

    alert(`Updated active days for ${editingVehicle.carRegNo} to ${days} days.`);
    setShowEditDaysModal(false);
    setEditingVehicle(null);
  };

  const handleOpenSettle = (v: YardVehicle) => {
    const { balanceOwed } = calculateYardFees(v);
    setSelectedVehicle(v);
    setSettleAmount(balanceOwed);
    setShowSettleModal(true);
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    settleYardVehicle(selectedVehicle.id, settleMethod, settleAmount, mpesaRef);
    setShowSettleModal(false);
    
    const updated = { ...selectedVehicle, paidAmount: selectedVehicle.paidAmount + settleAmount, isCleared: true, gatePassNo: `GP-${Math.floor(100000 + Math.random() * 900000)}` };
    setClearedVehicleForPass(updated);
    setShowGatePass(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '0' }}>
      
      {/* Header Controls */}
      <div className="erp-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search Reg No, Owner, Bay..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>+ Check-In Vehicle (5,000 KES / Week)</span>
        </button>
      </div>

      {/* Yard Matrix Table */}
      <div className="erp-card">
        <div className="erp-card-header" style={{ padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ParkingSquare size={18} color="#8b5cf6" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Yard Parking & Field Storage Registry ({filtered.length} Vehicles)
            </h3>
          </div>
        </div>

        <div className="erp-card-body" style={{ padding: 0 }}>
          <div className="erp-table-wrapper" style={{ border: 'none' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Vehicle / Bay</th>
                  <th>Owner / Phone</th>
                  <th>Active Duration (Days/Wks)</th>
                  <th>Weekly Rate</th>
                  <th>Total Due</th>
                  <th>Paid Amount</th>
                  <th>Balance Due</th>
                  <th>Gate Pass Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const { diffDays, weeksAccrued, totalDue, balanceOwed } = calculateYardFees(v);

                  return (
                    <tr key={v.id}>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{v.carRegNo}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.bayNumber}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{v.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.customerPhone}</div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div>
                            <strong style={{ color: '#0f172a' }}>{diffDays} Days</strong>
                            <div style={{ fontSize: '0.725rem', color: '#64748b' }}>({weeksAccrued} Wk{weeksAccrued > 1 ? 's' : ''} Accrued)</div>
                          </div>
                          {!v.isCleared && (
                            <button
                              onClick={() => handleOpenEditDays(v)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                              title="Set or Adjust Active Days"
                            >
                              <Edit3 size={11} />
                              <span>Set Days</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        KES {v.weeklyRate.toLocaleString()}/wk
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        KES {totalDue.toLocaleString()}
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 600 }}>
                        KES {v.paidAmount.toLocaleString()}
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: balanceOwed > 0 ? '#e11d48' : '#059669' }}>
                        KES {balanceOwed.toLocaleString()}
                      </td>

                      <td>
                        {v.isCleared ? (
                          <div>
                            <span className="badge badge-green">Cleared Exit</span>
                            <div style={{ fontSize: '0.675rem', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
                              {v.gatePassNo}
                            </div>
                          </div>
                        ) : (
                          <span className={`badge ${balanceOwed > 0 ? 'badge-amber' : 'badge-blue'}`}>
                            {balanceOwed > 0 ? 'Active Due' : 'Prepaid Active'}
                          </span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {!v.isCleared ? (
                            <button onClick={() => handleOpenSettle(v)} className="btn btn-primary btn-sm">
                              <CircleDollarSign size={13} />
                              <span>Settle</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setClearedVehicleForPass(v);
                                setShowGatePass(true);
                              }} 
                              className="btn btn-outline btn-sm"
                            >
                              <QrCode size={13} />
                              <span>Pass</span>
                            </button>
                          )}
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

      {/* CHECK-IN MODAL WITH DAYS ACTIVE INPUT */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Vehicle Check-In to Yard Storage
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <form onSubmit={handleSaveAdd}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Car Reg Number *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. KBA 301P"
                      value={carRegNo}
                      onChange={e => setCarRegNo(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Yard Bay / Spot</label>
                    <input
                      type="text"
                      className="form-input"
                      value={bayNumber}
                      onChange={e => setBayNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Owner Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Owner name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="07XX XXX XXX"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Explicit Days Parked Field */}
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <label className="form-label" style={{ color: '#1e3a8a', fontWeight: 800 }}>
                    Number of Days Already Parked / Active in Yard *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      style={{ width: '120px', fontWeight: 800 }}
                      value={initialDaysStayed}
                      onChange={e => setInitialDaysStayed(Math.max(1, Number(e.target.value)))}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      ({Math.ceil(initialDaysStayed / 7)} Week{Math.ceil(initialDaysStayed / 7) > 1 ? 's' : ''} rate = KES {(Math.ceil(initialDaysStayed / 7) * weeklyRate).toLocaleString()})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Weekly Rate (KES)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={weeklyRate}
                      onChange={e => setWeeklyRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Advance Deposit Paid (KES)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={paidAmount}
                      onChange={e => setPaidAmount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Intake Purpose / Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Storage while waiting for spare parts"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Check-In Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ACTIVE DAYS MODAL */}
      {showEditDaysModal && editingVehicle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Adjust Active Days: {editingVehicle.carRegNo}
              </h3>
              <button onClick={() => setShowEditDaysModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <form onSubmit={handleSaveEditedDays}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Specify the exact number of days this car has been active in the yard to recalculate weekly fees.
                </p>

                <div className="form-group">
                  <label className="form-label">Total Days Active in Yard</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-input"
                    style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                    value={customDays}
                    onChange={e => setCustomDays(Math.max(1, Number(e.target.value)))}
                  />
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Accrued Weeks:</span>
                    <strong>{Math.ceil(customDays / 7)} Weeks</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e3a8a', fontWeight: 700 }}>
                    <span>Calculated Fee:</span>
                    <span>KES {(Math.ceil(customDays / 7) * editingVehicle.weeklyRate).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditDaysModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Update Duration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE MODAL */}
      {showSettleModal && selectedVehicle && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                Settle Yard Fee: {selectedVehicle.carRegNo}
              </h3>
              <button onClick={() => setShowSettleModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <form onSubmit={handleConfirmSettle}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Owner:</span>
                    <strong>{selectedVehicle.customerName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Accrued Duration:</span>
                    <strong>{calculateYardFees(selectedVehicle).diffDays} Days</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#e11d48', borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                    <span>Amount Due to Clear:</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>KES {settleAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={settleMethod}
                    onChange={e => setSettleMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="Mpesa">M-Pesa</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">M-Pesa Reference No (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. RBL77192K"
                    value={mpesaRef}
                    onChange={e => setMpesaRef(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowSettleModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-success">
                  <CheckCircle2 size={16} />
                  <span>Receive Payment & Issue Gate Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATE PASS MODAL */}
      {showGatePass && clearedVehicleForPass && (
        <GatePassModal
          vehicle={clearedVehicleForPass}
          onClose={() => {
            setShowGatePass(false);
            setClearedVehicleForPass(null);
          }}
        />
      )}

    </div>
  );
};
