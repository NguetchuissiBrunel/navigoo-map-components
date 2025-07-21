import React, { useState } from 'react';

interface TripTypeProps {
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

const TripType: React.FC<TripTypeProps> = ({
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
  const [selectedTripType, setSelectedTripType] = useState('individuel');

  const tripTypeOptions = [
    { id: 'individuel', name: 'Individuel', icon: '👤', color: '#3498db' },
    { id: 'ramassage', name: 'Ramassage', icon: '👥', color: '#9b59b6' },
  ];

  return (
    <div className={className}>
      <div className={headerClassName}>
        <h3 className={titleClassName}>Type de trajet</h3>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className={toggleButtonClassName}
        >
          {showOptions ? 'Réduire' : 'Options'}
        </button>
      </div>
      {showOptions && (
        <div className={optionsClassName}>
          {tripTypeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedTripType(option.id)}
              className={`${optionClassName} ${selectedTripType === option.id ? selectedOptionClassName : ''}`}
              style={{
                backgroundColor: selectedTripType === option.id ? option.color : undefined,
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

export default TripType;