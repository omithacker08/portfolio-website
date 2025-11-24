const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());

// Database setup - PostgreSQL or SQLite
let db;
let isPostgreSQL = false;

if (process.env.DATABASE_URL) {
  // Use PostgreSQL in production
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  db = pool;
  isPostgreSQL = true;
  console.log('Using PostgreSQL database');
} else {
  // Use SQLite in development
  db = new sqlite3.Database('./portfolio.db');
  isPostgreSQL = false;
  console.log('Using SQLite database');
}

// Database query wrapper
const dbQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgreSQL) {
      db.query(query, params, (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      });
    } else {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgreSQL) {
      db.query(query, params, (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0] || null);
      });
    } else {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    }
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (isPostgreSQL) {
      db.query(query, params, (err, result) => {
        if (err) reject(err);
        else resolve({ changes: result.rowCount, lastID: result.insertId });
      });
    } else {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, lastID: this.lastID });
      });
    }
  });
};

// Initialize database
const initializeDatabase = async () => {
  if (process.env.DATABASE_URL) {
    // PostgreSQL initialization
    try {
      await db.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS home_content (
        id SERIAL PRIMARY KEY,
        hero_name TEXT DEFAULT 'Om Thacker',
        hero_title TEXT DEFAULT 'I build Software solutions that matter',
        hero_subtitle TEXT,
        hero_stats TEXT,
        about_preview TEXT,
        cta_title TEXT DEFAULT 'Let us work together',
        cta_subtitle TEXT,
        profile_name TEXT DEFAULT 'Om Thacker',
        profile_status TEXT DEFAULT 'Available for freelance',
        profile_tech_stack TEXT DEFAULT 'React, Node.js, Python, Java, Spring Boot',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS site_config (
        id INTEGER PRIMARY KEY,
        site_name TEXT DEFAULT 'Portfolio Website',
        tagline TEXT DEFAULT 'Building Amazing Digital Experiences',
        logo_url TEXT,
        primary_color TEXT DEFAULT '#007AFF',
        secondary_color TEXT DEFAULT '#5856D6',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        tags TEXT,
        image_url TEXT,
        author_id INTEGER,
        is_draft INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT NOT NULL,
        technologies TEXT NOT NULL,
        problem_statement TEXT NOT NULL,
        solution_summary TEXT,
        benefits TEXT,
        image_url TEXT,
        video_url TEXT,
        author_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS ai_projects (
        id SERIAL PRIMARY KEY,
        use_case TEXT NOT NULL,
        benefits TEXT NOT NULL,
        domain TEXT NOT NULL,
        cost TEXT,
        problem_statement TEXT NOT NULL,
        author_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT,
        profession TEXT,
        summary TEXT,
        email TEXT,
        phone TEXT,
        location TEXT,
        linkedin TEXT,
        website TEXT,
        education TEXT,
        experience TEXT,
        technologies TEXT,
        ai_skills TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        subscribed INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS blog_comments (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        approved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      await db.query(`CREATE TABLE IF NOT EXISTS blog_likes (
        id SERIAL PRIMARY KEY,
        blog_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      )`);
      
      // Insert admin user
      const adminPassword = bcrypt.hashSync('admin123', 10);
      await db.query(`INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`, 
        ['Admin', 'admin@example.com', adminPassword, 'admin']);
      
      // Insert home content
      await db.query(`INSERT INTO home_content (id, hero_name, hero_title, hero_subtitle, hero_stats, about_preview, cta_title, cta_subtitle, profile_name, profile_status, profile_tech_stack) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO UPDATE SET hero_name = $2, hero_title = $3, profile_name = $9, profile_status = $10, profile_tech_stack = $11`, 
        [1, 'Om Thacker', 'I build Software solutions that matter', 'Full-stack developer passionate about creating innovative solutions with modern technologies.', 
        '[{"number":"50+","label":"Projects Built"},{"number":"12+","label":"Years Experience"},{"number":"25+","label":"Happy Clients"}]', 
        'I am a passionate full-stack developer with a love for creating beautiful, functional, and user-friendly applications.', 
        'Let us work together', 
        'I am always interested in hearing about new projects and opportunities.',
        'Om Thacker', 'Available for freelance', 'React, Node.js, Python, Java, Spring Boot'
        ]);
        
      // Insert site config
      await db.query(`INSERT INTO site_config (id, site_name, tagline, primary_color, secondary_color) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`, 
        [1, 'Portfolio Website', 'Building Amazing Digital Experiences', '#007AFF', '#5856D6']);
        
      // Insert sample blog data
      await db.query(`INSERT INTO blogs (id, title, content, excerpt, tags, author_id, is_draft) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`, 
        [1, 'Test Blog Post', 'This is a test blog post to check if the like functionality works properly. It has enough content to meet the minimum requirements.', 'A test blog post', 'test,blog', 1, 0]);
        
      // Insert sample projects data
      await db.query(`INSERT INTO projects (id, name, domain, technologies, problem_statement, solution_summary, benefits, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`, 
        [1, 'Procure to Pay', 'ERP', 'Java, Struts framework, Javascript, CSS, HTML, Dojo, SQL', 'Procurement management system to manage the procurement life cycle of Large companies.', 'Procurement management system to manage the procurement life cycle of Large companies.', 'Procurement management system to manage the procurement life cycle of Large companies.', 1]);
        
      await db.query(`INSERT INTO projects (id, name, domain, technologies, problem_statement, solution_summary, benefits, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`, 
        [2, 'Asset Management product', 'Web', 'Java, Spring framework, Javascript, CSS, SQL', 'Asset management need for enterprise integrated with Procurement and expense manangement systems', 'Asset management need for enterprise integrated with Procurement and expense manangement systems', '1. Easy-to-use UI for tracking expenses\n2. Account entries for Tally and other such tools\n3. Clear reporting and analytics\n4. Audit logs\n5. Customizable workflows\n6. Role-based approval system', 1]);
        
      await db.query(`INSERT INTO projects (id, name, domain, technologies, problem_statement, solution_summary, benefits, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`, 
        [3, 'Expense Management System', 'ERP', 'Spring framework, Hibernate, SQL, Javascript', 'Large enterprises needed a way to track their expense that can not only help create expense data but also offer a way to integrate with third-party systems, generate account entries, generate audit logs, and offer a clear reporting and analytics.', 'This product was created for enterprises to manage their expenses in a better way. It provided a very customizable use-cases that can cater any type of requirement. Some of the key features are its reporting and analytics feature, Role-based approval system, customizable workflows and its easy-to-use UI.', '1. Easy to use UI for tracking expenses\n2. Account entries for Tally and other such tools\n3. Clear reporting and anaytics\n4. Audit logs\n5. Customizable workflows\n6. Role-based approval system', 1]);
        
      // Insert sample AI project data
      await db.query(`INSERT INTO ai_projects (id, use_case, benefits, domain, cost, problem_statement, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`, 
        [1, 'Recommendation Engine', 'Recommendation engine for the sales team to contact customers with high probability of investing in the retirement funds', 'Finance', 'Low ($1K - $10K)', 'To increase the adoption of the Retireplus Product by the consumers and add more funds in it, Sales team needs some assistance where they can target the consumers who has high probability of investing the funds in it. There is a need of Recommendation engine which will help the team for the same.', 1]);
        
      console.log('PostgreSQL database initialized with sample data');
    } catch (error) {
      console.error('PostgreSQL initialization error:', error);
    }
  } else {
    // SQLite initialization (keep original code)
    db.serialize(() => {
      // Original SQLite code here
    });
  }
};

initializeDatabase();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = isPostgreSQL ? 'SELECT * FROM users WHERE email = $1' : 'SELECT * FROM users WHERE email = ?';
    const user = await dbGet(query, [email]);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Resume
app.get('/api/resume/:userId', (req, res) => {
  db.get('SELECT * FROM resumes WHERE user_id = ?', [req.params.userId], (err, resume) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (resume) {
      resume.education = JSON.parse(resume.education || '[]');
      resume.experience = JSON.parse(resume.experience || '[]');
      resume.technologies = JSON.parse(resume.technologies || '[]');
      resume.aiSkills = JSON.parse(resume.ai_skills || '[]');
    }
    res.json(resume || {});
  });
});

app.post('/api/resume', authenticateToken, (req, res) => {
  const { name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, aiSkills } = req.body;
  db.run(`INSERT OR REPLACE INTO resumes (user_id, name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, ai_skills, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`, 
    [req.user.id, name, profession, summary, email, phone, location, linkedin, website, JSON.stringify(education || []), JSON.stringify(experience || []), JSON.stringify(technologies || []), JSON.stringify(aiSkills || [])], 
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Resume updated successfully' });
    });
});

// Newsletter
app.get('/api/newsletter/subscribers', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  db.all('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC', (err, subscribers) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(subscribers);
  });
});

