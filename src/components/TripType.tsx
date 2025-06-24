import React, { useState } from 'react';
import styles from './styles.module.css';

const TripType: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTripType, setSelectedTripType] = useState('individuel');

  const tripTypeOptions = [
    { id: 'individuel', name: 'Individuel', icon: '👤', color: '#3498db' },
    { id: 'ramassage', name: 'Ramassage', icon: '👥', color: '#9b59b6' },
  ];

  return (
    <div className={styles.optionsSection}>
      <div className={styles.optionsHeader}>
        <h3 className={styles.optionsTitle}>Type de trajet</h3>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={styles.toggleButton}
        >
          {showOptions ? 'Réduire' : 'Options'}
        </button>
      </div>
      {showOptions && (
        <div className={styles.transportOptions}>
          {tripTypeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedTripType(option.id)}
              className={`${styles.transportOption} ${
                selectedTripType === option.id ? styles.selected : ''
              }`}
              style={{
                backgroundColor: selectedTripType === option.id ? option.color : undefined,
              }}
            >
              <span className={styles.transportIcon}>{option.icon}</span>
              <span className={styles.transportName}>{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripType;