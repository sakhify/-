
import React from 'react';
import { RateLadderItem } from '../types';
import { Trash2, Plus } from 'lucide-react';

interface SettingsProps {
  ladder: RateLadderItem[];
  setLadder: (ladder: RateLadderItem[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({ ladder, setLadder }) => {
  const addItem = () => setLadder([...ladder, { minPoints: 0, rate: 0 }]);
  const removeItem = (idx: number) => setLadder(ladder.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: keyof RateLadderItem, val: number) => {
    const next = [...ladder];
    next[idx] = { ...next[idx], [key]: val };
    setLadder(next);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        পয়েন্ট রেট সেটিংস
      </h3>
      <div className="space-y-3">
        {ladder.sort((a,b) => b.minPoints - a.minPoints).map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 uppercase">পয়েন্ট (Min)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full bg-white border rounded p-2"
                value={item.minPoints}
                onChange={(e) => updateItem(idx, 'minPoints', parseFloat(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 uppercase">টাকা (Per KG)</label>
              <input 
                type="number" 
                className="w-full bg-white border rounded p-2"
                value={item.rate}
                onChange={(e) => updateItem(idx, 'rate', parseFloat(e.target.value))}
              />
            </div>
            <button onClick={() => removeItem(idx)} className="text-red-500 mt-4"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
      <button 
        onClick={addItem}
        className="mt-4 flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
      >
        <Plus size={18}/> নতুন রো যোগ করুন
      </button>
    </div>
  );
};
