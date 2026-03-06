function Header({ companyName, role, onLogout, kalanKredi }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/80">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/30">
            <Icon name="Zap" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Fiş Fatura</h1>
            <span className="text-[10px] font-bold text-brand uppercase tracking-widest">SaaS Panel</span>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
        <div className="hidden md:block">
          <p className="text-sm font-bold text-slate-800 leading-none mb-1">{companyName || "Şirket Bilgisi Yok"}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{role === 'admin' ? 'Yönetici' : 'Kullanıcı'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <Icon name="Wallet" size={16} className="text-emerald-600" />
          <span className="text-xs text-emerald-700 font-semibold">Kalan Kontor: {Number(kalanKredi || 0)}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-sm font-bold transition-all border border-slate-200 hover:border-rose-100 group"
        >
          <Icon name="LogOut" size={16} className="group-hover:translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Güvenli Çıkış</span>
        </button>
      </div>
    </header>
  );
}

window.Header = Header;