// Home Content
app.get('/api/home', async (req, res) => {
  try {
    const home = await dbGet('SELECT * FROM home_content WHERE id = 1');
    if (home && home.hero_stats) {
      home.hero_stats = JSON.parse(home.hero_stats);
    }
    res.json(home || {});
  } catch (err) {
    console.error('Database error loading home content:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/home', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { heroName, heroTitle, heroSubtitle, heroStats, aboutPreview, ctaTitle, ctaSubtitle, profileName, profileStatus, profileTechStack } = req.body;
  
  try {
    const updateQuery = isPostgreSQL 
      ? `UPDATE home_content SET hero_name = $1, hero_title = $2, hero_subtitle = $3, hero_stats = $4, about_preview = $5, cta_title = $6, cta_subtitle = $7, profile_name = $8, profile_status = $9, profile_tech_stack = $10, updated_at = CURRENT_TIMESTAMP WHERE id = 1`
      : `UPDATE home_content SET hero_name = ?, hero_title = ?, hero_subtitle = ?, hero_stats = ?, about_preview = ?, cta_title = ?, cta_subtitle = ?, profile_name = ?, profile_status = ?, profile_tech_stack = ?, updated_at = datetime('now') WHERE id = 1`;
    
    await dbRun(updateQuery, [heroName, heroTitle, heroSubtitle, JSON.stringify(heroStats || []), aboutPreview, ctaTitle, ctaSubtitle, profileName, profileStatus, profileTechStack]);
    res.json({ message: 'Home content updated successfully' });
  } catch (err) {
    console.error('Database error updating home content:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await dbQuery('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(projects);
  } catch (err) {
    console.error('Database error loading projects:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  const { name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl } = req.body;
  if (!name || !domain || !technologies || !problemStatement) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    const result = await dbRun(`INSERT INTO projects (name, domain, technologies, problem_statement, solution_summary, benefits, image_url, video_url, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl, req.user.id]);
    res.json({ id: result.lastID, message: 'Project created successfully' });
  } catch (err) {
    console.error('Database error creating project:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const { name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl } = req.body;
  db.run(`UPDATE projects SET name = ?, domain = ?, technologies = ?, problem_statement = ?, solution_summary = ?, benefits = ?, image_url = ?, video_url = ? WHERE id = ?`, 
    [name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl, req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Project updated successfully' });
    });
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM projects WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Project deleted successfully' });
  });
});

// AI Projects
app.get('/api/ai-projects', (req, res) => {
  db.all('SELECT * FROM ai_projects ORDER BY created_at DESC', (err, projects) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(projects);
  });
});

app.post('/api/ai-projects', authenticateToken, (req, res) => {
  const { useCase, benefits, domain, cost, problemStatement } = req.body;
  if (!useCase || !benefits || !domain || !problemStatement) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  db.run(`INSERT INTO ai_projects (use_case, benefits, domain, cost, problem_statement, author_id) VALUES (?, ?, ?, ?, ?, ?)`, 
    [useCase, benefits, domain, cost, problemStatement, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, message: 'AI project created successfully' });
    });
});

app.put('/api/ai-projects/:id', authenticateToken, (req, res) => {
  const { useCase, benefits, domain, cost, problemStatement } = req.body;
  db.run(`UPDATE ai_projects SET use_case = ?, benefits = ?, domain = ?, cost = ?, problem_statement = ? WHERE id = ?`, 
    [useCase, benefits, domain, cost, problemStatement, req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'AI project updated successfully' });
    });
});

app.delete('/api/ai-projects/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM ai_projects WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'AI project deleted successfully' });
  });
});

// Contact Messages
app.get('/api/contact/messages', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  db.all('SELECT * FROM contact_messages ORDER BY created_at DESC', (err, messages) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(messages);
  });
});

// Blogs
app.get('/api/blogs', (req, res) => {
  db.all(`SELECT b.*, u.name as author_name, 
          (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as likes 
          FROM blogs b 
          LEFT JOIN users u ON b.author_id = u.id 
          WHERE b.is_draft = 0 
          ORDER BY b.created_at DESC`, (err, blogs) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(blogs);
  });
});

app.post('/api/blogs', authenticateToken, (req, res) => {
  const { title, content, excerpt, tags, imageUrl, isDraft } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  db.run(`INSERT INTO blogs (title, content, excerpt, tags, image_url, author_id, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [title, content, excerpt, tags, imageUrl, req.user.id, isDraft || 0], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, message: 'Blog created successfully' });
    });
});

// Blog Comments
app.get('/api/blogs/:id/comments', (req, res) => {
  db.all('SELECT c.*, u.name as author_name FROM blog_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.blog_id = ? AND c.approved = 1 ORDER BY c.created_at ASC', [req.params.id], (err, comments) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(comments);
  });
});

app.post('/api/blogs/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  db.run('INSERT INTO blog_comments (blog_id, user_id, content) VALUES (?, ?, ?)', [req.params.id, req.user.id, content], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: this.lastID, message: 'Comment added successfully' });
  });
});

