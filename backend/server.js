const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit auth attempts
  message: 'Too many authentication attempts'
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};

app.use(sanitizeInput);

const db = new sqlite3.Database('./portfolio.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS content_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    template_data TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name TEXT DEFAULT 'Portfolio Website',
    tagline TEXT DEFAULT 'Building Amazing Digital Experiences',
    logo TEXT,
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
    approved BOOLEAN DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_draft BOOLEAN DEFAULT 0,
    scheduled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blog_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER,
    user_id INTEGER,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blog_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(blog_id, user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    subscribed BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    technologies TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    solution_summary TEXT NOT NULL,
    benefits TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ai_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    use_case TEXT NOT NULL,
    benefits TEXT NOT NULL,
    domain TEXT NOT NULL,
    cost TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS about_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_title TEXT DEFAULT 'Professional Developer',
    job_icon TEXT DEFAULT '💻',
    who_i_am TEXT,
    what_i_do TEXT,
    technical_skills TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) 
          VALUES ('Admin', 'admin@example.com', ?, 'admin')`, [adminPassword]);

  db.run(`INSERT OR IGNORE INTO site_config (id, site_name, tagline) 
          VALUES (1, 'Portfolio Website', 'Building Amazing Digital Experiences')`);

  db.run(`INSERT OR IGNORE INTO about_content (id, job_title, job_icon, who_i_am, what_i_do, technical_skills) 
          VALUES (1, 'Professional Developer', '💻', 'Passionate developer with expertise in modern technologies', 'Building innovative solutions and user-friendly applications', '[]')`);

  db.run(`CREATE TABLE IF NOT EXISTS home_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hero_name TEXT DEFAULT 'John Doe',
    hero_title TEXT DEFAULT 'I build digital experiences that matter',
    hero_subtitle TEXT,
    hero_stats TEXT,
    about_preview TEXT,
    cta_title TEXT DEFAULT 'Let\'s work together',
    cta_subtitle TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`INSERT OR IGNORE INTO home_content (id, hero_name, hero_title, hero_subtitle, hero_stats, about_preview, cta_title, cta_subtitle) 
          VALUES (1, 'Alex Johnson', 'I build digital experiences that matter', 'Full-stack developer passionate about creating innovative solutions with modern technologies.', '[{"number":"50+","label":"Projects Built"},{"number":"3+","label":"Years Experience"},{"number":"15+","label":"Happy Clients"}]', 'I am a passionate full-stack developer with a love for creating beautiful, functional, and user-friendly applications.', 'Let us work together', 'I am always interested in hearing about new projects and opportunities.')`);

  // Create indexes for performance after tables are created
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_blogs_approved ON blogs(approved)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_blog_comments_blog ON blog_comments(blog_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_blog_likes_blog ON blog_likes(blog_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_projects_author ON projects(author_id)`);
}

// Admin action logging
const logAdminAction = (adminId, action, targetType, targetId, details, ipAddress) => {
  db.run(
    'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
    [adminId, action, targetType, targetId, JSON.stringify(details), ipAddress]
  );
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    req.clientIp = req.ip || req.connection.remoteAddress;
    next();
  });
};

// Database backup functionality
const createBackup = () => {
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `portfolio-backup-${timestamp}.db`);
  
  return new Promise((resolve, reject) => {
    const source = fs.createReadStream('./portfolio.db');
    const dest = fs.createWriteStream(backupPath);
    
    source.pipe(dest);
    source.on('end', () => resolve(backupPath));
    source.on('error', reject);
  });
};

const restoreBackup = (backupPath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(backupPath)) {
      return reject(new Error('Backup file not found'));
    }
    
    const source = fs.createReadStream(backupPath);
    const dest = fs.createWriteStream('./portfolio.db');
    
    source.pipe(dest);
    source.on('end', resolve);
    source.on('error', reject);
  });
};

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = jwt.sign(
          { id: this.lastID, email, role: 'user' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.json({
          token,
          user: {
            id: this.lastID,
            name,
            email,
            role: 'user'
          }
        });
      }
    );
  });
});

app.get('/api/config', (req, res) => {
  db.get('SELECT * FROM site_config WHERE id = 1', (err, config) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(config || {});
  });
});

app.put('/api/config', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { siteName, tagline, logoUrl, colors, content, social, seo } = req.body;
  
  const query = `
    UPDATE site_config SET 
      site_name = ?,
      tagline = ?,
      logo = ?,
      primary_color = ?,
      secondary_color = ?,
      content = ?,
      social = ?,
      seo = ?,
      updated_at = datetime('now')
    WHERE id = 1
  `;
  
  db.run(query, [
    siteName,
    tagline,
    logoUrl,
    colors?.primary || '#007AFF',
    colors?.secondary || '#5856D6',
    JSON.stringify(content || {}),
    JSON.stringify(social || {}),
    JSON.stringify(seo || {})
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Configuration updated successfully' });
  });
});

app.get('/api/blogs', (req, res) => {
  const query = `
    SELECT b.*, u.name as author_name 
    FROM blogs b 
    JOIN users u ON b.author_id = u.id 
    WHERE b.is_draft = 0
    ORDER BY b.created_at DESC
  `;
  
  db.all(query, (err, blogs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(blogs);
  });
});

app.get('/api/projects', (req, res) => {
  const query = `
    SELECT p.*, u.name as author_name 
    FROM projects p 
    JOIN users u ON p.author_id = u.id 
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, (err, projects) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(projects);
  });
});

