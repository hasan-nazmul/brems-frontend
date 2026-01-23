import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Preloader from '../components/Preloader.jsx';
import api from '../utils/api';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { FaPlus, FaUserTie, FaEdit } from 'react-icons/fa';

const ManageDesignations = () => {
    const [designations, setDes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', grade: '', basic_salary: '' });

    const fetchData = async () => { 
        try { const res = await api.get('/designations'); setDes(res.data); } catch(e){} 
    };
    useEffect(() => { fetchData(); }, []);

    // Open for Create
    const handleAddClick = () => {
        setEditingId(null);
        setForm({ title: '', grade: '', basic_salary: '' });
        setShowModal(true);
    };

    // Open for Edit
    const handleEditClick = (d) => {
        setEditingId(d.id);
        setForm({ title: d.title, grade: d.grade, basic_salary: d.basic_salary });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try { 
            if (editingId) {
                await api.put(`/designations/${editingId}`, form);
                alert("✅ Designation Updated!");
            } else {
                await api.post('/designations', form); 
                alert("✅ Designation Added!");
            }
            setShowModal(false); 
            fetchData(); 
        } catch(error) {
            alert("Failed: " + (error.response?.data?.message || "Check inputs"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Preloader show={loading} />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-dark fw-bold">🎖 Designations & Pay Scales</h3>
                <Button onClick={handleAddClick} variant="primary"><FaPlus className="me-2"/> Add Post</Button>
            </div>
            
            <div className="card shadow-sm border-0">
                <Table hover className="mb-0">
                    <thead className="bg-light text-secondary"><tr><th>Grade</th><th>Title</th><th>Basic Salary</th><th className="text-end">Action</th></tr></thead>
                    <tbody>
                        {designations.sort((a,b) => a.grade - b.grade).map(d => (
                            <tr key={d.id}>
                                <td><span className="badge bg-secondary rounded-pill">Grade {d.grade}</span></td>
                                <td className="fw-bold text-dark"><FaUserTie className="me-2 text-muted"/>{d.title}</td>
                                <td className="fw-bold text-success">{Number(d.basic_salary).toLocaleString()} BDT</td>
                                <td className="text-end">
                                    <Button variant="light" size="sm" onClick={() => handleEditClick(d)} className="text-primary">
                                        <FaEdit /> Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                 <Modal.Header closeButton className="bg-primary text-white">
                     <Modal.Title>{editingId ? 'Edit Designation' : 'Add New Post'}</Modal.Title>
                 </Modal.Header>
                 <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Label>Official Title</Form.Label>
                        <Form.Control className="mb-2" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                        
                        <div className="row">
                            <div className="col">
                                <Form.Label>Grade (No.)</Form.Label>
                                <Form.Control type="number" required value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} />
                            </div>
                            <div className="col">
                                <Form.Label>Basic Salary</Form.Label>
                                <Form.Control type="number" required value={form.basic_salary} onChange={e => setForm({...form, basic_salary: e.target.value})} />
                            </div>
                        </div>
                        
                        <Button type="submit" className="w-100 mt-4" variant="primary">
                            {editingId ? 'Update Designation' : 'Save Designation'}
                        </Button>
                    </Form>
                 </Modal.Body>
            </Modal>
        </Layout>
    );
};
export default ManageDesignations;