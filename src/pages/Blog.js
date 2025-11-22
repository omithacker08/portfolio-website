import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import RichTextEditor from '../components/RichTextEditor';
import BlogCard from '../components/BlogCard';
import LoadingSpinner, { SkeletonList } from '../components/LoadingSpinner';
import FormField from '../components/FormField';
import ApiService from '../utils/api';
import toast from 'react-hot-toast';
import './Blog.css';

const Blog = () => {
  const { isAuthenticated, user } = useAuth();
  const { blogs, addBlog, loadingStates, loadBlogs } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [blogLikes, setBlogLikes] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [drafts, setDrafts] = useState([]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    // Strip HTML tags for content validation
    const textContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      newErrors.content = 'Content is required';
    } else if (textContent.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }
    
    if (formData.excerpt && formData.excerpt.length > 200) {
      newErrors.excerpt = 'Excerpt must be less than 200 characters';
    }
    
    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid image URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content: content
    });
    
    if (errors.content) {
      setErrors({
        ...errors,
        content: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    
    try {
      const blogData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        tags: formData.tags,
        imageUrl: formData.image,
        author: user.name,
        authorId: user.id,
        approved: user.role === 'admin',
        likes: 0,
        comments: [],
        isDraft: isDraft
      };
      
      if (isDraft) {
        try {
          await ApiService.saveDraft(blogData);
          toast.success('Draft saved successfully!');
        } catch (error) {
          await addBlog({ ...blogData, isDraft: true });
          toast.success('Draft saved successfully!');
        }
      } else {
        await addBlog(blogData);
        toast.success('Blog post created successfully!');
      }
      setFormData({ title: '', content: '', excerpt: '', tags: '', image: '' });
      setShowCreateForm(false);
    } catch (error) {
      toast.error('Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  const approvedBlogs = blogs.filter(blog => blog.approved);

  const handleLikeBlog = async (blogId) => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const result = await ApiService.likeBlog(blogId);
      toast.success(result.liked ? 'Post liked!' : 'Like removed');
      // Reload blogs to get updated like counts
      await loadBlogs();
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like post');
    }
  };

  const handleReadMore = async (blog) => {
    setSelectedBlog(blog);
    
    try {
      const commentsData = await ApiService.getBlogComments(blog.id);
      setComments(commentsData);
      
      const likesData = await ApiService.getBlogLikes(blog.id);
      setBlogLikes(prev => ({ ...prev, [blog.id]: likesData.count }));
    } catch (error) {
      console.error('Failed to load blog details:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await ApiService.addBlogComment(selectedBlog.id, newComment);
      toast.success('Comment added successfully!');
      setNewComment('');
      
      // Reload comments
      const commentsData = await ApiService.getBlogComments(selectedBlog.id);
      setComments(commentsData);
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="blog-page">
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1>My Blog</h1>
            <p>Thoughts, tutorials, and insights from my journey</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn btn-primary"
            >
              {showCreateForm ? 'Cancel' : 'Write New Post'}
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="create-form-section">
            <div className="form-section">
              <h2>Create New Blog Post</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    Title *
                    <div className="tooltip">
                      <span className="tooltip-text">Choose a catchy, descriptive title for your post</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter your blog title..."
                    className={errors.title ? 'error' : ''}
                  />
                  {errors.title && <div className="form-error">{errors.title}</div>}
                </div>

                <div className="form-group">
                  <label>
                    Excerpt
                    <div className="tooltip">
                      <span className="tooltip-text">A brief summary that appears in blog previews (optional)</span>
                    </div>
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Brief description of your post (optional)..."
                    className={errors.excerpt ? 'error' : ''}
                  />
                  {errors.excerpt && <div className="form-error">{errors.excerpt}</div>}
                  <div className="char-count">{formData.excerpt.length}/200</div>
                </div>

                <div className="form-group">
                  <label>
                    Content *
                    <div className="tooltip">
                      <span className="tooltip-text">Write your full blog post content with rich formatting</span>
                    </div>
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your blog post... Use the toolbar above for formatting options."
                  />
                  {errors.content && <div className="form-error">{errors.content}</div>}
                </div>

                <div className="form-group">
                  <label>
                    Tags
                    <div className="tooltip">
                      <span className="tooltip-text">Separate tags with commas (e.g., react, javascript, tutorial)</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="react, javascript, web development"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Featured Image URL
                    <div className="tooltip">
                      <span className="tooltip-text">Add a cover image for your blog post (optional)</span>
                    </div>
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className={errors.image ? 'error' : ''}
                  />
                  {errors.image && <div className="form-error">{errors.image}</div>}
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={() => setIsDraft(false)}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" />
                        Publishing...
                      </>
                    ) : (
                      'Publish Post'
                    )}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-secondary"
                    disabled={loading}
                    onClick={() => setIsDraft(true)}
                  >
                    {loading ? 'Saving...' : 'Save Draft'}
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

        {selectedBlog && (
          <div className="blog-detail-section">
            <div className="blog-detail">
              <button
                onClick={() => setSelectedBlog(null)}
                className="back-btn"
              >
                ← Back to posts
              </button>
              <article>
                <header className="blog-header">
                  <h1>{selectedBlog.title}</h1>
                  <div className="blog-meta">
                    <span>By {selectedBlog.author_name || selectedBlog.author}</span>
                    <span>{new Date(selectedBlog.created_at || selectedBlog.createdAt).toLocaleDateString()}</span>
                    <span>{selectedBlog.likes || 0} likes</span>
                  </div>
                  {(selectedBlog.image_url || selectedBlog.image) && (
                    <img src={selectedBlog.image_url || selectedBlog.image} alt={selectedBlog.title} className="blog-image" />
                  )}
                </header>
                <div 
                  className="blog-content rich-content"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
                <div className="blog-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleLikeBlog(selectedBlog.id)}
                  >
                    👍 Like ({blogLikes[selectedBlog.id] || selectedBlog.likes || 0})
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/blog/${selectedBlog.id}`);
                      toast.success('Link copied to clipboard!');
                    }}
                  >
                    📤 Share
                  </button>
                </div>
                
                <div className="comments-section">
                  <h3>Comments ({comments.length})</h3>
                  
                  {isAuthenticated && (
                    <form onSubmit={handleAddComment} className="comment-form">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows="3"
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        Add Comment
                      </button>
                    </form>
                  )}
                  
                  <div className="comments-list">
                    {comments.length === 0 ? (
                      <p className="no-comments">No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                            <strong>{comment.author_name}</strong>
                            <span className="comment-date">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="comment-content">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </article>
            </div>
          </div>
        )}

        {!showCreateForm && !selectedBlog && (
          <div className="blog-grid">
            {loadingStates.blogs ? (
            <SkeletonList count={6} />
          ) : approvedBlogs.length === 0 ? (
            <div className="no-blogs">
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No blog posts yet</h3>
                <p>
                  {isAuthenticated 
                    ? "Be the first to share your thoughts!" 
                    : "Check back soon for new posts."
                  }
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn btn-primary"
                  >
                    Write First Post
                  </button>
                )}
              </div>
            </div>
          ) : (
            approvedBlogs.map((blog) => (
              <BlogCard 
                key={blog.id} 
                blog={{
                  ...blog,
                  author_name: blog.author_name || blog.author,
                  created_at: blog.created_at || blog.createdAt,
                  image_url: blog.image_url || blog.image
                }}
                onLike={handleLikeBlog}
                onShare={(blogId) => {
                  navigator.clipboard.writeText(`${window.location.origin}/blog/${blogId}`);
                  toast.success('Link copied to clipboard!');
                }}
                onReadMore={handleReadMore}
              />
            ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;