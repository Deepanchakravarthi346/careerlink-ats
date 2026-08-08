import React from 'react';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  return (
    <div className={`ui-avatar ui-avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="ui-avatar-placeholder">{alt ? alt.charAt(0).toUpperCase() : '?'}</div>
      )}
    </div>
  );
};

export default Avatar;
