import React, { useState } from 'react';
import './Gallery.css';

const Gallery = ({ images = [], videos = [] }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allMedia = [...images.map(img => ({ ...img, type: 'image' })), ...videos.map(vid => ({ ...vid, type: 'video' }))];

  const openLightbox = (media, index) => {
    setSelectedMedia(media);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  const navigate = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % allMedia.length 
      : (currentIndex - 1 + allMedia.length) % allMedia.length;
    setCurrentIndex(newIndex);
    setSelectedMedia(allMedia[newIndex]);
  };

  return (
    <div className="gallery">
      <div className="gallery-grid">
        {allMedia.map((media, index) => (
          <div key={index} className="gallery-item" onClick={() => openLightbox(media, index)}>
            {media.type === 'image' ? (
              <img src={media.src} alt={media.alt} loading="lazy" />
            ) : (
              <video src={media.src} poster={media.poster} />
            )}
            <div className="gallery-overlay">
              <span className="view-icon">👁️</span>
            </div>
          </div>
        ))}
      </div>

      {selectedMedia && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeLightbox}>×</button>
            {allMedia.length > 1 && (
              <>
                <button className="nav-btn prev" onClick={() => navigate('prev')}>‹</button>
                <button className="nav-btn next" onClick={() => navigate('next')}>›</button>
              </>
            )}
            {selectedMedia.type === 'image' ? (
              <img src={selectedMedia.src} alt={selectedMedia.alt} />
            ) : (
              <video src={selectedMedia.src} controls autoPlay />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;