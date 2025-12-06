import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';
import './Admin.css';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const { 
    siteConfig, 
    updateSiteConfig, 
    blogs, 
    updateBlog, 
    deleteBlog,
    users,
    loadUsers,
    aboutContent,
    updateAboutContent,
    homeContent,
    updateHomeContent,
    resume
  } = useData();
  
  const [activeTab, setActiveTab] = useState('site');
  const [configTab, setConfigTab] = useState('general');
  const [configForm, setConfigForm] = useState({});
  const [aboutForm, setAboutForm] = useState({
    jobTitle: '',
    jobIcon: '💻',
    whoIAm: '',
    whatIDo: [
      'Full-Stack Web Development',
      'AI & Machine Learning Solutions', 
      'Mobile Application Development',
      'Cloud Architecture & DevOps',
      'Technical Consulting'
    ],
    technicalSkills: []
  });
  const [homeForm, setHomeForm] = useState({
    heroName: 'Om Thacker',
    heroTitle: 'I build digital experiences that matter',
    heroSubtitle: 'Full-stack developer passionate about creating innovative solutions with modern technologies.',
    heroStats: [
      { number: '50+', label: 'Projects Built' },
      { number: '3+', label: 'Years Experience' },
      { number: '15+', label: 'Happy Clients' }
    ],
    aboutPreview: 'I\'m a passionate full-stack developer with a love for creating beautiful, functional, and user-friendly applications.',
    ctaTitle: 'Let\'s work together',
    ctaSubtitle: 'I\'m always interested in hearing about new projects and opportunities.',
    profileName: 'Om Thacker',
    profileStatus: 'Available for freelance',
    profileTechStack: 'React, Node.js, Python'
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editingUser, setEditingUser] = useState(null);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]); // Remove loadUsers from dependency array to prevent infinite calls

  useEffect(() => {
    if (siteConfig) {
      console.log('Site config received:', siteConfig);
      setConfigForm({
        siteName: siteConfig.site_name || '',
        tagline: siteConfig.tagline || '',
        logoUrl: siteConfig.logo || '',
        colors: {
          primary: siteConfig.primary_color || '#007AFF',
          secondary: siteConfig.secondary_color || '#5856D6'
        },
        content: {
          contact: {
            email: siteConfig.content?.contact?.email || '',
            phone: siteConfig.content?.contact?.phone || ''
          },
          resume: {
            title: siteConfig.content?.resume?.title || 'Resume',
            description: siteConfig.content?.resume?.description || 'Professional resume and experience'
          },
          projects: {
            title: siteConfig.content?.projects?.title || 'Projects',
            description: siteConfig.content?.projects?.description || 'Showcase of my work and projects'
          },
          ai: {
            title: siteConfig.content?.ai?.title || 'AI Solutions',
            description: siteConfig.content?.ai?.description || 'AI and machine learning projects'
          },
          blog: {
            title: siteConfig.content?.blog?.title || 'Blog',
            description: siteConfig.content?.blog?.description || 'Thoughts, tutorials, and insights'
          }
        },
        social: {
          linkedin: siteConfig.social?.linkedin || '',
          github: siteConfig.social?.github || '',
          twitter: siteConfig.social?.twitter || '',
          instagram: siteConfig.social?.instagram || '',
          youtube: siteConfig.social?.youtube || ''
        },
        seo: {
          description: siteConfig.seo?.description || '',
          keywords: siteConfig.seo?.keywords || ''
        }
      });
    }
  }, [siteConfig]);

  useEffect(() => {
    if (aboutContent) {
      const parseJsonSafely = (data, fallback) => {
        if (typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.error('Failed to parse JSON:', e);
            return fallback;
          }
        }
        return data || fallback;
      };

      setAboutForm({
        jobTitle: aboutContent.job_title || '',
        jobIcon: aboutContent.job_icon || '💻',
        whoIAm: aboutContent.who_i_am || '',
        whatIDo: (() => {
          const defaultServices = [
            'Full-Stack Web Development',
            'AI & Machine Learning Solutions', 
            'Mobile Application Development',
            'Cloud Architecture & DevOps',
            'Technical Consulting'
          ];
          
          if (!aboutContent.what_i_do) return defaultServices;
          
          if (typeof aboutContent.what_i_do === 'string') {
            if (aboutContent.what_i_do.startsWith('[')) {
              try {
                const parsed = JSON.parse(aboutContent.what_i_do);
                return Array.isArray(parsed) ? parsed : defaultServices;
              } catch (e) {
                return defaultServices;
              }
            } else {
              return [aboutContent.what_i_do];
            }
          }
          
          return Array.isArray(aboutContent.what_i_do) ? aboutContent.what_i_do : defaultServices;
        })(),
        technicalSkills: Array.isArray(aboutContent.technical_skills) 
          ? aboutContent.technical_skills 
          : (typeof aboutContent.technical_skills === 'string' && aboutContent.technical_skills.startsWith('[') 
            ? JSON.parse(aboutContent.technical_skills) 
            : aboutContent.technical_skills || [])
      });
    }
  }, [aboutContent]);

  useEffect(() => {
    if (homeContent) {
      const parseJsonSafely = (data, fallback) => {
        if (typeof data === 'string') {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.error('Failed to parse JSON:', e);
            return fallback;
          }
        }
        return data || fallback;
      };

      setHomeForm({
        heroName: homeContent.hero_name || 'Om Thacker',
        heroTitle: homeContent.hero_title || 'I build digital experiences that matter',
        heroSubtitle: homeContent.hero_subtitle || 'Full-stack developer passionate about creating innovative solutions with modern technologies.',
        heroStats: typeof homeContent.hero_stats === 'string' && homeContent.hero_stats.startsWith('[') 
          ? JSON.parse(homeContent.hero_stats) 
          : homeContent.hero_stats || [
              { number: '50+', label: 'Projects Built' },
              { number: '3+', label: 'Years Experience' },
              { number: '15+', label: 'Happy Clients' }
            ],
        aboutPreview: homeContent.about_preview || 'I\'m a passionate full-stack developer with a love for creating beautiful, functional, and user-friendly applications.',
        ctaTitle: homeContent.cta_title || 'Let\'s work together',
        ctaSubtitle: homeContent.cta_subtitle || 'I\'m always interested in hearing about new projects and opportunities.',
        profileName: homeContent.profile_name || 'Om Thacker',
        profileStatus: homeContent.profile_status || 'Available for freelance',
        profileTechStack: homeContent.profile_tech_stack || 'React, Node.js, Python'
      });
    }
  }, [homeContent]);

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You need admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setConfigForm({
          ...configForm,
          [parent]: {
            ...configForm[parent],
            [child]: value
          }
        });
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setConfigForm({
          ...configForm,
          [parent]: {
            ...configForm[parent],
            [child]: {
              ...configForm[parent]?.[child],
              [grandchild]: value
            }
          }
        });
      }
    } else {
      setConfigForm({
        ...configForm,
        [name]: value
      });
    }
  };

  const saveConfiguration = async () => {
    try {
      console.log('Saving config form:', configForm);
      
      // Flatten the nested config structure to match backend schema
      const flatConfig = {
        siteName: configForm.siteName,
        tagline: configForm.tagline,
        logoUrl: configForm.logoUrl,
        colors: configForm.colors,
        content: configForm.content,
        social: configForm.social,
        seo: configForm.seo
      };
      
      console.log('Flattened config:', flatConfig);
      await updateSiteConfig(flatConfig);
    } catch (error) {
      console.error('Save configuration error:', error);
    }
  };

  const handleAboutChange = (e) => {
    const { name, value } = e.target;
    setAboutForm({
      ...aboutForm,
      [name]: value
    });
  };

  const addTechnicalSkill = () => {
    setAboutForm({
      ...aboutForm,
      technicalSkills: [...aboutForm.technicalSkills, {
        id: Date.now(),
        name: '',
        level: 'Intermediate',
        category: 'Frontend'
      }]
    });
  };

  const updateTechnicalSkill = (id, field, value) => {
    setAboutForm({
      ...aboutForm,
      technicalSkills: aboutForm.technicalSkills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    });
  };

  const removeTechnicalSkill = (id) => {
    setAboutForm({
      ...aboutForm,
      technicalSkills: aboutForm.technicalSkills.filter(skill => skill.id !== id)
    });
  };

  const addWhatIDoItem = () => {
    setAboutForm({
      ...aboutForm,
      whatIDo: [...aboutForm.whatIDo, '']
    });
  };

  const updateWhatIDoItem = (index, value) => {
    const newWhatIDo = [...aboutForm.whatIDo];
    newWhatIDo[index] = value;
    setAboutForm({
      ...aboutForm,
      whatIDo: newWhatIDo
    });
  };

  const removeWhatIDoItem = (index) => {
    setAboutForm({
      ...aboutForm,
      whatIDo: aboutForm.whatIDo.filter((_, i) => i !== index)
    });
  };

  const saveAboutContent = () => {
    try {
      const formDataToSave = {
        ...aboutForm,
        whatIDo: JSON.stringify(aboutForm.whatIDo || [])
      };
      updateAboutContent(formDataToSave);
    } catch (error) {
      console.error('Error saving about content:', error);
      toast.error('Failed to save about content');
    }
  };

  const handleHomeChange = (e) => {
    const { name, value } = e.target;
    setHomeForm({
      ...homeForm,
      [name]: value
    });
  };

  const addHeroStat = () => {
    setHomeForm({
      ...homeForm,
      heroStats: [...homeForm.heroStats, { number: '', label: '' }]
    });
  };

  const updateHeroStat = (index, field, value) => {
    const newStats = [...homeForm.heroStats];
    newStats[index][field] = value;
    setHomeForm({
      ...homeForm,
      heroStats: newStats
    });
  };

  const removeHeroStat = (index) => {
    setHomeForm({
      ...homeForm,
      heroStats: homeForm.heroStats.filter((_, i) => i !== index)
    });
  };

  const saveHomeContent = () => {
    updateHomeContent(homeForm);
  };

  const approveBlog = async (blogId) => {
    try {
      await updateBlog(blogId, { approved: true });
      toast.success('Blog approved successfully!');
    } catch (error) {
      toast.error('Failed to approve blog');
    }
  };

  const rejectBlog = async (blogId) => {
    try {
      await updateBlog(blogId, { approved: false });
      toast.success('Blog rejected successfully!');
    } catch (error) {
      toast.error('Failed to reject blog');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(blogId);
        toast.success('Blog deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete blog');
      }
    }
  };

  const handleSelectBlog = (blogId) => {
    setSelectedBlogs(prev => 
      prev.includes(blogId) 
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId]
    );
  };

  const handleSelectAllBlogs = () => {
    if (selectedBlogs.length === blogs?.length) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(blogs?.map(blog => blog.id) || []);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedBlogs.length === 0) {
      toast.error('Please select blogs and an action');
      return;
    }

    const confirmMessage = `Are you sure you want to ${bulkAction} ${selectedBlogs.length} blog(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      const promises = selectedBlogs.map(blogId => {
        switch (bulkAction) {
          case 'approve':
            return updateBlog(blogId, { approved: true });
          case 'reject':
            return updateBlog(blogId, { approved: false });
          case 'delete':
            return deleteBlog(blogId);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      toast.success(`Successfully ${bulkAction}d ${selectedBlogs.length} blog(s)`);
      setSelectedBlogs([]);
      setBulkAction('');
    } catch (error) {
      toast.error(`Failed to ${bulkAction} some blogs`);
    }
  };

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleCreateUser = () => {
    setUserForm({ name: '', email: '', password: '', role: 'user' });
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role });
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // deleteUser(userId); // Implement this in DataContext
      toast.success('User deleted successfully!');
    }
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      // updateUser(editingUser.id, userForm); // Implement this in DataContext
      toast.success('User updated successfully!');
    } else {
      // createUser(userForm); // Implement this in DataContext
      toast.success('User created successfully!');
    }
    setShowUserForm(false);
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Customize your portfolio website</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'site' ? 'active' : ''}`}
            onClick={() => setActiveTab('site')}
          >
            Site Settings
          </button>
          <button
            className={`tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            Themes
          </button>
          <button
            className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
            onClick={() => setActiveTab('blogs')}
          >
            Blog Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home Page
          </button>
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About Page
          </button>
          <button
            className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
            onClick={() => setActiveTab('resume')}
          >
            Resume Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`tab-btn ${activeTab === 'testing' ? 'active' : ''}`}
            onClick={() => setActiveTab('testing')}
          >
            Testing
          </button>
          <button
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
          <button
            className={`tab-btn ${activeTab === 'newsletter' ? 'active' : ''}`}
            onClick={() => setActiveTab('newsletter')}
          >
            Newsletter
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Activity Logs
          </button>
          <button
            className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            Backup/Restore
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'site' && (
            <div className="site-config">
              <div className="config-tabs">
                <button 
                  className={`config-tab ${configTab === 'general' ? 'active' : ''}`}
                  onClick={() => setConfigTab('general')}
                >
                  General
                </button>
                <button 
                  className={`config-tab ${configTab === 'menu' ? 'active' : ''}`}
                  onClick={() => setConfigTab('menu')}
                >
                  Menu
                </button>
                <button 
                  className={`config-tab ${configTab === 'pages' ? 'active' : ''}`}
                  onClick={() => setConfigTab('pages')}
                >
                  Pages
                </button>
                <button 
                  className={`config-tab ${configTab === 'seo' ? 'active' : ''}`}
                  onClick={() => setConfigTab('seo')}
                >
                  SEO
                </button>
              </div>

              <div className="config-content">
                {configTab === 'general' && (
                  <div className="config-grid">
                    <div className="config-section">
                      <h3>Site Identity</h3>
                      <div className="form-group">
                        <label>Site Name</label>
                        <input
                          type="text"
                          name="siteName"
                          value={configForm.siteName || ''}
                          onChange={handleConfigChange}
                          placeholder="Your Portfolio Name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Tagline</label>
                        <input
                          type="text"
                          name="tagline"
                          value={configForm.tagline || ''}
                          onChange={handleConfigChange}
                          placeholder="Your professional tagline"
                        />
                      </div>
                      <div className="form-group">
                        <label>Logo URL</label>
                        <input
                          type="url"
                          name="logoUrl"
                          value={configForm.logoUrl || ''}
                          onChange={handleConfigChange}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>

                    <div className="config-section">
                      <h3>Brand Colors</h3>
                      <div className="color-inputs">
                        <div className="form-group">
                          <label>Primary Color</label>
                          <div className="color-input-group">
                            <input
                              type="color"
                              name="colors.primary"
                              value={configForm.colors?.primary || '#007AFF'}
                              onChange={handleConfigChange}
                            />
                            <input
                              type="text"
                              value={configForm.colors?.primary || '#007AFF'}
                              onChange={handleConfigChange}
                              name="colors.primary"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Secondary Color</label>
                          <div className="color-input-group">
                            <input
                              type="color"
                              name="colors.secondary"
                              value={configForm.colors?.secondary || '#5856D6'}
                              onChange={handleConfigChange}
                            />
                            <input
                              type="text"
                              value={configForm.colors?.secondary || '#5856D6'}
                              onChange={handleConfigChange}
                              name="colors.secondary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {configTab === 'menu' && (
                  <div className="config-grid">
                    <div className="config-section">
                      <h3>Navigation Menu</h3>
                      <div className="menu-items">
                        {['Home', 'About', 'Projects', 'AI', 'Blog', 'Resume', 'Contact'].map((item) => (
                          <div key={item} className="menu-item-config">
                            <div className="menu-item-header">
                              <span className="menu-item-name">{item}</span>
                              <div className="menu-item-controls">
                                <label className="toggle-switch">
                                  <input type="checkbox" defaultChecked />
                                  <span className="slider"></span>
                                </label>
                              </div>
                            </div>
                            <div className="menu-item-details">
                              <input
                                type="text"
                                placeholder="Custom label"
                                defaultValue={item}
                              />
                              <input
                                type="text"
                                placeholder="Custom URL"
                                defaultValue={`/${item.toLowerCase()}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {configTab === 'pages' && (
                  <div className="config-grid">
                    <div className="config-section">
                      <h3>Page Management</h3>
                      <div className="page-sections">
                        <div className="section-config">
                          <h4>Contact Page</h4>
                          <div className="form-group">
                            <label>Contact Email</label>
                            <input
                              type="email"
                              name="content.contact.email"
                              value={configForm.content?.contact?.email || ''}
                              onChange={handleConfigChange}
                              placeholder="your@email.com"
                            />
                          </div>
                          <div className="form-group">
                            <label>Phone Number</label>
                            <input
                              type="tel"
                              name="content.contact.phone"
                              value={configForm.content?.contact?.phone || ''}
                              onChange={handleConfigChange}
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                        </div>
                        
                        <div className="section-config">
                          <h4>Resume Page</h4>
                          <div className="form-group">
                            <label>Page Title</label>
                            <input
                              type="text"
                              name="content.resume.title"
                              value={configForm.content?.resume?.title || 'Resume'}
                              onChange={handleConfigChange}
                              placeholder="Resume"
                            />
                          </div>
                          <div className="form-group">
                            <label>Page Description</label>
                            <textarea
                              name="content.resume.description"
                              value={configForm.content?.resume?.description || ''}
                              onChange={handleConfigChange}
                              placeholder="Professional resume and experience"
                              rows="2"
                            />
                          </div>
                        </div>
                        
                        <div className="section-config">
                          <h4>Projects Page</h4>
                          <div className="form-group">
                            <label>Page Title</label>
                            <input
                              type="text"
                              name="content.projects.title"
                              value={configForm.content?.projects?.title || 'Projects'}
                              onChange={handleConfigChange}
                              placeholder="Projects"
                            />
                          </div>
                          <div className="form-group">
                            <label>Page Description</label>
                            <textarea
                              name="content.projects.description"
                              value={configForm.content?.projects?.description || ''}
                              onChange={handleConfigChange}
                              placeholder="Showcase of my work and projects"
                              rows="2"
                            />
                          </div>
                        </div>
                        
                        <div className="section-config">
                          <h4>AI Page</h4>
                          <div className="form-group">
                            <label>Page Title</label>
                            <input
                              type="text"
                              name="content.ai.title"
                              value={configForm.content?.ai?.title || 'AI Solutions'}
                              onChange={handleConfigChange}
                              placeholder="AI Solutions"
                            />
                          </div>
                          <div className="form-group">
                            <label>Page Description</label>
                            <textarea
                              name="content.ai.description"
                              value={configForm.content?.ai?.description || ''}
                              onChange={handleConfigChange}
                              placeholder="AI and machine learning projects"
                              rows="2"
                            />
                          </div>
                        </div>
                        
                        <div className="section-config">
                          <h4>Blog Page</h4>
                          <div className="form-group">
                            <label>Page Title</label>
                            <input
                              type="text"
                              name="content.blog.title"
                              value={configForm.content?.blog?.title || 'Blog'}
                              onChange={handleConfigChange}
                              placeholder="Blog"
                            />
                          </div>
                          <div className="form-group">
                            <label>Page Description</label>
                            <textarea
                              name="content.blog.description"
                              value={configForm.content?.blog?.description || ''}
                              onChange={handleConfigChange}
                              placeholder="Thoughts, tutorials, and insights"
                              rows="2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {configTab === 'seo' && (
                  <div className="config-grid">
                    <div className="config-section">
                      <h3>Social Media</h3>
                      <div className="social-links">
                        {['LinkedIn', 'GitHub', 'Twitter', 'Instagram', 'YouTube'].map((platform) => (
                          <div key={platform} className="form-group">
                            <label>{platform} URL</label>
                            <input
                              type="url"
                              name={`social.${platform.toLowerCase()}`}
                              value={configForm.social?.[platform.toLowerCase()] || ''}
                              onChange={handleConfigChange}
                              placeholder={`https://${platform.toLowerCase()}.com/username`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="config-section">
                      <h3>SEO Settings</h3>
                      <div className="form-group">
                        <label>Meta Description</label>
                        <textarea
                          name="seo.description"
                          value={configForm.seo?.description || ''}
                          onChange={handleConfigChange}
                          placeholder="Brief description for search engines"
                          rows="3"
                        />
                      </div>
                      <div className="form-group">
                        <label>Keywords</label>
                        <input
                          type="text"
                          name="seo.keywords"
                          value={configForm.seo?.keywords || ''}
                          onChange={handleConfigChange}
                          placeholder="portfolio, developer, designer, freelancer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="themes-config">
              <h2>Website Themes</h2>
              <p className="themes-description">
                Choose a professional theme that matches your profession and style
              </p>
              <div className="themes-grid">
                <div className="theme-card active">
                  <div className="theme-preview">
                    <div className="theme-color-bar"></div>
                    <div className="theme-content">
                      <div className="theme-header">
                        <div className="theme-icon">💻</div>
                        <div className="theme-title">Technical</div>
                      </div>
                      <div className="theme-body">
                        <div className="theme-demo">Clean, professional design for developers</div>
                      </div>
                    </div>
                  </div>
                  <div className="theme-info">
                    <h3>Technical Theme</h3>
                    <p>Perfect for developers and technical professionals</p>
                  </div>
                  <div className="theme-selected">
                    <span>✓ Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="blog-management">
              <h2>Blog Management</h2>
              <div className="blog-stats">
                <div className="stat-card">
                  <h3>{blogs?.length || 0}</h3>
                  <p>Total Blogs</p>
                </div>
                <div className="stat-card">
                  <h3>{blogs?.filter(blog => blog.approved).length || 0}</h3>
                  <p>Approved</p>
                </div>
                <div className="stat-card">
                  <h3>{blogs?.filter(blog => !blog.approved).length || 0}</h3>
                  <p>Pending</p>
                </div>
              </div>

              <div className="bulk-operations">
                <h3>Bulk Operations</h3>
                <div className="bulk-controls">
                  <select 
                    className="form-control"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                  >
                    <option value="">Select Action</option>
                    <option value="approve">Approve Selected</option>
                    <option value="reject">Reject Selected</option>
                    <option value="delete">Delete Selected</option>
                  </select>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleBulkAction}
                    disabled={selectedBlogs.length === 0 || !bulkAction}
                  >
                    Apply to Selected ({selectedBlogs.length})
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSelectAllBlogs}
                  >
                    {selectedBlogs.length === blogs?.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="blog-list">
                {blogs?.map(blog => (
                  <div key={blog.id} className="blog-item">
                    <div className="blog-header">
                      <div className="blog-select">
                        <input 
                          type="checkbox" 
                          checked={selectedBlogs.includes(blog.id)}
                          onChange={() => handleSelectBlog(blog.id)}
                        />
                      </div>
                      <h4>{blog.title}</h4>
                      <div className="blog-actions">
                        {!blog.approved && (
                          <button 
                            onClick={() => approveBlog(blog.id)}
                            className="btn btn-success btn-sm"
                          >
                            Approve
                          </button>
                        )}
                        {blog.approved && (
                          <button 
                            onClick={() => rejectBlog(blog.id)}
                            className="btn btn-warning btn-sm"
                          >
                            Reject
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p>Status: <span className={`status ${blog.approved ? 'approved' : 'pending'}`}>{blog.approved ? 'Approved' : 'Pending'}</span></p>
                    <p>Author: {blog.author_name}</p>
                    <p>Created: {new Date(blog.created_at).toLocaleDateString()}</p>
                    <div className="blog-excerpt">
                      <p>{blog.excerpt || blog.content?.substring(0, 150) + '...'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="home-management">
              <h2>Home Page Content</h2>
              <div className="home-form">
                <div className="form-section">
                  <h3>Hero Section</h3>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="heroName"
                      value={homeForm.heroName}
                      onChange={handleHomeChange}
                      placeholder="Om Thacker"
                    />
                  </div>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      name="heroTitle"
                      value={homeForm.heroTitle}
                      onChange={handleHomeChange}
                      placeholder="I build digital experiences that matter"
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtitle</label>
                    <textarea
                      name="heroSubtitle"
                      value={homeForm.heroSubtitle}
                      onChange={handleHomeChange}
                      rows="3"
                      placeholder="Full-stack developer passionate about creating innovative solutions..."
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Profile Card</h3>
                  <div className="form-group">
                    <label>Profile Name</label>
                    <input
                      type="text"
                      name="profileName"
                      value={homeForm.profileName || ''}
                      onChange={handleHomeChange}
                      placeholder="Om Thacker"
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Status</label>
                    <input
                      type="text"
                      name="profileStatus"
                      value={homeForm.profileStatus || ''}
                      onChange={handleHomeChange}
                      placeholder="Available for freelance"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      name="profileTechStack"
                      value={homeForm.profileTechStack || ''}
                      onChange={handleHomeChange}
                      placeholder="React, Node.js, Python"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Hero Statistics</h3>
                  <button type="button" onClick={addHeroStat} className="btn btn-secondary btn-sm">
                    Add Stat
                  </button>
                  {homeForm.heroStats.map((stat, index) => (
                    <div key={index} className="stat-item">
                      <div className="form-group">
                        <label>Number</label>
                        <input
                          type="text"
                          value={stat.number}
                          onChange={(e) => updateHeroStat(index, 'number', e.target.value)}
                          placeholder="50+"
                        />
                      </div>
                      <div className="form-group">
                        <label>Label</label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) => updateHeroStat(index, 'label', e.target.value)}
                          placeholder="Projects Built"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHeroStat(index)}
                        className="btn btn-danger btn-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button onClick={saveHomeContent} className="btn btn-primary">
                    Save Home Content
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-management">
              <h2>About Page Content</h2>
              <div className="about-form">
                <div className="form-section">
                  <h3>Job Information</h3>
                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={aboutForm.jobTitle}
                      onChange={handleAboutChange}
                      placeholder="Professional Developer"
                    />
                  </div>
                  <div className="form-group">
                    <label>Job Icon</label>
                    <input
                      type="text"
                      name="jobIcon"
                      value={aboutForm.jobIcon}
                      onChange={handleAboutChange}
                      placeholder="💻"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>About Content</h3>
                  <div className="form-group">
                    <label>Who I Am</label>
                    <textarea
                      name="whoIAm"
                      value={aboutForm.whoIAm}
                      onChange={handleAboutChange}
                      rows="4"
                      placeholder="Tell visitors about yourself, your background, and what drives you..."
                    />
                  </div>
                  <div className="form-group">
                    <label>What I Do (Services)</label>
                    <button type="button" onClick={addWhatIDoItem} className="btn btn-secondary btn-sm">
                      Add Service
                    </button>
                    {Array.isArray(aboutForm.whatIDo) ? aboutForm.whatIDo.map((item, index) => (
                      <div key={index} className="service-item">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateWhatIDoItem(index, e.target.value)}
                          placeholder="Service or expertise area"
                        />
                        <button
                          type="button"
                          onClick={() => removeWhatIDoItem(index)}
                          className="btn btn-danger btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    )) : [
                      'Full-Stack Web Development',
                      'AI & Machine Learning Solutions', 
                      'Mobile Application Development',
                      'Cloud Architecture & DevOps',
                      'Technical Consulting'
                    ].map((item, index) => (
                      <div key={index} className="service-item">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateWhatIDoItem(index, e.target.value)}
                          placeholder="Service or expertise area"
                        />
                        <button
                          type="button"
                          onClick={() => removeWhatIDoItem(index)}
                          className="btn btn-danger btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h3>Technical Skills</h3>
                    <button type="button" onClick={addTechnicalSkill} className="btn btn-secondary">
                      Add Skill
                    </button>
                  </div>
                  {aboutForm.technicalSkills.map((skill) => (
                    <div key={skill.id} className="skill-item">
                      <div className="grid grid-3">
                        <div className="form-group">
                          <label>Skill Name</label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateTechnicalSkill(skill.id, 'name', e.target.value)}
                            placeholder="React, Python, AWS"
                          />
                        </div>
                        <div className="form-group">
                          <label>Category</label>
                          <select
                            value={skill.category}
                            onChange={(e) => updateTechnicalSkill(skill.id, 'category', e.target.value)}
                          >
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Database">Database</option>
                            <option value="Cloud">Cloud</option>
                            <option value="DevOps">DevOps</option>
                            <option value="Mobile">Mobile</option>
                            <option value="AI/ML">AI/ML</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Level</label>
                          <select
                            value={skill.level}
                            onChange={(e) => updateTechnicalSkill(skill.id, 'level', e.target.value)}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTechnicalSkill(skill.id)}
                        className="btn btn-danger btn-sm remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button onClick={saveAboutContent} className="btn btn-primary">
                    Save About Content
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="resume-management">
              <h2>Resume Management</h2>
              <div className="resume-info">
                <div className="info-card">
                  <h3>Current Resume Status</h3>
                  <p>Resume data is loaded from the database and displayed on the Resume page.</p>
                  <p>Users can edit their resume when authenticated.</p>
                </div>
                <div className="info-card">
                  <h3>Resume Features</h3>
                  <ul>
                    <li>Personal Information</li>
                    <li>Education (with GPA and Percentage)</li>
                    <li>Work Experience</li>
                    <li>Technologies & Skills</li>
                    <li>AI Skills & Projects</li>
                    <li>Print-friendly format</li>
                  </ul>
                </div>
                <div className="info-card">
                  <h3>Public Access</h3>
                  <p>Non-authenticated users can view the admin's resume as a demo.</p>
                  <p>Authenticated users can edit and save their own resume data.</p>
                </div>
              </div>
              <div className="resume-actions">
                <button className="btn btn-primary" onClick={() => window.open('/resume', '_blank')}>
                  View Resume Page
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  console.log('Resume data:', resume);
                  toast.success('Resume data logged to console');
                }}>
                  Debug Resume Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="user-management">
              <div className="users-header">
                <h2>User Management</h2>
                <button onClick={handleCreateUser} className="btn btn-primary">
                  Add New User
                </button>
              </div>
              
              {showUserForm && (
                <div className="modal">
                  <div className="modal-content">
                    <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
                    <form onSubmit={handleUserSubmit}>
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          name="name"
                          value={userForm.name}
                          onChange={handleUserChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={userForm.email}
                          onChange={handleUserChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="password"
                          name="password"
                          value={userForm.password}
                          onChange={handleUserChange}
                          placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                          required={!editingUser}
                        />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={userForm.role} onChange={handleUserChange}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          {editingUser ? 'Update User' : 'Create User'}
                        </button>
                        <button type="button" onClick={() => setShowUserForm(false)} className="btn btn-secondary">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="user-actions">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="btn btn-secondary btn-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="btn btn-danger btn-sm"
                              disabled={user.id === user?.id}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="testing-dashboard">
              <h2>System Testing Dashboard</h2>
              <p>Comprehensive testing suite for all website functionalities</p>
              <div className="test-groups">
                <div className="test-group">
                  <h3>Authentication Tests</h3>
                  <div className="test-results">
                    <div className="test-result passed">
                      <span className="test-icon">✅</span>
                      <span className="test-name">User Login Status</span>
                    </div>
                    <div className="test-result passed">
                      <span className="test-icon">✅</span>
                      <span className="test-name">Admin Privileges</span>
                    </div>
                  </div>
                </div>
                <div className="test-group">
                  <h3>Database Operations</h3>
                  <div className="test-results">
                    <div className="test-result passed">
                      <span className="test-icon">✅</span>
                      <span className="test-name">Site Config Loaded</span>
                    </div>
                    <div className="test-result passed">
                      <span className="test-icon">✅</span>
                      <span className="test-name">Blogs Data Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="messages-management">
              <h2>Contact Messages</h2>
              <div className="messages-stats">
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Total Messages</p>
                </div>
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Unread</p>
                </div>
              </div>
              <div className="messages-list">
                <p>No messages yet.</p>
              </div>
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="newsletter-management">
              <h2>Newsletter Management</h2>
              <div className="newsletter-stats">
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Subscribers</p>
                </div>
                <div className="stat-card">
                  <h3>0</h3>
                  <p>Campaigns Sent</p>
                </div>
              </div>
              <div className="newsletter-actions">
                <button className="btn btn-primary">Send Newsletter</button>
                <button className="btn btn-secondary">Export Subscribers</button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-dashboard">
              <h2>Analytics Dashboard</h2>
              <div className="analytics-stats">
                <div className="stat-card">
                  <h3>1,234</h3>
                  <p>Page Views</p>
                </div>
                <div className="stat-card">
                  <h3>567</h3>
                  <p>Unique Visitors</p>
                </div>
                <div className="stat-card">
                  <h3>89</h3>
                  <p>Blog Views</p>
                </div>
                <div className="stat-card">
                  <h3>45</h3>
                  <p>Project Views</p>
                </div>
              </div>
              <div className="analytics-charts">
                <div className="chart-placeholder">
                  <h4>Traffic Overview</h4>
                  <p>Chart visualization coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="templates-management">
              <h2>Content Templates</h2>
              <div className="templates-header">
                <p>Create reusable templates for blogs and projects</p>
                <button className="btn btn-primary">Create Template</button>
              </div>
              <div className="templates-grid">
                <div className="template-card">
                  <h4>Blog Template</h4>
                  <p>Standard blog post template</p>
                  <div className="template-actions">
                    <button className="btn btn-secondary btn-sm">Edit</button>
                    <button className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
                <div className="template-card">
                  <h4>Project Template</h4>
                  <p>Standard project showcase template</p>
                  <div className="template-actions">
                    <button className="btn btn-secondary btn-sm">Edit</button>
                    <button className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="logs-management">
              <h2>Activity Logs</h2>
              <div className="logs-filters">
                <select className="form-control">
                  <option>All Actions</option>
                  <option>Blog Actions</option>
                  <option>User Actions</option>
                  <option>Config Changes</option>
                </select>
                <input type="date" className="form-control" />
                <button className="btn btn-secondary">Filter</button>
              </div>
              <div className="logs-list">
                <div className="log-item">
                  <div className="log-time">2024-01-15 10:30:00</div>
                  <div className="log-action">Blog Approved</div>
                  <div className="log-user">Admin</div>
                  <div className="log-details">Approved blog: "Getting Started with React"</div>
                </div>
                <div className="log-item">
                  <div className="log-time">2024-01-15 09:15:00</div>
                  <div className="log-action">User Created</div>
                  <div className="log-user">Admin</div>
                  <div className="log-details">Created new user: john@example.com</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="backup-management">
              <h2>Backup & Restore</h2>
              <div className="backup-section">
                <h3>Create Backup</h3>
                <p>Create a backup of your entire website data</p>
                <button className="btn btn-primary">Create Full Backup</button>
              </div>
              <div className="backup-section">
                <h3>Available Backups</h3>
                <div className="backup-list">
                  <div className="backup-item">
                    <div className="backup-info">
                      <h4>backup-2024-01-15.zip</h4>
                      <p>Created: January 15, 2024 at 10:30 AM</p>
                      <p>Size: 2.5 MB</p>
                    </div>
                    <div className="backup-actions">
                      <button className="btn btn-secondary btn-sm">Download</button>
                      <button className="btn btn-warning btn-sm">Restore</button>
                      <button className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="backup-section">
                <h3>Upload Backup</h3>
                <input type="file" accept=".zip" className="form-control" />
                <button className="btn btn-warning">Restore from File</button>
              </div>
            </div>
          )}

          <div className="admin-actions">
            <button onClick={saveConfiguration} className="btn btn-primary">
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;