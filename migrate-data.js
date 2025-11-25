const API_URL = 'https://portfolio-backend-qxhg.onrender.com/api';

async function migrateData() {
  console.log('Starting data migration...');
  
  try {
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    
    // Run migration
    console.log('2. Running data migration...');
    const migrateResponse = await fetch(`${API_URL}/migrate-data`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const migrateData = await migrateResponse.json();
    console.log('Migration response:', migrateData);
    
    if (migrateResponse.ok) {
      console.log('✅ Data migration completed successfully');
      
      // Verify data
      console.log('3. Verifying migrated data...');
      const projectsResponse = await fetch(`${API_URL}/projects`);
      const projects = await projectsResponse.json();
      console.log(`✅ Projects: ${projects.length} found`);
      
      const aiResponse = await fetch(`${API_URL}/ai-projects`);
      const aiProjects = await aiResponse.json();
      console.log(`✅ AI Projects: ${aiProjects.length} found`);
      
      const blogsResponse = await fetch(`${API_URL}/blogs`);
      const blogs = await blogsResponse.json();
      console.log(`✅ Blogs: ${blogs.length} found`);
      
    } else {
      console.error('❌ Migration failed:', migrateData);
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

migrateData();