import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBell, FaUserCircle, FaSearch, FaTimes, FaExternalLinkAlt, 
  FaCog, FaKey, FaArrowLeft, FaBars 
} from 'react-icons/fa';
import api from '../../utils/api';
import { Modal } from '../ui/Modal'; 

const Navbar = ({ onMenuClick }) => {
    const [user, setUser] = useState({ name: 'Admin', role: '' });
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    
    // Mobile Search Toggle State
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const searchRef = useRef(null);
    const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        // 1. Load User
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) setUser(userData);

        // 2. Fetch Notification Count (Pending Requests)
        const fetchNotifications = async () => {
            if (userData && (userData.role === 'super_admin' || userData.role === 'office_admin')) {
                try {
                    const res = await api.get('/profile-requests');
                    const pending = res.data.filter(r => r.status === 'pending').length;
                    setPendingCount(pending);
                } catch (e) { console.error("Notif check failed"); }
            }
        };
        fetchNotifications();
    }, []);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length > 1) {
            try {
                const res = await api.get(`/employees?search=${val}`);
                setResults(res.data);
            } catch (error) { console.error("Search API Error"); }
        } else {
            setResults([]);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if(passForm.new !== passForm.confirm) return alert("New passwords do not match");
        try {
            await api.post('/change-password', { 
                current_password: passForm.current, 
                new_password: passForm.new,
                new_password_confirmation: passForm.confirm 
            });
            alert("Password Changed Successfully");
            setSettingsOpen(false);
            setPassForm({ current: '', new: '', confirm: '' });
        } catch(e) { alert("Failed to change password."); }
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40 border-t-4 border-[#006A4E]">
            <div className="h-16 flex items-center justify-between px-4 lg:px-8">
                
                {/* --- LEFT: MENU TOGGLE (Mobile Only) --- */}
                <div className={`flex items-center gap-4 ${mobileSearchOpen ? 'hidden' : 'flex'}`}>
                    <button 
                        onClick={onMenuClick} 
                        className="lg:hidden p-2 text-gray-600 hover:text-[#006A4E] hover:bg-green-50 rounded-lg transition-colors"
                    >
                        <FaBars className="text-xl" />
                    </button>
                </div>

                {/* --- CENTER: SEARCH BAR --- */}
                <div 
                    className={`flex-1 flex items-center justify-center transition-all duration-300 ${mobileSearchOpen ? 'absolute inset-0 bg-white z-50 px-4' : ''}`} 
                    ref={searchRef}
                >
                    {user.role !== 'verified_user' && (
                        <>
                            {/* Mobile Search Trigger Icon (Visible when search is closed) */}
                            {!mobileSearchOpen && (
                                <button 
                                    onClick={() => setMobileSearchOpen(true)}
                                    className="md:hidden text-gray-500 hover:text-[#006A4E] p-2 ml-auto md:ml-0"
                                >
                                    <FaSearch className="text-xl" />
                                </button>
                            )}

                            {/* Search Input Container */}
                            <div className={`${mobileSearchOpen ? 'flex w-full' : 'hidden'} md:flex md:w-full md:max-w-xl relative group`}>
                                
                                {/* Mobile Back Button */}
                                {mobileSearchOpen && (
                                    <button onClick={() => setMobileSearchOpen(false)} className="md:hidden mr-3 text-gray-500">
                                        <FaArrowLeft />
                                    </button>
                                )}

                                {/* --- FIXED INPUT WRAPPER --- */}
                                <div className="relative w-full text-gray-500 focus-within:text-[#006A4E]">
                                    
                                    {/* --- FIXED INPUT WRAPPER (Icon on Right) --- */}
                                    <div className="relative w-full text-gray-500 focus-within:text-[#006A4E]">
                                        
                                        <input 
                                            type="text" 
                                            className={`w-full pl-4 py-2.5 rounded-full border border-gray-300 bg-gray-50 text-sm focus:bg-white focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] transition-all placeholder-gray-400 ${query ? 'pr-20' : 'pr-12'}`} 
                                            placeholder="Search Employee by Name or ID..." 
                                            value={query}
                                            onChange={handleSearch}
                                            autoComplete="off"
                                            autoFocus={mobileSearchOpen}
                                        />
                                        
                                        {/* Clear Button (Appears to the left of the Search Icon) */}
                                        {query && (
                                            <button 
                                                onClick={() => {setQuery(''); setResults([]);}} 
                                                className="absolute inset-y-0 right-10 flex items-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}

                                        {/* Search Icon - Fixed at Right End */}
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <FaSearch className="text-lg transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                {/* SEARCH RESULTS DROPDOWN */}
                                {results.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
                                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                                            <span>Search Results</span>
                                            <span className="text-[#006A4E]">{results.length} Found</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                            {results.map(emp => (
                                                <div 
                                                    key={emp.id} 
                                                    onClick={() => {
                                                        window.open(`/employees/${emp.id}`, '_blank');
                                                        setResults([]); 
                                                        setMobileSearchOpen(false);
                                                    }} 
                                                    className="px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 hover:bg-green-50 transition-colors group flex justify-between items-center"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {/* Avatar / Initials */}
                                                        <div className="h-10 w-10 rounded-full bg-[#006A4E] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                                            {emp.first_name?.[0] || 'E'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-[#006A4E]">
                                                                {emp.first_name} {emp.last_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{emp.designation}</p>
                                                        </div>
                                                    </div>
                                                    <FaExternalLinkAlt className="text-gray-300 group-hover:text-[#006A4E] text-xs" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* --- RIGHT: ACTIONS & PROFILE --- */}
                <div className={`flex items-center gap-4 ${mobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
                    
                    {/* Notification Bell */}
                    <button 
                        onClick={() => navigate('/inbox')}
                        className="relative p-2 text-gray-500 hover:text-[#006A4E] hover:bg-green-50 rounded-full transition-all"
                        title={pendingCount > 0 ? `${pendingCount} Pending Requests` : "No new notifications"}
                    >
                        <FaBell className={`text-xl ${pendingCount > 0 ? 'animate-pulse text-[#006A4E]' : ''}`} />
                        {pendingCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[#F42A41] ring-2 ring-white text-[9px] font-bold text-white flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </button>

                    <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                    {/* Profile Badge */}
                    <div 
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 md:px-3 rounded-full border border-transparent hover:border-gray-200 transition-all" 
                        onClick={() => setSettingsOpen(true)}
                    >
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-gray-800 leading-none">{user.name}</div>
                            <div className="text-xs text-[#006A4E] font-medium mt-1 capitalize tracking-wide">{user.role?.replace('_', ' ')}</div>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#006A4E] to-[#047857] text-white flex items-center justify-center shadow-md ring-2 ring-white">
                            <FaUserCircle className="text-xl opacity-90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SETTINGS MODAL --- */}
            <Modal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} title="Account Settings">
                <div className="space-y-6">
                    {/* User Info Card */}
                    <div className="bg-gray-50 p-4 rounded-xl flex gap-4 items-start border border-gray-200">
                        <div className="p-3 bg-white rounded-lg text-[#006A4E] shadow-sm">
                            <FaCog className="text-xl" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">User Profile</h4>
                            <div className="text-xs text-gray-600 mt-2 space-y-1">
                                <p><span className="font-semibold text-gray-500 w-16 inline-block">Role:</span> {user.role}</p>
                                <p><span className="font-semibold text-gray-500 w-16 inline-block">Email:</span> {user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Password Form */}
                    <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
                            <FaKey className="text-[#F42A41]" /> Security Update
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Current Password</label>
                            <input 
                                type="password" 
                                value={passForm.current} 
                                onChange={e => setPassForm({...passForm, current: e.target.value})} 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">New Password</label>
                                <input 
                                    type="password" 
                                    value={passForm.new} 
                                    onChange={e => setPassForm({...passForm, new: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Confirm New</label>
                                <input 
                                    type="password" 
                                    value={passForm.confirm} 
                                    onChange={e => setPassForm({...passForm, confirm: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full bg-[#006A4E] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#047857] shadow-lg shadow-green-900/20 active:scale-[0.99] transition-all">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </header>
    );
};

export default Navbar;