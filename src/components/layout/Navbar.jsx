import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaUserCircle, FaSearch, FaTimes, FaExternalLinkAlt, FaCog, FaKey, FaArrowLeft } from 'react-icons/fa';
import api from '../../utils/api';
import { Modal } from '../ui/Modal'; 
// import { useNavigate } from 'react-router-dom'; 

const Navbar = () => {
    const [user, setUser] = useState({ name: 'Admin', role: '' });
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    
    // New State for Mobile View toggle
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const searchRef = useRef(null);
    const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) setUser(userData);
        
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setResults([]);
                // Optional: Close mobile search if clicked outside
                // setMobileSearchOpen(false); 
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm sticky top-0 z-40">
            
            {/* --- SECTION 1: SEARCH BAR --- */}
            <div className="flex-1 flex items-center" ref={searchRef}>
                {user.role !== 'verified_user' ? (
                    <>
                        {/* MOBILE: Just the icon button */}
                        {!mobileSearchOpen && (
                            <button 
                                onClick={() => setMobileSearchOpen(true)}
                                className="md:hidden text-gray-500 hover:text-green-600 p-2"
                            >
                                <FaSearch className="text-xl" />
                            </button>
                        )}

                        {/* SEARCH INPUT CONTAINER */}
                        {/* Logic: Hidden on mobile unless open. Always block on MD screens. */}
                        <div className={`${mobileSearchOpen ? 'absolute inset-0 bg-white z-50 flex items-center px-4 animate-fade-in' : 'hidden'} md:relative md:block md:w-full md:max-w-md group`}>
                            
                            {/* Mobile Only: Back Arrow to close search */}
                            {mobileSearchOpen && (
                                <button onClick={() => setMobileSearchOpen(false)} className="md:hidden mr-3 text-gray-500">
                                    <FaArrowLeft />
                                </button>
                            )}

                            {/* Input Field */}
                            {/* Changed: pl-4 (standard left) pr-10 (space for icon on right) */}
                            <input 
                                type="text" 
                                className="block w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm shadow-sm placeholder-gray-400" 
                                placeholder="Search Employee..." 
                                value={query}
                                onChange={handleSearch}
                                autoComplete="off"
                                autoFocus={mobileSearchOpen} // Auto focus when opened on mobile
                            />

                            {/* CLEAR BUTTON (X) */}
                            {/* Positioned right-10 to sit next to the search icon */}
                            {query && (
                                <button 
                                    onClick={() => {setQuery(''); setResults([]);}} 
                                    className="absolute inset-y-0 right-10 flex items-center px-2 text-gray-400 hover:text-red-500 cursor-pointer z-10 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            )}

                            {/* SEARCH ICON */}
                            {/* Positioned at the very end (right-3) */}
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
                                <FaSearch className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                            </div>

                            {/* DROPDOWN RESULTS */}
                            {results.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in ring-1 ring-black ring-opacity-5">
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Found {results.length} Matches
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
                                                className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center group transition-colors duration-150"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                                        {emp.first_name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">
                                                            {emp.first_name} {emp.last_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{emp.designation}</p>
                                                    </div>
                                                </div>
                                                <FaExternalLinkAlt className="text-gray-300 group-hover:text-green-600 text-xs transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="w-1/3"></div> 
                )}
            </div>

            {/* --- SECTION 2: ACTIONS & PROFILE --- */}
            {/* If Mobile Search is Open, hide this section so search bar has room */}
            <div className={`flex items-center gap-5 ${mobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
                {/* Notification Bell */}
                <button className="relative p-2 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-full transition-all">
                    <FaBell className="text-xl" />
                    <span className="absolute top-1.5 right-2 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500"></span>
                </button>

                <div className="h-6 w-px bg-gray-300"></div>

                {/* Profile Trigger */}
                <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-3 rounded-full border border-transparent hover:border-gray-200 transition-all" 
                    onClick={() => setSettingsOpen(true)}
                >
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-800 leading-none">{user.name}</div>
                        <div className="text-xs text-gray-500 mt-1 capitalize tracking-wide">{user.role.replace('_', ' ')}</div>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center border-2 border-white shadow-md">
                        <FaUserCircle className="text-xl opacity-90" />
                    </div>
                </div>
            </div>

            {/* --- SECTION 3: SETTINGS MODAL --- */}
            <Modal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} title="Account Settings">
                <div className="space-y-6">
                    <div className="bg-blue-50/50 p-4 rounded-xl flex gap-4 items-start border border-blue-100">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <FaCog className="text-lg" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">Account Information</h4>
                            <div className="text-xs text-gray-600 mt-1 space-y-1">
                                <p><span className="font-semibold text-gray-500 w-12 inline-block">Role:</span> {user.role}</p>
                                <p><span className="font-semibold text-gray-500 w-12 inline-block">Email:</span> {user.email}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
                            <FaKey className="text-gray-400" /> Security
                        </h4>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Current Password</label>
                            <input 
                                type="password" 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                    value={passForm.new} 
                                    onChange={e => setPassForm({...passForm, new: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Confirm New</label>
                                <input 
                                    type="password" 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
                                    value={passForm.confirm} 
                                    onChange={e => setPassForm({...passForm, confirm: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full bg-slate-800 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-slate-900 active:scale-[0.99] transition-all">Update Password</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </header>
    );
};

export default Navbar;