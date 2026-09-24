import React from 'react';
import { Printer, X, CheckCircle, Smartphone, CircleDollarSign } from 'lucide-react';
import { CartItem, PaymentMethod } from '../../types';

interface ReceiptModalProps {
  data: {
    tx: any;
    cart: CartItem[];
    subtotalGross: number;
    paymentMethod: PaymentMethod;
    mpesaRef?: string;
  };
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, onClose }) => {
  const { tx, cart, subtotalGross, paymentMethod, mpesaRef } = data;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Sale Completed</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Slip Body (80mm Style) */}
        <div className="modal-body printable-area" style={{ background: '#ffffff', color: '#000000', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000000', paddingBottom: '12px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AUTO-MASTER ENTERPRISE
            </h2>
            <div style={{ fontSize: '0.75rem' }}>Automotive Spares, Garage & Tool Hire</div>
            <div style={{ fontSize: '0.75rem' }}>Tel: +254 700 000 000 | Nairobi, Kenya</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
              Date: {new Date(tx.date).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              Receipt: {tx.referenceNo}
            </div>
          </div>

          {/* Line items */}
          <div style={{ borderBottom: '1px dashed #000000', paddingBottom: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 60px 70px', fontWeight: 800, fontSize: '0.75rem', borderBottom: '1px solid #000000', paddingBottom: '4px', marginBottom: '6px' }}>
              <span>Item</span>
              <span style={{ textAlign: 'center' }}>Qty</span>
              <span style={{ textAlign: 'right' }}>Price</span>
              <span style={{ textAlign: 'right' }}>Total</span>
            </div>

            {cart.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.775rem' }}>{item.product.name}</div>
                {item.product.imeiOrSerial && (
                  <div style={{ fontSize: '0.7rem', color: '#333333' }}>SN: {item.product.imeiOrSerial}</div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 60px 70px', fontSize: '0.75rem' }}>
                  <span></span>
                  <span style={{ textAlign: 'center' }}>{item.quantity}</span>
                  <span style={{ textAlign: 'right' }}>{item.unitPrice.toLocaleString()}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700 }}>{(item.quantity * item.unitPrice).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px dashed #000000', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 900 }}>
              <span>TOTAL PAID:</span>
              <span>KES {subtotalGross.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span>Payment Mode:</span>
              <span style={{ fontWeight: 700 }}>{paymentMethod}</span>
            </div>
            {mpesaRef && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>M-Pesa Ref:</span>
                <span style={{ fontWeight: 700 }}>{mpesaRef}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span>Served By:</span>
              <span>{tx.cashierName}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
            <p>Thank you for your business!</p>
            <p>Goods once sold are not returnable without receipt.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            <span>Print 80mm Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
