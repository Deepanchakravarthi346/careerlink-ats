import React from 'react';

const EmptyState = ({ title, description, action, icon }) => {
  return (
    <div className="ui-empty-state">
      {icon && <div className="ui-empty-icon">{icon}</div>}
      <h3 className="ui-empty-title">{title}</h3>
      {description && <p className="ui-empty-desc">{description}</p>}
      {action && <div className="ui-empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
