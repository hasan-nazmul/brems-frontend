import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManageOffices from './pages/ManageOffices';
import ManageDesignations from './pages/ManageDesignations';
import AdminInbox from './pages/AdminInbox'; // New Page
import EmployeePortal from './pages/EmployeePortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/offices" element={<ManageOffices />} />
        <Route path="/designations" element={<ManageDesignations />} />
        <Route path="/inbox" element={<AdminInbox />} />

        {/* Employee Route */}
        <Route path="/portal" element={<EmployeePortal />} />
      </Routes>
    </Router>
  );
}

export default App;