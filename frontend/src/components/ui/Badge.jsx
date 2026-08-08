import React from 'react';

const Badge = ({ variant = 'primary', children, className = '' }) => {
  return (
    <span className={`ui-badge ui-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
