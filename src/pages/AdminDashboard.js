function AdminDashboard({ companies, usageLogs, storageSummary }) {
  const totalCost = usageLogs.reduce((acc, item) => acc + Number(item.estimated_cost || 0), 0);
  const estimatedRevenue = companies.reduce((acc, c) => {
    if (c.plan_type === "ultimate") return acc + 6999;
    if (c.plan_type === "premium") return acc + 2499;
    return acc;
  }, 0);

  return (
    <div className="space-y-4">
      <section className="grid md:grid-cols-3 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Toplam Şirket</p>
          <p className="text-2xl font-bold">{companies.length}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Toplam AI Maliyeti</p>
          <p className="text-2xl font-bold">{formatUSD(totalCost)}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Tahmini Aylık Gelir</p>
          <p className="text-2xl font-bold">
            {estimatedRevenue.toLocaleString("tr-TR")} TL
          </p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">S3 Depolama Dolulugu</p>
          <p className="text-2xl font-bold">{storageSummary?.used_gb || 0} / {storageSummary?.total_gb || 0} GB</p>
          <p className="text-xs text-slate-500 mt-1">%{storageSummary?.usage_percent || 0}</p>
        </article>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold mb-3">Şirket Kullanım Tablosu</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2 text-left">Şirket</th>
                <th className="py-2 text-left">Plan</th>
                <th className="py-2 text-left">Kalan Kontor</th>
                <th className="py-2 text-left">Durum</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-slate-100">
                  <td className="py-2">{company.name}</td>
                  <td className="py-2">{company.plan_type}</td>
                  <td className="py-2">{Number(company.kalan_kredi || 0)}</td>
                  <td className="py-2">{company.status}</td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-400">Şirket kaydı yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;
