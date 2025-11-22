import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';
import './AI.css';

const AI = () => {
  const { isAuthenticated, user } = useAuth();
  const { aiProjects, addAiProject, updateAiProject, deleteAiProject } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    useCase: '',
    benefits: '',
    domain: '',
    cost: '',
    problemStatement: ''
  });

  const resetForm = () => {
    setFormData({
      useCase: '',
      benefits: '',
      domain: '',
      cost: '',
      problemStatement: ''
    });
    setEditingProject(null);
    setShowCreateForm(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const aiProjectData = {
      ...formData,
      author: user.name,
      authorId: user.id
    };
    
    if (editingProject) {
      await updateAiProject(editingProject.id, aiProjectData);
    } else {
      await addAiProject(aiProjectData);
    }
    resetForm();
  };

  const handleEdit = (project) => {
    setFormData({
      useCase: project.use_case || project.useCase,
      benefits: project.benefits,
      domain: project.domain,
      cost: project.cost,
      problemStatement: project.problem_statement || project.problemStatement
    });
    setEditingProject(project);
    setShowCreateForm(true);
  };

  const handleDelete = async (project) => {
    if (window.confirm('Are you sure you want to delete this AI project?')) {
      await deleteAiProject(project.id);
    }
  };

  const canEditProject = (project) => {
    return isAuthenticated && (user?.role === 'admin' || project.author_id === user?.id || project.authorId === user?.id);
  };

  return (
    <div className="ai-page">
      <div className="container">
        <div className="ai-header">
          <h1>AI Solutions</h1>
          {isAuthenticated ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              Add AI Project
            </button>
          ) : (
            <p>Sign in to submit AI projects</p>
          )}
        </div>

        <div className="ai-intro">
          <div className="intro-content">
            <h2>Artificial Intelligence & Machine Learning</h2>
            <p>
              Explore innovative AI solutions that solve real-world problems. From machine learning 
              algorithms to deep learning models, discover how artificial intelligence is transforming 
              industries and creating new possibilities.
            </p>
          </div>
        </div>

        {showCreateForm && (
          <div className="modal">
            <div className="modal-content">
              <h2>{editingProject ? 'Edit AI Project' : 'Submit AI Project'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>AI Use Case</label>
                  <input
                    type="text"
                    name="useCase"
                    value={formData.useCase}
                    onChange={handleInputChange}
                    placeholder="e.g., Image Recognition, Natural Language Processing"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Domain</label>
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Domain</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Problem Statement</label>
                  <textarea
                    name="problemStatement"
                    value={formData.problemStatement}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe the problem this AI solution addresses"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Benefits</label>
                  <textarea
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="What benefits does this AI solution provide?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Estimated Cost</label>
                  <select
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Cost Range</option>
                    <option value="Low ($1K - $10K)">Low ($1K - $10K)</option>
                    <option value="Medium ($10K - $50K)">Medium ($10K - $50K)</option>
                    <option value="High ($50K - $200K)">High ($50K - $200K)</option>
                    <option value="Enterprise ($200K+)">Enterprise ($200K+)</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingProject ? 'Update AI Project' : 'Submit AI Project'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
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
          <div className="ai-projects-grid">
            {aiProjects.length === 0 ? (
            <div className="no-ai-projects">
              <div className="ai-placeholder">
                <div className="ai-icon">🤖</div>
                <h3>No AI Projects Yet</h3>
                <p>Be the first to share an innovative AI solution!</p>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn btn-primary"
                  >
                    Submit First AI Project
                  </button>
                )}
              </div>
            </div>
          ) : (
            aiProjects.map((project) => (
              <div key={project.id} className="ai-project-card">
                <div className="ai-card-header">
                  <div className="ai-icon">🤖</div>
                  <div>
                    <h3>{project.use_case || project.useCase}</h3>
                    <span className="domain-badge">{project.domain}</span>
                  </div>
                </div>
                
                <div className="ai-card-content">
                  <div className="problem-section">
                    <h4>Problem Statement</h4>
                    <p>{project.problem_statement || project.problemStatement}</p>
                  </div>
                  
                  <div className="benefits-section">
                    <h4>Benefits</h4>
                    <p>{project.benefits}</p>
                  </div>
                  
                  <div className="cost-section">
                    <h4>Estimated Cost</h4>
                    <span className="cost-badge">{project.cost}</span>
                  </div>
                </div>
                
                <div className="ai-card-footer">
                  <div className="ai-card-meta">
                    <span>Submitted by {project.author_name || project.author}</span>
                    <span>{new Date(project.created_at || project.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  {canEditProject(project) && (
                    <div className="ai-card-actions">
                      <button
                        onClick={() => handleEdit(project)}
                        className="btn btn-sm btn-outline"
                        title="Edit AI Project"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="btn btn-sm btn-danger"
                        title="Delete AI Project"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
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

export default AI;