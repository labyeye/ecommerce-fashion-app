import React from 'react';

interface FloatingElementsProps {
  density?: 'light' | 'medium' | 'heavy';
  className?: string;
}

const FloatingElements: React.FC<FloatingElementsProps> = ({ 
  density = 'medium',
  className = '' 
}) => {
  const elements = {
    light: 3,
    medium: 5,
    heavy: 8
  };

  const colors = [
    'bg-fashion-nude/20',
    'bg-fashion-rose-dust/30',
    'bg-fashion-sage/25',
    'bg-fashion-accent-brown/15',
    'bg-fashion-light-brown/20'
  ];

  const sizes = ['w-12 h-12', 'w-16 h-16', 'w-20 h-20', 'w-24 h-24', 'w-32 h-32'];
  
  const positions = [
    'top-10 left-10',
    'top-20 right-16',
    'bottom-32 left-20',
    'bottom-16 right-10',
    'top-1/3 right-1/4',
    'bottom-1/4 left-1/3',
    'top-1/2 left-10',
    'top-16 right-1/3'
  ];

  const animations = [
    'animate-float',
    'animate-soft-pulse',
    'animate-float',
    'animate-soft-pulse'
  ];

  const animationDelays = ['0s', '1s', '2s', '3s', '4s', '5s', '6s', '7s'];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: elements[density] }).map((_, index) => (
        <div
          key={index}
          className={`
            absolute 
            circle-element 
            ${colors[index % colors.length]} 
            ${sizes[index % sizes.length]} 
            ${positions[index % positions.length]}
            ${animations[index % animations.length]}
            hidden md:block
          `}
          style={{
            animationDelay: animationDelays[index % animationDelays.length]
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;
