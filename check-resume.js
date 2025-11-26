#!/usr/bin/env node

const API_BASE_URL = 'https://portfolio-backend-qxhg.onrender.com/api';

const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AUTH_TOKEN || ''}`
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const login = async () => {
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    })
  });
  
  if (result.success) {
    return result.data.token;
  }
  return null;
};

const checkResume = async (token) => {
  const result = await makeRequest('/resume/1', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (result.success) {
    console.log('Current Resume Data:');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.log('Failed to get resume:', result.error);
  }
};

const main = async () => {
  const token = await login();
  if (token) {
    await checkResume(token);
  }
};

main();