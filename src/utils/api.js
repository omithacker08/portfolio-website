const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://portfolio-backend-qxhg.onrender.com/api';

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

  async updateSiteConfig(config) {
    return this.request('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async getBlogs() {
    return this.request('/blogs');
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

  async getProjects() {
    return this.request('/projects');
  }

  async createProject(project) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getAiProjects() {
    return this.request('/ai-projects');
  }

  async createAiProject(project) {
    return this.request('/ai-projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getUsers() {
    return this.request('/users');
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

  logout() {
    this.setToken(null);
  }
}

export default new ApiService();