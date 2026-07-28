import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  className = '', 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  pill = false,
  fullWidth = false
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'text-white bg-primary hover:bg-primaryHover hover:shadow-md active:scale-[0.98] border-none cursor-pointer',
    secondary: 'text-white bg-secondary hover:bg-secondaryHover hover:shadow-md active:scale-[0.98] border-none cursor-pointer',
    outline: 'bg-transparent border border-border text-textPrimary hover:bg-muted/50 hover:border-textSecondary/30 active:scale-[0.98] cursor-pointer',
    outlineWhite: 'bg-transparent border border-white text-white hover:bg-white/10 active:scale-[0.98] cursor-pointer',
    flat: 'text-primary hover:bg-primary/10 active:scale-[0.98] border-none cursor-pointer',
    ghost: 'bg-transparent text-textSecondary hover:bg-muted hover:text-textPrimary border-none cursor-pointer',
    danger: 'text-white bg-danger hover:bg-dangerHover hover:shadow-md active:scale-[0.98] border-none cursor-pointer',
    dark: 'bg-textPrimary hover:bg-textSecondary text-background hover:shadow-md active:scale-[0.98] border-none cursor-pointer'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    custom: ''
  };

  const shape = pill ? 'rounded-full' : 'rounded-xl';
  const widthStyle = fullWidth ? 'w-full' : '';
  const sizeStyle = sizes[size] || sizes.md;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizeStyle} ${shape} ${widthStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

