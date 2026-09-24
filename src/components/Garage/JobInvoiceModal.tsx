import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobCard, PaymentMethod } from '../../types';
import { Printer, X, CheckCircle, FileText, Download, Share2, Copy, Check } from 'lucide-react';

interface JobInvoiceModalProps {
  job: JobCard;
  onClose: () => void;
}

export const JobInvoiceModal: React.FC<JobInvoiceModalProps> = ({ job, onClose }) => {
  const { settleJobCard } = useApp();

  const totalLabor = job.laborItems.reduce((s, l) => s + l.cost, 0);
  const totalPartsBilled = job.parts.reduce((s, p) => s + p.quantity * p.unitSellingPrice, 0);
  const totalBill = totalLabor + totalPartsBilled;
  const balanceDue = Math.max(0, totalBill - job.advanceDeposit);

  const [settleMode, setSettleMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mpesa');
  const [mpesaAmount, setMpesaAmount] = useState<number>(balanceDue);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [mpesaRef, setMpesaRef] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsAppSummary = () => {
    const text = `*AUTO-MASTER GARAGE & WORKSHOP*
----------------------------------------
*JOB QUOTATION / INVOICE: ${job.jobNo}*
*Car Reg:* ${job.carRegNo} (${job.carMakeModel})
*Customer:* ${job.customerName}
*Status:* ${job.status}

*1. LABOR & WORKMANSHIP:*
${job.laborItems.map(l => `• ${l.type}: ${l.description} - KES ${l.cost.toLocaleString()}`).join('\n')}
*Labor Total:* KES ${totalLabor.toLocaleString()}

*2. PARTS ALLOCATED:*
${job.parts.map(p => `• ${p.quantity}x ${p.name} - KES ${(p.quantity * p.unitSellingPrice).toLocaleString()}`).join('\n')}
*Parts Total:* KES ${totalPartsBilled.toLocaleString()}
----------------------------------------
*TOTAL GROSS BILL:* KES ${totalBill.toLocaleString()}
*Deposit Paid:* KES ${job.advanceDeposit.toLocaleString()}
*BALANCE DUE:* KES ${balanceDue.toLocaleString()}
----------------------------------------
_Thank you for choosing Auto-Master Enterprise._`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (balanceDue <= 0) {
      alert('This job has already been fully paid.');
      return;
    }

    let finalMpesa = 0;
    let finalCash = 0;

    if (paymentMethod === 'Mpesa') {
      finalMpesa = balanceDue;
    } else if (paymentMethod === 'Cash') {
      finalCash = balanceDue;
    } else {
      if (mpesaAmount + cashAmount !== balanceDue) {
        alert(`Split total must equal balance due: KES ${balanceDue}`);
        return;
      }
      finalMpesa = mpesaAmount;
      finalCash = cashAmount;
    }

    settleJobCard(job.id, paymentMethod, finalMpesa, finalCash, mpesaRef);
    alert(`Job ${job.jobNo} marked as DELIVERED & fully settled!`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '780px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
              Official Job Quotation & Invoice: {job.jobNo}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Invoice Printable Document */}
        <div className="modal-body printable-area" style={{ background: '#ffffff', color: '#1e293b' }}>
          
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                AUTO-MASTER ENTERPRISE
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Automotive Fabrication, Panel Beating, Welding & Spare Parts
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Industrial Area, Nairobi, Kenya | Phone: +254 700 000 000
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563eb' }}>
                JOB INVOICE
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {job.jobNo}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Date: {new Date(job.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <span className="badge badge-blue" style={{ marginTop: '2px' }}>
                Status: {job.status}
              </span>
            </div>
          </div>

          {/* Client & Vehicle Info Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Vehicle Details:</div>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{job.carRegNo}</strong>
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>{job.carMakeModel}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Customer Details:</div>
              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{job.customerName}</strong>
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>Tel: {job.customerPhone}</div>
            </div>
          </div>

          {/* 1. Labor Section */}
          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
              1. Labor & Workmanship Services (Panel Beating / Welding)
            </h4>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Discipline / Type</th>
                  <th>Description</th>
                  <th>Mechanic</th>
                  <th style={{ textAlign: 'right' }}>Amount (KES)</th>
                </tr>
              </thead>
              <tbody>
                {job.laborItems.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.type}</strong></td>
                    <td>{l.description}</td>
                    <td>{l.mechanicName || 'Workshop Team'}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{l.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Parts Section */}
          {job.parts.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', marginBottom: '6px' }}>
                2. Allocated Parts & Materials
              </h4>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Source</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Total (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {job.parts.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        {p.vendorName && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Vendor: {p.vendorName}</div>}
                      </td>
                      <td>
                        <span className={`badge ${p.isOutsidePurchase ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.65rem' }}>
                          {p.isOutsidePurchase ? 'Outside Purchase' : 'In-Store'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>{p.quantity}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{p.unitSellingPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {(p.quantity * p.unitSellingPrice).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals Box */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <div style={{ width: '300px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                <span>Total Labor:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>KES {totalLabor.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>Total Parts:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>KES {totalPartsBilled.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, borderTop: '1px solid #cbd5e1', paddingTop: '4px', marginBottom: '4px' }}>
                <span>Total Gross Bill:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>KES {totalBill.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#059669', marginBottom: '4px' }}>
                <span>Advance Deposit:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>- KES {job.advanceDeposit.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, color: balanceDue > 0 ? '#e11d48' : '#059669', borderTop: '2px solid #0f172a', paddingTop: '6px' }}>
                <span>Balance Due:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>KES {balanceDue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Settle Section */}
          {settleMode && balanceDue > 0 && (
            <form onSubmit={handleSettle} style={{ marginTop: '16px', padding: '14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #93c5fd' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '8px' }}>
                Receive Balance Payment & Mark Vehicle Delivered
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label className="form-label">Payment Method</label>
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
                  <label className="form-label">Amount (KES)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={balanceDue}
                    disabled
                  />
                </div>
                <div>
                  <label className="form-label">M-Pesa Ref (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. RBL99104K"
                    value={mpesaRef}
                    onChange={e => setMpesaRef(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                <CheckCircle size={16} />
                <span>Confirm Settlement & Settle Job</span>
              </button>
            </form>
          )}

        </div>

        <div className="modal-footer" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <button onClick={onClose} className="btn btn-outline btn-sm">
            Close
          </button>
          
          {/* WhatsApp / SMS Copy Button */}
          <button onClick={handleCopyWhatsAppSummary} className="btn btn-outline btn-sm" style={{ color: '#059669', borderColor: '#86efac' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Receipt'}</span>
          </button>

          {/* Download / Print PDF Button */}
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Download size={14} />
            <span>Download / Print PDF Invoice</span>
          </button>

          {balanceDue > 0 && job.status !== 'Delivered' && (
            <button onClick={() => setSettleMode(!settleMode)} className="btn btn-success btn-sm">
              <CheckCircle size={14} />
              <span>{settleMode ? 'Hide Settle' : 'Settle Balance'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
