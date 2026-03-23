import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import styles from './Invoices.module.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [actionDropdown, setActionDropdown] = useState(null);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        API.get(`/invoices?page=${page}&limit=10`),
        API.get('/invoices/stats')
      ]);
      setInvoices(listRes.data.invoices);
      setTotalPages(listRes.data.pages);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id, status) => {
    try {
      await API.patch(`/invoices/${id}/status`, { status });
      setStatusDropdown(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await API.delete(`/invoices/${deleteConfirmId}`);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleView = async (id) => {
    try {
      const { data } = await API.get(`/invoices/${id}`);
      setViewInvoice(data);
      setActionDropdown(null);
    } catch (err) {
      alert('Failed to load invoice');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setActionDropdown(null);
      setStatusDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={styles.invoicesPage}>
      
      {/* Overall Invoice Card */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Overall Invoice</div>
        <div className={styles.overallStats}>
          <div className={styles.statCol}>
            <div className={styles.statHeader}>Recent Transactions</div>
            <div className={styles.statContent}>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{stats.recentInvoices || 0}</span>
                <span className={styles.statLabel}>Last 7 days</span>
              </div>
            </div>
          </div>
          <div className={styles.statCol}>
            <div className={styles.statHeader}>Total Invoices</div>
            <div className={styles.statContent}>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{stats.totalInvoices || 0}</span>
                <span className={styles.statLabel}>Total Till Date</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{stats.paidCount || 0}</span>
                <span className={styles.statLabel}>Processed</span>
              </div>
            </div>
          </div>
          <div className={styles.statCol}>
            <div className={styles.statHeader}>Paid Amount</div>
            <div className={styles.statContent}>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>₹{(stats.paidAmount || 0).toLocaleString()}</span>
                <span className={styles.statLabel}>Last 7 days</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{stats.paidCount || 0}</span>
                <span className={styles.statLabel}>customers</span>
              </div>
            </div>
          </div>
          <div className={styles.statCol}>
            <div className={styles.statHeader}>Unpaid Amount</div>
            <div className={styles.statContent}>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>₹{(stats.unpaidAmount || 0).toLocaleString()}</span>
                <span className={styles.statLabel}>Total Pending</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{stats.unpaidCount || 0}</span>
                <span className={styles.statLabel}>Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List Card */}
      <div className={styles.listCard}>
        <div className={styles.listHeader}>
          <div className={styles.listTitle}>Invoices List</div>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Reference Number</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Due Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'#8B8D97'}}>Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'#8B8D97'}}>No invoices yet</td></tr>
              ) : (
                invoices.map((inv, idx) => (
                  <tr key={inv._id} className={idx % 2 === 1 ? styles.rowGray : ''}>
                    <td style={{fontWeight:600}}>{inv.invoiceId}</td>
                    <td>{inv.refNumber}</td>
                    <td>₹ {inv.amount.toLocaleString()}</td>
                    <td>
                      <div 
                        className={styles.statusCellContainer} 
                        onClick={(e) => { e.stopPropagation(); setStatusDropdown(statusDropdown === inv._id ? null : inv._id); setActionDropdown(null); }}
                      >
                        <span className={styles.statusText}>{inv.status}</span>
                        {statusDropdown === inv._id && (
                          <div className={styles.statusActionDropdown} onClick={e => e.stopPropagation()}>
                            <button className={`${styles.statusBtn} ${styles.btnRed}`} onClick={() => handleStatusChange(inv._id, 'Unpaid')}>
                              ⍻ Unpaid
                            </button>
                            <button className={`${styles.statusBtn} ${styles.btnGreen}`} onClick={() => handleStatusChange(inv._id, 'Paid')}>
                              ☑ Paid
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{new Date(inv.dueDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'}).replace(/ /g, '-')}</td>
                    <td className={styles.actionsCell}>
                      <button 
                        className={styles.actionBtn} 
                        onClick={(e) => { e.stopPropagation(); setActionDropdown(actionDropdown === inv._id ? null : inv._id); setStatusDropdown(null); }}
                      >
                        ⋮
                      </button>
                      {actionDropdown === inv._id && (
                        <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
                          {inv.status === 'Paid' && (
                            <button className={styles.dropdownItem} onClick={() => handleView(inv._id)}>
                              <span style={{color: '#0288D1', fontSize: '16px'}}>👁</span> View Invoice
                            </button>
                          )}
                          <button className={styles.dropdownItem} onClick={() => { setDeleteConfirmId(inv._id); setActionDropdown(null); }}>
                            <span style={{color: '#E64A19', fontSize: '16px'}}>🗑</span> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
          <span className={styles.pageInfo}>Page {page} of {totalPages || 1}</span>
          <button className={styles.pageBtn} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
        </div>
      </div>

      {viewInvoice && (
        <div className={styles.modalOverlay} onClick={() => setViewInvoice(null)}>
          <div className={styles.modalWrapper} onClick={e => e.stopPropagation()}>
            <div className={styles.floatingActions}>
              <button className={`${styles.floatBtn} ${styles.floatClose}`} onClick={() => setViewInvoice(null)}>✕</button>
              <button className={`${styles.floatBtn} ${styles.floatDownload}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </button>
              <button className={`${styles.floatBtn} ${styles.floatPrint}`} onClick={() => window.print()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              </button>
            </div>
            <div className={styles.modal}>
              <div className={styles.invoiceScrollArea}>
              
              <div className={styles.invoiceHeader}>
                <h2>INVOICE</h2>
                <div className={styles.headerBoxes}>
                  <div className={styles.billedToBox}>
                    <div className={styles.billedToTitle}>Billed to</div>
                    <div className={styles.billedToName}>{viewInvoice.customerName || 'Customer Name'}</div>
                    <div className={styles.billedToAddress}>Company address</div>
                    <div className={styles.billedToAddress}>City, Country - 00000</div>
                  </div>
                  <div className={styles.businessInfoBox}>
                    <div className={styles.businessText}>Business address</div>
                    <div className={styles.businessText}>City, State, IN - 000 000</div>
                    <div className={styles.businessText}>TAX ID 00XXXXX1234X0XX</div>
                  </div>
                </div>
              </div>

              <div className={styles.invoiceBody}>
                <div className={styles.leftSidebar}>
                  <div className={styles.sidebarItem}>
                    <span className={styles.sidebarTitle}>Invoice #</span>
                    <span className={styles.sidebarValue}>{viewInvoice.invoiceId}</span>
                  </div>
                  <div className={styles.sidebarItem}>
                    <span className={styles.sidebarTitle}>Invoice date</span>
                    <span className={styles.sidebarValue}>{new Date(viewInvoice.createdAt).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}).replace(/ /g, '-')}</span>
                  </div>
                  <div className={styles.sidebarItem}>
                    <span className={styles.sidebarTitle}>Reference</span>
                    <span className={styles.sidebarValue}>{viewInvoice.refNumber || '-'}</span>
                  </div>
                  <div className={styles.sidebarItem}>
                    <span className={styles.sidebarTitle}>Due date</span>
                    <span className={styles.sidebarValue}>{new Date(viewInvoice.dueDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'}).replace(/ /g, '-')}</span>
                  </div>
                </div>

                <div className={styles.rightContent}>
                  <table className={styles.invoiceTable}>
                    <thead>
                      <tr>
                        <th>Products</th>
                        <th style={{textAlign: 'center'}}>Qty</th>
                        <th style={{textAlign: 'right'}}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={styles.productName}>{viewInvoice.productName || 'Product item'}</td>
                        <td style={{textAlign: 'center'}}>{viewInvoice.quantity || 1}</td>
                        <td style={{textAlign: 'right'}}>₹{((viewInvoice.amount || 0) / (viewInvoice.quantity || 1)).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className={styles.summarySection}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal</span>
                      <span>₹{Math.round((viewInvoice.amount || 0) / 1.1).toLocaleString()}</span>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Tax (10%)</span>
                      <span>₹{Math.round((viewInvoice.amount || 0) * 0.1 / 1.1).toLocaleString()}</span>
                    </div>
                    <div className={styles.totalRow}>
                      <span>Total due</span>
                      <span>₹{(viewInvoice.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.invoiceFooter}>
                <span className={styles.quoteIcon}>"</span>
                Please pay within 7 days of receiving this invoice.
              </div>
              <div className={styles.absoluteFooter}>
                <span>www.recehtol.inc</span>
                <span>+91 00000 00000</span>
                <span>hello@email.com</span>
              </div>

            </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirmId(null)}>
          <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
            <p className={styles.deleteModalText}>this invoice will be deleted.</p>
            <div className={styles.deleteModalActions}>
              <button className={styles.deleteCancelBtn} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className={styles.deleteConfirmBtn} onClick={executeDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
