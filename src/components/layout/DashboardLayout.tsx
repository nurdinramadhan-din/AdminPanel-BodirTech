import React from 'react';
import { Sidebar } from '../sidebar/sidebar.tsx'; // Import dari folder sidebar
// Sesuaikan nama file header Anda (misal index.tsx atau Header.tsx)
import { Header } from '../header'; 

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100">
      {/* Sidebar (Fixed di kiri) */}
      <Sidebar />

      {/* Wrapper Konten Utama */}
      <div className="flex flex-col min-h-screen ml-64 transition-all duration-300">
        
        {/* Header (Sticky di atas) */}
        <Header />

        {/* Area Konten Dinamis (Halaman Dashboard, Gudang, dll dirender di sini) */}
        <main className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;