app.get('/api/ai-projects', (req, res) => {
  const query = `
    SELECT ap.*, u.name as author_name 
    FROM ai_projects ap 
    JOIN users u ON ap.author_id = u.id 
    ORDER BY ap.created_at DESC
  `;
  
  db.all(query, (err, projects) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(projects);
  });
});

app.post('/api/blogs', authenticateToken, (req, res) => {
  const { title, content, excerpt, tags, imageUrl, isDraft, scheduledAt } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  const query = `
    INSERT INTO blogs (title, content, excerpt, tags, image_url, author_id, is_draft, scheduled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [title, content, excerpt, tags, imageUrl, req.user.id, isDraft || 0, scheduledAt], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ id: this.lastID, message: isDraft ? 'Draft saved successfully' : 'Blog created successfully' });
  });
});

app.get('/api/blogs/drafts', authenticateToken, (req, res) => {
  const query = `
    SELECT b.*, u.name as author_name 
    FROM blogs b 
    JOIN users u ON b.author_id = u.id 
    WHERE b.is_draft = 1 AND b.author_id = ?
    ORDER BY b.created_at DESC
  `;
  
  db.all(query, [req.user.id], (err, drafts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(drafts);
  });
});

app.put('/api/blogs/:id', authenticateToken, (req, res) => {
  const { approved } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.run('UPDATE blogs SET approved = ? WHERE id = ?', [approved, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    logAdminAction(req.user.id, approved ? 'APPROVE_BLOG' : 'REJECT_BLOG', 'blog', req.params.id, { approved }, req.clientIp);
    res.json({ message: 'Blog updated successfully' });
  });
});

// Bulk operations
app.post('/api/blogs/bulk', authenticateToken, (req, res) => {
  const { action, blogIds } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  if (!Array.isArray(blogIds) || blogIds.length === 0) {
    return res.status(400).json({ error: 'Blog IDs required' });
  }
  
  const placeholders = blogIds.map(() => '?').join(',');
  let query, params;
  
  switch (action) {
    case 'approve':
      query = `UPDATE blogs SET approved = 1 WHERE id IN (${placeholders})`;
      params = blogIds;
      break;
    case 'reject':
      query = `UPDATE blogs SET approved = 0 WHERE id IN (${placeholders})`;
      params = blogIds;
      break;
    case 'delete':
      query = `DELETE FROM blogs WHERE id IN (${placeholders})`;
      params = blogIds;
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
  
  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    logAdminAction(req.user.id, `BULK_${action.toUpperCase()}_BLOGS`, 'blog', null, { blogIds, count: this.changes }, req.clientIp);
    res.json({ message: `${this.changes} blogs ${action}d successfully` });
  });
});

app.delete('/api/blogs/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.run('DELETE FROM blogs WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    logAdminAction(req.user.id, 'DELETE_BLOG', 'blog', req.params.id, {}, req.clientIp);
    res.json({ message: 'Blog deleted successfully' });
  });
});

// Content Templates API
app.get('/api/templates', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.all('SELECT * FROM content_templates ORDER BY created_at DESC', (err, templates) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const parsedTemplates = templates.map(template => ({
      ...template,
      template_data: JSON.parse(template.template_data)
    }));
    
    res.json(parsedTemplates);
  });
});

app.post('/api/templates', authenticateToken, (req, res) => {
  const { name, type, templateData } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  if (!name || !type || !templateData) {
    return res.status(400).json({ error: 'Name, type, and template data are required' });
  }
  
  db.run(
    'INSERT INTO content_templates (name, type, template_data, created_by) VALUES (?, ?, ?, ?)',
    [name, type, JSON.stringify(templateData), req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminAction(req.user.id, 'CREATE_TEMPLATE', 'template', this.lastID, { name, type }, req.clientIp);
      res.json({ id: this.lastID, message: 'Template created successfully' });
    }
  );
});

app.delete('/api/templates/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.run('DELETE FROM content_templates WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    logAdminAction(req.user.id, 'DELETE_TEMPLATE', 'template', req.params.id, {}, req.clientIp);
    res.json({ message: 'Template deleted successfully' });
  });
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl } = req.body;
  
  if (!name || !domain || !technologies || !problemStatement) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  
  const query = `
    INSERT INTO projects (name, domain, technologies, problem_statement, solution_summary, benefits, image_url, video_url, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ id: this.lastID, message: 'Project created successfully' });
  });
});

