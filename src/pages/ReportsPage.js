function ReportsPage() {
  return <div className="bg-white p-4 rounded-xl border border-slate-200">Raporlar sayfasi hazirlaniyor...</div>;
}

window.ReportsPage = ReportsPage;
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
  const filteredItems = items.filter((item) => duplicateDecisions[item.fis_id] !== "exclude");
  const total = filteredItems.reduce((sum, item) => sum + Number(item.toplam_tutar || 0), 0);

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
          {filteredItems.length > 0 ? filteredItems.map((item, idx) => {
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

      <div className="grid grid-cols-3 gap-8 mt-12 text-center text-xs text-slate-400">
        <div><p className="font-bold mb-8 text-slate-800">TESLİM EDEN</p><div className="border-t border-slate-300 pt-2">İmza</div></div>
        <div><p className="font-bold mb-8 text-slate-800">KONTROL EDEN</p><div className="border-t border-slate-300 pt-2">İmza</div></div>
        <div><p className="font-bold mb-8 text-slate-800">ONAYLAYAN</p><div className="border-t border-slate-300 pt-2">İmza</div></div>
      </div>
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
    const safeTotal = Number(fis.toplam_tutar || 0);
    if (!details.length) {
      const kdvOran = 20;
      const matrah = safeTotal / (1 + kdvOran / 100);
      return [{ tarih: fis.tarih, isletme_adi: fis.isletme_adi, kategori: fis.kategori || "Genel", kart_son_4: fis.kart_son_4, kdv_oran: kdvOran, toplam_tutar: safeTotal, matrah, kdv_tutar: safeTotal - matrah, fis_id: fis.id, fis_no: fis.fis_no, proje: fis.proje, user_email: fis.user_email || fis.full_name || "-" }];
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
      return { tarih: fis.tarih, isletme_adi: fis.isletme_adi, kategori: g.kategori, kart_son_4: fis.kart_son_4, kdv_oran: g.kdv_oran, toplam_tutar: g.toplam_tutar, matrah, kdv_tutar: g.toplam_tutar - matrah, fis_id: fis.id, fis_no: fis.fis_no, proje: fis.proje, user_email: fis.user_email || fis.full_name || "-" };
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
  const filteredItems = items.filter((item) => duplicateDecisions[item.fis_id] !== "exclude");
  const total = filteredItems.reduce((sum, item) => sum + Number(item.toplam_tutar || 0), 0);

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
          {filteredItems.length > 0 ? filteredItems.map((item, idx) => {
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

      <div className="grid grid-cols-3 gap-8 mt-12 text-center text-xs text-slate-400">
        <div><p className="font-bold mb-8 text-slate-800">TESLİM EDEN</p><div className="border-t border-slate-300 pt-2">İmza</div></div>
        <div><p className="font-bold mb-8 text-slate-800">KONTROL EDEN</p><div className="border-t border-slate-300 pt-2">İmza</div></div>
        <div><p className="font-bold mb-8 text-slate-800">ONAYLAYAN</p><div className="border-t border-slate-300 pt-2">İmza</div></div>
      </div>
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
    const safeTotal = Number(fis.toplam_tutar || 0);
    if (!details.length) {
      const kdvOran = 20;
      const matrah = safeTotal / (1 + kdvOran / 100);
      return [{ tarih: fis.tarih, isletme_adi: fis.isletme_adi, kategori: fis.kategori || "Genel", kart_son_4: fis.kart_son_4, kdv_oran: kdvOran, toplam_tutar: safeTotal, matrah, kdv_tutar: safeTotal - matrah, fis_id: fis.id, fis_no: fis.fis_no, proje: fis.proje, user_email: fis.user_email || fis.full_name || "-" }];
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
      return { tarih: fis.tarih, isletme_adi: fis.isletme_adi, kategori: g.kategori, kart_son_4: fis.kart_son_4, kdv_oran: g.kdv_oran, toplam_tutar: g.toplam_tutar, matrah, kdv_tutar: g.toplam_tutar - matrah, fis_id: fis.id, fis_no: fis.fis_no, proje: fis.proje, user_email: fis.user_email || fis.full_name || "-" };
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
function ReportTable({
  title,
  items,
  profile,
  company,
  dates,
  onExcludeDuplicate,
  onIncludeDuplicate,
  duplicateDecisions,
  showMasterColumns
}) {
  const filteredItems = items.filter((item) => duplicateDecisions[item.fis_id] !== "exclude");
  const total = filteredItems.reduce((sum, item) => sum + Number(item.toplam_tutar || 0), 0);

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
          {filteredItems.length > 0 ? filteredItems.map((item, idx) => {
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
                      <button
                        onClick={() => onExcludeDuplicate(item.fis_id)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                        title="Mükerrer olarak işaretle ve rapor dışı bırak"
                      >
                        Çıkart
                      </button>
                      <button
                        onClick={() => onIncludeDuplicate(item.fis_id)}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                        title="Görmezden gel ve rapora dahil et"
                      >
                        Dahil Et
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan={showMasterColumns ? "12" : "10"} className="py-10 text-center text-slate-400">
                Bu bölümde listelenecek fiş bulunamadı.
              </td>
            </tr>
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

      <div className="grid grid-cols-3 gap-8 mt-12 text-center text-xs text-slate-400">
        <div>
          <p className="font-bold mb-8 text-slate-800">TESLİM EDEN</p>
          <div className="border-t border-slate-300 pt-2">İmza</div>
        </div>
        <div>
          <p className="font-bold mb-8 text-slate-800">KONTROL EDEN</p>
          <div className="border-t border-slate-300 pt-2">İmza</div>
        </div>
        <div>
          <p className="font-bold mb-8 text-slate-800">ONAYLAYAN</p>
          <div className="border-t border-slate-300 pt-2">İmza</div>
        </div>
      </div>
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
    const safeTotal = Number(fis.toplam_tutar || 0);
    if (!details.length) {
      const kdvOran = 20;
      const matrah = safeTotal / (1 + kdvOran / 100);
      return [{
        tarih: fis.tarih,
        isletme_adi: fis.isletme_adi,
        kategori: fis.kategori || "Genel",
        kart_son_4: fis.kart_son_4,
        kdv_oran: kdvOran,
        toplam_tutar: safeTotal,
        matrah,
        kdv_tutar: safeTotal - matrah,
        fis_id: fis.id,
        fis_no: fis.fis_no,
        proje: fis.proje,
        user_email: fis.user_email || fis.full_name || "-"
      }];
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
      return {
        tarih: fis.tarih,
        isletme_adi: fis.isletme_adi,
        kategori: g.kategori,
        kart_son_4: fis.kart_son_4,
        kdv_oran: g.kdv_oran,
        toplam_tutar: g.toplam_tutar,
        matrah,
        kdv_tutar: g.toplam_tutar - matrah,
        fis_id: fis.id,
        fis_no: fis.fis_no,
        proje: fis.proje,
        user_email: fis.user_email || fis.full_name || "-"
      };
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
      const data = await window.fetchReceipts({
        date_start: dates.start,
        date_end: `${dates.end} 23:59:59`,
        statuses: ["onaylandi", "beklemede"]
      });
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

  const onIncludeDuplicate = (fisId) => {
    setDuplicateDecisions((p) => ({ ...p, [fisId]: "include" }));
  };

  const exportPdf = () => {
    const element = document.getElementById("printable-area");
    if (!element) return;
    html2pdf().set({
      margin: 8,
      filename: `fismatik-rapor-${new Date().toISOString().slice(0, 10)}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(element).save();
  };

  const tabButton = (id, label) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      className={`px-3 py-2 rounded-lg text-sm font-semibold ${activeTab === id ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
    >
      {label}
    </button>
  );

  const renderTab = () => {
    if (!generated) return <div className="text-center py-12 text-slate-400">Önce tarih seçip rapor oluşturun.</div>;

    if (activeTab === "cards") {
      const entries = Object.entries(groups.cards);
      return entries.length ? entries.map(([key, items]) => (
        <ReportTable
          key={key}
          title={`Şirket Kartı - ${key}`}
          items={items}
          profile={profile}
          company={company}
          dates={dates}
          onExcludeDuplicate={onExcludeDuplicate}
          onIncludeDuplicate={onIncludeDuplicate}
          duplicateDecisions={duplicateDecisions}
          showMasterColumns={false}
        />
      )) : <div className="text-center py-10 text-slate-400">Şirket kartı grubu yok.</div>;
    }

    if (activeTab === "projects") {
      const entries = Object.entries(groups.projects);
      return entries.length ? entries.map(([key, items]) => (
        <ReportTable
          key={key}
          title={`Proje - ${key}`}
          items={items}
          profile={profile}
          company={company}
          dates={dates}
          onExcludeDuplicate={onExcludeDuplicate}
          onIncludeDuplicate={onIncludeDuplicate}
          duplicateDecisions={duplicateDecisions}
          showMasterColumns={false}
        />
      )) : <div className="text-center py-10 text-slate-400">Proje bazlı kayıt yok.</div>;
    }

    if (activeTab === "no-project") {
      const entries = Object.entries(groups.noProject);
      return entries.length ? entries.map(([key, items]) => (
        <ReportTable
          key={key}
          title={key}
          items={items}
          profile={profile}
          company={company}
          dates={dates}
          onExcludeDuplicate={onExcludeDuplicate}
          onIncludeDuplicate={onIncludeDuplicate}
          duplicateDecisions={duplicateDecisions}
          showMasterColumns={false}
        />
      )) : <div className="text-center py-10 text-slate-400">Projesiz/diğer kayıt yok.</div>;
    }

    return (
      <ReportTable
        title="Master List"
        items={groups.master}
        profile={profile}
        company={company}
        dates={dates}
        onExcludeDuplicate={onExcludeDuplicate}
        onIncludeDuplicate={onIncludeDuplicate}
        duplicateDecisions={duplicateDecisions}
        showMasterColumns={true}
      />
    );
  };

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500">Başlangıç</label>
          <input type="date" value={dates.start} onChange={(e) => setDates((p) => ({ ...p, start: e.target.value }))} className="block border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500">Bitiş</label>
          <input type="date" value={dates.end} onChange={(e) => setDates((p) => ({ ...p, end: e.target.value }))} className="block border rounded px-3 py-2 text-sm" />
        </div>
        <button onClick={createReport} disabled={loading || !dates.start || !dates.end} className="px-4 py-2 rounded-lg bg-brand text-white text-sm disabled:opacity-60">
          {loading ? "Hazırlanıyor..." : "Rapor Oluştur"}
        </button>
        <button onClick={exportPdf} disabled={!generated} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60">
          PDF İndir
        </button>
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
function ReportsPage({ receipts }) {
  const [filters, setFilters] = React.useState({
    query: "",
    status: "all",
    category: "all",
    dateStart: "",
    dateEnd: ""
  });

  const categories = React.useMemo(() => {
    const set = new Set(receipts.map(r => r.kategori).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [receipts]);

  const filtered = React.useMemo(() => {
    return receipts.filter((r) => {
      const matchQuery = !filters.query || [r.isletme_adi, r.id, r.fis_no].join(" ").toLowerCase().includes(filters.query.toLowerCase());
      const matchStatus = filters.status === "all" || r.durum === filters.status;
      const matchCategory = filters.category === "all" || r.kategori === filters.category;

      let matchDate = true;
      if (filters.dateStart && r.tarih) matchDate = matchDate && new Date(r.tarih) >= new Date(filters.dateStart);
      if (filters.dateEnd && r.tarih) matchDate = matchDate && new Date(r.tarih) <= new Date(filters.dateEnd);

      return matchQuery && matchStatus && matchCategory && matchDate;
    });
  }, [receipts, filters]);

  const stats = React.useMemo(() => {
    const total = filtered.reduce((acc, r) => acc + Number(r.toplam_tutar || 0), 0);
    const approved = filtered.filter(r => r.durum === 'onaylandi').length;
    const pending = filtered.filter(r => r.durum === 'beklemede').length;
    return { total, approved, pending, count: filtered.length };
  }, [filtered]);

  const exportPdf = () => {
    const reportEl = document.getElementById("report-export-area");
    if (!reportEl) return;

    const opt = {
      margin: 15,
      filename: `fismatik-rapor-${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(reportEl).save();
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand/10 rounded-lg text-brand">
            <Icon name="Filter" size={18} />
          </div>
          <h3 className="font-bold text-slate-800">Rapor Filtreleri</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Arama</label>
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                value={filters.query}
                onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 outline-none"
                placeholder="Fiş no, işletme..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Durum</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 outline-none appearance-none bg-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="beklemede">Beklemede</option>
              <option value="onaylandi">Onaylandı</option>
              <option value="reddedildi">Reddedildi</option>
              <option value="rapor alindi">Raporlandı</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kategori</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 outline-none appearance-none bg-white"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Tüm Kategoriler' : c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Başlangıç</label>
            <input
              type="date"
              value={filters.dateStart}
              onChange={(e) => setFilters(f => ({ ...f, dateStart: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bitiş</label>
            <input
              type="date"
              value={filters.dateEnd}
              onChange={(e) => setFilters(f => ({ ...f, dateEnd: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/20 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Toplam Harcama</p>
          <p className="text-xl font-black text-brand">{window.formatCurrency(stats.total)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fiş Adedi</p>
          <p className="text-xl font-black text-slate-800">{stats.count}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Onaylananlar</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <p className="text-xl font-black text-slate-800">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bekleyenler</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <p className="text-xl font-black text-slate-800">{stats.pending}</p>
          </div>
        </div>
      </section>

      {/* Report Content */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-white">
              <Icon name="FileText" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">Mali Rapor Taslağı</h3>
              <p className="text-[10px] text-slate-500 font-medium">Filtrelenmiş sonuçların listesi</p>
            </div>
          </div>
          <button
            onClick={exportPdf}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all hover:bg-slate-900 active:scale-95"
          >
            <Icon name="Download" size={16} />
            PDF Olarak Dışa Aktar
          </button>
        </div>

        <div id="report-export-area" className="p-8">
          {/* PDF Header (Hidden on screen, shown in PDF if needed, but here simple table) */}
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">FİȘ FATURA MALİ RAPOR</h1>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
              <span>TARİH: {new Date().toLocaleDateString("tr-TR")}</span>
              <span>KAYIT SAYISI: {filtered.length}</span>
            </div>
            <div className="mt-4 h-1 w-20 bg-brand mx-auto rounded-full"></div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-2 border-slate-900">
                <th className="py-4 px-2 font-black uppercase tracking-wider text-[11px]">Tarih</th>
                <th className="py-4 px-2 font-black uppercase tracking-wider text-[11px]">İşletme / Fiş No</th>
                <th className="py-4 px-2 font-black uppercase tracking-wider text-[11px]">Kategori</th>
                <th className="py-4 px-2 font-black uppercase tracking-wider text-[11px] text-center">Durum</th>
                <th className="py-4 px-2 font-black uppercase tracking-wider text-[11px] text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2 text-slate-600 font-medium">
                    {item.tarih ? new Date(item.tarih).toLocaleDateString("tr-TR") : "-"}
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-bold text-slate-800">{item.isletme_adi || "Belirsiz"}</div>
                    <div className="text-[10px] text-slate-400 font-mono italic">#{item.fis_no || item.id}</div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="text-slate-600 text-[11px] font-bold border border-slate-200 px-2 py-0.5 rounded uppercase">
                      {item.kategori || "Genel"}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-center capitalize text-[11px] font-bold text-slate-500">
                    {item.durum || "Beklemede"}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <span className="font-black text-slate-900">{window.formatCurrency(item.toplam_tutar)}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center font-bold text-slate-400 italic">
                    Görüntülenecek veri bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-900 bg-slate-50">
                  <td colSpan="4" className="py-5 px-2 text-right font-black uppercase tracking-widest text-xs">Genel Toplam</td>
                  <td className="py-5 px-2 text-right font-black text-lg text-brand tracking-tighter">
                    {window.formatCurrency(stats.total)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          <div className="mt-20 flex justify-between items-end border-t border-slate-100 pt-10">
            <div className="text-[10px] text-slate-400 font-medium italic">
              * Bu rapor Fiş Fatura (fisfatura.com) sistemi tarafından otomatik olarak oluşturulmuştur.
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Onaylayan</div>
              <div className="h-10 w-32 border-b border-slate-200"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

window.ReportsPage = ReportsPage;

