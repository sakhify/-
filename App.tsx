
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  Settings as SettingsIcon, 
  LogOut, 
  Download,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Package,
  Calendar,
  Truck,
  UserCheck,
  ChevronRight,
  Camera,
  MapPin,
  X,
  Save,
  User,
  Activity,
  Trash2,
  Clock,
  Zap,
  CheckCircle2,
  Menu,
  Scale,
  PieChart,
  ArrowLeft,
  ChevronDown,
  History,
  ClipboardList,
  Building2,
  Tag,
  Cookie,
  ChevronDown as ChevronDownIcon,
  ToggleLeft,
  ToggleRight,
  Phone,
  Upload,
  Lock,
  Unlock,
  CalendarCheck,
  MoreVertical,
  ChevronUp,
  // Fix: Added missing Box import
  Box
} from 'lucide-react';
import { UserRole, SalesBatch, DailyEntry, FarmerProfile } from './types';
import { DEFAULT_RATE_LADDER, MOCK_FARMERS } from './constants';
import { WeighingGrid } from './components/WeighingGrid';
import { Settings } from './components/Settings';
import * as MathUtils from './utils/math';

const DEFAULT_FARMER_PIC = "https://images.unsplash.com/photo-1594901851159-41e99f1e1021?auto=format&fit=crop&q=80&w=200";