// Blog Likes
app.post('/api/blogs/:id/like', authenticateToken, (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.id;
  
  db.get('SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?', [blogId, userId], (err, existing) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    if (existing) {
      db.run('DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?', [blogId, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ liked: false, message: 'Like removed' });
      });
    } else {
      db.run('INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)', [blogId, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ liked: true, message: 'Blog liked' });
      });
    }
  });
});

app.get('/api/blogs/:id/likes', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ count: result.count });
  });
});

// Newsletter Subscribe
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  db.run('INSERT OR REPLACE INTO newsletter_subscribers (email, name, subscribed) VALUES (?, ?, 1)', [email, name || ''], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Successfully subscribed to newsletter' });
  });
});

// Contact Messages
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  db.run('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message], function(err) {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ id: this.lastID, message: 'Message sent successfully' });
  });
});

// Site Config
app.get('/api/config', async (req, res) => {
  console.log('GET /api/config called');
  try {
    const config = await dbGet('SELECT * FROM site_config WHERE id = 1');
    if (!config) {
      console.log('No config found in database, returning defaults');
      return res.json({
        site_name: 'Portfolio Website',
        tagline: 'Building Amazing Digital Experiences',
        primary_color: '#007AFF',
        secondary_color: '#5856D6'
      });
    }
    console.log('Loaded config from database:', config);
    res.json(config);
  } catch (err) {
    console.log('Database error loading config:', err);
    res.json({
      site_name: 'Portfolio Website',
      tagline: 'Building Amazing Digital Experiences',
      primary_color: '#007AFF',
      secondary_color: '#5856D6'
    });
  }
});

