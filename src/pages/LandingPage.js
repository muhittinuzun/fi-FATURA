function LandingPage({ onNavigate }) {
  const goLogin = () => typeof onNavigate === "function" && onNavigate("login");
  const goRegister = () => typeof onNavigate === "function" && onNavigate("register");

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand text-white grid place-items-center shadow-lg shadow-brand/30">
            <Icon name="Zap" size={18} />
          </div>
          <span className="text-lg font-black text-slate-900">FisFatura</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goLogin}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            Giris Yap
          </button>
          <button
            onClick={goRegister}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90"
          >
            Ucretsiz Kayit Ol
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 rounded-full px-3 py-1">
              Yeni Nesil Fis Otomasyonu
            </span>
            <h1 className="mt-4 text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Fislerinizi Yapay Zeka ile Saniyeler Icinde Muhasebelestirin
            </h1>
            <p className="mt-4 text-slate-600 text-base md:text-lg">
              Mali musavirler ve isletmeler icin akilli, hizli ve kontor tabanli fis okuma otomasyonu.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={goRegister}
                className="px-6 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand/90 shadow-lg shadow-brand/20"
              >
                Hemen Kayit Ol
              </button>
              <button
                onClick={goLogin}
                className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50"
              >
                Panele Giris Yap
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -right-4 w-40 h-40 bg-violet-200/40 blur-3xl rounded-full" />
            <div className="absolute -bottom-6 -left-4 w-40 h-40 bg-blue-200/40 blur-3xl rounded-full" />
            <div className="relative bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Okunan Fis</p>
                  <p className="text-xl font-black text-slate-900">+12.480</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Ortalama Sure</p>
                  <p className="text-xl font-black text-slate-900">3 sn</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 col-span-2">
                  <p className="text-xs text-slate-500">Kontor Tabanli Esnek Yapi</p>
                  <p className="text-lg font-bold text-brand">Aylik paket bagimliligi yok</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

window.LandingPage = LandingPage;
