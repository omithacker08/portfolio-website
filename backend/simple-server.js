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
        const result = await db.query(query, params);
        return { changes: result.rowCount, lastID: result.insertId };
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
      
      console.log('PostgreSQL database initialized successfully');
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
app.get('/api/resume/:userId', async (req, res) => {
  try {
    const query = isPostgreSQL ? 'SELECT * FROM resumes WHERE user_id = $1' : 'SELECT * FROM resumes WHERE user_id = ?';
    const resume = await dbGet(query, [req.params.userId]);
    if (resume) {
      resume.education = JSON.parse(resume.education || '[]');
      resume.experience = JSON.parse(resume.experience || '[]');
      resume.technologies = JSON.parse(resume.technologies || '[]');
      resume.skills = JSON.parse(resume.technologies || '[]');
      resume.aiSkills = JSON.parse(resume.ai_skills || '[]');
      resume.achievements = JSON.parse(resume.ai_skills || '[]');
      resume.title = resume.profession;
    }
    res.json(resume || {});
  } catch (err) {
    console.error('Database error loading resume:', err);
    // Return complete fallback data from local database
    res.json({
      name: 'Om Thacker',
      title: 'Full Stack Developer | Tech Lead | Certified AI Project Manager',
      summary: 'Passionate full-stack developer with expertise in modern web technologies and AI solutions. 12+ years of experience, Completed Masters of Computer Applications from Mumbai university, currently working as a Tech Lead at TIAA. Worked on multiple domains like ERP, Healthcare, Finance throughout my career and implemented multiple enterprise grade solutions from scratch. Have experience of working as a Tech Lead, Project Manager and solution architect role.',
      email: 'omi.thacker08@gmail.com',
      phone: '+91 9870915196',
      location: 'Mumbai, MH',
      linkedin: 'https://linkedin.com/in/om-thacker',
      website: 'alexjohnson.dev',
      education: [{
        id: 1,
        degree: 'Master of Computer Application',
        institution: 'University of Mumbai',
        startDate: '2010-06-20',
        endDate: '2013-06-15',
        gpa: '',
        percentage: '68'
      }, {
        id: 1761203677705,
        degree: 'Bachelor of Information Technology',
        institution: 'University of Mumbai',
        startDate: '2007-06-12',
        endDate: '2010-06-15',
        gpa: '',
        percentage: '64.97'
      }, {
        id: 1761203862957,
        degree: 'HSC',
        institution: 'University of Mumbai',
        startDate: '2005-06-12',
        endDate: '2007-06-01',
        gpa: '',
        percentage: '60'
      }, {
        id: 1761203863574,
        degree: 'SSC',
        institution: 'University of Mumbai',
        startDate: '2004-06-01',
        endDate: '2005-06-01',
        gpa: '',
        percentage: '63'
      }],
      experience: [{
        id: 1,
        company: 'TIAA',
        position: 'Senior Associate, Lead Cloud specialist',
        startDate: '2020-01-27',
        endDate: '',
        current: true,
        responsibilities: 'Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies.\nLead the PI planning for the Team and work closely with Product Owner and Product Manager for end-to-end delivery plan and excution.'
      }, {
        id: 1761207963049,
        company: 'Citiustech',
        position: 'Tech Lead',
        startDate: '2016-05-01',
        endDate: '2020-01-25',
        current: false,
        responsibilities: 'Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies.'
      }, {
        id: 1761208169200,
        company: 'GlobeOp Finanacial Services',
        position: 'Senior Associate',
        startDate: '2015-06-04',
        endDate: '2016-04-30',
        current: false,
        responsibilities: 'Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies.'
      }, {
        id: 1761208221911,
        company: 'EclinicalWorks',
        position: 'Senior Software Engineer',
        startDate: '2015-06-01',
        endDate: '2016-06-01',
        current: false,
        responsibilities: 'Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies.'
      }, {
        id: 1761208282474,
        company: 'Expenzing | Nexstep',
        position: 'Senior Software Engineer',
        startDate: '2013-02-04',
        endDate: '2015-05-31',
        current: false,
        responsibilities: 'Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies.'
      }],
      skills: [{
        id: 1,
        name: 'React',
        category: 'Frontend',
        proficiency: 'Expert',
        yearsOfExperience: '4'
      }, {
        id: 1763804291838,
        name: 'Java',
        category: 'Backend',
        proficiency: 'Expert',
        yearsOfExperience: '12'
      }, {
        id: 1763804312695,
        name: 'Spring framework',
        category: 'Backend',
        proficiency: 'Advanced',
        yearsOfExperience: '7'
      }, {
        id: 1763804339259,
        name: 'SQL',
        category: 'Database',
        proficiency: 'Advanced',
        yearsOfExperience: '9.5'
      }, {
        id: 1763804354601,
        name: 'Python',
        category: 'Backend',
        proficiency: 'Intermediate',
        yearsOfExperience: '2'
      }],
      technologies: [{
        id: 1,
        name: 'React',
        category: 'Frontend',
        proficiency: 'Expert',
        yearsOfExperience: '4'
      }, {
        id: 1763804291838,
        name: 'Java',
        category: 'Backend',
        proficiency: 'Expert',
        yearsOfExperience: '12'
      }, {
        id: 1763804312695,
        name: 'Spring framework',
        category: 'Backend',
        proficiency: 'Advanced',
        yearsOfExperience: '7'
      }, {
        id: 1763804339259,
        name: 'SQL',
        category: 'Database',
        proficiency: 'Advanced',
        yearsOfExperience: '9.5'
      }, {
        id: 1763804354601,
        name: 'Python',
        category: 'Backend',
        proficiency: 'Intermediate',
        yearsOfExperience: '2'
      }],
      achievements: [{
        id: 1,
        useCase: 'Machine Learning Models',
        summary: 'Developed predictive models for business analytics',
        technologies: 'Python, TensorFlow, Scikit-learn',
        impact: '25% improvement in prediction accuracy'
      }],
      aiSkills: [{
        id: 1,
        useCase: 'Machine Learning Models',
        summary: 'Developed predictive models for business analytics',
        technologies: 'Python, TensorFlow, Scikit-learn',
        impact: '25% improvement in prediction accuracy'
      }]
    });
  }
});

