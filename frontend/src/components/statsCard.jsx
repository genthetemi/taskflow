import React from 'react';

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="stats-card">
      <div className="stats-card-icon">
        <i className={`fas ${icon}`} aria-hidden="true"></i>
      </div>
      <div className="stats-card-content">
        <h3>{title}</h3>
        <p className="value">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
