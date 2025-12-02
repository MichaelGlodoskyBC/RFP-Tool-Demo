import React from 'react';
import { FileText, Clock, TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
      <MetricCard
        icon={FileText}
        label="Active RFPs"
        value="12"
        change="+3 this week"
        color="indigo"
      />
      <MetricCard
        icon={Clock}
        label="Avg Cycle Time"
        value="4.2 hrs"
        change="-23% vs last month"
        color="emerald"
      />
      <MetricCard
        icon={TrendingUp}
        label="Win Rate"
        value="68%"
        change="+5% vs target"
        color="blue"
      />
      <MetricCard
        icon={DollarSign}
        label="Total Value"
        value="$24.8M"
        change="YTD pipeline"
        color="purple"
      />
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, change, color }) {
  const colorMap = {
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="glass-card rounded-xl p-6 metric-card" style={{ color: colorMap[color].replace('text-', '') }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${
          color === 'indigo' ? 'from-indigo-500/20 to-indigo-600/20' :
          color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/20' :
          color === 'blue' ? 'from-blue-500/20 to-blue-600/20' :
          'from-purple-500/20 to-purple-600/20'
        }`}>
          <Icon className={`w-6 h-6 ${colorMap[color]}`} />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-xs text-slate-500">{change}</p>
      </div>
    </div>
  );
}
