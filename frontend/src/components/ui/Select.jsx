import React from 'react';

const Select = ({ label, error, options, className = '', ...props }) => {
  return (
    <div className={`ui-input-group ${className}`}>
      {label && <label className="ui-input-label">{label}</label>}
      <select className={`ui-input-field ${error ? 'ui-input-error' : ''}`} {...props}>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="ui-input-error-msg">{error}</span>}
    </div>
  );
};

export default Select;
