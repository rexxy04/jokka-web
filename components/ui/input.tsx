import React, { InputHTMLAttributes } from 'react';

// Kita extend standar input HTML props agar bisa menerima type, placeholder, value, onChange, dll.
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-800 placeholder-gray-400 ${className}`}
      {...props}
    />
  );
};

export default Input;