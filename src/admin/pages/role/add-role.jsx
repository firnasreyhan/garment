import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createRole } from "../../../api/role/role";
import { PERMISSION_GROUPS } from "../../../utils/permissions";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import BackgroundImage from '../../../assets/background/bg-zumar.png';

const AddRole = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [newRole, setNewRole] = useState({
        rName: "",
        rAccess: [], // Array of permission strings
    });

    // Handle toggle individual permission
    const handleTogglePermission = (permissionId) => {
        setNewRole(prev => ({
            ...prev,
            rAccess: prev.rAccess.includes(permissionId)
                ? prev.rAccess.filter(p => p !== permissionId)
                : [...prev.rAccess, permissionId]
        }));
    };

    // Handle toggle all permissions in a module
    const handleToggleModule = (moduleKey) => {
        const modulePermissions = PERMISSION_GROUPS[moduleKey].permissions.map(p => p.id);
        const allSelected = modulePermissions.every(p => newRole.rAccess.includes(p));

        if (allSelected) {
            // Unselect all in this module
            setNewRole(prev => ({
                ...prev,
                rAccess: prev.rAccess.filter(p => !modulePermissions.includes(p))
            }));
        } else {
            // Select all in this module
            setNewRole(prev => ({
                ...prev,
                rAccess: [...new Set([...prev.rAccess, ...modulePermissions])]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!newRole.rName.trim()) {
            setFormError("Nama role wajib diisi");
            return;
        }

        if (newRole.rAccess.length === 0) {
            setFormError("Minimal pilih 1 permission");
            toast.error("Minimal pilih 1 permission");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                rName: newRole.rName.trim(),
                rAccess: newRole.rAccess
            };

            await createRole(payload);
            toast.success("Role berhasil ditambahkan!");
            navigate("/admin/role/list");
        } catch (err) {
            const errorMsg = err.response?.data?.remark || err.message || "Gagal menambah role";
            setFormError(errorMsg);
            toast.error(errorMsg);
        }
        setLoading(false);
    };

    return (
        <div
            className="flex min-h-screen"
            style={{
                backgroundImage: `url(${BackgroundImage})`,
                backgroundRepeat: "repeat",
                backgroundSize: "1000px auto",
                backgroundPosition: "center",
                opacity: 1,
            }}
        >
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1">
                <AdminNavbar onHamburgerClick={() => setIsSidebarOpen(true)} />
                <div className="max-w-5xl mx-auto py-10 px-4 font-montserrat">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate("/admin/role/list")}
                            className="flex items-center gap-2 text-primaryColor hover:text-primaryColor/80"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            Kembali
                        </button>
                    </div>

                    <div className="bg-gray-100 rounded-xl shadow p-8 font-montserrat">
                        <h1 className="text-3xl font-bold text-center text-primaryColor mb-2">
                            TAMBAH ROLE
                        </h1>
                        <p className="text-center text-gray-500 mb-8">
                            Silakan isi form di bawah ini untuk menambah role baru.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role Name */}
                            <div className="flex w-full flex-col">
                                <label
                                    htmlFor="roleName"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Nama Role<span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="roleName"
                                    type="text"
                                    placeholder="e.g., MANAGER, STAFF, SUPERVISOR"
                                    value={newRole.rName}
                                    onChange={(e) =>
                                        setNewRole({ ...newRole, rName: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-secondaryColor"
                                    required
                                />
                            </div>

                            {/* Permissions Checkboxes */}
                            <div className="flex w-full flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Permissions<span className="text-red-500 ml-1">*</span>
                                    <span className="text-xs text-gray-500 ml-2">
                                        ({newRole.rAccess.length} dipilih)
                                    </span>
                                </label>

                                <div className="space-y-4">
                                    {Object.entries(PERMISSION_GROUPS).map(([moduleKey, module]) => {
                                        const modulePermissions = module.permissions.map(p => p.id);
                                        const allSelected = modulePermissions.every(p => newRole.rAccess.includes(p));
                                        const someSelected = modulePermissions.some(p => newRole.rAccess.includes(p));

                                        return (
                                            <div key={moduleKey} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                                {/* Module Header with Select All */}
                                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                                                    <div>
                                                        <h3 className="font-bold text-primaryColor">{module.label}</h3>
                                                        {module.description && (
                                                            <p className="text-xs text-gray-500">{module.description}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleModule(moduleKey)}
                                                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${allSelected
                                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                                            }`}
                                                    >
                                                        {allSelected ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                </div>

                                                {/* Permission Checkboxes */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {module.permissions.map((permission) => (
                                                        <label
                                                            key={permission.id}
                                                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={newRole.rAccess.includes(permission.id)}
                                                                onChange={() => handleTogglePermission(permission.id)}
                                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700">
                                                                {permission.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {formError && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                    {formError}
                                </div>
                            )}

                            <div className="flex justify-center gap-6 pt-8">
                                <button
                                    type="submit"
                                    className="px-10 py-3 rounded-lg bg-[#4AD991] hover:bg-[#3fcf7c] text-white font-bold text-lg transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? "Menyimpan..." : "Simpan"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/admin/role/list")}
                                    className="px-10 py-3 rounded-lg bg-[#FB5C5C] hover:bg-[#e04a4a] text-white font-bold text-lg transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddRole;
