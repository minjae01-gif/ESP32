const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const marketplaceRoutes = require('./routes/marketplace');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors()); // React와 통신 허용
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (이미지 접근용)
app.use('/uploads', express.static('uploads'));

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/comments', commentRoutes);

// 기본 라우트 (서버 작동 테스트용)
app.get('/', (req, res) => {
  res.json({ message: '🌱 Plant Community API Server' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`http://localhost:${PORT}`);
});