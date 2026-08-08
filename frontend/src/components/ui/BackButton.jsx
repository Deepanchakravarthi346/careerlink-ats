import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Button from './Button';

const BackButton = ({ className = "", children, style, ...props }) => {
  const navigate = useNavigate();
  return (
    <Button 
      variant="secondary" 
      onClick={() => navigate(-1)} 
      className={`ui-back-btn ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      {...props}
    >
      <FaArrowLeft style={{ marginRight: '8px' }} /> {children || "Back"}
    </Button>
  );
};

export default BackButton;
