function ReportsPageV3({ company }) {
  const [dates, setDates] = React.useState({ start: "", end: "" });
  const [loading, setLoading] = React.useState(false);
  const [generated, setGenerated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("cards");
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState({
    cards: [],
    projects: [],
    master: [],
    kdvSummary: []
  });

  const parseJson = (value, fallback = []) => {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch (_e) {
        return fallback;
      }
    }
    return fallback;
  };

  const parseReceiptLines = (receipt) => {
    const raw = receipt?.ocr_detaylari;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") return parseJson(raw, []);
    if (typeof raw === "object") {
      if (Array.isArray(raw.urunler)) return raw.urunler;
      if (Array.isArray(raw.items)) return raw.items;
      if (Array.isArray(raw.lines)) return raw.lines;
    }
    return [];
  };

  const normalizeLine = (line, fallbackCategory) => {
    if (!line || typeof line !== "object") {
      return {
        kategori: fallbackCategory || "Genel",
        kdvOran: 20,
        toplam: 0
      };
    }
    const kategori = String(
      line.kategori ||
      line.category ||
      line.kategori_adi ||
      line.kalem_kategori ||
      fallbackCategory ||
      "Genel"
    ).trim() || "Genel";
    const kdvOran = Number(line.kdv ?? line.kdv_oran ?? line.vat_rate ?? 20) || 20;
    const toplam = Number(
      line.tutar ??
      line.toplam_tutar ??
      line.amount ??
      line.total ??
      0
    ) || 0;
    return { kategori, kdvOran, toplam };
  };

  const calcVatBreakdown = (total, kdvRate) => {
    const rate = Number(kdvRate || 0);
    const gross = Number(total || 0);
    const matrah = rate > 0 ? gross / (1 + rate / 100) : gross;
    const kdvTutari = gross - matrah;
    return { matrah, kdvTutari };
  };

  const isValidProject = (value) => {
    const v = String(value || "").trim();
    if (!v) return false;
    const lowered = v.toLowerCase();
    return lowered !== "secilmedi" && lowered !== "seçiniz";
  };

  const sortByDate = (a, b) => {
    const ta = a.tarih ? new Date(a.tarih).getTime() : 0;
    const tb = b.tarih ? new Date(b.tarih).getTime() : 0;
    return ta - tb;
  };

  const buildReportData = (receipts) => {
    const approved = (receipts || []).filter((r) => String(r?.durum || "").toLowerCase() === "onaylandi");

    const cards = approved
      .filter((r) => String(r.kart_son_4 || "").trim() !== "")
      .map((r) => ({
        ...r,
        kart_son_4: String(r.kart_son_4 || "").trim()
      }))
      .sort((a, b) => {
        const cardComp = String(a.kart_son_4).localeCompare(String(b.kart_son_4), "tr");
        if (cardComp !== 0) return cardComp;
        return sortByDate(a, b);
      });

    const projects = approved
      .filter((r) => String(r.kart_son_4 || "").trim() === "" || isValidProject(r.proje))
      .map((r) => ({
        ...r,
        projeGrup: isValidProject(r.proje) ? String(r.proje).trim() : "Projesiz"
      }))
      .sort((a, b) => {
        const projComp = String(a.projeGrup).localeCompare(String(b.projeGrup), "tr");
        if (projComp !== 0) return projComp;
        return sortByDate(a, b);
      });

    const master = approved
      .map((r) => ({
        ...r,
        kart_son_4: String(r.kart_son_4 || "").trim(),
        proje: isValidProject(r.proje) ? String(r.proje).trim() : "Projesiz"
      }))
      .sort((a, b) => {
        const cardComp = String(a.kart_son_4 || "9999").localeCompare(String(b.kart_son_4 || "9999"), "tr");
        if (cardComp !== 0) return cardComp;
        const dateComp = sortByDate(a, b);
        if (dateComp !== 0) return dateComp;
        return String(a.proje || "").localeCompare(String(b.proje || ""), "tr");
      });

    const kdvMap = {};
    approved.forEach((receipt) => {
      const lines = parseReceiptLines(receipt);
      const fallbackCategory = receipt.kategori || "Genel";
      if (!lines.length) {
        const kdvOran = 20;
        const toplam = Number(receipt.toplam_tutar || receipt.total_amount || 0) || 0;
        const key = `${fallbackCategory}|${kdvOran}`;
        if (!kdvMap[key]) kdvMap[key] = { kategori: fallbackCategory, kdvOran, toplam: 0 };
        kdvMap[key].toplam += toplam;
        return;
      }
      lines.forEach((line) => {
        const normalized = normalizeLine(line, fallbackCategory);
        const key = `${normalized.kategori}|${normalized.kdvOran}`;
        if (!kdvMap[key]) {
          kdvMap[key] = {
            kategori: normalized.kategori,
            kdvOran: normalized.kdvOran,
            toplam: 0
          };
        }
        kdvMap[key].toplam += normalized.toplam;
      });
    });

    const kdvSummary = Object.values(kdvMap)
      .map((item) => {
        const vat = calcVatBreakdown(item.toplam, item.kdvOran);
        return {
          ...item,
          matrah: vat.matrah,
          kdvTutari: vat.kdvTutari
        };
      })
      .sort((a, b) => {
        const catComp = String(a.kategori).localeCompare(String(b.kategori), "tr");
        if (catComp !== 0) return catComp;
        return Number(a.kdvOran) - Number(b.kdvOran);
      });

    return { cards, projects, master, kdvSummary };
  };

  const createReport = async () => {
    if (!dates.start || !dates.end) return;
    setLoading(true);
    setError("");
    try {
      const response = await window.fetchReceipts({
        date_start: dates.start,
        date_end: `${dates.end} 23:59:59`
      });
      const receipts = response?.receipts || [];
      const next = buildReportData(receipts);
      setData(next);
      setGenerated(true);
    } catch (err) {
      setError(err.message || "Rapor olusturulamadi.");
    } finally {
      setLoading(false);
    }
  };

  const formatTry = (value) => (window.formatCurrency ? window.formatCurrency(value) : `${Number(value || 0).toFixed(2)} TL`);
  const formatDate = (value) => (value ? new Date(value).toLocaleDateString("tr-TR") : "-");

  const exportPdf = () => window.print();

  const exportExcel = () => {
    if (!window.XLSX) {
      setError("Excel kutuphanesi yuklenemedi (XLSX).");
      return;
    }
    const masterRows = data.master.map((item) => ({
      Tarih: formatDate(item.tarih),
      FisNo: item.fis_no || "",
      Isletme: item.isletme_adi || "",
      Kategori: item.kategori || "",
      KartSon4: item.kart_son_4 || "",
      Proje: item.proje || "Projesiz",
      Tutar: Number(item.toplam_tutar || item.total_amount || 0),
      Durum: item.durum || ""
    }));

    const kdvRows = data.kdvSummary.map((item) => ({
      Kategori: item.kategori,
      KDV: `%${item.kdvOran}`,
      Toplam: Number(item.toplam || 0),
      KDVTutari: Number(item.kdvTutari || 0),
      Matrah: Number(item.matrah || 0)
    }));

    const wb = window.XLSX.utils.book_new();
    const masterSheet = window.XLSX.utils.json_to_sheet(masterRows);
    const kdvSheet = window.XLSX.utils.json_to_sheet(kdvRows);
    window.XLSX.utils.book_append_sheet(wb, masterSheet, "Master List");
    window.XLSX.utils.book_append_sheet(wb, kdvSheet, "KDV Icmali");
    window.XLSX.writeFile(wb, `fismatik-rapor-${new Date().toISOString().slice(0, 10)}.xlsx`);
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

  const renderRows = (items) => {
    if (!items.length) {
      return <tr><td colSpan="8" className="py-8 text-center text-slate-400">Kayit bulunamadi.</td></tr>;
    }
    return items.map((item, idx) => (
      <tr key={`${item.id || item.fis_no || "fis"}-${idx}`} className="border-t border-slate-100">
        <td className="py-2">{formatDate(item.tarih)}</td>
        <td className="py-2">{item.fis_no || "-"}</td>
        <td className="py-2">{item.isletme_adi || "-"}</td>
        <td className="py-2">{item.kart_son_4 || "-"}</td>
        <td className="py-2">{item.proje || "Projesiz"}</td>
        <td className="py-2">{item.kategori || "-"}</td>
        <td className="py-2 text-right">{formatTry(item.toplam_tutar || item.total_amount || 0)}</td>
        <td className="py-2 text-center">onaylandi</td>
      </tr>
    ));
  };

  const activeItems = activeTab === "cards"
    ? data.cards
    : activeTab === "projects"
      ? data.projects
      : data.master;

  const totalActive = activeItems.reduce((sum, row) => sum + Number(row.toplam_tutar || row.total_amount || 0), 0);
  const totalKdvSummary = data.kdvSummary.reduce((sum, row) => sum + Number(row.toplam || 0), 0);

  return (
    <div className="space-y-4 reports-v3-page">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          header, aside { display: none !important; }
          main { padding: 0 !important; }
          .report-print-area {
            border: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          body { background: #fff !important; }
        }
      `}</style>

      <section className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end no-print">
        <div>
          <label className="text-xs text-slate-500">Baslangic</label>
          <input
            type="date"
            value={dates.start}
            onChange={(e) => setDates((p) => ({ ...p, start: e.target.value }))}
            className="block border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Bitis</label>
          <input
            type="date"
            value={dates.end}
            onChange={(e) => setDates((p) => ({ ...p, end: e.target.value }))}
            className="block border rounded px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={createReport}
          disabled={loading || !dates.start || !dates.end}
          className="px-4 py-2 rounded-lg bg-brand text-white text-sm disabled:opacity-60"
        >
          {loading ? "Hazirlaniyor..." : "Rapor Olustur"}
        </button>
        <div className="ml-auto flex gap-2">
          <button onClick={exportPdf} disabled={!generated} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60">PDF Indir</button>
          <button onClick={exportExcel} disabled={!generated} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-60">Excel Indir</button>
        </div>
      </section>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <section id="printable-area" className="bg-white rounded-xl border border-slate-200 p-4 report-print-area">
        <div className="no-print flex flex-wrap gap-2 mb-4">
          {tabButton("cards", "Sirket Kartlari")}
          {tabButton("projects", "Proje Harcamalari")}
          {tabButton("master", "Master List")}
        </div>

        {!generated ? (
          <div className="text-center py-12 text-slate-400">Once tarih secip rapor olusturun.</div>
        ) : (
          <>
            <div className="border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-xl font-bold text-slate-900">{company?.company_name || company?.name || "Sirket Raporu"}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Tarih Araligi: {dates.start || "-"} - {dates.end || "-"} | Yalnizca onaylandi durumundaki fisler dahil edilir.
              </p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs">
                <thead className="border-b-2 border-slate-200 text-slate-500 uppercase">
                  <tr>
                    <th className="py-2 text-left">Tarih</th>
                    <th className="py-2 text-left">Fis No</th>
                    <th className="py-2 text-left">Isletme</th>
                    <th className="py-2 text-left">Kart Son 4</th>
                    <th className="py-2 text-left">Proje</th>
                    <th className="py-2 text-left">Kategori</th>
                    <th className="py-2 text-right">Toplam</th>
                    <th className="py-2 text-center">Durum</th>
                  </tr>
                </thead>
                <tbody>{renderRows(activeItems)}</tbody>
                <tfoot className="border-t-2 border-slate-800 font-bold">
                  <tr>
                    <td colSpan="6" className="py-3 text-right">GENEL TOPLAM:</td>
                    <td className="py-3 text-right">{formatTry(totalActive)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-slate-800 mb-2">KDV ve Kategori Icmali</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b-2 border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="py-2 text-left">Kategori</th>
                      <th className="py-2 text-center">KDV</th>
                      <th className="py-2 text-right">Toplam</th>
                      <th className="py-2 text-right">KDV Tutari</th>
                      <th className="py-2 text-right">Matrah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.kdvSummary.length ? data.kdvSummary.map((row, idx) => (
                      <tr key={`${row.kategori}-${row.kdvOran}-${idx}`}>
                        <td className="py-2">{row.kategori}</td>
                        <td className="py-2 text-center">%{row.kdvOran}</td>
                        <td className="py-2 text-right">{formatTry(row.toplam)}</td>
                        <td className="py-2 text-right">{formatTry(row.kdvTutari)}</td>
                        <td className="py-2 text-right">{formatTry(row.matrah)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="py-6 text-center text-slate-400">Icmal verisi bulunamadi.</td></tr>
                    )}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-800 font-bold">
                    <tr>
                      <td colSpan="2" className="py-3 text-right">GENEL TOPLAM:</td>
                      <td className="py-3 text-right">{formatTry(totalKdvSummary)}</td>
                      <td className="py-3 text-right">{formatTry(data.kdvSummary.reduce((s, r) => s + Number(r.kdvTutari || 0), 0))}</td>
                      <td className="py-3 text-right">{formatTry(data.kdvSummary.reduce((s, r) => s + Number(r.matrah || 0), 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <div className="border-t border-slate-300 pt-2">Genel Toplam: <b>{formatTry(totalActive)}</b></div>
              <div className="border-t border-slate-300 pt-2 text-center">Onaylayan: __________________</div>
              <div className="border-t border-slate-300 pt-2 text-right">Duzenleyen: __________________</div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

window.ReportsPageV3 = ReportsPageV3;
window.ReportsPage = ReportsPageV3;
