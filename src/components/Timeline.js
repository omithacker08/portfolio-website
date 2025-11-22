import React, { useState, useEffect } from 'react';
import './Timeline.css';

const Timeline = ({ events = [] }) => {
  const [visibleEvents, setVisibleEvents] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleEvents(prev => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const timelineItems = document.querySelectorAll('.timeline-event');
    timelineItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [events]);

  const defaultEvents = [
    {
      year: '2024',
      title: 'Senior Full-Stack Developer',
      description: 'Leading development of enterprise applications with AI integration',
      type: 'work',
      icon: '💼'
    },
    {
      year: '2022',
      title: 'AI Specialist Certification',
      description: 'Completed advanced machine learning and AI specialization',
      type: 'education',
      icon: '🎓'
    },
    {
      year: '2020',
      title: 'Full-Stack Developer',
      description: 'Started building comprehensive web applications',
      type: 'work',
      icon: '💻'
    },
    {
      year: '2018',
      title: 'Programming Journey Begins',
      description: 'First line of code and passion for technology',
      type: 'milestone',
      icon: '🚀'
    }
  ];

  const timelineEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h3>Career Journey</h3>
        <p>Key milestones and achievements in my professional development</p>
      </div>
      
      <div className="timeline">
        <div className="timeline-line"></div>
        
        {timelineEvents.map((event, index) => (
          <div
            key={index}
            className={`timeline-event ${visibleEvents.includes(index) ? 'visible' : ''}`}
            data-index={index}
          >
            <div className="timeline-marker">
              <div className={`timeline-icon ${event.type}`}>
                {event.icon}
              </div>
            </div>
            <div className="timeline-content">
              <h4 className="timeline-title">{event.title}</h4>
              <p className="timeline-description">{event.description}</p>
              <div className="badge-with-year">
                <div className={`timeline-badge ${event.type}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </div>
                <div className="timeline-year">{event.year}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;