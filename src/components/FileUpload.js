import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './FileUpload.css';

const FileUpload = ({ onUpload, accept = "image/*", maxSize = 5 * 1024 * 1024 }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file) => {
    if (file.size > maxSize) {
      toast.error('File too large. Max size: 5MB');
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for demo (in production, upload to cloud storage)
      const reader = new FileReader();
      reader.onload = () => {
        onUpload(reader.result);
        toast.success('File uploaded successfully');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Upload failed');
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div 
      className={`file-upload ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
        style={{ display: 'none' }}
        id="file-input"
      />
      <label htmlFor="file-input" className="upload-area">
        {uploading ? (
          <div>Uploading...</div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <div>Drop files here or click to upload</div>
          </>
        )}
      </label>
    </div>
  );
};

export default FileUpload;