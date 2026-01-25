import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export const Modal = ({ isOpen, onClose, title, children }) => {
    
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop with Blur */}
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] border-t-4 border-[#006A4E] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header - Fixed at top */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
                    <h3 className="text-lg font-bold text-[#006A4E] tracking-tight">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-[#F42A41] hover:bg-red-50 rounded-full transition-all duration-200"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};