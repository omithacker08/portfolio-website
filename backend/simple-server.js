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

const fs = require('fs');
const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/portfolio.db' : './portfolio.db';

const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  db.run(`CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY,
    site_name TEXT DEFAULT 'Portfolio Website',
    tagline TEXT DEFAULT 'Building Amazing Digital Experiences',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#007AFF',
    secondary_color TEXT DEFAULT '#5856D6',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating site_config table:', err);
    else console.log('Site config table created/verified');
  });

  db.run(`CREATE TABLE IF NOT EXISTS home_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hero_name TEXT DEFAULT 'Alex Johnson',
    hero_title TEXT DEFAULT 'I build digital experiences that matter',
    hero_subtitle TEXT,
    hero_stats TEXT,
    about_preview TEXT,
    cta_title TEXT DEFAULT 'Let us work together',
    cta_subtitle TEXT,
    profile_name TEXT DEFAULT 'John Doe',
    profile_status TEXT DEFAULT 'Available for freelance',
    profile_tech_stack TEXT DEFAULT 'React, Node.js, Python',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default site config
  db.run(`INSERT OR IGNORE INTO site_config (id, site_name, tagline, primary_color, secondary_color) VALUES (?, ?, ?, ?, ?)`, 
    [1, 'Portfolio Website', 'Building Amazing Digital Experiences', '#007AFF', '#5856D6'], (err) => {
      if (err) console.error('Error inserting default site config:', err);
      else console.log('Default site config inserted');
    });

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ai_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    use_case TEXT NOT NULL,
    benefits TEXT NOT NULL,
    domain TEXT NOT NULL,
    cost TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    tags TEXT,
    image_url TEXT,
    author_id INTEGER,
    approved BOOLEAN DEFAULT 1,
    likes INTEGER DEFAULT 0,
    is_draft BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blog_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER,
    user_id INTEGER,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blog_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_id, user_id)
  )`);

  // Insert admin user
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['Admin', 'admin@example.com', adminPassword, 'admin']);

  // Insert default resume
  db.run(`INSERT OR IGNORE INTO resumes (user_id, name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, ai_skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [1, 'Alex Johnson', 'Full Stack Developer', 'Passionate full-stack developer with expertise in modern web technologies and AI solutions.', 'alex.johnson@example.com', '+1 (555) 123-4567', 'San Francisco, CA', 'linkedin.com/in/alexjohnson', 'alexjohnson.dev', 
    '[{"id": 1, "degree": "Bachelor of Computer Science", "institution": "University of California", "startDate": "2018-09-01", "endDate": "2022-05-15", "gpa": "3.8", "percentage": "85.5"}]',
    '[{"id": 1, "company": "Tech Solutions Inc.", "position": "Senior Full Stack Developer", "startDate": "2022-06-01", "endDate": "", "current": true, "responsibilities": "Lead development of web applications using React, Node.js, and cloud technologies."}]',
    '[{"id": 1, "name": "React", "category": "Frontend", "proficiency": "Expert", "yearsOfExperience": "4"}]',
    '[{"id": 1, "useCase": "Machine Learning Models", "summary": "Developed predictive models for business analytics", "technologies": "Python, TensorFlow, Scikit-learn", "impact": "25% improvement in prediction accuracy"}]'
    ]);

  // Add profile columns if they don't exist
  db.run(`ALTER TABLE home_content ADD COLUMN profile_name TEXT DEFAULT 'John Doe'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Profile name column add error:', err.message);
    }
  });
  
  db.run(`ALTER TABLE home_content ADD COLUMN profile_status TEXT DEFAULT 'Available for freelance'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Profile status column add error:', err.message);
    }
  });
  
  db.run(`ALTER TABLE home_content ADD COLUMN profile_tech_stack TEXT DEFAULT 'React, Node.js, Python'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Profile tech stack column add error:', err.message);
    }
  });

  // Insert default home content
  db.run(`INSERT OR IGNORE INTO home_content (id, hero_name, hero_title, hero_subtitle, hero_stats, about_preview, cta_title, cta_subtitle) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [1, 'Alex Johnson', 'I build digital experiences that matter', 'Full-stack developer passionate about creating innovative solutions with modern technologies.', 
    '[{"number":"50+","label":"Projects Built"},{"number":"3+","label":"Years Experience"},{"number":"15+","label":"Happy Clients"}]', 
    'I am a passionate full-stack developer with a love for creating beautiful, functional, and user-friendly applications.', 
    'Let us work together', 
    'I am always interested in hearing about new projects and opportunities.'
    ], (err) => {
      if (!err) {
        // Update with default profile values if row was just inserted
        db.run(`UPDATE home_content SET profile_name = ?, profile_status = ?, profile_tech_stack = ? WHERE id = 1 AND profile_name IS NULL`,
          ['John Doe', 'Available for freelance', 'React, Node.js, Python']);
      }
    });
});

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
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
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
app.get('/api/home', (req, res) => {
  db.get('SELECT * FROM home_content WHERE id = 1', (err, home) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (home && home.hero_stats) {
      home.hero_stats = JSON.parse(home.hero_stats);
    }
    res.json(home || {});
  });
});

