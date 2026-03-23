import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import styles from './Settings.module.css';

const Settings = () => {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get('/settings/profile');
        setForm({ firstName: data.firstName, lastName: data.lastName || '', email: data.email, password: '', confirmPassword: '' });
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = { firstName: form.firstName, lastName: form.lastName };
      if (form.password) payload.password = form.password;
      const { data } = await API.put('/settings/profile', payload);
      updateUser(data.user);
      setSuccess('Profile updated successfully!');
      setForm(f => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsCard}>
        <div className={styles.headerContainer}>
          <h2>Edit Profile</h2>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}
        {success && <div className={styles.successMsg}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>First name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Last name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input name="email" value={form.email} disabled />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} minLength={6} autoComplete="new-password" />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} minLength={6} autoComplete="new-password" />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
