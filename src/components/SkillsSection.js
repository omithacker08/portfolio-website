import React, { useState, useEffect } from 'react';
import './SkillsSection.css';

const SkillsSection = ({ skills = [] }) => {
  const [animatedSkills, setAnimatedSkills] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedSkills(skills);
    }, 500);
    return () => clearTimeout(timer);
  }, [skills]);

  const defaultSkills = [
    { name: 'React', level: 90, category: 'Frontend' },
    { name: 'Node.js', level: 85, category: 'Backend' },
    { name: 'JavaScript', level: 95, category: 'Programming' },
    { name: 'Python', level: 80, category: 'Programming' },
    { name: 'AWS', level: 75, category: 'Cloud' },
    { name: 'Docker', level: 70, category: 'DevOps' }
  ];

  const skillsToShow = skills.length > 0 ? skills : defaultSkills;
  const categories = [...new Set(skillsToShow.map(skill => skill.category))];

  const getSkillColor = (level) => {
    if (level >= 90) return '#34c759';
    if (level >= 75) return '#007AFF';
    if (level >= 60) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <div className="skills-section">
      <div className="skills-header">
        <h3>Technical Skills</h3>
        <p>Proficiency levels based on experience and project complexity</p>
      </div>

      <div className="skills-categories">
        {categories.map(category => (
          <div key={category} className="skill-category">
            <h4 className="category-title">{category}</h4>
            <div className="skills-grid">
              {skillsToShow
                .filter(skill => skill.category === category)
                .map((skill, index) => (
                  <div key={skill.name} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-percentage">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-progress"
                        style={{
                          width: animatedSkills.includes(skill) ? `${skill.level}%` : '0%',
                          backgroundColor: getSkillColor(skill.level),
                          transitionDelay: `${index * 100}ms`
                        }}
                      />
                    </div>
                    <div className="skill-level">
                      {skill.level >= 90 && <span className="level-badge expert">Expert</span>}
                      {skill.level >= 75 && skill.level < 90 && <span className="level-badge advanced">Advanced</span>}
                      {skill.level >= 60 && skill.level < 75 && <span className="level-badge intermediate">Intermediate</span>}
                      {skill.level < 60 && <span className="level-badge beginner">Beginner</span>}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="skills-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{skillsToShow.length}</span>
            <span className="stat-label">Skills</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{categories.length}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Math.round(skillsToShow.reduce((acc, skill) => acc + skill.level, 0) / skillsToShow.length)}%
            </span>
            <span className="stat-label">Avg Level</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;