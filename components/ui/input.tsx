import React, { InputHTMLAttributes } from 'react';

// Kita tambahkan properti 'label' (opsional) ke interface
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  label?: string; // <--- INI TAMBAHANNYA
}

const Input: React.FC<InputProps> = ({ className = "", label, ...props }) => {
  return (
    <div className="w-full">
      {/* Jika ada props label, tampilkan teks labelnya di atas input */}
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <input
        className={`w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-800 placeholder-gray-400 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;