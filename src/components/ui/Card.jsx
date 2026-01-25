import React from 'react';

export const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}>
        {children}
    </div>
);

export const CardHeader = ({ title, subtitle, action }) => (
    <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-white">
        <div>
            {/* Primary Railway Green for Authority */}
            <h3 className="font-bold text-[#006A4E] text-lg tracking-tight">
                {title}
            </h3>
            {/* Uppercase "Technical" style for subtitles */}
            {subtitle && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-1">
                    {subtitle}
                </p>
            )}
        </div>
        
        {/* Action area (Buttons/Selects) */}
        {action && (
            <div className="shrink-0">
                {action}
            </div>
        )}
    </div>
);

export const CardBody = ({ children, className = "" }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);