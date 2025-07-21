import React, { useState, useEffect } from 'react';

interface TransportOptionsProps {
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  toggleButtonClassName?: string;
  optionsClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
  iconClassName?: string;
  nameClassName?: string;
}

const TransportOptions: React.FC<TransportOptionsProps> = ({
  className,
  headerClassName,
  titleClassName,
  toggleButtonClassName,
  optionsClassName,
  optionClassName,
  selectedOptionClassName,
  iconClassName,
  nameClassName,
}) => {
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
    <div className={className}>
      <div className={headerClassName}>
        <h3 className={titleClassName}>Moyen de transport</h3>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={toggleButtonClassName}
        >
          {showOptions ? 'Réduire' : 'Options'}
        </button>
      </div>
      {showOptions && (
        <div className={optionsClassName}>
          {transportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedTransport(option.id)}
              className={`${optionClassName} ${selectedTransport === option.id ? selectedOptionClassName : ''}`}
              style={{
                backgroundColor: selectedTransport === option.id ? option.color : undefined,
              }}
            >
              <span className={iconClassName}>{option.icon}</span>
              <span className={nameClassName}>{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransportOptions;