function AdvisorDashboard({ profile, onImpersonate }) {
  const [clients] = React.useState([
    { id: 101, company_name: "Ornek A Sirketi", kalan_kredi: 1240, durum: "Aktif" },
    { id: 102, company_name: "Ornek B Ltd.", kalan_kredi: 560, durum: "Aktif" },
    { id: 103, company_name: "Ornek C A.S.", kalan_kredi: 90, durum: "Pasif" }
  ]);
  const [topupCompany, setTopupCompany] = React.useState(null);

  const totalClients = clients.length;

  const handleImpersonate = (companyId) => {
    if (!companyId) return;
    if (typeof onImpersonate === "function") {
      onImpersonate(companyId);
      return;
    }
    localStorage.setItem("selected_company_id", String(companyId));
    window.location.reload();
  };

  const openTopupModal = (company) => {
    setTopupCompany(company);
  };

  const closeTopupModal = () => {
    setTopupCompany(null);
  };

  return (
    <div className="space-y-5">
      <section className="grid md:grid-cols-3 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Toplam Mukellef</p>
          <p className="text-3xl font-black text-slate-900">{totalClients}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Bu Ay Islenen Fis</p>
          <p className="text-3xl font-black text-slate-900">Yakinda</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Musavir Havuz Kontoru</p>
          <p className="text-3xl font-black text-slate-900">Sinirsiz</p>
        </article>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mukelleflerim (Sirketler)</h3>
            <p className="text-xs text-slate-500 mt-1">{profile?.full_name || profile?.email || "Musavir"} hesabina ait liste</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{clients.length} kayit</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Sirket Adi</th>
                <th className="px-4 py-3 text-left">Kalan Kontor</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3 text-center">Islemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((company) => (
                <tr key={company.id}>
                  <td className="px-4 py-3 font-medium">{company.company_name}</td>
                  <td className="px-4 py-3">{Number(company.kalan_kredi || 0)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs border font-semibold ${
                        company.durum === "Aktif"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {company.durum}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleImpersonate(company.id)}
                        className="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90"
                      >
                        Icine Gir / Yonet
                      </button>
                      <button
                        onClick={() => openTopupModal(company)}
                        className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-50"
                      >
                        Kontor Yukle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {topupCompany && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl p-5">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Kontor Yukle</h4>
            <p className="text-sm text-slate-600">
              <span className="font-semibold">{topupCompany.company_name}</span> icin kontor yukleme akisi yakinda aktif olacak.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">500 Kontor</button>
              <button className="px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">2000 Kontor</button>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={closeTopupModal}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.AdvisorDashboard = AdvisorDashboard;
