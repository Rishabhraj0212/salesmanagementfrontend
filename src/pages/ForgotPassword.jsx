import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import illustration from '../assets/Women Web Developer with laptop.png';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setSuccess(data.message);
      // Store email for next step and navigate to OTP verification
      localStorage.setItem('resetEmail', email);
      setTimeout(() => navigate('/verify-otp'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <h1>Cuvtee</h1>
        <p className={styles.subtitle}>Please enter your registered email ID to receive an OTP</p>

        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>E-mail</label>
            <input type="email" placeholder="Enter your registered email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Sending...' : 'Send Mail'}
          </button>
        </form>

        <p className={styles.switchText}>
          Remember your password?<Link to="/">Log in</Link>
        </p>
      </div>
      <div className={styles.authRight}>
        <img src={illustration} alt="Check Email Illustration" className={styles.authIllustration} />
      </div>
    </div>
  );
};

export default ForgotPassword;
