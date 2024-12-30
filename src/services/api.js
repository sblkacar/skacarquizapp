const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    console.log('API Request:', { url, method: options.method || 'GET' });

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors'
    };

    const token = localStorage.getItem('token');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  // User endpoints
  getCurrentUser() {
    return this.request('/users/me');
  }

  updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Quiz endpoints
  getQuizzes() {
    return this.request('/quizzes');
  }

  getQuizById(quizId) {
    return this.request(`/quizzes/${quizId}`);
  }

  createQuiz(quizData) {
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  }

  updateQuiz(quizId, quizData) {
    return this.request(`/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData)
    });
  }

  deleteQuiz(quizId) {
    return this.request(`/quizzes/${quizId}`, {
      method: 'DELETE'
    });
  }

  // Results endpoints
  submitQuiz(quizId, answers) {
    return this.request(`/results/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  getResults(quizId) {
    return this.request(`/results/${quizId}`);
  }

  // Stats endpoints
  getPublicStats() {
    return this.request('/stats/public');
  }

  getAdminStats() {
    return this.request('/stats/admin');
  }

  getTeacherStats() {
    return this.request('/stats/teacher');
  }

  getStudentStats(studentId) {
    return this.request(`/stats/student/${studentId}`);
  }

  // Admin endpoints
  getAllUsers() {
    return this.request('/admin/users');
  }

  createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // Student endpoints
  joinQuiz(joinCode) {
    return this.request('/quizzes/join', {
      method: 'POST',
      body: JSON.stringify({ code: joinCode })
    });
  }

  getStudentStats() {
    return this.request('/students/stats');
  }

  getStudentResults() {
    return this.request('/students/results');
  }

  getQuizDetails(quizId) {
    return this.request(`/quizzes/${quizId}`);
  }

  submitQuizAnswers(quizId, answers) {
    return this.request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  // Teacher endpoints
  getTeacherQuizzes() {
    return this.request('/quizzes');
  }

  toggleQuizStatus(quizId) {
    return this.request(`/quizzes/${quizId}/toggle-status`, {
      method: 'PUT'
    });
  }

  getTeacherResults() {
    return this.request('/results/teacher');
  }

  getQuizResults(quizId) {
    return this.request(`/quizzes/${quizId}/results`);
  }

  // Admin endpoints
  getUserStats() {
    return this.request('/admin/user-stats');
  }

  getPendingTeachers() {
    return this.request('/admin/pending-teachers');
  }

  approveTeacher(teacherId) {
    return this.request(`/admin/teacher-approval/${teacherId}`, {
      method: 'PUT'
    });
  }

  // User endpoints
  getUsers() {
    return this.request('/users');
  }

  updateUserProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Quiz management
  createOrUpdateQuiz(quizData, quizId = null) {
    const url = quizId ? `/quizzes/${quizId}` : '/quizzes';
    const method = quizId ? 'PUT' : 'POST';
    
    return this.request(url, {
      method,
      body: JSON.stringify(quizData)
    });
  }

  getQuizStats() {
    return this.request('/quizzes/stats');
  }
}

const api = new ApiService();
export default api; 