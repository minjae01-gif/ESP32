const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우트 import
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const marketplaceRoutes = require('./routes/marketplace');
const commentRoutes = require('./routes/comments');

// 라우트 등록 (순서 중요!)
app.use('/api/auth', authRoutes);
app.use('/api', commentRoutes);  // 댓글 라우트를 먼저!
app.use('/api/posts', postRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// DB 연결 테스트
const db = require('./config/db');
db.query('SELECT 1')
  .then(() => {
    console.log('✅ MySQL 연결 성공!');
  })
  .catch((err) => {
    console.error('❌ MySQL 연결 실패:', err);
  });

// 404 에러 핸들러 (디버깅용)
app.use((req, res, next) => {
  console.log(`❌ 404 - 라우트 없음: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `라우트를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`http://localhost:${PORT}`);
  console.log('\n📋 등록된 라우트:');
  console.log('   /api/auth/*');
  console.log('   /api/posts/:id/comments');
  console.log('   /api/marketplace/:id/comments');
  console.log('   /api/posts/*');
  console.log('   /api/marketplace/*');
});