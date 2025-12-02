import React from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';

export default function CostStackPanel({ lane, onClose }) {
  const linehaul = (parseFloat(lane.baseRate) * lane.distance).toFixed(2);
  const fuel = (parseFloat(lane.fuelSurcharge) * lane.distance).toFixed(2);
  const accessorials = parseFloat(lane.accessorials);
  const deadheadCost = (lane.deadhead * 1.5).toFixed(2);
  const total = (parseFloat(linehaul) + parseFloat(fuel) + accessorials + parseFloat(deadheadCost)).toFixed(2);
  const margin = (total * (parseFloat(lane.margin) / 100)).toFixed(2);
  const finalPrice = (parseFloat(total) + parseFloat(margin)).toFixed(2);

  return (
    <div className="glass-card rounded-xl p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Cost Stack</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="pb-3 border-b border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Lane</p>
          <p className="text-sm font-medium text-white mono">{lane.id}</p>
          <p className="text-xs text-slate-400 mt-1">{lane.origin} → {lane.destination}</p>
        </div>

        <CostItem label="Linehaul" value={linehaul} detail={`$${lane.baseRate}/mi × ${lane.distance}mi`} />
        <CostItem label="Fuel Surcharge" value={fuel} detail={`$${lane.fuelSurcharge}/mi × ${lane.distance}mi`} />
        <CostItem label="Accessorials" value={accessorials.toFixed(2)} detail="Detention, lumper" />
        <CostItem label="Deadhead" value={deadheadCost} detail={`${lane.deadhead}mi estimated`} />
        
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Subtotal</span>
            <span className="text-lg font-bold text-white">${total}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Margin ({lane.margin}%)</span>
            <span className="text-sm text-emerald-400 font-medium">${margin}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <span className="text-base font-bold text-white">Final Price</span>
            <span className="text-xl font-bold text-indigo-400">${finalPrice}</span>
          </div>
        </div>
      </div>

      {lane.benchmark && (
        <div className="glass-card rounded-lg p-4 mb-4">
          <p className="text-xs text-slate-400 mb-2">Market Benchmark</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">${lane.benchmark}/mi</span>
            <span className={`text-sm font-medium ${
              parseFloat(lane.baseRate) < parseFloat(lane.benchmark) ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {((parseFloat(lane.baseRate) / parseFloat(lane.benchmark) - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {lane.warnings.length > 0 && (
        <div className="space-y-2 mb-6">
          {lane.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400">{warning}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-2.5 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
        <button className="w-full glass-card px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition-colors">
          Reset to Default
        </button>
      </div>
    </div>
  );
}

function CostItem({ label, value, detail }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-medium text-white">${value}</span>
      </div>
      {detail && <p className="text-xs text-slate-500">{detail}</p>}
    </div>
  );
}
