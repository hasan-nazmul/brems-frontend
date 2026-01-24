import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartPie, FaBuilding, FaUserTie, FaInbox, FaSignOutAlt, FaTrain, FaUsers, FaUserCircle, FaEdit } from 'react-icons/fa';

const Sidebar = () => {
    const [role, setRole] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) setRole(user.role);
    }, []);

    const getLinkClasses = ({ isActive }) => {
        const baseClasses = "flex items-center px-6 py-3.5 text-sm font-medium transition-all duration-200 border-l-4";
        const activeClasses = "bg-white/5 text-white border-railway-green shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]";
        const inactiveClasses = "text-slate-400 hover:text-white hover:bg-white/5 border-transparent";
        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    };

    // Helper to check if user has admin privileges (Super OR Office)
    const isAdmin = role === 'super_admin' || role === 'office_admin';

    return (
        <aside className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col z-50 shadow-2xl">
            <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
                <FaTrain className="text-railway-green text-2xl mr-3" />
                <div>
                    <h1 className="text-white font-bold text-lg tracking-wide leading-tight">RAILWAY ERP</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                        {isAdmin ? 'Admin Portal' : 'Employee Portal'}
                    </p>
                </div>
            </div>

            <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
                
                {/* --- ADMIN MENU (Super & Office) --- */}
                {isAdmin && (
                    <>
                        <div className="px-6 mb-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Overview</div>
                        <NavLink to="/dashboard" className={getLinkClasses}><FaChartPie className="mr-3 text-lg" /> Dashboard</NavLink>
                        <NavLink to="/employees" className={getLinkClasses}><FaUsers className="mr-3 text-lg" /> Employee Directory</NavLink>

                        <div className="px-6 mb-2 mt-6 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Organization</div>
                        
                        {/* Only Super Admin can edit Offices/Designations structure, but Office Admin can view */}
                        <NavLink to="/offices" className={getLinkClasses}><FaBuilding className="mr-3 text-lg" /> Offices & Stations</NavLink>
                        
                        {/* Ideally only Super Admin manages designations, but keeping visible for now */}
                        {role === 'super_admin' && (
                            <NavLink to="/designations" className={getLinkClasses}><FaUserTie className="mr-3 text-lg" /> HR & Designations</NavLink>
                        )}

                        <div className="px-6 mb-2 mt-6 text-[11px] font-bold text-slate-600 uppercase tracking-wider">Requests</div>
                        <NavLink to="/inbox" className={getLinkClasses}><FaInbox className="mr-3 text-lg" /> Admin Inbox</NavLink>
                    </>
                )}

                {/* --- EMPLOYEE MENU --- */}
                {role === 'verified_user' && (
                    <>
                        <div className="px-6 mb-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider">My Profile</div>
                        <NavLink to="/portal" className={getLinkClasses}><FaUserCircle className="mr-3 text-lg" /> My Portal</NavLink>
                        <NavLink to="/profile/edit" className={getLinkClasses}><FaEdit className="mr-3 text-lg" /> Edit Profile</NavLink>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950">
                <button 
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }} 
                    className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium shadow-lg shadow-red-900/20"
                >
                    <FaSignOutAlt className="mr-2" /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;