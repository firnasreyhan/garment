import { format, startOfYear, endOfYear } from "date-fns";
import { useState } from "react";
import BackgroundImage from "../../../assets/background/bg-zumar.png";
import DateRangeFilter from "../../../components/date-range-filter";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";
import { OrderAndFinancialStatus } from "./order-and-financial-status";
import { TopMostOrderedClients } from "./top-most-ordered-clients";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ⬇️ Ganti jadi awal tahun & akhir tahun
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfYear(new Date()), "yyyy-MM-dd"),
    endDate: format(endOfYear(new Date()), "yyyy-MM-dd"),
  });

  // This function receives the date from the filter component
  const handleDateChange = (selectedDateRange) => {
    setDateRange(selectedDateRange);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Top Navbar */}
        <AdminNavbar onHamburgerClick={() => setSidebarOpen(true)} />
        {/* Main Dashboard Content */}
        <main
          className="flex-1 overflow-x-hidden overflow-y-auto p-6"
          style={{
            backgroundImage: `url(${BackgroundImage})`,
            backgroundRepeat: "repeat",
            backgroundSize: "1000px auto",
            backgroundPosition: "center",
            opacity: 1,
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 font-montserrat">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2 font-poppins">
                Selamat datang di panel admin Zumar Garment
              </p>
            </div>

            <div className="space-y-8">
              <DateRangeFilter onDateChange={handleDateChange} />
              <OrderAndFinancialStatus
                filterDateEnd={dateRange.endDate}
                filterDateStart={dateRange.startDate}
              />
              <TopMostOrderedClients
                filterDateEnd={dateRange.endDate}
                filterDateStart={dateRange.startDate}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
