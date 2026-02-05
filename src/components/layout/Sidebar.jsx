import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { STORAGE_KEYS } from '@/utils/constants';
import Logo from './Logo';

const Sidebar = ({
  onNavigateClick,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}) => {
  const { user, logout, isSuperAdmin, isOfficeAdmin, isVerifiedUser } =
    useAuth();
  const permissions = usePermissions();
  const location = useLocation();
  const isMobile = !!onNavigateClick;
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return stored === 'true';
  });
  const isControlled =
    controlledCollapsed !== undefined &&
    typeof onCollapsedChange === 'function';
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;
  const setCollapsed = isControlled
    ? (next) => onCollapsedChange(next)
    : setInternalCollapsed;
  const effectiveCollapsed = isMobile ? false : collapsed;

  useEffect(() => {
    if (!isMobile && !isControlled) {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, internalCollapsed);
    }
  }, [isMobile, isControlled, internalCollapsed]);

  // Navigation items configuration
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      show: permissions.canViewDashboard,
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: UsersIcon,
      show: permissions.canViewEmployees,
      children: [
        { name: 'All Employees', href: '/employees' },
        {
          name: 'Add Employee',
          href: '/employees/create',
          show: permissions.canCreateEmployee,
        },
        { name: 'Released Employees', href: '/employees/released' },
      ],
    },
    {
      name: 'Offices',
      href: '/offices',
      icon: BuildingOfficeIcon,
      show: !isVerifiedUser(),
    },
    {
      name: 'Designations',
      href: '/designations',
      icon: BriefcaseIcon,
      show: !isVerifiedUser(),
    },
    {
      name: 'Users',
      href: '/users',
      icon: UserGroupIcon,
      show: permissions.canViewUsers,
    },
    {
      name: 'Profile Requests',
      href: '/profile-requests',
      icon: DocumentCheckIcon,
      show: permissions.canViewAllRequests,
      badge: 'pending',
    },
    {
      name: 'Forms',
      href: '/forms',
      icon: ClipboardDocumentListIcon,
      show: true,
      children: [
        { name: 'All Forms', href: '/forms' },
        {
          name: 'Create Form',
          href: '/forms/create',
          show: permissions.canCreateForm,
        },
        {
          name: 'My Submissions',
          href: '/forms/my-submissions',
          show: !!user?.employee_id,
        },
        {
          name: 'All Submissions',
          href: '/forms/submissions',
          show: permissions.canViewSubmissions,
        },
      ],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: ChartBarIcon,
      show: permissions.canViewReports,
      children: [
        { name: 'Employee Statistics', href: '/reports/employees' },
        { name: 'Transfer Report', href: '/reports/transfers' },
        { name: 'Promotion Report', href: '/reports/promotions' },
        { name: 'Office Report', href: '/reports/offices' },
      ],
    },
  ];

  // User menu items
  const userMenuItems = [
    {
      name: 'My Profile',
      href: '/my-profile',
      icon: UserCircleIcon,
      show: true,
    },
    {
      name: 'My Requests',
      href: '/my-requests',
      icon: DocumentTextIcon,
      show: permissions.canViewOwnRequests,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      show: true,
    },
  ];

  const NavItem = ({ item, isChild = false }) => {
    const isActive =
      location.pathname === item.href ||
      item.children?.some((child) => location.pathname === child.href);

    if (item.show === false) return null;

    return (
      <NavLink
        to={item.href}
        end={isChild}
        onClick={onNavigateClick}
        className={({ isActive: linkActive }) =>
          clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isChild && 'ml-9',
            linkActive || isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )
        }
      >
        {!isChild && item.icon && (
          <item.icon className='w-5 h-5 flex-shrink-0' />
        )}
        {!effectiveCollapsed && (
          <>
            <span className='flex-1'>{item.name}</span>
            {item.badge && (
              <span className='px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full'>
                !
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const NavGroup = ({ item }) => {
    const [isOpen, setIsOpen] = useState(
      item.children?.some((child) => location.pathname === child.href)
    );

    if (item.show === false) return null;

    const hasVisibleChildren = item.children?.some(
      (child) => child.show !== false
    );

    if (!hasVisibleChildren) {
      return <NavItem item={item} />;
    }

    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          {item.icon && <item.icon className='w-5 h-5 flex-shrink-0' />}
          {!effectiveCollapsed && (
            <>
              <span className='flex-1 text-left'>{item.name}</span>
              <ChevronRightIcon
                className={clsx(
                  'w-4 h-4 transition-transform',
                  isOpen && 'rotate-90'
                )}
              />
            </>
          )}
        </button>
        {!effectiveCollapsed && isOpen && (
          <div className='mt-1 space-y-1'>
            {item.children
              .filter((child) => child.show !== false)
              .map((child) => (
                <NavItem key={child.href} item={child} isChild />
              ))}
          </div>
        )}
      </div>
    );
  };

  const header = (
    <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200 shrink-0'>
      <Logo collapsed={effectiveCollapsed} />
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
        >
          {effectiveCollapsed ? (
            <ChevronRightIcon className='w-5 h-5' />
          ) : (
            <ChevronLeftIcon className='w-5 h-5' />
          )}
        </button>
      )}
    </div>
  );

  const inner = (
    <>
      {header}
      {/* Navigation */}
      <nav className='flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto'>
        {navigationItems.map((item) =>
          item.children ? (
            <NavGroup key={item.href} item={item} />
          ) : (
            <NavItem key={item.href} item={item} />
          )
        )}
      </nav>

      {/* Divider */}
      <div className='px-3'>
        <div className='border-t border-gray-200' />
      </div>

      {/* User Menu */}
      <div className='px-3 py-4 space-y-1'>
        {userMenuItems
          .filter((item) => item.show)
          .map((item) => (
            <NavItem key={item.href} item={item} />
          ))}

        {/* Logout Button */}
        <button
          onClick={() => {
            onNavigateClick?.();
            logout();
          }}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            'text-red-600 hover:bg-red-50'
          )}
        >
          <ArrowRightOnRectangleIcon className='w-5 h-5 flex-shrink-0' />
          {!effectiveCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* User Info */}
      {!effectiveCollapsed && user && (
        <div className='px-4 py-3 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium'>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-900 truncate'>
                {user.name}
              </p>
              <p className='text-xs text-gray-500 truncate'>
                {user.role
                  ?.replace('_', ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <div className='flex flex-col flex-1 min-h-0 w-full bg-white overflow-hidden'>
        {inner}
      </div>
    );
  }

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {inner}
    </aside>
  );
};

export default Sidebar;
