import React, { useState, useEffect } from 'react';
import ApiService from '../utils/api';
import toast from 'react-hot-toast';

const ContentTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'blog',
    templateData: {
      title: '',
      content: '',
      tags: '',
      excerpt: ''
    }
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await ApiService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createTemplate(newTemplate);
      toast.success('Template created successfully');
      setShowCreateForm(false);
      setNewTemplate({
        name: '',
        type: 'blog',
        templateData: { title: '', content: '', tags: '', excerpt: '' }
      });
      loadTemplates();
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await ApiService.deleteTemplate(id);
      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleUseTemplate = (template) => {
    // Copy template data to clipboard or emit event
    navigator.clipboard.writeText(JSON.stringify(template.template_data, null, 2));
    toast.success('Template data copied to clipboard');
  };

  return (
    <div className="content-templates">
      <div className="templates-header">
        <h2>Content Templates</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          Create Template
        </button>
      </div>

      {showCreateForm && (
        <div className="template-form-modal">
          <div className="modal-content">
            <h3>Create New Template</h3>
            <form onSubmit={handleCreateTemplate}>
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Type</label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                >
                  <option value="blog">Blog Post</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title Template</label>
                <input
                  type="text"
                  value={newTemplate.templateData.title}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    templateData: {...newTemplate.templateData, title: e.target.value}
                  })}
                />
              </div>

              <div className="form-group">
                <label>Content Template</label>
                <textarea
                  value={newTemplate.templateData.content}
                  onChange={(e) => setNewTemplate({
                    ...newTemplate,
                    templateData: {...newTemplate.templateData, content: e.target.value}
                  })}
                  rows="6"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create</button>
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

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h3>{template.name}</h3>
              <span className="template-type">{template.type}</span>
            </div>
            
            <div className="template-preview">
              <p><strong>Title:</strong> {template.template_data.title}</p>
              <p><strong>Content:</strong> {template.template_data.content?.substring(0, 100)}...</p>
            </div>
            
            <div className="template-actions">
              <button 
                onClick={() => handleUseTemplate(template)}
                className="btn btn-primary btn-sm"
              >
                Use Template
              </button>
              <button 
                onClick={() => handleDeleteTemplate(template.id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentTemplates;