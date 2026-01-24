import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { FaPlus, FaUserTie, FaEdit, FaSearch, FaSortAmountDown, FaShieldAlt } from 'react-icons/fa';
import { Badge } from '../components/ui/Badge';

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
            res = res.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">HR Designations</h1>
                <button onClick={() => { setIsEdit(false); setForm({ title: '', grade: '', basic_salary: '', default_role: 'verified_user' }); setModalOpen(true); }} className="bg-railway-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-railway-dark transition shadow-sm font-bold">
                    <FaPlus size={12} /> Add Designation
                </button>
            </div>

            <Card>
                {/* TOOLBAR */}
                <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 items-center">
                    <div className="relative w-64">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            className="pl-10 w-full" 
                            placeholder="Search Job Title..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                    </div>
                    
                    <div className="relative">
                        <FaSortAmountDown className="absolute left-3 top-3 text-gray-400" />
                        <select className="pl-10 w-48 bg-white" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="">Sort By...</option>
                            <option value="admin_only">Admins Only</option>
                            <option value="salary_high">Salary (High to Low)</option>
                            <option value="salary_low">Salary (Low to High)</option>
                            <option value="grade_asc">Grade (Level)</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Job Title</th>
                                <th className="px-6 py-3">System Access</th>
                                <th className="px-6 py-3">Grade</th>
                                <th className="px-6 py-3">Basic Salary</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(des => (
                                <tr key={des.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                                        <FaUserTie className="text-gray-400" /> {des.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Dynamic Badge based on Role */}
                                        {des.default_role === 'office_admin' ? (
                                            <Badge type="danger">Office Admin</Badge>
                                        ) : (
                                            <Badge type="success">Employee</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">{des.grade}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-railway-green">৳ {des.basic_salary}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEdit(des)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition">
                                            <FaEdit />
                                        </button>
                                    </td>
                                </tr> 
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* ADD/EDIT MODAL */}
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={isEdit ? "Edit Designation" : "Add Designation"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Job Title</label>
                        <input className="w-full" name="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>

                    {/* NEW: Access Level Dropdown */}
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                            <FaShieldAlt className="text-railway-green"/> System Access Level
                        </label>
                        <select 
                            className="w-full bg-white" 
                            value={form.default_role} 
                            onChange={e => setForm({...form, default_role: e.target.value})}
                        >
                            <option value="verified_user">Standard Employee (Portal Only)</option>
                            <option value="office_admin">Office Admin (Can Manage Stations)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {form.default_role === 'office_admin' 
                                ? "⚠️ Users with this designation will have administrative privileges." 
                                : "Users will only access their own data."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Grade Level</label>
                            <input className="w-full" name="grade" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} placeholder="e.g. 10" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Basic Salary (BDT)</label>
                            <input type="number" className="w-full" name="basic_salary" value={form.basic_salary} onChange={e => setForm({...form, basic_salary: e.target.value})} required />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-railway-green text-white font-bold py-2 rounded-lg hover:bg-railway-dark transition">
                        {isEdit ? 'Update Designation' : 'Save Designation'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default ManageDesignations;