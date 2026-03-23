import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import illustration from '../assets/signup_illustration.png';
import styles from './Auth.module.css';

const Signup = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/signup', form);
      setSuccess(data.message);
      // Wait 3 seconds before redirecting to login
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <h1>Create an Account</h1>
        <p className={styles.subtitle}>Create an account to continue</p>

        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input type="text" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Create Password</label>
            <div className={styles.passwordWrapper}>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required minLength={6} />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B8D97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B8D97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <div className={styles.passwordWrapper}>
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required minLength={6} />
            </div>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating...' : 'Sign up'}
          </button>
        </form>
        <p className={styles.switchText}>
          Already have an account?<Link to="/">Log in</Link>
        </p>
      </div>
      <div className={styles.authRight}>
        <img src={illustration} alt="Inventory Illustration" className={styles.authIllustration} />
        <h2>Welcome to</h2>
        <h2 style={{color: '#5570F1', marginTop: '-8px'}}>Inventory Management</h2>
        <p>Manage your inventory, track sales, and grow your business with confidence.</p>
      </div>
    </div>
  );
};

export default Signup;
