import { useList, useGetIdentity } from "@refinedev/core";
import React from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { App as AntdApp } from "antd";
import { Authenticated, Refine } from "@refinedev/core";
import { ErrorComponent, useNotificationProvider, AuthPage } from "@refinedev/antd";
import routerBindings, { CatchAllNavigate, DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { dataProvider } from "@refinedev/supabase";

//menu list pegawai
import { EmployeeList } from "./pages/employees/list";
import { UserCog } from "lucide-react"
import { EmployeeCreate } from "./pages/employees/create";
import { EmployeeEdit } from "./pages/employees/edit";

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

import { LoanList } from "./pages/loans/list";
import { LoanCreate } from "./pages/loans/create"; 
import { LoanEdit } from "./pages/loans/edit";
import { WalletOutlined } from "@ant-design/icons"; // Atau icon lain yang cocok

import { ScannerPage } from "./pages/scanner";

import { MachineControl } from "./pages/machines/index";

// Komponen Halaman Dashboard 
const DashboardPage = () => {
  // 1. Ambil Data Tren (Untuk KPI Output Hari Ini & Grafik)
  const { data: trendData, isLoading: loadingTrend } = useList({
    resource: "view_dashboard_daily_trend",
    pagination: { mode: "off" }, // Ambil semua data (rekap harian)
    sorters: [{ field: "date", order: "desc" }] // Yang terbaru paling atas
  });

  // 2. Ambil Data Status Mesin (Untuk KPI Mesin Aktif)
  const { data: machineData, isLoading: loadingMachine } = useList({
    resource: "view_live_machine_status",
    pagination: { mode: "off" },
    liveMode: "auto" // ✅ Auto-update jika ada perubahan status!
  });

  // 3. Ambil Data Karyawan (Total User)
  const { data: profileData, isLoading: loadingProfile } = useList({
    resource: "profiles",
    pagination: { mode: "off" } 
  });

  // --- LOGIKA PERHITUNGAN (KALKULASI) ---
  
  // A. Hitung Output Hari Ini
  // Ambil tanggal hari ini (YYYY-MM-DD) sesuai zona waktu lokal
  const todayStr = new Date().toLocaleDateString('en-CA'); 
  const todayStats = trendData?.data.find((d: any) => d.date === todayStr);
  const todayOutput = todayStats?.total_output || 0;

  // B. Hitung Mesin Aktif (Status = RUNNING)
  const totalMachines = machineData?.total || 0;
  // Filter mesin yang statusnya 'RUNNING' (Perhatikan huruf besar/kecil sesuai DB)
  const activeMachines = machineData?.data.filter(
      (m: any) => m.current_status === 'RUNNING'
  ).length || 0;

  // C. Total Karyawan
  const totalEmployees = profileData?.total || 0;

  // D. Mockup SPK Selesai (Karena kita belum buat tabel SPK, kita random dulu atau 0)
  // Nanti diganti dengan useList resource="spk_bundles"
  const completedSPK = 0; 

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">🏭 Command Center</h1>
          <p className="text-slate-400 mt-1">Real-time monitoring produksi pabrik.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm text-slate-500">System Status:</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-emerald-400 font-mono text-sm">LIVE DATA</p>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Row (DATA SUDAH DINAMIS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KARTU 1: OUTPUT HARI INI */}
        <StatsCard 
            title="Output Hari Ini" 
            value={loadingTrend ? "..." : todayOutput.toLocaleString()} 
            trend={todayOutput > 0 ? "Produksi Jalan" : "Menunggu"} 
            trendUp={todayOutput > 0} 
            icon={Activity} 
        />
        
        {/* KARTU 2: MESIN AKTIF */}
        <StatsCard 
            title="Mesin Aktif" 
            value={loadingMachine ? "..." : `${activeMachines} / ${totalMachines}`} 
            trend={activeMachines > 0 ? `${Math.round((activeMachines/totalMachines)*100)}% Utilization` : "No Activity"} 
            trendUp={activeMachines > 0} 
            icon={Layers} 
        />
        
        {/* KARTU 3: SPK SELESAI (Placeholder) */}
        <StatsCard 
            title="SPK Selesai" 
            value={completedSPK.toString()} 
            trend="Minggu Ini" 
            trendUp={true} 
            icon={TrendingUp} 
        />
        
        {/* KARTU 4: TOTAL KARYAWAN */}
        <StatsCard 
            title="Total Karyawan" 
            value={loadingProfile ? "..." : totalEmployees.toString()} 
            icon={Users} 
        />
      </div>

      {/* 3. Grafik & Peta (Pastikan komponen ini sudah menggunakan useList di dalamnya juga) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <ProductionChart />
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

              //Machine
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
               meta: { 
               label: "Data Pegawai",
               icon: <UserCog size={20} />
                },
              },

              {
               name: "employee_loans",
               list: "/loans",
               create: "/loans/create", 
               edit: "/loans/edit/:id", 
               meta: {
               label: "Kasbon Pegawai",
               icon: <WalletOutlined />, // Icon Dompet
                  },
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
                <Route path="/employees">
                <Route index element={<EmployeeList />} />
                <Route path="create" element={<EmployeeCreate />} /> {/* ✅ TAMBAHKAN BARIS INI */}
                <Route path="edit/:id" element={<EmployeeEdit />} /> {/* ✅ TAMBAHAN INI */}
                </Route>

                {/*HALAMAN MESIN */}
                <Route path="/machines" element={<MachineControl />} />
                
                {/* Redirect root (/) ke /dashboard */}
                <Route index element={<NavigateToResource resource="dashboard" />} />

                {/* --- TAMBAHKAN ROUTE INI --- */}
               <Route path="/loans">
               <Route index element={<LoanList />} />
               <Route path="create" element={<LoanCreate />} /> {/* <-- Route Create */}
               <Route path="edit/:id" element={<LoanEdit />} /> {/* <-- Route Edit */}
               </Route>

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