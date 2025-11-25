const API_URL = 'https://portfolio-backend-qxhg.onrender.com/api';

async function testResume() {
  try {
    // Login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login:', loginData.token ? 'SUCCESS' : 'FAILED');
    
    if (loginData.token) {
      // Test resume update
      const resumeResponse = await fetch(`${API_URL}/resume`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          name: 'Om Thacker',
          profession: 'Full Stack Developer',
          summary: 'Test summary',
          email: 'omi.thacker08@gmail.com',
          phone: '+91 9870915196',
          location: 'Mumbai, MH',
          linkedin: 'https://linkedin.com/in/om-thacker',
          website: 'omthacker.dev',
          education: [],
          experience: [],
          technologies: [],
          aiSkills: []
        })
      });
      
      const resumeResult = await resumeResponse.text();
      console.log('Resume update response:', resumeResult);
      console.log('Resume status:', resumeResponse.status);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testResume();