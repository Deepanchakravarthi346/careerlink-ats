import React from 'react';

const Textarea = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`ui-input-group ${className}`}>
      {label && <label className="ui-input-label">{label}</label>}
      <textarea className={`ui-input-field ${error ? 'ui-input-error' : ''}`} {...props}></textarea>
      {error && <span className="ui-input-error-msg">{error}</span>}
    </div>
  );
};

export default Textarea;
