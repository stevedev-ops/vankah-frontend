import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobCard, LaborItem, JobPartItem, JobCardStatus, PaymentMethod } from '../../types';
import { Plus, Trash2, X, Wrench, Package, ExternalLink, Smartphone, CircleDollarSign, History } from 'lucide-react';
import { VehicleHistoryModal } from './VehicleHistoryModal';

interface JobCardModalProps {
  job: JobCard | null;
  onClose: () => void;
}

export const JobCardModal: React.FC<JobCardModalProps> = ({ job, onClose }) => {
  const { products, createJobCard, updateJobCard, getVehicleHistory } = useApp();
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [carRegNo, setCarRegNo] = useState(job ? job.carRegNo : '');
  const [carMakeModel, setCarMakeModel] = useState(job ? job.carMakeModel : '');
  const [customerName, setCustomerName] = useState(job ? job.customerName : '');
  const [customerPhone, setCustomerPhone] = useState(job ? job.customerPhone : '');
  const [status, setStatus] = useState<JobCardStatus>(job ? job.status : 'Intake');
  const [notes, setNotes] = useState(job ? job.notes || '' : '');

  // Labor lines
  const [laborItems, setLaborItems] = useState<LaborItem[]>(job ? job.laborItems : [
    {
      id: `lab-${Date.now()}`,
      type: 'Panel Beating',
      description: 'Panel repair & straightening',
      mechanicName: 'Lead Mechanic',
      cost: 5000
    }
  ]);

  // Parts lines
  const [parts, setParts] = useState<JobPartItem[]>(job ? job.parts : []);

  // Deposit
  const [advanceDeposit, setAdvanceDeposit] = useState<number>(job ? job.advanceDeposit : 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(job ? job.paymentMethod || 'Mpesa' : 'Mpesa');
  const [mpesaRef, setMpesaRef] = useState(job ? job.mpesaRef || '' : '');

  // New Labor item inputs
  const addLaborLine = () => {
    setLaborItems(prev => [
      ...prev,
      {
        id: `lab-${Date.now()}`,
        type: 'Welding',
        description: '',
        mechanicName: '',
        cost: 0
      }
    ]);
  };

  const removeLaborLine = (id: string) => {
    setLaborItems(prev => prev.filter(l => l.id !== id));
  };

  const updateLabor = (id: string, updates: Partial<LaborItem>) => {
    setLaborItems(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  // Add internal part from store
  const addStorePart = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setParts(prev => [
      ...prev,
      {
        id: `part-${Date.now()}`,
        partId: prod.id,
        name: prod.name,
        quantity: 1,
        unitCostPrice: prod.buyingPrice,
        unitSellingPrice: prod.sellingPrice,
        isOutsidePurchase: false
      }
    ]);
  };

  // Add outside purchased part
  const addOutsidePurchase = () => {
    setParts(prev => [
      ...prev,
      {
        id: `part-${Date.now()}`,
        name: '',
        quantity: 1,
        unitCostPrice: 0,
        unitSellingPrice: 0,
        isOutsidePurchase: true,
        vendorName: '',
        receiptNo: ''
      }
    ]);
  };

  const removePart = (id: string) => {
    setParts(prev => prev.filter(p => p.id !== id));
  };

  const updatePart = (id: string, updates: Partial<JobPartItem>) => {
    setParts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Calculations
  const totalLaborCost = laborItems.reduce((s, l) => s + Number(l.cost || 0), 0);
  const totalPartsCost = parts.reduce((s, p) => s + Number(p.quantity || 1) * Number(p.unitCostPrice || 0), 0);
  const totalPartsBilled = parts.reduce((s, p) => s + Number(p.quantity || 1) * Number(p.unitSellingPrice || 0), 0);
  const totalBill = totalLaborCost + totalPartsBilled;
  const balanceDue = Math.max(0, totalBill - advanceDeposit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carRegNo.trim() || !customerName.trim()) {
      alert('Vehicle registration number and customer name are required');
      return;
    }

    if (job) {
      updateJobCard(job.id, {
        carRegNo,
        carMakeModel,
        customerName,
        customerPhone,
        status,
        laborItems,
        parts,
        advanceDeposit,
        paymentMethod,
        mpesaRef,
        notes
      });
    } else {
      createJobCard({
        carRegNo,
        carMakeModel,
        customerName,
        customerPhone,
        status,
        laborItems,
        parts,
        advanceDeposit,
        paymentMethod,
        mpesaRef,
        notes
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '840px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              {job ? `Edit Job Card: ${job.jobNo} (${job.carRegNo})` : 'Create New Vehicle Job Card & Quotation'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. Vehicle & Customer Details */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Vehicle & Customer Identification
                </h4>
                {carRegNo.trim().length >= 3 && (() => {
                  const pastHistory = getVehicleHistory(carRegNo);
                  const priorVisits = pastHistory.jobCards.filter(j => j.id !== job?.id);
                  if (priorVisits.length > 0) {
                    return (
                      <button
                        type="button"
                        onClick={() => setShowHistoryModal(true)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#2563eb',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <History size={13} />
                        <span>📜 Found {priorVisits.length} Past Visit(s) for {carRegNo} (View History)</span>
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                <div>
                  <label className="form-label">Registration No *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. KDG 482B"
                    value={carRegNo}
                    onChange={e => setCarRegNo(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="form-label">Make & Model</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Toyota Hilux / Probox"
                    value={carMakeModel}
                    onChange={e => setCarMakeModel(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Kiprono Ngetich"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Customer Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 0712 345 678"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '10px' }}>
                <div>
                  <label className="form-label">Job Stage Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={e => setStatus(e.target.value as JobCardStatus)}
                  >
                    <option value="Intake">Intake (Quotation)</option>
                    <option value="In Progress">In Progress (Work Ongoing)</option>
                    <option value="Waiting Parts">Waiting Parts</option>
                    <option value="Ready">Ready for Pick Up</option>
                    <option value="Delivered">Delivered & Settled</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Work Scope & Build Instructions</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Front collision repair, heavy chassis welding, 2K paint"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 2. Labor & Workmanship Lines */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  2. Labor & Services (Panel Beating, Welding, Spray Painting)
                </h4>
                <button type="button" onClick={addLaborLine} className="btn btn-outline btn-sm">
                  <Plus size={13} /> Add Labor Line
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {laborItems.map((labor, idx) => (
                  <div key={labor.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <select
                      className="form-select"
                      style={{ flex: '1 1 140px', minWidth: '130px' }}
                      value={labor.type}
                      onChange={e => updateLabor(labor.id, { type: e.target.value as any })}
                    >
                      <option value="Panel Beating">Panel Beating</option>
                      <option value="Welding">Welding</option>
                      <option value="Spray Painting">Spray Painting</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Custom Fabrication">Custom Fabrication</option>
                    </select>

                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: '2 1 180px', minWidth: '160px' }}
                      placeholder="Task description..."
                      value={labor.description}
                      onChange={e => updateLabor(labor.id, { description: e.target.value })}
                    />

                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: '1 1 120px', minWidth: '110px' }}
                      placeholder="Mechanic name"
                      value={labor.mechanicName}
                      onChange={e => updateLabor(labor.id, { mechanicName: e.target.value })}
                    />

                    <input
                      type="number"
                      className="form-input"
                      style={{ flex: '1 1 90px', minWidth: '90px' }}
                      placeholder="Cost KES"
                      value={labor.cost}
                      onChange={e => updateLabor(labor.id, { cost: Number(e.target.value) })}
                    />

                    <button
                      type="button"
                      onClick={() => removeLaborLine(labor.id)}
                      style={{ color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a' }}>
                Subtotal Labor: KES {totalLaborCost.toLocaleString()}
              </div>
            </div>

            {/* 3. Parts: Store Inventory & Outside Purchases */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                    3. Parts (In-Store Stock & Outsourced Purchases)
                  </h4>
                  <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    Log parts from store OR outside purchases bought under company name
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    className="form-select"
                    style={{ width: '180px', fontSize: '0.75rem' }}
                    onChange={e => {
                      if (e.target.value) {
                        addStorePart(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">+ Add In-Store Part...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Qty: {p.stockQty})</option>
                    ))}
                  </select>

                  <button type="button" onClick={addOutsidePurchase} className="btn btn-outline btn-sm" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
                    <ExternalLink size={13} /> + Log Outside Purchase
                  </button>
                </div>
              </div>

              {parts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  No parts attached to this job yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {parts.map(part => (
                    <div
                      key={part.id}
                      style={{
                        padding: '10px',
                        background: part.isOutsidePurchase ? '#faf5ff' : '#ffffff',
                        border: part.isOutsidePurchase ? '1px solid #d8b4fe' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: '2 1 180px', minWidth: '160px' }}>
                        {part.isOutsidePurchase ? (
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Outside Part Name / Description *"
                            value={part.name}
                            onChange={e => updatePart(part.id, { name: e.target.value })}
                          />
                        ) : (
                          <strong style={{ fontSize: '0.85rem' }}>{part.name}</strong>
                        )}
                        <span className={`badge ${part.isOutsidePurchase ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.675rem', marginTop: '2px' }}>
                          {part.isOutsidePurchase ? 'Bought Outside' : 'In-Store Stock'}
                        </span>
                      </div>

                      <div style={{ width: '60px' }}>
                        <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Qty:</div>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          placeholder="Qty"
                          value={part.quantity}
                          onChange={e => updatePart(part.id, { quantity: Number(e.target.value) })}
                        />
                      </div>

                      <div style={{ flex: '1 1 90px', minWidth: '90px' }}>
                        <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Cost:</div>
                        <input
                          type="number"
                          className="form-input"
                          value={part.unitCostPrice}
                          onChange={e => updatePart(part.id, { unitCostPrice: Number(e.target.value) })}
                        />
                      </div>

                      <div style={{ flex: '1 1 90px', minWidth: '90px' }}>
                        <div style={{ fontSize: '0.675rem', color: '#64748b' }}>Client Bill:</div>
                        <input
                          type="number"
                          className="form-input"
                          value={part.unitSellingPrice}
                          onChange={e => updatePart(part.id, { unitSellingPrice: Number(e.target.value) })}
                        />
                      </div>

                      {part.isOutsidePurchase && (
                        <div style={{ flex: '2 1 180px', minWidth: '160px' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Vendor & Receipt No"
                            value={part.vendorName || ''}
                            onChange={e => updatePart(part.id, { vendorName: e.target.value })}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removePart(part.id)}
                        style={{ color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a' }}>
                Subtotal Parts Billed: KES {totalPartsBilled.toLocaleString()}
              </div>
            </div>

            {/* 4. Billing Summary & Advance Deposit */}
            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', textAlign: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Labor Total</div>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>KES {totalLaborCost.toLocaleString()}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Parts Billed</div>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>KES {totalPartsBilled.toLocaleString()}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Quotation</div>
                  <strong style={{ fontSize: '1.15rem', color: '#2563eb' }}>KES {totalBill.toLocaleString()}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#e11d48' }}>Balance Due</div>
                  <strong style={{ fontSize: '1.15rem', color: balanceDue > 0 ? '#e11d48' : '#059669' }}>
                    KES {balanceDue.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Deposit Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', paddingTop: '10px', borderTop: '1px solid #bfdbfe' }}>
                <div>
                  <label className="form-label">Advance Deposit Paid (KES)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={advanceDeposit}
                    onChange={e => setAdvanceDeposit(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="form-label">Deposit Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="Mpesa">M-Pesa</option>
                    <option value="Cash">Cash</option>
                    <option value="Split">Split</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">M-Pesa Reference No</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. RBL784920K"
                    value={mpesaRef}
                    onChange={e => setMpesaRef(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {job ? 'Save Job Updates' : 'Generate Job Card & Quotation'}
            </button>
          </div>
        </form>
      </div>

      {showHistoryModal && (
        <VehicleHistoryModal
          initialCarRegNo={carRegNo}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};
