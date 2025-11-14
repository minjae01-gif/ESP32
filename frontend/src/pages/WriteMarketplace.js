import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceAPI } from '../services/api';
import Layout from '../components/Layout';

function WriteMarketplace() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      // 이미지 파일 체크
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setImage(file);
      setError('');

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !price) {
      setError('제목, 내용, 가격을 모두 입력해주세요.');
      return;
    }

    if (price <= 0) {
      setError('가격은 0원보다 커야 합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // FormData 생성 (이미지 업로드용)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('price', price);
      if (image) {
        formData.append('image', image);
      }

      await marketplaceAPI.createItem(formData);
      navigate('/marketplace');
    } catch (error) {
      setError(error.response?.data?.message || '거래글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h2 style={styles.pageTitle}>🛒 거래글 작성</h2>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* 이미지 업로드 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>상품 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={styles.fileInput}
            />
            {previewUrl && (
              <div style={styles.previewContainer}>
                <img 
                  src={previewUrl} 
                  alt="미리보기" 
                  style={styles.preview}
                />
              </div>
            )}
            <p style={styles.hint}>* 최대 5MB, 이미지 파일만 가능</p>
          </div>

          {/* 제목 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="상품 제목을 입력하세요"
              style={styles.input}
            />
          </div>

          {/* 가격 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>가격 (원)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="가격을 입력하세요"
              style={styles.input}
              min="0"
            />
          </div>

          {/* 내용 */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>상품 설명</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상품에 대한 설명을 입력하세요"
              style={styles.textarea}
              rows="10"
            />
          </div>

          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={() => navigate('/marketplace')}
              style={styles.cancelBtn}
            >
              취소
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? '작성 중...' : '작성 완료'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  pageTitle: {
    marginTop: 0,
    marginBottom: '30px',
    color: '#333',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '8px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  textarea: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  fileInput: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  hint: {
    margin: '5px 0 0 0',
    fontSize: '14px',
    color: '#999',
  },
  previewContainer: {
    marginTop: '15px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '12px 24px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default WriteMarketplace;