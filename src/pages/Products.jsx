import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import styles from './Products.module.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [buyModal, setBuyModal] = useState(null);
  const [buyQty, setBuyQty] = useState(1);
  const [buyName, setBuyName] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const csvRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products?page=${page}&limit=10&search=${search}`);
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => { setPage(1); }, [search]);
  
  useEffect(() => {
    API.get('/dashboard').then(res => setDashboardData(res.data)).catch(e => console.error(e));
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'In Stock': return styles.statusInStock;
      case 'Low Stock': return styles.statusLowStock;
      case 'Out of Stock': return styles.statusOutOfStock;
      default: return '';
    }
  };

  const handleBuy = async () => {
    if (!buyModal || buyQty < 1) return;
    setBuyLoading(true);
    try {
      await API.post(`/products/${buyModal._id}/buy`, { quantity: buyQty, customerName: buyName || 'Walk-in Customer' });
      setBuyModal(null);
      setBuyQty(1);
      setBuyName('');
      fetchProducts();
      API.get('/dashboard').then(res => setDashboardData(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Purchase failed');
    } finally {
      setBuyLoading(false);
    }
  };
  
  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setCsvLoading(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      const { data } = await API.post('/products/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert(`${data.added} products added successfully!`);
      setCsvFile(null);
      setShowCsvModal(false);
      fetchProducts();
      API.get('/dashboard').then(res => setDashboardData(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'CSV upload failed');
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className={styles.productsPage}>
      {/* Overall Inventory Top Section */}
      <div className={styles.inventorySection}>
        <h3 className={styles.inventoryTitle}>Overall Inventory</h3>
        <div className={styles.inventoryGrid}>
          <div className={styles.invCard}>
             <div className={styles.invHeader}>Categories</div>
             <div className={styles.invContent}>
                <div className={styles.invCol}>
                  <div className={styles.invVal} style={{color:'#5570F1'}}>{dashboardData?.productSummary?.categoriesCount || 0}</div>
                  <div className={styles.invSub}>Last 7 days</div>
                </div>
             </div>
          </div>
          
          <div className={styles.invCard}>
             <div className={styles.invHeader}>Total Products</div>
             <div className={styles.invContent}>
                <div className={styles.invCol}>
                  <div className={styles.invVal} style={{color:'#E5A029'}}>{dashboardData?.productSummary?.totalProducts || 0}</div>
                  <div className={styles.invSub}>Last 7 days</div>
                </div>
                <div className={styles.invCol}>
                  <div className={styles.invVal} style={{color:'#E5A029'}}>₹{(dashboardData?.salesOverview?.totalValue || 0).toLocaleString()}</div>
                  <div className={styles.invSub}>Revenue</div>
                </div>
             </div>
          </div>
          
          <div className={styles.invCard}>
             <div className={styles.invHeader}>Top Selling</div>
             <div className={styles.invContent}>
                <div className={styles.invCol}>
                  <div className={styles.invVal} style={{color:'#8B8D97'}}>{dashboardData?.topProducts?.length || 0}</div>
                  <div className={styles.invSub}>Last 7 days</div>
                </div>
                <div className={styles.invCol}>
                  <div className={styles.invVal} style={{color:'#8B8D97'}}>₹{(dashboardData?.topProducts?.[0]?.totalAmount || 0).toLocaleString()}</div>
                  <div className={styles.invSub}>Cost</div>
                </div>
             </div>
          </div>
          
          <div className={styles.invCard} style={{borderRight: 'none'}}>
             <div className={styles.invHeader}>Low Stocks</div>
             <div className={styles.invContent}>
                <div className={styles.invCol}>
                  <div className={styles.invVal} style={{color:'#E65100'}}>{dashboardData?.inventorySummary?.lowStockCount || 0}</div>
                  <div className={styles.invSub}>Ordered</div>
                </div>
                <div className={styles.invCol}>
                  <div className={styles.invVal} style={{color:'#C62828'}}>{dashboardData?.inventorySummary?.outOfStockCount || 0}</div>
                  <div className={styles.invSub}>Not in stock</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderSection}>
          <h3 className={styles.tableTitle}>Products</h3>
          <div className={styles.tableHeaderRight}>
            <button className={styles.addBtn} onClick={() => setShowAddMenu(true)}>
              Add Product
            </button>
            <div className={styles.searchFilterGroup}>
               {/* Filters can go here if needed in future */}
            </div>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Products</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Threshold Value</th>
              <th>Expiry Date</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{textAlign:'center', padding: 40, color:'#8B8D97'}}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} style={{textAlign:'center', padding: 40, color:'#8B8D97'}}>No products found</td></tr>
            ) : (
              products.map(product => (
                <tr key={product._id} onClick={() => setBuyModal(product)}>
                  <td style={{color: '#1A1C21', fontWeight: 500}}>{product.productName}</td>
                  <td style={{color: '#8B8D97'}}>₹{product.price.toLocaleString()}</td>
                  <td style={{color: '#8B8D97'}}>{product.quantity} {product.unit}</td>
                  <td style={{color: '#8B8D97'}}>{product.thresholdValue}</td>
                  <td style={{color: '#8B8D97'}}>{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('en-GB', {day:'2-digit',month:'2-digit',year:'2-digit'}) : '—'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(product.status)}`}>
                      {product.status === 'In Stock' ? 'In- stock' : product.status === 'Out of Stock' ? 'Out of stock' : 'Low stock'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.buyBtnSmall} 
                      onClick={(e) => { e.stopPropagation(); setBuyModal(product); }}
                    >
                      Buy
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtnWord} onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</button>
            <span className={styles.pageText}>Page {page} of {totalPages}</span>
            <button className={styles.pageBtnWord} onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</button>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {buyModal && (
        <div className={styles.modalOverlay} onClick={() => setBuyModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Purchase: {buyModal.productName}</h3>
            <p>Available: {buyModal.quantity} {buyModal.unit} · ₹{buyModal.price} each</p>
            <div className={styles.modalFormGroup}>
              <label>Quantity</label>
              <input type="number" min={1} max={buyModal.quantity} value={buyQty} onChange={(e) => setBuyQty(parseInt(e.target.value) || 1)} />
            </div>
            <div className={styles.modalFormGroup}>
              <label>Customer Name (optional)</label>
              <input type="text" placeholder="Walk-in Customer" value={buyName} onChange={(e) => setBuyName(e.target.value)} />
            </div>
            <p style={{fontWeight: 700, color: '#1A1C21', fontSize: 15}}>Total: ₹{(buyModal.price * buyQty).toLocaleString()}</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setBuyModal(null)}>Cancel</button>
              <button className={styles.buyBtn} onClick={handleBuy} disabled={buyLoading || buyQty < 1}>
                {buyLoading ? 'Processing...' : 'Buy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Choice Modal */}
      {showAddMenu && (
        <div className={styles.modalOverlay} onClick={() => setShowAddMenu(false)}>
          <div className={styles.choiceModal} onClick={e => e.stopPropagation()}>
            <button className={styles.choiceBtn} onClick={() => navigate('/products/add')}>individual product</button>
            <button className={styles.choiceBtn} onClick={() => { setShowAddMenu(false); setShowCsvModal(true); }}>Multiple product</button>
          </div>
        </div>
      )}

      {/* CSV Upload Overlay Modal */}
      {showCsvModal && (
        <div className={styles.csvModalOverlay} onClick={() => setShowCsvModal(false)}>
          <div className={styles.csvModalCard} onClick={e => e.stopPropagation()}>
             <div className={styles.csvModalHeader}>
               <h3>CSV Upload</h3>
               <button className={styles.closeX} onClick={() => setShowCsvModal(false)}>×</button>
             </div>
             <p className={styles.csvSubtext}>Add your documents here</p>
             <div className={styles.csvDragArea} onClick={() => csvRef.current?.click()}>
               <div className={styles.csvUploadIcon}>📁</div>
               <p className={styles.csvDragText}>Drag your file(s) to start uploading</p>
               <div className={styles.csvOrLine}><span>OR</span></div>
               <button className={styles.browseFileBtn} onClick={(e) => { e.stopPropagation(); csvRef.current?.click(); }}>Browse files</button>
             </div>
             {csvFile && <p style={{marginTop: 12, textAlign:'center', color:'#5570F1', fontWeight:500}}>{csvFile.name}</p>}
             <input ref={csvRef} type="file" accept=".csv" style={{display:'none'}} onChange={(e) => setCsvFile(e.target.files[0])} />
             <div className={styles.csvModalFooter}>
                <button className={styles.csvCancelBtn} onClick={() => setShowCsvModal(false)}>Cancel</button>
                <button className={styles.csvNextBtn} onClick={handleCsvUpload} disabled={!csvFile || csvLoading}>
                  {csvLoading ? 'Uploading...' : 'Next >'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
