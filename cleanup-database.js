const { Pool } = require('pg');

// Get DATABASE_URL from environment or prompt user
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://portfolio_user:TLZscNkm43wNfGKRLWVE5ses0OH7yBSE@dpg-d4i0hsadbo4c73bnpiu0-a.oregon-postgres.render.com/portfolio_ua14';

if (DATABASE_URL === 'postgresql://username:password@host:port/database') {
  console.log('❌ Please set DATABASE_URL environment variable or update the script with your database URL');
  console.log('Example: DATABASE_URL="your-postgres-url" node cleanup-database.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...');
  
  try {
    // Check current counts
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects');
    const aiProjectsCount = await pool.query('SELECT COUNT(*) FROM ai_projects');
    const blogsCount = await pool.query('SELECT COUNT(*) FROM blogs');
    
    console.log(`📊 Current counts:`);
    console.log(`   Projects: ${projectsCount.rows[0].count}`);
    console.log(`   AI Projects: ${aiProjectsCount.rows[0].count}`);
    console.log(`   Blogs: ${blogsCount.rows[0].count}`);
    
    // Clean up projects
    console.log('🗑️  Cleaning up duplicate projects...');
    await pool.query(`
      DELETE FROM projects 
      WHERE id NOT IN (
        SELECT DISTINCT ON (name) id 
        FROM projects 
        ORDER BY name, created_at DESC
      )
    `);
    
    // Clean up AI projects
    console.log('🗑️  Cleaning up duplicate AI projects...');
    await pool.query(`
      DELETE FROM ai_projects 
      WHERE id NOT IN (
        SELECT DISTINCT ON (use_case) id 
        FROM ai_projects 
        ORDER BY use_case, created_at DESC
      )
    `);
    
    // Clean up blogs
    console.log('🗑️  Cleaning up duplicate blogs...');
    await pool.query(`
      DELETE FROM blogs 
      WHERE id NOT IN (
        SELECT DISTINCT ON (title) id 
        FROM blogs 
        ORDER BY title, created_at DESC
      )
    `);
    
    // Check final counts
    const finalProjectsCount = await pool.query('SELECT COUNT(*) FROM projects');
    const finalAiProjectsCount = await pool.query('SELECT COUNT(*) FROM ai_projects');
    const finalBlogsCount = await pool.query('SELECT COUNT(*) FROM blogs');
    
    console.log('✅ Cleanup completed!');
    console.log(`📈 Final counts:`);
    console.log(`   Projects: ${finalProjectsCount.rows[0].count}`);
    console.log(`   AI Projects: ${finalAiProjectsCount.rows[0].count}`);
    console.log(`   Blogs: ${finalBlogsCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  } finally {
    await pool.end();
  }
}

cleanupDatabase();