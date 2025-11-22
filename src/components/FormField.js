import React, { useState, useEffect } from 'react';
import './FormField.css';

const FormField = ({
  type = 'text',
  name,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  validation,
  className,
  disabled = false,
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const validateField = (val) => {
    if (required && (!val || val.trim() === '')) {
      return `${label} is required`;
    }

    if (validation) {
      if (validation.minLength && val.length < validation.minLength) {
        return `${label} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && val.length > validation.maxLength) {
        return `${label} must be less than ${validation.maxLength} characters`;
      }
      if (validation.pattern && !validation.pattern.test(val)) {
        return validation.message || `${label} format is invalid`;
      }
      if (validation.custom) {
        return validation.custom(val);
      }
    }

    return '';
  };

  useEffect(() => {
    if (touched) {
      const errorMsg = validateField(value);
      setError(errorMsg);
      setIsValid(!errorMsg);
    }
  }, [value, touched, label, required, validation]);

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    if (onChange) onChange(e);
    if (touched) {
      const errorMsg = validateField(e.target.value);
      setError(errorMsg);
      setIsValid(!errorMsg);
    }
  };

  const fieldClass = `
    form-field 
    ${className || ''} 
    ${error ? 'error' : ''} 
    ${isValid && touched ? 'valid' : ''}
    ${disabled ? 'disabled' : ''}
  `.trim();

  return (
    <div className={fieldClass}>
      {label && (
        <label htmlFor={name} className="field-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className="field-input-container">
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="field-input"
            {...props}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="field-input"
            {...props}
          />
        )}
        
        {touched && (
          <div className="field-status">
            {error ? (
              <span className="error-icon">⚠️</span>
            ) : isValid ? (
              <span className="success-icon">✅</span>
            ) : null}
          </div>
        )}
      </div>
      
      {error && touched && (
        <div className="field-error">{error}</div>
      )}
    </div>
  );
};

export default FormField;