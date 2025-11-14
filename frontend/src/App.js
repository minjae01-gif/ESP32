import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Community from './pages/Community';
import WritePost from './pages/WritePost';
import PostDetail from './pages/PostDetail';
import Marketplace from './pages/Marketplace';
import WriteMarketplace from './pages/WriteMarketplace';
import EditMarketplace from './pages/EditMarketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/community" 
            element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/community/write" 
            element={
              <PrivateRoute>
                <WritePost />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/community/:id" 
            element={
              <PrivateRoute>
                <PostDetail />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/marketplace" 
            element={
              <PrivateRoute>
                <Marketplace />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/marketplace/write" 
            element={
              <PrivateRoute>
                <WriteMarketplace />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/marketplace/edit/:id" 
            element={
              <PrivateRoute>
                <EditMarketplace />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/marketplace/:id" 
            element={
              <PrivateRoute>
                <MarketplaceDetail />
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