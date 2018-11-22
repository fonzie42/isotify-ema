import React from 'react';
import './topSongsAndArtists.css';

const topItem = ({ icon, title, subtitle, hasDivisor }) => (
  <div>
    <div className="top-item">
      <div className="top-item__icon-space">
        <div className="top-item__icon-ball">
          <img src={icon} className="top-item__icon" alt={title} />
        </div>
      </div>
      <div className="top-item__text">
        <p className="top-item__title">{title}</p>
        <p className="top-item__subtitle">{subtitle}</p>
      </div>
    </div>
    {hasDivisor && <div className="top-item__divisor-line" />}
  </div>
);

export default topItem;
