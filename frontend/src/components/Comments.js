import React, { useState, useEffect } from 'react';
import { commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Comments({ type, id }) {
  // type: 'post' 또는 'item'
  // id: post_id 또는 item_id
  
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [type, id]);

  const fetchComments = async () => {
    try {
      const response = type === 'post' 
        ? await commentAPI.getPostComments(id)
        : await commentAPI.getItemComments(id);
      setComments(response.data.comments);
    } catch (error) {
      console.error('댓글 불러오기 실패:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const data = {
        content: newComment,
        [type === 'post' ? 'post_id' : 'item_id']: id,
      };
      
      await commentAPI.createComment(data);
      setNewComment('');
      fetchComments();
    } catch (error) {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setLoading(true);
    try {
      const data = {
        content: replyContent,
        [type === 'post' ? 'post_id' : 'item_id']: id,
        parent_id: parentId,
      };
      
      await commentAPI.createComment(data);
      setReplyContent('');
      setReplyTo(null);
      fetchComments();
    } catch (error) {
      alert('대댓글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await commentAPI.updateComment(commentId, editContent);
      setEditingId(null);
      setEditContent('');
      fetchComments();
    } catch (error) {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await commentAPI.deleteComment(commentId);
      fetchComments();
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.');
    }
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

  // 부모 댓글만 필터링
  const parentComments = comments.filter(c => !c.parent_id);
  
  // 대댓글 찾기
  const getReplies = (parentId) => {
    return comments.filter(c => c.parent_id === parentId);
  };

  const isAuthor = (comment) => {
    return user && (
      comment.user_id === user.userId || 
      comment.user_id === user.id ||
      comment.username === user.username
    );
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💬 댓글 {comments.length}개</h3>

      {/* 댓글 작성 */}
      <form onSubmit={handleSubmitComment} style={styles.form}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성하세요..."
          style={styles.textarea}
          rows="3"
        />
        <button 
          type="submit" 
          disabled={loading}
          style={styles.submitBtn}
        >
          {loading ? '작성 중...' : '댓글 작성'}
        </button>
      </form>

      {/* 댓글 목록 */}
      <div style={styles.commentList}>
        {parentComments.map((comment) => (
          <div key={comment.id} style={styles.commentWrapper}>
            {/* 부모 댓글 */}
            <div style={styles.comment}>
              <div style={styles.commentHeader}>
                <span style={styles.author}>{comment.username}</span>
                <span style={styles.date}>{formatDate(comment.created_at)}</span>
              </div>

              {editingId === comment.id ? (
                // 수정 모드
                <div style={styles.editForm}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={styles.textarea}
                    rows="2"
                  />
                  <div style={styles.editButtons}>
                    <button 
                      onClick={() => handleEdit(comment.id)}
                      style={styles.saveBtn}
                    >
                      저장
                    </button>
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      style={styles.cancelBtn}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <>
                  <p style={styles.content}>{comment.content}</p>
                  <div style={styles.actions}>
                    <button 
                      onClick={() => setReplyTo(comment.id)}
                      style={styles.actionBtn}
                    >
                      답글
                    </button>
                    {isAuthor(comment) && (
                      <>
                        <button 
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}
                          style={styles.actionBtn}
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          style={styles.deleteActionBtn}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 대댓글 작성 폼 */}
            {replyTo === comment.id && (
              <div style={styles.replyForm}>
                <form onSubmit={(e) => handleSubmitReply(e, comment.id)}>
                  <div style={styles.replyInputWrapper}>
                    <span style={styles.replyLabel}>
                      ↳ {comment.username}님에게 답글
                    </span>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="답글을 작성하세요..."
                      style={styles.textarea}
                      rows="2"
                    />
                  </div>
                  <div style={styles.replyButtons}>
                    <button 
                      type="submit"
                      disabled={loading}
                      style={styles.submitBtn}
                    >
                      답글 작성
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent('');
                      }}
                      style={styles.cancelBtn}
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 대댓글 목록 */}
            {getReplies(comment.id).map((reply) => (
              <div key={reply.id} style={styles.reply}>
                <div style={styles.replyIndicator}>↳</div>
                <div style={styles.replyContent}>
                  <div style={styles.commentHeader}>
                    <span style={styles.author}>{reply.username}</span>
                    <span style={styles.replyToLabel}>
                      → {comment.username}
                    </span>
                    <span style={styles.date}>{formatDate(reply.created_at)}</span>
                  </div>

                  {editingId === reply.id ? (
                    // 수정 모드
                    <div style={styles.editForm}>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={styles.textarea}
                        rows="2"
                      />
                      <div style={styles.editButtons}>
                        <button 
                          onClick={() => handleEdit(reply.id)}
                          style={styles.saveBtn}
                        >
                          저장
                        </button>
                        <button 
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                          style={styles.cancelBtn}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 보기 모드
                    <>
                      <p style={styles.content}>{reply.content}</p>
                      {isAuthor(reply) && (
                        <div style={styles.actions}>
                          <button 
                            onClick={() => {
                              setEditingId(reply.id);
                              setEditContent(reply.content);
                            }}
                            style={styles.actionBtn}
                          >
                            수정
                          </button>
                          <button 
                            onClick={() => handleDelete(reply.id)}
                            style={styles.deleteActionBtn}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '40px',
    borderTop: '2px solid #f0f0f0',
    paddingTop: '30px',
  },
  title: {
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    marginBottom: '30px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  submitBtn: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  commentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  commentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  comment: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  commentHeader: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '10px',
  },
  author: {
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: '12px',
    color: '#999',
  },
  replyToLabel: {
    fontSize: '12px',
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    margin: '0 0 10px 0',
    color: '#333',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    padding: '5px 10px',
    backgroundColor: 'transparent',
    color: '#2196F3',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteActionBtn: {
    padding: '5px 10px',
    backgroundColor: 'transparent',
    color: '#f44336',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  editButtons: {
    display: 'flex',
    gap: '10px',
  },
  saveBtn: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelBtn: {
    padding: '8px 16px',
    backgroundColor: '#757575',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  // 대댓글 스타일
  reply: {
    display: 'flex',
    gap: '10px',
    marginLeft: '40px',
    padding: '15px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
  },
  replyIndicator: {
    color: '#4CAF50',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  replyContent: {
    flex: 1,
  },
  replyForm: {
    marginLeft: '40px',
    padding: '15px',
    backgroundColor: '#f0f7ff',
    borderRadius: '8px',
    border: '1px solid #2196F3',
  },
  replyInputWrapper: {
    marginBottom: '10px',
  },
  replyLabel: {
    display: 'block',
    marginBottom: '8px',
    color: '#2196F3',
    fontWeight: '500',
    fontSize: '14px',
  },
  replyButtons: {
    display: 'flex',
    gap: '10px',
  },
};

export default Comments;