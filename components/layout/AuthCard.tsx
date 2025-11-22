import Link from 'next/link';
import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Card Container (Kotak Abu-abu) */}
      <div className="max-w-md w-full space-y-8 bg-gray-200/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-100/50">
        <div>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
            {title}
          </h2>
        </div>
        
        {/* Form Content */}
        {children}
        
      </div>
    </div>
  );
};

export default AuthCard;