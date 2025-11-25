import React, { useState, useEffect } from 'react';
import './TestimonialSection.css';

const TestimonialSection = ({ testimonials = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const defaultTestimonials = [
    {
      name: 'Client Testimonial',
      role: 'Product Manager',
      company: 'TechCorp',
      content: 'Outstanding developer with exceptional problem-solving skills. Delivered our project ahead of schedule with remarkable quality.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Team Member',
      role: 'CTO',
      company: 'StartupXYZ',
      content: 'Incredible technical expertise and great communication. Made complex AI solutions accessible to our entire team.',
      rating: 5,
      avatar: '👨‍💻'
    },
    {
      name: 'Project Manager',
      role: 'Design Lead',
      company: 'Creative Agency',
      content: 'Perfect collaboration between design and development. Brought our vision to life with pixel-perfect implementation.',
      rating: 5,
      avatar: '👩‍🎨'
    }
  ];

  const testimonialsData = testimonials.length > 0 ? testimonials : defaultTestimonials;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonialsData.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ));
  };

  if (testimonialsData.length === 0) return null;

  return (
    <div className="testimonial-section">
      <div className="testimonial-header">
        <h3>Professional Feedback</h3>
        <p>Testimonials from collaborative projects and professional relationships</p>
      </div>

      <div className="testimonial-carousel">
        <button className="carousel-btn prev" onClick={prevSlide}>
          ←
        </button>

        <div className="testimonial-container">
          <div 
            className="testimonial-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonialsData.map((testimonial, index) => (
              <div key={index} className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-content">
                    <div className="quote-icon">"</div>
                    <p className="testimonial-text">{testimonial.content}</p>
                    <div className="testimonial-rating">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {testimonial.avatar}
                    </div>
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.name}</h4>
                      <p className="author-role">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="carousel-btn next" onClick={nextSlide}>
          →
        </button>
      </div>

      <div className="testimonial-dots">
        {testimonialsData.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialSection;