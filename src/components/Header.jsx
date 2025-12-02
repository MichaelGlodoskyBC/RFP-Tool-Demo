import React from 'react';
import { Package, Bell, Settings, Users } from 'lucide-react';

export default function Header() {
  return (
    <header className="glass-card border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">RFP Command</h1>
                <p className="text-xs text-slate-400 mono">FREIGHT PRICING ENGINE</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">3</span>
            </button>
            <button className="glass-card px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
            </button>
            <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">Analyst</p>
                <p className="text-xs text-slate-400">Operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
