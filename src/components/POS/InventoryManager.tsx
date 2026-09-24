import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  ArrowUpDown,
  Tag,
  Barcode
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [category, setCategory] = useState<Product['category']>('Body Parts');
  const [buyingPrice, setBuyingPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stockQty, setStockQty] = useState<number>(1);
  const [minAlertQty, setMinAlertQty] = useState<number>(2);
  const [location, setLocation] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.imeiOrSerial && p.imeiOrSerial.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setImeiOrSerial('');
    setCategory('Body Parts');
    setBuyingPrice(0);
    setSellingPrice(0);
    setStockQty(1);
    setMinAlertQty(2);
    setLocation('Shelf A1');
    setShowAddModal(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setImeiOrSerial(prod.imeiOrSerial || '');
    setCategory(prod.category);
    setBuyingPrice(prod.buyingPrice);
    setSellingPrice(prod.sellingPrice);
    setStockQty(prod.stockQty);
    setMinAlertQty(prod.minAlertQty);
    setLocation(prod.location || '');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Product name is required');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        sku,
        imeiOrSerial: imeiOrSerial || undefined,
        category,
        buyingPrice,
        sellingPrice,
        stockQty,
        minAlertQty,
        location
      });
    } else {
      addProduct({
        name,
        sku,
        imeiOrSerial: imeiOrSerial || undefined,
        category,
        buyingPrice,
        sellingPrice,
        stockQty,
        minAlertQty,
        location
      });
    }

    setShowAddModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Controls */}
      <div className="erp-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Filter by part, SKU or Serial/IMEI..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} />
          <span>+ Add New Part / Item</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Master Parts Catalog & Profit Margins ({filtered.length} items)
            </h3>
          </div>
        </div>
        <div className="erp-card-body" style={{ padding: 0 }}>
          <div className="erp-table-wrapper" style={{ border: 'none' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Item / Part Description</th>
                  <th>Category</th>
                  <th>Serial / IMEI Number</th>
                  <th>Buying Price (Cost)</th>
                  <th>Selling Price</th>
                  <th>Margin (Profit)</th>
                  <th>Stock On Hand</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const marginKes = item.sellingPrice - item.buyingPrice;
                  const marginPct = item.sellingPrice > 0 ? ((marginKes / item.sellingPrice) * 100).toFixed(1) : '0';
                  const isLow = item.stockQty <= item.minAlertQty;

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{item.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {item.sku} • {item.location || 'Warehouse'}</div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{item.category}</span>
                      </td>
                      <td>
                        {item.imeiOrSerial ? (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#0284c7', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>
                            {item.imeiOrSerial}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>None</span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        KES {item.buyingPrice.toLocaleString()}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0f172a' }}>
                        KES {item.sellingPrice.toLocaleString()}
                      </td>
                      <td>
                        <span style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          +KES {marginKes.toLocaleString()}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>({marginPct}%)</div>
                      </td>
                      <td>
                        <span className={`badge ${item.stockQty <= 0 ? 'badge-rose' : isLow ? 'badge-amber' : 'badge-green'}`}>
                          {item.stockQty} Units {isLow && '⚠️ Low'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleOpenEdit(item)} className="btn btn-outline btn-sm" title="Edit Product">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => { if (confirm(`Delete ${item.name}?`)) deleteProduct(item.id); }} className="btn btn-outline btn-sm" style={{ color: '#e11d48' }} title="Delete Product">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                {editingProduct ? 'Edit Spare Part' : 'Add New Spare Part / Item'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Item / Part Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 2K Body Primer or Isuzu Alternator"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">SKU / Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
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
                  <label className="form-label">Serial Number / IMEI (Optional for electronics/batteries)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SN-9824-77102-K"
                    value={imeiOrSerial}
                    onChange={e => setImeiOrSerial(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Buying Price / Cost (KES) *</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={buyingPrice}
                      onChange={e => setBuyingPrice(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Selling Price (KES) *</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={sellingPrice}
                      onChange={e => setSellingPrice(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={stockQty}
                      onChange={e => setStockQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Low Stock Alert Qty</label>
                    <input
                      type="number"
                      className="form-input"
                      value={minAlertQty}
                      onChange={e => setMinAlertQty(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location / Bin</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Shelf B2"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
