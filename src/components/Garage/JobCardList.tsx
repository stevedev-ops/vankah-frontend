import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobCard } from '../../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Layers,
  ChevronRight,
  ExternalLink,
  Flame,
  Hammer,
  History
} from 'lucide-react';
import { JobCardModal } from './JobCardModal';
import { JobInvoiceModal } from './JobInvoiceModal';
import { VehicleHistoryModal } from './VehicleHistoryModal';

export const JobCardList: React.FC = () => {
  const { jobCards } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<JobCard | null>(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedJobForInvoice, setSelectedJobForInvoice] = useState<JobCard | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPlateQuery, setHistoryPlateQuery] = useState('');

  const filteredJobs = jobCards.filter(job => {
    const matchesSearch = job.carRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.carMakeModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenNewJob = () => {
    setSelectedJobForEdit(null);
    setShowJobModal(true);
  };

  const handleOpenEdit = (job: JobCard) => {
    setSelectedJobForEdit(job);
    setShowJobModal(true);
  };

  const handleOpenInvoice = (job: JobCard) => {
    setSelectedJobForInvoice(job);
    setShowInvoiceModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Controls */}
      <div className="erp-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search Reg No, Customer, Job No..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Intake', 'In Progress', 'Ready', 'Delivered'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: filterStatus === st ? '#2563eb' : '#e2e8f0',
                  background: filterStatus === st ? '#2563eb' : '#ffffff',
                  color: filterStatus === st ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => {
              setHistoryPlateQuery('');
              setShowHistoryModal(true);
            }} 
            className="btn btn-outline"
            style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#1e293b' }}
          >
            <History size={16} color="#2563eb" />
            <span>📜 Lookup Car History</span>
          </button>
          
          <button onClick={handleOpenNewJob} className="btn btn-primary">
            <Plus size={16} />
            <span>+ New Car Job Card (Quotation/Build)</span>
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="erp-card">
        <div className="erp-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Workshop Registry & Fabrication Builds ({filteredJobs.length} Jobs)
            </h3>
          </div>
        </div>
        <div className="erp-card-body" style={{ padding: 0 }}>
          <div className="erp-table-wrapper" style={{ border: 'none' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Job No / Vehicle</th>
                  <th>Customer</th>
                  <th>Labor Breakdown (Panel/Welding)</th>
                  <th>Parts & Outside Purchases</th>
                  <th>Total Bill</th>
                  <th>Deposit / Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => {
                  const totalLabor = job.laborItems.reduce((s, l) => s + l.cost, 0);
                  const totalPartsBilled = job.parts.reduce((s, p) => s + p.quantity * p.unitSellingPrice, 0);
                  const totalBill = totalLabor + totalPartsBilled;
                  const balanceDue = Math.max(0, totalBill - job.advanceDeposit);
                  const hasOutsideParts = job.parts.some(p => p.isOutsidePurchase);

                  return (
                    <tr key={job.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{job.carRegNo}</strong>
                          <button
                            onClick={() => {
                              setHistoryPlateQuery(job.carRegNo);
                              setShowHistoryModal(true);
                            }}
                            title={`View Lifetime History for ${job.carRegNo}`}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              cursor: 'pointer',
                              color: '#2563eb',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            <History size={10} /> History
                          </button>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.carMakeModel}</div>
                        <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>{job.jobNo}</span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{job.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.customerPhone}</div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {job.laborItems.map(l => (
                            <div key={l.id} style={{ fontSize: '0.75rem', color: '#334155' }}>
                              <span style={{ fontWeight: 600 }}>{l.type}:</span> KES {l.cost.toLocaleString()}
                            </div>
                          ))}
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                            Labor Total: KES {totalLabor.toLocaleString()}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.75rem' }}>
                          <div>{job.parts.length} Part(s) Allocated</div>
                          {hasOutsideParts && (
                            <span className="badge badge-purple" style={{ fontSize: '0.675rem', marginTop: '2px' }}>
                              ★ Outside Purchase Logged
                            </span>
                          )}
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>
                            Parts Total: KES {totalPartsBilled.toLocaleString()}
                          </div>
                        </div>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0f172a' }}>
                        KES {totalBill.toLocaleString()}
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 600 }}>
                        KES {job.advanceDeposit.toLocaleString()}
                        {job.mpesaRef && (
                          <div style={{ fontSize: '0.675rem', color: '#0284c7' }}>Ref: {job.mpesaRef}</div>
                        )}
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: balanceDue > 0 ? '#e11d48' : '#059669' }}>
                        KES {balanceDue.toLocaleString()}
                      </td>

                      <td>
                        <span className={`badge ${
                          job.status === 'Ready' ? 'badge-green' :
                          job.status === 'In Progress' ? 'badge-blue' :
                          job.status === 'Delivered' ? 'badge-gray' : 'badge-amber'
                        }`}>
                          {job.status}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleOpenEdit(job)} className="btn btn-outline btn-sm" title="Edit Job Details">
                            Edit
                          </button>
                          <button onClick={() => handleOpenInvoice(job)} className="btn btn-primary btn-sm" title="View / Settle Invoice">
                            <FileText size={13} />
                            <span>Invoice</span>
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

      {/* MODALS */}
      {showJobModal && (
        <JobCardModal
          job={selectedJobForEdit}
          onClose={() => setShowJobModal(false)}
        />
      )}

      {showInvoiceModal && selectedJobForInvoice && (
        <JobInvoiceModal
          job={selectedJobForInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedJobForInvoice(null);
          }}
        />
      )}

      {showHistoryModal && (
        <VehicleHistoryModal
          initialCarRegNo={historyPlateQuery}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

    </div>
  );
};
