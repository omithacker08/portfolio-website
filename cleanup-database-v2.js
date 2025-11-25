const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://portfolio_user:TLZscNkm43wNfGKRLWVE5ses0OH7yBSE@dpg-d4i0hsadbo4c73bnpiu0-a.oregon-postgres.render.com/portfolio_ua14';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanupDatabase() {
  console.log('🧹 Starting enhanced database cleanup...');
  
  try {
    // Check current data
    const projects = await pool.query('SELECT id, name, created_at FROM projects ORDER BY name, created_at DESC');
    const aiProjects = await pool.query('SELECT id, use_case, created_at FROM ai_projects ORDER BY use_case, created_at DESC');
    const blogs = await pool.query('SELECT id, title, created_at FROM blogs ORDER BY title, created_at DESC');
    
    console.log(`📊 Current counts:`);
    console.log(`   Projects: ${projects.rows.length}`);
    console.log(`   AI Projects: ${aiProjects.rows.length}`);
    console.log(`   Blogs: ${blogs.rows.length}`);
    
    // Clean projects - keep only the latest of each unique name
    const uniqueProjects = new Map();
    projects.rows.forEach(p => {
      if (!uniqueProjects.has(p.name) || new Date(p.created_at) > new Date(uniqueProjects.get(p.name).created_at)) {
        uniqueProjects.set(p.name, p);
      }
    });
    
    const projectsToKeep = Array.from(uniqueProjects.values()).map(p => p.id);
    const projectsToDelete = projects.rows.filter(p => !projectsToKeep.includes(p.id));
    
    console.log(`🗑️  Deleting ${projectsToDelete.length} duplicate projects...`);
    for (const project of projectsToDelete) {
      await pool.query('DELETE FROM projects WHERE id = $1', [project.id]);
      console.log(`   Deleted: ${project.name} (ID: ${project.id})`);
    }
    
    // Clean AI projects
    const uniqueAiProjects = new Map();
    aiProjects.rows.forEach(p => {
      if (!uniqueAiProjects.has(p.use_case) || new Date(p.created_at) > new Date(uniqueAiProjects.get(p.use_case).created_at)) {
        uniqueAiProjects.set(p.use_case, p);
      }
    });
    
    const aiProjectsToKeep = Array.from(uniqueAiProjects.values()).map(p => p.id);
    const aiProjectsToDelete = aiProjects.rows.filter(p => !aiProjectsToKeep.includes(p.id));
    
    console.log(`🗑️  Deleting ${aiProjectsToDelete.length} duplicate AI projects...`);
    for (const project of aiProjectsToDelete) {
      await pool.query('DELETE FROM ai_projects WHERE id = $1', [project.id]);
      console.log(`   Deleted: ${project.use_case} (ID: ${project.id})`);
    }
    
    // Clean blogs
    const uniqueBlogs = new Map();
    blogs.rows.forEach(b => {
      if (!uniqueBlogs.has(b.title) || new Date(b.created_at) > new Date(uniqueBlogs.get(b.title).created_at)) {
        uniqueBlogs.set(b.title, b);
      }
    });
    
    const blogsToKeep = Array.from(uniqueBlogs.values()).map(b => b.id);
    const blogsToDelete = blogs.rows.filter(b => !blogsToKeep.includes(b.id));
    
    console.log(`🗑️  Deleting ${blogsToDelete.length} duplicate blogs...`);
    for (const blog of blogsToDelete) {
      await pool.query('DELETE FROM blogs WHERE id = $1', [blog.id]);
      console.log(`   Deleted: ${blog.title} (ID: ${blog.id})`);
    }
    
    // Final verification
    const finalProjects = await pool.query('SELECT COUNT(*) FROM projects');
    const finalAiProjects = await pool.query('SELECT COUNT(*) FROM ai_projects');
    const finalBlogs = await pool.query('SELECT COUNT(*) FROM blogs');
    
    console.log('✅ Enhanced cleanup completed!');
    console.log(`📈 Final counts:`);
    console.log(`   Projects: ${finalProjects.rows[0].count}`);
    console.log(`   AI Projects: ${finalAiProjects.rows[0].count}`);
    console.log(`   Blogs: ${finalBlogs.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  } finally {
    await pool.end();
  }
}

cleanupDatabase();