import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddCatalogue from "./admin/pages/Catalogue/AddCatalogue";
import CatalogueList from "./admin/pages/Catalogue/CatalogueList";
import CatalogueCategoryList from "./admin/pages/Catalogue/CategoryList";
import EditCatalogue from "./admin/pages/Catalogue/EditCatalogue";
import CatalogueSubCategoryList from "./admin/pages/Catalogue/SubCategoryList";
import AdminDashboard from "./admin/pages/dashboard/dashboard";
import AddInventory from "./admin/pages/Inventory/AddInventory";
import CategoryList from "./admin/pages/Inventory/CategoryList";
import EditInventory from "./admin/pages/Inventory/EditInventory";
import InventoryList from "./admin/pages/Inventory/InventoryList";
import InventoryRelocation from "./admin/pages/Inventory/InventoryRelocation";
import SubCategoryList from "./admin/pages/Inventory/SubCategoryList";
import WarehouseList from "./admin/pages/Inventory/WarehouseList";
import AddOrder from "./admin/pages/Order/AddOrder";
import EditRabOrder from "./admin/pages/Order/edit-rab-order";
import EditOrder from "./admin/pages/Order/EditOrder";
import RecapOrder from "./admin/pages/Order/recap-order";
import OrderDetail from "./admin/pages/Order/OrderDetail";
import OrderList from "./admin/pages/Order/OrderList";
import RabSimulationDetail from "./admin/pages/rab-simulation/rab-simulation-detail";
import RabSimulationList from "./admin/pages/rab-simulation/rab-simulation-list";
import AddRABTemplate from "./admin/pages/rab-template/add-rab-template";
import RABTemplateDetail from "./admin/pages/rab-template/rab-template-detail";
import RABTemplateList from "./admin/pages/rab-template/rab-template-list";
import AdminList from "./admin/pages/user/admin-list";
import OwnerList from "./admin/pages/user/owner-list";
import StaffList from "./admin/pages/user/staff-list";
import UserList from "./admin/pages/user/user-list";
<<<<<<< HEAD
import OrderRecapReport from "./admin/pages/report/order-recap-report";
import InventoryReport from "./admin/pages/report/inventory-report";
import InventoryRelocationReport from "./admin/pages/report/inventory-relocation-report";
import CatalogueReport from "./admin/pages/report/catalogue-report";
=======
>>>>>>> 9c24625fdf49c790ae79b8d6e615c0f5adccfaef
import "./App.css";
import RouteGuard from "./components/route-guard";
import TokenDebug from "./components/TokenDebug";
import Catalog from "./pages/Catalog";
import HistoryOrder from "./pages/HistoryOrder";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Order from "./pages/Order";
import OrderHistoryDetail from "./pages/order-history-detail";
import PaymentAwait from "./pages/PaymentAwait";
import PaymentDeclined from "./pages/PaymentDeclined";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProductDetail from "./pages/ProductDetail";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Tracker from "./pages/Tracker";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route element={<RouteGuard />}>
          <Route path="/order" element={<Order />} />
          <Route path="/payment-await/:id" element={<PaymentAwait />} />
          <Route path="/payment-success/:id" element={<PaymentSuccess />} />
          <Route path="/payment-declined" element={<PaymentDeclined />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/history-order" element={<HistoryOrder />} />
          <Route path="/history-order/:id" element={<OrderHistoryDetail />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inventory/list" element={<InventoryList />} />
          <Route path="/admin/inventory/add" element={<AddInventory />} />
          <Route path="/admin/inventory/edit/:id" element={<EditInventory />} />
          <Route
            path="/admin/inventory/warehouse"
            element={<WarehouseList />}
          />
          <Route path="/admin/inventory/category" element={<CategoryList />} />
          <Route
            path="/admin/inventory/subcategory"
            element={<SubCategoryList />}
          />
          <Route
            path="/admin/inventory/relocation"
            element={<InventoryRelocation />}
          />
          <Route
            path="/admin/catalogue/category"
            element={<CatalogueCategoryList />}
          />
          <Route
            path="/admin/catalogue/subcategory"
            element={<CatalogueSubCategoryList />}
          />
          <Route path="/admin/catalogue/list" element={<CatalogueList />} />
          <Route path="/admin/catalogue/add" element={<AddCatalogue />} />
          <Route path="/admin/catalogue/edit/:id" element={<EditCatalogue />} />
          <Route path="/admin/order/list" element={<OrderList />} />
          <Route path="/admin/order/add" element={<AddOrder />} />
          <Route path="/admin/order/detail/:oId" element={<OrderDetail />} />
          <Route path="/admin/order/edit/:oId" element={<EditOrder />} />
          <Route path="/admin/order/recap/:oId/:uId" element={<RecapOrder />} />
          <Route path="/admin/order/rab/:orderId" element={<EditRabOrder />} />
          <Route path="/admin/rab-simulation" element={<RabSimulationList />} />
          <Route
            path="/admin/rab-simulation/:id"
            element={<RabSimulationDetail />}
          />
          <Route path="/admin/rab-template" element={<RABTemplateList />} />
          <Route
            path="/admin/rab-template/:id"
            element={<RABTemplateDetail />}
          />
          <Route
            path="/admin/rab-template/create"
            element={<AddRABTemplate />}
          />
<<<<<<< HEAD
          <Route path="/admin/report/inventory" element={<InventoryReport />} />
          <Route path="/admin/report/inventory-relocation" element={<InventoryRelocationReport />} />
          <Route path="/admin/report/catalogue" element={<CatalogueReport />} />
          <Route path="/admin/report/order-recap" element={<OrderRecapReport />} />
          <Route path="/admin/owner-list" element={<OwnerList />} />
          <Route path="/admin/admin-list" element={<AdminList />} />
          <Route path="/admin/staff-list" element={<StaffList />} />
          <Route path="/admin/user-list" element={<UserList />} />
        </Route>
=======
        </Route>
        <Route path="/admin/owner-list" element={<OwnerList />} />
        <Route path="/admin/admin-list" element={<AdminList />} />
        <Route path="/admin/staff-list" element={<StaffList />} />
        <Route path="/admin/user-list" element={<UserList />} />
>>>>>>> 9c24625fdf49c790ae79b8d6e615c0f5adccfaef
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Token Debug Component - Hanya tampil di development */}
      {import.meta.env.MODE === "development" && <TokenDebug />}
    </>
  );
}

export default App;
