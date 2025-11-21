import React from 'react';
import { Button, Card } from 'antd';
import Layout from '../components/Layout';

function Home() {
  return (
    <Layout>
      <div style={{ padding: '40px' }}>
        <h1>🏠 홈페이지</h1>
        
        {/* 테스트용 Ant Design 컴포넌트 */}
        <Card 
          title="Ant Design 테스트" 
          style={{ width: 300, marginTop: 20 }}
        >
          <Button type="primary">테스트 버튼</Button>
        </Card>
        
        <p style={{ marginTop: '20px' }}>
          식물 커뮤니티에 오신 것을 환영합니다! 🌿
        </p>
      </div>
    </Layout>
  );
}

const styles = {
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    marginBottom: '30px',
    color: '#333',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
};

export default Home;