app.post('/api/resume', authenticateToken, async (req, res) => {
  const { name, title, profession, summary, email, phone, location, linkedin, website, education, experience, skills, technologies, achievements, aiSkills } = req.body;
  const finalTitle = title || profession;
  const finalSkills = skills || technologies || [];
  const finalAchievements = achievements || aiSkills || [];
  try {
    // First try to update existing record
    const updateQuery = isPostgreSQL 
      ? `UPDATE resumes SET name = $2, profession = $3, summary = $4, email = $5, phone = $6, location = $7, linkedin = $8, website = $9, education = $10, experience = $11, technologies = $12, ai_skills = $13, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`
      : `UPDATE resumes SET name = ?, profession = ?, summary = ?, email = ?, phone = ?, location = ?, linkedin = ?, website = ?, education = ?, experience = ?, technologies = ?, ai_skills = ?, updated_at = datetime('now') WHERE user_id = ?`;
    
    const result = await dbRun(updateQuery, [req.user.id, name, finalTitle, summary, email, phone, location, linkedin, website, JSON.stringify(education || []), JSON.stringify(experience || []), JSON.stringify(finalSkills), JSON.stringify(finalAchievements)]);
    
    // If no rows were updated, insert new record
    if (result.changes === 0) {
      const insertQuery = isPostgreSQL 
        ? `INSERT INTO resumes (user_id, name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, ai_skills, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)`
        : `INSERT INTO resumes (user_id, name, profession, summary, email, phone, location, linkedin, website, education, experience, technologies, ai_skills, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
      
      await dbRun(insertQuery, [req.user.id, name, finalTitle, summary, email, phone, location, linkedin, website, JSON.stringify(education || []), JSON.stringify(experience || []), JSON.stringify(finalSkills), JSON.stringify(finalAchievements)]);
    }
    
    res.json({ message: 'Resume updated successfully' });
  } catch (err) {
    console.error('Resume update error:', err);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
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
app.get('/api/ai-projects', async (req, res) => {
  try {
    const projects = await dbQuery('SELECT * FROM ai_projects ORDER BY created_at DESC');
    res.json(projects);
  } catch (err) {
    console.error('Database error loading AI projects:', err);
    res.status(500).json({ error: 'Database error' });
  }
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