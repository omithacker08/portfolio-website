import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';
import './Projects.css';

const Projects = () => {
  const { isAuthenticated, user } = useAuth();
  const { projects, addProject, updateProject, deleteProject } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    technologies: '',
    videoUrl: '',
    imageUrl: '',
    problemStatement: '',
    solutionSummary: '',
    benefits: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      author: user.name,
      authorId: user.id
    };
    
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      toast.success('Project updated successfully!');
      setEditingProject(null);
    } else {
      addProject(projectData);
      toast.success('Project added successfully!');
    }
    
    setFormData({
      name: '',
      domain: '',
      technologies: '',
      videoUrl: '',
      imageUrl: '',
      problemStatement: '',
      solutionSummary: '',
      benefits: ''
    });
    setShowCreateForm(false);
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      domain: project.domain,
      technologies: project.technologies,
      videoUrl: project.video_url || project.videoUrl || '',
      imageUrl: project.image_url || project.imageUrl || '',
      problemStatement: project.problem_statement || project.problemStatement,
      solutionSummary: project.solution_summary || project.solutionSummary,
      benefits: project.benefits
    });
    setEditingProject(project);
    setShowCreateForm(true);
  };

  const handleDelete = (project) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(project.id);
      toast.success('Project deleted successfully!');
    }
  };

  return (
    <div className="projects-page">
      <div className="container">
        <div className="projects-header">
          <h1>Projects</h1>
          {isAuthenticated ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              Add New Project
            </button>
          ) : (
            <p>Sign in to add your projects</p>
          )}
        </div>

        {showCreateForm && (
          <div className="modal">
            <div className="modal-content">
              <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Domain</label>
                  <input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    placeholder="e.g., Web Development, Mobile App, AI/ML"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Technologies Used</label>
                  <input
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    placeholder="React, Node.js, MongoDB, etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Problem Statement</label>
                  <textarea
                    name="problemStatement"
                    value={formData.problemStatement}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Solution Summary</label>
                  <textarea
                    name="solutionSummary"
                    value={formData.solutionSummary}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Benefits</label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Project Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Demo Video URL</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingProject ? 'Update Project' : 'Add Project'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!showCreateForm && (
          <div className="projects-grid">
            {projects.length === 0 ? (
            <div className="no-projects">
              <p>No projects available yet.</p>
              {isAuthenticated && (
                <p>Add your first project to showcase your work!</p>
              )}
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="project-card">
                {project.imageUrl && (
                  <img src={project.imageUrl} alt={project.name} className="project-image" />
                )}
                <div className="project-content">
                  <h3>{project.name}</h3>
                  <p className="project-domain">{project.domain}</p>
                  <p className="project-problem">{project.problemStatement}</p>
                  <div className="project-tech">
                    {project.technologies.split(',').map((tech, index) => (
                      <span key={index} className="tech-tag">{tech.trim()}</span>
                    ))}
                  </div>
                  <div className="project-details">
                    <h4>Solution</h4>
                    <p>{project.solution_summary || project.solutionSummary}</p>
                    <h4>Benefits</h4>
                    <p>{project.benefits}</p>
                  </div>
                  {project.videoUrl && (
                    <div className="project-video">
                      <a href={project.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                        Watch Demo
                      </a>
                    </div>
                  )}
                  <div className="project-footer">
                    <div className="project-meta">
                      <span>By {project.author_name || project.author}</span>
                      <span>{new Date(project.created_at || project.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                    {isAuthenticated && (user.id === project.author_id || user.role === 'admin') && (
                      <div className="project-actions">
                        <button onClick={() => handleEdit(project)} className="btn btn-sm btn-outline" title="Edit Project">
                          ✏️
                        </button>
                        <button onClick={() => handleDelete(project)} className="btn btn-sm btn-danger" title="Delete Project">
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;