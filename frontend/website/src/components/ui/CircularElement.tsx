import React from 'react';

interface CircularElementProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

const CircularElement: React.FC<CircularElementProps> = ({
  size = 'md',
  variant = 'neutral',
  children,
  className = '',
  onClick,
  animated = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const variantClasses = {
    primary: 'bg-fashion-accent-brown text-fashion-warm-white border-fashion-accent-brown',
    secondary: 'bg-fashion-warm-white text-fashion-charcoal border-fashion-charcoal/10',
    accent: 'bg-fashion-nude text-fashion-charcoal border-fashion-accent-brown/20',
    neutral: 'bg-fashion-light-beige text-fashion-dark-gray border-fashion-warm-gray/30'
  };

  const animationClass = animated ? 'animate-soft-pulse' : '';

  return (
    <div
      className={`
        circle-element 
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${animationClass}
        border-2 
        shadow-soft 
        hover:shadow-gentle 
        transition-all 
        duration-300 
        flex 
        items-center 
        justify-center
        ${onClick ? 'cursor-pointer hover:scale-110' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default CircularElement;