// Config endpoint with database save
app.put('/api/config', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  console.log('PUT /api/config called with:', req.body);
  const { siteName, tagline, logoUrl, colors } = req.body;
  
  try {
    // Try to update first
    const updateQuery = isPostgreSQL 
      ? `UPDATE site_config SET site_name = $1, tagline = $2, logo_url = $3, primary_color = $4, secondary_color = $5, updated_at = CURRENT_TIMESTAMP WHERE id = 1`
      : `UPDATE site_config SET site_name = ?, tagline = ?, logo_url = ?, primary_color = ?, secondary_color = ?, updated_at = datetime('now') WHERE id = 1`;
    
    const result = await dbRun(updateQuery, [
      siteName || 'Portfolio Website', 
      tagline || 'Building Amazing Digital Experiences', 
      logoUrl || '', 
      colors?.primary || '#007AFF', 
      colors?.secondary || '#5856D6'
    ]);
    
    if (result.changes === 0) {
      // No rows updated, try insert
      const insertQuery = isPostgreSQL
        ? `INSERT INTO site_config (id, site_name, tagline, logo_url, primary_color, secondary_color, updated_at) VALUES (1, $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`
        : `INSERT INTO site_config (id, site_name, tagline, logo_url, primary_color, secondary_color, updated_at) VALUES (1, ?, ?, ?, ?, ?, datetime('now'))`;
      
      await dbRun(insertQuery, [
        siteName || 'Portfolio Website', 
        tagline || 'Building Amazing Digital Experiences', 
        logoUrl || '', 
        colors?.primary || '#007AFF', 
        colors?.secondary || '#5856D6'
      ]);
      console.log('Config inserted successfully');
    } else {
      console.log('Config updated successfully:', result.changes, 'rows affected');
    }
    
    res.json({ message: 'Configuration updated successfully' });
  } catch (err) {
    console.error('Database operation error:', err);
    res.status(500).json({ error: 'Database operation failed: ' + err.message });
  }
});

