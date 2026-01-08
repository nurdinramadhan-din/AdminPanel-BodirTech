import { useGetIdentity } from "@refinedev/core";
import React from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { App as AntdApp } from "antd";
import { Authenticated, Refine } from "@refinedev/core";
import { ErrorComponent, useNotificationProvider, AuthPage } from "@refinedev/antd";
import routerBindings, { CatchAllNavigate, DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { dataProvider } from "@refinedev/supabase";
import { UserCog, Wallet } from "lucide-react"; // Import icon yg dipakai di meta resource

// 1. STYLE IMPORTS
import "@refinedev/antd/dist/reset.css";
import "./index.css";

// 2. LAYOUT & COMPONENTS
import DashboardLayout from "./components/layout/DashboardLayout"; 

// 3. UTILS & PROVIDERS
import { supabaseClient } from "./utility";
import authProvider from "./authProvider";
import { ColorModeContextProvider } from "./contexts/color-mode";

// 4. PAGES IMPORTS
// --> Dashboard Import yang Baru
import { DashboardPage } from "./pages/dashboard/index"; 
import { LiveFloorMapPage } from "./pages/dashboard/floor-map";

import { EmployeeList } from "./pages/employees/list";
import { EmployeeCreate } from "./pages/employees/create";
import { EmployeeEdit } from "./pages/employees/edit";

import { MaterialList } from "./pages/materials/list";
import { MaterialCreate } from "./pages/materials/create";
import { MaterialsEdit } from "./pages/materials/edit";

import { ProductList } from "./pages/products/list";
import { ProductCreate } from "./pages/products/create";
import { ProductEdit } from "./pages/products/edit";

import { CustomerList } from "./pages/customers/list";
import { CustomerCreate } from "./pages/customers/create";
import { CustomerEdit } from "./pages/customers/edit";

import { BomList } from "./pages/bom/list";
import { BomCreate } from "./pages/bom/create";
import { BomEdit } from "./pages/bom/edit";

import { ProjectList as ProjectList } from "./pages/projects/list";
import { ProjectCreate as ProjectCreate } from "./pages/projects/create";
import { ProjectShow } from "./pages/projects/show";
import { ProjectEdit } from "./pages/projects/edit";

import { LoanList } from "./pages/loans/list";
import { LoanCreate } from "./pages/loans/create"; 
import { LoanEdit } from "./pages/loans/edit";

import { ScannerPage } from "./pages/scanner";
import { PayrollList } from "./pages/payroll/list";
import { MachineControl } from "./pages/machines/index";

function App() {
  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <AntdApp>
          <Refine
            dataProvider={dataProvider(supabaseClient)}
            authProvider={authProvider}
            routerProvider={routerBindings}
            notificationProvider={useNotificationProvider}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              projectId: "o0IN5F-ugqCXf-dxHDVz",
            }}
            resources={[
              {
                name: "dashboard",
                list: "/dashboard",
                meta: { label: "Dashboard" },
              },
              {
                name: "machines",
                list: "/machines",
                meta: { label: "Kontrol Mesin" }, 
              },
              {
                name: "employees",
                list: "/employees",
                create: "/employees/create", 
                edit: "/employees/edit/:id", 
                meta: { label: "Data Pegawai", icon: <UserCog size={20} /> },
              },
              {
                name: "employee_loans",
                list: "/loans",
                create: "/loans/create", 
                edit: "/loans/edit/:id", 
                meta: { label: "Kasbon Pegawai", icon: <Wallet size={20} /> },
              },
              {
                name: "payroll", // Menambahkan Resource Payroll di Sidebar
                list: "/payroll",
                meta: { label: "Gaji & Saldo" },
              },
              {
                name: "materials",
                list: "/materials",
                create: "/materials/create",
                edit: "/materials/edit/:id",
                meta: { label: "Gudang Material" },
              },
              {
                name: "products",
                list: "/products",
                create: "/products/create",
                edit: "/products/edit/:id",
                meta: { label: "Desain / Produk" },
              },
              {
                name: "customers",
                list: "/customers",
                create: "/customers/create",
                edit: "/customers/edit/:id",
                meta: { label: "Pelanggan" },
              },
              {
                name: "bom_recipes",
                list: "/bom",
                create: "/bom/create",
                edit: "/bom/edit/:id",
                meta: { label: "Resep / BOM" },
              },
              {
                name: "projects",
                list: "/projects",
                create: "/projects/create",
                show: "/projects/show/:id",
                edit: "/projects/edit/:id",
                meta: { label: "Produksi (SPK)" },
              },
              {
                name: "scanner",
                list: "/scanner",
                meta: { label: "📷 Mobile Scanner" },
              },
            ]}
          >
            <Routes>
              {/* --- HALAMAN PUBLIC (LOGIN) --- */}
              <Route
                element={
                  <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                    <NavigateToResource />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/register" element={<AuthPage type="register" />} />
                <Route path="/forgot-password" element={<AuthPage type="forgotPassword" />} />
              </Route>

              {/* --- HALAMAN PROTECTED (DASHBOARD ADMIN) --- */}
              <Route
                element={
                  <Authenticated key="authenticated-inner" fallback={<CatchAllNavigate to="/login" />}>
                    <DashboardLayout>
                      <Outlet />
                    </DashboardLayout>
                  </Authenticated>
                }
              >
                {/* ROUTING YANG LEBIH RAPI */}
                <Route path="/dashboard">
                 <Route index element={<DashboardPage />} />
                 {/* ✅ TAMBAHKAN BARIS INI: */}
                 <Route path="floor-map" element={<LiveFloorMapPage />} /> 
                </Route>
                <Route path="/employees">
                  <Route index element={<EmployeeList />} />
                  <Route path="create" element={<EmployeeCreate />} />
                  <Route path="edit/:id" element={<EmployeeEdit />} />
                </Route>

                <Route path="/machines" element={<MachineControl />} />

                {/* Redirect root (/) ke /dashboard */}
                <Route index element={<NavigateToResource resource="dashboard" />} />

                <Route path="/loans">
                  <Route index element={<LoanList />} />
                  <Route path="create" element={<LoanCreate />} />
                  <Route path="edit/:id" element={<LoanEdit />} />
                </Route>

                <Route path="/payroll">
                   <Route index element={<PayrollList />} />
                </Route>

                <Route path="/materials">
                  <Route index element={<MaterialList />} />
                  <Route path="create" element={<MaterialCreate />} />
                  <Route path="edit/:id" element={<MaterialsEdit />} />
                </Route>

                <Route path="/products">
                  <Route index element={<ProductList />} />
                  <Route path="create" element={<ProductCreate />} />
                  <Route path="edit/:id" element={<ProductEdit />} />
                </Route>

                <Route path="/customers">
                  <Route index element={<CustomerList />} />
                  <Route path="create" element={<CustomerCreate />} />
                  <Route path="edit/:id" element={<CustomerEdit />} />
                </Route>

                <Route path="/bom">
                  <Route index element={<BomList />} />
                  <Route path="create" element={<BomCreate />} />
                  <Route path="edit/:id" element={<BomEdit />} />
                </Route>

                <Route path="/projects">
                  <Route index element={<ProjectList />} />
                  <Route path="create" element={<ProjectCreate />} />
                  <Route path="show/:id" element={<ProjectShow />} />
                  <Route path="edit/:id" element={<ProjectEdit />} />
                </Route>

                <Route path="/scanner">
                  <Route index element={<ScannerPage />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>

            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
}

export default App;