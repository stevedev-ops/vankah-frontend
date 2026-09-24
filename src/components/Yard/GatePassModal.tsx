import React from 'react';
import { Printer, X, ShieldCheck, QrCode } from 'lucide-react';
import { YardVehicle } from '../../types';

interface GatePassModalProps {
  vehicle: YardVehicle;
  onClose: () => void;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({ vehicle, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Digital Gate Exit Pass</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Gate Pass Body */}
        <div className="modal-body printable-area" style={{ background: '#ffffff', color: '#0f172a', padding: '24px', textAlign: 'center', border: '2px solid #0f172a', borderRadius: '12px', margin: '12px' }}>
          
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
            AUTO-MASTER WORKSHOP & YARD
          </div>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', margin: '6px 0 12px 0' }}>
            VEHICLE GATE CLEARANCE PASS
          </h2>

          <div style={{ background: '#f0fdf4', border: '1px dashed #86efac', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Gate Pass Authorization Number:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
              {vehicle.gatePassNo || 'GP-992014'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Vehicle Plate:</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{vehicle.carRegNo}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Owner Name:</span>
              <strong>{vehicle.customerName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Total Settled:</span>
              <strong style={{ color: '#166534' }}>KES {vehicle.paidAmount.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Clearance Date:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            ✓ Account verified & zero balance confirmed by Master Admin. Security is authorized to allow vehicle exit.
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">Close</button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            <span>Print Gate Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
