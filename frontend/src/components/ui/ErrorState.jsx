import React from 'react';
import EmptyState from './EmptyState';

const ErrorState = ({ message, onRetry }) => {
  return (
    <EmptyState 
      title="Something went wrong" 
      description={message || "An error occurred while fetching data."}
      action={onRetry && <button className="ui-btn ui-btn-secondary" onClick={onRetry}>Try Again</button>}
    />
  );
};

export default ErrorState;
