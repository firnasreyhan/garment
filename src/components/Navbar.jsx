import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, ClipboardDocumentListIcon, ClockIcon, PowerIcon, UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { jwtDecode } from 'jwt-decode';
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { logout } from '../api/auth';
import { getToken } from '../utils/tokenManager';

import primaryLogo from "../assets/Logo/primary_logo.png";

const NAVIGATION_ITEMS = [
  { name: "Beranda", href: "/" },
  { name: "Katalog", href: "/catalog" },
  { name: "Pesan", href: "/order" },
  { name: "Lacak", href: "/tracker" },
];

const USER_MENU_ITEMS = [
  { name: "Riwayat Pesanan", href: "/history-order", icon: ClipboardDocumentListIcon, primary: true },
  { name: "Lacak Progress", href: "/tracker", icon: ClockIcon },
];

const SCROLL_THRESHOLD = 10;

// Extracted component for navigation links
const NavigationLink = ({ item, isActive, className = "" }) => (
  <Link
    to={item.href}
    className={`relative pb-1 text-base font-montserrat transition ${className} ${
      isActive
        ? "text-secondaryColor font-bold"
        : "text-primaryColor hover:text-secondaryColor"
    } 
    after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-1/2 after:bg-secondaryColor after:transition-transform after:scale-x-0 md:after:block after:hidden ${
      isActive ? "md:after:scale-x-100" : "md:hover:after:scale-x-100"
    }`}
  >
    {item.name}
  </Link>
);

// Extracted component for user menu items
const UserMenuItem = ({ item, onClick, isActive }) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      "w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-gray-900 text-base transition hover:bg-primaryColor hover:text-white",
      isActive ? "font-bold" : ""
    )}
  >
    <span>{item.name}</span>
    {item.icon && <item.icon className="w-5 h-5" />}
  </button>
);

// Extracted component for user avatar
const UserAvatar = ({ onLogout }) => {
  let initials = 'U';
  const token = getToken();
  const location = useLocation();
  if (token) {
    try {
      const payload = jwtDecode(token);
      if (payload.u_name) {
        initials = payload.u_name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase();
      }
    } catch { /* ignore error */ }
  }

  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-sm font-montserrat font-semibold text-white focus:outline-none ring-2 ring-white">
          <span className="sr-only">Open user menu</span>
          {initials}
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-2xl bg-gray-100 py-6 shadow-2xl ring-1 ring-black/5 focus:outline-none flex flex-col">
          <div className="w-full px-6 flex flex-col">
            {/* Tombol utama */}
            <Menu.Item>
              {() => (
                <Link to="/history-order" className="w-full">
                  <UserMenuItem item={USER_MENU_ITEMS[0]} isActive={location.pathname === USER_MENU_ITEMS[0].href} />
                </Link>
              )}
            </Menu.Item>
            {/* Menu lain */}
            <Menu.Item>
              {() => (
                <Link to="/tracker" className="w-full">
                  <UserMenuItem item={USER_MENU_ITEMS[1]} isActive={location.pathname === USER_MENU_ITEMS[1].href} />
                </Link>
              )}
            </Menu.Item>
          </div>
          {/* Garis pemisah */}
          <div className="w-full border-t my-4" />
          {/* Logout */}
          <Menu.Item>
            {() => (
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-between gap-2 px-6 py-2 text-base text-gray-900 rounded-lg transition hover:bg-primaryColor hover:text-white"
              >
                <span>Logout</span>
                <PowerIcon className="w-5 h-5" />
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default function StickyNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Cek token menggunakan token manager saat mount
    setIsLoggedIn(!!getToken());
  }, []);

  // Memoized scroll handler for better performance
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Memoized navbar classes for better performance
  const navbarClasses = useMemo(() => {
    const baseClasses = "sticky top-0 z-50 transition-all duration-300";
    const conditionalClasses = scrolled
      ? "bg-gray-200/80 backdrop-blur shadow-lg"
      : "bg-gray-200 shadow-sm text-primaryColor";
    
    return `${baseClasses} ${conditionalClasses}`;
  }, [scrolled]);

  // Memoized navigation items with active state
  const navigationItems = useMemo(() => 
    NAVIGATION_ITEMS.map((item) => ({
      ...item,
      isActive: location.pathname === item.href,
    })), [location.pathname]
  );

  // Handler logout
  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    window.location.href = '/'; // redirect ke halaman utama
  };

  return (
    <Disclosure as="nav" className={navbarClasses}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 justify-between items-center">
              {/* LOGO */}
              <div className="flex items-center">
                <Link to="/">
                  <img 
                    src={primaryLogo} 
                    alt="Zumar Garment" 
                    className="h-8" 
                    loading="eager"
                  />
                </Link>
              </div>

              {/* DESKTOP MENU */}
              <div className="hidden md:flex items-center space-x-8">
                {navigationItems.map((item) => (
                  <NavigationLink
                    key={item.name}
                    item={item}
                    isActive={item.isActive}
                  />
                ))}

                {/* Login Button */}
                {!isLoggedIn && (
                  <Link
                    to="/sign-in"
                    className="flex items-center gap-1 text-primaryColor hover:text-secondaryColor transition text-sm font-semibold"
                  >
                    <UserIcon className="w-6 h-6 mr-1" />
                    Masuk
                  </Link>
                )}

                {/* Avatar Dropdown */}
                {isLoggedIn && <UserAvatar onLogout={handleLogout} />}
              </div>

              {/* MOBILE MENU BUTTON */}
              <div className="flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-primaryColor hover:text-secondaryColor transition">
                  <span className="sr-only">Open menu</span>
                  {open ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* MOBILE MENU */}
          <Disclosure.Panel className="md:hidden px-4 pt-2 pb-4 bg-gray-100 shadow-sm space-y-2">
            {navigationItems.map((item) => (
              <NavigationLink
                key={item.name}
                item={item}
                isActive={item.isActive}
                className="block py-1 border-b border-gray-100"
              />
            ))}
            
            {!isLoggedIn && (
              <Link
                to="/sign-in"
                className="flex items-center gap-1 text-primaryColor hover:text-secondaryColor transition py-1"
              >
                <UserIcon className="w-4 h-4" />
                Masuk
              </Link>
            )}

            {/* MOBILE Avatar Dropdown */}
            {isLoggedIn && <UserAvatar onLogout={handleLogout} />}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
