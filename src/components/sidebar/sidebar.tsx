import React from 'react';
import { 
  LayoutDashboard, 
  Package,        // Ikon Gudang
  Shirt,          // Ikon Produk/Desain
  Users,          // Ikon Pelanggan
  ScrollText,     // Ikon BOM/Resep
  Factory,        // Ikon SPK
  ScanLine,       // Ikon Scanner
  LogOut,
  Map,            // Ikon Live Floor (BARU)
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
// ✅ 1. IMPORT HOOK LOGOUT DARI REFINE
import { useLogout } from "@refinedev/core";
import { Slider } from 'antd';

// MENU MATCHING: Urutan disesuaikan persis dengan Sidebar lama Anda
const MENU_ITEMS = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
  name: 'Kontrol Mesin', 
  href: '/machines', 
  icon: Slider // Atau icon 'Sliders' dari lucide-react
  },
  { 
    // FITUR BARU
    name: 'Live Floor Map', 
    href: '/dashboard/floor-map', 
    icon: Map,
    isHighlight: true 
  },
  { 
    name: 'Gudang Material', 
    href: '/materials', 
    icon: Package 
  },
  { 
    name: 'Desain / Produk', 
    href: '/products', 
    icon: Shirt 
  },
  { 
    name: 'Pelanggan', 
    href: '/customers', 
    icon: Users 
  },
  { 
    name: 'Resep / BOM', 
    href: '/bom', 
    icon: ScrollText 
  },
  { 
    name: 'Produksi (SPK)', 
    href: '/projects', 
    icon: Factory 
  },
  { 
    name: 'Mobile Scanner', 
    href: '/scanner', 
    icon: ScanLine 
  }
];

export const Sidebar = () => {
  const location = useLocation();
  
  // ✅ 2. INISIALISASI FUNGSI LOGOUT
  const { mutate: logout } = useLogout();

  return (
    <aside className="w-64 h-screen bg-[#0f172a] border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      {/* 1. Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#0f172a]">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
          <span className="font-bold text-white text-xl">B</span>
        </div>
        <span className="text-lg font-bold text-white tracking-wide">BordirTech</span>
      </div>

      {/* 2. Menu List */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1
                ${isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              <Icon 
                size={20} 
                className={`mr-3 transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'}`} 
              />
              <span className={item.isHighlight ? "text-emerald-300 font-semibold" : ""}>
                {item.name}
              </span>
              
              {item.isHighlight && (
                <span className="ml-auto bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* 3. Bottom Actions */}
      <div className="p-4 border-t border-slate-800 bg-[#0f172a]">
        <button className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors w-full mb-1">
          <Settings size={18} className="mr-3" />
          Settings
        </button>
        
        {/* ✅ 3. TAMBAHKAN ONCLICK PADA TOMBOL LOGOUT */}
        <button 
          onClick={() => logout()}
          className="flex items-center px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors w-full group"
        >
          <LogOut size={18} className="mr-3 group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
};