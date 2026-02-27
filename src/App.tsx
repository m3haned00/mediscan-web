import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Plus, Pill, ShieldAlert, Search, 
  Trash2, Settings, Moon, Sun, ChevronLeft,
  FileText, Activity, X, AlertTriangle, CheckCircle2, Printer
} from 'lucide-react';

// استدعاء الخدمات المحدثة (تأكد أن ملف geminiService يحتوي على كود Groq الذي أرسلته لك سابقاً)
import { analyzeInteractions, searchDrugInfo, type Drug } from "./lib/services/geminiService";

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // تحديث الثيم (Dark/Light Mode)
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // إضافة دواء جديد
  const handleAddDrug = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const info = await searchDrugInfo(searchQuery);
      if (info && info.name) {
        const newDrug = { ...info, id: Date.now() } as Drug;
        setDrugs(prev => [...prev, newDrug]);
        setSearchQuery('');
        setShowAddModal(false);
      } else {
        alert("لم يتم العثور على معلومات دقيقة لهذا الدواء.");
      }
    } catch (error) {
      console.error("Error adding drug:", error);
    } finally {
      setLoading(false);
    }
  };

  // تشغيل تحليل التفاعلات
  const handleRunAnalysis = async () => {
    if (drugs.length < 2) {
      alert("يرجى إضافة دواءين على الأقل لإجراء التحليل.");
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeInteractions(drugs);
      setAnalysisResult(result);
      setActiveTab('interactions');
    } catch (error) {
      alert("حدث خطأ أثناء التحليل. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDrug = (id: number) => {
    setDrugs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} font-sans`} dir="rtl">
      
      {/* Sidebar القائمة الجانبية */}
      <aside className={`w-72 border-l ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} p-6 flex flex-col gap-4 shadow-sm`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Pill size={28} />
          </div>
          <h1 className="text-2xl font-black text-emerald-600 tracking-tight">MediScan</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="الرئيسية" />
          <NavItem active={activeTab === 'cabinet'} onClick={() => setActiveTab('cabinet')} icon={<Pill size={20}/>} label="خزانة الأدوية" />
          <NavItem active={activeTab === 'interactions'} onClick={() => setActiveTab('interactions')} icon={<ShieldAlert size={20}/>} label="التحليلات" />
          <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={20}/>} label="التقارير" />
        </nav>

        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
          <Settings size={20} /> <span className="font-bold">الإعدادات</span>
        </button>
      </aside>

      {/* Main Content المحتوى الرئيسي */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-extrabold mb-1">
              {activeTab === 'dashboard' && 'الرئيسية'}
              {activeTab === 'cabinet' && 'خزانة الأدوية'}
              {activeTab === 'interactions' && 'تحليل التفاعلات'}
              {activeTab === 'reports' && 'التقارير الطبية'}
              {activeTab === 'settings' && 'الإعدادات'}
            </h2>
            <p className="text-slate-400 font-medium">نظام MediScan الذكي لسلامتك الدوائية.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 font-bold transition-all active:scale-95">
            <Plus size={20} /> إضافة دواء
          </button>
        </header>

        {/* --- الأقسام --- */}
        
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 space-y-6">
              <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">الأدوية المضافة حديثاً</h3>
                  <button onClick={() => setActiveTab('cabinet')} className="text-emerald-500 font-bold text-sm flex items-center gap-1">عرض الخزانة <ChevronLeft size={16}/></button>
                </div>
                <div className="space-y-4">
                  {drugs.length === 0 ? <EmptyState /> : drugs.slice(0, 3).map(drug => <DrugRow key={drug.id} drug={drug} onDelete={deleteDrug}/>)}
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-3">فحص التفاعلات</h3>
                <p className="text-emerald-100 text-sm mb-8 leading-relaxed">هل تتناول أكثر من دواء؟ دع الذكاء الاصطناعي يتأكد من سلامتك الآن.</p>
                <button onClick={handleRunAnalysis} className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-50 transition-colors">بدء التحليل الآن</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cabinet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drugs.length === 0 ? <div className="col-span-full py-20"><EmptyState /></div> : drugs.map(drug => (
              <div key={drug.id} className={`p-6 rounded-[2rem] relative group transition-all hover:shadow-md ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border border-slate-100 shadow-sm'}`}>
                <button onClick={() => deleteDrug(drug.id!)} className="absolute top-4 left-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Pill size={24}/></div>
                <h4 className="font-bold text-xl mb-1">{drug.name}</h4>
                <p className="text-emerald-500 font-bold text-xs mb-4 uppercase tracking-wider">{drug.active_ingredient}</p>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-300 leading-relaxed italic">
                  {drug.warnings || "لا توجد تحذيرات مسجلة."}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="max-w-3xl mx-auto">
            {!analysisResult ? (
              <div className="text-center py-20 opacity-40">
                <ShieldAlert size={80} className="mx-auto mb-4" />
                <h3 className="text-2xl font-bold">جاهز للتحليل</h3>
                <p>أضف الأدوية واضغط على "بدء التحليل" في الرئيسية</p>
              </div>
            ) : (
              <div className={`p-10 rounded-[3rem] ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-2xl border border-slate-100'}`}>
                <div className="flex items-center gap-6 mb-10">
                  <div className={`p-5 rounded-[1.5rem] shadow-lg ${analysisResult.severity === 'high' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {analysisResult.severity === 'high' ? <AlertTriangle size={40}/> : <CheckCircle2 size={40}/>}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black mb-1">نتيجة الفحص الذكي</h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${analysisResult.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {analysisResult.severity === 'high' ? 'تفاعل خطير' : 'آمن تماماً'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-7 rounded-[2rem] bg-slate-50 dark:bg-slate-700/40">
                    <h4 className="font-black mb-3 flex items-center gap-2 text-slate-400"><Activity size={20}/> ما الذي يحدث؟</h4>
                    <p className="text-lg leading-relaxed">{analysisResult.description}</p>
                  </div>
                  <div className={`p-7 rounded-[2rem] border-2 ${analysisResult.severity === 'high' ? 'border-red-100 bg-red-50/30' : 'border-emerald-100 bg-emerald-50/30'}`}>
                    <h4 className="font-black mb-3 flex items-center gap-2"><ShieldAlert size={20}/> نصيحة الخبير:</h4>
                    <p className="font-bold text-lg">{analysisResult.recommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
           <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                   <FileText className="text-emerald-500" size={32} />
                   <h3 className="text-2xl font-black">تقرير الحالة الدوائية</h3>
                </div>
                <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold hover:bg-slate-800 transition-all">
                  <Printer size={20} /> طباعة التقرير
                </button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                      <p className="text-slate-400 text-sm mb-1">إجمالي الأدوية</p>
                      <p className="text-3xl font-black text-emerald-500">{drugs.length}</p>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                      <p className="text-slate-400 text-sm mb-1">حالة التفاعل</p>
                      <p className="text-xl font-black">{analysisResult ? (analysisResult.severity === 'high' ? '⚠️ يحتاج حذر' : '✅ مستقر') : 'لا يوجد تحليل'}</p>
                   </div>
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-bold mb-4">قائمة الأدوية النشطة:</h4>
                  <div className="divide-y dark:divide-slate-700">
                    {drugs.map((d, i) => (
                      <div key={i} className="py-4 flex justify-between">
                        <span className="font-bold">{d.name}</span>
                        <span className="text-slate-400 italic">{d.active_ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm">
            <h3 className="text-2xl font-bold mb-8">الإعدادات</h3>
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-700 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-600 shadow-sm rounded-xl flex items-center justify-center text-emerald-500">
                  {isDarkMode ? <Moon /> : <Sun />}
                </div>
                <span className="font-bold text-lg">الوضع الليلي</span>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-16 h-9 rounded-full transition-all relative ${isDarkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isDarkMode ? 'left-1.5' : 'left-8.5'}`}></div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal - البحث والإضافة */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
            <div className="p-12">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black">إضافة دواء</h3>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={24}/></button>
              </div>
              <div className="relative mb-8">
                <Search className="absolute right-5 top-5 text-emerald-500" size={24}/>
                <input 
                  type="text"
                  placeholder="ابحث عن اسم الدواء (مثال: Aspirin)..."
                  className={`w-full pr-14 pl-6 py-6 rounded-3xl border-2 outline-none focus:border-emerald-500 transition-all text-xl font-bold ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-100'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDrug()}
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <button onClick={handleAddDrug} className="flex-[2] bg-emerald-500 text-white py-5 rounded-[1.5rem] font-black text-xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">إضافة للخزانة</button>
                <button onClick={() => setShowAddModal(false)} className={`flex-1 py-5 rounded-[1.5rem] font-bold ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100 text-slate-500'}`}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-white">
          <div className="w-20 h-20 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8 shadow-emerald-500/50"></div>
          <p className="text-3xl font-black animate-pulse tracking-widest uppercase">جاري المعالجة...</p>
          <p className="mt-4 text-emerald-400 font-bold italic">MediScan AI is Thinking</p>
        </div>
      )}
    </div>
  );
}

// مكونات صغيرة (Sub-components)
function NavItem({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold group ${active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
      <span className={`${active ? 'text-white' : 'group-hover:text-emerald-500'} transition-colors`}>{icon}</span>
      <span className="text-lg">{label}</span>
    </button>
  );
}

function DrugRow({ drug, onDelete }: any) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-3xl transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 bg-slate-50 dark:bg-slate-700/30`}>
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><Pill size={28}/></div>
        <div>
          <p className="font-black text-xl">{drug.name}</p>
          <p className="text-sm text-emerald-500 font-bold tracking-widest uppercase opacity-70">{drug.active_ingredient}</p>
        </div>
      </div>
      <button onClick={() => onDelete(drug.id)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-10 text-slate-300 dark:text-slate-600">
      <div className="relative mb-6">
        <Pill size={100} className="opacity-10" />
        <Search size={40} className="absolute bottom-0 right-0 opacity-20" />
      </div>
      <p className="font-black text-2xl">خزانة الأدوية فارغة</p>
      <p className="text-sm mt-2 font-medium">ابدأ بإضافة الأدوية التي تتناولها حالياً.</p>
    </div>
  );
}