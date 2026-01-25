import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { FaSave, FaArrowLeft, FaFileUpload, FaCamera, FaInfoCircle } from 'react-icons/fa';

const EmployeeEditProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
    // Form Data
    const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', address: '' });
    const [proof, setProof] = useState(null);
    const [currentPhoto, setCurrentPhoto] = useState(null);
    
    // Loading States
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);

    // Fetch Current Data on Load
    useEffect(() => {
        const fetchProfile = async () => {
            const userData = JSON.parse(localStorage.getItem('user'));
            setUser(userData);
            
            try {
                const res = await api.get(`/employees/${userData.employee_id}`);
                setForm({
                    first_name: res.data.first_name,
                    last_name: res.data.last_name,
                    phone: res.data.phone || '',
                    address: res.data.address || ''
                });
                setCurrentPhoto(res.data.profile_picture);
            } catch(e) { console.error(e); }
        };
        fetchProfile();
    }, []);

    // 1. Handle Photo Upload (Direct Update)
    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPhotoLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            // Ensure this endpoint exists in your backend route list
            const res = await api.post(`/employees/${user.employee_id}/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Update UI immediately
            setCurrentPhoto(res.data.path);
            alert("✅ Profile Picture Updated Successfully!");
        } catch (e) {
            alert("Failed to upload photo. Ensure it is an image under 2MB.");
        } finally {
            setPhotoLoading(false);
        }
    };

    // 2. Handle Text Data (Request System)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData();
        // We send changes as a JSON string so the Controller can store it easily
        formData.append('changes', JSON.stringify(form));
        formData.append('request_type', 'Profile Update');
        formData.append('details', 'Employee requested profile update via portal.');
        
        if (proof) {
            formData.append('attachment', proof);
        }

        try {
            await api.post('/profile-requests', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("✅ Update Request Submitted!\n\nAn admin will review your changes shortly.");
            navigate('/portal');
        } catch (e) {
            alert("Failed to submit request.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getPhotoUrl = (path) => path ? `http://127.0.0.1:8000/storage/${path}` : null;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
            {/* Back Button */}
            <button 
                onClick={() => navigate('/portal')} 
                className="flex items-center text-gray-500 hover:text-[#006A4E] font-bold text-sm transition-colors group"
            >
                <div className="p-2 bg-white border border-gray-200 rounded-full mr-2 group-hover:border-[#006A4E]">
                    <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" />
                </div>
                Back to My Portal
            </button>

            <Card className="border-t-4 border-[#006A4E]">
                <CardHeader title="Edit Profile" subtitle="UPDATE PERSONAL INFORMATION" />
                <CardBody>
                    
                    {/* --- 1. PHOTO UPLOAD SECTION --- */}
                    <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-100">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 ring-4 ring-gray-50">
                                {currentPhoto ? (
                                    <img src={getPhotoUrl(currentPhoto)} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 font-bold bg-gray-50">
                                        {form.first_name?.[0]}{form.last_name?.[0]}
                                    </div>
                                )}
                                
                                {/* Loading Overlay */}
                                {photoLoading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white backdrop-blur-sm">
                                        <span className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Camera Button */}
                            <label className="absolute bottom-0 right-0 bg-[#006A4E] text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-[#047857] transition-all transform hover:scale-110 active:scale-95 border-2 border-white">
                                <FaCamera size={16} />
                                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 font-medium uppercase tracking-wide">
                            Max File Size: 2MB
                        </p>
                    </div>

                    {/* --- 2. TEXT DATA FORM --- */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3">
                            <FaInfoCircle className="text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-yellow-800">Note to Employee</p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Changes to Name, Phone, or Address require administrative approval. Your profile will update once an admin reviews your request.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">First Name</label>
                                <input 
                                    className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E]" 
                                    value={form.first_name} 
                                    onChange={e => setForm({...form, first_name: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Last Name</label>
                                <input 
                                    className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E]" 
                                    value={form.last_name} 
                                    onChange={e => setForm({...form, last_name: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Phone Number</label>
                            <input 
                                className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E]" 
                                value={form.phone} 
                                onChange={e => setForm({...form, phone: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Present Address</label>
                            <textarea 
                                className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E]" 
                                rows="3" 
                                value={form.address} 
                                onChange={e => setForm({...form, address: e.target.value})}
                            ></textarea>
                        </div>

                        {/* Document Proof Section */}
                        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 border-dashed">
                            <label className="block text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">
                                Supporting Document <span className="text-blue-400 font-normal normal-case">(Optional)</span>
                            </label>
                            <p className="text-xs text-blue-600 mb-4">
                                If you are correcting your Name or NID, please upload a scanned copy of your National ID card or relevant document.
                            </p>
                            
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition flex items-center gap-2 shadow-sm active:scale-95">
                                    <FaFileUpload /> {proof ? "Change File" : "Upload Document"}
                                    <input type="file" hidden onChange={e => setProof(e.target.files[0])} accept="application/pdf,image/*" />
                                </label>
                                {proof ? (
                                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-200">
                                        {proof.name}
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">No file chosen</span>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-[#006A4E] text-white py-3 rounded-lg font-bold text-base hover:bg-[#047857] transition shadow-lg shadow-green-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    Submitting Request...
                                </>
                            ) : (
                                <>
                                    <FaSave /> Submit Changes for Review
                                </>
                            )}
                        </button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default EmployeeEditProfile;