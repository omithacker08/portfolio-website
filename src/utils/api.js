const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://portfolio-backend-qxhg.onrender.com/api';

// Network status checker
const checkNetworkStatus = () => {
  return navigator.onLine;
};

// Retry with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.isOnline = checkNetworkStatus();
    
    // Listen for network status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network connection lost');
    });
  }
  
  checkConnection() {
    if (!this.isOnline) {
      throw new Error('No internet connection. Please check your network.');
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      this.token = currentToken;
      headers.Authorization = `Bearer ${currentToken}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      timeout: 10000, // 10 second timeout
      ...options,
    };

    try {
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        return { message: 'Success' };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      console.error('API Error:', error);
      throw error;
    }
  }

  async login(email, password) {
    this.checkConnection();
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(data.token);
    return data;
  }

  async getSiteConfig() {
    this.checkConnection();
    return this.request('/config');
  }

  async updateSiteConfig(config) {
    return this.request('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async getBlogs() {
    this.checkConnection();
    return this.request('/blogs');
  }

  async createBlog(blog) {
    this.checkConnection();
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blog),
    });
  }

  async updateBlog(id, updates) {
    this.checkConnection();
    return this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteBlog(id) {
    this.checkConnection();
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  async getProjects() {
    this.checkConnection();
    return this.request('/projects');
  }

  async createProject(project) {
    this.checkConnection();
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getAiProjects() {
    this.checkConnection();
    return this.request('/ai-projects');
  }

  async createAiProject(project) {
    this.checkConnection();
    return this.request('/ai-projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getUsers() {
    this.checkConnection();
    return this.request('/users');
  }

  async getResume(userId) {
    this.checkConnection();
    return this.request(`/resume/${userId}`);
  }

  async updateResume(resumeData) {
    return this.request('/resume', {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
  }

  async getAboutContent() {
    return this.request('/about');
  }

  async updateAboutContent(aboutData) {
    return this.request('/about', {
      method: 'PUT',
      body: JSON.stringify(aboutData),
    });
  }

  async getHomeContent() {
    return this.request('/home');
  }

  async updateHomeContent(homeData) {
    return this.request('/home', {
      method: 'PUT',
      body: JSON.stringify(homeData),
    });
  }

  // Missing API methods
  async updateProject(id, project) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async updateAiProject(id, project) {
    return this.request(`/ai-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteAiProject(id) {
    return this.request(`/ai-projects/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Blog interaction methods
  async getBlogComments(blogId) {
    return this.request(`/blogs/${blogId}/comments`);
  }

  async addBlogComment(blogId, content) {
    return this.request(`/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async likeBlog(blogId) {
    return this.request(`/blogs/${blogId}/like`, {
      method: 'POST',
    });
  }

  async getBlogLikes(blogId) {
    return this.request(`/blogs/${blogId}/likes`);
  }

  async saveDraft(blogData) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify({ ...blogData, isDraft: true }),
    });
  }

  // Contact and Newsletter
  async sendContactMessage(messageData) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async subscribeNewsletter(email, name) {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  async sendChatMessage(messageData) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  logout() {
    this.setToken(null);
  }
}

export default new ApiService();