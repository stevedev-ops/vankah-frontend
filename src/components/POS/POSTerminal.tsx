import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, CartItem, PaymentMethod } from '../../types';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  Printer, 
  Smartphone,
  CircleDollarSign,
  Layers,
  PackagePlus,
  BookOpen,
  X
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const POSTerminal: React.FC = () => {
  const { products, processPOSSale, addProduct, currentUser, debtors } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Payment modal state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mpesa');
  const [mpesaAmount, setMpesaAmount] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [mpesaRef, setMpesaRef] = useState<string>('');
  const [selectedDebtorId, setSelectedDebtorId] = useState<string>(debtors[0]?.id || '');
  
  // Quick Add Stock Modal State
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newImeiOrSerial, setNewImeiOrSerial] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Body Parts');
  const [newBuyingPrice, setNewBuyingPrice] = useState<number>(0);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(0);
  const [newStockQty, setNewStockQty] = useState<number>(1);
  const [newLocation, setNewLocation] = useState('Shelf A1');

  // Receipt state
  const [completedTx, setCompletedTx] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Mobile responsive view state
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.imeiOrSerial && p.imeiOrSerial.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Categories list
  const categories = ['All', 'Body Parts', 'Electrical', 'Engine & Transmission', 'Consumables & Oils', 'Tools & Accessories', 'Custom Fabrication'];

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stockQty <= 0) {
      alert(`"${product.name}" is out of stock!`);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) {
          alert(`Cannot add more than available stock (${product.stockQty})`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice, unitCost: product.buyingPrice }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const target = prev.find(i => i.product.id === productId);
      if (!target) return prev;

      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(i => i.product.id !== productId);
      }
      if (newQty > target.product.stockQty) {
        alert(`Max available stock: ${target.product.stockQty}`);
        return prev;
      }
      return prev.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotalGross = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const subtotalCost = cart.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const projectedProfit = subtotalGross - subtotalCost;

  // Handle Checkout Click
  const handleInitiateCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'Mpesa') {
      setMpesaAmount(subtotalGross);
      setCashAmount(0);
    } else if (paymentMethod === 'Cash') {
      setCashAmount(subtotalGross);
      setMpesaAmount(0);
    } else if (paymentMethod === 'Split') {
      setMpesaAmount(Math.floor(subtotalGross / 2));
      setCashAmount(Math.ceil(subtotalGross / 2));
    }
  };

  // Submit payment
  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let finalMpesa = 0;
    let finalCash = 0;

    if (paymentMethod === 'Mpesa') {
      finalMpesa = subtotalGross;
    } else if (paymentMethod === 'Cash') {
      finalCash = subtotalGross;
    } else if (paymentMethod === 'Split') {
      if (mpesaAmount + cashAmount !== subtotalGross) {
        alert(`Split total (KES ${mpesaAmount + cashAmount}) must match Total Gross (KES ${subtotalGross})`);
        return;
      }
      finalMpesa = mpesaAmount;
      finalCash = cashAmount;
    } else if (paymentMethod === 'Credit') {
      if (!selectedDebtorId) {
        alert('Select a debtor customer account to bill on credit.');
        return;
      }
    }

    const tx = processPOSSale(cart, paymentMethod, finalMpesa, finalCash, mpesaRef, selectedDebtorId);
    setCompletedTx({ tx, cart, subtotalGross, paymentMethod, mpesaRef });
    setShowReceiptModal(true);
    clearCart();
    setMpesaRef('');
  };

  // Handle Quick Add New Stock Item
  const handleOpenAddStock = () => {
    setNewPartName('');
    setNewSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewImeiOrSerial('');
    setNewCategory('Body Parts');
    setNewBuyingPrice(0);
    setNewSellingPrice(0);
    setNewStockQty(1);
    setNewLocation('Store Shelf');
    setShowAddStockModal(true);
  };

  const handleSaveNewStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) {
      alert('Part name is required');
      return;
    }

    addProduct({
      name: newPartName,
      sku: newSku || `SKU-${Date.now().toString().slice(-4)}`,
      imeiOrSerial: newImeiOrSerial || undefined,
      category: newCategory,
      buyingPrice: Number(newBuyingPrice) || 0,
      sellingPrice: Number(newSellingPrice) || 0,
      stockQty: Number(newStockQty) || 1,
      minAlertQty: 2,
      location: newLocation
    });

    alert(`Part "${newPartName}" added to inventory successfully!`);
    setShowAddStockModal(false);
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Mobile Tab Switcher (Visible on small screens) */}
      <div className="pos-mobile-tabs" style={{ display: 'none', gap: '8px', marginBottom: '4px' }}>
        <button
          onClick={() => setMobileTab('catalog')}
          className={`btn ${mobileTab === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '10px' }}
        >
          <Search size={16} />
          <span>Parts Catalog ({filteredProducts.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`btn ${mobileTab === 'cart' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '10px' }}
        >
          <ShoppingCart size={16} />
          <span>Cart ({cart.length}) {cart.length > 0 && `• KES ${subtotalGross.toLocaleString()}`}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT: PRODUCTS CATALOG & SEARCH */}
        <div className={`pos-catalog-panel ${mobileTab === 'cart' ? 'hide-on-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '0' }}>
        
        {/* Search & Filter Header */}
        <div className="erp-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '0.9rem' }}
                placeholder="Search part name, SKU, or Serial/IMEI..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="btn btn-outline btn-sm">
                Clear
              </button>
            )}

            {/* Quick Add Stock Button */}
            <button onClick={handleOpenAddStock} className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
              <PackagePlus size={16} />
              <span>+ Add New Stock / Part</span>
            </button>
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#2563eb' : '#e2e8f0',
                  background: selectedCategory === cat ? '#2563eb' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '12px'
        }}>
          {filteredProducts.map(product => {
            const isOutOfStock = product.stockQty <= 0;
            const isLowStock = product.stockQty <= product.minAlertQty;
            const inCart = cart.find(c => c.product.id === product.id);

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                style={{
                  background: '#ffffff',
                  border: inCart ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.675rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                      {product.sku}
                    </span>
                    <span className={`badge ${isOutOfStock ? 'badge-rose' : isLowStock ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                      {isOutOfStock ? 'Out of Stock' : `${product.stockQty} in stock`}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px', lineHeight: 1.3 }}>
                    {product.name}
                  </h4>

                  {product.imeiOrSerial && (
                    <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#0284c7', background: '#f0f9ff', padding: '2px 5px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px' }}>
                      SN: {product.imeiOrSerial}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Price</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                      KES {product.sellingPrice.toLocaleString()}
                    </div>
                  </div>
                  <button
                    disabled={isOutOfStock}
                    style={{
                      background: inCart ? '#2563eb' : '#eff6ff',
                      color: inCart ? '#ffffff' : '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '5px 8px',
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {inCart ? `${inCart.quantity} in Cart` : '+ Add'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT: LIVE CART & CHECKOUT TERMINAL */}
      <div className={`erp-card pos-cart-panel ${mobileTab === 'catalog' ? 'hide-on-mobile' : ''}`} style={{ position: 'sticky', top: '75px', minWidth: '0' }}>
        <div className="erp-card-header" style={{ background: '#f8fafc', padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mobileTab === 'cart' && (
              <button
                type="button"
                onClick={() => setMobileTab('catalog')}
                className="btn btn-outline btn-sm pos-mobile-back-btn"
                style={{ display: 'none', padding: '3px 8px', fontSize: '0.75rem' }}
              >
                ← Catalog
              </button>
            )}
            <ShoppingCart size={18} color="#2563eb" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Sales Cart ({cart.length} items)
            </h3>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="btn btn-outline btn-sm" style={{ color: '#e11d48', padding: '2px 8px', fontSize: '0.75rem' }}>
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '12px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <ShoppingCart size={30} style={{ margin: '0 auto 6px auto', opacity: 0.4 }} />
              <p style={{ fontSize: '0.8rem' }}>Cart is empty. Click items on the left to add.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map(item => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    gap: '8px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      KES {item.unitPrice.toLocaleString()} each
                    </div>
                  </div>

                  {/* Quantity & Remove controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, -1); }}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                      title="Decrease or Remove"
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 800, fontSize: '0.8rem', width: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.product.id, 1); }}
                      style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                      title="Increase"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFromCart(item.product.id); }}
                      style={{ color: '#e11d48', background: '#fee2e2', border: '1px solid #fecdd3', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}
                      title="Remove Item Completely"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals Preview */}
        {cart.length > 0 && (
          <div style={{ padding: '12px 16px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
            {isAdmin && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>
                <span>Gross Profit Margin:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>+ KES {projectedProfit.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              <span>Total Payable:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#2563eb' }}>KES {subtotalGross.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Payment Methods Selection (Including On Credit / Madeni) */}
        {cart.length > 0 && (
          <form onSubmit={handleCompleteSale} style={{ padding: '14px 16px' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.775rem' }}>Select Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('Mpesa'); handleInitiateCheckout(); }}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'Mpesa' ? '#2563eb' : '#cbd5e1',
                    background: paymentMethod === 'Mpesa' ? '#eff6ff' : '#ffffff',
                    color: paymentMethod === 'Mpesa' ? '#2563eb' : '#475569',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <Smartphone size={13} />
                  <span>M-Pesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('Cash'); handleInitiateCheckout(); }}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'Cash' ? '#059669' : '#cbd5e1',
                    background: paymentMethod === 'Cash' ? '#ecfdf5' : '#ffffff',
                    color: paymentMethod === 'Cash' ? '#059669' : '#475569',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <CircleDollarSign size={13} />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('Split'); handleInitiateCheckout(); }}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'Split' ? '#d97706' : '#cbd5e1',
                    background: paymentMethod === 'Split' ? '#fffbeb' : '#ffffff',
                    color: paymentMethod === 'Split' ? '#d97706' : '#475569',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <Layers size={13} />
                  <span>Split</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMethod('Credit'); handleInitiateCheckout(); }}
                  style={{
                    padding: '6px 2px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: paymentMethod === 'Credit' ? '#e11d48' : '#cbd5e1',
                    background: paymentMethod === 'Credit' ? '#fff1f2' : '#ffffff',
                    color: paymentMethod === 'Credit' ? '#e11d48' : '#475569',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <BookOpen size={13} />
                  <span>Credit</span>
                </button>
              </div>
            </div>

            {/* On Credit Debtor Selection */}
            {paymentMethod === 'Credit' && (
              <div style={{ background: '#fff1f2', padding: '8px 10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #fda4af' }}>
                <label className="form-label" style={{ fontSize: '0.725rem', color: '#991b1b', fontWeight: 800 }}>
                  Select Debtor Customer Account (*Madeni*)
                </label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.8rem', padding: '4px 6px' }}
                  value={selectedDebtorId}
                  onChange={e => setSelectedDebtorId(e.target.value)}
                >
                  {debtors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.businessOrCarReg || d.phone}) — Limit: KES {d.creditLimit.toLocaleString()}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.7rem', color: '#991b1b', marginTop: '4px' }}>
                  Bill will be added to customer's outstanding credit balance.
                </div>
              </div>
            )}

            {/* Split Amount Inputs */}
            {paymentMethod === 'Split' && (
              <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0284c7' }}>M-Pesa (KES)</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                      value={mpesaAmount}
                      onChange={e => setMpesaAmount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#059669' }}>Cash (KES)</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ padding: '4px 6px', fontSize: '0.8rem' }}
                      value={cashAmount}
                      onChange={e => setCashAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mpesa Ref code */}
            {(paymentMethod === 'Mpesa' || paymentMethod === 'Split') && (
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.725rem' }}>M-Pesa Confirmation Code (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. RBL884920K"
                  value={mpesaRef}
                  onChange={e => setMpesaRef(e.target.value)}
                />
              </div>
            )}

            {/* Complete Sale Button */}
            <button
              type="submit"
              className="btn btn-success"
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
            >
              <CheckCircle size={16} />
              <span>{paymentMethod === 'Credit' ? 'Record Credit Sale (Madeni)' : 'Complete Sale & Print Receipt'}</span>
            </button>
          </form>
        )}
      </div>
      </div>

      {/* QUICK ADD NEW STOCK MODAL */}
      {showAddStockModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PackagePlus size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Add New Stock / Spare Part Item</h3>
              </div>
              <button onClick={() => setShowAddStockModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveNewStock}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Part / Item Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 10W-40 Engine Oil (4L) or Alternator"
                    value={newPartName}
                    onChange={e => setNewPartName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">SKU / Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newSku}
                      onChange={e => setNewSku(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as any)}
                    >
                      <option value="Body Parts">Body Parts</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Engine & Transmission">Engine & Transmission</option>
                      <option value="Consumables & Oils">Consumables & Oils</option>
                      <option value="Tools & Accessories">Tools & Accessories</option>
                      <option value="Custom Fabrication">Custom Fabrication</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Serial Number / IMEI (If applicable)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SN-889102-B"
                    value={newImeiOrSerial}
                    onChange={e => setNewImeiOrSerial(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Selling Price (KES) *</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={newSellingPrice}
                      onChange={e => setNewSellingPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Buying / Cost Price (KES)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newBuyingPrice}
                      onChange={e => setNewBuyingPrice(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Initial Quantity in Stock *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={newStockQty}
                      onChange={e => setNewStockQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store Shelf / Bin</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newLocation}
                      onChange={e => setNewLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddStockModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Part to Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Mobile Cart Bar */}
      {cart.length > 0 && mobileTab === 'catalog' && (
        <div 
          className="pos-floating-mobile-bar"
          onClick={() => setMobileTab('cart')}
          style={{
            display: 'none',
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: '#2563eb',
            color: 'white',
            padding: '12px 18px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)',
            zIndex: 40,
            cursor: 'pointer',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <ShoppingCart size={18} />
            <span>View Cart ({cart.length} items)</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem' }}>
            KES {subtotalGross.toLocaleString()} →
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceiptModal && completedTx && (
        <ReceiptModal
          data={completedTx}
          onClose={() => {
            setShowReceiptModal(false);
            setCompletedTx(null);
          }}
        />
      )}

    </div>
  );
};
