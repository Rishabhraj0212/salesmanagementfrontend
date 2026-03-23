import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const pageTitles = {
  '/dashboard': 'Home',
  '/products': 'Products',
  '/products/add': 'Add Product',
  '/invoices': 'Invoices',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
};

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getTitle = () => {
    return pageTitles[location.pathname] || 'Dashboard';
  };

  const showSearch = location.pathname === '/products' || location.pathname === '/invoices';
  const searchTerm = searchParams.get('search') || '';

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) {
      searchParams.set('search', val);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const getInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase();
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>{getTitle()}</h1>
          {showSearch && (
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="11" cy="11" r="8"></circle>
                   <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder={`Search ${location.pathname.replace('/', '')}...`} 
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput} 
              />
            </div>
          )}
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
