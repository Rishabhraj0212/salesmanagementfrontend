import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../services/api';
import styles from './Dashboard.module.css';

import salesIcon from '../assets/Sales.png';
import revenueIcon from '../assets/Revenue.png';
import profitIcon from '../assets/Profit.png';
import costIcon from '../assets/Cost.png';

import purchaseIcon from '../assets/Purchase.png';
import purchaseCostIcon from '../assets/Cost (1).png';
import cancelIcon from '../assets/Cancel.png';
import returnIcon from '../assets/Profit (1).png'; 

import quantityIcon from '../assets/Quantity.png';
import onTheWayIcon from '../assets/On the way.png';

import suppliersIcon from '../assets/Suppliers.png';
import categoriesIcon from '../assets/Categories.png';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/dashboard/chart')
        ]);
        setData(dashRes.data);
        setChartData(chartRes.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: '#8B8D97'}}>Loading dashboard...</div>;

  const renderStars = (sold) => {
    const rating = Math.min(5, Math.max(1, Math.round(sold / 10) || 1));
    return (
      <div className={styles.starsContainer}>
        {[1,2,3,4,5].map(i => (
          <span key={i} className={i <= rating ? styles.star : styles.starEmpty}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.dashboard}>
      {/* Sales Overview */}
      <div className={`${styles.card} ${styles.salesCard}`}>
        <h3>Sales Overview</h3>
        <div className={styles.metricsRow}>
          <div className={styles.metricItem}>
            <img src={salesIcon} alt="Sales" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>{(data?.salesOverview?.count || 0).toLocaleString()}</div>
              <div className={styles.metricLabel}>Sales</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <img src={revenueIcon} alt="Revenue" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>₹{(data?.salesOverview?.totalValue || 0).toLocaleString()}</div>
              <div className={styles.metricLabel}>Revenue</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <img src={profitIcon} alt="Profit" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>₹{Math.round((data?.salesOverview?.totalValue || 0) * 0.2).toLocaleString()}</div>
              <div className={styles.metricLabel}>Profit</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <img src={costIcon} alt="Cost" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>₹{Math.round((data?.salesOverview?.totalValue || 0) * 0.8).toLocaleString()}</div>
              <div className={styles.metricLabel}>Cost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className={`${styles.card} ${styles.inventoryCard}`}>
        <h3>Inventory Summary</h3>
        <div className={styles.metricsRow}>
          <div className={styles.metricItem}>
            <img src={quantityIcon} alt="In Stock" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>{data?.inventorySummary?.totalItems || 0}</div>
              <div className={styles.metricLabel}>In Stock</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <img src={onTheWayIcon} alt="To be received" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>{data?.inventorySummary?.lowStockCount || 0}</div>
              <div className={styles.metricLabel}>To be received</div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Overview */}
      <div className={`${styles.card} ${styles.purchaseCard}`}>
        <h3>Purchase Overview</h3>
        <div className={styles.metricsRow}>
          <div className={styles.metricItem}>
            <img src={purchaseIcon} alt="Purchase" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>{data?.purchaseOverview?.count || 0}</div>
              <div className={styles.metricLabel}>Purchase</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <img src={purchaseCostIcon} alt="Cost" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>₹{(data?.purchaseOverview?.totalValue || 0).toLocaleString()}</div>
              <div className={styles.metricLabel}>Cost</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <img src={cancelIcon} alt="Cancel" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>0</div>
              <div className={styles.metricLabel}>Cancel</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <img src={returnIcon} alt="Return" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>0</div>
              <div className={styles.metricLabel}>Return</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Summary */}
      <div className={`${styles.card} ${styles.productCard}`}>
        <h3>Product Summary</h3>
        <div className={styles.metricsRow}>
          <div className={styles.metricItem}>
            <img src={suppliersIcon} alt="Suppliers" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>1</div>
              <div className={styles.metricLabel}>Number of Suppliers</div>
            </div>
          </div>
          <div className={styles.metricItem}>
            <img src={categoriesIcon} alt="Categories" className={styles.metricIcon}/>
            <div className={styles.metricData}>
              <div className={styles.metricValue}>{data?.productSummary?.categoriesCount || 0}</div>
              <div className={styles.metricLabel}>Number of Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales & Purchase Chart */}
      <div className={`${styles.card} ${styles.chartCard}`}>
        <div className={styles.chartHeader}>
          <h3>Sales & Purchase</h3>
          <div className={styles.chartFilter}>
            📅 Weekly
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F0F1F3" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B8D97' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8B8D97' }} />
            <Tooltip 
              cursor={{ fill: '#F5F7FA' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className={styles.customTooltip}>
                      <div style={{color: '#1A1C21', fontWeight: 600, marginBottom: 4}}>{payload[0].payload.month}</div>
                      <div style={{color: '#5570F1'}}>Sales: ₹{payload[0].value.toLocaleString()}</div>
                      <div style={{color: '#0BF4C8'}}>Purchase: ₹{payload[1].value.toLocaleString()}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
            <Bar dataKey="sales" fill="#5570F1" radius={[4, 4, 0, 0]} name="Sales" barSize={12} />
            <Bar dataKey="purchases" fill="#0BF4C8" radius={[4, 4, 0, 0]} name="Purchase" barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products */}
      <div className={`${styles.card} ${styles.topProductsCard}`}>
        <h3>Top Products</h3>
        <div className={styles.topProductsList}>
          {data?.topProducts?.length > 0 ? (
            data.topProducts.map((product, idx) => (
              <div key={idx} className={styles.topProductItem}>
                <div className={styles.productName}>{product._id}</div>
                {/* Visual parity with the list layout */}
              </div>
            ))
          ) : (
            <p style={{color: '#8B8D97', fontSize: 13, padding: '20px 0'}}>No sales data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