app.post('/api/ai-projects', authenticateToken, (req, res) => {
  const { useCase, benefits, domain, cost, problemStatement } = req.body;
  
  if (!useCase || !benefits || !domain || !problemStatement) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  
  const query = `
    INSERT INTO ai_projects (use_case, benefits, domain, cost, problem_statement, author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [useCase, benefits, domain, cost, problemStatement, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ id: this.lastID, message: 'AI project created successfully' });
  });
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const { name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl } = req.body;
  
  db.get('SELECT author_id FROM projects WHERE id = ?', [req.params.id], (err, project) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this project' });
    }
    
    const query = `
      UPDATE projects SET 
        name = ?, domain = ?, technologies = ?, problem_statement = ?, 
        solution_summary = ?, benefits = ?, image_url = ?, video_url = ?
      WHERE id = ?
    `;
    
    db.run(query, [name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl, req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Project updated successfully' });
    });
  });
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  db.get('SELECT author_id FROM projects WHERE id = ?', [req.params.id], (err, project) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this project' });
    }
    
    db.run('DELETE FROM projects WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Project deleted successfully' });
    });
  });
});

app.put('/api/ai-projects/:id', authenticateToken, (req, res) => {
  const { useCase, benefits, domain, cost, problemStatement } = req.body;
  
  db.get('SELECT author_id FROM ai_projects WHERE id = ?', [req.params.id], (err, project) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!project) {
      return res.status(404).json({ error: 'AI project not found' });
    }
    
    if (project.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this AI project' });
    }
    
    const query = `
      UPDATE ai_projects SET 
        use_case = ?, benefits = ?, domain = ?, cost = ?, problem_statement = ?
      WHERE id = ?
    `;
    
    db.run(query, [useCase, benefits, domain, cost, problemStatement, req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'AI project updated successfully' });
    });
  });
});

app.delete('/api/ai-projects/:id', authenticateToken, (req, res) => {
  db.get('SELECT author_id FROM ai_projects WHERE id = ?', [req.params.id], (err, project) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!project) {
      return res.status(404).json({ error: 'AI project not found' });
    }
    
    if (project.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this AI project' });
    }
    
    db.run('DELETE FROM ai_projects WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'AI project deleted successfully' });
    });
  });
});

app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, email, role } = req.body;
  
  db.run(
    'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
    [name, email, role, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'User updated successfully' });
    }
  );
});

app.post('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role || 'user'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'User created successfully' });
    }
  );
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  if (req.params.id == req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

app.get('/api/resume/:userId', authenticateToken, (req, res) => {
  db.get('SELECT * FROM resumes WHERE user_id = ?', [req.params.userId], (err, resume) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (resume) {
      resume.education = resume.education ? JSON.parse(resume.education) : [];
      resume.experience = resume.experience ? JSON.parse(resume.experience) : [];
      resume.technologies = resume.technologies ? JSON.parse(resume.technologies) : [];
      resume.aiSkills = resume.ai_skills ? JSON.parse(resume.ai_skills) : [];
    }
    
    res.json(resume || {});
  });
});

app.post('/api/resume', authenticateToken, (req, res) => {
  const { name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, aiSkills } = req.body;
  
  const query = `
    INSERT OR REPLACE INTO resumes 
    (user_id, name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, ai_skills, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  
  db.run(query, [
    req.user.id,
    name,
    profession,
    summary,
    email,
    phone,
    location,
    linkedin,
    website,
    JSON.stringify(education || []),
    JSON.stringify(experience || []),
    JSON.stringify(technologies || []),
    JSON.stringify(aiSkills || [])
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Resume updated successfully' });
  });
});

app.get('/api/about', (req, res) => {
  db.get('SELECT * FROM about_content WHERE id = 1', (err, about) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (about && about.technical_skills) {
      about.technical_skills = JSON.parse(about.technical_skills);
    }
    
    res.json(about || {});
  });
});

