const packages = [
  { id: "trial", limit: 20, price: 0 },
  { id: "premium", limit: 500, price: 2499 },
  { id: "ultimate", limit: 2000, price: 6999 }
];

function BillingSection({ company }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold mb-3">Abonelik ve Kontör</h3>
      <p className="text-sm text-slate-500 mb-4">
        Mevcut plan: <b>{window.PLAN_LABELS[company?.plan_type] || "Belirtilmedi"}</b>
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <article key={pkg.id} className="border border-slate-200 rounded-lg p-4">
            <p className="font-semibold">{window.PLAN_LABELS[pkg.id]}</p>
            <p className="text-sm text-slate-500">{pkg.limit} fiş/ay</p>
            <p className="text-lg mt-2">{formatCurrency(pkg.price)}</p>
            <button className="mt-3 w-full px-3 py-2 rounded-lg bg-slate-900 text-white text-sm">
              Paketi Seç
            </button>
          </article>
        ))}
      </div>
      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="font-medium">Kontör Yükle</p>
        <p className="text-sm text-slate-500">Ödeme altyapısına hazır statik alan.</p>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-brand text-white text-sm">+100 Kontör</button>
          <button className="px-3 py-2 rounded-lg bg-brand text-white text-sm">+500 Kontör</button>
        </div>
      </div>
    </section>
  );
}

window.BillingSection = BillingSection;
