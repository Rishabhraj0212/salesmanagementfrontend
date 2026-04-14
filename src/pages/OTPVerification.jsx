import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import illustration from '../assets/Startup.png';
import styles from './Auth.module.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from localStorage (set by ForgotPassword page)
    const storedEmail = localStorage.getItem('resetEmail');
    if (!storedEmail) {
      navigate('/forgot-password');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }
      // Store OTP and email for reset-password page
      // Backend will verify OTP during password reset
      localStorage.setItem('resetOTP', otp);
      navigate('/reset-password');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <h1>Enter Your OTP</h1>
        <p className={styles.subtitle}>
          We've sent a 6-digit OTP to <strong>{email}</strong>
          <br />
          Please enter it below to proceed with password reset.
        </p>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>OTP</label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className={styles.switchText}>
          Didn't receive code? <button onClick={handleResend} style={{ background: 'none', border: 'none', color: '#5570F1', cursor: 'pointer', fontWeight: 600 }} disabled={loading}>Resend</button>
        </p>
      </div>
      <div className={styles.authRight}>
        <img src={illustration} alt="Startup Illustration" className={styles.authIllustration} />
      </div>
    </div>
  );
};

export default OTPVerification;
