import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../services/api';
import styles from './Statistics.module.css';

const CARD_CONFIGS = {
  revenue: { label: 'Total Revenue', className: styles.cardRevenue, prefix: '₹', key: 'totalRevenue', icon: '₹', subtitle: 'Overall' },
  sold: { label: 'Products Sold', className: styles.cardSold, prefix: '', key: 'productsSold', icon: '◰', subtitle: 'Overall' },
  inStock: { label: 'Products In Stock', className: styles.cardStock, prefix: '', key: 'productsInStock', icon: '⌁', subtitle: 'Overall' },
};

const Statistics = () => {
  const [statsData, setStatsData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [cardOrder, setCardOrder] = useState(['revenue', 'sold', 'inStock']);
  const [loading, setLoading] = useState(true);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes, dashRes, profileRes] = await Promise.all([
          API.get('/dashboard/stats'),
          API.get('/dashboard/chart'),
          API.get('/dashboard'),
          API.get('/settings/profile').catch(() => null)
        ]);
        setStatsData(statsRes.data);
        
        const fetchedProducts = dashRes.data.topProducts || [];
        setTopProducts(fetchedProducts.map(p => ({
            name: p._id,
            rating: Math.min(5, Math.max(1, Math.round(p.totalSold / 10) || 1))
        })));
        
        setChartData(chartRes.data);

        // Load saved layout
        if (profileRes && profileRes.data && profileRes.data.cardLayout?.length === 3) {
          setCardOrder(profileRes.data.cardLayout);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };
  const handleDrop = async (idx) => {
    if (dragIdx === null || dragIdx === idx) return;
    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(dragIdx, 1);
    newOrder.splice(idx, 0, removed);
    setCardOrder(newOrder);
    setDragIdx(null);
    setDragOverIdx(null);
    // Persist layout
    try { await API.put('/settings/layout', { cardLayout: newOrder }); } catch (e) {}
  };

  const renderStars = (rating) => {
    return (
      <div className={styles.starsContainer}>
        {[1,2,3,4,5].map(i => <div key={i} className={i <= rating ? styles.star : styles.starEmpty}></div>)}
      </div>
    );
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#8B8D97'}}>Loading statistics...</div>;

  return (
    <div className={styles.statsPage}>
      <div className={styles.topCards}>
        {cardOrder.map((cardKey, idx) => {
          const config = CARD_CONFIGS[cardKey];
          if (!config) return null;
          return (
            <div
              key={cardKey}
              className={`${styles.topCard} ${config.className} ${dragIdx === idx ? styles.dragging : ''} ${dragOverIdx === idx ? styles.dragOver : ''}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              onDrop={() => handleDrop(idx)}
            >
              <div className={styles.cardHeader}>
                <h4>{config.label}</h4>
                <div className={styles.cardIcon}>{config.icon}</div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.bigValue}>
                  {config.prefix}{(statsData[config.key] || 0).toLocaleString()}
                </div>
                <div className={styles.subtitle}>{config.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard} style={{paddingRight: '48px'}}>
          <div className={styles.chartHeader}>
            <h3>Sales & Purchase</h3>
            <div className={styles.weeklyDropdown}>
              <span>📅</span> Weekly
            </div>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E2E7" />
              <XAxis dataKey="month" tick={{fontSize:12,fill:'#8B8D97'}} axisLine={false} tickLine={false} tickMargin={16} />
              <YAxis tick={{fontSize:12,fill:'#8B8D97'}} axisLine={false} tickLine={false} tickMargin={16} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '24px'}} />
              <Bar dataKey="purchases" fill="#6EB5FF" radius={[4,4,4,4]} barSize={8} name="Purchase" />
              <Bar dataKey="sales" fill="#4CAF50" radius={[4,4,4,4]} barSize={8} name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className={styles.chartCard}>
          <h3 style={{fontSize: 14, fontWeight: 700, marginBottom: 24}}>Top Products</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={idx} className={styles.topProductItem} style={{padding: 0}}>
                <div className={styles.productInfo}>
                  <div>
                    <div className={styles.productName}>{product.name}</div>
                    {renderStars(product.rating)}
                  </div>
                </div>
              </div>
            )) : <p style={{color:'#8B8D97',fontSize:13}}>No top products available yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
