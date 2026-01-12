
import React from 'react';
import { Weight, Hash, RotateCcw, Box, Scale, TrendingUp, PlusCircle, MinusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface WeighingGridProps {
  data: number[][];
  onChange: (col: number, row: number, val: number) => void;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  returnedKg: number;
  returnedPiece: number;
  stockKg: number;
  stockPiece: number;
  stockRate: number;
  weightUnit: string;
  pieceUnit: string;
  onUpdateReturn: (kg: number, piece: number) => void;
  onUpdateStock: (kg: number, piece: number, rate: number) => void;
  onUpdateUnits: (weightUnit: string, pieceUnit: string) => void;
}

export const WeighingGrid: React.FC<WeighingGridProps> = ({ 
  data, 
  onChange, 
  onAddColumn,
  onRemoveColumn,
  returnedKg, 
  returnedPiece, 
  stockKg, 
  stockPiece, 
  stockRate,
  weightUnit,
  pieceUnit,
  onUpdateReturn,
  onUpdateStock,
  onUpdateUnits
}) => {
  const colSums = data.map(col => col.reduce((a, b) => a + b, 0));
  const totalKg = colSums.reduce((a, b) => a + b, 0);
  
  const piecesCount = data.map(col => col.filter(v => v > 0).length * 10);
  const totalInitialPieces = piecesCount.reduce((a, b) => a + b, 0);

  const subTotalKg = Math.max(0, totalKg - returnedKg);
  const finalPieceCount = Math.max(0, totalInitialPieces - returnedPiece);

  return (
    <div className="space-y-4 md:space-y-6 no-print font-sans">
      {/* Grid Table Section */}
      <div className="bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 bg-indigo-600 flex flex-col sm:row justify-between items-center text-white gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-white/20 rounded-xl">
              <Scale size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black tracking-tight leading-tight">ওজন গ্রিড</h3>
              <p className="text-indigo-100 text-[8px] sm:text-[12px] font-bold uppercase tracking-widest opacity-80">প্রতি ঘর ১০ পিস</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              onClick={onRemoveColumn}
              disabled={data.length <= 1}
              className="bg-red-500/20 hover:bg-red-500/40 disabled:opacity-30 text-white p-2 rounded-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <MinusCircle size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">মুছুন</span>
            </button>
            <button 
              onClick={onAddColumn}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 sm:px-6 sm:py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg border border-emerald-400"
            >
              <PlusCircle size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">নতুন কলাম</span>
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Scroll indicators for mobile */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-gradient-to-r from-white to-transparent pointer-events-none sm:hidden"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-gradient-to-l from-white to-transparent pointer-events-none sm:hidden"></div>
          
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full border-collapse table-auto min-w-[300px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="w-10 sm:w-16 p-2 sm:p-4 text-[9px] sm:text-[12px] font-black text-slate-400 uppercase tracking-widest text-center sticky left-0 bg-slate-50 z-10 border-r">ক্রম</th>
                  {data.map((_, i) => (
                    <th key={i} className="min-w-[70px] sm:min-w-[120px] p-2 sm:p-4 border-r border-slate-100 text-[10px] sm:text-[13px] font-black text-indigo-600 uppercase tracking-widest text-center">Col {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Array.from({ length: 10 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="p-2 sm:p-4 text-center font-black text-slate-300 text-[10px] sm:text-[13px] sticky left-0 bg-white group-hover:bg-indigo-50/30 transition-colors border-r">{rowIndex + 1}</td>
                    {data.map((_, colIndex) => (
                      <td key={colIndex} className="p-0 border-r border-slate-50">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full h-10 sm:h-14 text-center border-none bg-transparent font-black text-slate-700 text-xs sm:text-lg focus:bg-white outline-none placeholder:text-slate-200 transition-all focus:ring-1 focus:ring-indigo-100"
                          value={data[colIndex]?.[rowIndex] || ''}
                          onChange={(e) => onChange(colIndex, rowIndex, parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 sm:border-t-4 border-slate-200">
                <tr className="bg-indigo-50/50">
                  <td className="p-2 sm:p-4 text-[8px] sm:text-[12px] font-black text-indigo-400 uppercase text-center sticky left-0 bg-indigo-50/50 border-r">KG</td>
                  {colSums.map((sum, i) => (
                    <td key={i} className="p-2 sm:p-4 text-center font-black text-indigo-700 text-xs sm:text-lg border-r border-indigo-50">
                      {sum > 0 ? sum.toFixed(2) : '-'}
                    </td>
                  ))}
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="p-2 sm:p-4 text-[8px] sm:text-[12px] font-black text-emerald-400 uppercase text-center sticky left-0 bg-emerald-50/50 border-r">পিস</td>
                  {piecesCount.map((p, i) => (
                    <td key={i} className="p-2 sm:p-4 text-center font-black text-emerald-700 text-xs sm:text-lg border-r border-emerald-50">
                      {p > 0 ? p : '-'}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Total Weight Card */}
        <div className="bg-[#1E293B] p-5 md:p-8 rounded-3xl shadow-xl border-l-8 md:border-l-[12px] border-indigo-500 relative overflow-hidden group">
           <p className="text-indigo-400 font-black uppercase text-[8px] md:text-[12px] tracking-[0.2em] mb-2 leading-none">মোট ওজন</p>
           <div className="flex items-baseline gap-1 md:gap-3 relative z-10">
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter">{totalKg.toFixed(2)}</h2>
              <span className="text-indigo-300 text-[8px] md:text-base font-black uppercase tracking-widest">{weightUnit}</span>
           </div>
        </div>

        {/* Net Pieces Card */}
        <div className="bg-[#0F172A] p-5 md:p-8 rounded-3xl shadow-xl border-l-8 md:border-l-[12px] border-emerald-500 relative overflow-hidden group">
           <p className="text-slate-500 font-black uppercase text-[8px] md:text-[12px] tracking-[0.2em] mb-2 leading-none">নিট পিস</p>
           <div className="flex items-baseline gap-1 md:gap-3 relative z-10">
              <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter">{finalPieceCount}</h2>
              <span className="text-emerald-400 text-[8px] md:text-base font-black uppercase tracking-widest">{pieceUnit}</span>
           </div>
        </div>

        {/* Returns Summary Card */}
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between">
           <div className="flex items-center gap-2 text-red-500 mb-3 md:mb-6">
              <RotateCcw size={16} />
              <p className="font-black uppercase text-[8px] md:text-[12px] tracking-[0.1em] leading-none">রিটার্ন</p>
           </div>
           <div className="grid grid-cols-2 gap-2 md:gap-5">
              <div className="bg-slate-50 p-2 md:p-5 rounded-xl md:rounded-[20px]">
                <span className="text-[7px] md:text-[11px] text-slate-400 font-black block mb-1 uppercase tracking-widest">কেজি</span>
                <input type="number" className="w-full bg-transparent text-sm md:text-3xl font-black text-slate-700 outline-none" value={returnedKg || ''} onChange={e => onUpdateReturn(parseFloat(e.target.value) || 0, returnedPiece)} placeholder="0" />
              </div>
              <div className="bg-slate-50 p-2 md:p-5 rounded-xl md:rounded-[20px]">
                <span className="text-[7px] md:text-[11px] text-slate-400 font-black block mb-1 uppercase tracking-widest">পিস</span>
                <input type="number" className="w-full bg-transparent text-sm md:text-3xl font-black text-slate-700 outline-none" value={returnedPiece || ''} onChange={e => onUpdateReturn(returnedKg, parseInt(e.target.value) || 0)} placeholder="0" />
              </div>
           </div>
        </div>

        {/* Stock Summary Card */}
        <div className="bg-white p-4 md:p-8 rounded-3xl shadow-lg border border-slate-100 flex flex-col justify-between">
           <div className="flex items-center gap-2 text-amber-500 mb-3 md:mb-6">
              <Box size={16} />
              <p className="font-black uppercase text-[8px] md:text-[12px] tracking-[0.1em] leading-none">মজুদ</p>
           </div>
           <div className="grid grid-cols-2 gap-2 md:gap-5">
              <div className="bg-slate-50 p-2 md:p-5 rounded-xl md:rounded-[20px]">
                <span className="text-[7px] md:text-[11px] text-slate-400 font-black block mb-1 uppercase tracking-widest">কেজি</span>
                <input type="number" className="w-full bg-transparent text-sm md:text-3xl font-black text-slate-700 outline-none" value={stockKg || ''} onChange={e => onUpdateStock(parseFloat(e.target.value) || 0, stockPiece, stockRate)} placeholder="0" />
              </div>
              <div className="bg-amber-50 p-2 md:p-5 rounded-xl md:rounded-[20px]">
                <span className="text-[7px] md:text-[11px] text-amber-600 font-black block mb-1 uppercase tracking-widest">রেট</span>
                <input type="number" className="w-full bg-transparent text-sm md:text-3xl font-black text-amber-700 outline-none" value={stockRate || ''} onChange={e => onUpdateStock(stockKg, stockPiece, parseFloat(e.target.value) || 0)} placeholder="0" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
