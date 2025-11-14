import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceAPI } from '../services/api';
import Layout from '../components/Layout';

function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await marketplaceAPI.getItems();
      setItems(response.data.items);
    } catch (error) {
      console.error('거래글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>로딩 중...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>🛒 식물 거래</h2>
          <button 
            style={styles.writeBtn}
            onClick={() => navigate('/marketplace/write')}
          >
            ✏️ 거래글 작성
          </button>
        </div>

        {items.length === 0 ? (
          <div style={styles.empty}>
            <p>아직 등록된 거래글이 없습니다.</p>
            <p>첫 번째 거래글을 작성해보세요!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {items.map((item) => (
              <div 
                key={item.id} 
                style={styles.card}
                onClick={() => navigate(`/marketplace/${item.id}`)}
              >
                {/* 이미지 */}
                <div style={styles.imageContainer}>
                  {item.image_url ? (
                    <img 
                      src={`http://localhost:5000${item.image_url}`}
                      alt={item.title}
                      style={styles.image}
                    />
                  ) : (
                    <div style={styles.noImage}>
                      🌱
                    </div>
                  )}
                  
                  {/* 판매 상태 뱃지 */}
                  {item.status === 'sold' && (
                    <div style={styles.soldBadge}>판매완료</div>
                  )}
                </div>

                {/* 정보 */}
                <div style={styles.info}>
                  <h3 style={styles.itemTitle}>{item.title}</h3>
                  <p style={styles.price}>{formatPrice(item.price)}</p>
                  <p style={styles.author}>👤 {item.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  writeBtn: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    padding: '50px',
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#666',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '250px',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '80px',
    color: '#ddd',
  },
  soldBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  info: {
    padding: '15px',
  },
  itemTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  price: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  author: {
    margin: 0,
    fontSize: '14px',
    color: '#999',
  },
};

export default Marketplace;