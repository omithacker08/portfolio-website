import React, { useState } from 'react';
import toast from 'react-hot-toast';
import ApiService from '../utils/api';
import FileUpload from '../components/FileUpload';
import { useData } from '../context/DataContext';
import './Contact.css';

const Contact = () => {
  const { siteConfig } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  // Get contact info from site config with fallbacks
  const contactEmail = siteConfig?.content?.contact?.email || 'om@omthacker.com';
  const contactPhone = siteConfig?.content?.contact?.phone || 'Available on request';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await ApiService.sendContactMessage(formData);
      toast.success('Message sent successfully! I\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-hero">
          <h1>Get In Touch</h1>
          <p>Let's discuss your next project or collaboration opportunity</p>
        </div>

        <div className="contact-content">
          <div className="grid grid-2">
            <div className="contact-info">
              <h2>Let's Connect</h2>
              <p>
                I'm always interested in hearing about new opportunities, 
                interesting projects, or just having a chat about technology and innovation.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">📧</div>
                  <div>
                    <h3>Email</h3>
                    <p>{contactEmail}</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📱</div>
                  <div>
                    <h3>Phone</h3>
                    <p>{contactPhone}</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">📍</div>
                  <div>
                    <h3>Location</h3>
                    <p>Remote / Global</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">💼</div>
                  <div>
                    <h3>LinkedIn</h3>
                    <p>linkedin.com/in/omthacker</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h3>Follow Me</h3>
                <div className="social-icons">
                  <a href="https://github.com/omthacker" className="social-link" target="_blank" rel="noopener noreferrer">GitHub</a>
                  <a href="https://twitter.com/omthacker" className="social-link" target="_blank" rel="noopener noreferrer">Twitter</a>
                  <a href="https://linkedin.com/in/omthacker" className="social-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <a href="https://instagram.com/omthacker" className="social-link" target="_blank" rel="noopener noreferrer">Instagram</a>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <form onSubmit={handleSubmit} className="contact-form">
                <h2>Send Message</h2>
                
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Attachments (Optional)</label>
                  <FileUpload
                    onUpload={(file) => toast.success('File attached successfully')}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary submit-btn"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="availability-section">
          <div className="availability-card">
            <h2>Current Availability</h2>
            <div className="availability-status">
              <div className="status-indicator available"></div>
              <span>Available for new projects</span>
            </div>
            <p>
              I'm currently accepting new freelance projects and collaboration opportunities. 
              Whether you need a full-stack developer, AI consultant, or technical advisor, 
              I'd love to hear about your project.
            </p>
            <div className="response-time">
              <h3>Response Time</h3>
              <p>I typically respond to messages within 24 hours during business days.</p>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>What services do you offer?</h3>
              <p>
                I offer full-stack web development, AI/ML solutions, mobile app development, 
                technical consulting, and cloud architecture services.
              </p>
            </div>

            <div className="faq-item">
              <h3>What's your typical project timeline?</h3>
              <p>
                Project timelines vary based on complexity, but most web applications 
                take 4-12 weeks, while AI projects can range from 6-16 weeks.
              </p>
            </div>

            <div className="faq-item">
              <h3>Do you work with startups?</h3>
              <p>
                Absolutely! I love working with startups and helping them bring 
                their innovative ideas to life with the right technology stack.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can you help with existing projects?</h3>
              <p>
                Yes, I can help optimize, debug, or add new features to existing 
                applications. I'm experienced with legacy code and modernization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;