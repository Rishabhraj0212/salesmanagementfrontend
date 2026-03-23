import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import illustration from '../assets/login_illustration.png';
import styles from './Auth.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <h1>Log in to your Account</h1>
        <p className={styles.subtitle}>Welcome back! Select a method to log in:</p>
        
        {error && <div className={styles.errorMsg}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
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
          <div className={styles.forgotLink}>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className={styles.switchText}>
          Don't have an account?<Link to="/signup">Sign up</Link>
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

export default Login;
