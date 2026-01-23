import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Preloader from '../components/Preloader';
import api from '../utils/api';
import { Form, Button, Modal } from 'react-bootstrap';
import { FaFolder, FaFolderOpen, FaBuilding, FaPlus, FaEdit } from 'react-icons/fa';

const ManageOffices = () => {
    const [offices, setOffices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [editingId, setEditingId] = useState(null); // Track if we are editing
    const [form, setForm] = useState({ name: '', code: '', location: '', parent_id: '' });

    const fetchOffices = async () => {
        try { const res = await api.get('/offices'); setOffices(res.data); } catch(e){}
    };
    useEffect(() => { fetchOffices(); }, []);

    // Handle Open Modal for Create
    const handleAddClick = () => {
        setEditingId(null);
        setForm({ name: '', code: '', location: '', parent_id: '' });
        setShowModal(true);
    };

    // Handle Open Modal for Edit
    const handleEditClick = (office, e) => {
        e.stopPropagation(); // Prevent toggling the folder open/close
        setEditingId(office.id);
        setForm({ 
            name: office.name, 
            code: office.code, 
            location: office.location, 
            parent_id: office.parent_id || '' 
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { 
            if (editingId) {
                // UPDATE (PUT)
                await api.put(`/offices/${editingId}`, form);
                alert("✅ Office Updated!");
            } else {
                // CREATE (POST)
                await api.post('/offices', form);
                alert("✅ Office Created!");
            }
            setShowModal(false); 
            fetchOffices(); 
        } 
        catch (error) { 
            alert("Failed: " + (error.response?.data?.message || "Check inputs")); 
        } finally {
            setLoading(false);
        }
    };

    // --- RECURSIVE TREE COMPONENT ---
    const TreeNode = ({ node }) => {
        const [isOpen, setIsOpen] = useState(true);
        const children = offices.filter(o => o.parent_id === node.id);
        const hasChildren = children.length > 0;

        return (
            <div style={{ marginLeft: '20px' }} className="mt-2">
                <div 
                    className="d-flex align-items-center justify-content-between p-2 rounded hover-bg border bg-white" 
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="d-flex align-items-center">
                        <span className="me-2 text-warning" style={{fontSize: '1.2rem'}}>
                            {hasChildren ? (isOpen ? <FaFolderOpen /> : <FaFolder />) : <FaBuilding className="text-success"/>}
                        </span>
                        <div>
                            <span className="fw-bold text-dark">{node.name}</span>
                            <span className="text-muted ms-2 small">({node.code})</span>
                        </div>
                    </div>
                    
                    {/* EDIT BUTTON */}
                    <Button variant="light" size="sm" className="border-0 text-primary" onClick={(e) => handleEditClick(node, e)}>
                        <FaEdit /> Edit
                    </Button>
                </div>
                
                {isOpen && hasChildren && (
                    <div style={{ borderLeft: '1px dashed #ccc', marginLeft: '10px' }}>
                        {children.map(child => <TreeNode key={child.id} node={child} />)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Layout>
            <Preloader show={loading} />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-dark fw-bold">🏢 Organization Hierarchy</h3>
                <Button onClick={handleAddClick} variant="success"><FaPlus className="me-2"/> Add Office</Button>
            </div>

            <div className="bg-light p-4 rounded shadow-sm border" style={{minHeight: '400px'}}>
                {offices.filter(o => !o.parent_id).map(root => (
                    <TreeNode key={root.id} node={root} />
                ))}
                {offices.length === 0 && <p className="text-muted">No offices found.</p>}
            </div>

            {/* MODAL (Reused for Add & Edit) */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title>{editingId ? 'Edit Office' : 'Add New Office'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Control className="mb-2" placeholder="Office Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                        <Form.Control className="mb-2" placeholder="Office Code (Unique)" required value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                        <Form.Control className="mb-2" placeholder="Location" required value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
                        <Form.Label>Parent Office (Optional)</Form.Label>
                        <Form.Select value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})}>
                            <option value="">-- No Parent (Top Level) --</option>
                            {offices.map(o => (
                                o.id !== editingId && <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </Form.Select>
                        <Button type="submit" className="w-100 mt-3" variant="success">
                            {editingId ? 'Update Office' : 'Save Office'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Layout>
    );
};
export default ManageOffices;