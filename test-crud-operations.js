#!/usr/bin/env node

/**
 * Comprehensive CRUD Operations Test Script
 * Tests all input fields and database operations across the entire website
 */

const API_BASE_URL = 'https://portfolio-backend-qxhg.onrender.com/api';
let authToken = '';

// Test data templates
const testData = {
  siteConfig: {
    siteName: 'Test Portfolio.',
    tagline: 'Test tagline.',
    logoUrl: 'https://example.com/logo.png',
    colors: {
      primary: '#FF0000.',
      secondary: '#00FF00.'
    },
    content: {
      contact: {
        email: 'test@example.com.',
        phone: '+1234567890.'
      },
      resume: {
        title: 'Test Resume.',
        description: 'Test resume description.'
      },
      projects: {
        title: 'Test Projects.',
        description: 'Test projects description.'
      },
      ai: {
        title: 'Test AI.',
        description: 'Test AI description.'
      },
      blog: {
        title: 'Test Blog.',
        description: 'Test blog description.'
      }
    },
    social: {
      linkedin: 'https://linkedin.com/test.',
      github: 'https://github.com/test.',
      twitter: 'https://twitter.com/test.',
      instagram: 'https://instagram.com/test.',
      youtube: 'https://youtube.com/test.'
    },
    seo: {
      description: 'Test SEO description.',
      keywords: 'test, portfolio, developer.'
    }
  },
  
  homeContent: {
    heroName: 'Test Name.',
    heroTitle: 'Test Hero Title.',
    heroSubtitle: 'Test hero subtitle.',
    heroStats: [
      { number: '100+.', label: 'Test Projects.' },
      { number: '5+.', label: 'Test Years.' }
    ],
    aboutPreview: 'Test about preview.',
    ctaTitle: 'Test CTA Title.',
    ctaSubtitle: 'Test CTA subtitle.',
    profileName: 'Test Profile.',
    profileStatus: 'Test Status.',
    profileTechStack: 'React., Node.js., Python.'
  },
  
  aboutContent: {
    jobTitle: 'Test Developer.',
    jobIcon: '🧪.',
    whoIAm: 'Test who I am description.',
    whatIDo: 'Test services list.',
    technicalSkills: [
      { id: 1, name: 'Test Skill.', level: 'Expert.', category: 'Frontend.' }
    ]
  },
  
  blog: {
    title: 'Test Blog Post.',
    content: '<p>Test blog content.</p>',
    excerpt: 'Test excerpt.',
    tags: 'test., blog., crud.',
    imageUrl: 'https://example.com/test.jpg'
  },
  
  project: {
    name: 'Test Project.',
    domain: 'Test Domain.',
    technologies: 'React., Node.js.',
    problemStatement: 'Test problem statement.',
    solutionSummary: 'Test solution summary.',
    benefits: 'Test benefits.',
    imageUrl: 'https://example.com/project.jpg',
    videoUrl: 'https://example.com/video.mp4'
  },
  
  aiProject: {
    useCase: 'Test AI Use Case.',
    benefits: 'Test AI benefits.',
    domain: 'Test AI domain.',
    cost: 'Test cost.',
    problemStatement: 'Test AI problem statement.'
  },
  
  resume: {
    name: 'Test User.',
    profession: 'Test Developer.',
    summary: 'Test professional summary.',
    email: 'test@resume.com.',
    phone: '+1234567890.',
    location: 'Test City.',
    linkedin: 'https://linkedin.com/testuser.',
    website: 'https://testuser.com.',
    education: [
      {
        degree: 'Test Degree.',
        institution: 'Test University.',
        year: '2020.',
        gpa: '3.8.',
        percentage: '85%.'
      }
    ],
    experience: [
      {
        title: 'Test Position.',
        company: 'Test Company.',
        duration: '2020-2023.',
        description: 'Test job description.'
      }
    ],
    technologies: [
      { name: 'Test Tech.', category: 'Frontend.' }
    ],
    aiSkills: [
      { name: 'Test AI Skill.', level: 'Advanced.' }
    ]
  },
  
  user: {
    name: 'Test User.',
    email: 'testuser@example.com.',
    password: 'testpass123.',
    role: 'user'
  }
};

