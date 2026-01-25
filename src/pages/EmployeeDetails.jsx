import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
    FaUserShield, FaExchangeAlt, FaLevelUpAlt, FaTrash, FaKey, 
    FaArrowLeft, FaPhone, FaMapMarkerAlt, FaIdCard, 
    FaUserCheck, FaExclamationTriangle, FaBuilding, FaPowerOff, FaLock, FaBriefcase 
} from 'react-icons/fa';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import Preloader from '../components/ui/Preloader';

const EmployeeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Data & UI States
    const [emp, setEmp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('transfer'); 

    // Dropdown Data
    const [offices, setOffices] = useState([]);
    const [designations, setDesignations] = useState([]);

    // Modal States
    const [modalType, setModalType] = useState(null);
    const [transferForm, setTransferForm] = useState({ target_office_id: '', transfer_date: '', order_number: '' });
    // FIXED: Changed new_designation to designation_id to match backend
    const [promoForm, setPromoForm] = useState({ designation_id: '', new_salary: '', promotion_date: '' });
    
    // --- NEW ACCESS FORM STATE ---
    const [accessForm, setAccessForm] = useState({ 
        email: '', 
        password: '', 
        is_active: true 
    });

    useEffect(() => {
        loadData();
    }, [id, navigate]);

    const loadData = async () => {
        try {
            const [eRes, oRes, dRes] = await Promise.all([
                api.get(`/employees/${id}`),
                api.get('/offices'),
                api.get('/designations')
            ]);
            setEmp(eRes.data);
            setOffices(oRes.data);
            setDesignations(dRes.data);
        } catch (e) { alert("Error loading data"); navigate('/employees'); }
        finally { setLoading(false); }
    };

    // --- ACTIONS ---

    const handleVerify = async () => {
        if(confirm(`Confirm identity verification for ${emp.first_name} ${emp.last_name}?`)) {
            try {
                await api.put(`/employees/${id}/verify`);
                alert("✅ Employee Verified Successfully!");
                loadData(); // Refresh to show changes
            } catch(e) { alert("Verification Failed"); }
        }
    };

    const handleDelete = async () => {
        if(confirm(`⚠️ WARNING: Are you sure you want to delete ${emp.first_name}? This action is irreversible.`)) {
            try {
                await api.delete(`/employees/${id}`);
                alert("Profile Deleted.");
                navigate('/employees');
            } catch(e) { alert(e.response?.data?.message || "Delete failed"); }
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/employees/${id}/transfer`, transferForm);
            alert("✅ Transfer Order Processed!");
            setModalType(null);
            loadData();
        } catch(e) { alert("Transfer Failed"); }
    };

    const handlePromote = async (e) => {
        e.preventDefault();
        try {
            // FIXED: Sending ID now
            await api.post(`/employees/${id}/promote`, promoForm);
            alert("✅ Promotion Approved!");
            setModalType(null);
            loadData();
        } catch(e) { alert("Promotion Failed"); }
    };

    // --- SMART ACCESS MANAGERS ---

    const openAccessModal = () => {
        // Pre-fill data if user exists, otherwise suggest default email
        if (emp.user) {
            setAccessForm({
                email: emp.user.email,
                password: '', // Leave blank unless resetting
                is_active: Boolean(emp.user.is_active)
            });
        } else {
            setAccessForm({
                email: `${emp.first_name.toLowerCase()}.${emp.id}@railway.gov.bd`,
                password: '',
                is_active: true
            });
        }
        setModalType('access');
    };

    const handleManageAccess = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/employees/${id}/access`, accessForm);
            alert("✅ Access Settings Updated!");
            setModalType(null);
            loadData();
        } catch (error) {
            alert(error.response?.data?.message || "Operation Failed");
        }
    };

    const getPhotoUrl = (path) => path ? `http://127.0.0.1:8000/storage/${path}` : null;

    if (loading) return <Preloader />;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Top Navigation */}
            <div className="flex justify-between items-center">
                <button 
                    onClick={() => navigate('/employees')} 
                    className="flex items-center text-gray-500 hover:text-[#006A4E] font-bold text-sm transition-colors group"
                >
                    <div className="p-2 bg-white border border-gray-200 rounded-full mr-2 group-hover:border-[#006A4E]">
                        <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                    Back to Directory
                </button>
                <div className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    ID: {emp.id}
                </div>
            </div>

            {/* UNVERIFIED WARNING BANNER */}
            {!emp.is_verified && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 flex flex-col sm:flex-row justify-between items-center shadow-sm rounded-r-xl gap-4">
                    <div className="flex items-center">
                        <div className="bg-amber-100 p-2 rounded-full mr-3">
                            <FaExclamationTriangle className="text-amber-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900 uppercase tracking-wide">Identity Unverified</p>
                            <p className="text-xs text-amber-700">This employee profile has not been officially verified by HR.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleVerify}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-amber-900/10 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <FaUserCheck /> Verify Now
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* --- LEFT SIDEBAR (Digital ID Card) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className={`overflow-hidden border-t-4 ${emp.is_verified ? 'border-[#006A4E]' : 'border-amber-400'}`}>
                        <div className="p-8 text-center bg-white relative">
                            {/* Verification Badge */}
                            {emp.is_verified && (
                                <div className="absolute top-4 right-4">
                                    <Badge type="success"><FaUserCheck className="mr-1"/> Verified</Badge>
                                </div>
                            )}

                             {/* Access Status Indicator (Green/Red Dot) */}
                             {emp.user ? (
                                <div className={`absolute top-4 left-4 h-3 w-3 rounded-full ${emp.user.is_active ? 'bg-green-500 ring-4 ring-green-100' : 'bg-red-500 ring-4 ring-red-100'}`} title={emp.user.is_active ? "Portal Access Active" : "Portal Access Paused"}></div>
                             ) : (
                                <div className="absolute top-4 left-4 h-3 w-3 rounded-full bg-gray-300" title="No Account"></div>
                             )}

                            {/* Profile Image */}
                            <div className="relative inline-block mb-4">
                                <div className={`w-32 h-32 mx-auto rounded-full border-4 p-1 shadow-xl ${emp.is_verified ? 'border-[#006A4E]/20' : 'border-amber-200'}`}>
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
                                        {emp.profile_picture ? (
                                            <img src={getPhotoUrl(emp.profile_picture)} className="w-full h-full object-cover" alt="Profile" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 font-bold bg-gray-50">
                                                {emp.first_name?.[0]}{emp.last_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Online/Status Dot */}
                                <div className={`absolute bottom-2 right-2 w-5 h-5 border-4 border-white rounded-full ${emp.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            
                            <h2 className="text-xl font-bold text-gray-900">{emp.first_name} {emp.last_name}</h2>
                            
                            {/* Designation Title (Safely accessed via Relation) */}
                            <p className="text-[#006A4E] font-bold text-sm mt-1 uppercase tracking-wide">
                                {emp.designation?.title || 'Unknown'}
                            </p>
                            
                            {/* Show Login Email if exists */}
                            {emp.user && (
                                <p className="text-xs text-gray-400 mt-2 bg-gray-50 inline-block px-2 py-1 rounded border border-gray-200 font-mono">
                                    {emp.user.email}
                                </p>
                            )}
                        </div>
                        
                        <div className="bg-gray-50/50 p-6 border-t border-gray-100 space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400"><FaIdCard /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">National ID</p>
                                    <p className="text-sm font-bold text-gray-700 font-mono">{emp.nid_number}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400"><FaBuilding /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Station / Office</p>
                                    <p className="text-sm font-bold text-gray-700">{emp.office?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400"><FaPhone /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phone</p>
                                    <p className="text-sm font-bold text-gray-700">{emp.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400"><FaMapMarkerAlt /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Address</p>
                                    <p className="text-sm font-bold text-gray-700 leading-tight">{emp.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button 
                                onClick={handleDelete} 
                                className="w-full py-2.5 text-[#F42A41] font-bold bg-white border border-gray-200 hover:bg-red-50 hover:border-[#F42A41] rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                            >
                                <FaTrash /> Delete Profile
                            </button>
                        </div>
                    </Card>
                </div>

                {/* --- RIGHT MAIN CONTENT --- */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Action Command Center */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* 1. SMART ACCESS BUTTON */}
                        <button 
                            onClick={openAccessModal} 
                            disabled={!emp.is_verified} 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-[#006A4E] hover:shadow-lg hover:-translate-y-1 transition-all text-left group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${emp.user ? (emp.user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-gray-100 text-gray-500'}`}>
                                <FaKey className="text-lg" />
                            </div>
                            <h3 className="font-bold text-gray-800">
                                {emp.user ? 'Manage Access' : 'Create Login'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 leading-snug">
                                {emp.user ? (emp.user.is_active ? 'Active • Click to Edit' : 'Paused • Click to Resume') : 'No Account Setup'}
                            </p>
                        </button>
                        
                        <button 
                            onClick={() => setModalType('transfer')} 
                            disabled={!emp.is_verified} 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all text-left group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FaExchangeAlt className="text-lg" />
                            </div>
                            <h3 className="font-bold text-gray-800 group-hover:text-blue-600">Transfer Order</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-snug">Move employee to a new station or office.</p>
                        </button>

                        <button 
                            onClick={() => setModalType('promote')} 
                            disabled={!emp.is_verified} 
                            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-[#006A4E] hover:shadow-lg hover:-translate-y-1 transition-all text-left group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center text-[#006A4E] mb-4 group-hover:bg-[#006A4E] group-hover:text-white transition-colors">
                                <FaLevelUpAlt className="text-lg" />
                            </div>
                            <h3 className="font-bold text-gray-800 group-hover:text-[#006A4E]">Promotion</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-snug">Update designation rank and salary scale.</p>
                        </button>
                    </div>

                    {/* Timeline History Tabs */}
                    <Card className="min-h-[400px]">
                        <div className="flex border-b border-gray-100">
                            <button 
                                onClick={() => setActiveTab('transfer')}
                                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-all ${activeTab === 'transfer' ? 'border-[#006A4E] text-[#006A4E] bg-green-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <FaExchangeAlt className="inline mr-2"/> Transfer History
                            </button>
                            <button 
                                onClick={() => setActiveTab('promotion')}
                                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-all ${activeTab === 'promotion' ? 'border-[#006A4E] text-[#006A4E] bg-green-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                <FaLevelUpAlt className="inline mr-2"/> Promotion History
                            </button>
                        </div>
                        
                        <CardBody>
                            <div className="relative pl-2">
                                {/* Transfer Content */}
                                {activeTab === 'transfer' && (
                                    <div className="space-y-0">
                                        {emp.transfers && emp.transfers.length > 0 ? emp.transfers.map((t, idx) => (
                                            <div key={t.id} className="flex gap-6 relative pb-8 last:pb-0 group">
                                                {/* Connecting Line */}
                                                {idx !== emp.transfers.length - 1 && (
                                                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200 group-hover:bg-blue-100 transition-colors"></div>
                                                )}
                                                
                                                {/* Icon Node */}
                                                <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 z-10 shadow-sm group-hover:scale-110 transition-transform bg-white">
                                                    <FaExchangeAlt size={10} />
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="bg-gray-50 rounded-lg p-4 flex-1 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 text-sm">Transferred to {t.to_office?.name}</h4>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                                <FaBriefcase className="text-gray-300" /> Order #{t.order_number || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                                                            {new Date(t.transfer_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                                    <FaExchangeAlt className="text-2xl" />
                                                </div>
                                                <p className="text-gray-400 font-medium">No transfer history found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Promotion Content */}
                                {activeTab === 'promotion' && (
                                    <div className="space-y-0">
                                        {emp.promotions && emp.promotions.length > 0 ? emp.promotions.map((p, idx) => (
                                            <div key={p.id} className="flex gap-6 relative pb-8 last:pb-0 group">
                                                {idx !== emp.promotions.length - 1 && (
                                                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200 group-hover:bg-green-100 transition-colors"></div>
                                                )}
                                                <div className="w-8 h-8 rounded-full bg-green-50 border-2 border-green-100 text-[#006A4E] flex items-center justify-center flex-shrink-0 z-10 shadow-sm group-hover:scale-110 transition-transform bg-white">
                                                    <FaLevelUpAlt size={10} />
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-4 flex-1 border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-[#006A4E] text-sm">Promoted to {p.new_designation}</h4>
                                                            <div className="text-xs text-gray-500 mt-1 font-bold">
                                                                New Salary: <span className="text-gray-800">৳{Number(p.new_salary).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-mono font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                                                            {new Date(p.promotion_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                                    <FaLevelUpAlt className="text-2xl" />
                                                </div>
                                                <p className="text-gray-400 font-medium">No promotion history found.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* --- MODALS --- */}
            
            {/* 1. SMART ACCESS MODAL (NEW) */}
            <Modal isOpen={modalType === 'access'} onClose={() => setModalType(null)} title="Portal Access Control">
                <form onSubmit={handleManageAccess} className="space-y-6">
                    
                    {/* Toggle Switch (Only if user exists) */}
                    {emp.user && (
                        <div className={`p-4 rounded-lg border flex items-center justify-between ${accessForm.is_active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full text-white ${accessForm.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                                    <FaPowerOff />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${accessForm.is_active ? 'text-green-800' : 'text-red-800'}`}>
                                        {accessForm.is_active ? 'Login Access Enabled' : 'Login Access Paused'}
                                    </p>
                                    <p className="text-xs opacity-70">
                                        {accessForm.is_active ? 'User can log in normally.' : 'User cannot log in until resumed.'}
                                    </p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={accessForm.is_active} 
                                    onChange={e => setAccessForm({...accessForm, is_active: e.target.checked})} 
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    )}

                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Official Email</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] bg-white p-2.5" 
                            value={accessForm.email} 
                            onChange={e => setAccessForm({...accessForm, email: e.target.value})} 
                        />
                        <p className="text-xs text-gray-400 mt-1">Must be unique across the system.</p>
                    </div>

                    {/* Password Reset (Optional if editing, Required if new) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase flex items-center gap-2">
                            {emp.user ? <><FaLock className="text-amber-500"/> Reset Password</> : 'Set Password'}
                        </label>
                        <input 
                            type="text" 
                            className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] bg-white p-2.5" 
                            placeholder={emp.user ? "Leave blank to keep current password" : "Default: 123456"} 
                            value={accessForm.password} 
                            onChange={e => setAccessForm({...accessForm, password: e.target.value})} 
                        />
                    </div>

                    <button className="w-full bg-[#006A4E] text-white py-3 rounded-lg font-bold shadow-lg hover:bg-[#047857]">
                        {emp.user ? 'Update Access Settings' : 'Generate Credentials'}
                    </button>
                </form>
            </Modal>
            
            {/* 2. Transfer Modal */}
            <Modal isOpen={modalType === 'transfer'} onClose={() => setModalType(null)} title="Transfer Employee">
                 <form onSubmit={handleTransfer} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Target Station/Office</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] py-2.5" 
                            value={transferForm.target_office_id} 
                            onChange={e => setTransferForm({...transferForm, target_office_id: e.target.value})} 
                            required
                        >
                            <option value="">Select Target Station...</option>
                            {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Order Number</label>
                            <input 
                                type="text" 
                                placeholder="e.g. TR-2024-001" 
                                className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] py-2" 
                                onChange={e => setTransferForm({...transferForm, order_number: e.target.value})} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Effective Date</label>
                            <input 
                                type="date" 
                                className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] py-2" 
                                onChange={e => setTransferForm({...transferForm, transfer_date: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 mt-2">
                        Confirm Transfer
                    </button>
                 </form>
            </Modal>

            {/* 3. Promotion Modal (FIXED: Using ID logic) */}
            <Modal isOpen={modalType === 'promote'} onClose={() => setModalType(null)} title="Promote Employee">
                 <form onSubmit={handlePromote} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">New Designation</label>
                        <select 
                            className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] py-2.5" 
                            onChange={e => { 
                                // FIND BY ID now
                                const d = designations.find(x => x.id == e.target.value); 
                                setPromoForm({
                                    ...promoForm, 
                                    designation_id: d.id, // STORE ID
                                    new_salary: d.basic_salary
                                })
                            }} 
                            required
                        >
                            <option value="">Select Rank...</option>
                            {/* USE ID AS VALUE */}
                            {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">New Basic Salary</label>
                            <input 
                                type="number" 
                                className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] py-2" 
                                value={promoForm.new_salary} 
                                onChange={e => setPromoForm({...promoForm, new_salary: e.target.value})} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Effective Date</label>
                            <input 
                                type="date" 
                                className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] py-2" 
                                onChange={e => setPromoForm({...promoForm, promotion_date: e.target.value})} 
                                required 
                            />
                        </div>
                    </div>
                    <button className="w-full bg-[#006A4E] text-white py-2.5 rounded-lg font-bold shadow-lg shadow-green-900/20 hover:bg-[#047857] mt-2">
                        Approve Promotion
                    </button>
                 </form>
            </Modal>
        </div>
    );
};

export default EmployeeDetails;