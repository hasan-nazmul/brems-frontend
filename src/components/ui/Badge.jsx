import React from 'react';

const colors = {
    // Active / Verified / Completed -> Railway Green
    success: 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/20',
    
    // Deleted / Urgent / Error -> Signal Red
    danger: 'bg-[#F42A41]/10 text-[#F42A41] border-[#F42A41]/20',
    
    // Pending / Draft -> Track Gold
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    
    // Inactive / Offline -> Neutral Gray
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    
    // New / Info -> Standard Blue
    info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export const Badge = ({ type = 'gray', children, className = '' }) => (
    <span className={`
        inline-flex items-center justify-center
        px-2.5 py-1
        rounded-full 
        text-[10px] font-bold uppercase tracking-wider 
        border 
        shadow-sm
        whitespace-nowrap
        ${colors[type] || colors.gray}
        ${className}
    `}>
        {children}
    </span>
);