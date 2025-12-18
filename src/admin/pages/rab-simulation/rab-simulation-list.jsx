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
  createDummyOrderCostBudgetPlanSummary,
  deleteDummyOrderCostBudgetPlanSummary,
  getDummyOrderCostBudgetPlanSummaryList,
} from "../../../api/rab-simulation/rab-simulation";
import { RAB_SIMULATION_DUMMY_DATA } from "../../../data/rab-simulations";
import { formatCurrency } from "../../../utils";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import { hasPermission } from '../../../api/auth';
import BackgroundImage from '../../../assets/background/bg-zumar.png';

function ActionDropdown({ onEditRab, onDelete, canEdit, canDelete }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  if (!canEdit && !canDelete) {
    return null;
  }

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
          {canEdit && (
            <button
              onClick={() => {
                onEditRab();
                setOpen(false);
              }}
              className="w-full py-1.5 rounded-md text-sm font-semibold text-white shadow transition-all"
              style={{ backgroundColor: "#2F6468" }}
            >
              Edit RABP
            </button>
          )}

          {/* Delete */}
          {canDelete && (
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
          )}
        </div>
      )}
    </div>
  );
}

export default function RabSimulationList() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [page, setPage] = useState(1);
  // const [totalPage, setTotalPage] = useState(1);
  const [simulations, setSimulations] = useState([]);
  const navigate = useNavigate();

  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDummyOrderCostBudgetPlanSummaryList();

      const data = response.data.data;
      setSimulations(data || []);
      // setTotalPage(Math.ceil(data.length / 10)); // Assuming 10 items per page
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Gagal memuat data. Silakan coba lagi.");
      setSimulations([]);
      // setTotalPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRabSimulation = async (docbpsId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteDummyOrderCostBudgetPlanSummary(docbpsId);
      await fetchData();
    } catch (error) {
      console.error("Error deleting RABP simulation:", error);
      setError("Gagal menghapus simulasi RABP. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRabSimulationItem = async () => {
    try {
      setLoading(true);
      setError(null);

      await createDummyOrderCostBudgetPlanSummary();
      await fetchData();
    } catch (error) {
      console.error("Error creating RABP simulation:", error);
      setError("Gagal membuat simulasi RABP baru. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = (order, action) => {
    setSelectedOrder(order);
    setModalAction(action);
    setShowActionModal(true);
    setActionError("");
  };

  const handleConfirmAction = async () => {
    if (!selectedOrder || !modalAction) return;

    setActionLoading(true);
    setActionError("");

    try {
      switch (modalAction.type) {
        case "delete":
          await handleDeleteRabSimulation(selectedOrder.docbpsId);
          break;
        default:
          throw new Error("Unknown action");
      }

      setShowActionModal(false);
      setSelectedOrder(null);
      setModalAction(null);

      await fetchData();
    } catch (err) {
      console.error("Error performing action:", err);
      setActionError(err.message || "Failed to perform action");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex-1 overflow-x-hidden">
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        <div className="w-full mx-auto py-6 px-2 sm:px-4 lg:px-6 font-montserrat overflow-x-hidden">
          <h1 className="text-4xl font-bold text-center text-primaryColor mb-2">
            DAFTAR SIMULASI RABP
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Berikut adalah daftar simulasi RABP yang terdaftar dalam sistem.
          </p>

          {/* Search and Filter Section */}
          <div className="space-y-4 mb-6">
            {/* Search Bar Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* <form 
            onSubmit={handleSearch}
             className="flex items-center flex-shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder={searchExpanded ? 'Cari di sini' : ''}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setSearchExpanded(true)}
                  className={`bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondaryColor transition-all duration-300 ease-in-out px-4 py-2 rounded-full text-black ${searchExpanded ? 'w-40 md:w-56 pl-10 pr-10' : 'w-0 px-0 border-transparent cursor-pointer'} min-w-0`}
                  style={{ zIndex: 1 }}
                />
                <MagnifyingGlassIcon className={`absolute left-3 w-5 h-5 text-[#E87722] pointer-events-none transition-opacity duration-300 ${searchExpanded ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 2 }} />
                <button
                  type={searchExpanded ? 'submit' : 'button'}
                  onClick={() => { if (!searchExpanded) setSearchExpanded(true); }}
                  className="flex items-center gap-2 bg-[#E87722] hover:bg-[#d96c1f] text-white px-7 py-3 rounded-full font-semibold shadow transition-all duration-300 relative"
                  style={{ marginLeft: searchExpanded ? '-2.5rem' : '0', zIndex: 4 }}
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span className={`${searchExpanded ? 'inline' : 'hidden'} md:inline`}>Search</span>
                  {searchExpanded && (
                    <span
                      onClick={e => { e.preventDefault(); setSearchExpanded(false); setSearchInput(''); }}
                      className="ml-2 flex items-center cursor-pointer"
                      tabIndex={-1}
                    >
                      <XCircleIcon className="w-5 h-5 text-white hover:text-gray-200" />
                    </span>
                  )}
                </button>
              </div>
            </form> */}

              {hasPermission('rab.simulation.create') && (
                <button
                  type="button"
                  className="ml-auto bg-[#E87722] hover:bg-[#d96c1f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 flex-shrink-0"
                  onClick={() => handleCreateRabSimulationItem()}
                  disabled={loading}
                >
                  {loading ? (
                    <RiLoader3Fill className="animate-spin" />
                  ) : (
                    <PlusIcon className="w-5 h-5" />
                  )}
                  Tambah Simulasi RABP
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl shadow p-4 mt-6 font-montserrat">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mx-auto mb-4"></div>
                <p className="text-primaryColor font-semibold">
                  Memuat data simulasi RABP...
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
            ) : simulations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada data simulasi RABP</p>
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
                          Action
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[80px]">
                          ID
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[120px]">
                          Jumlah
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[140px]">
                          HPP
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[120px]">
                          Margin
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[150px]">
                          Sisa Untung
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[130px]">
                          Marketing
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[100px]">
                          Bonus/Insentif
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[140px]">
                          Main & Develop
                        </th>
                        <th className="px-3 py-3 whitespace-nowrap text-sm font-semibold min-w-[150px]">
                          Sisa Untung Bersih
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulations.map((simulation) => (
                        <tr
                          key={simulation.docbpsId}
                          className="bg-white hover:bg-secondaryColor/10 rounded-lg shadow-sm text-sm"
                        >
                          <td className="px-3 py-3 whitespace-nowrap">
                            <ActionDropdown
                              onEditRab={() => {
                                navigate(
                                  `/admin/rab-simulation/${simulation.docbpsId}`,
                                );
                              }}
                              onDelete={() =>
                                handleOrderAction(simulation, {
                                  type: "delete",
                                  title: "Hapus Simulasi RABP",
                                  message:
                                    "Apakah Anda yakin ingin menghapus simulasi ini?",
                                })
                              }
                              canEdit={hasPermission('rab.simulation.edit')}
                              canDelete={hasPermission('rab.simulation.delete')}
                            />
                          </td>
                          <td className="px-3 py- whitespace-nowrap ">
                            {simulation.docbpsId}
                          </td>
                          <td className="px-3 py- whitespace-nowrap">
                            {simulation.docbpsAmount}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap ">
                            {formatCurrency(simulation.docbpsCogs)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap ">
                            {formatCurrency(simulation.docbpsMargin)}
                          </td>
                          <td className="px-3 py-3 ">
                            {formatCurrency(simulation.docbpsProfitRemaining)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {formatCurrency(simulation.docbpsMarketing)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap ">
                            {formatCurrency(simulation.docbpsIncentive)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {formatCurrency(simulation.docbpsMainDevelop)}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {formatCurrency(simulation.docbpsProfitNet)}
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
          {/* <div className="flex justify-center items-center gap-2 mt-6">
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
        </div> */}

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
        </div>
      </div>
    </div>
  );
}
