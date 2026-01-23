import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Table, Badge, Button, Form, Modal } from 'react-bootstrap';

const AdminInbox = () => {
    const [requests, setRequests] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [adminNote, setAdminNote] = useState('');

    const fetchRequests = async () => {
        try { const res = await api.get('/profile-requests'); setRequests(res.data); } catch(e){}
    };
    useEffect(() => { fetchRequests(); }, []);

    const updateStatus = async (status) => {
        try {
            await api.put(`/profile-requests/${selectedReq.id}`, { status, admin_note: adminNote });
            alert(`Marked as ${status}`);
            setSelectedReq(null);
            fetchRequests();
        } catch (e) { alert("Error"); }
    };

    const getBadge = (status) => {
        if(status === 'approved') return <Badge bg="success">Green Light</Badge>;
        if(status === 'reviewing') return <Badge bg="warning" text="dark">Yellow Light</Badge>;
        if(status === 'rejected') return <Badge bg="danger">Red Light</Badge>;
        return <Badge bg="secondary">Pending</Badge>;
    };

    return (
        <Layout>
            <h3 className="mb-4">📥 Approval Inbox</h3>
            <div className="card shadow-sm border-0">
                <Table hover className="mb-0">
                    <thead className="table-light"><tr><th>Employee</th><th>Type</th><th>Details</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        {requests.map(r => (
                            <tr key={r.id}>
                                <td>{r.employee?.first_name} {r.employee?.last_name}</td>
                                <td>{r.request_type}</td>
                                <td><small>{r.details}</small></td>
                                <td>{getBadge(r.status)}</td>
                                <td>
                                    {r.status === 'pending' || r.status === 'reviewing' ? (
                                        <Button size="sm" variant="outline-primary" onClick={() => setSelectedReq(r)}>Review</Button>
                                    ) : <span className="text-muted small">Closed</span>}
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && <tr><td colSpan="5" className="text-center p-4">No pending requests</td></tr>}
                    </tbody>
                </Table>
            </div>

            {/* REVIEW MODAL */}
            <Modal show={selectedReq !== null} onHide={() => setSelectedReq(null)}>
                <Modal.Header closeButton><Modal.Title>Review Request</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p><strong>Employee:</strong> {selectedReq?.employee?.first_name}</p>
                    <p><strong>Request:</strong> {selectedReq?.details}</p>
                    <Form.Group className="mb-3">
                        <Form.Label>Reviewer Note</Form.Label>
                        <Form.Control as="textarea" onChange={e => setAdminNote(e.target.value)} />
                    </Form.Group>
                    <div className="d-flex gap-2">
                        <Button variant="warning" className="flex-fill" onClick={() => updateStatus('reviewing')}>🟡 Under Review</Button>
                        <Button variant="danger" className="flex-fill" onClick={() => updateStatus('rejected')}>🔴 Reject</Button>
                        <Button variant="success" className="flex-fill" onClick={() => updateStatus('approved')}>🟢 Approve & Close</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Layout>
    );
};
export default AdminInbox;