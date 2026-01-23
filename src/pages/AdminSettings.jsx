import React, { useState } from 'react';
import Layout from '../components/Layout';
import Preloader from '../components/Preloader'; // <--- Import
import api from '../utils/api';
import { Form, Button } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';

const AdminSettings = () => {
    const [loading, setLoading] = useState(false); // <--- Loading State
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formFields, setFormFields] = useState([]); 
    const [newField, setNewField] = useState({ label: '', type: 'text', required: true });

    const addField = () => {
        if(!newField.label) return alert("Enter a question label");
        setFormFields([...formFields, newField]);
        setNewField({ label: '', type: 'text', required: true });
    };

    const removeField = (index) => {
        const list = [...formFields];
        list.splice(index, 1);
        setFormFields(list);
    };

    const handleCreateForm = async (e) => {
        e.preventDefault();
        setLoading(true); // <--- Start Loading
        try {
            await api.post('/forms', {
                title: formTitle,
                description: formDesc,
                fields: formFields
            });
            alert("✅ Form Created Successfully!");
            setFormTitle(''); setFormDesc(''); setFormFields([]);
        } catch (error) {
            console.error("Form Error:", error);
            // Show detailed error
            alert("Error creating form: " + (error.response?.data?.message || "Check network"));
        } finally {
            setLoading(false); // <--- Stop Loading
        }
    };

    return (
        <Layout>
            <Preloader show={loading} /> {/* <--- Render Preloader */}
            
            <div className="container-fluid">
                <h3 className="mb-4 fw-bold text-dark">📝 Form Builder</h3>
                <p className="text-muted">Create surveys, declarations, or applications for employees.</p>

                <div className="row">
                    <div className="col-md-5">
                        <div className="card p-4 shadow-sm border-0 border-top border-4 border-success">
                            <h5 className="mb-3">1. Form Details</h5>
                            <Form.Control className="mb-2 fw-bold" placeholder="Form Title (e.g. Asset Declaration 2026)" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                            <Form.Control as="textarea" className="mb-4" placeholder="Description / Instructions" value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                            
                            <h5 className="mb-3">2. Add Questions</h5>
                            <div className="card bg-light p-3 border-0">
                                <Form.Control className="mb-2" placeholder="Question Label" value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} />
                                <div className="d-flex gap-2">
                                    <Form.Select value={newField.type} onChange={e => setNewField({...newField, type: e.target.value})}>
                                        <option value="text">Text Input</option>
                                        <option value="number">Number Input</option>
                                        <option value="date">Date Picker</option>
                                        <option value="email">Email</option>
                                    </Form.Select>
                                    <Button variant="dark" onClick={addField}><FaPlus/> Add</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-7">
                        <div className="card p-4 shadow-sm border-0 h-100">
                            <h5 className="text-muted border-bottom pb-2">Live Preview</h5>
                            {formTitle ? <h3 className="text-success mt-2">{formTitle}</h3> : <h3 className="text-muted mt-2 opacity-25">Form Title</h3>}
                            <p className="text-muted">{formDesc}</p>

                            <div className="mt-4">
                                {formFields.length === 0 && <div className="text-center text-muted py-5 border dashed">No questions added yet.</div>}
                                
                                {formFields.map((f, i) => (
                                    <div key={i} className="mb-3 p-3 border rounded position-relative bg-white group-hover">
                                        <label className="fw-bold form-label">{f.label}</label>
                                        <input type={f.type} className="form-control" disabled placeholder={`User will enter ${f.type}...`} />
                                        <button onClick={() => removeField(i)} className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2 border-0">
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {formFields.length > 0 && (
                                <Button size="lg" variant="success" className="w-100 mt-4" onClick={handleCreateForm}>
                                    🚀 Publish Form
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminSettings;