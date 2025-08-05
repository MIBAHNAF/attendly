// Reusable Input component
'use client';

import { forwardRef } from 'react';

/**
 * @typedef {Object} InputProps
 * @property {string} [label]
 * @property {string} [placeholder]
 * @property {'text' | 'email' | 'password' | 'number'} [type='text']
 * @property {string} [error]
 * @property {boolean} [required=false]
 * @property {string} [className='']
 * @property {string} [value]
 * @property {(e: React.ChangeEvent<HTMLInputElement>) => void} [onChange]
 */

/**
 * Reusable Input Component
 * @param {InputProps} props
 * @param {React.Ref<HTMLInputElement>} ref
 */
const Input = forwardRef(({
  label,
  placeholder,
  type = 'text',
  error,
  required = false,
  className = '',
  value,
  onChange,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const errorClasses = error ? 'border-red-500' : 'border-gray-300';
  const inputClasses = [baseClasses, errorClasses, className].filter(Boolean).join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={inputClasses}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
