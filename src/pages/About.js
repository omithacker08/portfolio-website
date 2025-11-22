import React, { useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import SkillsSection from '../components/SkillsSection';
import Timeline from '../components/Timeline';
import TestimonialSection from '../components/TestimonialSection';
import './About.css';

const About = () => {
  const { siteConfig, aboutContent, resume, loadResume } = useData();

  useEffect(() => {
    // Load admin resume for timeline data
    if (!resume) {
      loadResume(1);
    }
  }, [resume, loadResume]);

  const timelineEvents = useMemo(() => {
    const events = [];
    
    // Add education events
    if (resume?.education) {
      resume.education.forEach(edu => {
        const startYear = edu.startDate ? new Date(edu.startDate).getFullYear() : null;
        if (startYear && !isNaN(startYear)) {
          events.push({
            year: startYear.toString(),
            title: edu.degree,
            description: `${edu.institution}${edu.gpa ? ` - GPA: ${edu.gpa}` : ''}${edu.percentage ? ` - ${edu.percentage}%` : ''}`,
            type: 'education',
            icon: '🎓'
          });
        }
      });
    }
    
    // Add work experience events
    if (resume?.experience) {
      resume.experience.forEach(exp => {
        const startYear = exp.startDate ? new Date(exp.startDate).getFullYear() : null;
        if (startYear && !isNaN(startYear)) {
          events.push({
            year: startYear.toString(),
            title: exp.position,
            description: `${exp.company} - ${exp.responsibilities}`,
            type: 'work',
            icon: '💼'
          });
        }
      });
    }
    
    // Sort by year (newest first) and add fallback events if empty
    const sortedEvents = events.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    
    if (sortedEvents.length === 0) {
      return [
        {
          year: '2024',
          title: 'Senior Full-Stack Developer',
          description: 'Leading development of enterprise-level applications with focus on AI integration.',
          type: 'work',
          icon: '💼'
        },
        {
          year: '2022',
          title: 'AI Specialist Certification',
          description: 'Specialized in machine learning and artificial intelligence solutions.',
          type: 'education',
          icon: '🎓'
        }
      ];
    }
    
    return sortedEvents;
  }, [resume]);



  return (
    <div className="about-page">
      <div className="container">
        <section className="about-hero">
          <h1>About Me</h1>
          <p>Passionate developer creating innovative digital solutions</p>
        </section>

        <section className="about-content">
          <div className="grid grid-2">
            <div className="about-text">
              <h2>Who I Am</h2>
              <p>
                {aboutContent?.who_i_am || "I'm a passionate full-stack developer with expertise in modern web technologies and artificial intelligence. With years of experience in building scalable applications, I focus on creating solutions that make a real impact."}
              </p>
              
              <h3>What I Do</h3>
              <ul>
                {aboutContent?.what_i_do ? 
                  (typeof aboutContent.what_i_do === 'string' && aboutContent.what_i_do.startsWith('[') ? 
                    JSON.parse(aboutContent.what_i_do) : 
                    Array.isArray(aboutContent.what_i_do) ? aboutContent.what_i_do : [aboutContent.what_i_do]
                  ).map((service, index) => (
                    <li key={index}>{service}</li>
                  )) : 
                  [
                    'Full-Stack Web Development',
                    'AI & Machine Learning Solutions',
                    'Mobile Application Development', 
                    'Cloud Architecture & DevOps',
                    'Technical Consulting'
                  ].map((service, index) => (
                    <li key={index}>{service}</li>
                  ))
                }
              </ul>
            </div>
            
            <div className="about-image">
              <div className="image-placeholder">
                <div className="avatar">👨‍💻</div>
                <p>Professional Developer</p>
              </div>
            </div>
          </div>
        </section>

        <SkillsSection skills={[
          { name: 'React', level: 95, category: 'Frontend' },
          { name: 'JavaScript', level: 90, category: 'Frontend' },
          { name: 'TypeScript', level: 85, category: 'Frontend' },
          { name: 'Node.js', level: 88, category: 'Backend' },
          { name: 'Python', level: 82, category: 'Backend' },
          { name: 'Express', level: 85, category: 'Backend' },
          { name: 'MongoDB', level: 80, category: 'Database' },
          { name: 'PostgreSQL', level: 75, category: 'Database' },
          { name: 'AWS', level: 78, category: 'Cloud' },
          { name: 'Docker', level: 72, category: 'DevOps' },
          { name: 'TensorFlow', level: 70, category: 'AI/ML' },
          { name: 'PyTorch', level: 68, category: 'AI/ML' }
        ]} />

        <section className="values-section">
          <h2>My Values</h2>
          <div className="grid grid-3">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Quality First</h3>
              <p>I believe in delivering high-quality solutions that exceed expectations and stand the test of time.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>Constantly exploring new technologies and methodologies to create cutting-edge solutions.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Collaboration</h3>
              <p>Working closely with teams and clients to ensure successful project outcomes and mutual growth.</p>
            </div>
          </div>
        </section>

        <Timeline events={timelineEvents} />

        <TestimonialSection />
      </div>
    </div>
  );
};

export default About;