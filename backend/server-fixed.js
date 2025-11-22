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
const PORT = 3001;
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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts'
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS site_config (
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
    )`,
    `CREATE TABLE IF NOT EXISTS blogs (
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
    )`,
    `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      subscribed BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      read_status BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS resumes (
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
    )`
  ];

  tables.forEach(sql => {
    db.run(sql, (err) => {
      if (err) console.error('Table creation error:', err);
    });
  });

  // Insert default data
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, 
    ['Admin', 'admin@example.com', adminPassword, 'admin']);
  
  db.run(`INSERT OR IGNORE INTO site_config (id, site_name, tagline) VALUES (?, ?, ?)`, 
    [1, 'Portfolio Website', 'Building Amazing Digital Experiences']);
  
  // Insert default resume data
  db.run(`INSERT OR IGNORE INTO resumes (user_id, name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, ai_skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [1, 'Alex Johnson', 'Full Stack Developer', 'Passionate full-stack developer with expertise in modern web technologies and AI solutions.', 'alex.johnson@example.com', '+1 (555) 123-4567', 'San Francisco, CA', 'linkedin.com/in/alexjohnson', 'alexjohnson.dev', 
    JSON.stringify([{id: 1, degree: 'Bachelor of Computer Science', institution: 'University of California', startDate: '2018-09-01', endDate: '2022-05-15', gpa: '3.8'}]),
    JSON.stringify([{id: 1, company: 'Tech Solutions Inc.', position: 'Senior Full Stack Developer', startDate: '2022-06-01', endDate: '', current: true, responsibilities: 'Lead development of web applications using React, Node.js, and cloud technologies.'}]),
    JSON.stringify([{id: 1, name: 'React', category: 'Frontend', proficiency: 'Expert', yearsOfExperience: '4'}]),
    JSON.stringify([{id: 1, useCase: 'Machine Learning Models', summary: 'Developed predictive models for business analytics', technologies: 'Python, TensorFlow, Scikit-learn', impact: '25% improvement in prediction accuracy'}])
    ]);
}

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
    next();
  });
};

// Auth routes
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

// Newsletter API
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

// Resume API
app.get('/api/resume/:userId', (req, res) => {
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

// Contact Messages API
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

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});