import {
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { RiLoader3Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import {
  getUserList,
  deleteUser,
  createUser,
  updateUser,
} from "../../../api/user/user";
import { getAllRoles } from "../../../api/role/role";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import BackgroundImage from '../../../assets/background/bg-zumar.png';

// Custom Dropdown Component from CatalogueList
function CustomDropdown({ label, options, value, onChange, placeholder, searchPlaceholder = "Cari...", labelMinWidth = "70px", width = "150px", mdWidth = "160px", height = "38px" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex items-center w-auto">
      <span
        className="px-4 py-2 bg-[#295B5B] text-white font-bold rounded-l-xl border border-[#295B5B] border-r-0 text-base flex items-center justify-center"
        style={{ height: height, minWidth: labelMinWidth, lineHeight: height }}
      >
        {label}
      </span>
      <div className={`relative w-[${width}] md:w-[${mdWidth}]`}>
        <button
          ref={btnRef}
          type="button"
          className="appearance-none w-full px-3 py-2 border border-[#295B5B] border-l-0 bg-white text-[#BDBDBD] font-semibold rounded-r-xl focus:outline-none focus:ring-2 focus:ring-secondaryColor h-[38px] text-sm flex items-center justify-between"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={value ? "text-black truncate" : "text-[#BDBDBD]"}>
            {value ? selectedOption?.label : placeholder}
          </span>
          <ChevronDownIcon className="w-4 h-4 text-[#BDBDBD] ml-2" />
        </button>
        {open && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto focus:outline-none"
          >
            <div className="p-2 sticky top-0 bg-white z-10">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none text-sm"
                autoFocus
              />
            </div>
            {filteredOptions.length === 0 && (
              <div className="px-4 py-2 text-gray-400 text-sm">
                Tidak ditemukan
              </div>
            )}
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-4 py-2 cursor-pointer ${String(opt.value) === String(value)
                    ? "bg-secondaryColor/10 text-black"
                    : "text-black"
                  } hover:bg-secondaryColor/20`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Role Dropdown Component for Forms (keeping this one as it has specific styling for forms)
function RoleDropdown({ roles = [], value, onSelect, placeholder = "Pilih role..." }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync display with selected value
  useEffect(() => {
    if (value !== undefined && value !== null && Array.isArray(roles)) {
      const selected = roles.find((role) => role.rId === value);
      setSearchTerm(selected ? selected.rName : "");
    }
  }, [value, roles]);

  // Filter roles based on search
  const filteredRoles = Array.isArray(roles)
    ? roles.filter((role) =>
      String(role.rName).toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (role) => {
    setIsOpen(false);
    setSearchTerm(role.rName);
    if (onSelect) onSelect(role);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        required
      />

      {/* Dropdown */}
      {isOpen && (
        <ul className="absolute z-10 w-full max-h-60 overflow-y-auto border border-gray-300 bg-white shadow-lg rounded-md mt-1">
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => (
              <li
                key={role.rId}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                onClick={() => handleSelect(role)}
              >
                {role.rName}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 text-sm">
              Role tidak ditemukan
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function ActionDropdown({ onEditUser, onDelete }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primaryColor"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <ChevronDownIcon className="w-6 h-6 text-primaryColor" />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 z-10 w-44 rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none p-2 flex flex-col gap-2 max-h-96 overflow-y-auto mt-2 origin-top-left"
        >
          <button
            onClick={() => {
              onEditUser();
              setOpen(false);
            }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
            style={{ backgroundColor: "#2F6468" }}
          >
            Edit User
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
            style={{ backgroundColor: "#DC2626" }}
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}

export default function UserList() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    uName: "",
    uEmail: "",
    uPhone: "",
    uAddress: "",
    uPassword: "",
    rId: 5,
  });
  const [editUser, setEditUser] = useState({
    uId: "",
    uName: "",
    uEmail: "",
    uPhone: "",
    uAddress: "",
    uPassword: "",
    rId: 5,
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await createUser({
        uName: newUser.uName,
        uEmail: newUser.uEmail,
        uPhone: newUser.uPhone,
        uAddress: newUser.uAddress,
        uPassword: newUser.uPassword,
        rId: newUser.rId,
      });

      await fetchData();

      console.log("User berhasil ditambahkan:", response.data);

      setShowAddModal(false);
      setNewUser({ uName: "", uEmail: "", uPhone: "", uAddress: "", uPassword: "" });
    } catch (error) {
      console.error("Gagal menambahkan user:", error);
      alert("Terjadi kesalahan saat menambah user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setEditUser({
      uId: user.uId,
      uName: user.uName || "",
      uEmail: user.uEmail || "",
      uPhone: user.uPhone || "",
      uAddress: user.uAddress || "",
      uPassword: "",
      rId: user.rId,
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      await updateUser({
        uId: editUser.uId,
        uName: editUser.uName,
        uPhone: editUser.uPhone,
        uAddress: editUser.uAddress,
        uPassword: editUser.uPassword,
        rId: editUser.rId,
      });

      await fetchData();

      setShowEditModal(false);
      alert("Data user berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui user:", error);
      alert("Terjadi kesalahan saat memperbarui data user.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage && newPage !== page) {
      setPage(newPage);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUserList({
        pageLimit: 10,
        pageNumber: page,
        filterRId: selectedRole || null,
      });

      const data = response.data.data.listData;
      setUsers(data || []);
      setTotalPage(response.data.data.pagination?.pageLast || 1);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat data. Silakan coba lagi.");
      setUsers([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteUser(uId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting User:", error);
      setError("Gagal menghapus User. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowActionModal(true);
    setActionError("");
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !modalAction) return;

    setActionLoading(true);
    setActionError("");

    try {
      switch (modalAction.type) {
        case "delete":
          await handleDeleteUser(selectedUser.uId);
          break;
        default:
          throw new Error("Unknown action");
      }

      setShowActionModal(false);
      setSelectedUser(null);
      setModalAction(null);

      await fetchData();
    } catch (err) {
      console.error("Error performing action:", err);
      setActionError(err.message || "Failed to perform action");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getAllRoles({
          pageLimit: -1,  // Get all roles
          pageNumber: 1
        });

        // Try different response structures
        let rolesData = [];
        if (response.data?.data?.listData) {
          rolesData = response.data.data.listData;
        } else if (response.data?.data) {
          rolesData = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (response.data?.listData) {
          rolesData = response.data.listData;
        } else if (Array.isArray(response.data)) {
          rolesData = response.data;
        }

        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, selectedRole]);

  return (
    <div
      className="flex min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundRepeat: "repeat",
        backgroundSize: "1000px auto",
        backgroundPosition: "center",
        opacity: 1,
      }}
    >
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex-1 overflow-x-hidden">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        <div className="w-full mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat overflow-x-hidden">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2">
            DAFTAR USER
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Berikut adalah user yang terdaftar dalam sistem.
          </p>

          <div className="space-y-4 mb-6">
            {/* Filter and Action Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Role Filter using CustomDropdown */}
              <CustomDropdown
                label="Role"
                options={[
                  { value: "", label: "Semua Role" },
                  ...roles.map((role) => ({ value: role.rId, label: role.rName })),
                ]}
                value={selectedRole}
                onChange={(val) => {
                  setSelectedRole(val);
                  setPage(1); // Reset to page 1 on filter change
                }}
                placeholder="Pilih Role"
                searchPlaceholder="Cari role..."
                labelMinWidth="80px"
              />

              <button
                type="button"
                className="ml-auto bg-[#E87722] hover:bg-[#d96c1f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 flex-shrink-0"
                onClick={() => setShowAddModal(true)}
                disabled={loading}
              >
                {loading ? (
                  <RiLoader3Fill className="animate-spin" />
                ) : (
                  <PlusIcon className="w-5 h-5" />
                )}
                Tambah User
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 font-montserrat">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
                <p className="text-primaryColor font-semibold">
                  Memuat data user...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 font-semibold mb-4">{error}</p>
                <div className="space-y-2">
                  <button
                    onClick={() => fetchData()}
                    className="px-4 py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada data User</p>
                <p className="text-xs mt-1">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            ) : (
              <div className="w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-2 min-w-max">
                    <thead>
                      <tr className="text-primaryColor">
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">
                          Nama
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[120px]">
                          Email
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">
                          Telepon
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">
                          Role
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[120px]">
                          Alamat
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.uId}
                          className="bg-white hover:bg-secondaryColor/10 rounded-lg shadow-sm text-sm"
                        >
                          <td className="px-3 py- whitespace-nowrap ">
                            {user.uName}
                          </td>
                          <td className="px-3 py- whitespace-nowrap">
                            {user.uEmail}
                          </td>
                          <td className="px-3 py- whitespace-nowrap ">
                            {user.uPhone}
                          </td>
                          <td className="px-3 py- whitespace-nowrap ">
                            {user.rName}
                          </td>
                          <td className="px-3 py- whitespace-nowrap">
                            {user.uAddress}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <ActionDropdown
                              onEditUser={() => handleOpenEditModal(user)}
                              onDelete={() =>
                                handleUserAction(user, {
                                  type: "delete",
                                  title: "Hapus User",
                                  message:
                                    "Apakah Anda yakin ingin menghapus user ini?",
                                })
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              {'<'}
            </button>
            {Array.from({ length: totalPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded border text-primaryColor font-semibold ${p === page ? 'bg-primaryColor text-white' : 'border-gray-300'}`}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border border-gray-300 text-primaryColor disabled:opacity-50"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPage}
            >
              {'>'}
            </button>
          </div>

          {/* Action Confirmation Modal */}
          {showActionModal && modalAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-primaryColor">
                  {modalAction.type === "delete" ? (
                    <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
                  ) : (
                    <CheckCircleIcon className="h-10 w-10 text-primaryColor" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mt-4">{modalAction.title}</h2>
                <p className="text-gray-500 mt-2">{modalAction.message}</p>

                {actionError && (
                  <div className="text-red-500 mt-2 text-sm">{actionError}</div>
                )}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    type="button"
                    className="w-full rounded-lg bg-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-400"
                    onClick={() => setShowActionModal(false)}
                    disabled={actionLoading}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${modalAction.type === "delete"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-primaryColor hover:bg-primaryColor/90"
                      }`}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Memproses..." : "Konfirmasi"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primaryColor">Tambah User</h2>

                <form onSubmit={handleAddUser}>
                  {["uName", "uEmail", "uPhone"].map((field) => (
                    <div key={field} className="mb-4">
                      <label
                        htmlFor={field}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {field === "uName"
                          ? "Nama"
                          : field === "uEmail"
                            ? "Email"
                            : "Telepon"}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        id={field}
                        type="text"
                        placeholder={
                          field === "uName"
                            ? "Budi"
                            : field === "uEmail"
                              ? "budi@email.com"
                              : "081234567890"
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                        value={newUser[field]}
                        onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })}
                        required
                      />
                    </div>
                  ))}

                  {/* Role Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role<span className="text-red-500 ml-1">*</span>
                    </label>
                    <RoleDropdown
                      roles={roles}
                      value={newUser.rId}
                      onSelect={(role) => {
                        setNewUser({ ...newUser, rId: role.rId });
                      }}
                      placeholder="Pilih role..."
                    />
                  </div>

                  {/* Address */}
                  <div className="mb-4">
                    <label htmlFor="uAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="uAddress"
                      type="text"
                      placeholder="Jl. Pegangsaan Timur No. 17"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      value={newUser.uAddress}
                      onChange={(e) => setNewUser({ ...newUser, uAddress: e.target.value })}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label htmlFor="uPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="uPassword"
                      type="password"
                      placeholder="********"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      value={newUser.uPassword}
                      onChange={(e) => setNewUser({ ...newUser, uPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setShowAddModal(false)}
                      disabled={formLoading}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-secondaryColor hover:bg-secondaryColor/90 text-white font-semibold"
                      disabled={formLoading}
                    >
                      {formLoading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-primaryColor">Edit User</h2>
                <form onSubmit={handleEditUser}>
                  <div className="mb-4">
                    <label htmlFor="uName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="uName"
                      type="text"
                      value={editUser.uName}
                      onChange={(e) => setEditUser({ ...editUser, uName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="uEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="uEmail"
                      type="email"
                      value={editUser.uEmail}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed focus:outline-none"
                      required
                    />
                  </div>

                  <div className='mb-4'>
                    <label htmlFor="uPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telepon <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="uPhone"
                      type="text"
                      value={editUser.uPhone}
                      onChange={(e) => setEditUser({ ...editUser, uPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    />
                  </div>

                  {/* Role Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role<span className="text-red-500 ml-1">*</span>
                    </label>
                    <RoleDropdown
                      roles={roles}
                      value={editUser.rId}
                      onSelect={(role) => {
                        setEditUser({ ...editUser, rId: role.rId });
                      }}
                      placeholder="Pilih role..."
                    />
                  </div>

                  <div className='mb-4'>
                    <label htmlFor="uAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="uAddress"
                      type="text"
                      value={editUser.uAddress}
                      onChange={(e) => setEditUser({ ...editUser, uAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                      required
                    />
                  </div>

                  <div className='mb-4'>
                    <label htmlFor="uPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru (opsional)
                    </label>
                    <input
                      id="uPassword"
                      type="password"
                      value={editUser.uPassword}
                      onChange={(e) => setEditUser({ ...editUser, uPassword: e.target.value })}
                      placeholder="Kosongkan jika tidak ingin mengganti password"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => setShowEditModal(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded bg-secondaryColor hover:bg-secondaryColor/90 text-white font-semibold"
                    >
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}