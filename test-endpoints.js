#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_BASE = 'https://portfolio-backend-qxhg.onrender.com/api';
const TEST_USER = {
  email: 'admin@example.com',
  password: 'admin123'
};

let authToken = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

const addResult = (test, status, message = '') => {
  results.tests.push({ test, status, message });
  if (status === 'PASS') results.passed++;
  else results.failed++;
  
  const color = status === 'PASS' ? 'green' : 'red';
  log(`${status === 'PASS' ? '✅' : '❌'} ${test}${message ? ': ' + message : ''}`, color);
};

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Authentication Tests
const testAuthentication = async () => {
  log('\n🔐 Testing Authentication Endpoints', 'cyan');
  
  // Test login
  const loginResult = await apiCall('POST', '/auth/login', TEST_USER);
  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    addResult('POST /auth/login', 'PASS', 'Login successful');
  } else {
    addResult('POST /auth/login', 'FAIL', loginResult.error);
    return false;
  }
  
  // Test protected route with token
  const protectedResult = await apiCall('GET', '/users', null, {
    'Authorization': `Bearer ${authToken}`
  });
  if (protectedResult.success) {
    addResult('Protected route access', 'PASS', 'Token validation works');
  } else {
    addResult('Protected route access', 'FAIL', protectedResult.error);
  }
  
  return true;
};

// Site Configuration Tests
const testSiteConfig = async () => {
  log('\n⚙️ Testing Site Configuration', 'cyan');
  
  // GET config
  const getResult = await apiCall('GET', '/config');
  if (getResult.success) {
    addResult('GET /config', 'PASS', 'Config retrieved');
  } else {
    addResult('GET /config', 'FAIL', getResult.error);
  }
  
  // PUT config (admin only)
  const updateData = {
    site_name: 'Test Portfolio',
    tagline: 'Test Tagline',
    primary_color: '#007bff',
    secondary_color: '#6c757d'
  };
  
  const putResult = await apiCall('PUT', '/config', updateData, {
    'Authorization': `Bearer ${authToken}`
  });
  if (putResult.success) {
    addResult('PUT /config', 'PASS', 'Config updated');
  } else {
    addResult('PUT /config', 'FAIL', putResult.error);
  }
};

