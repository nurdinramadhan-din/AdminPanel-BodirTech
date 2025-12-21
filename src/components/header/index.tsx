import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Bell, Search, User } from "lucide-react"; // Icon baru

interface IUser {
  name: string;
  avatar: string;
}

export const Header: React.FC = () => {
  // Mengambil data user dari AuthProvider (Supabase)
  const { data: user } = useGetIdentity<IUser>();

  return (
    <header className="h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* Kiri: Breadcrumbs / Konteks Halaman */}
      <div className="flex items-center">
        {/* Nanti bisa diganti dengan Tenant Name jika sudah ada Context */}
        <h2 className="text-gray-100 font-semibold text-lg tracking-wide">
          Factory Dashboard
        </h2>
        <span className="mx-3 text-slate-600">/</span>
        <span className="text-slate-400 text-sm">Overview</span>
      </div>

      {/* Kanan: Global Actions */}
      <div className="flex items-center space-x-6">
        
        {/* Search Bar Minimalis */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search SPK, ID..." 
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all w-64 placeholder-slate-600"
          />
        </div>

        {/* Notifikasi */}
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          {/* Badge Merah */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
        </button>

        {/* User Profile (Data dari Refine) */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-slate-400" />
            )}
          </div>
        </div>

      </div>
    </header>
  );
};