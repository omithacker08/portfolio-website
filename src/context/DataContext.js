import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../utils/api';
import toast from 'react-hot-toast';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState({
    site_name: 'Portfolio Website',
    tagline: 'Building Amazing Digital Experiences',
    logo: '',
    primary_color: '#007AFF',
    secondary_color: '#5856D6'
  });

  const [blogs, setBlogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [aiProjects, setAiProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [resume, setResume] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [homeContent, setHomeContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    config: false,
    blogs: false,
    projects: false,
    aiProjects: false,
    users: false
  });

  const setLoadingState = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };

  // Load initial data
  useEffect(() => {
    loadSiteConfig();
    loadBlogs();
    loadProjects();
    loadAiProjects();
    loadAboutContent();
    loadHomeContent();
  }, []);

  const loadSiteConfig = async () => {
    try {
      setLoadingState('config', true);
      const config = await ApiService.getSiteConfig();
      if (config) {
        setSiteConfig(config);
        console.log('Loaded config from database:', config);
      }
    } catch (error) {
      console.error('Failed to load site config:', error);
      // Use defaults only if database fails
      setSiteConfig({
        site_name: 'Portfolio Website',
        tagline: 'Building Amazing Digital Experiences',
        primary_color: '#007AFF',
        secondary_color: '#5856D6'
      });
    } finally {
      setLoadingState('config', false);
    }
  };

  const updateSiteConfig = async (config) => {
    try {
      console.log('Updating site config:', config);
      const response = await ApiService.updateSiteConfig(config);
      setSiteConfig(config);
      // Reload from database to ensure consistency
      await loadSiteConfig();
      toast.success('Site configuration updated!');
      return response;
    } catch (error) {
      console.error('Failed to update site config:', error);
      toast.error('Failed to update site configuration: ' + error.message);
      throw error;
    }
  };

  const loadBlogs = async () => {
    try {
      setLoadingState('blogs', true);
      const blogsData = await ApiService.getBlogs();
      setBlogs(blogsData || []);
    } catch (error) {
      console.error('Failed to load blogs:', error);
      setBlogs([]);
    } finally {
      setLoadingState('blogs', false);
    }
  };

  const addBlog = async (blog) => {
    try {
      setLoading(true);
      const result = await ApiService.createBlog(blog);
      await loadBlogs(); // Reload to get updated data
      return result;
    } catch (error) {
      console.error('Failed to create blog:', error);
      toast.error('Failed to create blog: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (id, updatedBlog) => {
    try {
      await ApiService.updateBlog(id, updatedBlog);
      await loadBlogs();
      toast.success('Blog updated successfully!');
    } catch (error) {
      console.error('Failed to update blog:', error);
      toast.error('Failed to update blog');
    }
  };

  const deleteBlog = async (id) => {
    try {
      await ApiService.deleteBlog(id);
      await loadBlogs();
      toast.success('Blog deleted successfully!');
    } catch (error) {
      console.error('Failed to delete blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await ApiService.getProjects();
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    }
  };

  const addProject = async (project) => {
    try {
      setLoading(true);
      console.log('Creating project with data:', project);
      const result = await ApiService.createProject(project);
      console.log('Project creation result:', result);
      await loadProjects();
      toast.success('Project added successfully!');
      return result;
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id, project) => {
    try {
      await ApiService.updateProject(id, project);
      await loadProjects();
      toast.success('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project');
    }
  };

  const deleteProject = async (id) => {
    try {
      await ApiService.deleteProject(id);
      await loadProjects();
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const loadAiProjects = async () => {
    try {
      const aiProjectsData = await ApiService.getAiProjects();
      setAiProjects(aiProjectsData || []);
    } catch (error) {
      console.error('Failed to load AI projects:', error);
      setAiProjects([]);
    }
  };

  const addAiProject = async (aiProject) => {
    try {
      setLoading(true);
      const result = await ApiService.createAiProject(aiProject);
      await loadAiProjects();
      return result;
    } catch (error) {
      console.error('Failed to create AI project:', error);
      toast.error('Failed to create AI project');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAiProject = async (id, aiProject) => {
    try {
      await ApiService.updateAiProject(id, aiProject);
      await loadAiProjects();
      toast.success('AI project updated successfully!');
    } catch (error) {
      console.error('Failed to update AI project:', error);
      toast.error('Failed to update AI project');
    }
  };

  const deleteAiProject = async (id) => {
    try {
      await ApiService.deleteAiProject(id);
      await loadAiProjects();
      toast.success('AI project deleted successfully!');
    } catch (error) {
      console.error('Failed to delete AI project:', error);
      toast.error('Failed to delete AI project');
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await ApiService.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      await ApiService.updateUser(id, userData);
      await loadUsers();
      toast.success('User updated successfully!');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  const deleteUser = async (id) => {
    try {
      await ApiService.deleteUser(id);
      await loadUsers();
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const loadResume = async (userId) => {
    try {
      const resumeData = await ApiService.getResume(userId);
      setResume(resumeData);
    } catch (error) {
      console.error('Failed to load resume:', error);
      // No localStorage fallback - force database usage
      setResume(null);
    }
  };

  const updateResume = async (resumeData) => {
    try {
      await ApiService.updateResume(resumeData);
      setResume(resumeData);
      toast.success('Resume updated successfully!');
      return true;
    } catch (error) {
      console.error('Failed to update resume:', error);
      toast.error('Failed to update resume: ' + error.message);
      throw error;
    }
  };

  const loadAboutContent = async () => {
    try {
      const aboutData = await ApiService.getAboutContent();
      setAboutContent(aboutData);
    } catch (error) {
      console.error('Failed to load about content:', error);
    }
  };

  const updateAboutContent = async (aboutData) => {
    try {
      await ApiService.updateAboutContent(aboutData);
      setAboutContent(aboutData);
      toast.success('About content updated successfully!');
    } catch (error) {
      console.error('Failed to update about content:', error);
      toast.error('Failed to update about content');
    }
  };

  const loadHomeContent = async () => {
    try {
      const homeData = await ApiService.getHomeContent();
      setHomeContent(homeData);
    } catch (error) {
      console.error('Failed to load home content:', error);
    }
  };

  const updateHomeContent = async (homeData) => {
    try {
      console.log('Updating home content:', homeData);
      await ApiService.updateHomeContent(homeData);
      setHomeContent(homeData); // Update local state
      toast.success('Home content updated successfully!');
    } catch (error) {
      console.error('Failed to update home content:', error);
      toast.error('Failed to update home content: ' + error.message);
    }
  };

  const value = {
    siteConfig,
    updateSiteConfig,
    blogs,
    loadBlogs,
    addBlog,
    updateBlog,
    deleteBlog,
    projects,
    addProject,
    updateProject,
    deleteProject,
    aiProjects,
    addAiProject,
    updateAiProject,
    deleteAiProject,
    users,
    loadUsers,
    updateUser,
    deleteUser,
    resume,
    loadResume,
    updateResume,
    aboutContent,
    updateAboutContent,
    homeContent,
    updateHomeContent,
    loading,
    loadingStates
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};