import React from 'react';

const Skeleton = ({ type = 'text', count = 1, className = '' }) => {
  const skeletons = Array(count).fill(0);
  return (
    <>
      {skeletons.map((_, i) => (
        <div key={i} className={`ui-skeleton ui-skeleton-${type} ${className}`}></div>
      ))}
    </>
  );
};

export default Skeleton;
