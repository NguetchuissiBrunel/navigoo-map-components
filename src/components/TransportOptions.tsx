import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const TransportOptions: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState('taxi');

  const transportOptions = [
    { id: 'taxi', name: 'Taxi', icon: '🚕', color: '#3498db' },
    { id: 'bus', name: 'Bus', icon: '🚌', color: '#2980b9' },
    { id: 'moto', name: 'Moto', icon: '🏍️', color: '#1abc9c' },
  ];

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('transportChange', { detail: selectedTransport }));
  }, [selectedTransport]);

  return (
    <div className={styles.optionsSection}>
      <div className={styles.optionsHeader}>
        <h3 className={styles.optionsTitle}>Moyen de transport</h3>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={styles.toggleButton}
        >
          {showOptions ? 'Réduire' : 'Options'}
        </button>
      </div>
      {showOptions && (
        <div className={styles.transportOptions}>
          {transportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedTransport(option.id)}
              className={`${styles.transportOption} ${
                selectedTransport === option.id ? styles.selected : ''
              }`}
              style={{
                backgroundColor: selectedTransport === option.id ? option.color : undefined,
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

export default TransportOptions;