const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
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

    // Always get fresh token from localStorage
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      this.token = currentToken;
      headers.Authorization = `Bearer ${currentToken}`;
      console.log('Using token:', currentToken.substring(0, 20) + '...');
    } else {
      console.log('No token found in localStorage');
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Something went wrong' };
        }
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(data.token);
    return data;
  }

  async getSiteConfig() {
    return this.request('/config');
  }

  async getBlogs() {
    return this.request('/blogs');
  }

  async getProjects() {
    return this.request('/projects');
  }

  async getAiProjects() {
    return this.request('/ai-projects');
  }

  async updateSiteConfig(config) {
    console.log('API: Sending config update:', config);
    const response = await this.request('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    console.log('API: Config update response:', response);
    return response;
  }

  async createBlog(blog) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify(blog),
    });
  }

  async updateBlog(id, updates) {
    return this.request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteBlog(id) {
    return this.request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  }

  async createProject(project) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async createAiProject(project) {
    return this.request('/ai-projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

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

  async getUsers() {
    return this.request('/users');
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getResume(userId) {
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

  // Blog Comments
  async getBlogComments(blogId) {
    return this.request(`/blogs/${blogId}/comments`);
  }

  async addBlogComment(blogId, content) {
    return this.request(`/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Blog Likes
  async likeBlog(blogId) {
    return this.request(`/blogs/${blogId}/like`, {
      method: 'POST',
    });
  }

  async getBlogLikes(blogId) {
    return this.request(`/blogs/${blogId}/likes`);
  }

  // Newsletter
  async subscribeNewsletter(email, name) {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  async getNewsletterSubscribers() {
    return this.request('/newsletter/subscribers');
  }

  // Contact
  async sendContactMessage(data) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContactMessages() {
    return this.request('/contact/messages');
  }

  async markMessageAsRead(messageId) {
    return this.request(`/contact/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // User Registration
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(data.token);
    return data;
  }

  // User Management
  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Draft System
  async getDrafts() {
    return this.request('/blogs/drafts');
  }

  async saveDraft(blogData) {
    return this.request('/blogs', {
      method: 'POST',
      body: JSON.stringify({ ...blogData, isDraft: true }),
    });
  }

  // Analytics
  async getAnalytics() {
    return this.request('/analytics');
  }

  // Sitemap
  async getSitemapData() {
    return this.request('/sitemap');
  }

  // File Upload
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }

  // Bulk Operations
  async bulkOperation(type, action, ids) {
    return this.request(`/${type}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ action, [`${type.slice(0, -1)}Ids`]: ids })
    });
  }

  // Content Templates
  async getTemplates() {
    return this.request('/templates');
  }

  async createTemplate(template) {
    return this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  }

  async deleteTemplate(id) {
    return this.request(`/templates/${id}`, {
      method: 'DELETE'
    });
  }

  // Admin Logs
  async getAdminLogs(page = 1, limit = 50) {
    return this.request(`/admin/logs?page=${page}&limit=${limit}`);
  }

  // Backup & Restore
  async createBackup() {
    return this.request('/admin/backup', {
      method: 'POST'
    });
  }

  async getBackups() {
    return this.request('/admin/backups');
  }

  async restoreBackup(backupName) {
    return this.request('/admin/restore', {
      method: 'POST',
      body: JSON.stringify({ backupName })
    });
  }

  logout() {
    this.setToken(null);
  }
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

export default new ApiService();