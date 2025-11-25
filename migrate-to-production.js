const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const PRODUCTION_API = 'https://portfolio-backend-qxhg.onrender.com/api';
const LOCAL_DB = './backend/portfolio.db';

// Admin credentials for production
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

let authToken = null;

async function authenticateAdmin() {
  try {
    const response = await axios.post(`${PRODUCTION_API}/auth/login`, ADMIN_CREDENTIALS);
    authToken = response.data.token;
    console.log('✅ Authenticated with production API');
    return true;
  } catch (error) {
    console.error('❌ Failed to authenticate:', error.response?.data?.error || error.message);
    return false;
  }
}

function getLocalData() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(LOCAL_DB, (err) => {
      if (err) {
        reject(err);
        return;
      }
    });

    const data = {};
    let completed = 0;
    const queries = {
      siteConfig: 'SELECT * FROM site_config WHERE id = 1',
      homeContent: 'SELECT * FROM home_content WHERE id = 1',
      aboutContent: 'SELECT * FROM about_content WHERE id = 1',
      resume: 'SELECT * FROM resumes WHERE user_id = 1'
    };

    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
      db.get(query, (err, row) => {
        if (!err && row) {
          data[key] = row;
        }
        completed++;
        if (completed === total) {
          db.close();
          resolve(data);
        }
      });
    });
  });
}

async function updateProductionData(data) {
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Update site config
    if (data.siteConfig) {
      const configData = {
        siteName: 'Om Thacker',
        tagline: 'Full Stack Developer & AI Enthusiast',
        logoUrl: data.siteConfig.logo || '',
        colors: {
          primary: data.siteConfig.primary_color || '#007AFF',
          secondary: data.siteConfig.secondary_color || '#5856D6'
        },
        content: data.siteConfig.content ? JSON.parse(data.siteConfig.content) : {},
        social: data.siteConfig.social ? JSON.parse(data.siteConfig.social) : {},
        seo: data.siteConfig.seo ? JSON.parse(data.siteConfig.seo) : {}
      };
      
      await axios.put(`${PRODUCTION_API}/config`, configData, { headers });
      console.log('✅ Updated site configuration');
    }

    // Update home content
    if (data.homeContent) {
      const homeData = {
        heroName: 'Om Thacker',
        heroTitle: data.homeContent.hero_title || 'I build digital experiences that matter',
        heroSubtitle: data.homeContent.hero_subtitle || 'Full-stack developer passionate about creating innovative solutions with modern technologies.',
        heroStats: data.homeContent.hero_stats ? JSON.parse(data.homeContent.hero_stats) : [
          {"number":"50+","label":"Projects Built"},
          {"number":"3+","label":"Years Experience"},
          {"number":"15+","label":"Happy Clients"}
        ],
        aboutPreview: data.homeContent.about_preview || 'Passionate full-stack developer with expertise in modern web technologies and artificial intelligence.',
        ctaTitle: data.homeContent.cta_title || 'Let\'s work together',
        ctaSubtitle: data.homeContent.cta_subtitle || 'I\'m always interested in hearing about new projects and opportunities.',
        profileName: 'Om Thacker',
        profileStatus: 'Available for new projects',
        profileTechStack: 'React, Node.js, Python, AI/ML'
      };
      
      await axios.put(`${PRODUCTION_API}/home`, homeData, { headers });
      console.log('✅ Updated home content');
    }

    // Update about content
    if (data.aboutContent) {
      const aboutData = {
        jobTitle: data.aboutContent.job_title || 'Professional Developer',
        jobIcon: data.aboutContent.job_icon || '💻',
        whoIAm: data.aboutContent.who_i_am || 'Passionate developer with expertise in modern web technologies and artificial intelligence. With years of experience in building scalable applications, I focus on creating solutions that make a real impact.',
        whatIDo: data.aboutContent.what_i_do || JSON.stringify([
          'Full-Stack Web Development',
          'AI & Machine Learning Solutions',
          'Mobile Application Development',
          'Cloud Architecture & DevOps',
          'Technical Consulting'
        ]),
        technicalSkills: data.aboutContent.technical_skills ? JSON.parse(data.aboutContent.technical_skills) : []
      };
      
      await axios.put(`${PRODUCTION_API}/about`, aboutData, { headers });
      console.log('✅ Updated about content');
    }

    // Update resume
    if (data.resume) {
      const resumeData = {
        name: 'Om Thacker',
        profession: data.resume.profession || 'Full Stack Developer',
        summary: data.resume.summary || 'Experienced full-stack developer with expertise in modern web technologies and AI/ML solutions.',
        email: 'om@omthacker.com',
        phone: data.resume.phone || '',
        location: data.resume.location || 'Remote / Global',
        linkedin: 'https://linkedin.com/in/omthacker',
        website: 'https://omthacker.com',
        education: data.resume.education ? JSON.parse(data.resume.education) : [],
        experience: data.resume.experience ? JSON.parse(data.resume.experience) : [],
        technologies: data.resume.technologies ? JSON.parse(data.resume.technologies) : [],
        aiSkills: data.resume.ai_skills ? JSON.parse(data.resume.ai_skills) : []
      };
      
      await axios.post(`${PRODUCTION_API}/resume`, resumeData, { headers });
      console.log('✅ Updated resume data');
    }

  } catch (error) {
    console.error('❌ Failed to update production data:', error.response?.data?.error || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting production data migration...\n');

  // Step 1: Authenticate
  const authenticated = await authenticateAdmin();
  if (!authenticated) {
    process.exit(1);
  }

  // Step 2: Get local data
  console.log('📖 Reading local database...');
  const localData = await getLocalData();
  console.log('✅ Local data retrieved');

  // Step 3: Update production
  console.log('🔄 Updating production database...');
  await updateProductionData(localData);

  console.log('\n✅ Migration completed successfully!');
  console.log('🌐 Production site should now reflect your personalized data.');
}

main().catch(error => {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
});