// Blog CRUD Tests
const testBlogs = async () => {
  log('\n📝 Testing Blog CRUD Operations', 'cyan');
  
  let blogId = null;
  
  // GET all blogs
  const getAllResult = await apiCall('GET', '/blogs');
  if (getAllResult.success) {
    addResult('GET /blogs', 'PASS', `Found ${getAllResult.data.length} blogs`);
  } else {
    addResult('GET /blogs', 'FAIL', getAllResult.error);
  }
  
  // POST new blog
  const newBlog = {
    title: 'Test Blog Post',
    content: 'This is a test blog post content.',
    author: 'Test Author',
    isDraft: false
  };
  
  const createResult = await apiCall('POST', '/blogs', newBlog, {
    'Authorization': `Bearer ${authToken}`
  });
  if (createResult.success) {
    blogId = createResult.data.id;
    addResult('POST /blogs', 'PASS', `Blog created with ID: ${blogId}`);
  } else {
    const errorMsg = typeof createResult.error === 'object' ? JSON.stringify(createResult.error) : createResult.error;
    addResult('POST /blogs', 'FAIL', errorMsg);
  }
  
  // PUT update blog (if created successfully)
  if (blogId) {
    const updateBlog = {
      title: 'Updated Test Blog Post',
      content: 'Updated content.',
      author: 'Updated Author',
      isDraft: true
    };
    
    const updateResult = await apiCall('PUT', `/blogs/${blogId}`, updateBlog, {
      'Authorization': `Bearer ${authToken}`
    });
    if (updateResult.success) {
      addResult('PUT /blogs/:id', 'PASS', 'Blog updated');
    } else {
      addResult('PUT /blogs/:id', 'FAIL', updateResult.error);
    }
    
    // DELETE blog
    const deleteResult = await apiCall('DELETE', `/blogs/${blogId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });
    if (deleteResult.success) {
      addResult('DELETE /blogs/:id', 'PASS', 'Blog deleted');
    } else {
      addResult('DELETE /blogs/:id', 'FAIL', deleteResult.error);
    }
  }
};

// Projects CRUD Tests
const testProjects = async () => {
  log('\n💼 Testing Projects CRUD Operations', 'cyan');
  
  let projectId = null;
  
  // GET all projects
  const getAllResult = await apiCall('GET', '/projects');
  if (getAllResult.success) {
    addResult('GET /projects', 'PASS', `Found ${getAllResult.data.length} projects`);
  } else {
    addResult('GET /projects', 'FAIL', getAllResult.error);
  }
  
  // POST new project
  const newProject = {
    name: 'Test Project',
    domain: 'Web Development',
    technologies: 'React, Node.js',
    problemStatement: 'Test project problem statement',
    solutionSummary: 'Test solution summary',
    benefits: 'Test benefits',
    imageUrl: 'https://via.placeholder.com/300',
    videoUrl: 'https://test-video.com'
  };
  
  const createResult = await apiCall('POST', '/projects', newProject, {
    'Authorization': `Bearer ${authToken}`
  });
  if (createResult.success) {
    projectId = createResult.data.id;
    addResult('POST /projects', 'PASS', `Project created with ID: ${projectId}`);
  } else {
    const errorMsg = typeof createResult.error === 'object' ? JSON.stringify(createResult.error) : createResult.error;
    addResult('POST /projects', 'FAIL', errorMsg);
  }
  
  // Clean up - delete test project
  if (projectId) {
    await apiCall('DELETE', `/projects/${projectId}`, null, {
      'Authorization': `Bearer ${authToken}`
    });
  }
};

// AI Projects Tests
const testAIProjects = async () => {
  log('\n🤖 Testing AI Projects CRUD Operations', 'cyan');
  
  // GET all AI projects
  const getAllResult = await apiCall('GET', '/ai-projects');
  if (getAllResult.success) {
    addResult('GET /ai-projects', 'PASS', `Found ${getAllResult.data.length} AI projects`);
  } else {
    addResult('GET /ai-projects', 'FAIL', getAllResult.error);
  }
  
  // POST new AI project
  const newAIProject = {
    useCase: 'Test AI Use Case',
    benefits: 'Test AI benefits',
    domain: 'Machine Learning',
    cost: 'Low ($1K - $10K)',
    problemStatement: 'Test AI problem statement'
  };
  
  const createResult = await apiCall('POST', '/ai-projects', newAIProject, {
    'Authorization': `Bearer ${authToken}`
  });
  if (createResult.success) {
    addResult('POST /ai-projects', 'PASS', 'AI project created');
  } else {
    const errorMsg = typeof createResult.error === 'object' ? JSON.stringify(createResult.error) : createResult.error;
    addResult('POST /ai-projects', 'FAIL', errorMsg);
  }
};

// Resume Tests
const testResume = async () => {
  log('\n📄 Testing Resume Operations', 'cyan');
  
  // GET resume
  const getResult = await apiCall('GET', '/resume/1');
  if (getResult.success) {
    addResult('GET /resume/:userId', 'PASS', 'Resume retrieved');
  } else {
    addResult('GET /resume/:userId', 'FAIL', getResult.error);
  }
  
  // POST/PUT resume
  const resumeData = {
    personal_info: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      phone: '123-456-7890'
    }),
    experience: JSON.stringify([{
      company: 'Test Company',
      position: 'Test Position',
      duration: '2020-2023',
      description: 'Test description'
    }]),
    education: JSON.stringify([{
      institution: 'Test University',
      degree: 'Test Degree',
      year: '2020'
    }]),
    skills: JSON.stringify(['JavaScript', 'React', 'Node.js'])
  };
  
  const updateResult = await apiCall('POST', '/resume', resumeData, {
    'Authorization': `Bearer ${authToken}`
  });
  if (updateResult.success) {
    addResult('POST /resume', 'PASS', 'Resume updated');
  } else {
    addResult('POST /resume', 'FAIL', updateResult.error);
  }
};

// User Management Tests (Admin only)
const testUserManagement = async () => {
  log('\n👥 Testing User Management (Admin)', 'cyan');
  
  // GET all users
  const getAllResult = await apiCall('GET', '/users', null, {
    'Authorization': `Bearer ${authToken}`
  });
  if (getAllResult.success) {
    addResult('GET /users', 'PASS', `Found ${getAllResult.data.length} users`);
  } else {
    addResult('GET /users', 'FAIL', getAllResult.error);
  }
};

// Home Page Content Tests
const testHomeContent = async () => {
  log('\n🏠 Testing Home Page Content', 'cyan');
  
  // GET home content
  const getResult = await apiCall('GET', '/home');
  if (getResult.success) {
    addResult('GET /home', 'PASS', 'Home content retrieved');
  } else {
    addResult('GET /home', 'FAIL', getResult.error);
  }
  
  // PUT home content
  const homeData = {
    heroName: 'Test Hero Name',
    heroTitle: 'Test Hero Title',
    heroSubtitle: 'Test Hero Subtitle',
    heroStats: [{number: '10+', label: 'Test Projects'}],
    aboutPreview: 'Test about preview',
    ctaTitle: 'Test CTA Title',
    ctaSubtitle: 'Test CTA Subtitle',
    profileName: 'Test Profile Name',
    profileStatus: 'Test Status',
    profileTechStack: 'React, Node.js'
  };
  
  const updateResult = await apiCall('PUT', '/home', homeData, {
    'Authorization': `Bearer ${authToken}`
  });
  if (updateResult.success) {
    addResult('PUT /home', 'PASS', 'Home content updated');
  } else {
    addResult('PUT /home', 'FAIL', updateResult.error);
  }
};

// About Page Content Tests
const testAboutContent = async () => {
  log('\n👤 Testing About Page Content', 'cyan');
  
  // GET about content
  const getResult = await apiCall('GET', '/about');
  if (getResult.success) {
    addResult('GET /about', 'PASS', 'About content retrieved');
  } else {
    addResult('GET /about', 'FAIL', getResult.error);
  }
  
  // Note: About content update endpoint doesn't exist in backend
  addResult('PUT /about', 'SKIP', 'Endpoint not implemented in backend');
};

// Main test runner
const runAllTests = async () => {
  log('🧪 Starting Comprehensive API Testing', 'magenta');
  log('=====================================', 'magenta');
  
  try {
    // Authentication is required for most operations
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      log('\n❌ Authentication failed - skipping protected endpoint tests', 'red');
      return;
    }
    
    // Run all test suites
    await testSiteConfig();
    await testBlogs();
    await testProjects();
    await testAIProjects();
    await testResume();
    await testUserManagement();
    await testHomeContent();
    await testAboutContent();
    
  } catch (error) {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
  }
  
  // Print summary
  log('\n📊 Test Summary', 'magenta');
  log('===============', 'magenta');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`📈 Total: ${results.passed + results.failed}`, 'blue');
  
  if (results.failed > 0) {
    log('\n🔍 Failed Tests:', 'yellow');
    results.tests
      .filter(test => test.status === 'FAIL')
      .forEach(test => {
        log(`   • ${test.test}: ${test.message}`, 'red');
      });
  }
  
  log(`\n🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`, 'cyan');
};

// Run tests
runAllTests().catch(console.error);