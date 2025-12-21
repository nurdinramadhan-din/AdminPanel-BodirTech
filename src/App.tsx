import React from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { App as AntdApp } from "antd";
import { Authenticated, Refine } from "@refinedev/core";
import { ErrorComponent, useNotificationProvider, AuthPage } from "@refinedev/antd";
import routerBindings, { CatchAllNavigate, DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { dataProvider } from "@refinedev/supabase";

import { Activity, Layers, Users, TrendingUp } from 'lucide-react';
import { StatsCard } from './components/dashboard/StatsCard';
import { ProductionChart } from './components/dashboard/ProductionChart';
import { MiniFloorMap } from './components/dashboard/MiniFloorMap';

// 1. STYLE IMPORTS
// Reset bawaan Ant Design (Wajib di atas)
import "@refinedev/antd/dist/reset.css";
// Tailwind CSS kita (Wajib di bawah reset agar style kita menang)
import "./index.css";

// 2. LAYOUT & COMPONENTS
// Pastikan path ini sesuai dengan file yang Anda buat di folder components
import DashboardLayout from "./components/layout/DashboardLayout"; 

// 3. UTILS & PROVIDERS
import { supabaseClient } from "./utility";
import authProvider from "./authProvider";
import { ColorModeContextProvider } from "./contexts/color-mode";

// 4. PAGES IMPORTS
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

import { ProjectList } from "./pages/projects/list";
import { ProjectCreate } from "./pages/projects/create";
import { ProjectShow } from "./pages/projects/show";
import { ProjectEdit } from "./pages/projects/edit";

import { ScannerPage } from "./pages/scanner";

// Komponen Halaman Dashboard 
const DashboardPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">🏭 Command Center</h1>
          <p className="text-slate-400 mt-1">Real-time monitoring produksi pabrik.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-slate-500">Last updated:</p>
          <p className="text-emerald-400 font-mono">Just now</p>
        </div>
      </div>

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Output Hari Ini" value="24,500" trend="+12%" trendUp={true} icon={Activity} />
        <StatsCard title="Mesin Aktif" value="10 / 12" trend="-2" trendUp={false} icon={Layers} />
        <StatsCard title="SPK Selesai" value="8" trend="+3" trendUp={true} icon={TrendingUp} />
        <StatsCard title="Total Karyawan" value="45" icon={Users} />
      </div>

      {/* 3. Main Chart & Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Grafik mengambil 2 kolom */}
        <ProductionChart />
        
        {/* Peta Mesin mengambil 1 kolom */}
        <MiniFloorMap />
      </div>
    </div>
  );
};

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
              projectId: "o0IN5F-ugqCXf-dxHDVz", // ID Project Anda dari package.json
            }}
            resources={[
              // DASHBOARD
              {
                name: "dashboard",
                list: "/dashboard",
                meta: { label: "Dashboard" },
              },
              // GUDANG MATERIAL
              {
                name: "materials",
                list: "/materials",
                create: "/materials/create",
                edit: "/materials/edit/:id",
                meta: { label: "Gudang Material" },
              },
              // PRODUK
              {
                name: "products",
                list: "/products",
                create: "/products/create",
                edit: "/products/edit/:id",
                meta: { label: "Desain / Produk" },
              },
              // PELANGGAN
              {
                name: "customers",
                list: "/customers",
                create: "/customers/create",
                edit: "/customers/edit/:id",
                meta: { label: "Pelanggan" },
              },
              // BOM (RESEP)
              {
                name: "bom_recipes", // Nama tabel di DB
                list: "/bom",        // URL di browser
                create: "/bom/create",
                edit: "/bom/edit/:id",
                meta: { label: "Resep / BOM" },
              },
              // PRODUKSI (SPK)
              {
                name: "projects",
                list: "/projects",
                create: "/projects/create",
                show: "/projects/show/:id",
                edit: "/projects/edit/:id",
                meta: { label: "Produksi (SPK)" },
              },
              // SCANNER
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
                    {/* ✅ KUNCI UTAMA: Layout Custom Membungkus Outlet */}
                    <DashboardLayout>
                      <Outlet />
                    </DashboardLayout>
                  </Authenticated>
                }
              >
                {/* 1. Dashboard Index */}
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Redirect root (/) ke /dashboard */}
                <Route index element={<NavigateToResource resource="dashboard" />} />

                {/* 2. Materials */}
                <Route path="/materials">
                  <Route index element={<MaterialList />} />
                  <Route path="create" element={<MaterialCreate />} />
                  <Route path="edit/:id" element={<MaterialsEdit />} />
                </Route>

                {/* 3. Products */}
                <Route path="/products">
                  <Route index element={<ProductList />} />
                  <Route path="create" element={<ProductCreate />} />
                  <Route path="edit/:id" element={<ProductEdit />} />
                </Route>

                {/* 4. Customers */}
                <Route path="/customers">
                  <Route index element={<CustomerList />} />
                  <Route path="create" element={<CustomerCreate />} />
                  <Route path="edit/:id" element={<CustomerEdit />} />
                </Route>

                {/* 5. BOM */}
                <Route path="/bom">
                  <Route index element={<BomList />} />
                  <Route path="create" element={<BomCreate />} />
                  <Route path="edit/:id" element={<BomEdit />} />
                </Route>

                {/* 6. Projects / SPK */}
                <Route path="/projects">
                  <Route index element={<ProjectList />} />
                  <Route path="create" element={<ProjectCreate />} />
                  <Route path="show/:id" element={<ProjectShow />} />
                  <Route path="edit/:id" element={<ProjectEdit />} />
                </Route>

                {/* 7. Scanner */}
                <Route path="/scanner">
                  <Route index element={<ScannerPage />} />
                </Route>

                {/* 8. Halaman Error 404 */}
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