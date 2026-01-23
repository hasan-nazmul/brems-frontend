import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import api from '../utils/api';
import { FaUserCircle, FaKey, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // Password State
    const [showPassModal, setShowPassModal] = useState(false);
    const [passForm, setPassForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) {}
        localStorage.clear();
        navigate('/');
    };

    const handleChangePass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/change-password', passForm);
            alert("Password Changed Successfully!");
            setShowPassModal(false);
        } catch (err) { alert("Failed. Check current password."); }
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 justify-content-between">
                <span className="navbar-brand mb-0 h1 fw-bold text-success">
                    {user?.name} <span className="text-muted small fw-normal">| System Admin</span>
                </span>
                <div className="d-flex gap-2">
                    <button onClick={() => setShowPassModal(true)} className="btn btn-light border btn-sm d-flex align-items-center gap-2">
                        <FaKey className="text-muted"/> Change Password
                    </button>
                    <button onClick={handleLogout} className="btn btn-danger btn-sm d-flex align-items-center gap-2">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </nav>

            {/* Change Password Modal */}
            <Modal show={showPassModal} onHide={() => setShowPassModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Security Settings</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleChangePass}>
                        <Form.Label>Current Password</Form.Label>
                        <Form.Control className="mb-2" type="password" required onChange={e => setPassForm({...passForm, current_password: e.target.value})} />
                        <Form.Label>New Password</Form.Label>
                        <Form.Control className="mb-2" type="password" required onChange={e => setPassForm({...passForm, new_password: e.target.value})} />
                        <Form.Control className="mb-3" type="password" placeholder="Confirm New Password" required onChange={e => setPassForm({...passForm, new_password_confirmation: e.target.value})} />
                        <Button type="submit" variant="dark" className="w-100">Update Password</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Navbar;