const App: React.FC = () => {
  // Authentication State
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily' | 'sales' | 'settlement' | 'profile' | 'settings' | 'batch-list'>('dashboard');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // App Data State
  const [rateLadder, setRateLadder] = useState(DEFAULT_RATE_LADDER);
  const [batches, setBatches] = useState<Record<string, SalesBatch>>({});
  const [farmers, setFarmers] = useState<FarmerProfile[]>(MOCK_FARMERS);
  
  // Modals
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [newFarmer, setNewFarmer] = useState({ name: '', location: '', mobile: '', profilePic: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [batchForm, setBatchForm] = useState({
    batchName: '',
    chickCount: 1000,
    chickRate: 40,
    company: '',
    dealer: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  // Fixed Logout Handler
  const handleLogout = useCallback(() => {
    setRole(null);
    setSelectedFarmerId(null);
    setSelectedBatchId(null);
    setActiveTab('dashboard');
    setShowAddFarmer(false);
    setShowAddBatch(false);
    setIsMobileMenuOpen(false);
  }, []);

  const loginAsDealer = () => {
    setRole(UserRole.DEALER);
    setSelectedFarmerId(null);
    setSelectedBatchId(null);
    setActiveTab('dashboard');
  };

  const loginAsFarmer = (farmer: FarmerProfile) => {
    setRole(UserRole.FARMER);
    setSelectedFarmerId(farmer.id);
    setSelectedBatchId(null);
    setActiveTab('dashboard');
  };

  const handleAddFarmer = () => {
    if (!newFarmer.name || !newFarmer.location) return;
    const farmer: FarmerProfile = {
      id: `f${Date.now()}`,
      name: newFarmer.name,
      location: newFarmer.location,
      mobile: newFarmer.mobile,
      profilePic: newFarmer.profilePic || DEFAULT_FARMER_PIC
    };
    setFarmers(prev => [...prev, farmer]);
    setNewFarmer({ name: '', location: '', mobile: '', profilePic: '' });
    setShowAddFarmer(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFarmer(prev => ({ ...prev, profilePic: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Farmer / Batch Setup
  const activeFarmer = useMemo(() => farmers.find(f => f.id === selectedFarmerId), [farmers, selectedFarmerId]);
  
  const farmerBatches = useMemo(() => {
    if (!selectedFarmerId) return [];
    // Fix: Cast Object.values(batches) to SalesBatch[] to avoid unknown type errors
    return (Object.values(batches) as SalesBatch[]).filter(b => b.farmerId === selectedFarmerId).sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [batches, selectedFarmerId]);

  const currentBatch = useMemo<SalesBatch | null>(() => {
    if (!selectedBatchId) return null;
    return batches[selectedBatchId] || null;
  }, [batches, selectedBatchId]);

  const updateBatch = (updates: Partial<SalesBatch>) => {
    if (!selectedBatchId) return;
    setBatches(prev => ({
      ...prev,
      [selectedBatchId]: { ...prev[selectedBatchId], ...updates } as SalesBatch
    }));
  };

  const handleStartNewBatch = () => {
    if (!selectedFarmerId) return;
    const newId = `batch-${selectedFarmerId}-${Date.now()}`;
    const freshBatch: SalesBatch = {
      id: newId,
      farmerId: selectedFarmerId,
      batchName: batchForm.batchName || `ব্যাচ ${farmerBatches.length + 1}`,
      chickCount: batchForm.chickCount,
      chickRate: batchForm.chickRate,
      company: batchForm.company,
      dealer: batchForm.dealer,
      feedName: '', 
      startDate: batchForm.startDate,
      dailyEntries: [],
      weighingData: Array.from({ length: 10 }, () => Array(10).fill(0)),
      returnedKg: 0,
      returnedPiece: 0,
      stockKg: 0,
      stockPiece: 0,
      stockRate: 0,
      applyMortalityCharge: true,
      manualDeductions: [],
      marketRate: 140,
      medicineCost: 5000,
      feedCostPerSack: 2800,
      weightUnit: 'KG',
      pieceUnit: 'Piece',
      isCompleted: false
    };
    setBatches(prev => ({ ...prev, [newId]: freshBatch }));
    setSelectedBatchId(newId);
    setShowAddBatch(false);
    setActiveTab('dashboard');
    setBatchForm({
      batchName: '',
      chickCount: 1000,
      chickRate: 40,
      company: '',
      dealer: '',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddWeighingColumn = () => {
    if (!currentBatch || currentBatch.isCompleted) return;
    const newData = [...currentBatch.weighingData, Array(10).fill(0)];
    updateBatch({ weighingData: newData });
  };

  const handleRemoveWeighingColumn = () => {
    if (!currentBatch || currentBatch.isCompleted || currentBatch.weighingData.length <= 1) return;
    const newData = currentBatch.weighingData.slice(0, -1);
    updateBatch({ weighingData: newData });
  };

  const calculations = useMemo(() => {
    if (!currentBatch) return null;
    
    const totalWeighedKg = currentBatch.weighingData.flat().reduce((acc: number, val) => acc + val, 0);
    const finalKgSold = Math.max(0, totalWeighedKg - currentBatch.returnedKg);
    const slotsUsed = currentBatch.weighingData.flat().filter(v => v > 0).length;
    const piecesSold = slotsUsed * 10 - currentBatch.returnedPiece;
    const avgWeight = MathUtils.calculateAverageWeight(finalKgSold, piecesSold);
    const feedSacks = MathUtils.calculateFeedConsumed(currentBatch);
    const points = MathUtils.calculateFeedPoints(finalKgSold, feedSacks);
    const farmerResults = MathUtils.calculateFarmerProfit(currentBatch, finalKgSold, points, rateLadder);
    const dealerProfit = MathUtils.calculateDealerProfit(currentBatch, finalKgSold, farmerResults.netProfit);

    return {
      totalWeighedKg,
      finalKgSold,
      piecesSold,
      avgWeight,
      feedSacks,
      points,
      farmer: farmerResults,
      dealerProfit
    };
  }, [currentBatch, rateLadder]);

  const toggleBatchCompletion = () => {
    if (!currentBatch) return;
    const isNowCompleted = !currentBatch.isCompleted;
    updateBatch({ 
      isCompleted: isNowCompleted,
      endDate: isNowCompleted ? (currentBatch.endDate || new Date().toISOString().split('T')[0]) : undefined
    });
  };

  const activeBatchTabs = [
    { id: 'dashboard', label: 'হোম', icon: <LayoutDashboard size={20}/> },
    { id: 'daily', label: 'দৈনিক', icon: <Calculator size={20}/> },
    { id: 'sales', label: 'বিক্রয়', icon: <Scale size={20}/> },
    { id: 'settlement', label: 'লাভ-ক্ষতি', icon: <PieChart size={20}/> }
  ];

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center text-center transition-all hover:scale-[1.02]">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white mb-6 shadow-2xl rotate-3">
              <UserCheck size={40} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">ডিলার ড্যাশবোর্ড</h2>
            <button onClick={loginAsDealer} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 group">
              ডিলার হিসেবে প্রবেশ <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200 flex flex-col h-[450px] md:h-[500px]">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 text-center">খামারি লগইন</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
              {farmers.map(farmer => (
                <button key={farmer.id} onClick={() => loginAsFarmer(farmer)} className="w-full p-4 border border-slate-100 bg-slate-50 rounded-2xl text-left hover:border-indigo-400 hover:bg-indigo-50 transition-all group flex items-center gap-4">
                  <img src={farmer.profilePic || DEFAULT_FARMER_PIC} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white shadow-sm" alt=""/>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm md:text-base">{farmer.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={12}/> {farmer.location}</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === UserRole.DEALER && !selectedFarmerId) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">খামারি ম্যানেজমেন্ট</h1>
              <p className="text-slate-500 font-medium">আপনার সকল খামারির তালিকা এখানে পাবেন</p>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <button onClick={() => setShowAddFarmer(true)} className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2">
                <Plus size={20}/> নতুন খামারি
              </button>
              <button onClick={handleLogout} className="flex-1 md:flex-none bg-white border border-red-200 text-red-600 px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-sm">
                <LogOut size={20}/> লগআউট
              </button>
            </div>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {farmers.map(farmer => (
              <div key={farmer.id} onClick={() => setSelectedFarmerId(farmer.id)} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[35px] shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="relative z-10 flex items-start gap-4 md:gap-5 mb-6">
                  <img src={farmer.profilePic || DEFAULT_FARMER_PIC} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl object-cover border-4 border-white shadow-xl" alt=""/>
                  <div className="pt-1">
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-1">{farmer.name}</h3>
                    <p className="text-slate-500 text-xs md:text-sm font-bold flex items-center gap-1"><MapPin size={14}/> {farmer.location}</p>
                  </div>
                </div>
                <div className="relative z-10 flex justify-between items-center pt-4 md:pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs md:text-sm uppercase">হিসাব দেখুন <ArrowRight size={18} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {showAddFarmer && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowAddFarmer(false)} className="absolute top-6 right-6 text-slate-400"><X size={28}/></button>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8">নতুন খামারি</h2>
              
              <div className="flex flex-col items-center mb-6 md:mb-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <img src={newFarmer.profilePic || DEFAULT_FARMER_PIC} className="w-24 h-24 md:w-28 md:h-28 rounded-[28px] md:rounded-[32px] object-cover border-4 border-white shadow-xl group-hover:opacity-80 transition-all" alt=""/>
                  <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                    <Camera size={28} />
                  </div>
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="mt-3 text-indigo-600 font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2">
                  <Upload size={14}/> ছবি আপলোড করুন
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="space-y-5 md:space-y-6">
                <InputContainer label="খামারি/ফার্মের নাম"><input type="text" className="w-full bg-slate-50 border-0 rounded-2xl md:rounded-[20px] p-4 font-bold outline-none" placeholder="উদা: শিকদার পোল্ট্রি ফার্ম" value={newFarmer.name} onChange={e => setNewFarmer({...newFarmer, name: e.target.value})} /></InputContainer>
                <InputContainer label="মোবাইল নম্বর"><input type="tel" className="w-full bg-slate-50 border-0 rounded-2xl md:rounded-[20px] p-4 font-bold outline-none" placeholder="উদা: 017xxxxxxxx" value={newFarmer.mobile} onChange={e => setNewFarmer({...newFarmer, mobile: e.target.value})} /></InputContainer>
                <InputContainer label="ঠিকানা/অবস্থান"><input type="text" className="w-full bg-slate-50 border-0 rounded-2xl md:rounded-[20px] p-4 font-bold outline-none" placeholder="উদা: সাভার, ঢাকা" value={newFarmer.location} onChange={e => setNewFarmer({...newFarmer, location: e.target.value})} /></InputContainer>
                <button onClick={handleAddFarmer} className="w-full bg-indigo-600 text-white py-4 md:py-5 rounded-2xl md:rounded-[24px] font-black text-lg shadow-xl hover:bg-indigo-700 mt-4">খামারি সেভ করুন</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white shadow-2xl no-print">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-16 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 shrink-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-600 rounded-lg md:rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <Zap size={18} className="md:w-7 md:h-7 fill-white" />
            </div>
            <span className="font-black text-sm md:text-2xl tracking-tighter block">খামার কন্ট্রোল</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-2 bg-slate-800/40 p-1.5 rounded-[20px] border border-slate-700/50">
            <HeaderNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="ড্যাশবোর্ড" />
            <HeaderNavItem active={activeTab === 'batch-list'} onClick={() => setActiveTab('batch-list')} icon={<ClipboardList size={20}/>} label="ব্যাচ" />
            <HeaderNavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={20}/>} label="প্রোফাইল" />
            {role === UserRole.DEALER && <HeaderNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20}/>} label="সেটিংস" />}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {role === UserRole.DEALER && selectedFarmerId && (
              <button 
                onClick={() => setSelectedFarmerId(null)}
                className="hidden lg:flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-500/30 transition-all"
              >
                <ArrowLeft size={16}/> খামারি পরিবর্তন
              </button>
            )}
            <div className="flex items-center gap-2 md:gap-3 bg-slate-900 px-2 py-1 md:py-2 rounded-xl md:rounded-[20px] border border-slate-800">
               <img src={activeFarmer?.profilePic || DEFAULT_FARMER_PIC} className="w-6 h-6 md:w-10 md:h-10 rounded-lg md:rounded-xl object-cover border border-slate-700" alt=""/>
               <div className="hidden sm:block">
                 <p className="text-[10px] md:text-xs font-bold truncate max-w-[80px] md:max-w-[100px] leading-none">{activeFarmer?.name}</p>
               </div>
               <button onClick={handleLogout} className="p-1 md:p-2 text-slate-400 hover:text-red-400 rounded-lg transition-all"><LogOut size={16} /></button>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1.5 bg-slate-800 rounded-lg text-slate-300">
              {isMobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-right">
             <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xl text-slate-900 tracking-tighter">মেনু</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button>
             </div>
             <div className="flex flex-col gap-2">
                <MobileMenuItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} icon={<LayoutDashboard size={20}/>} label="ড্যাশবোর্ড" />
                <MobileMenuItem active={activeTab === 'batch-list'} onClick={() => { setActiveTab('batch-list'); setIsMobileMenuOpen(false); }} icon={<ClipboardList size={20}/>} label="সকল ব্যাচ" />
                <MobileMenuItem active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} icon={<User size={20}/>} label="প্রোফাইল" />
                {role === UserRole.DEALER && <MobileMenuItem active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} icon={<SettingsIcon size={20}/>} label="সেটিংস" />}
                <hr className="my-2 border-slate-100" />
                {role === UserRole.DEALER && selectedFarmerId && (
                  <button onClick={() => { setSelectedFarmerId(null); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-4 rounded-2xl text-indigo-600 font-bold hover:bg-indigo-50 transition-all text-sm">
                    <ArrowLeft size={20}/> খামারি পরিবর্তন
                  </button>
                )}
                <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-all text-sm mt-4">
                  <LogOut size={20}/> লগআউট
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation (Visible when a batch is active) */}
      {selectedBatchId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 lg:hidden h-16 flex items-center justify-around px-2 no-print shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
           {activeBatchTabs.map(tab => (
             <button 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}
             >
               <div className={`p-1 rounded-lg transition-all ${activeTab === tab.id ? 'bg-indigo-50' : ''}`}>
                 {tab.icon}
               </div>
               <span className="text-[9px] font-black uppercase tracking-tight">{tab.label}</span>
             </button>
           ))}
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-6 md:mb-8 no-print">
            {activeTab !== 'dashboard' && activeTab !== 'batch-list' && (
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className="hidden lg:flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest mb-6 hover:gap-4 transition-all group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> পিছনে (ড্যাশবোর্ড)
              </button>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
              <div>
                 <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-2">
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                      {activeTab === 'dashboard' && 'ড্যাশবোর্ড'}
                      {activeTab === 'daily' && 'দৈনিক হিসাব'}
                      {activeTab === 'sales' && 'বিক্রয় ওজন'}
                      {activeTab === 'settlement' && 'লাভ-ক্ষতি রিপোর্ট'}
                      {activeTab === 'batch-list' && 'ব্যাচ ম্যানেজমেন্ট'}
                      {activeTab === 'profile' && 'প্রোফাইল'}
                      {activeTab === 'settings' && 'সেটিংস'}
                    </h2>
                    {currentBatch && (
                      <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${currentBatch.isCompleted ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {currentBatch.isCompleted ? <Lock size={10}/> : <Activity size={10}/>}
                        {currentBatch.isCompleted ? 'বন্ধ' : 'সচল'}
                      </span>
                    )}
                 </div>
                 {currentBatch && (
                   <div className="flex flex-wrap items-center gap-2 md:gap-3">
                     <span className="bg-indigo-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                       ব্যাচ: {currentBatch.batchName} ({currentBatch.startDate})
                     </span>
                     {currentBatch.isCompleted && currentBatch.endDate && (
                       <span className="bg-slate-100 text-slate-500 px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                         <CalendarCheck size={10}/> ক্লোজিং: {currentBatch.endDate}
                       </span>
                     )}
                   </div>
                 )}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 {activeTab === 'settlement' && (
                   <button onClick={() => window.print()} className="flex items-center justify-center gap-2 md:gap-3 bg-white border border-slate-200 px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-[20px] text-slate-900 font-black hover:bg-slate-50 transition-all shadow-md w-full md:w-auto text-xs md:text-sm">
                     <Download size={18}/> ডাউনলোড
                   </button>
                 )}
              </div>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Fix: Inlined QuickActionsMenu as it was missing from definition */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 no-print">
                <QuickActionCard 
                  onClick={() => setActiveTab('daily')} 
                  icon={<Calculator className="text-white" size={24} />} 
                  label="দৈনিক লজ" 
                  desc="খাদ্য ও মৃত্যু আপডেট" 
                  color="bg-indigo-600"
                  disabled={!selectedBatchId || currentBatch?.isCompleted}
                />
                <QuickActionCard 
                  onClick={() => setActiveTab('sales')} 
                  icon={<Scale className="text-white" size={24} />} 
                  label="বিক্রয় ওজন" 
                  desc="পাখি ওজন ও রিটার্ন" 
                  color="bg-emerald-600"
                  disabled={!selectedBatchId || currentBatch?.isCompleted}
                />
                <QuickActionCard 
                  onClick={() => setActiveTab('settlement')} 
                  icon={<PieChart className="text-white" size={24} />} 
                  label="লাভ-ক্ষতি" 
                  desc="ফাইনাল রিপোর্ট" 
                  color="bg-amber-500"
                  disabled={!selectedBatchId}
                />
                <QuickActionCard 
                  onClick={() => setShowAddBatch(true)} 
                  icon={<Plus className="text-white" size={24} />} 
                  label="নতুন ব্যাচ" 
                  desc="নতুন সাইকেল শুরু" 
                  color="bg-slate-800"
                />
              </div>

              {!selectedBatchId ? (
                <div className="bg-white p-12 md:p-20 rounded-[32px] md:rounded-[48px] border-2 border-dashed border-slate-200 text-center">
                   <Package size={40} className="mx-auto mb-6 text-indigo-600" />
                   <h3 className="text-xl md:text-3xl font-black mb-4 text-slate-800">কোন ব্যাচ নির্বাচন করা হয়নি</h3>
                   <button onClick={() => setShowAddBatch(true)} className="bg-indigo-600 text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-[24px] font-black text-base md:text-lg shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto">
                     <Plus size={24}/> নতুন ব্যাচ শুরু করুন
                   </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatsCard label="মোট বাচ্চা" value={currentBatch?.chickCount || 0} unit="পিস" color="indigo" icon={<Package size={20}/>} subtitle={`${currentBatch?.chickRate}৳`} />
                  <StatsCard label="মৃত্যু" value={currentBatch?.dailyEntries.reduce((a, b) => a + b.mortality, 0) || 0} unit="পিস" color="rose" icon={<AlertCircle size={20}/>}/>
                  <StatsCard label="খাদ্য" value={calculations?.feedSacks || 0} unit="বস্তা" color="amber" icon={<Truck size={20}/>} />
                  <StatsCard label="বিক্রয়" value={calculations?.finalKgSold.toFixed(1) || '0.0'} unit="কেজি" color="emerald" icon={<TrendingUp size={20}/>}/>
                </div>
              )}
            </div>
          )}

          {activeTab === 'daily' && currentBatch && (
            <div className="space-y-6">
              {/* Settings Form Grid */}
              <div className={`bg-white p-5 md:p-6 rounded-3xl md:rounded-[32px] shadow-xl border border-slate-100 grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 ${currentBatch.isCompleted ? 'opacity-70 pointer-events-none' : ''}`}>
                <InputContainer label="আসার তারিখ" icon={<Calendar size={12}/>}><input type="date" value={currentBatch.startDate} onChange={e => updateBatch({ startDate: e.target.value })} className="w-full bg-slate-50 rounded-xl p-3 text-xs md:text-sm font-bold"/></InputContainer>
                <InputContainer label="কোম্পানি" icon={<Building2 size={12}/>}><input type="text" value={currentBatch.company} onChange={e => updateBatch({ company: e.target.value })} className="w-full bg-slate-50 rounded-xl p-3 text-xs md:text-sm font-bold"/></InputContainer>
                <InputContainer label="ডিলার" icon={<User size={12}/>}><input type="text" value={currentBatch.dealer} onChange={e => updateBatch({ dealer: e.target.value })} className="w-full bg-slate-50 rounded-xl p-3 text-xs md:text-sm font-bold"/></InputContainer>
                <InputContainer label="খাদ্যের ব্র্যান্ড" icon={<Cookie size={12}/>}><input type="text" placeholder="Brand" value={currentBatch.feedName} onChange={e => updateBatch({ feedName: e.target.value })} className="w-full bg-slate-50 rounded-xl p-3 text-xs md:text-sm font-bold"/></InputContainer>
                <InputContainer label="বাচ্চা" icon={<Package size={12}/>}><input type="number" value={currentBatch.chickCount} onChange={e => updateBatch({ chickCount: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-xl p-3 text-xs md:text-sm font-bold"/></InputContainer>
                <InputContainer label="রেট" icon={<Zap size={12}/>}><input type="number" value={currentBatch.chickRate} onChange={e => updateBatch({ chickRate: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 rounded-xl p-3 text-xs md:text-sm font-bold"/></InputContainer>
              </div>

              {/* Daily Log - Mobile Card View vs Desktop Table */}
              <div className="bg-white rounded-3xl md:rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 md:px-8 md:py-6 bg-indigo-600 flex justify-between items-center text-white">
                  <h3 className="font-black text-base md:text-lg">দৈনিক লজ শীট</h3>
                  {!currentBatch.isCompleted && (
                    <button onClick={() => {
                        const newEntry: DailyEntry = {
                          day: currentBatch.dailyEntries.length + 1,
                          date: new Date().toISOString().split('T')[0],
                          feedSacks: 0,
                          feedType: 'Starter',
                          transportCost: 0,
                          mortality: 0,
                          medicine: ''
                        };
                        updateBatch({ dailyEntries: [...currentBatch.dailyEntries, newEntry] });
                      }} className="bg-white text-indigo-600 px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all hover:bg-slate-50">
                      <Plus size={16}/> যুক্ত করুন
                    </button>
                  )}
                </div>

                {/* Mobile View: Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {currentBatch.dailyEntries.length === 0 && (
                    <div className="py-10 text-center text-slate-400 font-bold">এখনও কোনো এন্ট্রি নেই</div>
                  )}
                  {currentBatch.dailyEntries.map((entry, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative ${currentBatch.isCompleted ? 'bg-slate-50' : 'bg-white'}`}>
                       <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-black text-indigo-600">দিন {entry.day}</span>
                          {!currentBatch.isCompleted && (
                            <button onClick={() => { const es = currentBatch.dailyEntries.filter((_, i) => i !== idx); updateBatch({ dailyEntries: es }); }} className="text-red-400 p-1"><Trash2 size={16}/></button>
                          )}
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <InputContainer label="তারিখ" icon={<Calendar size={10}/>}>
                             <input disabled={currentBatch.isCompleted} type="date" value={entry.date} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].date = e.target.value; updateBatch({ dailyEntries: es }); }} className="w-full bg-slate-50 rounded-xl p-2 text-xs font-bold border-none"/>
                          </InputContainer>
                          <InputContainer label="খাদ্য ধরন" icon={<Cookie size={10}/>}>
                             <select disabled={currentBatch.isCompleted} value={entry.feedType} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].feedType = e.target.value; updateBatch({ dailyEntries: es }); }} className="w-full bg-slate-50 rounded-xl p-2 text-xs font-bold border-none">
                                <option value="Starter">Starter</option>
                                <option value="Grower">Grower</option>
                             </select>
                          </InputContainer>
                          <InputContainer label="খাদ্য (বস্তা)" icon={<Box size={10}/>}>
                             <input disabled={currentBatch.isCompleted} type="number" value={entry.feedSacks} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].feedSacks = parseInt(e.target.value) || 0; updateBatch({ dailyEntries: es }); }} className="w-full bg-slate-50 rounded-xl p-2 text-xs font-bold border-none"/>
                          </InputContainer>
                          <InputContainer label="মৃত্যু" icon={<AlertCircle size={10}/>}>
                             <input disabled={currentBatch.isCompleted} type="number" value={entry.mortality} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].mortality = parseInt(e.target.value) || 0; updateBatch({ dailyEntries: es }); }} className="w-full bg-rose-50 rounded-xl p-2 text-xs font-bold border-none text-red-600"/>
                          </InputContainer>
                       </div>
                       <InputContainer label="পরিবহন ও মেডিসিন নোট" icon={<Truck size={10}/>}>
                          <input disabled={currentBatch.isCompleted} type="text" placeholder="নোট লিখুন..." value={entry.medicine} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].medicine = e.target.value; updateBatch({ dailyEntries: es }); }} className="w-full bg-slate-50 rounded-xl p-2 text-xs font-bold border-none"/>
                       </InputContainer>
                    </div>
                  ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] border-b">
                        <th className="p-4 text-center">দিন</th>
                        <th className="p-4">তারিখ</th>
                        <th className="p-4">খাদ্যের ধরন</th>
                        <th className="p-4 text-center">খাদ্য (বস্তা)</th>
                        <th className="p-4 text-center">পরিবহন (৳)</th>
                        <th className="p-4 text-center">মৃত্যু</th>
                        <th className="p-4">নোট</th>
                        {!currentBatch.isCompleted && <th className="p-4 text-center">অ্যাকশন</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentBatch.dailyEntries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/20">
                          <td className="p-4 text-center font-black text-indigo-600">{entry.day}</td>
                          <td className="p-2"><input disabled={currentBatch.isCompleted} type="date" value={entry.date} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].date = e.target.value; updateBatch({ dailyEntries: es }); }} className="w-full bg-white border border-slate-200 rounded p-2 disabled:bg-slate-50"/></td>
                          <td className="p-2">
                            <select disabled={currentBatch.isCompleted} value={entry.feedType} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].feedType = e.target.value; updateBatch({ dailyEntries: es }); }} className="w-full bg-white border border-slate-200 rounded p-2 font-bold focus:border-indigo-500 outline-none appearance-none cursor-pointer disabled:bg-slate-50">
                              <option value="Starter">Starter</option>
                              <option value="Grower">Grower</option>
                            </select>
                          </td>
                          <td className="p-2"><input disabled={currentBatch.isCompleted} type="number" value={entry.feedSacks} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].feedSacks = parseInt(e.target.value) || 0; updateBatch({ dailyEntries: es }); }} className="w-20 mx-auto bg-white border border-slate-200 rounded p-2 text-center disabled:bg-slate-50"/></td>
                          <td className="p-2"><input disabled={currentBatch.isCompleted} type="number" value={entry.transportCost} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].transportCost = parseInt(e.target.value) || 0; updateBatch({ dailyEntries: es }); }} className="w-24 mx-auto bg-white border border-slate-200 rounded p-2 text-center disabled:bg-slate-50"/></td>
                          <td className="p-2"><input disabled={currentBatch.isCompleted} type="number" value={entry.mortality} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].mortality = parseInt(e.target.value) || 0; updateBatch({ dailyEntries: es }); }} className="w-20 mx-auto bg-white border border-slate-200 rounded p-2 text-center text-red-600 disabled:bg-slate-50"/></td>
                          <td className="p-2"><input disabled={currentBatch.isCompleted} type="text" value={entry.medicine} onChange={e => { const es = [...currentBatch.dailyEntries]; es[idx].medicine = e.target.value; updateBatch({ dailyEntries: es }); }} className="w-full bg-white border border-slate-200 rounded p-2 disabled:bg-slate-50"/></td>
                          {!currentBatch.isCompleted && (
                            <td className="p-4 text-center">
                              <button onClick={() => { const es = currentBatch.dailyEntries.filter((_, i) => i !== idx); updateBatch({ dailyEntries: es }); }} className="text-slate-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && currentBatch && (
            <div className={currentBatch.isCompleted ? 'opacity-80 pointer-events-none' : ''}>
              <WeighingGrid data={currentBatch.weighingData} onChange={(c, r, v) => { if(currentBatch.isCompleted) return; const nd = [...currentBatch.weighingData]; nd[c][r] = v; updateBatch({ weighingData: nd }); }} onAddColumn={handleAddWeighingColumn} onRemoveColumn={handleRemoveWeighingColumn} returnedKg={currentBatch.returnedKg} returnedPiece={currentBatch.returnedPiece} stockKg={currentBatch.stockKg} stockPiece={currentBatch.stockPiece} stockRate={currentBatch.stockRate} weightUnit={currentBatch.weightUnit || 'KG'} pieceUnit={currentBatch.pieceUnit || 'Piece'} onUpdateReturn={(kg, piece) => { if(currentBatch.isCompleted) return; updateBatch({ returnedKg: kg, returnedPiece: piece }); }} onUpdateStock={(kg, piece, rate) => { if(currentBatch.isCompleted) return; updateBatch({ stockKg: kg, stockPiece: piece, stockRate: rate }); }} onUpdateUnits={(w, p) => { if(currentBatch.isCompleted) return; updateBatch({ weightUnit: w, pieceUnit: p }); }} />
            </div>
          )}

          {activeTab === 'settlement' && calculations && currentBatch && (
            <div className="space-y-6 md:space-y-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                <SummaryMetric label="মোট বিক্রয় (কেজি)" value={calculations.finalKgSold.toFixed(2)} icon={<TrendingUp size={16}/>}/>
                <SummaryMetric label="মোট পিস" value={calculations.piecesSold} icon={<Users size={16}/>}/>
                <SummaryMetric label="গড় ওজন" value={calculations.avgWeight.toFixed(3)} icon={<Calculator size={16}/>}/>
                <SummaryMetric label="পয়েন্ট" value={calculations.points.toFixed(2)} icon={<AlertCircle size={16}/>}/>
              </div>

              <div className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[40px] shadow-2xl border-t-[8px] md:border-t-[12px] border-indigo-600 relative">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 md:gap-8 mb-8 md:mb-10">
                   <div>
                     <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-1 leading-none text-slate-900">৳ {calculations.farmer.netProfit.toLocaleString()}</h2>
                     <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] md:text-xs">নিট খামারির লভ্যাংশ</p>
                   </div>
                   
                   {role === UserRole.DEALER && (
                     <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full xl:w-auto">
                        <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 flex items-center justify-between gap-6">
                           <div className="flex flex-col">
                              <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">মরা বাচ্চার খরচ</span>
                              <span className={`text-[10px] md:text-xs font-bold ${currentBatch.applyMortalityCharge ? 'text-indigo-600' : 'text-slate-400'}`}>
                                {currentBatch.applyMortalityCharge ? 'কর্তন চালু' : 'কর্তন বন্ধ'}
                              </span>
                           </div>
                           <button 
                             disabled={currentBatch.isCompleted}
                             onClick={() => updateBatch({ applyMortalityCharge: !currentBatch.applyMortalityCharge })}
                             className={`w-12 md:w-14 h-6 md:h-8 rounded-full p-1 transition-all ${currentBatch.applyMortalityCharge ? 'bg-indigo-600' : 'bg-slate-300'} ${currentBatch.isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                           >
                             <div className={`bg-white w-4 h-4 md:w-6 md:h-6 rounded-full shadow-md transition-all ${currentBatch.applyMortalityCharge ? 'translate-x-6' : 'translate-x-0'}`}></div>
                           </button>
                        </div>
                        
                        <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 transition-all w-full sm:w-auto ${currentBatch.isCompleted ? 'bg-slate-100 border-slate-200' : 'bg-emerald-50 border-emerald-100'}`}>
                           <div className="flex flex-col min-w-[120px]">
                              <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">ব্যাচ স্ট্যাটাস</span>
                              {currentBatch.isCompleted ? (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-1"><Lock size={12}/> ব্যাচ বন্ধ</span>
                                  <input 
                                    type="date" 
                                    value={currentBatch.endDate || ''} 
                                    onChange={(e) => updateBatch({ endDate: e.target.value })}
                                    className="text-[10px] font-black p-1.5 rounded-lg bg-white border border-slate-200 outline-none w-full"
                                  />
                                </div>
                              ) : (
                                <span className="text-[10px] md:text-xs font-bold text-emerald-600 flex items-center gap-1"><Unlock size={12}/> ব্যাচ সচল</span>
                              )}
                           </div>
                           
                           <div className="flex gap-2 w-full sm:w-auto">
                              {!currentBatch.isCompleted && (
                                <div className="flex flex-col gap-1 flex-1">
                                  <span className="text-[8px] font-black uppercase text-slate-400">শেষ তারিখ</span>
                                  <input 
                                    type="date" 
                                    className="text-[10px] font-black p-2 rounded-xl bg-white border border-emerald-200 outline-none w-full"
                                    value={currentBatch.endDate || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => updateBatch({ endDate: e.target.value })}
                                  />
                                </div>
                              )}
                              <button 
                                onClick={toggleBatchCompletion}
                                className={`flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all shadow-md h-fit mt-auto flex-1 sm:flex-none ${currentBatch.isCompleted ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                              >
                                {currentBatch.isCompleted ? <Unlock size={14}/> : <Lock size={14}/>}
                                {currentBatch.isCompleted ? 'পুনরায় খুলুন' : 'ব্যাচ ক্লোজ'}
                              </button>
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-6 md:pt-10 border-t border-slate-100">
                   <div className="bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">মৃত্যু (৪% ফ্রি)</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl md:text-2xl font-black text-slate-800">{calculations.farmer.mortalityTotal}</span>
                        <span className="text-[10px] md:text-xs font-bold text-slate-400">/ ফ্রি: {calculations.farmer.mortalityFree}</span>
                      </div>
                      {calculations.farmer.mortalityChargeable > 0 && (
                        <p className="text-[9px] md:text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">চার্জ: {calculations.farmer.mortalityChargeable} পিস</p>
                      )}
                   </div>
                   <div className="bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">মরা বাচ্চার চার্জ</p>
                      <p className={`text-xl md:text-2xl font-black ${currentBatch.applyMortalityCharge && calculations.farmer.mortalityCost > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                        ৳ {calculations.farmer.mortalityCost.toLocaleString()}
                      </p>
                   </div>
                   <div className="bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">স্টক কেজির মূল্য</p>
                      <p className="text-xl md:text-2xl font-black text-slate-800">৳ {calculations.farmer.stockValue.toLocaleString()}</p>
                   </div>
                </div>
              </div>

              {role === UserRole.DEALER && (
                <div className="bg-slate-900 p-6 md:p-12 rounded-[32px] md:rounded-[40px] text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp size={160} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-8 flex items-center gap-3 relative z-10">
                    <TrendingUp size={24} className="text-indigo-400"/> ডিলার লাভ-ক্ষতি বিশ্লেষণ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
                    <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 mb-2">বাজার রেভিনিউ</p>
                      <p className="text-2xl md:text-3xl font-black text-indigo-400">৳ {(calculations.finalKgSold * currentBatch.marketRate).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/50 p-5 rounded-3xl border border-slate-700/50">
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 mb-2">মোট ডিলার খরচ</p>
                      <p className="text-2xl md:text-3xl font-black text-slate-300">৳ {( (currentBatch.chickCount * currentBatch.chickRate) + (calculations.feedSacks * currentBatch.feedCostPerSack) + currentBatch.medicineCost + calculations.farmer.netProfit ).toLocaleString()}</p>
                    </div>
                    <div className="bg-indigo-600/10 p-5 rounded-3xl border border-indigo-500/30">
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-indigo-300 mb-2">নিট ডিলার প্রফিট</p>
                      <p className="text-2xl md:text-3xl font-black text-emerald-400">৳ {calculations.dealerProfit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'batch-list' && (
            <div className="space-y-6 md:space-y-8">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl md:text-3xl font-black text-slate-900">সকল ব্যাচ</h3>
                 <button onClick={() => setShowAddBatch(true)} className="bg-indigo-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg text-sm transition-all hover:scale-105 active:scale-95"><Plus size={18}/> নতুন ব্যাচ</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                 {farmerBatches.map(b => (
                   <div key={b.id} onClick={() => { setSelectedBatchId(b.id); setActiveTab('dashboard'); }} className={`p-6 md:p-8 rounded-[30px] md:rounded-[40px] border-2 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden ${selectedBatchId === b.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-sm'}`}>
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg md:text-2xl font-black truncate max-w-[70%]">{b.batchName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest ${b.isCompleted ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {b.isCompleted ? 'বন্ধ' : 'সচল'}
                        </span>
                     </div>
                     <p className={`text-xs font-bold ${selectedBatchId === b.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                        শুরু: {b.startDate} {b.endDate ? `| শেষ: ${b.endDate}` : ''}
                     </p>
                     <div className="mt-6 flex justify-between">
                        <div><p className={`text-[9px] md:text-[10px] uppercase font-black opacity-50`}>বাচ্চা</p><p className="font-black text-sm md:text-base">{b.chickCount}</p></div>
                        <div><p className={`text-[9px] md:text-[10px] uppercase font-black opacity-50`}>কোম্পানি</p><p className="font-black text-sm md:text-base truncate max-w-[80px] md:max-w-[100px]">{b.company}</p></div>
                     </div>
                   </div>
                 ))}
                 {farmerBatches.length === 0 && (
                   <div className="col-span-full py-16 text-center bg-slate-50 rounded-[30px] border-2 border-dashed border-slate-200">
                     <p className="font-bold text-slate-400">কোনো ব্যাচ পাওয়া যায়নি।</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && activeFarmer && (
            <div className="max-w-3xl mx-auto pb-10">
               <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-xl border border-slate-100 space-y-6 md:space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 border-b pb-8 md:pb-10">
                    <img src={activeFarmer.profilePic || DEFAULT_FARMER_PIC} className="w-24 h-24 md:w-32 md:h-32 rounded-[28px] md:rounded-[32px] object-cover shadow-2xl border-4 border-white" alt=""/>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900">{activeFarmer.name}</h3>
                      <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 text-sm md:text-base mt-1"><MapPin size={18} className="text-indigo-500"/> {activeFarmer.location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                    <ProfileField label="ফার্মের নাম" value={activeFarmer.name} icon={<Users size={24}/>} />
                    <ProfileField label="মোবাইল নম্বর" value={activeFarmer.mobile || 'ব্যবহৃত হয়নি'} icon={<Phone size={24}/>} />
                    <ProfileField label="ঠিকানা" value={activeFarmer.location} icon={<MapPin size={24}/>} />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && role === UserRole.DEALER && (
             <div className="max-w-4xl mx-auto pb-10">
               <Settings ladder={rateLadder} setLadder={setRateLadder} />
             </div>
          )}
        </div>
      </main>

      {/* New Batch Modal */}
      {showAddBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] md:rounded-[48px] p-6 md:p-12 shadow-2xl relative max-h-[95vh] overflow-y-auto">
            <button onClick={() => setShowAddBatch(false)} className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-400"><X size={28}/></button>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 md:mb-8">নতুন ব্যাচ এন্ট্রি</h2>
            <div className="space-y-5 md:space-y-6">
              <InputContainer label="ব্যাচের নাম"><input type="text" className="w-full bg-slate-50 rounded-2xl md:rounded-[20px] p-4 font-bold outline-none border-none" placeholder={`উদা: ব্যাচ ${farmerBatches.length + 1}`} value={batchForm.batchName} onChange={e => setBatchForm({...batchForm, batchName: e.target.value})} /></InputContainer>
              <div className="grid grid-cols-2 gap-4">
                <InputContainer label="বাচ্চা সংখ্যা"><input type="number" className="w-full bg-slate-50 rounded-2xl md:rounded-[20px] p-4 font-bold outline-none border-none" value={batchForm.chickCount} onChange={e => setBatchForm({...batchForm, chickCount: parseInt(e.target.value) || 0})} /></InputContainer>
                <InputContainer label="বাচ্চার রেট"><input type="number" className="w-full bg-slate-50 rounded-2xl md:rounded-[20px] p-4 font-bold outline-none border-none" value={batchForm.chickRate} onChange={e => setBatchForm({...batchForm, chickRate: parseFloat(e.target.value) || 0})} /></InputContainer>
              </div>
              <InputContainer label="কোম্পানি"><input type="text" className="w-full bg-slate-50 rounded-2xl md:rounded-[20px] p-4 font-bold outline-none border-none" value={batchForm.company} onChange={e => setBatchForm({...batchForm, company: e.target.value})} /></InputContainer>
              <InputContainer label="শুরুর তারিখ"><input type="date" className="w-full bg-slate-50 rounded-2xl md:rounded-[20px] p-4 font-bold outline-none border-none" value={batchForm.startDate} onChange={e => setBatchForm({...batchForm, startDate: e.target.value})} /></InputContainer>
              <button onClick={handleStartNewBatch} className="w-full bg-indigo-600 text-white py-5 md:py-6 rounded-[24px] md:rounded-[32px] font-black text-lg md:text-xl shadow-2xl hover:bg-indigo-700 transition-all active:scale-95">ব্যাচ কনফার্ম করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderNavItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2.5 px-6 py-3 rounded-[16px] transition-all relative ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
    {icon} <span className="font-black text-xs uppercase tracking-widest">{label}</span>
  </button>
);

const MobileMenuItem = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl font-black text-sm transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
    {icon} <span>{label}</span>
  </button>
);

const QuickActionCard = ({ onClick, icon, label, desc, color, disabled }: any) => (
  <button onClick={onClick} disabled={disabled} className={`group flex flex-col items-center text-center p-5 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm transition-all relative overflow-hidden ${disabled ? 'opacity-40 grayscale cursor-not-allowed bg-slate-50' : 'bg-white hover:shadow-xl hover:-translate-y-1'}`}>
    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] flex items-center justify-center mb-3 md:mb-4 shadow-lg ${color}`}>{icon}</div>
    <span className="font-black text-xs md:text-base text-slate-800 mb-1">{label}</span>
    <span className="hidden sm:block text-[9px] md:text-xs font-bold text-slate-400">{desc}</span>
  </button>
);

const StatsCard = ({ label, value, unit, color, icon, subtitle }: any) => {
  const iconColors: any = { indigo: 'bg-indigo-50 text-indigo-600', rose: 'bg-rose-50 text-rose-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600' }
  return (
    <div className="p-4 md:p-8 rounded-2xl md:rounded-[35px] border border-slate-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-xl bg-white relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${iconColors[color]}`}>{icon}</div>
        {subtitle && <span className="text-[7px] md:text-[9px] font-black uppercase text-slate-400 tracking-wider bg-slate-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md">{subtitle}</span>}
      </div>
      <div>
        <p className="text-[8px] md:text-[10px] uppercase font-black text-slate-400 mb-1 md:mb-2 tracking-[0.1em] md:tracking-[0.15em]">{label}</p>
        <div className="flex items-baseline gap-1 md:gap-2"><span className="text-xl md:text-4xl font-black tracking-tighter text-slate-900">{value}</span><span className="text-[8px] md:text-xs font-black text-slate-300 uppercase tracking-widest">{unit}</span></div>
      </div>
    </div>
  );
};

const SummaryMetric = ({ label, value, icon }: any) => (
  <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[28px] border border-slate-200 shadow-sm transition-all hover:border-indigo-100">
    <div className="flex items-center gap-2 md:gap-3 text-slate-400 mb-2 md:mb-3"><div className="p-1.5 md:p-2 bg-slate-50 rounded-lg md:rounded-xl">{icon}</div><span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">{label}</span></div>
    <div className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">{value}</div>
  </div>
);

const InputContainer = ({ label, icon, children }: any) => (
  <div className="flex flex-col"><label className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 tracking-widest flex items-center gap-1.5 px-1">{icon} {label}</label>{children}</div>
);

const ProfileField = ({ label, value, icon }: any) => (
  <div className="bg-slate-50 p-5 md:p-8 rounded-2xl md:rounded-[28px] border border-slate-100 flex items-center justify-between transition-all hover:bg-slate-100/50">
    <div><p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">{label}</p><p className="text-base md:text-xl font-bold text-slate-800">{value}</p></div>
    <div className="text-slate-300">{icon}</div>
  </div>
);

export default App;
