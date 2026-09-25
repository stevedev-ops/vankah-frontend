import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Wrench, 
  ShoppingCart, 
  Package, 
  ParkingSquare, 
  Hammer, 
  ClipboardCheck, 
  TrendingUp, 
  RotateCcw,
  LogOut,
  Crown,
  PackagePlus,
  ShieldAlert,
  BookOpen,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { activeTab, setActiveTab, resetAllData, jobCards, products, yardVehicles, toolRentals, debtors, currentUser, logout } = useApp();

  const activeJobsCount = jobCards.filter(j => j.status !== 'Delivered').length;
  const lowStockCount = products.filter(p => p.stockQty <= p.minAlertQty).length;
  const activeYardCount = yardVehicles.filter(y => !y.isCleared).length;
  const activeRentalsCount = toolRentals.filter(t => t.status === 'Active').length;
  const totalDebtorsCount = debtors.filter(d => d.currentBalance > 0).length;

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  const handleLogoutClick = () => {
    logout();
    if (onClose) onClose();
  };

  // 1. Owner / Admin Navigation
  const adminNavItems = [
    { id: 'overview', label: 'Executive P&L Pulse', icon: LayoutDashboard, badge: null },
    { id: 'reports', label: 'Full Financial Statements', icon: TrendingUp, badge: null },
    { id: 'credit', label: 'Debtors Ledger (Madeni)', icon: BookOpen, badge: totalDebtorsCount > 0 ? totalDebtorsCount : null, badgeColor: 'badge-red' },
    { id: 'audit', label: 'Staff Cash & Stock Audits', icon: ShieldAlert, badge: null },
    { id: 'inventory', label: 'Catalog & Margin Control', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'badge-amber' },
    { id: 'garage', label: 'Workshop Jobs Monitor', icon: Wrench, badge: activeJobsCount > 0 ? activeJobsCount : null, badgeColor: 'badge-blue' },
    { id: 'yard', label: 'Yard & Field Money Review', icon: ParkingSquare, badge: activeYardCount > 0 ? activeYardCount : null, badgeColor: 'badge-purple' },
    { id: 'tools', label: 'Tool Rentals Ledger', icon: Hammer, badge: activeRentalsCount > 0 ? activeRentalsCount : null, badgeColor: 'badge-green' },
  ];

  // 2. Staff / Attendant Navigation
  const staffNavItems = [
    { id: 'pos', label: 'Counter POS & Fast Sell', icon: ShoppingCart, badge: null },
    { id: 'credit', label: 'Debtors Book (Madeni)', icon: BookOpen, badge: totalDebtorsCount > 0 ? totalDebtorsCount : null, badgeColor: 'badge-red' },
    { id: 'garage', label: 'Garage & Job Cards', icon: Wrench, badge: activeJobsCount > 0 ? activeJobsCount : null, badgeColor: 'badge-blue' },
    { id: 'inventory', label: 'Stock Intake & Shelves', icon: PackagePlus, badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'badge-amber' },
    { id: 'yard', label: 'Yard Parking & Holding', icon: ParkingSquare, badge: activeYardCount > 0 ? activeYardCount : null, badgeColor: 'badge-purple' },
    { id: 'tools', label: 'Tool Hire Desk', icon: Hammer, badge: activeRentalsCount > 0 ? activeRentalsCount : null, badgeColor: 'badge-green' },
    { id: 'audit', label: 'Register Shift & Stock Count', icon: ClipboardCheck, badge: null },
  ];

  const visibleNavItems = isAdmin ? adminNavItems : staffNavItems;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar-desktop ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/vankah_logo.jpg" 
              alt="Vankah Logo" 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid #334155'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: '900', letterSpacing: '0.5px', color: '#facc15' }}>
                  VANKAH
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px', color: '#ffffff' }}>
                  THE GARAGE
                </span>
              </div>
              <span style={{ fontSize: '0.65rem', color: isAdmin ? '#fde68a' : '#86efac', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block' }}>
                {isAdmin ? '👑 Director Command Hub' : '🔧 Workshop Operations'}
              </span>
            </div>
          </div>

          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#ffffff',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Context Banner with Quick Logout Button at TOP */}
        <div style={{
          margin: '10px 12px 6px',
          padding: '8px 12px',
          background: isAdmin ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${isAdmin ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'Staff User'}
            </div>
            <div style={{ fontSize: '0.66rem', color: isAdmin ? '#fbbf24' : '#34d399', fontWeight: 600 }}>
              {currentUser?.title || (isAdmin ? 'Director' : 'Staff')}
            </div>
          </div>
          
          <button
            onClick={handleLogoutClick}
            style={{
              background: '#e11d48',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '5px 9px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              fontWeight: 700,
              flexShrink: 0,
              marginLeft: '8px'
            }}
            title="Log out and switch user"
          >
            <LogOut size={12} />
            <span>Exit</span>
          </button>
        </div>

        {/* Navigation Items (Scrollable Middle Section) */}
        <nav className="sidebar-nav" style={{ 
          padding: '8px 8px', 
          flex: '1 1 0%', 
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{ 
            fontSize: '0.65rem', 
            fontWeight: 800, 
            color: '#64748b', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            padding: '6px 12px 4px' 
          }}>
            {isAdmin ? 'Management Console' : 'Operational Tasks'}
          </div>

          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  marginBottom: '2px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive 
                    ? (isAdmin ? 'linear-gradient(90deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))' : 'linear-gradient(90deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))')
                    : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  borderLeft: isActive 
                    ? `3px solid ${isAdmin ? '#f59e0b' : '#10b981'}` 
                    : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.825rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isActive ? (isAdmin ? '#fbbf24' : '#34d399') : '#64748b'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`badge ${item.badgeColor || 'badge-gray'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pinned Bottom Section (Always in View on Mobile) */}
        <div style={{ 
          padding: '10px 14px', 
          borderTop: '1px solid #1e293b', 
          background: '#090d16',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          flexShrink: 0,
          zIndex: 10
        }}>
          {/* Prominent Bottom Logout Button */}
          <button
            onClick={handleLogoutClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.3), rgba(159, 18, 57, 0.4))',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Log out of session"
          >
            <LogOut size={16} color="#fda4af" />
            <span>Log Out / Switch Account</span>
          </button>

          {/* Footer App Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
              Vankah ERP v1.0
            </span>
            <button
              onClick={() => {
                if (window.confirm('Reset local cache and reload from PostgreSQL?')) {
                  resetAllData();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.65rem'
              }}
              title="Sync Data"
            >
              <RotateCcw size={11} />
              <span>Sync DB</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
