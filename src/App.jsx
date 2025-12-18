import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect } from "react";
import { fetchAndStoreUserPermissions } from "./api/auth";
import { getTokenInfo } from "./utils/tokenManager";
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
import OrderRecapReport from "./admin/pages/report/order-recap-report";
import InventoryReport from "./admin/pages/report/inventory-report";
import InventoryRelocationReport from "./admin/pages/report/inventory-relocation-report";
import CatalogueReport from "./admin/pages/report/catalogue-report";
import "./App.css";
import RouteGuard from "./components/route-guard";
import PermissionGuard from "./components/PermissionGuard";
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
import RoleList from "./admin/pages/role/role-list";
import AddRole from "./admin/pages/role/add-role";
import EditRole from "./admin/pages/role/edit-role";

function App() {
  // Fetch and cache user permissions on app mount
  useEffect(() => {
    const initPermissions = async () => {
      const token = getTokenInfo();
      if (token) {
        await fetchAndStoreUserPermissions();
      }
    };
    initPermissions();
  }, []);

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
        <Route path="/tracker" element={<Tracker />} />

        <Route element={<RouteGuard />}>
          <Route path="/order" element={<Order />} />
          <Route path="/payment-await/:id" element={<PaymentAwait />} />
          <Route path="/payment-success/:id" element={<PaymentSuccess />} />
          <Route path="/payment-declined" element={<PaymentDeclined />} />
          <Route path="/history-order" element={<HistoryOrder />} />
          <Route path="/history-order/:id" element={<OrderHistoryDetail />} />
        </Route>

        <Route element={<PermissionGuard permissions={['admin.access']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Reports */}
          <Route element={<PermissionGuard permissions={['reports.inventory']} />}>
            <Route path="/admin/report/inventory" element={<InventoryReport />} />
          </Route>
          <Route element={<PermissionGuard permissions={['reports.transfer']} />}>
            <Route path="/admin/report/inventory-relocation" element={<InventoryRelocationReport />} />
          </Route>
          <Route element={<PermissionGuard permissions={['reports.catalogue']} />}>
            <Route path="/admin/report/catalogue" element={<CatalogueReport />} />
          </Route>
          <Route element={<PermissionGuard permissions={['reports.orders']} />}>
            <Route path="/admin/report/order-recap" element={<OrderRecapReport />} />
          </Route>

          {/* Orders */}
          <Route element={<PermissionGuard permissions={['orders.view']} />}>
            <Route path="/admin/order/list" element={<OrderList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['orders.view']} />}>
            <Route path="/admin/order/detail/:oId" element={<OrderDetail />} />
          </Route>
          <Route element={<PermissionGuard permissions={['orders.view']} />}>
            <Route path="/admin/order/recap/:oId/:uId" element={<RecapOrder />} />
          </Route>
          <Route element={<PermissionGuard permissions={['orders.create']} />}>
            <Route path="/admin/order/add" element={<AddOrder />} />
          </Route>
          <Route element={<PermissionGuard permissions={['progress.view']} />}>
            <Route path="/admin/order/edit/:oId" element={<EditOrder />} />
          </Route>
          <Route element={<PermissionGuard permissions={['orders.rab']} />}>
            <Route path="/admin/order/rab/:orderId" element={<EditRabOrder />} />
          </Route>

          {/* RAB System */}
          <Route element={<PermissionGuard permissions={['rab.simulation.view']} />}>
            <Route path="/admin/rab-simulation" element={<RabSimulationList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['rab.simulation.edit']} />}>
            <Route path="/admin/rab-simulation/:id" element={<RabSimulationDetail />} />
          </Route>
          <Route element={<PermissionGuard permissions={['rab.template.view']} />}>
            <Route path="/admin/rab-template" element={<RABTemplateList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['rab.template.edit']} />}>
            <Route path="/admin/rab-template/:id" element={<RABTemplateDetail />} />
          </Route>
          <Route element={<PermissionGuard permissions={['rab.template.create']} />}>
            <Route path="/admin/rab-template/create" element={<AddRABTemplate />} />
          </Route>

          {/* Inventory Management */}
          <Route element={<PermissionGuard permissions={['inventory.items.view']} />}>
            <Route path="/admin/inventory/list" element={<InventoryList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['inventory.items.create']} />}>
            <Route path="/admin/inventory/add" element={<AddInventory />} />
          </Route>
          <Route element={<PermissionGuard permissions={['inventory.items.edit']} />}>
            <Route path="/admin/inventory/edit/:id" element={<EditInventory />} />
          </Route>
          <Route element={<PermissionGuard permissions={['inventory.warehouse.view']} />}>
            <Route path="/admin/inventory/warehouse" element={<WarehouseList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['inventory.category.view']} />}>
            <Route path="/admin/inventory/category" element={<CategoryList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['inventory.subcategory.view']} />}>
            <Route path="/admin/inventory/subcategory" element={<SubCategoryList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['inventory.relocation.view']} />}>
            <Route path="/admin/inventory/relocation" element={<InventoryRelocation />} />
          </Route>

          {/* Catalogue Management */}
          <Route element={<PermissionGuard permissions={['catalogue.product.view']} />}>
            <Route path="/admin/catalogue/list" element={<CatalogueList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['catalogue.category.view']} />}>
            <Route path="/admin/catalogue/category" element={<CatalogueCategoryList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['catalogue.subcategory.view']} />}>
            <Route path="/admin/catalogue/subcategory" element={<CatalogueSubCategoryList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['catalogue.product.create']} />}>
            <Route path="/admin/catalogue/add" element={<AddCatalogue />} />
          </Route>
          <Route element={<PermissionGuard permissions={['catalogue.product.edit']} />}>
            <Route path="/admin/catalogue/edit/:id" element={<EditCatalogue />} />
          </Route>

          {/* User Management */}
          <Route element={<PermissionGuard permissions={['roles.view']} />}>
            <Route path="/admin/role/list" element={<RoleList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['roles.create']} />}>
            <Route path="/admin/role/add" element={<AddRole />} />
          </Route>
          <Route element={<PermissionGuard permissions={['roles.edit']} />}>
            <Route path="/admin/role/edit/:rId" element={<EditRole />} />
          </Route>
          <Route element={<PermissionGuard permissions={['users.view']} />}>
            <Route path="/admin/owner-list" element={<OwnerList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['users.view']} />}>
            <Route path="/admin/admin-list" element={<AdminList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['users.view']} />}>
            <Route path="/admin/staff-list" element={<StaffList />} />
          </Route>
          <Route element={<PermissionGuard permissions={['users.view']} />}>
            <Route path="/admin/user-list" element={<UserList />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

    </>
  );
}

export default App;