app.put('/api/about', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { jobTitle, jobIcon, whoIAm, whatIDo, technicalSkills } = req.body;
  
  const query = `
    UPDATE about_content SET 
      job_title = ?,
      job_icon = ?,
      who_i_am = ?,
      what_i_do = ?,
      technical_skills = ?,
      updated_at = datetime('now')
    WHERE id = 1
  `;
  
  db.run(query, [
    jobTitle,
    jobIcon,
    whoIAm,
    whatIDo,
    JSON.stringify(technicalSkills || [])
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'About content updated successfully' });
  });
});

app.get('/api/home', (req, res) => {
  db.get('SELECT * FROM home_content WHERE id = 1', (err, home) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (home && home.hero_stats) {
      home.hero_stats = JSON.parse(home.hero_stats);
    }
    
    res.json(home || {});
  });
});

app.put('/api/home', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { heroName, heroTitle, heroSubtitle, heroStats, aboutPreview, ctaTitle, ctaSubtitle } = req.body;
  
  const query = `
    UPDATE home_content SET 
      hero_name = ?,
      hero_title = ?,
      hero_subtitle = ?,
      hero_stats = ?,
      about_preview = ?,
      cta_title = ?,
      cta_subtitle = ?,
      updated_at = datetime('now')
    WHERE id = 1
  `;
  
  db.run(query, [
    heroName,
    heroTitle,
    heroSubtitle,
    JSON.stringify(heroStats || []),
    aboutPreview,
    ctaTitle,
    ctaSubtitle
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Home content updated successfully' });
  });
});

// Blog Comments API
app.get('/api/blogs/:id/comments', (req, res) => {
  const query = `
    SELECT c.*, u.name as author_name 
    FROM blog_comments c 
    JOIN users u ON c.user_id = u.id 
    WHERE c.blog_id = ? AND c.approved = 1
    ORDER BY c.created_at ASC
  `;
  
  db.all(query, [req.params.id], (err, comments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(comments);
  });
});

app.post('/api/blogs/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }
  
  const query = `
    INSERT INTO blog_comments (blog_id, user_id, content, approved)
    VALUES (?, ?, ?, ?)
  `;
  
  const approved = req.user.role === 'admin' ? 1 : 0;
  
  db.run(query, [req.params.id, req.user.id, content, approved], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ id: this.lastID, message: 'Comment added successfully' });
  });
});

// Blog Likes API
app.post('/api/blogs/:id/like', authenticateToken, (req, res) => {
  const blogId = req.params.id;
  const userId = req.user.id;
  
  // Check if already liked
  db.get('SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?', [blogId, userId], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (existing) {
      // Unlike
      db.run('DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?', [blogId, userId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ liked: false, message: 'Like removed' });
      });
    } else {
      // Like
      db.run('INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)', [blogId, userId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ liked: true, message: 'Blog liked' });
      });
    }
  });
});

app.get('/api/blogs/:id/likes', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM blog_likes WHERE blog_id = ?', [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ count: result.count });
  });
});

// Newsletter API
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  db.run(
    'INSERT OR REPLACE INTO newsletter_subscribers (email, name, subscribed) VALUES (?, ?, 1)',
    [email, name || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Successfully subscribed to newsletter' });
    }
  );
});

app.get('/api/newsletter/subscribers', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.all('SELECT * FROM newsletter_subscribers WHERE subscribed = 1 ORDER BY created_at DESC', (err, subscribers) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(subscribers);
  });
});

// Contact Messages API
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  db.run(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
    [name, email, subject, message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Message sent successfully' });
    }
  );
});

app.get('/api/contact/messages', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.all('SELECT * FROM contact_messages ORDER BY created_at DESC', (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(messages);
  });
});

app.put('/api/contact/messages/:id/read', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  db.run('UPDATE contact_messages SET read_status = 1 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Message marked as read' });
  });
});

