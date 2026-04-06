// routes/chat.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const { verifyToken } = require('./auth'); // 인증 미들웨어

// 채팅방 생성 또는 기존 방 가져오기
router.post('/rooms', verifyToken, async (req, res) => {
  try {
    const { itemId, sellerId } = req.body;
    const buyerId = req.user.userId; // 토큰에서 가져온 구매자 ID

    // 1. 본인이 본인에게 채팅하는 것 방지
    if (buyerId === parseInt(sellerId)) {
      return res.status(400).json({ success: false, message: '자신의 상품에는 채팅할 수 없습니다.' });
    }

    // 2. 이미 존재하는 채팅방인지 확인
    const [existingRoom] = await db.query(
      'SELECT id FROM chat_rooms WHERE item_id = ? AND buyer_id = ? AND seller_id = ?',
      [itemId, buyerId, sellerId]
    );

    if (existingRoom.length > 0) {
      // 이미 방이 있다면 해당 방 ID 반환
      return res.json({ success: true, roomId: existingRoom[0].id });
    }

    // 3. 없다면 새로운 채팅방 생성
    const [result] = await db.query(
      'INSERT INTO chat_rooms (item_id, buyer_id, seller_id) VALUES (?, ?, ?)',
      [itemId, buyerId, sellerId]
    );

    res.json({ success: true, roomId: result.insertId });
  } catch (error) {
    console.error('채팅방 생성 에러:', error);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// [GET] 내 채팅방 목록 가져오기
router.get('/rooms', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // 내가 구매자이거나 판매자인 모든 방을 가져옴
    const [rooms] = await db.query(`
      SELECT cr.*, m.title as item_title, u.username as opponent_name
      FROM chat_rooms cr
      JOIN marketplace m ON cr.item_id = m.id
      JOIN users u ON (CASE WHEN cr.buyer_id = ? THEN cr.seller_id = u.id ELSE cr.buyer_id = u.id END)
      WHERE cr.buyer_id = ? OR cr.seller_id = ?
      ORDER BY cr.created_at DESC
    `, [userId, userId, userId]);

    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: '목록 조회 실패' });
  }
});

// [GET] 특정 채팅방의 메시지 내역 가져오기
router.get('/rooms/:roomId/messages', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.userId;

    // 1. 해당 방의 참여자인지 확인 (보안)
    const [room] = await db.query(
      'SELECT * FROM chat_rooms WHERE id = ? AND (buyer_id = ? OR seller_id = ?)',
      [roomId, userId, userId]
    );

    if (room.length === 0) {
      return res.status(403).json({ success: false, message: '접근 권한이 없습니다.' });
    }

    // 2. 메시지 내역 가져오기
    const [messages] = await db.query(`
      SELECT cm.*, u.username 
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.room_id = ?
      ORDER BY cm.created_at ASC
    `, [roomId]);

    res.json({ success: true, messages });
  } catch (error) {
    console.error('메시지 로드 에러:', error);
    res.status(500).json({ success: false, message: '메시지를 불러오지 못했습니다.' });
  }
});

// [DELETE] 특정 채팅방 삭제
router.delete('/rooms/:roomId', verifyToken, async (req, res) => {
  const { roomId } = req.params;

  console.log("삭제 요청 유저 정보:", req.user);

  const userId = req.user.id || req.user.userId; ;

  try {
    // 해당 방의 참여자인지 확인
    const [room] = await db.query(
      'SELECT id FROM chat_rooms WHERE id = ? AND (buyer_id = ? OR seller_id = ?)',
      [roomId, userId, userId]
    );

    if (room.length === 0) {
      return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
    }

    // 메시지 삭제 (외래키 제약 조건이 없다면 수동 삭제)
    await db.query('DELETE FROM chat_messages WHERE room_id = ?', [roomId]);

    // 채팅방 삭제
    await db.query('DELETE FROM chat_rooms WHERE id = ?', [roomId]);

    res.json({ success: true, message: '채팅방이 삭제되었습니다.' });
  } catch (error) {
    console.error('채팅방 삭제 에러:', error);
    res.status(500).json({ success: false, message: '채팅방 삭제에 실패했습니다.' });
  }
});
module.exports = router;