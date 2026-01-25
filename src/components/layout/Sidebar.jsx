import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    FaChartPie, FaBuilding, FaUserTie, FaInbox, 
    FaSignOutAlt, FaTrain, FaUsers, FaUserCircle, 
    FaEdit, FaTimes 
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const [role, setRole] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) setRole(user.role);
    }, []);

    // Helper to check if user has admin privileges
    const isAdmin = role === 'super_admin' || role === 'office_admin';

    // Dynamic Link Classes
    const getLinkClasses = ({ isActive }) => {
        // Base styling for all links
        const baseClasses = "group flex items-center px-4 py-3 my-1 mx-3 rounded-lg text-sm font-medium transition-all duration-200";
        
        // Active: Bright Railway Green BG + White Text
        const activeClasses = "bg-[#006A4E] text-white shadow-md shadow-green-900/20";
        
        // Inactive: Muted text + Hover effect
        const inactiveClasses = "text-gray-400 hover:text-white hover:bg-[#006A4E]/10";

        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    return (
        <aside 
            className={`
                fixed top-0 left-0 z-50 h-screen w-64 flex flex-col 
                bg-[#00281f] text-white shadow-2xl
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
            `}
        >
            {/* --- HEADER --- */}
            <div className="h-16 flex items-center justify-between px-6 bg-[#001e17] border-b border-[#006A4E]/30 relative">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-[#006A4E] flex items-center justify-center text-white shadow-lg shadow-green-900/50">
                        <FaTrain className="text-lg" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-base tracking-wide leading-none">BREMS</h1>
                        <p className="text-[10px] text-[#006A4E] font-bold uppercase tracking-widest mt-1">
                            {isAdmin ? 'Admin Panel' : 'Staff Portal'}
                        </p>
                    </div>
                </div>

                {/* Mobile Close Button */}
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="lg:hidden text-gray-400 hover:text-white transition-colors"
                >
                    <FaTimes />
                </button>
            </div>

            {/* --- NAVIGATION --- */}
            <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
                
                {/* ADMIN MENU */}
                {isAdmin && (
                    <div className="mb-8">
                        <div className="px-6 mb-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Management
                        </div>
                        <NavLink to="/dashboard" className={getLinkClasses} onClick={() => setIsOpen(false)}>
                            <FaChartPie className="mr-3 text-lg opacity-80" /> Dashboard
                        </NavLink>
                        <NavLink to="/employees" className={getLinkClasses} onClick={() => setIsOpen(false)}>
                            <FaUsers className="mr-3 text-lg opacity-80" /> Employee Directory
                        </NavLink>

                        <div className="px-6 mb-3 mt-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Organization
                        </div>
                        <NavLink to="/offices" className={getLinkClasses} onClick={() => setIsOpen(false)}>
                            <FaBuilding className="mr-3 text-lg opacity-80" /> Offices & Stations
                        </NavLink>
                        
                        {role === 'super_admin' && (
                            <NavLink to="/designations" className={getLinkClasses} onClick={() => setIsOpen(false)}>
                                <FaUserTie className="mr-3 text-lg opacity-80" /> HR & Designations
                            </NavLink>
                        )}

                        <div className="px-6 mb-3 mt-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Workflow
                        </div>
                        <NavLink to="/inbox" className={getLinkClasses} onClick={() => setIsOpen(false)}>
                            <FaInbox className="mr-3 text-lg opacity-80" /> Admin Inbox
                        </NavLink>
                    </div>
                )}

                {/* EMPLOYEE MENU */}
                {role === 'verified_user' && (
                    <div className="mb-8">
                        <div className="px-6 mb-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Personal
                        </div>
                        <NavLink to="/portal" className={getLinkClasses} onClick={() => setIsOpen(false)}>
                            <FaUserCircle className="mr-3 text-lg opacity-80" /> My Portal
                        </NavLink>
                        <NavLink to="/profile/edit" className={getLinkClasses} onClick={() => setIsOpen(false)}>
                            <FaEdit className="mr-3 text-lg opacity-80" /> Edit Profile
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* --- FOOTER (LOGOUT) --- */}
            <div className="p-4 border-t border-[#006A4E]/20 bg-[#001e17]">
                <button 
                    onClick={() => { 
                        localStorage.clear(); 
                        window.location.href = '/login'; 
                    }} 
                    className="w-full flex items-center justify-center bg-[#F42A41] hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors text-sm font-bold shadow-lg shadow-red-900/20 group"
                >
                    <FaSignOutAlt className="mr-2 group-hover:-translate-x-1 transition-transform" /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;