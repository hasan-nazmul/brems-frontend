import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar'; // Ensure this file exists!

const Layout = ({ children }) => {
    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 d-flex flex-column" style={{ height: '100vh', overflowY: 'auto' }}>
                <Navbar />
                <div className="p-4 bg-light flex-grow-1">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default Layout;