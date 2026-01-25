import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { FaPlus, FaUserTie, FaEdit, FaSearch, FaSortAmountDown, FaShieldAlt, FaBriefcase } from 'react-icons/fa';

const ManageDesignations = () => {
    const [designations, setDesignations] = useState([]);
    const [filtered, setFiltered] = useState([]);
    
    // Modal & Form State
    const [isModalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Added default_role to form state
    const [form, setForm] = useState({ title: '', grade: '', basic_salary: '', default_role: 'verified_user' });

    // Filter & Sort State
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('');

    useEffect(() => { fetchDesignations(); }, []);

    const fetchDesignations = async () => {
        try {
            const res = await api.get('/designations');
            setDesignations(res.data);
            setFiltered(res.data);
        } catch(e) { console.error("API Error"); }
    };

    // Filter & Sort Logic
    useEffect(() => {
        let res = [...designations];

        if (search) {
            const lowerSearch = search.toLowerCase();
            res = res.filter(d => d.title.toLowerCase().includes(lowerSearch));
        }

        if (sortBy === 'salary_high') {
            res.sort((a, b) => parseFloat(b.basic_salary) - parseFloat(a.basic_salary));
        } else if (sortBy === 'salary_low') {
            res.sort((a, b) => parseFloat(a.basic_salary) - parseFloat(b.basic_salary));
        } else if (sortBy === 'grade_asc') {
            res.sort((a, b) => parseInt(a.grade.replace(/\D/g, '')) - parseInt(b.grade.replace(/\D/g, '')));
        } else if (sortBy === 'admin_only') {
            res = res.filter(d => d.default_role === 'office_admin');
        }

        setFiltered(res);
    }, [search, sortBy, designations]);

    const openEdit = (des) => {
        setForm({ 
            title: des.title, 
            grade: des.grade, 
            basic_salary: des.basic_salary,
            default_role: des.default_role || 'verified_user' 
        });
        setIsEdit(true);
        setEditId(des.id);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) await api.put(`/designations/${editId}`, form);
            else await api.post('/designations', form);
            
            setModalOpen(false);
            setForm({ title: '', grade: '', basic_salary: '', default_role: 'verified_user' });
            fetchDesignations();
        } catch (e) { alert("Operation Failed"); }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#006A4E] flex items-center gap-2">
                        <FaBriefcase /> HR Designations
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage job titles, grades, and salary structures.</p>
                </div>
                <button 
                    onClick={() => { setIsEdit(false); setForm({ title: '', grade: '', basic_salary: '', default_role: 'verified_user' }); setModalOpen(true); }} 
                    className="bg-[#006A4E] text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-green-900/20 hover:bg-[#047857] transition flex items-center gap-2 active:scale-[0.98]"
                >
                    <FaPlus size={12} /> Add New Designation
                </button>
            </div>

            {/* --- MAIN CARD --- */}
            <Card className="border-t-4 border-[#006A4E]">
                {/* TOOLBAR */}
                <div className="p-5 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-80 text-gray-500 focus-within:text-[#006A4E]">
                        <FaSearch className="absolute left-3 top-3" />
                        <input 
                            className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] text-sm bg-white shadow-sm" 
                            placeholder="Search Job Title..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                    
                    <div className="relative w-full md:w-auto">
                        <FaSortAmountDown className="absolute left-3 top-3 text-gray-400 z-10" />
                        <select 
                            className="pl-10 w-full md:w-56 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] text-sm bg-white shadow-sm appearance-none cursor-pointer"
                            value={sortBy} 
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="">Default Sorting</option>
                            <option value="admin_only">Admin Roles Only</option>
                            <option value="salary_high">Salary (High to Low)</option>
                            <option value="salary_low">Salary (Low to High)</option>
                            <option value="grade_asc">Grade Level (Asc)</option>
                        </select>
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-[#006A4E]/5 text-xs uppercase font-bold text-[#006A4E] tracking-wider border-b border-[#006A4E]/10">
                            <tr>
                                <th className="px-6 py-4">Job Title</th>
                                <th className="px-6 py-4">System Access</th>
                                <th className="px-6 py-4">Grade</th>
                                <th className="px-6 py-4">Basic Salary</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-400">No designations found.</td></tr>
                            ) : (
                                filtered.map(des => (
                                    <tr key={des.id} className="hover:bg-green-50/40 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded text-gray-500">
                                                    <FaUserTie />
                                                </div>
                                                <span className="font-bold text-gray-800">{des.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {des.default_role === 'office_admin' ? (
                                                <Badge type="danger" className="flex items-center gap-1 w-fit">
                                                    <FaShieldAlt /> Office Admin
                                                </Badge>
                                            ) : (
                                                <Badge type="gray">Standard User</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold shadow-sm">
                                                {des.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-[#006A4E]">
                                            ৳ {Number(des.basic_salary).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openEdit(des)} 
                                                className="text-[#006A4E] hover:bg-[#006A4E]/10 p-2 rounded-lg transition-all"
                                                title="Edit Designation"
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

            {/* --- ADD/EDIT MODAL --- */}
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Edit Designation" : "Create New Designation"}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Job Title</label>
                        <input 
                            className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] py-2.5" 
                            name="title" 
                            value={form.title} 
                            onChange={e => setForm({...form, title: e.target.value})} 
                            placeholder="e.g. Station Master"
                            required 
                        />
                    </div>

                    {/* Access Level Dropdown */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold text-blue-800 mb-2 flex items-center gap-2 uppercase">
                            <FaShieldAlt /> Default System Access
                        </label>
                        <select 
                            className="w-full border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-2 text-sm" 
                            value={form.default_role} 
                            onChange={e => setForm({...form, default_role: e.target.value})}
                        >
                            <option value="verified_user">Standard Employee (Portal Only)</option>
                            <option value="office_admin">Office Admin (Can Manage Stations)</option>
                        </select>
                        <p className="text-[10px] text-blue-600 mt-2 leading-relaxed">
                            {form.default_role === 'office_admin' 
                                ? "⚠️ CAUTION: Employees with this designation will automatically get administrative privileges to manage other staff." 
                                : "✓ Employees will only have read-only access to their own profile and history."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Grade Level</label>
                            <input 
                                className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E]" 
                                name="grade" 
                                value={form.grade} 
                                onChange={e => setForm({...form, grade: e.target.value})} 
                                placeholder="e.g. Grade-9" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Basic Salary (BDT)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">৳</span>
                                <input 
                                    type="number" 
                                    className="w-full pl-8 border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E]" 
                                    name="basic_salary" 
                                    value={form.basic_salary} 
                                    onChange={e => setForm({...form, basic_salary: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-[#006A4E] text-white font-bold py-3 rounded-lg hover:bg-[#047857] transition shadow-lg shadow-green-900/20 active:scale-[0.99] mt-2"
                    >
                        {isEdit ? 'Update Designation' : 'Save New Designation'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ManageDesignations;