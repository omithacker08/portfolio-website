#!/usr/bin/env node

const API_BASE_URL = 'https://portfolio-backend-qxhg.onrender.com/api';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`Testing ${description}...`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${description}: SUCCESS`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
      if (Array.isArray(data)) {
        console.log(`   Items count: ${data.length}`);
      }
    } else {
      console.log(`❌ ${description}: FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`❌ ${description}: CONNECTION ERROR`);
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

async function runTests() {
  console.log('🚀 Testing API Connection to Render Backend...\n');
  
  // Test public endpoints
  await testEndpoint('/config', 'Site Configuration');
  await testEndpoint('/blogs', 'Blog Posts');
  await testEndpoint('/projects', 'Projects');
  await testEndpoint('/ai-projects', 'AI Projects');
  await testEndpoint('/about', 'About Content');
  await testEndpoint('/home', 'Home Content');
  await testEndpoint('/resume/1', 'Resume Data');
  
  console.log('🏁 API Connection Test Complete');
}

runTests().catch(console.error);