const axios = require('axios');

const PRODUCTION_API = 'https://portfolio-backend-qxhg.onrender.com/api';

// Admin credentials
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

async function clearHardcodedData() {
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Clear site config - set to minimal defaults
    const configData = {
      siteName: 'Om Thacker',
      tagline: 'Full Stack Developer',
      logoUrl: '',
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6'
      },
      content: {},
      social: {},
      seo: {}
    };
    
    await axios.put(`${PRODUCTION_API}/config`, configData, { headers });
    console.log('✅ Cleared site configuration');

    // Clear home content - set to minimal defaults
    const homeData = {
      heroName: 'Om Thacker',
      heroTitle: 'Full Stack Developer',
      heroSubtitle: '',
      heroStats: [],
      aboutPreview: '',
      ctaTitle: 'Get In Touch',
      ctaSubtitle: '',
      profileName: 'Om Thacker',
      profileStatus: 'Available',
      profileTechStack: ''
    };
    
    await axios.put(`${PRODUCTION_API}/home`, homeData, { headers });
    console.log('✅ Cleared home content');

    // Clear about content
    const aboutData = {
      jobTitle: 'Developer',
      jobIcon: '💻',
      whoIAm: '',
      whatIDo: JSON.stringify([]),
      technicalSkills: []
    };
    
    await axios.put(`${PRODUCTION_API}/about`, aboutData, { headers });
    console.log('✅ Cleared about content');

    // Clear resume data
    const resumeData = {
      name: 'Om Thacker',
      profession: '',
      summary: '',
      email: 'om@omthacker.com',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
      education: [],
      experience: [],
      technologies: [],
      aiSkills: []
    };
    
    await axios.post(`${PRODUCTION_API}/resume`, resumeData, { headers });
    console.log('✅ Cleared resume data');

    console.log('\n✅ All hardcoded data cleared from production!');
    console.log('🎯 You can now manually enter your real information through the admin panel.');

  } catch (error) {
    console.error('❌ Failed to clear data:', error.response?.data?.error || error.message);
    throw error;
  }
}

async function main() {
  console.log('🧹 Clearing all hardcoded data from production...\n');

  const authenticated = await authenticateAdmin();
  if (!authenticated) {
    process.exit(1);
  }

  await clearHardcodedData();
}

main().catch(error => {
  console.error('❌ Clear operation failed:', error.message);
  process.exit(1);
});