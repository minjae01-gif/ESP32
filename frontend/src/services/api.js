import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 회원가입
  signup: (userData) => api.post('/auth/signup', userData),
  
  // 로그인
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 토큰 검증
  verify: () => api.get('/auth/verify'),
};

// 게시글 관련 API
export const postAPI = {
  // 모든 게시글 조회
  getPosts: () => api.get('/posts'),
  
  // 특정 게시글 조회
  getPost: (id) => api.get(`/posts/${id}`),
  
  // 게시글 작성 (FormData 지원)
  createPost: (postData) => {
    // FormData인지 확인
    if (postData instanceof FormData) {
      return api.post('/posts', postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // 일반 객체인 경우
    return api.post('/posts', postData);
  },
  
  // 게시글 수정 (FormData 지원)
  updatePost: (id, postData) => {
    // FormData인지 확인
    if (postData instanceof FormData) {
      return api.put(`/posts/${id}`, postData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // 일반 객체인 경우
    return api.put(`/posts/${id}`, postData);
  },
  
  // 게시글 삭제
  deletePost: (id) => api.delete(`/posts/${id}`),
};

// 거래 게시판 API
export const marketplaceAPI = {
  // 모든 거래글 조회
  getItems: () => api.get('/marketplace'),
  
  // 특정 거래글 조회
  getItem: (id) => api.get(`/marketplace/${id}`),
  
  // 거래글 작성 (이미지 포함)
  createItem: (formData) => {
    return api.post('/marketplace', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 거래글 수정
  updateItem: (id, formData) => {
    return api.put(`/marketplace/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 거래글 삭제
  deleteItem: (id) => api.delete(`/marketplace/${id}`),
};

// 댓글 API
export const commentAPI = {
  // 특정 게시글의 댓글 조회
  getPostComments: (postId) => api.get(`/comments/post/${postId}`),
  
  // 특정 거래글의 댓글 조회
  getItemComments: (itemId) => api.get(`/comments/item/${itemId}`),
  
  // 댓글 작성
  createComment: (commentData) => api.post('/comments', commentData),
  
  // 댓글 수정
  updateComment: (id, content) => api.put(`/comments/${id}`, { content }),
  
  // 댓글 삭제
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export default api;