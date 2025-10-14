import React, { useState, useEffect, Fragment } from 'react';
import { ChevronDownIcon, PencilSquareIcon, PowerIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { logout } from '../../api/auth';
import profileImg from '../../assets/Image/Login_person.png';

const AdminNavbar = ({ onHamburgerClick }) => {
  const [userData, setUserData] = useState(null);

  // Get user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = '/sign-in';
  };

  // Close dropdown on click outside (not needed with Headless UI Menu)

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-gray-100 border-b border-gray-100 shadow-sm">
      {/* Left: Hamburger */}
      <div className="flex items-center gap-4">
        {/* Hamburger (hidden on desktop, for mobile) */}
        <button className="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none" onClick={onHamburgerClick}>
          <span className="sr-only">Open sidebar</span>
          <svg className="w-6 h-6 text-primaryColor" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Right: Profile Dropdown */}
      <div className="flex items-center gap-6">
        {/* User Profile Dropdown - Headless UI Menu */}
        <Menu as="div" className="relative">
          <div>
            <Menu.Button className="flex items-center gap-2 cursor-pointer focus:outline-none">
              <img src={profileImg} alt="Profile" className="w-10 h-10 rounded-full border-2 border-primaryColor object-cover" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-primaryColor leading-tight">
                  {userData?.name || 'Admin'}
                </span>
                <span className="text-xs text-gray-400">{userData?.role || 'Admin'}</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-primaryColor" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl bg-white py-6 shadow-2xl ring-1 ring-black/5 focus:outline-none flex flex-col">
              <div className="w-full px-6 flex flex-col">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-gray-900 text-base transition hover:bg-primaryColor hover:text-white ${active ? 'bg-primaryColor text-white' : ''}`}
                    >
                      <span>Edit Profile</span>
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-gray-900 text-base transition hover:bg-primaryColor hover:text-white ${active ? 'bg-primaryColor text-white' : ''}`}
                      onClick={handleLogout}
                    >
                      <span>Logout</span>
                      <PowerIcon className="w-5 h-5" />
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default AdminNavbar; 