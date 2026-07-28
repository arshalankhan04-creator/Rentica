import React, { useState } from 'react';

const Select = ({
  id,
  value,
  onChange,
  options = [],
  label,
  error,
  placeholder = 'Select option',
  className = '',
  required = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    setIsOpen(false);
    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    setIsOpen(false);
    if (props.onBlur) props.onBlur(e);
  };

  const handleMouseDown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-textPrimary uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative w-full flex items-center">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onMouseDown={handleMouseDown}
          className={`w-full h-12 pl-3 pr-8 rounded-xl border border-border bg-surface text-xs font-semibold text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary appearance-none cursor-pointer hover:border-muted-foreground/30 transition-all shadow-sm ${
            error ? 'border-danger focus:ring-danger/30' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className={`absolute right-2.5 pointer-events-none text-muted-foreground flex items-center transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <span className="text-[10px] font-bold text-danger mt-0.5">{error}</span>}
    </div>
  );
};

export default Select;
