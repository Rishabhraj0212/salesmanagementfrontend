import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import illustration from '../assets/reset_password_illustration.png';
import styles from './Auth.module.css';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post('/auth/reset-password', { token, password, confirmPassword });
      setSuccess(data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authLeft}>
        <h1>Reset Password</h1>
        <p className={styles.subtitle}>Enter your new password below</p>

        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>New Password</label>
            <div className={styles.passwordWrapper}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Confirm New Password</label>
            <div className={styles.passwordWrapper}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className={styles.switchText}>
          <Link to="/">Back to Login</Link>
        </p>
      </div>
      <div className={styles.authRight}>
        <img src={illustration} alt="Secure Reset Illustration" className={styles.authIllustration} />
        <h2>Secure Reset</h2>
        <p>Create a strong password to protect your account.</p>
      </div>
    </div>
  );
};

export default ResetPassword;
