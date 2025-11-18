const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// JWT 검증 미들웨어
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ 
      success: false, 
      message: '토큰이 제공되지 않았습니다.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: '유효하지 않은 토큰입니다.' 
    });
  }
};

// 모든 게시글 조회 (GET)
router.get('/', async (req, res) => {
  try {
    const [posts] = await db.query(
      'SELECT * FROM posts ORDER BY created_at DESC'
    );
    res.json({ success: true, posts });
  } catch (error) {
    console.error('게시글 조회 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '게시글을 불러오는데 실패했습니다.' 
    });
  }
});

// 특정 게시글 조회 (GET)
router.get('/:id', async (req, res) => {
  try {
    const [posts] = await db.query(
      'SELECT * FROM posts WHERE id = ?',
      [req.params.id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    res.json({ success: true, post: posts[0] });
  } catch (error) {
    console.error('게시글 조회 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '게시글을 불러오는데 실패했습니다.' 
    });
  }
});

// 게시글 작성 (POST) - 로그인 필요
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: '제목과 내용을 모두 입력해주세요.' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO posts (title, content, user_id, username) VALUES (?, ?, ?, ?)',
      [title, content, req.user.userId, req.user.username]
    );

    res.status(201).json({ 
      success: true, 
      message: '게시글이 작성되었습니다.',
      postId: result.insertId 
    });

  } catch (error) {
    console.error('게시글 작성 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '게시글 작성에 실패했습니다.' 
    });
  }
});

// 게시글 수정 (PUT) - 작성자만 가능
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const postId = req.params.id;

    // 게시글 존재 및 작성자 확인
    const [posts] = await db.query(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    if (posts[0].user_id !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: '본인이 작성한 게시글만 수정할 수 있습니다.' 
      });
    }

    // 게시글 수정
    await db.query(
      'UPDATE posts SET title = ?, content = ? WHERE id = ?',
      [title, content, postId]
    );

    res.json({ 
      success: true, 
      message: '게시글이 수정되었습니다.' 
    });

  } catch (error) {
    console.error('게시글 수정 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '게시글 수정에 실패했습니다.' 
    });
  }
});

// 게시글 삭제 (DELETE) - 작성자만 가능
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;

    // 게시글 존재 및 작성자 확인
    const [posts] = await db.query(
      'SELECT * FROM posts WHERE id = ?',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '게시글을 찾을 수 없습니다.' 
      });
    }

    if (posts[0].user_id !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: '본인이 작성한 게시글만 삭제할 수 있습니다.' 
      });
    }

    // 게시글 삭제
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({ 
      success: true, 
      message: '게시글이 삭제되었습니다.' 
    });

  } catch (error) {
    console.error('게시글 삭제 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '게시글 삭제에 실패했습니다.' 
    });
  }
});

module.exports = router;