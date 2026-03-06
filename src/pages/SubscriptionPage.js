function SubscriptionPage({ company }) {
  const kalanKredi = Number(company?.kalan_kredi || 0);
  const packs = [
    { id: "pack-500", title: "500 Fis Kontoru", credits: 500, price: "599 TL" },
    { id: "pack-2000", title: "2000 Fis Kontoru", credits: 2000, price: "1.999 TL" },
    { id: "pack-5000", title: "5000 Fis Kontoru", credits: 5000, price: "4.499 TL" }
  ];

  return (
    <div className="space-y-5">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <p className="text-sm text-slate-500 mb-1">Cuzdan Durumu</p>
        <p className="text-3xl font-black text-slate-900">{kalanKredi} Kontor</p>
        <p className="text-xs text-slate-500 mt-2">
          Tek seferlik kontor satin alinir. Aylik paket bagimliligi yoktur.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {packs.map((pack) => (
          <article key={pack.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-2">{pack.title}</p>
            <p className="text-2xl font-black text-slate-900 mb-1">{pack.credits}</p>
            <p className="text-xs text-slate-500 mb-4">Fis okutma hakki</p>
            <p className="text-lg font-bold text-brand mb-4">{pack.price}</p>
            <button
              className="w-full px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand/90"
              onClick={() => window.open(window.SUPPORT_LINKS?.whatsapp || window.SUPPORT_LINKS?.telegram || "#", "_blank")}
            >
              Satin Al
            </button>
          </article>
        ))}
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Odeme ve kontor tanimlama islemleri icin destek ekibi ile iletisime gecebilirsiniz.
        </p>
      </section>
    </div>
  );
}

window.SubscriptionPage = SubscriptionPage;
