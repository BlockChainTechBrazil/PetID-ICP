import React from 'react';

const PetIDLogo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg`}>
      <svg 
        className="w-3/4 h-3/4 text-white" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        {/* Paw print icon minimalist */}
        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm6 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM6 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3 6c0-1.1.9-2 2-2s2 .9 2 2v3c0 2.2-1.8 4-4 4s-4-1.8-4-4v-3c0-1.1.9-2 2-2z"/>
      </svg>
    </div>
  );
};

export default PetIDLogo;