import React, { useState, useRef, useEffect } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      try {
        document.execCommand(command, false, value);
      } catch (error) {
        console.warn('execCommand not supported:', command);
      }
      updateContent();
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      execCommand('insertHTML', `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`);
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const insertCodeBlock = () => {
    execCommand('insertHTML', '<pre style="background: var(--bg-secondary); padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; margin: 16px 0;"><code>// Your code here</code></pre>');
  };

  const formatButtons = [
    { command: 'bold', icon: 'B', title: 'Bold' },
    { command: 'italic', icon: 'I', title: 'Italic' },
    { command: 'underline', icon: 'U', title: 'Underline' },
    { command: 'strikeThrough', icon: 'S', title: 'Strikethrough' },
  ];

  const structureButtons = [
    { command: 'formatBlock', value: 'h2', icon: 'H2', title: 'Heading 2' },
    { command: 'formatBlock', value: 'h3', icon: 'H3', title: 'Heading 3' },
    { command: 'formatBlock', value: 'p', icon: 'P', title: 'Paragraph' },
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
  ];

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          {formatButtons.map((btn) => (
            <button
              key={btn.command}
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand(btn.command)}
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          {structureButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand(btn.command, btn.value)}
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          {listButtons.map((btn) => (
            <button
              key={btn.command}
              type="button"
              className="toolbar-btn"
              onClick={() => execCommand(btn.command)}
              title={btn.title}
            >
              {btn.icon}
            </button>
          ))}
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowImageDialog(true)}
            title="Insert Image"
          >
            📷
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={insertCodeBlock}
            title="Insert Code Block"
          >
            &lt;/&gt;
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('insertHTML', '<hr style="margin: 24px 0; border: none; height: 1px; background: var(--border-color);" />')}
            title="Insert Divider"
          >
            ―
          </button>
        </div>

        <div className="toolbar-separator"></div>

        <div className="toolbar-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('createLink', prompt('Enter URL:'))}
            title="Insert Link"
          >
            🔗
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => execCommand('removeFormat')}
            title="Clear Formatting"
          >
            ✕
          </button>
        </div>
      </div>

      {showImageDialog && (
        <div className="image-dialog">
          <input
            type="url"
            placeholder="Enter image URL..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && insertImage()}
          />
          <button onClick={insertImage} className="btn btn-primary btn-sm">
            Insert
          </button>
          <button onClick={() => setShowImageDialog(false)} className="btn btn-secondary btn-sm">
            Cancel
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={updateContent}
        onBlur={updateContent}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        style={{ direction: 'ltr', textAlign: 'left' }}
      />

      <div className="editor-help">
        <small>
          💡 <strong>Tips:</strong> Use Ctrl+B for bold, Ctrl+I for italic. 
          Paste images by URL or use the image button.
        </small>
      </div>
    </div>
  );
};

export default RichTextEditor;