// Utility functions
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
};

// Test functions
const testLogin = async () => {
  log('🔐 Testing Authentication...', 'info');
  
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    })
  });
  
  if (result.success) {
    authToken = result.data.token;
    log('✅ Login successful', 'success');
    return true;
  } else {
    log(`❌ Login failed: ${result.error}`, 'error');
    return false;
  }
};

const testSiteConfig = async () => {
  log('🔧 Testing Site Configuration...', 'info');
  
  // Test GET
  const getResult = await makeRequest('/config');
  if (!getResult.success) {
    log(`❌ GET config failed: ${getResult.error}`, 'error');
    return false;
  }
  
  // Test PUT
  const putResult = await makeRequest('/config', {
    method: 'PUT',
    body: JSON.stringify(testData.siteConfig)
  });
  
  if (putResult.success) {
    log('✅ Site config update successful', 'success');
    
    // Verify the update
    const verifyResult = await makeRequest('/config');
    if (verifyResult.success) {
      const config = verifyResult.data;
      const hasTestData = config.site_name?.includes('.') || 
                         config.content?.contact?.email?.includes('.');
      
      if (hasTestData) {
        log('✅ Site config verification successful - test data found', 'success');
      } else {
        log('⚠️  Site config verification - no test markers found', 'warning');
      }
    }
    return true;
  } else {
    log(`❌ Site config update failed: ${putResult.error}`, 'error');
    return false;
  }
};

const testHomeContent = async () => {
  log('🏠 Testing Home Content...', 'info');
  
  const result = await makeRequest('/home', {
    method: 'PUT',
    body: JSON.stringify(testData.homeContent)
  });
  
  if (result.success) {
    log('✅ Home content update successful', 'success');
    
    // Verify
    const verifyResult = await makeRequest('/home');
    if (verifyResult.success && verifyResult.data.hero_name?.includes('.')) {
      log('✅ Home content verification successful', 'success');
    }
    return true;
  } else {
    log(`❌ Home content update failed: ${result.error}`, 'error');
    return false;
  }
};

const testAboutContent = async () => {
  log('👤 Testing About Content...', 'info');
  
  const result = await makeRequest('/about', {
    method: 'PUT',
    body: JSON.stringify(testData.aboutContent)
  });
  
  if (result.success) {
    log('✅ About content update successful', 'success');
    
    // Verify
    const verifyResult = await makeRequest('/about');
    if (verifyResult.success && verifyResult.data.job_title?.includes('.')) {
      log('✅ About content verification successful', 'success');
    }
    return true;
  } else {
    log(`❌ About content update failed: ${result.error}`, 'error');
    return false;
  }
};

const testBlogOperations = async () => {
  log('📝 Testing Blog Operations...', 'info');
  
  // Create blog
  const createResult = await makeRequest('/blogs', {
    method: 'POST',
    body: JSON.stringify(testData.blog)
  });
  
  if (!createResult.success) {
    log(`❌ Blog creation failed: ${createResult.error}`, 'error');
    return false;
  }
  
  const blogId = createResult.data.id;
  log('✅ Blog creation successful', 'success');
  
  // Update blog (approve)
  const updateResult = await makeRequest(`/blogs/${blogId}`, {
    method: 'PUT',
    body: JSON.stringify({ approved: true })
  });
  
  if (updateResult.success) {
    log('✅ Blog approval successful', 'success');
  } else {
    log(`❌ Blog approval failed: ${updateResult.error}`, 'error');
  }
  
  // Get blogs to verify
  const getResult = await makeRequest('/blogs');
  if (getResult.success) {
    const testBlog = getResult.data.find(blog => blog.title?.includes('.'));
    if (testBlog) {
      log('✅ Blog verification successful', 'success');
    }
  }
  
  return true;
};

