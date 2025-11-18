import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Comments from '../components/Comments';

function MarketplaceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await marketplaceAPI.getItem(id);
      setItem(response.data.item);
    } catch (error) {
      setError('거래글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await marketplaceAPI.deleteItem(id);
      alert('거래글이 삭제되었습니다.');
      navigate('/marketplace');
    } catch (error) {
      alert(error.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('content', item.content);
      formData.append('price', item.price);
      formData.append('status', newStatus);

      await marketplaceAPI.updateItem(id, formData);
      alert(newStatus === 'sold' ? '판매완료로 변경되었습니다.' : '판매중으로 변경되었습니다.');
      fetchItem();
    } catch (error) {
      alert('상태 변경에 실패했습니다.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAuthor = item && user && (
    item.user_id === user.userId || 
    item.user_id === user.id ||
    item.username === user.username
  );

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>로딩 중...</div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div style={styles.error}>거래글을 찾을 수 없습니다.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <button 
          onClick={() => navigate('/marketplace')}
          style={styles.backBtn}
        >
          ← 목록으로
        </button>

        <div style={styles.itemContainer}>
          {/* 이미지 */}
          <div style={styles.imageSection}>
            {item.image_url ? (
              <img 
                src={`http://localhost:5000${item.image_url}`}
                alt={item.title}
                style={styles.image}
              />
            ) : (
              <div style={styles.noImage}>
                🌱<br/>이미지 없음
              </div>
            )}
          </div>

          {/* 정보 */}
          <div style={styles.infoSection}>
            <div style={styles.statusBadge}>
              {item.status === 'selling' ? '판매중' : '판매완료'}
            </div>

            <h1 style={styles.title}>{item.title}</h1>
            
            <div style={styles.price}>
              {formatPrice(item.price)}
            </div>

            <div style={styles.meta}>
              <span>👤 {item.username}</span>
              <span>🕐 {formatDate(item.created_at)}</span>
            </div>

            <div style={styles.divider} />

            <div style={styles.content}>
              <h3 style={styles.contentTitle}>상품 설명</h3>
              <p style={styles.contentText}>{item.content}</p>
            </div>

            {isAuthor && (
              <div style={styles.actionButtons}>
                <button 
                  onClick={() => navigate(`/marketplace/edit/${id}`)}
                  style={styles.editBtn}
                >
                  ✏️ 수정
                </button>
                {item.status === 'selling' ? (
                  <button 
                    onClick={() => handleStatusChange('sold')}
                    style={styles.soldBtn}
                  >
                    ✓ 판매완료
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStatusChange('selling')}
                    style={styles.sellingBtn}
                  >
                    ↻ 판매중으로 변경
                  </button>
                )}
                <button 
                  onClick={handleDelete}
                  style={styles.deleteBtn}
                >
                  🗑️ 삭제
                </button>
              </div>
            )}

            {/* 댓글 섹션 */}
            <Comments type="item" id={id} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
    color: '#f44336',
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    padding: '40px',
  },
  imageSection: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  noImage: {
    width: '100%',
    height: '400px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '60px',
    color: '#ddd',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '5px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: '15px',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '28px',
    color: '#333',
  },
  price: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: '20px',
  },
  meta: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    color: '#999',
    marginBottom: '20px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '20px 0',
  },
  content: {
    marginBottom: '30px',
  },
  contentTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  contentText: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#555',
    whiteSpace: 'pre-wrap',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: 'auto',
  },
  editBtn: {
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  soldBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  sellingBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: '12px 24px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default MarketplaceDetail;