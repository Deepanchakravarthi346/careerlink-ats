import React from 'react';

const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="ui-loader-fullscreen">
        <div className="ui-spinner"></div>
      </div>
    );
  }
  return <div className="ui-spinner"></div>;
};

export default Loader;
