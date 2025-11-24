const API_URL = 'https://portfolio-backend-qxhg.onrender.com/api';

async function testAPI() {
  console.log('Testing API endpoints...');
  
  try {
    // Test home content GET
    console.log('\n1. Testing GET /api/home');
    const homeResponse = await fetch(`${API_URL}/home`);
    const homeData = await homeResponse.json();
    console.log('Home data:', JSON.stringify(homeData, null, 2));
    
    // Test site config GET
    console.log('\n2. Testing GET /api/config');
    const configResponse = await fetch(`${API_URL}/config`);
    const configData = await configResponse.json();
    console.log('Config data:', JSON.stringify(configData, null, 2));
    
    // Test login
    console.log('\n3. Testing POST /api/auth/login');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.token ? 'SUCCESS - Token received' : 'FAILED');
    
    if (loginData.token) {
      // Test home content UPDATE
      console.log('\n4. Testing PUT /api/home with auth');
      const updateResponse = await fetch(`${API_URL}/home`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          heroName: 'Test Update',
          heroTitle: 'Updated Title',
          heroStats: [{ number: '999+', label: 'Test Updates' }]
        })
      });
      const updateData = await updateResponse.json();
      console.log('Update response:', updateData);
      
      // Test home content GET after update
      console.log('\n5. Testing GET /api/home after update');
      const updatedHomeResponse = await fetch(`${API_URL}/home`);
      const updatedHomeData = await updatedHomeResponse.json();
      console.log('Updated home data:', JSON.stringify(updatedHomeData, null, 2));
    }
    
  } catch (error) {
    console.error('API Test Error:', error);
  }
}

testAPI();