const axios = require('axios');

const API_URL = 'https://portfolio-backend-qxhg.onrender.com/api';

async function updateResume() {
  try {
    // Login first
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login: SUCCESS');

    // Complete resume data from local database
    const resumeData = {
      name: "Om Thacker",
      title: "Full Stack Developer | Tech Lead | Certified AI Project Manager",
      summary: "Passionate full-stack developer with expertise in modern web technologies and AI solutions. 12+ years of experience, Completed Masters of Computer Applications from Mumbai university, currently working as a Tech Lead at TIAA. Worked on multiple domains like ERP, Healthcare, Finance throughout my career and implemented multiple enterprise grade solutions from scratch. Have experience of working as a Tech Lead, Project Manager and solution architect role.",
      email: "omi.thacker08@gmail.com",
      phone: "+91 9870915196",
      location: "Mumbai, MH",
      linkedin: "https://linkedin.com/in/om-thacker",
      website: "alexjohnson.dev",
      education: [
        {
          id: 1,
          degree: "Master of Computer Application",
          institution: "University of Mumbai",
          startDate: "2010-06-20",
          endDate: "2013-06-15",
          gpa: "",
          percentage: "68"
        },
        {
          id: 1761203677705,
          degree: "Bachelor of Information Technology",
          institution: "University of Mumbai",
          startDate: "2007-06-12",
          endDate: "2010-06-15",
          gpa: "",
          percentage: "64.97"
        },
        {
          id: 1761203862957,
          degree: "HSC",
          institution: "University of Mumbai",
          startDate: "2005-06-12",
          endDate: "2007-06-01",
          gpa: "",
          percentage: "60"
        },
        {
          id: 1761203863574,
          degree: "SSC",
          institution: "University of Mumbai",
          startDate: "2004-06-01",
          endDate: "2005-06-01",
          gpa: "",
          percentage: "63"
        }
      ],
      experience: [
        {
          id: 1,
          company: "TIAA",
          position: "Senior Associate, Lead Cloud specialist",
          startDate: "2020-01-27",
          endDate: "",
          current: true,
          responsibilities: "Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies.\nLead the PI planning for the Team and work closely with Product Owner and Product Manager for end-to-end delivery plan and excution."
        },
        {
          id: 1761207963049,
          company: "Citiustech",
          position: "Tech Lead",
          startDate: "2016-05-01",
          endDate: "2020-01-25",
          current: false,
          responsibilities: "Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies."
        },
        {
          id: 1761208169200,
          company: "GlobeOp Finanacial Services",
          position: "Senior Associate",
          startDate: "2015-06-04",
          endDate: "2016-04-30",
          current: false,
          responsibilities: "Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies."
        },
        {
          id: 1761208221911,
          company: "EclinicalWorks",
          position: "Senior Software Engineer",
          startDate: "2015-06-01",
          endDate: "2016-06-01",
          current: false,
          responsibilities: "Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies."
        },
        {
          id: 1761208282474,
          company: "Expenzing | Nexstep",
          position: "Senior Software Engineer",
          startDate: "2013-02-04",
          endDate: "2015-05-31",
          current: false,
          responsibilities: "Lead development of web applications using Spring boot, Python, React, Node.js, and cloud technologies."
        }
      ],
      skills: [
        {
          id: 1,
          name: "React",
          category: "Frontend",
          proficiency: "Expert",
          yearsOfExperience: "4"
        },
        {
          id: 1763804291838,
          name: "Java",
          category: "Backend",
          proficiency: "Expert",
          yearsOfExperience: "12"
        },
        {
          id: 1763804312695,
          name: "Spring framework",
          category: "Backend",
          proficiency: "Advanced",
          yearsOfExperience: "7"
        },
        {
          id: 1763804339259,
          name: "SQL",
          category: "Database",
          proficiency: "Advanced",
          yearsOfExperience: "9.5"
        },
        {
          id: 1763804354601,
          name: "Python",
          category: "Backend",
          proficiency: "Intermediate",
          yearsOfExperience: "2"
        }
      ],
      achievements: [
        {
          id: 1,
          useCase: "Machine Learning Models",
          summary: "Developed predictive models for business analytics",
          technologies: "Python, TensorFlow, Scikit-learn",
          impact: "25% improvement in prediction accuracy"
        }
      ]
    };

    // Update resume
    const response = await axios.post(`${API_URL}/resume`, resumeData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\nResume update response:', response.data);
    console.log('\nResume updated successfully with complete data!');

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

updateResume();