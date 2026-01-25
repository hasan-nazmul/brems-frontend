import React from 'react';
import { FaTrain } from 'react-icons/fa';

const Preloader = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden">
            
            {/* --- ANIMATION CONTAINER --- */}
            <div className="relative flex items-center justify-center">
                {/* 1. Outer Ripple (Signal Effect) */}
                <div className="absolute h-24 w-24 rounded-full bg-[#006A4E] opacity-20 animate-ping"></div>
                
                {/* 2. Inner Glow */}
                <div className="absolute h-20 w-20 rounded-full bg-[#006A4E]/10 blur-xl"></div>

                {/* 3. Main Icon Circle */}
                <div className="relative bg-white p-5 rounded-full border-4 border-[#006A4E] shadow-2xl z-10">
                    <FaTrain className="text-4xl text-[#006A4E]" />
                </div>
            </div>

            {/* --- TEXT BRANDING --- */}
            <div className="text-center mt-8 space-y-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-[0.2em] uppercase leading-none">
                    Bangladesh <span className="text-[#F42A41]">Railway</span>
                </h2>
                <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                    Employee Management System
                </p>
            </div>

            {/* --- LOADING TRACK --- */}
            <div className="w-64 h-1.5 bg-gray-100 mt-8 rounded-full overflow-hidden relative">
                {/* The Moving Train/Bar */}
                <div className="absolute top-0 left-0 h-full bg-[#006A4E] w-1/3 rounded-full animate-loading-bar"></div>
            </div>

            {/* --- CSS FOR ANIMATION --- */}
            <style>{`
                @keyframes loading-slide {
                    0% { transform: translateX(-150%); }
                    50% { transform: translateX(150%); }
                    100% { transform: translateX(350%); }
                }
                .animate-loading-bar {
                    animation: loading-slide 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default Preloader;