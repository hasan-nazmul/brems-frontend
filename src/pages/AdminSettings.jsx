import React, { useState } from 'react';
import Layout from '../components/Layout';
import Preloader from '../components/Preloader';
import api from '../utils/api';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { FaPlus, FaTrash, FaWpforms, FaEye, FaSave } from 'react-icons/fa';

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formFields, setFormFields] = useState([]); 
    const [newField, setNewField] = useState({ label: '', type: 'text', required: true });

    const addField = () => {
        if(!newField.label) return alert("Please enter a question label");
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
        setLoading(true);
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
            alert("Error creating form: " + (error.response?.data?.message || "Check network"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            {loading && <Preloader />}
            
            <div className="space-y-6">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#006A4E] flex items-center gap-3">
                            <FaWpforms className="text-3xl" /> Form Builder
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Create digital forms, surveys, and declarations for staff.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* --- LEFT COLUMN: EDITOR (4 Cols) --- */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 1. Form Basic Info */}
                        <Card>
                            <CardHeader title="1. Form Details" subtitle="Basic Configuration" />
                            <CardBody className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Form Title</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] outline-none transition-all font-bold text-gray-800"
                                        placeholder="e.g. Annual Asset Declaration 2026"
                                        value={formTitle} 
                                        onChange={e => setFormTitle(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Instructions / Description</label>
                                    <textarea 
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] outline-none transition-all text-sm min-h-[80px]"
                                        placeholder="Explain the purpose of this form..."
                                        value={formDesc} 
                                        onChange={e => setFormDesc(e.target.value)} 
                                    />
                                </div>
                            </CardBody>
                        </Card>

                        {/* 2. Add Questions */}
                        <Card>
                            <CardHeader title="2. Add Question" subtitle="Field Configuration" />
                            <CardBody className="bg-gray-50/50">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Question Label</label>
                                        <input 
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none text-sm bg-white"
                                            placeholder="e.g. Date of Birth"
                                            value={newField.label}
                                            onChange={e => setNewField({...newField, label: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Input Type</label>
                                            <select 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#006A4E] focus:ring-1 focus:ring-[#006A4E] outline-none text-sm bg-white"
                                                value={newField.type} 
                                                onChange={e => setNewField({...newField, type: e.target.value})}
                                            >
                                                <option value="text">Text Input</option>
                                                <option value="number">Number</option>
                                                <option value="date">Date Picker</option>
                                                <option value="email">Email Address</option>
                                                <option value="textarea">Long Text</option>
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                onClick={addField}
                                                className="w-full bg-slate-800 text-white py-2 rounded-md text-sm font-bold hover:bg-slate-900 transition flex justify-center items-center gap-2"
                                            >
                                                <FaPlus /> Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                    </div>

                    {/* --- RIGHT COLUMN: PREVIEW (8 Cols) --- */}
                    <div className="lg:col-span-8">
                        <Card className="h-full border-t-4 border-t-[#006A4E]">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <FaEye className="text-[#006A4E]" /> Live Preview
                                    </h3>
                                    <p className="text-xs text-gray-500">This is how the employee will see the form.</p>
                                </div>
                                {formFields.length > 0 && (
                                    <button 
                                        onClick={handleCreateForm}
                                        className="bg-[#006A4E] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#047857] shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all flex items-center gap-2"
                                    >
                                        <FaSave /> Publish Form
                                    </button>
                                )}
                            </div>
                            
                            <CardBody className="p-8 bg-gray-50/30 min-h-[500px]">
                                {/* Paper Effect Container */}
                                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-3xl mx-auto">
                                    
                                    {/* Form Header */}
                                    <div className="border-b border-gray-100 pb-6 mb-6">
                                        {formTitle ? (
                                            <h2 className="text-2xl font-bold text-[#006A4E]">{formTitle}</h2>
                                        ) : (
                                            <h2 className="text-2xl font-bold text-gray-300 italic">Form Title...</h2>
                                        )}
                                        
                                        {formDesc ? (
                                            <p className="text-gray-600 mt-2 text-sm">{formDesc}</p>
                                        ) : (
                                            <p className="text-gray-300 mt-2 text-sm italic">Form description will appear here...</p>
                                        )}
                                    </div>

                                    {/* Questions List */}
                                    <div className="space-y-6">
                                        {formFields.length === 0 && (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                                <p className="text-gray-400 font-medium">No questions added yet.</p>
                                                <p className="text-xs text-gray-400">Use the panel on the left to add fields.</p>
                                            </div>
                                        )}

                                        {formFields.map((f, i) => (
                                            <div key={i} className="group relative bg-white rounded-lg p-1 hover:bg-gray-50 transition-colors">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    {i + 1}. {f.label} {f.required && <span className="text-red-500">*</span>}
                                                </label>
                                                
                                                {f.type === 'textarea' ? (
                                                    <textarea disabled className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm h-20 resize-none cursor-not-allowed" placeholder="Long text answer..."></textarea>
                                                ) : (
                                                    <input disabled type={f.type} className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm cursor-not-allowed" placeholder={`Answer...`} />
                                                )}

                                                {/* Delete Button (Appears on Hover) */}
                                                <button 
                                                    onClick={() => removeField(i)}
                                                    className="absolute top-0 right-0 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remove Question"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default AdminSettings;