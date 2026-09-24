import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  PlusCircle, 
  LogOut, 
  Menu
} from 'lucide-react';

interface HeaderProps {
  onOpenQuickAction: () => void;
  onToggleNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickAction, onToggleNav }) => {
  const { activeShift, transactions, products, currentUser, logout } = useApp();

  // Today's stats calculation
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayTxs = transactions.filter(t => new Date(t.date) >= todayStart);
  const todayGross = todayTxs.reduce((sum, t) => sum + t.grossAmount, 0);

  const lowStockCount = products.filter(p => p.stockQty <= p.minAlertQty).length;
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="header-main" style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      {/* Title, Logo & Portal Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Hamburger Toggle Button */}
        {onToggleNav && (
          <button
            onClick={onToggleNav}
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/vankah_logo.jpg" 
            alt="Vankah Logo" 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              objectFit: 'cover'
            }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
                <span style={{ color: '#ca8a04' }}>VANKAH</span> <span style={{ color: '#0f172a' }}>THE GARAGE</span>
              </h2>
              <span className={`badge ${isAdmin ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                {isAdmin ? '👑 Owner Portal' : '🔧 Staff Desk'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b', marginTop: '2px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={12} /> {new Date().toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span>•</span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: activeShift ? '#166534' : '#991b1b',
                fontWeight: 600
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: activeShift ? '#22c55e' : '#ef4444'
                }}></span>
                {activeShift ? `Active Shift: ${activeShift.cashierName}` : 'Shift Closed'}
              </span>
              {isAdmin && lowStockCount > 0 && (
                <>
                  <span>•</span>
                  <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                    {lowStockCount} Low Stock Alert
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Live Bar & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#059669', fontWeight: 700 }}>Today Sales:</span>
            <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>KES {todayGross.toLocaleString()}</strong>
          </div>
        </div>

        {/* Quick Action Speed-Dial Button */}
        <button 
          onClick={onOpenQuickAction}
          className="btn btn-primary btn-sm"
          style={{ padding: '6px 12px', fontSize: '0.775rem' }}
        >
          <PlusCircle size={14} />
          <span>+ Quick Action</span>
        </button>

        {/* Logout / Switch Dashboard */}
        <button
          onClick={logout}
          className="btn btn-outline btn-sm"
          title="Logout / Switch Dashboard"
          style={{ padding: '6px 10px', color: '#e11d48', borderColor: '#fecdd3' }}
        >
          <LogOut size={14} />
          <span style={{ fontSize: '0.75rem' }}>Exit</span>
        </button>
      </div>
    </header>
  );
};
