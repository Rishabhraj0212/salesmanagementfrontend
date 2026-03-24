import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import illustration from '../assets/Startup.png';
import styles from './Auth.module.css';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Assuming there's an endpoint for OTP verification
      await API.post('/auth/verify-otp', { otp });
      navigate('/reset-password'); // Or wherever appropriate
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <h1>Enter Your OTP</h1>
        <p className={styles.subtitle}>
          We've sent a 6-digit OTP to your registered mail.
          <br />
          Please enter it below to sign in.
        </p>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>OTP</label>
            <input
              type="text"
              placeholder="xxxxx05"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Verifying...' : 'Confirm'}
          </button>
        </form>

        <p className={styles.switchText}>
          Didn't receive code? <Link to="/forgot-password">Resend</Link>
        </p>
      </div>
      <div className={styles.authRight}>
        <img src={illustration} alt="Startup Illustration" className={styles.authIllustration} />
      </div>
    </div>
  );
};

export default OTPVerification;
