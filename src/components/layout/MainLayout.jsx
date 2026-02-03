import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';
import { STORAGE_KEYS } from '@/utils/constants';

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SIDEBAR_COLLAPSED,
      String(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile sidebar (drawer overlay – main content stays full width) */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Desktop sidebar */}
      <div className='hidden lg:block'>
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Main content area – padding matches sidebar width on desktop; full width on mobile */}
      <div
        className={clsx(
          'flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* Header */}
        <Header onMenuClick={() => setMobileMenuOpen(true)} showMenuButton />

        {/* Page content */}
        <main className='flex-1 p-4 sm:p-6 lg:p-8'>
          <Outlet />
        </main>

        {/* Footer */}
        <footer className='px-4 py-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white'>
          <p>
            © {new Date().getFullYear()} Bangladesh Railway. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
