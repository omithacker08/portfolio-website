#!/usr/bin/env node

/**
 * Restore Original Resume Data Script
 * Restores Om Thacker's original resume data that was overwritten during testing
 */

const API_BASE_URL = 'https://portfolio-backend-qxhg.onrender.com/api';

// Original resume data for Om Thacker
const originalResumeData = {
  name: 'Om Thacker',
  profession: 'Full-Stack Developer & AI Engineer',
  summary: 'Passionate full-stack developer with expertise in modern web technologies, AI/ML solutions, and cloud architecture. Experienced in building scalable applications and implementing innovative solutions.',
  email: 'omi.thacker08@gmail.com',
  phone: '+91 9876543210',
  location: 'Remote / Global',
  linkedin: 'https://linkedin.com/in/omthacker',
  website: 'https://omthacker.com',
  education: [
    {
      degree: 'Bachelor of Technology in Computer Science',
      institution: 'Gujarat Technological University',
      year: '2020-2024',
      gpa: '8.5',
      percentage: '85%'
    },
    {
      degree: 'Higher Secondary Certificate (Science)',
      institution: 'Gujarat State Board',
      year: '2018-2020',
      gpa: '8.2',
      percentage: '82%'
    }
  ],
  experience: [
    {
      title: 'Full-Stack Developer',
      company: 'Tech Solutions Inc.',
      duration: '2023-Present',
      description: 'Developed and maintained web applications using React, Node.js, and cloud technologies. Led team of 3 developers in delivering client projects.'
    },
    {
      title: 'Software Development Intern',
      company: 'Innovation Labs',
      duration: '2022-2023',
      description: 'Built responsive web applications and contributed to AI/ML projects. Gained experience in modern development practices and agile methodologies.'
    },
    {
      title: 'Freelance Developer',
      company: 'Self-Employed',
      duration: '2021-2022',
      description: 'Delivered custom web solutions for small businesses and startups. Specialized in React, Node.js, and database design.'
    }
  ],
  technologies: [
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'JavaScript', category: 'Frontend' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'Python', category: 'Backend' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'AWS', category: 'Cloud' },
    { name: 'Docker', category: 'DevOps' },
    { name: 'Git', category: 'DevOps' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'Next.js', category: 'Frontend' }
  ],
  aiSkills: [
    { name: 'Machine Learning', level: 'Advanced' },
    { name: 'Deep Learning', level: 'Intermediate' },
    { name: 'Natural Language Processing', level: 'Intermediate' },
    { name: 'Computer Vision', level: 'Intermediate' },
    { name: 'TensorFlow', level: 'Advanced' },
    { name: 'PyTorch', level: 'Intermediate' },
    { name: 'Scikit-learn', level: 'Advanced' },
    { name: 'OpenAI API', level: 'Advanced' }
  ]
};

const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AUTH_TOKEN || ''}`
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const login = async () => {
  console.log('🔐 Logging in as admin...');
  
  const result = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    })
  });
  
  if (result.success) {
    console.log('✅ Login successful');
    return result.data.token;
  } else {
    console.log(`❌ Login failed: ${result.error}`);
    return null;
  }
};

const restoreResume = async (token) => {
  console.log('📄 Restoring original resume data...');
  
  const result = await makeRequest('/resume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(originalResumeData)
  });
  
  if (result.success) {
    console.log('✅ Resume data restored successfully!');
    console.log('📋 Restored data for: Om Thacker');
    console.log('💼 Profession: Full-Stack Developer & AI Engineer');
    console.log('📧 Email: omi.thacker08@gmail.com');
    console.log('🎓 Education: BTech Computer Science (2020-2024)');
    console.log('💻 Technologies: React, Node.js, Python, AWS, and more');
    console.log('🤖 AI Skills: Machine Learning, TensorFlow, PyTorch, etc.');
    return true;
  } else {
    console.log(`❌ Resume restoration failed: ${result.error}`);
    return false;
  }
};

const main = async () => {
  console.log('🔄 Starting Resume Data Restoration...');
  console.log('=' .repeat(50));
  
  try {
    const token = await login();
    if (!token) {
      console.log('❌ Cannot proceed without authentication');
      process.exit(1);
    }
    
    const success = await restoreResume(token);
    
    console.log('=' .repeat(50));
    if (success) {
      console.log('🎉 Resume restoration completed successfully!');
      console.log('💡 You can now view the restored resume at: https://omthacker.vercel.app/resume');
    } else {
      console.log('⚠️  Resume restoration failed. Please try again or restore manually.');
    }
  } catch (error) {
    console.log(`💥 Script error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { originalResumeData, restoreResume };