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
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  });
  
  // Test connection
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error acquiring client', err.stack);
    } else {
      console.log('PostgreSQL connected successfully');
      release();
    }
  });
  
  db = pool;
  isPostgreSQL = true;
  console.log('Using PostgreSQL database with connection pooling');
} else {
  // Use SQLite in development
  db = new sqlite3.Database('./portfolio.db');
  isPostgreSQL = false;
  console.log('Using SQLite database');
}

// Database query wrapper
const dbQuery = async (query, params = [], retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (isPostgreSQL) {
        const result = await db.query(query, params);
        return result.rows;
      } else {
        return new Promise((resolve, reject) => {
          db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      }
    } catch (err) {
      console.error(`Database query attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const dbGet = async (query, params = [], retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (isPostgreSQL) {
        const result = await db.query(query, params);
        return result.rows[0] || null;
      } else {
        return new Promise((resolve, reject) => {
          db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
          });
        });
      }
    } catch (err) {
      console.error(`Database query attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const dbRun = async (query, params = [], retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (isPostgreSQL) {
        // For INSERT queries, add RETURNING id to get the inserted ID
        if (query.toLowerCase().includes('insert')) {
          const returningQuery = query + ' RETURNING id';
          const result = await db.query(returningQuery, params);
          return { changes: result.rowCount, lastID: result.rows[0]?.id };
        } else {
          const result = await db.query(query, params);
          return { changes: result.rowCount, lastID: null };
        }
      } else {
        return new Promise((resolve, reject) => {
          db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes, lastID: this.lastID });
          });
        });
      }
    } catch (err) {
      console.error(`Database run attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Initialize database tables only (no data insertion)
const initializeDatabase = async () => {
  if (process.env.DATABASE_URL) {
    // PostgreSQL table creation only
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
        content TEXT,
        social TEXT,
        seo TEXT,
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
      
      await db.query(`CREATE TABLE IF NOT EXISTS about_content (
        id INTEGER PRIMARY KEY,
        job_title TEXT DEFAULT 'Professional Developer',
        job_icon TEXT DEFAULT '💻',
        who_i_am TEXT,
        what_i_do TEXT,
        technical_skills TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
      
      console.log('PostgreSQL database tables initialized (no data insertion)');
    } catch (error) {
      console.error('PostgreSQL initialization error:', error);
    }
  } else {
    // SQLite table creation only
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS home_content (
        id INTEGER PRIMARY KEY,
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS site_config (
        id INTEGER PRIMARY KEY,
        site_name TEXT DEFAULT 'Portfolio Website',
        tagline TEXT DEFAULT 'Building Amazing Digital Experiences',
        logo_url TEXT,
        primary_color TEXT DEFAULT '#007AFF',
        secondary_color TEXT DEFAULT '#5856D6',
        content TEXT,
        social TEXT,
        seo TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        tags TEXT,
        image_url TEXT,
        author_id INTEGER,
        is_draft INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        domain TEXT NOT NULL,
        technologies TEXT NOT NULL,
        problem_statement TEXT NOT NULL,
        solution_summary TEXT,
        benefits TEXT,
        image_url TEXT,
        video_url TEXT,
        author_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS ai_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        use_case TEXT NOT NULL,
        benefits TEXT NOT NULL,
        domain TEXT NOT NULL,
        cost TEXT,
        problem_statement TEXT NOT NULL,
        author_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        subscribed INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS blog_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blog_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        approved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS blog_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blog_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blog_id, user_id)
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS about_content (
        id INTEGER PRIMARY KEY,
        job_title TEXT DEFAULT 'Professional Developer',
        job_icon TEXT DEFAULT '💻',
        who_i_am TEXT,
        what_i_do TEXT,
        technical_skills TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      console.log('SQLite database tables initialized (no data insertion)');
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
app.get('/api/resume/:userId', async (req, res) => {
  try {
    const query = isPostgreSQL ? 'SELECT * FROM resumes WHERE user_id = $1' : 'SELECT * FROM resumes WHERE user_id = ?';
    const resume = await dbGet(query, [req.params.userId]);
    if (resume) {
      const safeJsonParse = (data, fallback = []) => {
        if (!data) return fallback;
        if (typeof data === 'object') return data;
        if (typeof data === 'string' && data.startsWith('[object')) return fallback;
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error('JSON parse error:', e.message, 'Data:', data);
          return fallback;
        }
      };
      
      resume.education = safeJsonParse(resume.education, []);
      resume.experience = safeJsonParse(resume.experience, []);
      resume.technologies = safeJsonParse(resume.technologies, []);
      resume.skills = safeJsonParse(resume.technologies, []);
      resume.aiSkills = safeJsonParse(resume.ai_skills, []);
      resume.achievements = safeJsonParse(resume.ai_skills, []);
      resume.title = resume.profession;
    }
    res.json(resume || {});
  } catch (err) {
    console.error('Database error loading resume:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/resume', authenticateToken, async (req, res) => {
  const { name, title, profession, summary, email, phone, location, linkedin, website, education, experience, skills, technologies, achievements, aiSkills } = req.body;
  const finalTitle = title || profession;
  const finalSkills = skills || technologies || [];
  const finalAchievements = achievements || aiSkills || [];
  
  const safeStringify = (data) => {
    if (!data) return '[]';
    if (typeof data === 'string') return data;
    try {
      return JSON.stringify(data);
    } catch (e) {
      console.error('JSON stringify error:', e.message);
      return '[]';
    }
  };
  
  try {
    // First try to update existing record
    const updateQuery = isPostgreSQL 
      ? `UPDATE resumes SET name = $2, profession = $3, summary = $4, email = $5, phone = $6, location = $7, linkedin = $8, website = $9, education = $10, experience = $11, technologies = $12, ai_skills = $13, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`
      : `UPDATE resumes SET name = ?, profession = ?, summary = ?, email = ?, phone = ?, location = ?, linkedin = ?, website = ?, education = ?, experience = ?, technologies = ?, ai_skills = ?, updated_at = datetime('now') WHERE user_id = ?`;
    
    const result = await dbRun(updateQuery, [req.user.id, name, finalTitle, summary, email, phone, location, linkedin, website, safeStringify(education), safeStringify(experience), safeStringify(finalSkills), safeStringify(finalAchievements)]);
    
    // If no rows were updated, insert new record
    if (result.changes === 0) {
      const insertQuery = isPostgreSQL 
        ? `INSERT INTO resumes (user_id, name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, ai_skills, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)`
        : `INSERT INTO resumes (user_id, name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, ai_skills, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
      
      await dbRun(insertQuery, [req.user.id, name, finalTitle, summary, email, phone, location, linkedin, website, safeStringify(education), safeStringify(experience), safeStringify(finalSkills), safeStringify(finalAchievements)]);
    }
    
    res.json({ message: 'Resume updated successfully' });
  } catch (err) {
    console.error('Resume update error:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Newsletter
app.get('/api/newsletter/subscribers', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const subscribers = await dbQuery('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
    res.json(subscribers);
  } catch (err) {
    console.error('Database error loading newsletter subscribers:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Home Content
app.get('/api/home', async (req, res) => {
  try {
    const home = await dbGet('SELECT * FROM home_content WHERE id = 1');
    if (home && home.hero_stats) {
      try {
        home.hero_stats = JSON.parse(home.hero_stats);
      } catch (e) {
        home.hero_stats = [];
      }
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
    
    const result = await dbRun(updateQuery, [heroName, heroTitle, heroSubtitle, JSON.stringify(heroStats || []), aboutPreview, ctaTitle, ctaSubtitle, profileName, profileStatus, profileTechStack]);
    
    if (result.changes === 0) {
      const insertQuery = isPostgreSQL
        ? `INSERT INTO home_content (id, hero_name, hero_title, hero_subtitle, hero_stats, about_preview, cta_title, cta_subtitle, profile_name, profile_status, profile_tech_stack) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
        : `INSERT INTO home_content (id, hero_name, hero_title, hero_subtitle, hero_stats, about_preview, cta_title, cta_subtitle, profile_name, profile_status, profile_tech_stack) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await dbRun(insertQuery, [heroName, heroTitle, heroSubtitle, JSON.stringify(heroStats || []), aboutPreview, ctaTitle, ctaSubtitle, profileName, profileStatus, profileTechStack]);
    }
    res.json({ message: 'Home content updated successfully' });
  } catch (err) {
    console.error('Database error updating home content:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
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
    const query = isPostgreSQL 
      ? `INSERT INTO projects (name, domain, technologies, problem_statement, solution_summary, benefits, image_url, video_url, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
      : `INSERT INTO projects (name, domain, technologies, problem_statement, solution_summary, benefits, image_url, video_url, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const result = await dbRun(query, [name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl, req.user.id]);
    res.json({ id: result.lastID, message: 'Project created successfully' });
  } catch (err) {
    console.error('Database error creating project:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  const { name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl } = req.body;
  try {
    const query = isPostgreSQL 
      ? `UPDATE projects SET name = $1, domain = $2, technologies = $3, problem_statement = $4, solution_summary = $5, benefits = $6, image_url = $7, video_url = $8 WHERE id = $9`
      : `UPDATE projects SET name = ?, domain = ?, technologies = ?, problem_statement = ?, solution_summary = ?, benefits = ?, image_url = ?, video_url = ? WHERE id = ?`;
    await dbRun(query, [name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl, req.params.id]);
    res.json({ message: 'Project updated successfully' });
  } catch (err) {
    console.error('Database error updating project:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const query = isPostgreSQL ? 'DELETE FROM projects WHERE id = $1' : 'DELETE FROM projects WHERE id = ?';
    await dbRun(query, [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Database error deleting project:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// AI Projects
app.get('/api/ai-projects', async (req, res) => {
  try {
    const projects = await dbQuery('SELECT * FROM ai_projects ORDER BY created_at DESC');
    res.json(projects);
  } catch (err) {
    console.error('Database error loading AI projects:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/ai-projects', authenticateToken, async (req, res) => {
  const { useCase, benefits, domain, cost, problemStatement } = req.body;
  if (!useCase || !benefits || !domain || !problemStatement) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    const query = isPostgreSQL 
      ? `INSERT INTO ai_projects (use_case, benefits, domain, cost, problem_statement, author_id) VALUES ($1, $2, $3, $4, $5, $6)`
      : `INSERT INTO ai_projects (use_case, benefits, domain, cost, problem_statement, author_id) VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await dbRun(query, [useCase, benefits, domain, cost, problemStatement, req.user.id]);
    res.json({ id: result.lastID, message: 'AI project created successfully' });
  } catch (err) {
    console.error('Database error creating AI project:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.put('/api/ai-projects/:id', authenticateToken, async (req, res) => {
  const { useCase, benefits, domain, cost, problemStatement } = req.body;
  try {
    const query = isPostgreSQL 
      ? `UPDATE ai_projects SET use_case = $1, benefits = $2, domain = $3, cost = $4, problem_statement = $5 WHERE id = $6`
      : `UPDATE ai_projects SET use_case = ?, benefits = ?, domain = ?, cost = ?, problem_statement = ? WHERE id = ?`;
    await dbRun(query, [useCase, benefits, domain, cost, problemStatement, req.params.id]);
    res.json({ message: 'AI project updated successfully' });
  } catch (err) {
    console.error('Database error updating AI project:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.delete('/api/ai-projects/:id', authenticateToken, async (req, res) => {
  try {
    const query = isPostgreSQL ? 'DELETE FROM ai_projects WHERE id = $1' : 'DELETE FROM ai_projects WHERE id = ?';
    await dbRun(query, [req.params.id]);
    res.json({ message: 'AI project deleted successfully' });
  } catch (err) {
    console.error('Database error deleting AI project:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Contact Messages
app.get('/api/contact/messages', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const messages = await dbQuery('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(messages);
  } catch (err) {
    console.error('Database error loading contact messages:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await dbQuery(`SELECT b.*, u.name as author_name, 
            (SELECT COUNT(*) FROM blog_likes WHERE blog_id = b.id) as likes 
            FROM blogs b 
            LEFT JOIN users u ON b.author_id = u.id 
            WHERE b.is_draft = 0 
            ORDER BY b.created_at DESC`);
    res.json(blogs);
  } catch (err) {
    console.error('Database error loading blogs:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/blogs', authenticateToken, async (req, res) => {
  const { title, content, excerpt, tags, imageUrl, isDraft } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  try {
    const query = isPostgreSQL 
      ? `INSERT INTO blogs (title, content, excerpt, tags, image_url, author_id, is_draft) VALUES ($1, $2, $3, $4, $5, $6, $7)`
      : `INSERT INTO blogs (title, content, excerpt, tags, image_url, author_id, is_draft) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await dbRun(query, [title, content, excerpt, tags, imageUrl, req.user.id, isDraft ? 1 : 0]);
    res.json({ id: result.lastID, message: 'Blog created successfully' });
  } catch (err) {
    console.error('Database error creating blog:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.put('/api/blogs/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { title, content, excerpt, tags, imageUrl, isDraft } = req.body;
  try {
    const query = isPostgreSQL 
      ? `UPDATE blogs SET title = $1, content = $2, excerpt = $3, tags = $4, image_url = $5, is_draft = $6 WHERE id = $7`
      : `UPDATE blogs SET title = ?, content = ?, excerpt = ?, tags = ?, image_url = ?, is_draft = ? WHERE id = ?`;
    await dbRun(query, [title, content, excerpt, tags, imageUrl, isDraft ? 1 : 0, req.params.id]);
    res.json({ message: 'Blog updated successfully' });
  } catch (err) {
    console.error('Database error updating blog:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    const query = isPostgreSQL ? 'DELETE FROM blogs WHERE id = $1' : 'DELETE FROM blogs WHERE id = ?';
    await dbRun(query, [req.params.id]);
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Database error deleting blog:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// Blog Comments
app.get('/api/blogs/:id/comments', async (req, res) => {
  try {
    const query = isPostgreSQL 
      ? 'SELECT c.*, u.name as author_name FROM blog_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.blog_id = $1 AND c.approved = 1 ORDER BY c.created_at ASC'
      : 'SELECT c.*, u.name as author_name FROM blog_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.blog_id = ? AND c.approved = 1 ORDER BY c.created_at ASC';
    const comments = await dbQuery(query, [req.params.id]);
    res.json(comments);
  } catch (err) {
    console.error('Database error loading comments:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/blogs/:id/comments', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  try {
    const query = isPostgreSQL 
      ? 'INSERT INTO blog_comments (blog_id, user_id, content) VALUES ($1, $2, $3)'
      : 'INSERT INTO blog_comments (blog_id, user_id, content) VALUES (?, ?, ?)';
    const result = await dbRun(query, [req.params.id, req.user.id, content]);
    res.json({ id: result.lastID, message: 'Comment added successfully' });
  } catch (err) {
    console.error('Database error creating comment:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Blog Likes
app.post('/api/blogs/:id/like', authenticateToken, async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.id;
  
  try {
    const checkQuery = isPostgreSQL 
      ? 'SELECT id FROM blog_likes WHERE blog_id = $1 AND user_id = $2'
      : 'SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?';
    const existing = await dbGet(checkQuery, [blogId, userId]);
    
    if (existing) {
      const deleteQuery = isPostgreSQL 
        ? 'DELETE FROM blog_likes WHERE blog_id = $1 AND user_id = $2'
        : 'DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?';
      await dbRun(deleteQuery, [blogId, userId]);
      res.json({ liked: false, message: 'Like removed' });
    } else {
      const insertQuery = isPostgreSQL 
        ? 'INSERT INTO blog_likes (blog_id, user_id) VALUES ($1, $2)'
        : 'INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)';
      await dbRun(insertQuery, [blogId, userId]);
      res.json({ liked: true, message: 'Blog liked' });
    }
  } catch (err) {
    console.error('Database error with blog like:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/blogs/:id/likes', async (req, res) => {
  try {
    const query = isPostgreSQL 
      ? 'SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = $1'
      : 'SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = ?';
    const result = await dbGet(query, [req.params.id]);
    res.json({ count: result.count });
  } catch (err) {
    console.error('Database error getting blog likes:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Newsletter Subscribe
app.post('/api/newsletter/subscribe', async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const query = isPostgreSQL 
      ? 'INSERT INTO newsletter_subscribers (email, name, subscribed) VALUES ($1, $2, 1) ON CONFLICT (email) DO UPDATE SET name = $2, subscribed = 1'
      : 'INSERT OR REPLACE INTO newsletter_subscribers (email, name, subscribed) VALUES (?, ?, 1)';
    await dbRun(query, [email, name || '']);
    res.json({ message: 'Successfully subscribed to newsletter' });
  } catch (err) {
    console.error('Database error subscribing to newsletter:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Contact Messages
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const query = isPostgreSQL 
      ? 'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)'
      : 'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)';
    const result = await dbRun(query, [name, email, subject, message]);
    
    console.log('\n=== CONTACT FORM SUBMISSION ===');
    console.log('From:', name, '<' + email + '>');
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('================================\n');
    
    res.json({ id: result.lastID, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Database error creating contact message:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Live Chat Messages
app.post('/api/chat', async (req, res) => {
  const { name, email, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const query = isPostgreSQL 
      ? 'INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)'
      : 'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)';
    const result = await dbRun(query, [name || 'Chat User', email || 'chat@user.com', 'Live Chat', message]);
    
    console.log('\n=== LIVE CHAT MESSAGE ===');
    console.log('From:', name || 'Anonymous');
    console.log('Message:', message);
    console.log('========================\n');
    
    res.json({ id: result.lastID, message: 'Message received' });
  } catch (err) {
    console.error('Database error saving chat message:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Site Config
app.get('/api/config', async (req, res) => {
  console.log('GET /api/config called');
  try {
    const config = await dbGet('SELECT * FROM site_config WHERE id = 1');
    if (!config) {
      console.log('No config found in database');
      return res.json({});
    }
    
    // Parse JSON fields
    if (config.content) {
      try {
        config.content = JSON.parse(config.content);
      } catch (e) {
        console.error('Error parsing content JSON:', e);
        config.content = {};
      }
    }
    if (config.social) {
      try {
        config.social = JSON.parse(config.social);
      } catch (e) {
        config.social = {};
      }
    }
    if (config.seo) {
      try {
        config.seo = JSON.parse(config.seo);
      } catch (e) {
        config.seo = {};
      }
    }
    
    console.log('Loaded config from database:', config);
    res.json(config);
  } catch (err) {
    console.log('Database error loading config:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Config endpoint with database save
app.put('/api/config', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  console.log('PUT /api/config called with:', req.body);
  const { siteName, tagline, logoUrl, colors, content, social, seo } = req.body;
  
  try {
    // Try to update first
    const updateQuery = isPostgreSQL 
      ? `UPDATE site_config SET site_name = $1, tagline = $2, logo_url = $3, primary_color = $4, secondary_color = $5, content = $6, social = $7, seo = $8, updated_at = CURRENT_TIMESTAMP WHERE id = 1`
      : `UPDATE site_config SET site_name = ?, tagline = ?, logo_url = ?, primary_color = ?, secondary_color = ?, content = ?, social = ?, seo = ?, updated_at = datetime('now') WHERE id = 1`;
    
    const result = await dbRun(updateQuery, [
      siteName || 'Portfolio Website', 
      tagline || 'Building Amazing Digital Experiences', 
      logoUrl || '', 
      colors?.primary || '#007AFF', 
      colors?.secondary || '#5856D6',
      JSON.stringify(content || {}),
      JSON.stringify(social || {}),
      JSON.stringify(seo || {})
    ]);
    
    if (result.changes === 0) {
      // No rows updated, try insert
      const insertQuery = isPostgreSQL
        ? `INSERT INTO site_config (id, site_name, tagline, logo_url, primary_color, secondary_color, content, social, seo, updated_at) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`
        : `INSERT INTO site_config (id, site_name, tagline, logo_url, primary_color, secondary_color, content, social, seo, updated_at) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
      
      await dbRun(insertQuery, [
        siteName || 'Portfolio Website', 
        tagline || 'Building Amazing Digital Experiences', 
        logoUrl || '', 
        colors?.primary || '#007AFF', 
        colors?.secondary || '#5856D6',
        JSON.stringify(content || {}),
        JSON.stringify(social || {}),
        JSON.stringify(seo || {})
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

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    if (isPostgreSQL) {
      const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
      res.json({
        status: 'connected',
        database: 'PostgreSQL',
        timestamp: result.rows[0].current_time,
        version: result.rows[0].pg_version,
        connection_string_exists: !!process.env.DATABASE_URL
      });
    } else {
      res.json({
        status: 'connected',
        database: 'SQLite',
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: isPostgreSQL ? 'PostgreSQL' : 'SQLite',
      error: err.message,
      connection_string_exists: !!process.env.DATABASE_URL
    });
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

// About Content
app.get('/api/about', async (req, res) => {
  try {
    const about = await dbGet('SELECT * FROM about_content WHERE id = 1');
    if (about && about.technical_skills && typeof about.technical_skills === 'string') {
      try {
        about.technical_skills = JSON.parse(about.technical_skills);
      } catch (e) {
        about.technical_skills = [];
      }
    }
    res.json(about || {
      job_title: 'Professional Developer',
      job_icon: '💻',
      who_i_am: 'Passionate developer with expertise in modern technologies',
      what_i_do: 'Building innovative solutions and user-friendly applications',
      technical_skills: []
    });
  } catch (err) {
    console.error('Database error loading about content:', err);
    res.json({
      job_title: 'Professional Developer',
      job_icon: '💻',
      who_i_am: 'Passionate developer with expertise in modern technologies',
      what_i_do: 'Building innovative solutions and user-friendly applications',
      technical_skills: []
    });
  }
});

app.put('/api/about', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { jobTitle, jobIcon, whoIAm, whatIDo, technicalSkills } = req.body;
  
  try {
    const updateQuery = isPostgreSQL 
      ? `UPDATE about_content SET job_title = $1, job_icon = $2, who_i_am = $3, what_i_do = $4, technical_skills = $5, updated_at = CURRENT_TIMESTAMP WHERE id = 1`
      : `UPDATE about_content SET job_title = ?, job_icon = ?, who_i_am = ?, what_i_do = ?, technical_skills = ?, updated_at = datetime('now') WHERE id = 1`;
    
    const result = await dbRun(updateQuery, [jobTitle, jobIcon, whoIAm, whatIDo, JSON.stringify(technicalSkills || [])]);
    
    if (result.changes === 0) {
      const insertQuery = isPostgreSQL
        ? `INSERT INTO about_content (id, job_title, job_icon, who_i_am, what_i_do, technical_skills) VALUES (1, $1, $2, $3, $4, $5)`
        : `INSERT INTO about_content (id, job_title, job_icon, who_i_am, what_i_do, technical_skills) VALUES (1, ?, ?, ?, ?, ?)`;
      await dbRun(insertQuery, [jobTitle, jobIcon, whoIAm, whatIDo, JSON.stringify(technicalSkills || [])]);
    }
    res.json({ message: 'About content updated successfully' });
  } catch (err) {
    console.error('Database error updating about content:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
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

// Database cleanup endpoint to remove duplicates
app.post('/api/cleanup-duplicates', async (req, res) => {
  try {
    console.log('Starting database cleanup...');
    
    // Keep only the latest 3 unique projects (by name)
    await dbQuery(`
      DELETE FROM projects 
      WHERE id NOT IN (
        SELECT DISTINCT ON (name) id 
        FROM projects 
        ORDER BY name, created_at DESC
      )
    `);
    
    // Keep only the latest unique AI project (by use_case)
    await dbQuery(`
      DELETE FROM ai_projects 
      WHERE id NOT IN (
        SELECT DISTINCT ON (use_case) id 
        FROM ai_projects 
        ORDER BY use_case, created_at DESC
      )
    `);
    
    // Keep only the latest unique blog (by title)
    await dbQuery(`
      DELETE FROM blogs 
      WHERE id NOT IN (
        SELECT DISTINCT ON (title) id 
        FROM blogs 
        ORDER BY title, created_at DESC
      )
    `);
    
    console.log('Database cleanup completed');
    res.json({ message: 'Database cleanup completed successfully' });
  } catch (err) {
    console.error('Database cleanup error:', err);
    res.status(500).json({ error: 'Cleanup failed: ' + err.message });
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