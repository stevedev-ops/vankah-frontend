import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ToolItem, PaymentMethod } from '../../types';
import { Hammer, X, Smartphone, CircleDollarSign } from 'lucide-react';

interface RentToolModalProps {
  tool: ToolItem;
  onClose: () => void;
}

export const RentToolModal: React.FC<RentToolModalProps> = ({ tool, onClose }) => {
  const { rentOutTool } = useApp();

  const [hirerName, setHirerName] = useState('');
  const [hirerPhone, setHirerPhone] = useState('');
  const [hirerIdNumber, setHirerIdNumber] = useState('');
  const [days, setDays] = useState<number>(1);
  const [depositPaid, setDepositPaid] = useState<number>(tool.securityDeposit);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mpesa');
  const [mpesaRef, setMpesaRef] = useState('');

  const totalHireFee = days * tool.dailyRate;
  const totalDueNow = totalHireFee + depositPaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hirerName.trim() || !hirerPhone.trim()) {
      alert('Hirer name and phone number are required.');
      return;
    }

    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + days);

    rentOutTool({
      toolId: tool.id,
      toolCode: tool.toolCode,
      toolName: tool.name,
      hirerName,
      hirerPhone,
      hirerIdNumber,
      dateTaken: new Date().toISOString(),
      expectedReturnDate: expectedDate.toISOString(),
      dailyRate: tool.dailyRate,
      depositPaid,
      totalHireFee,
      damageFee: 0,
      paymentMethod,
      mpesaRef
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hammer size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              Rent Tool: {tool.name} ({tool.toolCode})
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Hirer Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. David Ochieng"
                  value={hirerName}
                  onChange={e => setHirerName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hirer Phone Number *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="07XX XXX XXX"
                  value={hirerPhone}
                  onChange={e => setHirerPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">National ID / Passport No</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 29884120"
                  value={hirerIdNumber}
                  onChange={e => setHirerIdNumber(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Days to Rent</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={days}
                  onChange={e => setDays(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Daily Rate:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {tool.dailyRate.toLocaleString()} / day</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Total Hire Charge ({days} Days):</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {totalHireFee.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#0284c7', marginBottom: '6px' }}>
                <span>Refundable Security Deposit:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>KES {depositPaid.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                <span>Total Payable Now:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>KES {totalDueNow.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="Mpesa">M-Pesa</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">M-Pesa Ref No (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. RKL330198"
                  value={mpesaRef}
                  onChange={e => setMpesaRef(e.target.value)}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-success">Issue Rental & Collect Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
};
