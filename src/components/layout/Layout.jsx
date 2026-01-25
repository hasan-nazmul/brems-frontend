import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Only Login is full screen. Portal gets the Sidebar.
    const isFullScreenPage = location.pathname === '/' || location.pathname === '/login';

    if (isFullScreenPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* MOBILE BACKDROP OVERLAY 
              Only visible on mobile when sidebar is open 
            */}
            {isMobileSidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR WRAPPER 
              We pass the state down so Sidebar can handle its own animation 
            */}
            <Sidebar 
                isOpen={isMobileSidebarOpen} 
                setIsOpen={setIsMobileSidebarOpen} 
            />

            {/* MAIN CONTENT WRAPPER 
              - ml-0 on mobile (full width)
              - ml-64 on desktop (lg) to make room for sidebar
            */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ml-0 lg:ml-64">
                
                {/* Navbar needs to know how to toggle the sidebar */}
                <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;