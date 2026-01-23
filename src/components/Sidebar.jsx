import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaHome, FaBuilding, FaUserTie, FaInbox, FaSignOutAlt } from 'react-icons/fa'; // Ensure icons are installed
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="sidebar d-flex flex-column p-3 shadow" style={{ width: '260px', minWidth: '260px', minHeight: '100vh', background: '#006747', color: 'white' }}>
            <div className="text-center mb-4 pt-2">
                <div style={{width: 50, height: 50, background: '#fff', borderRadius: '50%', margin: '0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize: '1.5rem'}}>
                    🚂 
                </div>
                <h5 className="fw-bold mb-0">BREMS</h5>
                <small style={{opacity: 0.7}}>Bangladesh Railway</small>
            </div>
            
            <Nav className="flex-column gap-1">
                <small className="text-uppercase fw-bold mb-2 mt-2" style={{fontSize: '11px', opacity: 0.6}}>Main Menu</small>
                
                <Nav.Link onClick={() => navigate('/dashboard')} className={`text-white ${isActive('/dashboard')}`}>
                    <FaHome className="me-3" /> Dashboard
                </Nav.Link>
                
                <Nav.Link onClick={() => navigate('/inbox')} className={`text-white ${isActive('/inbox')}`}>
                    <FaInbox className="me-3" /> Requests Inbox
                </Nav.Link>

                <small className="text-uppercase fw-bold mb-2 mt-3" style={{fontSize: '11px', opacity: 0.6}}>Administration</small>

                <Nav.Link onClick={() => navigate('/offices')} className={`text-white ${isActive('/offices')}`}>
                    <FaBuilding className="me-3" /> Manage Offices
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/designations')} className={`text-white ${isActive('/designations')}`}>
                    <FaUserTie className="me-3" /> Designations
                </Nav.Link>
            </Nav>
            
            <div className="mt-auto text-center pt-4 border-top border-secondary">
                 <small style={{opacity: 0.5}}>© 2026 Gov.bd</small>
            </div>
        </div>
    );
};

export default Sidebar;