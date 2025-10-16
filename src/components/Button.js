import React from 'react';

/**
 * Button component with consistent styling and accessibility features
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler function
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.ariaLabel - Accessibility label
 * @returns {JSX.Element} Button component
 */
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  className = '', 
  type = 'button',
  ariaLabel 
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`button ${disabled ? "button-disabled" : ""} ${className}`}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

export default Button;