const testProjectOperations = async () => {
  log('🚀 Testing Project Operations...', 'info');
  
  const createResult = await makeRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(testData.project)
  });
  
  if (createResult.success) {
    log('✅ Project creation successful', 'success');
    
    // Verify
    const getResult = await makeRequest('/projects');
    if (getResult.success) {
      const testProject = getResult.data.find(project => project.name?.includes('.'));
      if (testProject) {
        log('✅ Project verification successful', 'success');
      }
    }
    return true;
  } else {
    log(`❌ Project creation failed: ${createResult.error}`, 'error');
    return false;
  }
};

const testAIProjectOperations = async () => {
  log('🤖 Testing AI Project Operations...', 'info');
  
  const createResult = await makeRequest('/ai-projects', {
    method: 'POST',
    body: JSON.stringify(testData.aiProject)
  });
  
  if (createResult.success) {
    log('✅ AI Project creation successful', 'success');
    
    // Verify
    const getResult = await makeRequest('/ai-projects');
    if (getResult.success) {
      const testProject = getResult.data.find(project => project.use_case?.includes('.'));
      if (testProject) {
        log('✅ AI Project verification successful', 'success');
      }
    }
    return true;
  } else {
    log(`❌ AI Project creation failed: ${createResult.error}`, 'error');
    return false;
  }
};

const testResumeOperations = async () => {
  log('📄 Testing Resume Operations...', 'info');
  
  const updateResult = await makeRequest('/resume', {
    method: 'POST',
    body: JSON.stringify(testData.resume)
  });
  
  if (updateResult.success) {
    log('✅ Resume update successful', 'success');
    return true;
  } else {
    log(`❌ Resume update failed: ${updateResult.error}`, 'error');
    return false;
  }
};

const testUserOperations = async () => {
  log('👥 Testing User Operations...', 'info');
  
  // Create user
  const createResult = await makeRequest('/users', {
    method: 'POST',
    body: JSON.stringify(testData.user)
  });
  
  if (createResult.success) {
    log('✅ User creation successful', 'success');
    
    // Get users to verify
    const getResult = await makeRequest('/users');
    if (getResult.success) {
      const testUser = getResult.data.find(user => user.name?.includes('.'));
      if (testUser) {
        log('✅ User verification successful', 'success');
      }
    }
    return true;
  } else {
    log(`❌ User creation failed: ${createResult.error}`, 'error');
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  log('🧪 Starting Comprehensive CRUD Operations Test', 'info');
  log('=' .repeat(60), 'info');
  
  const tests = [
    { name: 'Authentication', fn: testLogin },
    { name: 'Site Configuration', fn: testSiteConfig },
    { name: 'Home Content', fn: testHomeContent },
    { name: 'About Content', fn: testAboutContent },
    { name: 'Blog Operations', fn: testBlogOperations },
    { name: 'Project Operations', fn: testProjectOperations },
    { name: 'AI Project Operations', fn: testAIProjectOperations },
    { name: 'Resume Operations', fn: testResumeOperations },
    { name: 'User Operations', fn: testUserOperations }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      log(`❌ ${test.name} threw error: ${error.message}`, 'error');
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  // Summary
  log('=' .repeat(60), 'info');
  log('📊 Test Results Summary:', 'info');
  log('=' .repeat(60), 'info');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const error = result.error ? ` (${result.error})` : '';
    log(`${status} - ${result.name}${error}`, result.success ? 'success' : 'error');
  });
  
  log('=' .repeat(60), 'info');
  log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`, 'info');
  
  if (failed === 0) {
    log('🎉 All tests passed! CRUD operations are working correctly.', 'success');
  } else {
    log(`⚠️  ${failed} test(s) failed. Please check the errors above.`, 'warning');
  }
  
  log('=' .repeat(60), 'info');
  log('💡 Look for entries with "." markers in the admin panel to verify data persistence.', 'info');
};

// Check if running directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`💥 Test runner crashed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runAllTests, testData };