// Test endpoint to verify database operations
app.get('/api/config/test', (req, res) => {
  console.log('Testing database operations...');
  
  // Test table creation
  db.run(`CREATE TABLE IF NOT EXISTS site_config_test (
    id INTEGER PRIMARY KEY,
    test_data TEXT
  )`, (err) => {
    if (err) {
      console.error('Test table creation failed:', err);
      return res.json({ error: 'Table creation failed', details: err.message });
    }
    
    // Test insert
    db.run(`INSERT OR REPLACE INTO site_config_test (id, test_data) VALUES (1, ?)`, ['test_value'], (insertErr) => {
      if (insertErr) {
        console.error('Test insert failed:', insertErr);
        return res.json({ error: 'Insert failed', details: insertErr.message });
      }
      
      // Test select
      db.get('SELECT * FROM site_config_test WHERE id = 1', (selectErr, row) => {
        if (selectErr) {
          console.error('Test select failed:', selectErr);
          return res.json({ error: 'Select failed', details: selectErr.message });
        }
        
        console.log('Database test successful:', row);
        res.json({ success: true, message: 'Database operations working', data: row });
      });
    });
  });
});

// About Content (basic)
app.get('/api/about', (req, res) => {
  res.json({
    job_title: 'Professional Developer',
    job_icon: '💻',
    who_i_am: 'Passionate developer with expertise in modern technologies',
    what_i_do: 'Building innovative solutions and user-friendly applications',
    technical_skills: []
  });
});

// Users endpoint for admin
app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const users = await dbQuery('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    console.error('Database error loading users:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- Auth: POST /api/auth/login');
  console.log('- Blogs: GET/POST /api/blogs, GET/POST /api/blogs/:id/comments, POST /api/blogs/:id/like');
  console.log('- Projects: GET/POST/PUT/DELETE /api/projects');
  console.log('- AI Projects: GET/POST/PUT/DELETE /api/ai-projects');
  console.log('- Resume: GET/POST /api/resume');
  console.log('- Home: GET/PUT /api/home');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} busy, trying ${PORT + 1}`);
    app.listen(PORT + 1, () => {
      console.log(`🚀 Simple Server running on http://localhost:${PORT + 1}`);
    });
  }
});