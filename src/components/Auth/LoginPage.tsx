import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Crown, 
  Wrench, 
  ShieldCheck, 
  KeyRound, 
  LogIn, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [pin, setPin] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setPin(role === 'ADMIN' ? '1234' : '0000');
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(selectedRole, pin);
    if (!success) {
      setErrorMsg('Invalid Security PIN. (Admin PIN: 1234, Staff PIN: 0000)');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #0f172a 0%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: 'var(--font-main)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '880px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        background: '#ffffff',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
      }}>
        
        {/* LEFT COLUMN: BRANDING & LOGO */}
        <div style={{
          background: 'linear-gradient(145deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%)',
          padding: '36px 30px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Real Logo Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
              <img 
                src="/vankah_logo.jpg" 
                alt="Vankah The Garage Logo" 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  border: '2px solid #ca8a04',
                  boxShadow: '0 8px 20px rgba(202, 138, 4, 0.35)',
                  objectFit: 'cover'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1.55rem', fontWeight: '900', letterSpacing: '0.8px', color: '#facc15' }}>
                    VANKAH
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '0.8px', color: '#ffffff' }}>
                    THE GARAGE
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
                  Unified Workshop ERP, POS & Yard Management
                </div>
              </div>
            </div>

            {/* Role Switcher */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Select Workstation Role:
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleRoleChange('ADMIN')}
                  style={{
                    padding: '16px 12px',
                    borderRadius: '14px',
                    border: selectedRole === 'ADMIN' ? '2px solid #f59e0b' : '1px solid #334155',
                    background: selectedRole === 'ADMIN' ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.05))' : 'rgba(30,41,59,0.5)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Crown size={24} color={selectedRole === 'ADMIN' ? '#fbbf24' : '#94a3b8'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Owner / Director</span>
                  <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>P&L & Audits</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('STAFF')}
                  style={{
                    padding: '16px 12px',
                    borderRadius: '14px',
                    border: selectedRole === 'STAFF' ? '2px solid #10b981' : '1px solid #334155',
                    background: selectedRole === 'STAFF' ? 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.05))' : 'rgba(30,41,59,0.5)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Wrench size={24} color={selectedRole === 'STAFF' ? '#34d399' : '#94a3b8'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Workshop Staff</span>
                  <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>POS, Jobs & Yard</span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
            <ShieldCheck size={14} color="#38bdf8" />
            <span>PostgreSQL Database Active • Render / Vercel Ready</span>
          </div>
        </div>

        {/* RIGHT COLUMN: PIN AUTHENTICATION FORM */}
        <div style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: selectedRole === 'ADMIN' ? '#fef3c7' : '#dcfce7',
              color: selectedRole === 'ADMIN' ? '#92400e' : '#166534',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '10px'
            }}>
              <Sparkles size={13} />
              <span>Logging in as {selectedRole === 'ADMIN' ? 'Owner / Director' : 'Operations Staff'}</span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Enter Security PIN
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
              {selectedRole === 'ADMIN' 
                ? 'Full access to revenues, profit margins, stock audits & reports.' 
                : 'Fast point-of-sale checkout, job card tracking & yard gate clearance.'}
            </p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Security PIN Code
              </label>
              
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    fontSize: '1.25rem',
                    letterSpacing: '4px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    outline: 'none',
                    fontWeight: '700',
                    fontFamily: 'var(--font-mono)'
                  }}
                  autoFocus
                />
              </div>
            </div>

            {errorMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fee2e2',
                border: '1px solid #fecdd3',
                color: '#991b1b',
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '16px'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Quick Demo PIN presets */}
            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '0.78rem'
            }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Quick Preset PINs:</span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('ADMIN'); setPin('1234'); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #fde68a',
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Admin PIN: 1234
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('STAFF'); setPin('0000'); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                    background: '#dcfce7',
                    color: '#166534',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Staff PIN: 0000
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '12px'
              }}
            >
              <LogIn size={18} />
              <span>Unlock {selectedRole === 'ADMIN' ? 'Owner Dashboard' : 'Staff Workstation'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
