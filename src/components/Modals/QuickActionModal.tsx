import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Wrench, 
  ShoppingCart, 
  ParkingSquare, 
  Hammer, 
  PackagePlus, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

interface QuickActionModalProps {
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ onClose, onSelectAction }) => {
  const { setActiveTab } = useApp();

  const actions = [
    {
      id: 'new_job',
      title: 'New Car Job Card & Quotation',
      subtitle: 'Panel beating, welding, spray painting & parts build',
      icon: Wrench,
      color: '#2563eb',
      bg: '#eff6ff',
      targetTab: 'garage'
    },
    {
      id: 'quick_pos',
      title: 'Counter Parts Sale (POS)',
      subtitle: 'Sell spare parts with M-Pesa, Cash or Split billing',
      icon: ShoppingCart,
      color: '#10b981',
      bg: '#ecfdf5',
      targetTab: 'pos'
    },
    {
      id: 'yard_checkin',
      title: 'Check-In Yard Vehicle',
      subtitle: 'Field parking tracker at KES 5,000/week + storage',
      icon: ParkingSquare,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      targetTab: 'yard'
    },
    {
      id: 'rent_tool',
      title: 'Rent Out Tool / Equipment',
      subtitle: 'Body jacks, check handles, welding rigs & pullers',
      icon: Hammer,
      color: '#f59e0b',
      bg: '#fffbeb',
      targetTab: 'tools'
    },
    {
      id: 'add_part',
      title: 'Add New Spare Part / Stock',
      subtitle: 'Register items with Serial/IMEI, cost & margin',
      icon: PackagePlus,
      color: '#0284c7',
      bg: '#f0f9ff',
      targetTab: 'inventory'
    },
    {
      id: 'shift_reconcile',
      title: 'Shift Drawer & Stock Audit',
      subtitle: 'Open/close register & count physical shelf stock',
      icon: Clock,
      color: '#e11d48',
      bg: '#fff1f2',
      targetTab: 'audit'
    }
  ];

  const handleAction = (item: typeof actions[0]) => {
    setActiveTab(item.targetTab);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Master Admin Quick Actions
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Select an operation to launch instantly
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {actions.map(act => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                onClick={() => handleAction(act)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = act.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: act.bg,
                  color: act.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                    {act.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                    {act.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">Close</button>
        </div>
      </div>
    </div>
  );
};
