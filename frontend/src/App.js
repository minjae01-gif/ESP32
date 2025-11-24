import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// 페이지 import
import Login from './pages/Login';
import Register from './pages/Register';
import DashBoard from './pages/DashBoard';
import Community from './pages/Community';
import WritePost from './pages/WritePost';
import PostDetail from './pages/PostDetail';
import Marketplace from './pages/Marketplace';
import WriteMarketplace from './pages/WriteMarketplace';
import EditMarketplace from './pages/EditMarketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import MyPage from './pages/MyPage';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 기본 경로 */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* 인증 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signup" element={<Register />} />
          
          {/* 대시보드 */}
          <Route path="/dashboard" element={<DashBoard />} />
          
          {/* 커뮤니티 */}
          <Route path="/community" element={<Community />} />
          <Route path="/community/write" element={<WritePost />} />
          <Route path="/community/:id" element={<PostDetail />} />
          
          {/* 거래 */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/write" element={<WriteMarketplace />} />
          <Route path="/marketplace/edit/:id" element={<EditMarketplace />} />
          <Route path="/marketplace/:id" element={<MarketplaceDetail />} />

          {/* 마이페이지 */}
          <Route
            path="/mypage"
            element={
              <PrivateRoute>
                <MyPage />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
