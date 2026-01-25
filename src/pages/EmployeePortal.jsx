import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { 
    FaPhone, FaMapMarkerAlt, FaHistory, FaEdit, FaEnvelope, 
    FaIdCard, FaExchangeAlt, FaUserCircle, FaBriefcase, FaBuilding 
} from 'react-icons/fa';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import Preloader from '../components/ui/Preloader';

const EmployeePortal = () => {
    const [employee, setEmployee] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return navigate('/login');
            
            try {
                // Fetch Employee Profile
                const empRes = await api.get(`/employees/${user.employee_id}`);
                setEmployee(empRes.data);

                // Fetch My Requests
                const reqRes = await api.get('/profile-requests'); 
                // Filter only mine (Back-end should ideally filter this, but doing it here for safety)
                const myReqs = reqRes.data.filter(r => r.employee_id === user.employee_id);
                setRequests(myReqs);
            } catch(e) { console.error(e); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [navigate]);

    const getPhotoUrl = (path) => path ? `http://127.0.0.1:8000/storage/${path}` : null;

    if (loading) return <Preloader />;

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Area */}
            <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#006A4E] flex items-center gap-2">
                        <FaUserCircle /> My Portal
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your profile and view service history.</p>
                </div>
                <button 
                    onClick={() => navigate('/profile/edit')} 
                    className="bg-white text-[#006A4E] border border-[#006A4E] px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-50 flex items-center gap-2 transition shadow-sm hover:shadow-md active:scale-95"
                >
                    <FaEdit /> Update Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* --- LEFT SIDEBAR (My Profile Card) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="overflow-hidden border-t-4 border-[#006A4E]">
                        <div className="p-8 text-center bg-white relative">
                            {/* Profile Image */}
                            <div className="relative inline-block mb-4">
                                <div className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 ring-4 ring-[#006A4E]/10">
                                    {employee.profile_picture ? (
                                        <img src={getPhotoUrl(employee.profile_picture)} className="w-full h-full object-cover" alt="Profile"/>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 font-bold bg-gray-50">
                                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                                        </div>
                                    )}
                                </div>
                                {/* Status Dot */}
                                <div className={`absolute bottom-2 right-2 w-5 h-5 border-4 border-white rounded-full ${employee.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-900">{employee.first_name} {employee.last_name}</h2>
                            <p className="text-[#006A4E] font-bold text-sm mt-1 uppercase tracking-wide">{employee.designation}</p>
                            
                            <div className="mt-3 flex justify-center gap-2">
                                <Badge type={employee.status === 'active' ? 'success' : 'gray'}>{employee.status.toUpperCase()}</Badge>
                                {employee.is_verified && <Badge type="info">Verified</Badge>}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50/50 p-6 border-t border-gray-100 space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400"><FaIdCard /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">National ID</p>
                                    <p className="text-sm font-bold text-gray-700 font-mono">{employee.nid_number}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400"><FaBuilding /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current Station</p>
                                    <p className="text-sm font-bold text-gray-700">{employee.office?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400"><FaPhone /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phone</p>
                                    <p className="text-sm font-bold text-gray-700">{employee.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400"><FaMapMarkerAlt /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Address</p>
                                    <p className="text-sm font-bold text-gray-700 leading-tight">{employee.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* --- RIGHT MAIN CONTENT --- */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* 1. Request History */}
                    <Card>
                        <CardHeader 
                            title="My Requests" 
                            subtitle="Status of your profile update applications" 
                        />
                        <CardBody className="p-0">
                            <div className="divide-y divide-gray-100">
                                {requests.length > 0 ? requests.map(r => (
                                    <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 p-2 rounded-full text-xs ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                <FaHistory />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{r.request_type}</p>
                                                <p className="text-xs text-gray-500 font-medium">Submitted: {new Date(r.created_at).toLocaleDateString()}</p>
                                                {r.admin_note && (
                                                    <p className="text-xs text-gray-500 mt-1 bg-gray-100 p-2 rounded border border-gray-200 italic">
                                                        " {r.admin_note} "
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <Badge type={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}>
                                                {r.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 text-sm">No recent requests found.</p>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>

                    {/* 2. Transfer History Timeline */}
                    <Card>
                        <CardHeader 
                            title="Service History" 
                            subtitle="Timeline of your transfers and postings" 
                        />
                        <CardBody>
                            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-8 py-2">
                                {/* Current Node */}
                                <div className="relative">
                                    <span className="absolute -left-[39px] bg-[#006A4E] h-5 w-5 rounded-full border-4 border-white shadow-sm"></span>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <h4 className="font-bold text-sm text-[#006A4E] flex items-center gap-2">
                                            <FaBuilding /> Current Station: {employee.office?.name}
                                        </h4>
                                        <p className="text-xs text-green-700 mt-1 font-bold uppercase tracking-wide">Presently Posted Here</p>
                                    </div>
                                </div>

                                {/* Past Transfers */}
                                {employee.transfers && employee.transfers.map(t => (
                                    <div key={t.id} className="relative group">
                                        <span className="absolute -left-[37px] bg-white h-4 w-4 rounded-full border-2 border-gray-300 group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors"></span>
                                        <div className="bg-white border border-gray-100 p-3 rounded-lg hover:shadow-sm hover:border-gray-200 transition-all">
                                            <h4 className="font-bold text-sm text-gray-700">Transferred from {t.from_office?.name}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-500 font-mono">Order: {t.order_number || 'N/A'}</p>
                                                <p className="text-xs text-gray-400">{new Date(t.transfer_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Start Node */}
                                <div className="relative">
                                    <span className="absolute -left-[37px] bg-gray-200 h-4 w-4 rounded-full border-2 border-white"></span>
                                    <h4 className="font-bold text-sm text-gray-500">Joined Bangladesh Railway</h4>
                                    <p className="text-xs text-gray-400 font-mono mt-1">{new Date(employee.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeePortal;