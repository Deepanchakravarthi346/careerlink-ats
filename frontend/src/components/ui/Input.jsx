import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`ui-input-group ${className}`}>
      {label && <label className="ui-input-label">{label}</label>}
      <input className={`ui-input-field ${error ? 'ui-input-error' : ''}`} {...props} />
      {error && <span className="ui-input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
