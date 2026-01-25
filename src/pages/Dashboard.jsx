import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { 
    FaUsers, FaBuilding, FaClipboardList, FaUserTie, 
    FaArrowUp, FaExchangeAlt, FaLevelUpAlt, FaMapMarkerAlt 
} from 'react-icons/fa';
import Preloader from '../components/ui/Preloader';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Fetch everything in one optimized call
                const res = await api.get('/dashboard-stats');
                setData(res.data);
            } catch (e) { 
                console.error("Dashboard data fetch failed", e); 
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return <Preloader />;

    // Helper for Top Stats Cards
    const StatCard = ({ title, count, icon: Icon, colorClass, borderColor }) => (
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 ${borderColor} transition hover:shadow-md group`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClass} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
                <span className="flex items-center text-[10px] font-bold text-[#006A4E] bg-green-50 px-2 py-1 rounded-full border border-green-100">
                    <FaArrowUp className="mr-1" size={8} /> LIVE
                </span>
            </div>
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-800">{count}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* 1. Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#006A4E]">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Real-time overview of Bangladesh Railway HR</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Session</p>
                    <p className="text-sm font-bold text-gray-800">
                        {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* 2. Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Employees" 
                    count={data?.counts?.employees || 0} 
                    icon={FaUsers} 
                    colorClass="bg-[#006A4E]" 
                    borderColor="border-t-[#006A4E]"
                />
                <StatCard 
                    title="Offices & Stations" 
                    count={data?.counts?.offices || 0} 
                    icon={FaBuilding} 
                    colorClass="bg-blue-600"
                    borderColor="border-t-blue-600"
                />
                <StatCard 
                    title="Pending Requests" 
                    count={data?.counts?.requests || 0} 
                    icon={FaClipboardList} 
                    colorClass="bg-[#F42A41]" 
                    borderColor="border-t-[#F42A41]"
                />
                <StatCard 
                    title="Designations" 
                    count={data?.counts?.designations || 0} 
                    icon={FaUserTie} 
                    colorClass="bg-yellow-500"
                    borderColor="border-t-yellow-500"
                />
            </div>

            {/* 3. Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT: Recent Activity Feed (Real Data) */}
                <Card className="lg:col-span-2 h-full">
                    <CardHeader title="Recent Activity" subtitle="LATEST TRANSFERS & PROMOTIONS" />
                    <CardBody>
                        <div className="space-y-6">
                            {data?.activity && data.activity.length > 0 ? (
                                data.activity.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-start group">
                                        {/* Icon based on Type */}
                                        <div className={`mt-1 p-2 rounded-full flex-shrink-0 text-white shadow-sm ${item.type === 'transfer' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                            {item.type === 'transfer' ? <FaExchangeAlt size={12}/> : <FaLevelUpAlt size={12}/>}
                                        </div>
                                        
                                        <div className="flex-1 pb-4 border-b border-gray-100 last:border-0 group-hover:bg-gray-50 p-2 -mt-2 rounded-lg transition-colors">
                                            <p className="text-sm font-bold text-gray-800">{item.text}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${item.type === 'transfer' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    <p>No recent transfers or promotions found.</p>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* RIGHT: Station Density (Real Data) */}
                <Card className="h-full">
                    <CardHeader title="Station Density" subtitle="STAFF DISTRIBUTION" />
                    <CardBody className="space-y-6">
                        {data?.office_stats && data.office_stats.length > 0 ? (
                            data.office_stats.map((office, index) => {
                                // Calculate percentage for bar width (relative to total active employees)
                                const percent = Math.min(100, Math.round((office.employees_count / data.counts.employees) * 100)) || 0;
                                
                                return (
                                    <div key={office.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-400 w-4">{index + 1}.</span>
                                                <h4 className="text-sm font-bold text-gray-700 truncate max-w-[150px]" title={office.name}>
                                                    {office.name}
                                                </h4>
                                            </div>
                                            <span className="text-xs font-bold text-[#006A4E] bg-green-50 px-2 py-0.5 rounded">
                                                {office.employees_count} Staff
                                            </span>
                                        </div>
                                        
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="bg-[#006A4E] h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <FaMapMarkerAlt className="mx-auto mb-2 text-2xl opacity-20"/>
                                <p className="text-xs">No office data available.</p>
                            </div>
                        )}

                        <div className="pt-4 mt-auto border-t border-gray-100">
                            <a 
                                href="/offices" // <--- CHANGED FROM button to a href/Link
                                className="block w-full text-center text-xs font-bold text-[#006A4E] hover:underline uppercase tracking-wide"
                            >
                                View Full Office Report
                            </a>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;