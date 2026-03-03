function AboutPage() {
  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Fiş Fatura Nedir?</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Fişmatik, işletmelerin harcama fişlerini Telegram üzerinden toplayıp OCR ve Gemini AI yardımıyla dijitalleştiren
          bir B2B SaaS platformudur. Fişler yapılandırılmış hale getirilir ve panelden yönetilir.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Nasıl Kullanılır?</h3>
        <ol className="space-y-2 text-sm text-slate-600 list-decimal pl-5">
          <li>Fişi Telegram botuna fotoğraf olarak gönder.</li>
          <li>OCR ve AI fiş verilerini alanlara ayırır.</li>
          <li>Veriler PostgreSQL tablosuna kaydedilir.</li>
          <li>Panelden fişleri düzenle, filtrele, raporla ve PDF indir.</li>
        </ol>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Yapay Zeka Analizi</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Fiş detayları kategori, KDV ve proje bazında ayrıştırılır. Böylece muhasebe raporları daha hızlı hazırlanır,
          mükerrer fişler tespit edilir ve karar destek görünümü güçlenir.
        </p>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Telegram Bot</h3>
        <a
          href="https://t.me/ITTFISMATIKBOT"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold"
        >
          <Icon name="send" size={16} />
          Botu Aç
        </a>
      </section>

      <footer className="text-center text-xs text-slate-500 py-3">
        2025 ITT Yazılım — Tüm hakları saklıdır.
      </footer>
    </div>
  );
}

window.AboutPage = AboutPage;
