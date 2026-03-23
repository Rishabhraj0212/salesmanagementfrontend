import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import illustration from '../assets/forgot_password_illustration.png';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      setSuccess(data.message);
      if (data.resetToken) setResetToken(data.resetToken);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <h1>Forgot Password</h1>
        <p className={styles.subtitle}>Enter your email to receive a password reset link</p>

        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Sending...' : 'Send Mail'}
          </button>
        </form>

        {resetToken && (
          <div className={styles.successMsg}>
            <strong>Dev Mode:</strong> <Link to={`/reset-password?token=${resetToken}`}>Click here to reset password</Link>
          </div>
        )}

        <p className={styles.switchText}>
          Remember your password?<Link to="/">Log in</Link>
        </p>
      </div>
      <div className={styles.authRight}>
        <img src={illustration} alt="Check Email Illustration" className={styles.authIllustration} />
        <h2>Check Your Email</h2>
        <p>We'll send you a link to reset your password.</p>
      </div>
    </div>
  );
};

export default ForgotPassword;
