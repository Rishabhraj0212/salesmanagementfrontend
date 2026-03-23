import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import styles from './Products.module.css';

const AddProduct = () => {
  const [form, setForm] = useState({
    productName: '', productId: '', category: '', price: '',
    quantity: '', unit: 'pcs', expiryDate: '', thresholdValue: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const csvRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (image) formData.append('productImage', image);
      await API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Product created successfully!');
      setTimeout(() => navigate('/products'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={styles.addProductPage}>
      <div className={styles.breadcrumb}>
        <Link to="/products">Products</Link>
        <span>›</span>
        <span>Add Product</span>
      </div>

      {error && <div style={{background:'#FFF0F0',border:'1px solid #FFD0D0',color:'#E53935',padding:'10px 14px',borderRadius:8,fontSize:13}}>{error}</div>}
      {success && <div style={{background:'#F0FFF4',border:'1px solid #C6F6D5',color:'#2F855A',padding:'10px 14px',borderRadius:8,fontSize:13}}>{success}</div>}

      <div className={styles.formCard}>
        <h3 style={{fontSize: 18, color: '#383A47', marginBottom: 24, fontWeight: 600}}>New Product</h3>
        
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32}}>
          <div className={styles.imageUploadSquare} onClick={() => fileRef.current?.click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className={styles.previewImg} />
            ) : null}
          </div>
          <div style={{fontSize:13, color:'#8B8D97', textAlign:'center'}}>
             Drag image here<br/>or <span style={{color:'#5570F1',cursor:'pointer',fontWeight:500}} onClick={() => fileRef.current?.click()}>Browse image</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageChange} />
        </div>

        <form onSubmit={handleSubmit} style={{marginTop: 40}}>
          <div className={styles.rowFormGroup}>
            <label>Product Name</label>
            <input name="productName" value={form.productName} onChange={handleChange} required placeholder="Enter product name" />
          </div>
          <div className={styles.rowFormGroup}>
            <label>Product ID</label>
            <input name="productId" value={form.productId} onChange={handleChange} required placeholder="Enter product ID" />
          </div>
          <div className={styles.rowFormGroup}>
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} required placeholder="Select product category" />
          </div>
          <div className={styles.rowFormGroup}>
            <label>Price</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="Enter price" min="0" step="0.01" />
          </div>
          <div className={styles.rowFormGroup}>
            <label>Quantity</label>
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required placeholder="Enter product quantity" min="0" />
          </div>
          <div className={styles.rowFormGroup}>
            <label>Unit</label>
            <input name="unit" value={form.unit} onChange={handleChange} required placeholder="Enter product unit" />
          </div>
          <div className={styles.rowFormGroup}>
            <label>Expiry Date</label>
            <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} placeholder="Enter expiry date" />
          </div>
          <div className={styles.rowFormGroup}>
            <label>Threshold Value</label>
            <input name="thresholdValue" type="number" value={form.thresholdValue} onChange={handleChange} required placeholder="Enter threshold value" min="0" />
          </div>
          
          <div className={styles.formActions} style={{marginTop: 64}}>
            <button type="button" className={styles.discardPlainBtn} onClick={() => navigate('/products')}>Discard</button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
