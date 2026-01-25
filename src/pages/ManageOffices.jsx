import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { FaPlus, FaEdit, FaSearch, FaBuilding, FaMapMarkerAlt, FaCode } from 'react-icons/fa';

const ManageOffices = () => {
    const [offices, setOffices] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    
    // Filters
    const [search, setSearch] = useState('');
    const [parentFilter, setParentFilter] = useState('');
    
    // Edit State
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', location: '', parent_id: '' });

    useEffect(() => { fetchOffices(); }, []);

    const fetchOffices = async () => {
        try {
            const res = await api.get('/offices');
            setOffices(res.data);
            setFiltered(res.data);
        } catch (e) { console.error("API Error"); }
    };

    useEffect(() => {
        let res = offices;
        if(search) res = res.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.code.toLowerCase().includes(search.toLowerCase()));
        if(parentFilter) res = res.filter(o => o.parent_id === parseInt(parentFilter));
        setFiltered(res);
    }, [search, parentFilter, offices]);

    const openEdit = (office) => {
        setForm({ name: office.name, code: office.code, location: office.location, parent_id: office.parent_id || '' });
        setIsEdit(true);
        setEditId(office.id);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if(isEdit) await api.put(`/offices/${editId}`, form);
            else await api.post('/offices', form);
            
            setModalOpen(false);
            fetchOffices(); // Refresh list
            setForm({ name: '', code: '', location: '', parent_id: '' });
        } catch (e) { alert("Operation Failed"); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#006A4E] flex items-center gap-2">
                        <FaBuilding /> Offices & Stations
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage network locations, stations, and administrative zones.</p>
                </div>
                <button 
                    onClick={() => { setIsEdit(false); setForm({ name: '', code: '', location: '', parent_id: '' }); setModalOpen(true); }} 
                    className="bg-[#006A4E] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-green-900/20 hover:bg-[#047857] transition active:scale-[0.98]"
                >
                    <FaPlus size={12} /> Add New Office
                </button>
            </div>

            <Card className="border-t-4 border-[#006A4E]">
                {/* --- TOOLBAR --- */}
                <div className="p-5 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Search Input */}
                    <div className="relative w-full md:w-80 text-gray-500 focus-within:text-[#006A4E]">
                        <FaSearch className="absolute left-3 top-3" />
                        <input 
                            className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] text-sm bg-white shadow-sm transition-all" 
                            placeholder="Search Station Name or Code..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                    
                    {/* Parent Filter */}
                    <div className="relative w-full md:w-64">
                        <FaBuilding className="absolute left-3 top-3 text-gray-400 z-10" />
                        <select 
                            className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] text-sm bg-white shadow-sm appearance-none cursor-pointer" 
                            value={parentFilter} 
                            onChange={e => setParentFilter(e.target.value)}
                        >
                            <option value="">All Zones / Parents</option> 
                            {offices.map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* --- TABLE --- */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-[#006A4E]/5 text-xs uppercase font-bold text-[#006A4E] tracking-wider border-b border-[#006A4E]/10">
                            <tr>
                                <th className="px-6 py-4">Station Code</th>
                                <th className="px-6 py-4">Office Name</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Parent Office</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-400">No offices found.</td></tr>
                            ) : (
                                filtered.map(o => (
                                    <tr key={o.id} className="hover:bg-green-50/40 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                                {o.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{o.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <FaMapMarkerAlt className="text-gray-400" /> {o.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {o.parent ? (
                                                <span className="text-gray-700 font-medium">{o.parent.name}</span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Headquarters / Zone Head</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openEdit(o)} 
                                                className="text-[#006A4E] hover:bg-[#006A4E]/10 p-2 rounded-lg transition-all"
                                                title="Edit Office Details"
                                            >
                                                <FaEdit />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* --- MODAL --- */}
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Edit Office" : "Create New Office"}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Office Name</label>
                        <input 
                            className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E]" 
                            name="name" 
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})} 
                            placeholder="e.g. Chattogram Station"
                            required 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Station Code</label>
                             <div className="relative">
                                <FaCode className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    className="w-full pl-9 border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] font-mono uppercase" 
                                    name="code" 
                                    value={form.code} 
                                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} 
                                    placeholder="CGP"
                                    required 
                                />
                             </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Location</label>
                             <div className="relative">
                                <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    className="w-full pl-9 border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E]" 
                                    name="location" 
                                    value={form.location} 
                                    onChange={e => setForm({...form, location: e.target.value})} 
                                    placeholder="City/District"
                                    required 
                                />
                             </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Parent Office / Zone</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] bg-white py-2" 
                            name="parent_id" 
                            value={form.parent_id} 
                            onChange={e => setForm({...form, parent_id: e.target.value})}
                        >
                            <option value="">None (Top Level / HQ)</option>
                            {/* Prevent selecting itself as parent to avoid infinite loop */}
                            {offices.filter(o => o.id !== editId).map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-[#006A4E] text-white py-3 rounded-lg font-bold hover:bg-[#047857] shadow-lg shadow-green-900/20 transition-all active:scale-[0.99] mt-2"
                    >
                        {isEdit ? 'Update Office Details' : 'Create Office'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ManageOffices;