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

// 특정 게시글의 댓글 조회 (GET)
router.get('/post/:postId', async (req, res) => {
  try {
    const [comments] = await db.query(
      'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC',
      [req.params.postId]
    );
    res.json({ success: true, comments });
  } catch (error) {
    console.error('댓글 조회 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '댓글을 불러오는데 실패했습니다.' 
    });
  }
});

// 특정 거래글의 댓글 조회 (GET)
router.get('/item/:itemId', async (req, res) => {
  try {
    const [comments] = await db.query(
      'SELECT * FROM comments WHERE item_id = ? ORDER BY created_at ASC',
      [req.params.itemId]
    );
    res.json({ success: true, comments });
  } catch (error) {
    console.error('댓글 조회 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '댓글을 불러오는데 실패했습니다.' 
    });
  }
});

// 댓글 작성 (POST) - 로그인 필요
router.post('/', verifyToken, async (req, res) => {
  try {
    const { content, post_id, item_id, parent_id } = req.body;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: '댓글 내용을 입력해주세요.' 
      });
    }

    if (!post_id && !item_id) {
      return res.status(400).json({ 
        success: false, 
        message: '게시글 정보가 필요합니다.' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO comments (content, user_id, username, post_id, item_id, parent_id) VALUES (?, ?, ?, ?, ?, ?)',
      [content, req.user.userId, req.user.username, post_id || null, item_id || null, parent_id || null]
    );

    res.status(201).json({ 
      success: true, 
      message: '댓글이 작성되었습니다.',
      commentId: result.insertId 
    });

  } catch (error) {
    console.error('댓글 작성 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '댓글 작성에 실패했습니다.' 
    });
  }
});

// 댓글 수정 (PUT) - 작성자만 가능
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: '댓글 내용을 입력해주세요.' 
      });
    }

    const [comments] = await db.query(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '댓글을 찾을 수 없습니다.' 
      });
    }

    if (comments[0].user_id !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: '본인이 작성한 댓글만 수정할 수 있습니다.' 
      });
    }

    await db.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, commentId]
    );

    res.json({ 
      success: true, 
      message: '댓글이 수정되었습니다.' 
    });

  } catch (error) {
    console.error('댓글 수정 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '댓글 수정에 실패했습니다.' 
    });
  }
});

// 댓글 삭제 (DELETE) - 작성자만 가능
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const commentId = req.params.id;

    const [comments] = await db.query(
      'SELECT * FROM comments WHERE id = ?',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '댓글을 찾을 수 없습니다.' 
      });
    }

    if (comments[0].user_id !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        message: '본인이 작성한 댓글만 삭제할 수 있습니다.' 
      });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({ 
      success: true, 
      message: '댓글이 삭제되었습니다.' 
    });

  } catch (error) {
    console.error('댓글 삭제 에러:', error);
    res.status(500).json({ 
      success: false, 
      message: '댓글 삭제에 실패했습니다.' 
    });
  }
});

module.exports = router;