const axios = require('axios');

const API_BASE = 'https://portfolio-backend-qxhg.onrender.com/api';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function cleanupDuplicates() {
  console.log('🧹 Starting database cleanup...');
  
  const token = await login();
  if (!token) {
    console.error('❌ Failed to authenticate');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Get all projects
    console.log('📊 Fetching projects...');
    const projectsResponse = await axios.get(`${API_BASE}/projects`);
    const projects = projectsResponse.data;
    
    // Group by name and keep only the latest
    const uniqueProjects = {};
    projects.forEach(project => {
      if (!uniqueProjects[project.name] || new Date(project.created_at) > new Date(uniqueProjects[project.name].created_at)) {
        uniqueProjects[project.name] = project;
      }
    });
    
    // Delete duplicates
    const projectsToDelete = projects.filter(p => !Object.values(uniqueProjects).find(up => up.id === p.id));
    console.log(`🗑️  Deleting ${projectsToDelete.length} duplicate projects...`);
    
    for (const project of projectsToDelete) {
      try {
        await axios.delete(`${API_BASE}/projects/${project.id}`, { headers });
        console.log(`   ✅ Deleted project: ${project.name} (ID: ${project.id})`);
      } catch (error) {
        console.log(`   ❌ Failed to delete project ${project.id}:`, error.response?.data?.error || error.message);
      }
    }
    
    // Get all AI projects
    console.log('📊 Fetching AI projects...');
    const aiProjectsResponse = await axios.get(`${API_BASE}/ai-projects`);
    const aiProjects = aiProjectsResponse.data;
    
    // Group by use_case and keep only the latest
    const uniqueAiProjects = {};
    aiProjects.forEach(project => {
      if (!uniqueAiProjects[project.use_case] || new Date(project.created_at) > new Date(uniqueAiProjects[project.use_case].created_at)) {
        uniqueAiProjects[project.use_case] = project;
      }
    });
    
    // Delete duplicates
    const aiProjectsToDelete = aiProjects.filter(p => !Object.values(uniqueAiProjects).find(up => up.id === p.id));
    console.log(`🗑️  Deleting ${aiProjectsToDelete.length} duplicate AI projects...`);
    
    for (const project of aiProjectsToDelete) {
      try {
        await axios.delete(`${API_BASE}/ai-projects/${project.id}`, { headers });
        console.log(`   ✅ Deleted AI project: ${project.use_case} (ID: ${project.id})`);
      } catch (error) {
        console.log(`   ❌ Failed to delete AI project ${project.id}:`, error.response?.data?.error || error.message);
      }
    }
    
    // Get all blogs
    console.log('📊 Fetching blogs...');
    const blogsResponse = await axios.get(`${API_BASE}/blogs`);
    const blogs = blogsResponse.data;
    
    // Group by title and keep only the latest
    const uniqueBlogs = {};
    blogs.forEach(blog => {
      if (!uniqueBlogs[blog.title] || new Date(blog.created_at) > new Date(uniqueBlogs[blog.title].created_at)) {
        uniqueBlogs[blog.title] = blog;
      }
    });
    
    // Delete duplicates (we need admin endpoint for this)
    const blogsToDelete = blogs.filter(b => !Object.values(uniqueBlogs).find(ub => ub.id === b.id));
    console.log(`🗑️  Found ${blogsToDelete.length} duplicate blogs (need admin endpoint to delete)`);
    
    console.log('✅ Cleanup completed!');
    console.log(`📈 Final counts:`);
    console.log(`   Projects: ${Object.keys(uniqueProjects).length}`);
    console.log(`   AI Projects: ${Object.keys(uniqueAiProjects).length}`);
    console.log(`   Blogs: ${Object.keys(uniqueBlogs).length} (duplicates found but not deleted - need admin endpoint)`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.response?.data || error.message);
  }
}

// Run the cleanup
cleanupDuplicates();