// Analytics API
app.get('/api/analytics', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Get basic stats from database
  const queries = {
    totalBlogs: 'SELECT COUNT(*) as count FROM blogs WHERE is_draft = 0',
    totalProjects: 'SELECT COUNT(*) as count FROM projects',
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    totalMessages: 'SELECT COUNT(*) as count FROM contact_messages',
    recentBlogs: 'SELECT title, created_at FROM blogs WHERE is_draft = 0 ORDER BY created_at DESC LIMIT 5'
  };
  
  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, (err, rows) => {
      if (!err) {
        results[key] = rows;
      }
      completed++;
      if (completed === total) {
        // Mock analytics data with real counts
        const analytics = {
          pageViews: Math.floor(Math.random() * 10000) + results.totalBlogs[0]?.count * 100 || 1000,
          uniqueVisitors: Math.floor(Math.random() * 5000) + results.totalUsers[0]?.count * 50 || 500,
          blogViews: Math.floor(Math.random() * 3000) + results.totalBlogs[0]?.count * 80 || 300,
          projectViews: Math.floor(Math.random() * 2000) + results.totalProjects[0]?.count * 60 || 200,
          totalContent: (results.totalBlogs[0]?.count || 0) + (results.totalProjects[0]?.count || 0),
          popularContent: results.recentBlogs?.map(blog => ({
            title: blog.title,
            views: Math.floor(Math.random() * 500) + 50,
            type: 'blog'
          })) || []
        };
        res.json(analytics);
      }
    });
  });
});

// File Upload API (basic implementation)
app.post('/api/upload', authenticateToken, (req, res) => {
  // In production, integrate with AWS S3, Cloudinary, etc.
  // For now, return a mock URL
  const mockUrl = `https://via.placeholder.com/400x300?text=Uploaded+${Date.now()}`;
  res.json({ url: mockUrl, message: 'File uploaded successfully' });
});

// Admin Logs API
app.get('/api/admin/logs', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  
  const query = `
    SELECT al.*, u.name as admin_name 
    FROM admin_logs al 
    JOIN users u ON al.admin_id = u.id 
    ORDER BY al.created_at DESC 
    LIMIT ? OFFSET ?
  `;
  
  db.all(query, [limit, offset], (err, logs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const parsedLogs = logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : {}
    }));
    
    res.json(parsedLogs);
  });
});

// Backup/Restore API
app.post('/api/admin/backup', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const backupPath = await createBackup();
    logAdminAction(req.user.id, 'CREATE_BACKUP', 'system', null, { backupPath }, req.clientIp);
    res.json({ message: 'Backup created successfully', path: backupPath });
  } catch (error) {
    res.status(500).json({ error: 'Backup failed: ' + error.message });
  }
});

app.get('/api/admin/backups', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) {
    return res.json([]);
  }
  
  const files = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.db'))
    .map(file => {
      const stats = fs.statSync(path.join(backupDir, file));
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime
      };
    })
    .sort((a, b) => b.created - a.created);
  
  res.json(files);
});

app.post('/api/admin/restore', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { backupName } = req.body;
  if (!backupName) {
    return res.status(400).json({ error: 'Backup name required' });
  }
  
  try {
    const backupPath = path.join('./backups', backupName);
    await restoreBackup(backupPath);
    logAdminAction(req.user.id, 'RESTORE_BACKUP', 'system', null, { backupName }, req.clientIp);
    res.json({ message: 'Database restored successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Restore failed: ' + error.message });
  }
});

// Sitemap API
app.get('/api/sitemap', (req, res) => {
  const queries = {
    blogs: 'SELECT id, title, created_at FROM blogs WHERE is_draft = 0 AND approved = 1',
    projects: 'SELECT id, name, created_at FROM projects'
  };
  
  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, (err, rows) => {
      if (!err) {
        results[key] = rows;
      }
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'text/xml');
  
  db.all('SELECT id, title, created_at FROM blogs WHERE is_draft = 0 AND approved = 1', (err, blogs) => {
    if (err) {
      return res.status(500).send('Error generating sitemap');
    }
    
    const baseUrl = req.protocol + '://' + req.get('host');
    const pages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/projects', priority: '0.8', changefreq: 'weekly' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' }
    ];
    
    blogs.forEach(blog => {
      pages.push({
        url: `/blog/${blog.id}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: blog.created_at
      });
    });
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;
    
    res.send(xml);
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = parseInt(PORT) + 1;
    console.log(`Port ${PORT} busy, trying ${newPort}`);
    app.listen(newPort, () => {
      console.log(`🚀 Server running on http://localhost:${newPort}`);
    });
  }
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});