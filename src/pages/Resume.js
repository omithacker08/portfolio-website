import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';
import './Resume.css';
import '../print.css';

const Resume = () => {
  const { isAuthenticated, user } = useAuth();
  const { resume, updateResume, loadResume } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    summary: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    education: [],
    experience: [],
    technologies: [],
    aiSkills: []
  });

  useEffect(() => {
    // Clear localStorage to ensure database is used
    localStorage.removeItem('resume');
    
    console.log('Resume useEffect triggered:', { isAuthenticated, user });
    
    if (isAuthenticated && user) {
      console.log('Loading resume for authenticated user:', user.id);
      loadResume(user.id);
    } else {
      console.log('Loading admin resume for public viewing');
      loadResume(1);
    }
  }, [isAuthenticated, user]); // Removed loadResume from dependencies

  useEffect(() => {
    // Only update form data if not currently editing
    if (isEditing) return;
    
    console.log('Resume data changed:', resume, 'isAuthenticated:', isAuthenticated);
    if (resume) {
      const newFormData = {
        name: resume.name || '',
        profession: resume.profession || '',
        summary: resume.summary || '',
        email: resume.email || '',
        phone: resume.phone || '',
        location: resume.location || '',
        linkedin: resume.linkedin || '',
        website: resume.website || '',
        education: Array.isArray(resume.education) ? resume.education : [],
        experience: Array.isArray(resume.experience) ? resume.experience : [],
        technologies: Array.isArray(resume.technologies) ? resume.technologies : [],
        aiSkills: Array.isArray(resume.aiSkills) ? resume.aiSkills : []
      };
      setFormData(newFormData);
    } else {
      const defaultFormData = {
        name: isAuthenticated ? '' : 'Alex Johnson',
        profession: isAuthenticated ? '' : 'Full Stack Developer',
        summary: isAuthenticated ? '' : 'Passionate full-stack developer with expertise in modern web technologies and AI solutions.',
        email: isAuthenticated ? '' : 'alex.johnson@example.com',
        phone: isAuthenticated ? '' : '+1 (555) 123-4567',
        location: isAuthenticated ? '' : 'San Francisco, CA',
        linkedin: isAuthenticated ? '' : 'linkedin.com/in/alexjohnson',
        website: isAuthenticated ? '' : 'alexjohnson.dev',
        education: isAuthenticated ? [] : [{
          id: 1,
          degree: 'Bachelor of Computer Science',
          institution: 'University of California',
          startDate: '2018-09-01',
          endDate: '2022-05-15',
          gpa: '3.8',
          percentage: '85.5'
        }],
        experience: isAuthenticated ? [] : [{
          id: 1,
          company: 'Tech Solutions Inc.',
          position: 'Senior Full Stack Developer',
          startDate: '2022-06-01',
          endDate: '',
          current: true,
          responsibilities: 'Lead development of web applications using React, Node.js, and cloud technologies.'
        }],
        technologies: isAuthenticated ? [] : [{
          id: 1,
          name: 'React',
          category: 'Frontend',
          proficiency: 'Expert',
          yearsOfExperience: '4'
        }],
        aiSkills: isAuthenticated ? [] : [{
          id: 1,
          useCase: 'Machine Learning Models',
          summary: 'Developed predictive models for business analytics',
          technologies: 'Python, TensorFlow, Scikit-learn',
          impact: '25% improvement in prediction accuracy'
        }]
      };
      setFormData(defaultFormData);
    }
  }, [resume, isAuthenticated, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, {
        id: Date.now(),
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
        gpa: '',
        percentage: ''
      }]
    });
  };

  const updateEducation = (id, field, value) => {
    setFormData({
      ...formData,
      education: formData.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id) => {
    setFormData({
      ...formData,
      education: formData.education.filter(edu => edu.id !== id)
    });
  };

  const addTechnology = () => {
    setFormData({
      ...formData,
      technologies: [...formData.technologies, {
        id: Date.now(),
        name: '',
        category: '',
        proficiency: '',
        yearsOfExperience: ''
      }]
    });
  };

  const updateTechnology = (id, field, value) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.map(tech => 
        tech.id === id ? { ...tech, [field]: value } : tech
      )
    });
  };

  const removeTechnology = (id) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(tech => tech.id !== id)
    });
  };

  const addAiSkill = () => {
    setFormData({
      ...formData,
      aiSkills: [...formData.aiSkills, {
        id: Date.now(),
        useCase: '',
        summary: '',
        technologies: '',
        impact: ''
      }]
    });
  };

  const updateAiSkill = (id, field, value) => {
    setFormData({
      ...formData,
      aiSkills: formData.aiSkills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    });
  };

  const removeAiSkill = (id) => {
    setFormData({
      ...formData,
      aiSkills: formData.aiSkills.filter(skill => skill.id !== id)
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, {
        id: Date.now(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        responsibilities: ''
      }]
    });
  };

  const updateExperience = (id, field, value) => {
    setFormData({
      ...formData,
      experience: formData.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter(exp => exp.id !== id)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateResume(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Resume update failed:', error);
    }
  };



  return (
    <div className="resume-page">
      <div className="container">
        <div className="resume-header no-print">
          <h1>Resume</h1>
          <div className="resume-actions">
            {isAuthenticated && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-primary"
              >
                {isEditing ? 'Cancel' : 'Edit Resume'}
              </button>
            )}
            {!isEditing && (
              <button onClick={() => window.print()} className="btn btn-secondary">
                Print Resume
              </button>
            )}
          </div>
        </div>

        {isAuthenticated && isEditing ? (
          <form onSubmit={handleSubmit} className="resume-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Profession</label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Professional Summary</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>Education</h3>
                <button type="button" onClick={addEducation} className="btn btn-secondary">
                  Add Education
                </button>
              </div>
              {formData.education.map((edu) => (
                <div key={edu.id} className="education-item">
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        min={edu.startDate}
                      />
                    </div>
                    <div className="form-group">
                      <label>GPA (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Percentage (Optional)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={edu.percentage || ''}
                        onChange={(e) => updateEducation(edu.id, 'percentage', e.target.value)}
                        placeholder="85.5"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="btn btn-danger remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>Work Experience</h3>
                <button type="button" onClick={addExperience} className="btn btn-secondary">
                  Add Experience
                </button>
              </div>
              {formData.experience.map((exp) => (
                <div key={exp.id} className="experience-item">
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        min={exp.startDate}
                        disabled={exp.current}
                        required={!exp.current}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      />
                      Currently working here
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Responsibilities</label>
                    <textarea
                      value={exp.responsibilities}
                      onChange={(e) => updateExperience(exp.id, 'responsibilities', e.target.value)}
                      rows="4"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="btn btn-danger remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>Technologies</h3>
                <button type="button" onClick={addTechnology} className="btn btn-secondary">
                  Add Technology
                </button>
              </div>
              {formData.technologies.map((tech) => (
                <div key={tech.id} className="technology-item">
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Technology Name</label>
                      <input
                        type="text"
                        value={tech.name}
                        onChange={(e) => updateTechnology(tech.id, 'name', e.target.value)}
                        placeholder="e.g., React, Python, AWS"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={tech.category}
                        onChange={(e) => updateTechnology(tech.id, 'category', e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                        <option value="Cloud">Cloud</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Mobile">Mobile</option>
                        <option value="AI/ML">AI/ML</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Proficiency</label>
                      <select
                        value={tech.proficiency}
                        onChange={(e) => updateTechnology(tech.id, 'proficiency', e.target.value)}
                        required
                      >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={tech.yearsOfExperience}
                        onChange={(e) => updateTechnology(tech.id, 'yearsOfExperience', e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTechnology(tech.id)}
                    className="btn btn-danger remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3>AI Skills & Projects</h3>
                <button type="button" onClick={addAiSkill} className="btn btn-secondary">
                  Add AI Skill
                </button>
              </div>
              {formData.aiSkills.map((skill) => (
                <div key={skill.id} className="ai-skill-item">
                  <div className="form-group">
                    <label>AI Use Case</label>
                    <input
                      type="text"
                      value={skill.useCase}
                      onChange={(e) => updateAiSkill(skill.id, 'useCase', e.target.value)}
                      placeholder="e.g., Natural Language Processing, Computer Vision"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Summary</label>
                    <textarea
                      value={skill.summary}
                      onChange={(e) => updateAiSkill(skill.id, 'summary', e.target.value)}
                      rows="3"
                      placeholder="Brief description of the AI implementation"
                      required
                    />
                  </div>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label>Technologies Used</label>
                      <input
                        type="text"
                        value={skill.technologies}
                        onChange={(e) => updateAiSkill(skill.id, 'technologies', e.target.value)}
                        placeholder="TensorFlow, PyTorch, OpenAI API"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Impact/Results</label>
                      <input
                        type="text"
                        value={skill.impact}
                        onChange={(e) => updateAiSkill(skill.id, 'impact', e.target.value)}
                        placeholder="95% accuracy, 50% time savings"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAiSkill(skill.id)}
                    className="btn btn-danger remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save Resume
              </button>
            </div>
          </form>
        ) : (
          <div className="resume-display">
            {(resume || formData.name || !isAuthenticated) ? (
              <div className="resume-content">
                <div className="resume-header-info">
                  <h2>{resume?.name || formData.name}</h2>
                  <h3>{resume?.profession || formData.profession}</h3>
                  <div className="contact-info">
                    {(resume?.email || formData.email) && <span>{resume?.email || formData.email}</span>}
                    {(resume?.phone || formData.phone) && <span>{resume?.phone || formData.phone}</span>}
                    {(resume?.location || formData.location) && <span>{resume?.location || formData.location}</span>}
                  </div>
                </div>

                {(resume?.summary || formData.summary) && (
                  <div className="resume-section">
                    <h4>Professional Summary</h4>
                    <p>{resume?.summary || formData.summary}</p>
                  </div>
                )}

                {((resume?.experience && resume.experience.length > 0) || (formData.experience && formData.experience.length > 0)) && (
                  <div className="resume-section">
                    <h4>Work Experience</h4>
                    {(resume?.experience || formData.experience).map((exp) => (
                      <div key={exp.id} className="experience-display">
                        <div className="exp-header">
                          <h5>{exp.position}</h5>
                          <span className="company">{exp.company}</span>
                          <span className="dates">
                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                          </span>
                        </div>
                        <p>{exp.responsibilities}</p>
                      </div>
                    ))}
                  </div>
                )}

                {((resume?.education && resume.education.length > 0) || (formData.education && formData.education.length > 0)) && (
                  <div className="resume-section">
                    <h4>Education</h4>
                    <div className="education-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Degree</th>
                            <th>Institution</th>
                            <th>Duration</th>
                            <th>GPA</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(resume?.education || formData.education).map((edu) => (
                            <tr key={edu.id}>
                              <td>{edu.degree}</td>
                              <td>{edu.institution}</td>
                              <td>
                                {edu.startDate && new Date(edu.startDate).getFullYear()} - 
                                {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                              </td>
                              <td>{edu.gpa || 'N/A'}</td>
                              <td>{edu.percentage ? `${edu.percentage}%` : 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {((resume?.technologies && resume.technologies.length > 0) || (formData.technologies && formData.technologies.length > 0)) && (
                  <div className="resume-section">
                    <h4>Technologies</h4>
                    <div className="technologies-grid">
                      {['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Mobile', 'AI/ML', 'Other']
                        .filter(category => (resume?.technologies || formData.technologies).some(tech => tech.category === category))
                        .map(category => (
                          <div key={category} className="tech-category">
                            <h5>{category}</h5>
                            <div className="tech-items">
                              {(resume?.technologies || formData.technologies)
                                .filter(tech => tech.category === category)
                                .map(tech => (
                                  <div key={tech.id} className="tech-item">
                                    <span className="tech-name">{tech.name}</span>
                                    <span className="tech-level">{tech.proficiency}</span>
                                    {tech.yearsOfExperience && (
                                      <span className="tech-years">{tech.yearsOfExperience}y</span>
                                    )}
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {((resume?.aiSkills && resume.aiSkills.length > 0) || (formData.aiSkills && formData.aiSkills.length > 0)) && (
                  <div className="resume-section">
                    <h4>AI Skills & Projects</h4>
                    <div className="ai-skills-list">
                      {(resume?.aiSkills || formData.aiSkills).map((skill) => (
                        <div key={skill.id} className="ai-skill-card">
                          <h5>{skill.useCase}</h5>
                          <p className="ai-summary">{skill.summary}</p>
                          <div className="ai-details">
                            <div className="ai-tech">
                              <strong>Technologies:</strong> {skill.technologies}
                            </div>
                            {skill.impact && (
                              <div className="ai-impact">
                                <strong>Impact:</strong> {skill.impact}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-resume">
                <p>No resume information available{isAuthenticated ? '. Click "Edit Resume" to add your details' : ''}.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resume;