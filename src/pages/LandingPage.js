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
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
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
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 rounded-full px-3 py-1 mb-3">
              Kontor Tabanli Fis Otomasyonu
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Fislerinizi Saniyeler Icinde Muhasebelestirin
            </h1>
            <p className="mt-4 text-slate-600 text-base md:text-lg">
              Mali musavirler ve isletmeler icin dunyanin en hizli, dogrulama orani en yuksek kontor tabanli yapay zeka otomasyonu.
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
              <h3 className="text-lg font-black text-slate-900 mb-2">Hemen Telegram'dan Deneyin!</h3>
              <p className="text-sm text-slate-500 mb-4">Botu acin, fise ait gorseli gonderin, sonucu panelden izleyin.</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid place-items-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://t.me/ITT_FIS_MATIK_BOT"
                  alt="QR Code"
                  className="w-[150px] h-[150px] rounded"
                />
              </div>
              <p className="mt-4 text-center">
                <span className="text-xs text-slate-500 block mb-1">Telegram Bot Adresi</span>
                <code className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-semibold">@ITT_FIS_MATIK_BOT</code>
              </p>
              <div className="mt-4">
                <button
                  onClick={goRegister}
                  className="w-full px-4 py-2.5 rounded-lg bg-brand text-white font-semibold hover:bg-brand/90"
                >
                  Ucretsiz Hesap Ac
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 md:pb-24">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">Nasil Calisir?</h2>
            <p className="text-sm text-slate-500 mt-1">Uc adimda fisten rapora uzanan hizli is akisi.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand grid place-items-center mb-3">
                <Icon name="Camera" size={18} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">CEK</h3>
              <p className="text-sm text-slate-600">
                Telegram uzerinden fisinizin fotografini cekin veya galerinizden saniyeler icinde iletin.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 grid place-items-center mb-3">
                <Icon name="Zap" size={18} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">YUKLE</h3>
              <p className="text-sm text-slate-600">
                Yapay zeka motorumuz %99.9 dogruluk oraniyla KDV, Matrah ve Kategorileri aninda okur, ayristirir ve panele yukler.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center mb-3">
                <Icon name="BarChart3" size={18} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">RAPORLA</h3>
              <p className="text-sm text-slate-600">
                Gelismis panelinizden tek tikla mukerrer fisleri ayiklayin, Excel veya PDF formatinda KDV icmallerinizi indirin.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

window.LandingPage = LandingPage;
