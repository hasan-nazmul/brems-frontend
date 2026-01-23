import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    // Empty initial state so you can type freely
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            console.log("Attempting login with:", email, password); // Debugging

            const response = await api.post('/login', { email, password });
            
            console.log("Login Success:", response.data); // Debugging

            // Save Token
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Check Role
            const userRole = response.data.user.role;
            
            // Redirect based on role
            if (userRole === 'verified_user') {
                navigate('/portal');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            console.error("Login Error:", err);
            // Show the actual error message from Laravel if available
            setError(err.response?.data?.message || 'Invalid Email or Password');
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card p-4 shadow border-0" style={{ width: '400px' }}>
                <div className="text-center mb-4">
                    <h3>🚂 BREMS Login</h3>
                    <p className="text-muted">Bangladesh Railway ERP</p>
                </div>
                
                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            placeholder="nid@railway.gov.bd"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="mb-3">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Sign In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;