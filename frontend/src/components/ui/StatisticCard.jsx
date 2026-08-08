import React from 'react';
import Card from './Card';

const StatisticCard = ({ title, value, icon, className = '' }) => {
  return (
    <Card className={`ui-stat-card ${className}`}>
      <div className="ui-stat-info">
        <h4 className="ui-stat-title">{title}</h4>
        <span className="ui-stat-value">{value}</span>
      </div>
      {icon && <div className="ui-stat-icon">{icon}</div>}
    </Card>
  );
};

export default StatisticCard;
