import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Modal, Button, Form, Badge, Spinner } from 'react-bootstrap';
// Safe Import for Charts
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const Dashboard = () => {
    // --- STATE ---
    const [employees, setEmployees] = useState([]);
    const [offices, setOffices] = useState([]);
    const [designations, setDesignations] = useState([]); 
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Data
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    
    // Forms
    const [addFormData, setAddFormData] = useState({ first_name: '', last_name: '', nid_number: '', designation: '', current_salary: '' });
    const [transferData, setTransferData] = useState({ target_office_id: '', transfer_date: '', order_number: '' });
    const [promoteData, setPromoteData] = useState({ new_designation: '', new_salary: '', promotion_date: '' });
    const [loginEmail, setLoginEmail] = useState('');

    // --- FETCH ---
    const fetchAllData = async () => {
        try {
            const [empRes, offRes, desRes] = await Promise.all([
                api.get('/employees'),
                api.get('/offices'),
                api.get('/designations').catch(() => ({ data: [] }))
            ]);
            setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
            setOffices(Array.isArray(offRes.data) ? offRes.data : []);
            setDesignations(Array.isArray(desRes.data) ? desRes.data : []);
        } catch (error) { console.error("Error loading data"); } finally { setLoading(false); }
    };

    useEffect(() => { fetchAllData(); }, []);

    // --- HANDLERS ---
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try { await api.post('/employees', addFormData); setShowAddModal(false); fetchAllData(); alert("✅ Added!"); } catch (e) { alert("Failed"); }
    };

    const handleVerify = async (id) => {
        if (!window.confirm("Verify?")) return;
        try { await api.put(`/employees/${id}/verify`); fetchAllData(); } catch (e) { alert("Failed"); }
    };

    const handleTransferClick = (id) => { setSelectedEmployeeId(id); setShowTransferModal(true); };
    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        try { await api.post(`/employees/${selectedEmployeeId}/transfer`, transferData); setShowTransferModal(false); fetchAllData(); alert("✅ Transferred!"); } catch (e) { alert("Failed"); }
    };

    const handlePromoteClick = (id) => { setSelectedEmployeeId(id); setShowPromoteModal(true); };
    const handlePromoteSubmit = async (e) => {
        e.preventDefault();
        try { await api.post(`/employees/${selectedEmployeeId}/promote`, promoteData); setShowPromoteModal(false); fetchAllData(); alert("✅ Promoted!"); } catch (e) { alert("Failed"); }
    };

    const handleViewHistory = async (id) => {
        try { const res = await api.get(`/employees/${id}`); setSelectedEmployee(res.data); setShowHistoryModal(true); } catch (e) {}
    };

    const handleLoginClick = (id) => { setSelectedEmployeeId(id); setShowLoginModal(true); setLoginEmail(''); };
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try { const res = await api.post(`/employees/${selectedEmployeeId}/create-login`, { email: loginEmail }); alert(`Login Created!\nPass: 123456`); setShowLoginModal(false); } catch (e) { alert("Failed"); }
    };

    return (
        <Layout>
            {loading && <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(255,255,255,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>}

            <div className="container-fluid">
                {/* CHARTS ROW */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white p-3 shadow-sm border-0">
                            <h3>{employees.length}</h3>
                            <small>Total Employees</small>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white p-3 shadow-sm border-0">
                            <h3>{employees.filter(e => e.is_verified).length}</h3>
                            <small>Verified Staff</small>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card p-3 shadow-sm border-0" style={{height: '120px'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    {name: 'Total', count: employees.length},
                                    {name: 'Verified', count: employees.filter(e => e.is_verified).length}
                                ]}>
                                    <Bar dataKey="count" fill="#006747" barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* EMPLOYEES TABLE */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Operational Staff</h4>
                    <Button onClick={() => setShowAddModal(true)}>+ New Recruit</Button>
                </div>

                <div className="card shadow-sm border-0">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-3">Name</th>
                                <th>Designation</th>
                                <th>Salary</th>
                                <th>Status</th>
                                <th className="text-end pe-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id}>
                                    <td className="ps-3">
                                        <div className="fw-bold">{emp.first_name} {emp.last_name}</div>
                                        <small className="text-muted">{emp.nid_number}</small>
                                    </td>
                                    <td>{emp.designation}</td>
                                    <td>{Number(emp.current_salary).toLocaleString()} BDT</td>
                                    <td>{emp.is_verified ? <Badge bg="success">Verified</Badge> : <Badge bg="warning" text="dark">Pending</Badge>}</td>
                                    <td className="text-end pe-3">
                                        <div className="btn-group">
                                            {!emp.is_verified && <Button size="sm" variant="outline-success" onClick={() => handleVerify(emp.id)}>Verify</Button>}
                                            <Button size="sm" variant="outline-secondary" onClick={() => handleTransferClick(emp.id)}>Transfer</Button>
                                            <Button size="sm" variant="outline-secondary" onClick={() => handlePromoteClick(emp.id)}>Promote</Button>
                                            <Button size="sm" variant="info" className="text-white" onClick={() => handleViewHistory(emp.id)}>Info</Button>
                                            <Button size="sm" variant="dark" onClick={() => handleLoginClick(emp.id)}>🔑</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODALS (Add, Transfer, Promote, History, Login) --- */}
            {/* 1. Add */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton><Modal.Title>Add Employee</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddSubmit}>
                        <Form.Control className="mb-2" placeholder="First Name" required onChange={e => setAddFormData({...addFormData, first_name: e.target.value})}/>
                        <Form.Control className="mb-2" placeholder="Last Name" required onChange={e => setAddFormData({...addFormData, last_name: e.target.value})}/>
                        <Form.Control className="mb-2" placeholder="NID" required onChange={e => setAddFormData({...addFormData, nid_number: e.target.value})}/>
                        <Form.Control className="mb-2" placeholder="Designation" required onChange={e => setAddFormData({...addFormData, designation: e.target.value})}/>
                        <Form.Control className="mb-2" type="number" placeholder="Salary" required onChange={e => setAddFormData({...addFormData, current_salary: e.target.value})}/>
                        <Button type="submit" className="w-100 mt-2">Save</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* 2. Transfer */}
            <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
                <Modal.Header closeButton><Modal.Title>Transfer</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleTransferSubmit}>
                        <Form.Select className="mb-2" required onChange={e => setTransferData({...transferData, target_office_id: e.target.value})}>
                            <option value="">Select Office</option>
                            {offices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </Form.Select>
                        <Form.Control type="date" required onChange={e => setTransferData({...transferData, transfer_date: e.target.value})}/>
                        <Button type="submit" variant="warning" className="w-100 mt-2">Confirm</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* 3. Promote */}
            <Modal show={showPromoteModal} onHide={() => setShowPromoteModal(false)}>
                <Modal.Header closeButton><Modal.Title>Promote</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handlePromoteSubmit}>
                         {/* Dynamic Dropdown for designations */}
                        {designations.length > 0 ? (
                            <Form.Select className="mb-2" required onChange={e => {
                                const d = designations.find(x => x.id == e.target.value);
                                setPromoteData({...promoteData, new_designation: d.title, new_salary: d.basic_salary});
                            }}>
                                <option value="">Select New Post</option>
                                {designations.map(d => <option key={d.id} value={d.id}>{d.title} (Grade {d.grade})</option>)}
                            </Form.Select>
                        ) : (
                            <Form.Control className="mb-2" placeholder="Title" onChange={e => setPromoteData({...promoteData, new_designation: e.target.value})}/>
                        )}
                        <Form.Control type="number" value={promoteData.new_salary} onChange={e => setPromoteData({...promoteData, new_salary: e.target.value})} placeholder="New Salary"/>
                        <Form.Control type="date" className="mt-2" onChange={e => setPromoteData({...promoteData, promotion_date: e.target.value})}/>
                        <Button type="submit" variant="success" className="w-100 mt-2">Approve</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* 4. Login */}
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
                <Modal.Header closeButton><Modal.Title>Grant Access</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleLoginSubmit}>
                        <Form.Control type="email" placeholder="Gmail Address" required onChange={e => setLoginEmail(e.target.value)}/>
                        <p className="text-muted small mt-2">Default pass: 123456</p>
                        <Button type="submit" variant="dark" className="w-100">Create</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* 5. History */}
            <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)}>
                <Modal.Header closeButton><Modal.Title>Timeline</Modal.Title></Modal.Header>
                <Modal.Body>
                    {selectedEmployee?.promotions?.map(p => <div key={p.id} className="mb-2 border-start border-success ps-2">Promoted to {p.new_designation} ({p.promotion_date})</div>)}
                    {selectedEmployee?.transfers?.map(t => <div key={t.id} className="mb-2 border-start border-warning ps-2">Transferred to {t.to_office?.name} ({t.transfer_date})</div>)}
                </Modal.Body>
            </Modal>
        </Layout>
    );
};
export default Dashboard;