import React from 'react';
import LazyImage from './LazyImage';
import SocialShare from './SocialShare';
import './BlogCard.css';

const BlogCard = ({ blog, onLike, onShare, onReadMore }) => {

  const handleLike = () => {
    if (onLike) onLike(blog.id);
  };



  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <article className="blog-card">
      {blog.image_url && (
        <div className="blog-card-image">
          <LazyImage 
            src={blog.image_url} 
            alt={blog.title}
            className="blog-image"
          />
        </div>
      )}
      
      <div className="blog-card-content">
        <div className="blog-meta">
          <span className="blog-author">{blog.author_name}</span>
          <span className="blog-date">
            {new Date(blog.created_at).toLocaleDateString()}
          </span>
          <span className="reading-time">
            {getReadingTime(blog.content)} min read
          </span>
        </div>
        
        <h3 className="blog-title">{blog.title}</h3>
        
        <p className="blog-excerpt">
          {blog.excerpt || blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
        </p>
        
        {blog.tags && (
          <div className="blog-tags">
            {blog.tags.split(',').map((tag, index) => (
              <span key={index} className="blog-tag">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
        
        <div className="blog-actions">
          <button 
            className="action-btn like-btn"
            onClick={handleLike}
          >
            <span className="action-icon">❤️</span>
            <span className="action-count">{blog.likes || blog.like_count || 0}</span>
          </button>
          
          <SocialShare 
            title={blog.title}
            description={blog.excerpt}
            className="action-btn share-btn"
          />
          
          <button 
            className="action-btn read-btn"
            onClick={() => onReadMore && onReadMore(blog)}
          >
            <span className="action-text">Read More</span>
            <span className="action-icon">→</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;