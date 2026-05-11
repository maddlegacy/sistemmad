import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Smartphone, 
  ClipboardList, 
  Package, 
  Receipt, 
  Search, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Trash2, 
  Edit,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Tab = 'dashboard' | 'booking' | 'inventory' | 'iphone-sales' | 'finance' | 'search';

interface Transaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT';
  category: string;
  description: string;
  amount: number;
}

interface PhoneUnit {
  id: string;
  model: string;
  imei: string;
  condition: 'Baru' | 'Terpakai (Like New)' | 'Terpakai (Calar)';
  costPrice: number;
  askingPrice: number;
  status: 'In Stock' | 'Sold';
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  costPerUnit: number;
  sellPrice: number;
}

interface Booking {
  id: string;
  date: string;
  customerName: string;
  phoneNum: string;
  device: string;
  issue: string;
  estimatedCost: number;
  status: 'Menunggu' | 'Dalam Proses' | 'Selesai' | 'Dibatalkan';
}

// --- App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [phones, setPhones] = useState<PhoneUnit[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // States for simplified demo
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);

  // Calculate Balances
  const totalBalance = useMemo(() => revenue - expenses, [revenue, expenses]);

  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem('madgadget_data_v2');
    if (saved) {
      const data = JSON.parse(saved);
      setTransactions(data.transactions || []);
      setPhones(data.phones || []);
      setInventory(data.inventory || []);
      setBookings(data.bookings || []);
      setRevenue(data.revenue || 0);
      setExpenses(data.expenses || 0);
    } else {
      // Mock Data
      setTransactions([
        { id: '1', date: '2024-05-10', type: 'IN', category: 'Repair', description: 'Repair LCD iPhone 13', amount: 350 },
      ]);
      setPhones([
        { id: 'P1', model: 'iPhone 15 Pro Max', imei: '1234567890', condition: 'Baru', costPrice: 4800, askingPrice: 5200, status: 'In Stock' }
      ]);
      setInventory([
        { id: 'S1', name: 'Original Screen iPhone 13', category: 'Screen', quantity: 5, minStock: 2, costPerUnit: 180, sellPrice: 350 }
      ]);
    }
  }, []);

  // Sync to Storage
  useEffect(() => {
    localStorage.setItem('madgadget_data_v2', JSON.stringify({ transactions, phones, inventory, bookings, revenue, expenses }));
  }, [transactions, phones, inventory, bookings, revenue, expenses]);

  const addTransaction = (type: 'IN' | 'OUT', amount: number, desc: string, cat: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      type,
      amount,
      description: desc,
      category: cat
    };
    setTransactions([newTx, ...transactions]);
    if (type === 'IN') setRevenue(prev => prev + amount);
    else setExpenses(prev => prev + amount);
  };

  const sellPhone = (id: string) => {
    const phone = phones.find(p => p.id === id);
    if (!phone || phone.status === 'Sold') return;
    
    setPhones(phones.map(p => p.id === id ? { ...p, status: 'Sold' } : p));
    addTransaction('IN', phone.askingPrice, `Jual ${phone.model} (${phone.imei})`, 'Phone Sale');
  };

  const restockItem = (id: string, qty: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    const totalCost = item.costPerUnit * qty;
    
    setInventory(inventory.map(i => i.id === id ? { ...i, quantity: i.quantity + qty } : i));
    addTransaction('OUT', totalCost, `Restock ${item.name} (x${qty})`, 'Stock Purchase');
  };

  const updateBookingStatus = (id: string, newStatus: Booking['status']) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    // If changing to 'Selesai' for the first time, record revenue
    if (newStatus === 'Selesai' && booking.status !== 'Selesai') {
      addTransaction('IN', booking.estimatedCost, `Repair Selesai: ${booking.device} (${booking.customerName})`, 'Repair');
    }

    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center gap-2 p-4 bg-[#1e293b] border-b border-[#334155] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 pr-6 border-r border-[#334155] shrink-0">
          <span className="text-xl">🔧</span>
          <h1 className="text-lg font-bold tracking-tight">MAD<span className="text-orange-500">GADGET</span></h1>
        </div>
        
        <NavTab icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavTab icon={<Smartphone size={18}/>} label="Beli/Jual iPhone" active={activeTab === 'iphone-sales'} onClick={() => setActiveTab('iphone-sales')} />
        <NavTab icon={<ClipboardList size={18}/>} label="Repair Booking" active={activeTab === 'booking'} onClick={() => setActiveTab('booking')} />
        <NavTab icon={<Package size={18}/>} label="Inventori Part" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
        <NavTab icon={<Search size={18}/>} label="Carian" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
        <NavTab icon={<Wallet size={18}/>} label="Duit In/Out" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 mb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <DashboardPage revenue={revenue} expenses={expenses} balance={totalBalance} transactions={transactions.slice(0, 5)} bookings={bookings} />}
          {activeTab === 'iphone-sales' && <IPhonePage phones={phones} sellPhone={sellPhone} addPhone={(p: PhoneUnit) => {
            setPhones([...phones, p]);
            addTransaction('OUT', p.costPrice, `Beli Stok iPhone: ${p.model}`, 'Stock Purchase');
          }} />}
          {activeTab === 'finance' && <FinancePage transactions={transactions} addTx={addTransaction} />}
          {activeTab === 'booking' && (
            <BookingPage 
              bookings={bookings} 
              updateStatus={updateBookingStatus} 
              addBooking={(b: Booking) => setBookings([b, ...bookings])}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryPage 
              inventory={inventory} 
              restock={restockItem} 
              addItem={(item: InventoryItem) => {
                setInventory([...inventory, item]);
                addTransaction('OUT', item.costPerUnit * item.quantity, `Stok Baru: ${item.name}`, 'Stock Purchase');
              }} 
            />
          )}
          {activeTab === 'search' && (
            <SearchPage 
              inventory={inventory} 
              bookings={bookings} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Components ---

function NavTab({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shrink-0 ${
        active 
          ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-lg shadow-orange-500/5' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function DashboardPage({ revenue, expenses, balance, transactions, bookings }: any) {
  const stats = useMemo(() => {
    const selesai = bookings.filter((b: any) => b.status === 'Selesai').length;
    const menunggu = bookings.filter((b: any) => b.status === 'Menunggu').length;
    const proses = bookings.filter((b: any) => b.status === 'Dalam Proses').length;
    const belumSelesai = menunggu + proses;
    return { selesai, menunggu, proses, belumSelesai };
  }, [bookings]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      {/* Kewangan Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI className="border-green-500/20 bg-green-500/5" label="Duit Masuk (Bulan Ini)" value={revenue} color="text-green-400" icon={<ArrowUpCircle className="text-green-500" />} />
        <KPI className="border-red-500/20 bg-red-500/5" label="Duit Keluar (Bulan Ini)" value={expenses} color="text-red-400" icon={<ArrowDownCircle className="text-red-500" />} />
        <KPI className="border-orange-500/20 bg-orange-500/5" label="Baki Kedai" value={balance} color="text-orange-400" icon={<Wallet className="text-orange-500" />} />
      </div>

      {/* Status Repair Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Repair Selesai</p>
          <p className="text-2xl font-black text-green-500">{stats.selesai}</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Sedang Menunggu</p>
          <p className="text-2xl font-black text-yellow-500">{stats.menunggu}</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Dalam Proses</p>
          <p className="text-2xl font-black text-blue-500">{stats.proses}</p>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-xl border border-orange-500/30 text-center bg-orange-500/5">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Belum Selesai</p>
          <p className="text-2xl font-black text-orange-500">{stats.belumSelesai}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Transaksi Terakhir">
          <div className="space-y-3">
            {transactions.length > 0 ? transactions.map((tx: any) => (
              <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'IN' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-slate-500">{tx.category} • {tx.date}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'IN' ? '+' : '-'} RM {tx.amount.toLocaleString()}
                </p>
              </div>
            )) : (
              <p className="text-center text-slate-500 py-10 text-sm italic">Tiada rekod transaksi setakat ini.</p>
            )}
          </div>
        </Card>
        
        <Card title="Ringkasan Kerja">
           <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
              <Smartphone className="text-slate-700 mb-2" size={32} />
              <p className="text-slate-500 text-sm">Dashboard Automatik MADGADGET</p>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Sila layari tab lain untuk mula rekod</p>
           </div>
        </Card>
      </div>
    </motion.div>
  );
}

function IPhonePage({ phones, sellPhone, addPhone }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [printPhone, setPrintPhone] = useState<PhoneUnit | null>(null);
  const [newPhone, setNewPhone] = useState({ model: '', imei: '', cost: 0, sale: 0, condition: 'Terpakai (Like New)' });

  const handleAdd = () => {
    if (!newPhone.model || !newPhone.imei) return;
    addPhone({
      id: Math.random().toString(36).substr(2, 9),
      model: newPhone.model,
      imei: newPhone.imei,
      costPrice: Number(newPhone.cost),
      askingPrice: Number(newPhone.sale),
      condition: newPhone.condition,
      status: 'In Stock'
    });
    setNewPhone({ model: '', imei: '', cost: 0, sale: 0, condition: 'Terpakai (Like New)' });
    setShowAdd(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Stok & Jualan iPhone</h2>
          <p className="text-slate-500 text-sm">Apabila telefon dijual, duit masuk akan direkod automatik.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-bold">
          <Plus size={20} /> Tambah Unit iPhone
        </button>
      </header>

      {showAdd && (
        <Card title="Tambah Rekod iPhone Baru" className="border-orange-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input label="Model" value={newPhone.model} onChange={(v: string) => setNewPhone({...newPhone, model: v})} placeholder="cth: iPhone 13" />
            <Input label="Serial/IMEI" value={newPhone.imei} onChange={(v: string) => setNewPhone({...newPhone, imei: v})} placeholder="cth: C6...XXXX" />
            <div className="space-y-1.5 text-left">
              <label className="text-xs text-slate-500 font-bold ml-1 uppercase tracking-wider">Kondisi</label>
              <select 
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-white focus:border-orange-500 outline-none"
                value={newPhone.condition} 
                onChange={e => setNewPhone({...newPhone, condition: e.target.value as any})}
              >
                <option>Baru</option>
                <option>Terpakai (Like New)</option>
                <option>Terpakai (Calar)</option>
              </select>
            </div>
            <Input label="Kos Beli (RM)" type="number" value={newPhone.cost} onChange={(v: string) => setNewPhone({...newPhone, cost: Number(v)})} />
            <Input label="Harga Jual (RM)" type="number" value={newPhone.sale} onChange={(v: string) => setNewPhone({...newPhone, sale: Number(v)})} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors">Simpan & Rekod Modal</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors">Batal</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {phones.length > 0 ? phones.map((unit: PhoneUnit) => (
          <div key={unit.id} className={`bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden relative ${unit.status === 'Sold' ? 'opacity-60' : 'hover:border-slate-500'}`}>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{unit.model}</h3>
                  <p className="text-xs text-slate-500">IMEI: {unit.imei}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${unit.status === 'Sold' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                  {unit.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-y border-slate-800">
                <span className="text-xs text-slate-400 italic">{unit.condition}</span>
                <span className="text-xl font-black text-orange-500">RM {unit.askingPrice.toLocaleString()}</span>
              </div>

              {unit.status === 'In Stock' ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (confirm('Sahkan jualan unit ini? Duit masuk akan direkod.')) sellPhone(unit.id);
                    }} 
                    className="flex-1 py-2 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-lg transition-all font-bold text-sm"
                  >
                    Rekod Jualan RM {unit.askingPrice.toLocaleString()} ✓
                  </button>
                  <button 
                    onClick={() => setPrintPhone(unit)}
                    className="px-3 py-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-all font-bold"
                    title="Cetak Rekod Pembelian"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 py-2 bg-slate-900/50 text-slate-500 text-center rounded-lg text-xs font-medium">
                    Terjual RM {unit.askingPrice.toLocaleString()}
                  </div>
                  <button 
                    onClick={() => setPrintPhone(unit)}
                    className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-lg transition-all font-bold"
                    title="Cetak Resit Jualan"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-600 italic">Tiada stok telefon untuk dipaparkan.</div>
        )}
      </div>

      <AnimatePresence>
        {printPhone && (
          <PhoneReceiptModal 
            phone={printPhone} 
            onClose={() => setPrintPhone(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BookingPage({ bookings, updateStatus, addBooking }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [printBooking, setPrintBooking] = useState<Booking | null>(null);
  const [newB, setNewB] = useState({ name: '', phone: '', device: '', issue: '', cost: 0 });

  const handleAdd = () => {
    if (!newB.name || !newB.device) return;
    addBooking({
      id: 'BK-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      customerName: newB.name,
      phoneNum: newB.phone,
      device: newB.device,
      issue: newB.issue,
      estimatedCost: Number(newB.cost),
      status: 'Menunggu'
    });
    setNewB({ name: '', phone: '', device: '', issue: '', cost: 0 });
    setShowAdd(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Repair Booking</h2>
          <p className="text-slate-500 text-sm">Status 'Selesai' akan merekod duit masuk secara automatik.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">
          <Plus size={20} /> Booking Baru
        </button>
      </header>

      {showAdd && (
        <Card title="Rekod Booking Repair" className="border-blue-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input label="Nama Pelanggan" value={newB.name} onChange={(v: string) => setNewB({...newB, name: v})} />
            <Input label="No Telefon" value={newB.phone} onChange={(v: string) => setNewB({...newB, phone: v})} />
            <Input label="Model Peranti" value={newB.device} onChange={(v: string) => setNewB({...newB, device: v})} placeholder="cth: iPhone 11" />
            <Input label="Anggaran Harga (RM)" type="number" value={newB.cost} onChange={(v: string) => setNewB({...newB, cost: Number(v)})} />
            <div className="md:col-span-2">
              <Input label="Masalah" value={newB.issue} onChange={(v: string) => setNewB({...newB, issue: v})} placeholder="cth: Skrin Pecah" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 px-6 py-2 rounded-lg font-bold text-sm">Simpan Booking</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-800 px-6 py-2 rounded-lg font-bold text-sm">Batal</button>
          </div>
        </Card>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left bg-[#1e293b]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="p-4 text-xs font-black uppercase text-slate-500">ID / Tarikh</th>
              <th className="p-4 text-xs font-black uppercase text-slate-500">Pelanggan</th>
              <th className="p-4 text-xs font-black uppercase text-slate-500">Peranti & Isu</th>
              <th className="p-4 text-xs font-black uppercase text-slate-500">Status</th>
              <th className="p-4 text-xs font-black uppercase text-slate-500 text-right">Harga</th>
              <th className="p-4 text-xs font-black uppercase text-slate-500 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {bookings.map((b: Booking) => (
              <tr key={b.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="p-4">
                  <p className="text-xs font-bold text-orange-500">{b.id}</p>
                  <p className="text-[10px] text-slate-500">{b.date}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium">{b.customerName}</p>
                  <p className="text-[10px] text-slate-500">{b.phoneNum}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium">{b.device}</p>
                  <p className="text-xs text-slate-400 italic">{b.issue}</p>
                </td>
                <td className="p-4">
                  <select 
                    className={`text-[10px] uppercase font-black px-2 py-1 rounded bg-slate-900 border border-slate-800 focus:outline-none transition-all ${
                      b.status === 'Selesai' ? 'text-green-500 border-green-900' : 
                      b.status === 'Menunggu' ? 'text-yellow-500' : 'text-blue-500'
                    }`}
                    value={b.status} 
                    onChange={(e) => updateStatus(b.id, e.target.value as any)}
                  >
                    <option>Menunggu</option>
                    <option>Dalam Proses</option>
                    <option>Selesai</option>
                    <option>Dibatalkan</option>
                  </select>
                </td>
                <td className="p-4 text-right">
                  <p className="text-sm font-black text-white">RM {b.estimatedCost.toLocaleString()}</p>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => setPrintBooking(b)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                    title="Cetak Invois/Resit"
                  >
                    <Printer size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={6} className="p-10 text-center text-slate-600 italic">Tiada rekod booking repair.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {printBooking && (
          <InvoiceModal 
            booking={printBooking} 
            onClose={() => setPrintBooking(null)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhoneReceiptModal({ phone, onClose }: { phone: PhoneUnit, onClose: () => void }) {
  const handlePrint = () => window.print();
  const isSale = phone.status === 'Sold';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm print:relative print:bg-white print:p-0 print:z-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-white text-slate-900 md:rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none h-full md:h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10 print:hidden">
          <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors">
            ⬅️ Kembali
          </button>
          <h3 className="font-bold text-sm uppercase tracking-wider">{isSale ? 'Resit Penjualan Peranti' : 'Rekod Pembelian Stok'}</h3>
          <button onClick={handlePrint} className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">
            <Printer size={16} /> Cetak / Download PDF
          </button>
        </div>

        <div className="p-8 md:p-12 bg-white" id="printable-invoice">
          <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-blue-600 leading-none mb-1">MAD<span className="text-orange-500">GADGET</span></h1>
              <p className="text-[12px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Master of Mobile Repair</p>
              <div className="mt-4 text-[12px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-900 underline decoration-blue-500 decoration-2">MAD GADGET RAUB</p>
                <p>No 40J, Bangunan MARA Raub,</p>
                <p>27600 Raub, Pahang.</p>
                <p className="font-black text-slate-900 pt-1">Tel: 011 2092 9110 (WhatsApp)</p>
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="mb-4 flex flex-col items-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://wa.me/601120929110" alt="WhatsApp QR" className="w-20 h-20 border-2 border-slate-900 p-1 rounded-lg shadow-sm"/>
                <p className="text-[8px] font-black text-slate-500 uppercase mt-1 tracking-wider leading-none">WhatsApp Us</p>
              </div>
              <h2 className="text-3xl font-black uppercase text-slate-300 leading-none mb-2">{isSale ? 'Resit Jualan' : 'Rekod Stok In'}</h2>
              <div className="bg-slate-900 text-white p-2 rounded-lg inline-block text-left min-w-[160px]">
                <p className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Reference ID</p>
                <p className="text-sm font-mono font-bold tracking-widest">{phone.id}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 mb-10">
              <p className="text-[12px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-1.5">
                Butiran Peranti {isSale ? 'Terjual' : 'Masuk Stok'} <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Model Peranti</p>
                    <p className="text-xl font-black text-slate-900">{phone.model}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">No. IMEI / Serial</p>
                    <p className="text-xl font-black text-slate-900 font-mono">{phone.imei}</p>
                </div>
              </div>
          </div>

          <table className="w-full mb-10">
            <thead>
              <tr className="border-b-2 border-slate-900 text-[11px] font-black uppercase text-slate-900">
                <th className="py-4 text-left">Penerangan Item</th>
                <th className="py-4 text-center">Kondisi</th>
                <th className="py-4 text-right">Harga (RM)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-slate-100 rounded text-slate-400"><Smartphone size={16}/></div>
                    <div>
                        <p className="text-sm font-black text-slate-900">{phone.model}</p>
                        <p className="text-xs text-slate-500 mt-1">{isSale ? 'Customer Purchase Receipt' : 'Inventory Acquisition Record'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-6 text-center text-xs font-bold text-slate-600">{phone.condition}</td>
                <td className="py-6 text-right text-lg font-black text-slate-900">
                  {isSale ? phone.askingPrice.toFixed(2) : phone.costPrice.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end pt-6 border-t-2 border-slate-900 mb-10">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">{isSale ? 'Jumlah Jualan' : 'Kos Pembelian'}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">
                RM {isSale ? phone.askingPrice.toFixed(2) : phone.costPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900 text-white rounded-xl">
                <p className="text-[12px] font-black uppercase text-slate-400 mb-3 tracking-widest">{isSale ? 'Polisi Peranti' : 'Nota Inventori'}</p>
                <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-2 leading-relaxed">
                  {isSale ? (
                    <>
                      <li>Waranti peranti terpakai adalah 1-2 minggu dari tarikh jualan.</li>
                      <li>Waranti tidak merangkumi kerosakan air, skrin pecah (User Fault).</li>
                      <li>Barangan yang telah dijual tidak boleh dikembalikan (Refund).</li>
                    </>
                  ) : (
                    <>
                      <li>Rekod pembelian stok untuk kegunaan audit kedai.</li>
                      <li>Sila pastikan IMEI dipadankan dengan kotak peranti.</li>
                      <li>Kos termasuk sebarang repair minor jika berkaitan.</li>
                    </>
                  )}
                </ul>
            </div>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest font-mono">Tandatangan & Cop Kedai</p>
                <div className="w-full h-12"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InvoiceModal({ booking, onClose }: { booking: Booking, onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm print:relative print:bg-white print:p-0 print:z-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-white text-slate-900 md:rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none h-full md:h-[90vh] overflow-y-auto"
      >
        {/* Modal UI (Hidden during print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10 print:hidden">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors"
          >
            ⬅️ Kembali
          </button>
          <div className="flex items-center gap-2 text-slate-700">
            <FileText size={18} className="text-blue-600" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Pratonton Invois / Resit</h3>
          </div>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            <Printer size={16} /> Cetak / Download PDF
          </button>
        </div>

        {/* Invoice Body */}
        <div className="p-8 md:p-12 bg-white" id="printable-invoice">
          <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-blue-600 leading-none mb-1">MAD<span className="text-orange-500">GADGET</span></h1>
              <p className="text-[12px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Master of Mobile Repair</p>
              <div className="mt-4 text-[12px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-900 underline decoration-blue-500 decoration-2">MAD GADGET RAUB</p>
                <p>No 40J, Bangunan MARA Raub,</p>
                <p>27600 Raub, Pahang.</p>
                <p className="font-black text-slate-900 pt-1">Tel: 011 2092 9110 (WhatsApp)</p>
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="mb-4 flex flex-col items-center">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://wa.me/601120929110" 
                  alt="WhatsApp QR" 
                  className="w-20 h-20 border-2 border-slate-900 p-1 rounded-lg shadow-sm"
                />
                <p className="text-[8px] font-black text-slate-500 uppercase mt-1 tracking-wider leading-none">WhatsApp Us</p>
              </div>
              <h2 className="text-3xl font-black uppercase text-slate-300 leading-none mb-2">Resit / Slip</h2>
              <div className="bg-slate-900 text-white p-2 rounded-lg inline-block text-left min-w-[160px]">
                <p className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Reference No</p>
                <p className="text-sm font-mono font-bold tracking-widest">{booking.id}</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-wider">Dated: {booking.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[12px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Pelanggan
              </p>
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900">{booking.customerName}</p>
                <p className="text-sm text-slate-500 font-bold">{booking.phoneNum}</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-right">
              <p className="text-[12px] font-black uppercase text-slate-400 mb-3 tracking-widest flex items-center justify-end gap-1.5">
                Butiran Peranti <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              </p>
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900">{booking.device}</p>
                <p className="text-sm text-slate-500 italic font-bold">{booking.issue}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-10">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-4 text-left text-[11px] font-black uppercase text-slate-900 tracking-wider">Penerangan Perkhidmatan</th>
                <th className="py-4 text-right text-[11px] font-black uppercase text-slate-900 tracking-wider">Harga (RM)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-slate-100 rounded text-slate-400"><Smartphone size={14}/></div>
                    <div>
                        <p className="text-sm font-black text-slate-900">Servis Pembaikan {booking.device}</p>
                        <p className="text-xs text-slate-500 mt-1">Diagnosis & Repair: {booking.issue}</p>
                    </div>
                  </div>
                </td>
                <td className="py-6 text-right text-base font-black text-slate-900">
                  {booking.estimatedCost.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end pt-6 border-t-2 border-slate-900 mb-10">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Jumlah Bersih</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">RM {booking.estimatedCost.toFixed(2)}</p>
              <div className="mt-2 flex items-center justify-end gap-1.5">
                 <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                 <p className="text-[10px] font-black text-green-600 uppercase">Paid / Selesai</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900 text-white rounded-xl">
                <p className="text-[12px] font-black uppercase text-slate-400 mb-3 tracking-widest">Terma & Syarat</p>
                <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-2 leading-relaxed">
                <li>Waranti 1 bulan untuk LCD/Bateri (kecuali fizikal/air).</li>
                <li>Sila simpan resit ini untuk tuntutan waranti.</li>
                <li>Barang tidak dituntut &gt;3 bulan akan dilupuskan.</li>
                </ul>
            </div>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest font-mono">Cop Rasmi & Tandatangan</p>
                <div className="w-full h-12"></div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Thank You For Trusting Mad Gadget</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InventoryPage({ inventory, restock, addItem }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', cat: 'Screen', qty: 10, min: 2, cost: 0, sale: 0 });

  const handleAdd = () => {
    if (!newItem.name) return;
    addItem({
      id: 'STK-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      name: newItem.name,
      category: newItem.cat,
      quantity: Number(newItem.qty),
      minStock: Number(newItem.min),
      costPerUnit: Number(newItem.cost),
      sellPrice: Number(newItem.sale)
    });
    setShowAdd(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Inventori Part</h2>
          <p className="text-slate-500 text-sm">Tambah stok atau bina stok baru akan automatik rekod duit keluar.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold">
          <Plus size={20} /> Tambah Item/Part
        </button>
      </header>

      {showAdd && (
        <Card title="Rekod Inventori Baru" className="border-green-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <Input label="Nama Part" value={newItem.name} onChange={(v: string) => setNewItem({...newItem, name: v})} placeholder="cth: Bateri iPhone 11 (High Capacity)" />
            </div>
            <div className="space-y-1.5">
               <label className="text-xs text-slate-500 font-bold ml-1 uppercase tracking-wider">Kategori</label>
               <select className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-white" value={newItem.cat} onChange={e => setNewItem({...newItem, cat: e.target.value})}>
                  <option>Screen</option><option>Battery</option><option>Camera</option><option>Body/Flex</option><option>Other</option>
               </select>
            </div>
            <Input label="Qty Sekarang" type="number" value={newItem.qty} onChange={(v: string) => setNewItem({...newItem, qty: Number(v)})} />
            <Input label="Kos dari Supplier (RM/Unit)" type="number" value={newItem.cost} onChange={(v: string) => setNewItem({...newItem, cost: Number(v)})} />
            <Input label="Harga Jual (RM)" type="number" value={newItem.sale} onChange={(v: string) => setNewItem({...newItem, sale: Number(v)})} />
          </div>
          <button onClick={handleAdd} className="bg-green-600 px-6 py-2 rounded-lg font-bold text-sm">Daftar & Bayar Modal</button>
          <button onClick={() => setShowAdd(false)} className="ml-2 bg-slate-800 px-6 py-2 rounded-lg font-bold text-sm">Batal</button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item: InventoryItem) => (
          <div key={item.id} className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-slate-500 uppercase">{item.category} • {item.id}</span>
                {item.quantity <= item.minStock && <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded animate-pulse"><AlertCircle size={10} /> LOW STOCK</span>}
              </div>
              <h3 className="font-bold text-sm leading-tight h-10">{item.name}</h3>
              
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white">{item.quantity}</span>
                <span className="text-xs text-slate-500 mb-1.5 uppercase font-bold tracking-widest">Unit dalam stok</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Harga Jual</p>
                <p className="text-lg font-bold text-orange-500">RM {item.sellPrice}</p>
              </div>
              <button 
                onClick={() => {
                  const q = prompt('Berapa unit ingin ditambah (Restock)?');
                  if (q && !isNaN(Number(q))) restock(item.id, Number(q));
                }}
                className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 transition-colors"
              >
                + Restock
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function FinancePage({ transactions, addTx }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTx, setNewTx] = useState({ type: 'IN', amount: 0, desc: '', cat: 'Repair' });

  const handleSave = () => {
    if (newTx.amount <= 0 || !newTx.desc) return;
    addTx(newTx.type, Number(newTx.amount), newTx.desc, newTx.cat);
    setNewTx({ type: 'IN', amount: 0, desc: '', cat: 'Repair' });
    setShowAdd(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Penjejak Kewangan</h2>
          <p className="text-slate-500 text-sm">Rekod setiap duit masuk dan keluar kedai secara manual.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold shadow-lg shadow-green-900/20">
          <Plus size={20} /> Rekod Transaksi Manual
        </button>
      </header>

      {showAdd && (
        <Card title="Rekod Baru (Manual)" className="border-green-500/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500 font-bold ml-1 uppercase tracking-wider">Jenis</label>
              <select className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2 text-sm text-white focus:border-green-500 outline-none" value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})}>
                <option value="IN">Duit Masuk (+)</option>
                <option value="OUT">Duit Keluar (-)</option>
              </select>
            </div>
            <Input label="Jumlah (RM)" type="number" value={newTx.amount} onChange={(v: string) => setNewTx({...newTx, amount: Number(v)})} />
            <Input label="Keterangan" value={newTx.desc} onChange={(v: string) => setNewTx({...newTx, desc: v})} placeholder="cth: Bayar Sewa" />
            <div className="space-y-1.5">
               <label className="text-xs text-slate-500 font-bold ml-1 uppercase tracking-wider">Kategori</label>
               <select className="w-full bg-[#1e293b] border border-[#334155] rounded-lg p-2 text-sm text-white focus:border-green-500 outline-none" value={newTx.cat} onChange={e => setNewTx({...newTx, cat: e.target.value})}>
                  <option>Repair</option>
                  <option>Stock Purchase</option>
                  <option>Utilities</option>
                  <option>Rental</option>
                  <option>Staff Salary</option>
                  <option>Other</option>
               </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-600 px-6 py-2 rounded-lg font-bold text-sm">Simpan Rekod</button>
            <button onClick={() => setShowAdd(false)} className="bg-slate-800 px-6 py-2 rounded-lg font-bold text-sm">Batal</button>
          </div>
        </Card>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-2xl">
        <table className="w-full text-left bg-[#1e293b]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50">
              <th className="p-4 text-xs font-black uppercase text-slate-500">Tarikh</th>
              <th className="p-4 text-xs font-black uppercase text-slate-500">Keterangan</th>
              <th className="p-4 text-xs font-black uppercase text-slate-500">Kategori</th>
              <th className="p-4 text-xs font-black uppercase text-slate-500 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {transactions.map((tx: any) => (
              <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-xs font-mono text-slate-400">{tx.date}</td>
                <td className="p-4 text-sm font-medium">{tx.description}</td>
                <td className="p-4"><span className="text-[10px] px-2 py-0.5 bg-slate-900 rounded font-bold text-slate-400 uppercase tracking-tighter">{tx.cat || tx.category}</span></td>
                <td className={`p-4 text-right font-black ${tx.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'IN' ? '+' : '-'} RM {tx.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
               <tr><td colSpan={4} className="p-10 text-center text-slate-600 italic">Tiada rekod transaksi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// --- UI Primitives (Keep original) ---
function KPI({ label, value, color, icon, className }: any) {
  return (
    <div className={`p-6 rounded-2xl border ${className} shadow-sm backdrop-blur-md`}>
      <div className="flex justify-between items-start mb-3">
        <div className="p-2.5 bg-slate-900/50 rounded-xl shadow-inner border border-white/5">{icon}</div>
        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400 font-bold uppercase tracking-widest">LIVE</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>RM {Number(value).toLocaleString()}</p>
    </div>
  );
}

function Card({ title, children, className }: any) {
  return (
    <div className={`bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden shadow-xl ${className}`}>
      <div className="p-4 border-b border-[#334155] bg-slate-900/20">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs text-slate-500 font-bold ml-1 uppercase tracking-wider">{label}</label>
      <input 
        type={type}
        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2 text-sm text-white placeholder:text-slate-700 focus:border-orange-500 focus:outline-none transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SearchPage({ inventory, bookings }: { inventory: InventoryItem[], bookings: Booking[] }) {
  const [query, setQuery] = useState('');

  const filteredInventory = useMemo(() => {
    if (!query) return [];
    return inventory.filter(item => 
      item.id.toLowerCase().includes(query.toLowerCase()) || 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [inventory, query]);

  const filteredBookings = useMemo(() => {
    if (!query) return [];
    return bookings.filter(b => 
      b.id.toLowerCase().includes(query.toLowerCase()) || 
      b.customerName.toLowerCase().includes(query.toLowerCase()) ||
      b.device.toLowerCase().includes(query.toLowerCase()) ||
      b.phoneNum.includes(query)
    );
  }, [bookings, query]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Sistem Carian</h2>
        <p className="text-slate-500 text-sm">Cari ID Item, ID Repair, Nama Pelanggan atau Model Peranti.</p>
      </header>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          autoFocus
          className="block w-full pl-10 pr-3 py-4 border border-[#334155] rounded-2xl bg-[#1e293b] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-lg shadow-2xl"
          placeholder="Taip ID (cth: BK-ABCD), Nama, atau Model..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Hasil Carian Booking (${filteredBookings.length})`}>
          <div className="space-y-3">
            {filteredBookings.length > 0 ? filteredBookings.map(b => (
              <div key={b.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-orange-500 uppercase">{b.id} • {b.date}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                    b.status === 'Selesai' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>{b.status}</span>
                </div>
                <p className="text-sm font-bold">{b.customerName} - {b.device}</p>
                <p className="text-xs text-slate-500">{b.issue}</p>
              </div>
            )) : (
              <p className="text-center text-slate-600 py-10 text-sm italic">
                {query ? 'Tiada booking dijumpai.' : 'Sila taip sesuatu untuk mencari.'}
              </p>
            )}
          </div>
        </Card>

        <Card title={`Hasil Carian Inventori (${filteredInventory.length})`}>
          <div className="space-y-3">
            {filteredInventory.length > 0 ? filteredInventory.map(item => (
              <div key={item.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase">{item.id} • {item.category}</span>
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="text-xs text-orange-500">RM {item.sellPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">{item.quantity}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Unit</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-600 py-10 text-sm italic">
                {query ? 'Tiada stok dijumpai.' : 'Sila taip sesuatu untuk mencari.'}
              </p>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800">
      <AlertCircle className="text-slate-600 mb-4" size={48} />
      <h2 className="text-lg font-bold text-slate-500">{title}</h2>
      <p className="text-slate-600 text-sm">Modul ini akan dikemaskini dalam fasa seterusnya.</p>
    </div>
  );
}
