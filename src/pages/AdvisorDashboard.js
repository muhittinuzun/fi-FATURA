function AdvisorDashboard({ profile, onImpersonate }) {
  const [clients] = React.useState([
    { id: 101, company_name: "Ornek A Sirketi", kalan_kredi: 1240, son_islem: "Bugun 10:34" },
    { id: 102, company_name: "Ornek B Ltd.", kalan_kredi: 560, son_islem: "Dun 18:10" },
    { id: 103, company_name: "Ornek C A.S.", kalan_kredi: 90, son_islem: "2 gun once" }
  ]);

  const totalClients = clients.length;
  const totalPoolCredit = clients.reduce((acc, item) => acc + Number(item.kalan_kredi || 0), 0);

  const handleImpersonate = (companyId) => {
    if (!companyId) return;
    if (typeof onImpersonate === "function") {
      onImpersonate(companyId);
      return;
    }
    localStorage.setItem("selected_company_id", String(companyId));
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <section className="grid md:grid-cols-3 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Toplam Mukellef</p>
          <p className="text-3xl font-black text-slate-900">{totalClients}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Kalan Havuz Kontoru</p>
          <p className="text-3xl font-black text-slate-900">{totalPoolCredit}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Aktif Kullanici</p>
          <p className="text-xl font-bold text-slate-800">{profile?.full_name || profile?.email || "-"}</p>
        </article>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Mukelleflerim (Sirketler)</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{clients.length} kayit</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Sirket Adi</th>
                <th className="px-4 py-3 text-left">Kalan Kontor</th>
                <th className="px-4 py-3 text-left">Son Islem</th>
                <th className="px-4 py-3 text-center">Islemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((company) => (
                <tr key={company.id}>
                  <td className="px-4 py-3 font-medium">{company.company_name}</td>
                  <td className="px-4 py-3">{Number(company.kalan_kredi || 0)}</td>
                  <td className="px-4 py-3">{company.son_islem || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleImpersonate(company.id)}
                      className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90"
                    >
                      Icine Gir / Yonet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

window.AdvisorDashboard = AdvisorDashboard;