app.put('/api/home', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  const { heroName, heroTitle, heroSubtitle, heroStats, aboutPreview, ctaTitle, ctaSubtitle, profileName, profileStatus, profileTechStack } = req.body;
  db.run(`UPDATE home_content SET hero_name = ?, hero_title = ?, hero_subtitle = ?, hero_stats = ?, about_preview = ?, cta_title = ?, cta_subtitle = ?, profile_name = ?, profile_status = ?, profile_tech_stack = ?, updated_at = datetime('now') WHERE id = 1`, 
    [heroName, heroTitle, heroSubtitle, JSON.stringify(heroStats || []), aboutPreview, ctaTitle, ctaSubtitle, profileName, profileStatus, profileTechStack], 
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Home content updated successfully' });
    });
});

// Projects
app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, projects) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(projects);
  });
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl } = req.body;
  if (!name || !domain || !technologies || !problemStatement) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  db.run(`INSERT INTO projects (name, domain, technologies, problem_statement, solution_summary, benefits, image_url, video_url, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [name, domain, technologies, problemStatement, solutionSummary, benefits, imageUrl, videoUrl, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, message: 'Project created successfully' });
    });
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
app.get('/api/config', (req, res) => {
  console.log('GET /api/config called');
  db.get('SELECT * FROM site_config WHERE id = 1', (err, config) => {
    if (err) {
      console.log('Database error loading config:', err);
      return res.json({
        site_name: 'Portfolio Website',
        tagline: 'Building Amazing Digital Experiences',
        primary_color: '#007AFF',
        secondary_color: '#5856D6'
      });
    }
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
  });
});

// Config endpoint with database save
app.put('/api/config', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  
  console.log('PUT /api/config called with:', req.body);
  const { siteName, tagline, logoUrl, colors } = req.body;
  
  // First add logo_url column if it doesn't exist
  db.run(`ALTER TABLE site_config ADD COLUMN logo_url TEXT`, (alterErr) => {
    // Ignore error if column already exists
    if (alterErr && !alterErr.message.includes('duplicate column name')) {
      console.log('Column add error (may be expected):', alterErr.message);
    }
    
    // Update with logo_url column
    db.run(`UPDATE site_config SET site_name = ?, tagline = ?, logo_url = ?, primary_color = ?, secondary_color = ?, updated_at = datetime('now') WHERE id = 1`,
      [siteName || 'Portfolio Website', tagline || 'Building Amazing Digital Experiences', logoUrl || '', colors?.primary || '#007AFF', colors?.secondary || '#5856D6'],
      function(err) {
        if (err) {
          console.error('Database update error:', err);
          return res.status(500).json({ error: 'Database update failed: ' + err.message });
        }
        
        if (this.changes === 0) {
          // No rows updated, try insert
          db.run(`INSERT INTO site_config (id, site_name, tagline, logo_url, primary_color, secondary_color, updated_at) VALUES (1, ?, ?, ?, ?, ?, datetime('now'))`,
            [siteName || 'Portfolio Website', tagline || 'Building Amazing Digital Experiences', logoUrl || '', colors?.primary || '#007AFF', colors?.secondary || '#5856D6'],
            function(insertErr) {
              if (insertErr) {
                console.error('Database insert error:', insertErr);
                return res.status(500).json({ error: 'Database insert failed: ' + insertErr.message });
              }
              console.log('Config inserted successfully');
              res.json({ message: 'Configuration updated successfully' });
            }
          );
        } else {
          console.log('Config updated successfully:', this.changes, 'rows affected');
          res.json({ message: 'Configuration updated successfully' });
        }
      }
    );
  });
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
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(users);
  });
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