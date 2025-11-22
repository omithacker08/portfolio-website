const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./portfolio.db');

console.log('=== PORTFOLIO DATABASE VIEWER ===\n');

// View all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('📋 TABLES:');
  tables.forEach(table => console.log(`  - ${table.name}`));
  console.log('');
  
  // View users
  db.all("SELECT id, name, email, role, created_at FROM users", (err, users) => {
    console.log('👥 USERS:');
    users.forEach(user => {
      console.log(`  ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('');
    
    // View site config
    db.get("SELECT * FROM site_config WHERE id = 1", (err, config) => {
      console.log('⚙️ SITE CONFIG:');
      if (config) {
        console.log(`  Site Name: ${config.site_name}`);
        console.log(`  Tagline: ${config.tagline}`);
        console.log(`  Primary Color: ${config.primary_color}`);
        console.log(`  Secondary Color: ${config.secondary_color}`);
      }
      console.log('');
      
      // View blogs
      db.all("SELECT id, title, author_id, approved, created_at FROM blogs", (err, blogs) => {
        console.log('📝 BLOGS:');
        if (blogs.length === 0) {
          console.log('  No blogs found');
        } else {
          blogs.forEach(blog => {
            console.log(`  ${blog.id}: ${blog.title} - ${blog.approved ? 'Approved' : 'Pending'}`);
          });
        }
        console.log('');
        
        // View projects
        db.all("SELECT id, name, domain, author_id, created_at FROM projects", (err, projects) => {
          console.log('🚀 PROJECTS:');
          if (projects.length === 0) {
            console.log('  No projects found');
          } else {
            projects.forEach(project => {
              console.log(`  ${project.id}: ${project.name} (${project.domain})`);
            });
          }
          console.log('');
          
          // View AI projects
          db.all("SELECT id, use_case, domain, author_id, created_at FROM ai_projects", (err, aiProjects) => {
            console.log('🤖 AI PROJECTS:');
            if (aiProjects.length === 0) {
              console.log('  No AI projects found');
            } else {
              aiProjects.forEach(project => {
                console.log(`  ${project.id}: ${project.use_case} (${project.domain})`);
              });
            }
            console.log('');
            
            db.close();
          });
        });
      });
    });
  });
});