import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import NewsletterSignup from '../components/NewsletterSignup';
import LazyImage from '../components/LazyImage';
import './Home.css';

const Home = () => {
  const { siteConfig, blogs, projects, homeContent } = useData();

  return (
    <div className="home">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-greeting">👋 Hi, I'm {homeContent?.hero_name || 'Om Thacker'}</div>
              <h1 className="hero-title">
                {homeContent?.hero_title || 'I build digital experiences that matter'}
              </h1>
              <p className="hero-subtitle">
                {homeContent?.hero_subtitle || 'Full-stack developer passionate about creating innovative solutions with modern technologies.'}
              </p>
              <div className="hero-stats">
                {(homeContent?.hero_stats || [
                  {"number":"50+","label":"Projects Built"},
                  {"number":"3+","label":"Years Experience"},
                  {"number":"15+","label":"Happy Clients"}
                ]).map((stat, index) => (
                  <div key={index} className="stat">
                    <span className="stat-number">{stat.number}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className="hero-actions">
                <Link to="/projects" className="btn btn-primary">
                  View My Work
                </Link>
                <Link to="/contact" className="btn btn-secondary">
                  Let's Talk
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="profile-card">
                <div className="profile-image">
                  <div className="avatar">
                    {homeContent?.profile_name && homeContent.profile_name
                      .split(' ')
                      .map(name => name[0])
                      .join('')
                      .toUpperCase()
                    }
                  </div>
                  <div className="status-indicator"></div>
                </div>
                <div className="profile-info">
                  <h3>{homeContent?.profile_name || 'Om Thacker'}</h3>
                  <p>{homeContent?.profile_status || 'Available for new projects'}</p>
                  <div className="tech-stack">
                    {(homeContent?.profile_tech_stack || 'React, Node.js, Python, AI/ML')
                      .split(',')
                      .map((tech, index) => (
                        <span key={index}>{tech.trim()}</span>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-preview">
        <div className="container">
          <div className="section-content">
            <div className="section-text">
              <h2>About Me</h2>
              <p>
                I'm a passionate full-stack developer with a love for creating 
                beautiful, functional, and user-friendly applications. When I'm 
                not coding, you'll find me exploring new technologies, contributing 
                to open source, or sharing knowledge through my blog.
              </p>
              <div className="skills-preview">
                <div className="skill-item">
                  <span className="skill-icon">⚡</span>
                  <span>Fast Development</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🎨</span>
                  <span>UI/UX Design</span>
                </div>
                <div className="skill-item">
                  <span className="skill-icon">🚀</span>
                  <span>Performance</span>
                </div>
              </div>
              <Link to="/about" className="learn-more">
                Learn more about me →
              </Link>
            </div>
            <div className="section-visual">
              <div className="code-snippet">
                <div className="code-header">
                  <div className="code-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>portfolio.js</span>
                </div>
                <div className="code-content">
                  <div className="code-line">
                    <span className="code-keyword">const</span> 
                    <span className="code-variable"> developer</span> 
                    <span className="code-operator"> = </span>
                    <span className="code-string">{`{`}</span>
                  </div>
                  <div className="code-line">
                    <span className="code-property">  name:</span> 
                    <span className="code-string">'Om Thacker'</span>,
                  </div>
                  <div className="code-line">
                    <span className="code-property">  skills:</span> 
                    <span className="code-string">['React', 'Node.js']</span>,
                  </div>
                  <div className="code-line">
                    <span className="code-property">  passion:</span> 
                    <span className="code-string">'Building amazing apps'</span>
                  </div>
                  <div className="code-line">
                    <span className="code-string">{`}`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-work">
        <div className="container">
          <div className="section-header">
            <h2>Featured Work</h2>
            <p>Some projects I'm proud of</p>
          </div>

          <div className="projects-grid">
            {projects.slice(0, 3).map((project, index) => (
              <div key={project.id} className="project-card">
                <div className="project-image">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.name} />
                  ) : (
                    <div className="project-placeholder">
                      <span>🚀</span>
                    </div>
                  )}
                </div>
                <div className="project-content">
                  <h3>{project.name}</h3>
                  <p>{project.problemStatement}</p>
                  <div className="project-tech">
                    {project.technologies?.split(',').slice(0, 3).map((tech, i) => (
                      <span key={i} className="tech-tag">{tech.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-32">
            <Link to="/projects" className="btn btn-primary">
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      <section className="blog-preview">
        <div className="container">
          <div className="section-header">
            <h2>Latest Thoughts</h2>
            <p>Sharing what I learn along the way</p>
          </div>

          <div className="blog-grid">
            {blogs.filter(blog => !blog.is_draft).slice(0, 2).map((blog) => (
              <article key={blog.id} className="blog-card">
                <div className="blog-meta">
                  <time>{new Date(blog.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</time>
                  <span>5 min read</span>
                </div>
                <h3>{blog.title}</h3>
                <p>{blog.excerpt || blog.content.substring(0, 120)}...</p>
                <Link to="/blog" className="read-more">
                  Read more →
                </Link>
              </article>
            ))}
          </div>

          <div className="text-center mt-32">
            <Link to="/blog" className="btn btn-secondary">
              Read All Posts
            </Link>
          </div>
        </div>
      </section>

      <section className="newsletter-section">
        <div className="container">
          <NewsletterSignup />
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Let's work together</h2>
            <p>
              I'm always interested in hearing about new projects and opportunities.
            </p>
            <Link to="/contact" className="btn btn-primary">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;