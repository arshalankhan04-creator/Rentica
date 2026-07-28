import React from 'react';

const Input = ({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  label,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-textPrimary uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`w-full h-12 px-4 rounded-xl border border-border bg-surface text-xs font-semibold text-textPrimary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all shadow-sm ${
          error ? 'border-danger focus:ring-danger/30' : 'hover:border-muted-foreground/30'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] font-bold text-danger mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
