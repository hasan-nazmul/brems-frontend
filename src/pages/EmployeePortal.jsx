import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Modal, Form, Badge, Table } from 'react-bootstrap';

const EmployeePortal = () => {
    // Data State
    const [employee, setEmployee] = useState(null);
    const [myRequests, setMyRequests] = useState([]); // List of my change requests

    // Request Modal State
    const [showReqModal, setShowReqModal] = useState(false);
    const [reqData, setReqData] = useState({ request_type: 'Correction', details: '' });

    // Password Change State
    const [showPassModal, setShowPassModal] = useState(false);
    const [passForm, setPassForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

    const navigate = useNavigate();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user.employee_id) return;

            // 1. Fetch Profile
            const empRes = await api.get(`/employees/${user.employee_id}`);
            setEmployee(empRes.data);

            // 2. Fetch My Requests (Assuming backend supports filtering or we filter client side)
            // Ideally backend should have /my-requests, but for now we try to fetch requests 
            // If this fails because of admin restriction, we just show empty.
            try {
                const reqRes = await api.get('/profile-requests'); 
                // Client side filter to ensure we only show ours (if admin endpoint returns all)
                const mine = reqRes.data.filter(r => r.employee_id === user.employee_id);
                setMyRequests(mine);
            } catch(e) { console.log("Requests API restricted"); }

        } catch (error) {
            console.error("Error loading portal data");
        }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/'); };

    // --- REQUEST HANDLING ---
    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/profile-requests', reqData);
            alert("Request sent to Admin!");
            setShowReqModal(false);
            setReqData({ request_type: 'Correction', details: '' });
            fetchData();
        } catch (e) { alert("Failed to send request"); }
    };

    // --- PASSWORD CHANGE HANDLING ---
    const handleChangePass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/change-password', passForm);
            alert("Password Changed Successfully! Please login again.");
            handleLogout();
        } catch (err) { alert("Failed. Check current password."); }
    };

    const getStatusBadge = (status) => {
        if(status === 'approved') return <Badge bg="success">🟢 Approved</Badge>;
        if(status === 'reviewing') return <Badge bg="warning" text="dark">🟡 Under Review</Badge>;
        if(status === 'rejected') return <Badge bg="danger">🔴 Rejected</Badge>;
        return <Badge bg="secondary">⚪ Pending</Badge>;
    };

    if (!employee) return <div className="p-5 text-center text-muted">Loading Profile...</div>;

    return (
        <div className="container py-5">
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-4 rounded shadow-sm border-start border-5 border-success">
                <div>
                    <h2 className="mb-0 fw-bold text-dark">Employee Portal</h2>
                    <p className="text-muted mb-0">Bangladesh Railway Self-Service</p>
                </div>
                <div>
                    <Button variant="outline-dark" className="me-2" onClick={() => setShowPassModal(true)}>Change Password</Button>
                    <Button variant="danger" onClick={handleLogout}>Logout</Button>
                </div>
            </div>

            <div className="row">
                {/* LEFT COLUMN: Profile & Actions */}
                <div className="col-md-4">
                    <Card className="shadow-sm mb-4 border-0">
                        <Card.Body className="text-center pt-5 pb-4">
                            <div className="bg-light rounded-circle d-inline-flex justify-content-center align-items-center mb-3 shadow-sm" style={{width: 100, height: 100, fontSize: '2.5rem'}}>👤</div>
                            <h4 className="fw-bold">{employee.first_name} {employee.last_name}</h4>
                            <p className="text-success fw-bold mb-2">{employee.designation}</p>
                            <Badge bg="dark" className="mb-3">NID: {employee.nid_number}</Badge>
                            
                            <div className="bg-light p-3 rounded text-start mt-2">
                                <div className="d-flex justify-content-between mb-2"><span className="text-muted small">Office:</span><span className="fw-bold">{employee.office?.name}</span></div>
                                <div className="d-flex justify-content-between mb-2"><span className="text-muted small">Salary:</span><span className="fw-bold">{Number(employee.current_salary).toLocaleString()} BDT</span></div>
                                <div className="d-flex justify-content-between"><span className="text-muted small">Status:</span><span className="text-success fw-bold text-uppercase">{employee.status}</span></div>
                            </div>
                            
                            <Button variant="primary" className="w-100 mt-4" onClick={() => setShowReqModal(true)}>
                                📝 Request Profile Change
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* RECENT REQUESTS STATUS */}
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-white fw-bold">My Requests</Card.Header>
                        <Card.Body className="p-0">
                            <Table hover size="sm" className="mb-0">
                                <tbody>
                                    {myRequests.map(r => (
                                        <tr key={r.id}>
                                            <td className="ps-3"><small>{r.request_type}</small></td>
                                            <td className="text-end pe-3">{getStatusBadge(r.status)}</td>
                                        </tr>
                                    ))}
                                    {myRequests.length === 0 && <tr><td className="text-center py-3 small text-muted">No active requests</td></tr>}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Timeline History */}
                <div className="col-md-8">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white fw-bold py-3 border-bottom">My Career Timeline</Card.Header>
                        <Card.Body className="bg-light p-4">
                            <div className="timeline">
                                {(!employee.promotions?.length && !employee.transfers?.length) && <div className="text-center text-muted py-5">No service history found.</div>}
                                
                                {employee.promotions?.map(p => (
                                    <div className="timeline-item" key={'p'+p.id}>
                                        <div className="timeline-date">{p.promotion_date}</div>
                                        <div className="timeline-content border-start border-4 border-success">
                                            <h6 className="fw-bold text-success mb-1">Promoted to {p.new_designation}</h6>
                                            <p className="mb-0 small text-muted">Salary: {Number(p.new_salary).toLocaleString()} BDT</p>
                                        </div>
                                    </div>
                                ))}

                                {employee.transfers?.map(t => (
                                    <div className="timeline-item" key={'t'+t.id}>
                                        <div className="timeline-date">{t.transfer_date}</div>
                                        <div className="timeline-content border-start border-4 border-warning">
                                            <h6 className="fw-bold text-dark mb-1">Transferred to {t.to_office?.name}</h6>
                                            <p className="mb-0 small text-muted">From: {t.from_office?.name} {t.order_number && <span>(Ref: {t.order_number})</span>}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* REQUEST MODAL */}
            <Modal show={showReqModal} onHide={() => setShowReqModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Request Update</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleRequestSubmit}>
                        <Form.Label>What needs correction?</Form.Label>
                        <Form.Select className="mb-3" onChange={e => setReqData({...reqData, request_type: e.target.value})}>
                            <option value="Correction">Correction of Name/Spelling</option>
                            <option value="NID Update">NID Update</option>
                            <option value="Contact Update">Phone/Email Update</option>
                            <option value="Other">Other</option>
                        </Form.Select>
                        <Form.Label>Details (Current vs Correct)</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="e.g. My name is spelt 'Abul', it should be 'Abul'" required onChange={e => setReqData({...reqData, details: e.target.value})} />
                        <Button type="submit" className="w-100 mt-3" variant="primary">Send Request</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* PASSWORD MODAL */}
            <Modal show={showPassModal} onHide={() => setShowPassModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Change Password</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleChangePass}>
                        <Form.Control className="mb-2" type="password" placeholder="Current Password" required onChange={e => setPassForm({...passForm, current_password: e.target.value})} />
                        <Form.Control className="mb-2" type="password" placeholder="New Password" required onChange={e => setPassForm({...passForm, new_password: e.target.value})} />
                        <Form.Control className="mb-3" type="password" placeholder="Confirm" required onChange={e => setPassForm({...passForm, new_password_confirmation: e.target.value})} />
                        <Button type="submit" variant="dark" className="w-100">Update</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};
export default EmployeePortal;