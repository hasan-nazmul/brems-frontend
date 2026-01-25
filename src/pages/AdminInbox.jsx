import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal'; 
import { FaCheck, FaTimes, FaExternalLinkAlt, FaUserClock, FaHistory, FaInbox } from 'react-icons/fa';

const AdminInbox = () => {
    const [requests, setRequests] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/profile-requests');
            setRequests(res.data);
        } catch (e) { console.error("Failed to load requests"); }
        finally { setIsLoading(false); }
    };

    const handleAction = async (status) => {
        if(!selectedReq) return;
        if(!confirm(`Are you sure you want to mark this as ${status.toUpperCase()}?`)) return;

        try {
            await api.put(`/profile-requests/${selectedReq.id}`, { 
                status, 
                admin_note: adminNote 
            });
            
            // Refresh list and close modal
            fetchRequests();
            setSelectedReq(null);
            setAdminNote('');
        } catch (e) { alert("Failed to update status"); }
    };

    // Helper to format database keys (e.g., "first_name" -> "First Name")
    const formatKey = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#006A4E] flex items-center gap-3">
                        <FaInbox className="text-3xl" /> Admin Inbox
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage profile update requests and data corrections.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pending:</span>
                    <Badge type="warning" className="text-sm px-3">{requests.filter(r => r.status === 'pending').length}</Badge>
                </div>
            </div>
            
            <Card>
                <CardHeader 
                    title="Incoming Requests" 
                    subtitle="EMPLOYEE DATA MODIFICATIONS" 
                />
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-[#006A4E]/5 text-xs uppercase font-bold text-[#006A4E] tracking-wider border-b border-[#006A4E]/10">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Request Type</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-gray-400">Loading requests...</td></tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                <FaCheck className="text-2xl text-gray-300" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-500">All caught up!</p>
                                            <p className="text-sm">No pending requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : requests.map(req => (
                                <tr key={req.id} className="hover:bg-green-50/30 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-[#006A4E] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                {req.employee?.first_name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">
                                                    {req.employee?.first_name} {req.employee?.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500">{req.employee?.designation || 'Employee'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700 capitalize">
                                        {req.request_type.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge type={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'danger'}>
                                            {req.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => { setSelectedReq(req); setAdminNote(req.admin_note || ''); }} 
                                            className="text-[#006A4E] font-bold text-xs bg-[#006A4E]/10 hover:bg-[#006A4E] hover:text-white px-4 py-2 rounded-full transition-all shadow-sm"
                                        >
                                            {req.status === 'pending' ? 'Review Request' : 'View Details'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* --- REVIEW MODAL --- */}
            <Modal isOpen={!!selectedReq} onClose={() => setSelectedReq(null)} title={selectedReq?.status === 'pending' ? "Review Request" : "Request Details"}>
                {selectedReq && (
                    <div className="space-y-6">
                        {/* 1. Employee Summary Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-xl border border-gray-200 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#006A4E] to-[#047857] text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
                                    {selectedReq.employee?.first_name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg leading-tight">
                                        {selectedReq.employee?.first_name} {selectedReq.employee?.last_name}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">NID: {selectedReq.employee?.nid_number}</p>
                                </div>
                            </div>
                            
                            {/* LINK TO BIO */}
                            <a 
                                href={`/employees/${selectedReq.employee_id}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 text-[#006A4E] text-xs font-bold hover:underline bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                            >
                                <FaExternalLinkAlt /> View Full Profile
                            </a>
                        </div>

                        {/* Request Reason */}
                        <div className="text-sm text-gray-700 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <h5 className="font-bold text-blue-800 text-xs uppercase tracking-wide mb-1">Reason for Request</h5>
                            <p>{selectedReq.details || "No details provided."}</p>
                        </div>

                        {/* 2. Changes Table (Diff View) */}
                        {selectedReq.proposed_changes && (
                            <div>
                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#006A4E]"></span> Proposed Data Changes
                                </h5>
                                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs border-b">
                                            <tr>
                                                <th className="px-4 py-3 w-1/3 border-r">Field Name</th>
                                                <th className="px-4 py-3">Proposed Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {Object.entries(selectedReq.proposed_changes).map(([key, value]) => {
                                                if (!value) return null; 
                                                return (
                                                    <tr key={key}>
                                                        <td className="px-4 py-3 border-r bg-gray-50/50 font-semibold text-gray-600 capitalize">
                                                            {formatKey(key)}
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-900 font-bold bg-yellow-50/30">
                                                            {value}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 3. Proof Attachment */}
                        {selectedReq.attachment && (
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                                <div className="bg-white p-2 rounded text-gray-500 border border-gray-200">
                                    <FaExternalLinkAlt />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-500 uppercase">Supporting Document</p>
                                    <a 
                                        href={`http://127.0.0.1:8000/storage/${selectedReq.attachment}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-[#006A4E] font-bold text-sm hover:underline"
                                    >
                                        Click to View Attachment
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* 4. Action Area */}
                        <div className="border-t border-gray-100 pt-6">
                            {selectedReq.status === 'pending' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                                            Admin Note <span className="text-gray-400 font-normal normal-case">(Required for rejection)</span>
                                        </label>
                                        <textarea 
                                            className="w-full border-gray-300 rounded-lg focus:ring-[#006A4E] focus:border-[#006A4E] text-sm p-3 shadow-sm"
                                            rows="2"
                                            placeholder="Enter approval comments or reason for rejection..."
                                            value={adminNote}
                                            onChange={e => setAdminNote(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => handleAction('approved')} 
                                            className="flex items-center justify-center gap-2 bg-[#006A4E] text-white py-3 rounded-lg font-bold shadow-lg shadow-green-900/10 hover:shadow-xl hover:bg-[#047857] active:scale-[0.98] transition-all"
                                        >
                                            <FaCheck /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleAction('rejected')} 
                                            className="flex items-center justify-center gap-2 bg-white text-[#F42A41] border border-[#F42A41]/30 py-3 rounded-lg font-bold hover:bg-red-50 hover:border-[#F42A41] active:scale-[0.98] transition-all"
                                        >
                                            <FaTimes /> Reject
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* VIEW ONLY MODE */
                                <div className={`p-4 rounded-xl border flex items-center gap-4 ${selectedReq.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-lg shadow-sm ${selectedReq.status === 'approved' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                        <FaHistory />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 uppercase text-xs tracking-wide">Request Status</p>
                                        <p className="text-lg font-bold text-gray-900 leading-tight">
                                            Marked as {selectedReq.status.toUpperCase()}
                                        </p>
                                        {selectedReq.admin_note && (
                                            <p className="text-sm text-gray-600 mt-1 italic">
                                                " {selectedReq.admin_note} "
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminInbox;