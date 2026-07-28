import React from 'react';

const Badge = ({
  children,
  variant = 'primary', // primary, secondary, success, warning, danger, muted
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold select-none border tracking-wide uppercase';
  
  const variants = {
    primary: 'bg-primary/5 text-primary border-primary/10',
    secondary: 'bg-secondary/5 text-secondary border-secondary/10',
    success: 'bg-successLight text-success border-successBorder',
    warning: 'bg-warningLight text-warning border-warningBorder',
    danger: 'bg-dangerLight text-danger border-dangerBorder',
    muted: 'bg-muted text-muted-foreground border-border'
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
