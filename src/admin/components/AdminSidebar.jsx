import {
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  DocumentIcon,
  HomeIcon,
  PresentationChartBarIcon,
  RectangleGroupIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
  TagIcon,
  TruckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import primaryLogo from "../../assets/Logo/primary_logo.png";

const MAIN_MENU = [
  {
    name: "Dashboard",
    icon: <HomeIcon className="w-5 h-5" />,
    path: "/admin/dashboard",
  },
];

const SUB_MAIN_MENU = [
  {
    name: "Simulasi RABP",
    icon: <DocumentIcon className="w-5 h-5" />,
    path: "/admin/rab-simulation",
  },
  {
    name: "Template RABP",
    icon: <PresentationChartBarIcon className="w-5 h-5" />,
    path: "/admin/rab-template",
  },
];

const DROPDOWN_MENUS = [
  {
    name: "Inventori",
    icon: <Squares2X2Icon className="w-5 h-5" />,
    items: [
      {
        name: "Daftar Warehouse",
        icon: <BuildingStorefrontIcon className="w-5 h-5" />,
        path: "/admin/inventory/warehouse",
      },
      {
        name: "Daftar Kategori",
        icon: <TagIcon className="w-5 h-5" />,
        path: "/admin/inventory/category",
      },
      {
        name: "Daftar Barang",
        icon: <RectangleGroupIcon className="w-5 h-5" />,
        path: "/admin/inventory/subcategory",
      },
      {
        name: "Daftar Inventori",
        icon: <ArchiveBoxIcon className="w-5 h-5" />,
        path: "/admin/inventory/list",
      },
      {
        name: "Daftar Relocation",
        icon: <TruckIcon className="w-5 h-5" />,
        path: "/admin/inventory/relocation",
      },
    ],
  },
  {
    name: "Katalog",
    icon: <CreditCardIcon className="w-5 h-5" />,
    items: [
      {
        name: "Daftar Kategori",
        icon: <CreditCardIcon className="w-5 h-5" />,
        path: "/admin/catalogue/category",
      },
      {
        name: "Daftar Sub Kategori",
        icon: <CreditCardIcon className="w-5 h-5" />,
        path: "/admin/catalogue/subcategory",
      },
      {
        name: "Daftar Katalog",
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        path: "/admin/catalogue/list",
      },
    ],
  },
  {
    name: "Pesanan",
    icon: <ShoppingCartIcon className="w-5 h-5" />,
    items: [
      {
        name: "Daftar Pesanan",
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        path: "/admin/order/list",
      },
    ],
  },
  {
    name: "User",
    icon: <UserIcon className="w-5 h-5" />,
    items: [
      {
        name: "Owner",
        icon: <UserIcon className="w-5 h-5" />,
        path: "/admin/owner-list",
      },
      {
        name: "Admin",
        icon: <UserIcon className="w-5 h-5" />,
        path: "/admin/admin-list",
      },
      {
        name: "Pegawai",
        icon: <UserIcon className="w-5 h-5" />,
        path: "/admin/staff-list",
      },
      {
        name: "Pengguna",
        icon: <UserIcon className="w-5 h-5" />,
        path: "/admin/user-list",
      },
    ],
  },
];

const AdminSidebar = ({
  isOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const isActive = React.useCallback(
    (path) => location.pathname.startsWith(path),
    [location.pathname],
  );
  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [hasInitialized, setHasInitialized] = React.useState(false);

  // Auto-open dropdown when child is active on mount (only once)
  React.useEffect(() => {
    if (!hasInitialized) {
      const activeMenu = DROPDOWN_MENUS.find((menu) =>
        menu.items.some((item) => isActive(item.path)),
      );
      if (activeMenu) {
        setOpenDropdown(activeMenu.name);
      }
      setHasInitialized(true);
    }
  }, [location.pathname, isActive, hasInitialized]);

  // Handler collapse yang juga menutup dropdown
  const handleToggleCollapse = () => {
    if (onToggleCollapse) onToggleCollapse();
    setOpenDropdown(null);
  };

  // Sidebar content
  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-gray-100 border-r border-gray-100 shadow-sm transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Collapse Button & Logo */}
      <div className="flex items-center h-20 px-2 md:px-4 border-b border-gray-100 justify-between relative z-10">
        <button
          className="hidden md:block p-2 rounded hover:bg-gray-100"
          onClick={handleToggleCollapse}
        >
          <Squares2X2Icon className="w-5 h-5 text-primaryColor" />
        </button>
        <div className="flex items-center justify-center flex-1">
          <img
            src={primaryLogo}
            alt="Logo"
            className={`h-8 ${collapsed ? "mx-auto" : "mr-2"}`}
          />
        </div>
        {onClose && (
          <button
            className="md:hidden p-2 ml-2 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            <Squares2X2Icon className="w-5 h-5 text-primaryColor" />
          </button>
        )}
      </div>
      {/* Main Menu */}
      <nav className="flex-1 px-1 md:px-2 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {MAIN_MENU.map((item) => (
            <li key={item.name} className="group">
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ease-out hover:translate-x-1 hover:shadow-sm ${
                  isActive(item.path)
                    ? "bg-primaryColor text-white shadow-lg"
                    : "text-primaryColor hover:bg-white hover:text-secondaryColor"
                }`}
                onClick={onClose}
              >
                {item.icon}
                {!collapsed && (
                  <span className="font-semibold">{item.name}</span>
                )}
              </Link>
            </li>
          ))}

          {/* Dropdown Menus */}
          {DROPDOWN_MENUS.map((menu) => {
            const isAnySubActive = menu.items.some((item) =>
              isActive(item.path),
            );
            const isOpen = openDropdown === menu.name;
            return (
              <li key={menu.name} className="group">
                <button
                  type="button"
                  className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ease-out ${
                    isAnySubActive
                      ? "bg-primaryColor text-white shadow-lg"
                      : "text-primaryColor hover:bg-white hover:shadow-sm"
                  }`}
                  onClick={() =>
                    setOpenDropdown((prev) =>
                      prev === menu.name ? null : menu.name,
                    )
                  }
                >
                  {menu.icon}
                  {!collapsed && (
                    <span className="font-semibold">{menu.name}</span>
                  )}
                  {!collapsed && menu.items.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      {isOpen ? (
                        <ChevronUpIcon className="w-4 h-4 transition-all duration-300 ease-out rotate-180 scale-110" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 transition-all duration-300 ease-out" />
                      )}
                    </div>
                  )}
                </button>

                {menu.items.length > 0 && (
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-out ${
                      isOpen && !collapsed
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="ml-4 mt-2 space-y-1 pb-2">
                      {menu.items.map((item, subIdx) => (
                        <li
                          key={item.name}
                          className="animate-fadeIn"
                          style={{ animationDelay: `${subIdx * 100}ms` }}
                        >
                          <Link
                            to={item.path}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-sm border border-transparent hover:border-secondaryColor/20 ${
                              isActive(item.path)
                                ? "bg-secondaryColor text-white shadow"
                                : "text-primaryColor hover:bg-white hover:text-secondaryColor"
                            }`}
                            onClick={onClose}
                          >
                            {item.icon}
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}

          {/* Sub Main Menu */}
          {SUB_MAIN_MENU.map((item) => (
            <li key={item.name} className="group">
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ease-out hover:translate-x-1 hover:shadow-sm ${
                  isActive(item.path)
                    ? "bg-primaryColor text-white shadow-lg"
                    : "text-primaryColor hover:bg-white hover:text-secondaryColor"
                }`}
                onClick={onClose}
              >
                {item.icon}
                {!collapsed && (
                  <span className="font-semibold">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  // Desktop: static sidebar, Mobile: slide-in with overlay
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex min-h-screen">{sidebarContent}</aside>
      {/* Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={onClose}
          ></div>
          {/* Sidebar */}
          <div className="relative z-10 animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;
