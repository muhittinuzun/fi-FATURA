function ReportTable({
  title,
  items,
  company,
  dates,
  onExcludeDuplicate,
  onIncludeDuplicate,
  duplicateDecisions,
  showMasterColumns
}) {
  const rows = items.filter((item) => duplicateDecisions[item.fis_id] !== "exclude");
  const total = rows.reduce((sum, item) => sum + Number(item.toplam_tutar || 0), 0);

  return (
    <div className="report-page mb-8 break-inside-avoid shadow-sm bg-white p-6 rounded-lg border border-slate-100">
      <div className="border-b-2 border-slate-800 pb-4 mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{company?.company_name || company?.name || "Şirket Adı"}</h2>
          <p className="text-slate-500 text-sm">Muhasebe Raporu</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg">{title}</p>
          <p className="text-xs text-slate-500">{new Date().toLocaleDateString("tr-TR")}</p>
        </div>
      </div>
      <div className="mb-4 text-xs text-slate-500 flex gap-4">
        <span className="bg-slate-100 px-2 py-1 rounded">Başlangıç: <b>{dates.start || "-"}</b></span>
        <span className="bg-slate-100 px-2 py-1 rounded">Bitiş: <b>{dates.end || "-"}</b></span>
      </div>
      <table className="w-full text-left text-xs mb-6">
        <thead className="border-b-2 border-slate-200 text-slate-500 uppercase">
          <tr>
            <th className="py-2">Tarih</th>
            <th className="py-2">Fiş No</th>
            <th className="py-2">İşletme</th>
            <th className="py-2">Kategori</th>
            <th className="py-2">Kart Son 4</th>
            <th className="py-2 text-center">KDV %</th>
            <th className="py-2 text-right">Matrah</th>
            <th className="py-2 text-right">KDV Tutarı</th>
            <th className="py-2 text-right">Toplam</th>
            {showMasterColumns && (
              <>
                <th className="py-2">Personel</th>
                <th className="py-2">Proje</th>
              </>
            )}
            <th className="py-2 text-center">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length > 0 ? rows.map((item, idx) => {
            const isDuplicate = item.isDuplicate && !duplicateDecisions[item.fis_id];
            const isIncluded = duplicateDecisions[item.fis_id] === "include";
            const rowClass = isDuplicate ? "bg-red-50 border-l-4 border-red-500" : (isIncluded ? "bg-green-50" : "");
            return (
              <tr key={`${item.fis_id}-${idx}`} className={rowClass}>
                <td className="py-2">{item.tarih ? new Date(item.tarih).toLocaleDateString("tr-TR") : "-"}</td>
                <td className="py-2">{item.fis_no || "-"}</td>
                <td className="py-2 font-medium">{item.isletme_adi || "-"}</td>
                <td className="py-2">{item.kategori || "-"}</td>
                <td className="py-2 text-slate-600">{item.kart_son_4 || "-"}</td>
                <td className="py-2 text-center">%{item.kdv_oran}</td>
                <td className="py-2 text-right">{window.formatCurrency(item.matrah || 0)}</td>
                <td className="py-2 text-right text-orange-600">{window.formatCurrency(item.kdv_tutar || 0)}</td>
                <td className="py-2 text-right font-bold">{window.formatCurrency(item.toplam_tutar || 0)}</td>
                {showMasterColumns && (
                  <>
                    <td className="py-2 text-xs">{item.user_email || "-"}</td>
                    <td className="py-2 text-xs">{item.proje || "-"}</td>
                  </>
                )}
                <td className="py-2 text-center">
                  {isDuplicate ? (
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => onExcludeDuplicate(item.fis_id)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">Çıkart</button>
                      <button onClick={() => onIncludeDuplicate(item.fis_id)} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">Dahil Et</button>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            );
          }) : (
            <tr><td colSpan={showMasterColumns ? "12" : "10"} className="py-10 text-center text-slate-400">Bu bölümde listelenecek fiş bulunamadı.</td></tr>
          )}
        </tbody>
        <tfoot className="border-t-2 border-slate-800 font-bold">
          <tr>
            <td colSpan={showMasterColumns ? "8" : "6"} className="py-3 text-right">GENEL TOPLAM:</td>
            <td className="py-3 text-right text-lg">{window.formatCurrency(total)}</td>
            <td colSpan={showMasterColumns ? "3" : "1"}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function ReportsPage({ profile, company }) {
  const [dates, setDates] = React.useState({ start: "", end: "" });
  const [loading, setLoading] = React.useState(false);
  const [generated, setGenerated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("cards");
  const [groups, setGroups] = React.useState({ cards: {}, projects: {}, noProject: {}, master: [] });
  const [duplicateDecisions, setDuplicateDecisions] = React.useState({});

  const parseArray = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (_e) {
        return [];
      }
    }
    return [];
  };

  const aggregateReceipt = (fis) => {
    const details = parseArray(fis.ocr_detaylari);
    const total = Number(fis.toplam_tutar || 0);
    if (!details.length) {
      const kdvOran = 20;
      const matrah = total / (1 + kdvOran / 100);
      return [{ tarih: fis.tarih, fis_no: fis.fis_no, isletme_adi: fis.isletme_adi, kategori: fis.kategori || "Genel", kart_son_4: fis.kart_son_4, kdv_oran: kdvOran, matrah, kdv_tutar: total - matrah, toplam_tutar: total, fis_id: fis.id, proje: fis.proje, user_email: fis.user_email || fis.full_name || "-" }];
    }
    const grouped = {};
    details.forEach((line) => {
      const kategori = line.kategori || fis.kategori || "Genel";
      const kdv = Number(line.kdv ?? line.kdv_oran ?? 20);
      const tutar = Number(line.tutar || 0);
      const key = `${kategori}|${kdv}`;
      if (!grouped[key]) grouped[key] = { kategori, kdv_oran: kdv, toplam_tutar: 0 };
      grouped[key].toplam_tutar += tutar;
    });
    return Object.values(grouped).map((g) => {
      const matrah = g.toplam_tutar / (1 + g.kdv_oran / 100);
      return { tarih: fis.tarih, fis_no: fis.fis_no, isletme_adi: fis.isletme_adi, kategori: g.kategori, kart_son_4: fis.kart_son_4, kdv_oran: g.kdv_oran, matrah, kdv_tutar: g.toplam_tutar - matrah, toplam_tutar: g.toplam_tutar, fis_id: fis.id, proje: fis.proje, user_email: fis.user_email || fis.full_name || "-" };
    });
  };

  const createFingerprint = (fis) => {
    const biz = (fis.isletme_adi || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const date = fis.tarih ? String(fis.tarih).slice(0, 10) : "no-date";
    const amt = Math.round(Number(fis.toplam_tutar || 0) / 5) * 5;
    return `${biz}|${date}|${amt}|${fis.fis_no || ""}`;
  };

  const buildGroups = (fisler, companyCards) => {
    const cards = {};
    const projects = {};
    const noProject = {};
    const master = [];
    const cardNumbersSet = new Set((companyCards || []).map((c) => String(c.last_4_digits || c.kart_son_4 || "").trim()).filter(Boolean));
    const fingerprints = {};
    fisler.forEach((fis) => {
      const rows = aggregateReceipt(fis);
      const isCC = fis.odeme_tipi === "Kredi Kartı";
      const isCompanyCard = isCC && fis.kart_son_4 && cardNumbersSet.has(String(fis.kart_son_4));
      const fp = createFingerprint(fis);
      const isDuplicate = Boolean(fingerprints[fp]);
      fingerprints[fp] = true;
      rows.forEach((r) => {
        const row = { ...r, isDuplicate };
        master.push(row);
        if (isCompanyCard) {
          const key = String(fis.kart_son_4);
          if (!cards[key]) cards[key] = [];
          cards[key].push(row);
        } else if (fis.proje && fis.proje !== "" && fis.proje !== "Seçiniz") {
          const key = String(fis.proje);
          if (!projects[key]) projects[key] = [];
          projects[key].push(row);
        } else {
          const key = "Projesiz/Diğer";
          if (!noProject[key]) noProject[key] = [];
          noProject[key].push(row);
        }
      });
    });
    return { cards, projects, noProject, master };
  };

  const createReport = async () => {
    setLoading(true);
    try {
      const data = await window.fetchReceipts({ date_start: dates.start, date_end: `${dates.end} 23:59:59`, statuses: ["onaylandi", "beklemede"] });
      const fisler = data?.receipts || [];
      const cardsData = await window.fetchMetadata("company_cards");
      const companyCards = cardsData?.items || cardsData?.data || cardsData?.company_cards || [];
      setGroups(buildGroups(fisler, companyCards));
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const onExcludeDuplicate = async (fisId) => {
    setDuplicateDecisions((p) => ({ ...p, [fisId]: "exclude" }));
    if (window.updateReceiptStatus) await window.updateReceiptStatus(fisId, "mukerrer");
  };
  const onIncludeDuplicate = (fisId) => setDuplicateDecisions((p) => ({ ...p, [fisId]: "include" }));

  const exportPdf = () => {
    const element = document.getElementById("printable-area");
    if (!element) return;
    html2pdf().set({ margin: 8, filename: `fismatik-rapor-${new Date().toISOString().slice(0, 10)}.pdf`, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(element).save();
  };

  const tabButton = (id, label) => (
    <button key={id} onClick={() => setActiveTab(id)} className={`px-3 py-2 rounded-lg text-sm font-semibold ${activeTab === id ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{label}</button>
  );

  const renderTab = () => {
    if (!generated) return <div className="text-center py-12 text-slate-400">Önce tarih seçip rapor oluşturun.</div>;
    if (activeTab === "cards") {
      const entries = Object.entries(groups.cards);
      return entries.length ? entries.map(([key, items]) => <ReportTable key={key} title={`Şirket Kartı - ${key}`} items={items} company={company} dates={dates} onExcludeDuplicate={onExcludeDuplicate} onIncludeDuplicate={onIncludeDuplicate} duplicateDecisions={duplicateDecisions} showMasterColumns={false} />) : <div className="text-center py-10 text-slate-400">Şirket kartı grubu yok.</div>;
    }
    if (activeTab === "projects") {
      const entries = Object.entries(groups.projects);
      return entries.length ? entries.map(([key, items]) => <ReportTable key={key} title={`Proje - ${key}`} items={items} company={company} dates={dates} onExcludeDuplicate={onExcludeDuplicate} onIncludeDuplicate={onIncludeDuplicate} duplicateDecisions={duplicateDecisions} showMasterColumns={false} />) : <div className="text-center py-10 text-slate-400">Proje bazlı kayıt yok.</div>;
    }
    if (activeTab === "no-project") {
      const entries = Object.entries(groups.noProject);
      return entries.length ? entries.map(([key, items]) => <ReportTable key={key} title={key} items={items} company={company} dates={dates} onExcludeDuplicate={onExcludeDuplicate} onIncludeDuplicate={onIncludeDuplicate} duplicateDecisions={duplicateDecisions} showMasterColumns={false} />) : <div className="text-center py-10 text-slate-400">Projesiz/diğer kayıt yok.</div>;
    }
    return <ReportTable title="Master List" items={groups.master} company={company} dates={dates} onExcludeDuplicate={onExcludeDuplicate} onIncludeDuplicate={onIncludeDuplicate} duplicateDecisions={duplicateDecisions} showMasterColumns={true} />;
  };

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div><label className="text-xs text-slate-500">Başlangıç</label><input type="date" value={dates.start} onChange={(e) => setDates((p) => ({ ...p, start: e.target.value }))} className="block border rounded px-3 py-2 text-sm" /></div>
        <div><label className="text-xs text-slate-500">Bitiş</label><input type="date" value={dates.end} onChange={(e) => setDates((p) => ({ ...p, end: e.target.value }))} className="block border rounded px-3 py-2 text-sm" /></div>
        <button onClick={createReport} disabled={loading || !dates.start || !dates.end} className="px-4 py-2 rounded-lg bg-brand text-white text-sm disabled:opacity-60">{loading ? "Hazırlanıyor..." : "Rapor Oluştur"}</button>
        <button onClick={exportPdf} disabled={!generated} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60">PDF İndir</button>
      </section>
      <section className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {tabButton("cards", "Şirket Kartları")}
          {tabButton("projects", "Proje Bazlı")}
          {tabButton("no-project", "Projesiz/Diğer")}
          {tabButton("master", "Master List")}
        </div>
        <div id="printable-area">{renderTab()}</div>
      </section>
    </div>
  );
}

window.ReportsPage = ReportsPage;
