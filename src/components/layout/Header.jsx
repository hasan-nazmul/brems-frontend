import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/common';
import { ROLE_LABELS } from '@/utils/constants';
import { getStorageUrl } from '@/utils/helpers';

const Header = ({ onMenuClick, showMenuButton = false }) => {
  const { user, logout } = useAuth();

  const userNavigation = [
    { name: 'My Profile', href: '/my-profile', icon: UserCircleIcon },
    { name: 'Change Password', href: '/settings/password', icon: KeyIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <header className='sticky top-0 z-20 bg-white border-b border-gray-200'>
      <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
        {/* Left side */}
        <div className='flex items-center gap-4'>
          {showMenuButton && (
            <button
              type='button'
              onClick={onMenuClick}
              className='p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden'
            >
              <Bars3Icon className='w-6 h-6' />
            </button>
          )}

          {/* Breadcrumb or page context can go here */}
          <div className='hidden sm:block'>
            <h1 className='text-lg font-semibold text-gray-900'>
              Bangladesh Railway Employee Management System
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className='flex items-center gap-4'>
          {/* Notifications */}
          <button
            type='button'
            className='relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          >
            <BellIcon className='w-6 h-6' />
            {/* Notification badge */}
            <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full' />
          </button>

          {/* User dropdown */}
          <Menu as='div' className='relative'>
            <Menu.Button className='flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors'>
              <Avatar
                src={
                  user?.employee?.profile_picture
                    ? getStorageUrl(user.employee.profile_picture)
                    : undefined
                }
                name={user?.name}
                size='sm'
              />
              <div className='hidden md:block text-left'>
                <p className='text-sm font-medium text-gray-900'>
                  {user?.name}
                </p>
                <p className='text-xs text-gray-500'>
                  {ROLE_LABELS[user?.role] || user?.role}
                </p>
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter='transition ease-out duration-100'
              enterFrom='transform opacity-0 scale-95'
              enterTo='transform opacity-100 scale-100'
              leave='transition ease-in duration-75'
              leaveFrom='transform opacity-100 scale-100'
              leaveTo='transform opacity-0 scale-95'
            >
              <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                {/* User info */}
                <div className='px-4 py-3 border-b border-gray-100'>
                  <p className='text-sm font-medium text-gray-900'>
                    {user?.name}
                  </p>
                  <p className='text-sm text-gray-500 truncate'>
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className='py-1'>
                  {userNavigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <Link
                          to={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-4 py-2 text-sm',
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          )}
                        >
                          <item.icon className='w-5 h-5 text-gray-400' />
                          {item.name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                </div>

                {/* Logout */}
                <div className='py-1 border-t border-gray-100'>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={clsx(
                          'flex w-full items-center gap-3 px-4 py-2 text-sm',
                          active ? 'bg-gray-100 text-red-700' : 'text-red-600'
                        )}
                      >
                        <ArrowRightOnRectangleIcon className='w-5 h-5' />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
