function ReceiptTable({ receipts = [], loading = false, simple = false, profile = null, onRefresh }) {
  const [filters, setFilters] = React.useState({
    tarih: "",
    isletme: "",
    kategori: "",
    kart_son_4: "",
    tutar: "",
    durum: ""
  });
  const [categories, setCategories] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [editItem, setEditItem] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [imgZoom, setImgZoom] = React.useState(1);
  const [imgRotate, setImgRotate] = React.useState(0);
  const [imgPan, setImgPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const panStartRef = React.useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const normalizeStatus = (value) => {
    const s = String(value || "").toLowerCase().trim().replaceAll("_", " ");
    return s;
  };

  const statusConfig = {
    beklemede: { label: "Beklemede", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    onaylandi: { label: "Onaylandı", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    reddedildi: { label: "Reddedildi", cls: "bg-rose-100 text-rose-700 border-rose-200" },
    mukerrer: { label: "Mükerrer", cls: "bg-orange-100 text-orange-700 border-orange-200" },
    "rapor alindi": { label: "Rapor Alındı", cls: "bg-violet-100 text-violet-700 border-violet-200" }
  };

  const parseOcrDetails = (value) => {
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

  const normalizeOcrLine = (line) => {
    if (!line) {
      return { aciklama: "", kategori: "", kdv: "", tutar: "" };
    }
    if (typeof line === "string") {
      return { aciklama: line, kategori: "", kdv: "", tutar: "" };
    }
    if (typeof line !== "object") {
      return { aciklama: String(line), kategori: "", kdv: "", tutar: "" };
    }

    const fold = (text) =>
      String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const keys = Object.keys(line);
    const pickByIncludes = (candidates) => {
      const key = keys.find((k) => {
        const folded = fold(k);
        return candidates.some((token) => folded.includes(token));
      });
      return key ? line[key] : undefined;
    };

    const aciklama = line.aciklama || line.description || line.urun || line.ad || pickByIncludes(["aciklama", "desc", "urun", "item", "name"]) || "";
    const kategori = line.kategori || line.category || pickByIncludes(["kategori", "category"]) || "";
    const kdv =
      line.kdv ??
      line.kdv_oran ??
      line.vat_rate ??
      line.kdvRate ??
      line.kdvOran ??
      line.kdv_tutar ??
      pickByIncludes(["kdv", "vat"]) ??
      "";
    const tutar =
      line.tutar ??
      line.toplam_tutar ??
      line.amount ??
      line.total ??
      line.kalem_tutar ??
      line.fiyat ??
      line.price ??
      line.matrah ??
      pickByIncludes(["tutar", "amount", "total", "fiyat", "price", "matrah"]) ??
      "";
    return { aciklama, kategori, kdv, tutar };
  };

  const getMetaList = (raw, keyHint) => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.[keyHint])) return raw[keyHint];
    if (Array.isArray(raw?.result)) return raw.result;
    return [];
  };

  React.useEffect(() => {
    const loadMetadata = async () => {
      if (simple) return;
      try {
        const [catRes, projRes] = await Promise.all([
          window.fetchMetadata ? window.fetchMetadata("categories") : Promise.resolve([]),
          window.fetchMetadata ? window.fetchMetadata("projects") : Promise.resolve([])
        ]);
        setCategories(getMetaList(catRes, "categories"));
        setProjects(getMetaList(projRes, "projects"));
      } catch (_e) {
        setCategories([]);
        setProjects([]);
      }
    };
    loadMetadata();
  }, [simple, profile?.company_id]);

  const filteredReceipts = React.useMemo(() => {
    return receipts.filter((item) => {
      const durum = normalizeStatus(item.durum);
      const tarihText = item.tarih ? new Date(item.tarih).toLocaleDateString("tr-TR") : "";
      const tFilter = filters.tarih.trim().toLowerCase();
      const isletmeFilter = filters.isletme.trim().toLowerCase();
      const kartFilter = filters.kart_son_4.trim().toLowerCase();
      const tutarFilter = filters.tutar.trim().toLowerCase();

      if (tFilter && !tarihText.toLowerCase().includes(tFilter)) return false;
      if (isletmeFilter && !String(item.isletme_adi || "").toLowerCase().includes(isletmeFilter)) return false;
      if (filters.kategori && String(item.kategori || "") !== filters.kategori) return false;
      if (kartFilter && !String(item.kart_son_4 || "").toLowerCase().includes(kartFilter)) return false;
      if (tutarFilter && !String(item.toplam_tutar || "").toLowerCase().includes(tutarFilter)) return false;
      if (filters.durum && durum !== filters.durum) return false;
      return true;
    });
  }, [receipts, filters]);

  const openEditModal = (item) => {
    let ocrLines = parseOcrDetails(item.ocr_detaylari).map(normalizeOcrLine);
    if (ocrLines.length === 0) {
      ocrLines = [{
        aciklama: item.isletme_adi || "",
        kategori: item.kategori || "",
        kdv: "",
        tutar: item.toplam_tutar ?? ""
      }];
    }
    setEditItem({
      ...item,
      proje: item.proje || "",
      ocr_detaylari: ocrLines
    });
    setImgZoom(1);
    setImgRotate(0);
    setImgPan({ x: 0, y: 0 });
  };

  const closeEditModal = () => {
    if (saving) return;
    setEditItem(null);
  };

  const getAutoCategory = (lines) => {
    const counts = {};
    (lines || []).forEach((line) => {
      const cat = String(line.kategori || "").trim();
      if (!cat) return;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return ranked.length ? ranked[0][0] : "";
  };

  const handleSave = async () => {
    if (!editItem || !window.updateReceipt) return;
    setSaving(true);
    try {
      const autoKategori = getAutoCategory(editItem.ocr_detaylari);
      const updatedData = {
        isletme_adi: editItem.isletme_adi || "",
        toplam_tutar: Number(editItem.toplam_tutar || 0),
        tarih: editItem.tarih || null,
        durum: editItem.durum || "beklemede",
        kategori: autoKategori,
        proje: editItem.proje || null,
        ocr_detaylari: editItem.ocr_detaylari || [],
        fis_no: editItem.fis_no || "",
        kart_son_4: editItem.kart_son_4 || ""
      };
      await window.updateReceipt(editItem.id, updatedData);
      setEditItem(null);
      if (typeof onRefresh === "function") {
        await onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (durum) => {
    const normalized = normalizeStatus(durum);
    const conf = statusConfig[normalized] || statusConfig.beklemede;
    return <span className={`px-2.5 py-1 rounded-full text-xs border font-semibold ${conf.cls}`}>{conf.label}</span>;
  };

  return (
    <>
      <section className="glass-panel bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Fiş Listesi</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{filteredReceipts.length} kayıt</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Tarih</th>
                <th className="px-4 py-3 text-left">Fiş No</th>
                <th className="px-4 py-3 text-left">İşletme</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Kart Son 4</th>
                <th className="px-4 py-3 text-right">Tutar</th>
                <th className="px-4 py-3 text-center">Durum</th>
                <th className="px-4 py-3 text-center">İşlem</th>
              </tr>
              {!simple && (
                <tr className="border-t border-slate-100">
                  <th className="px-4 pb-3">
                    <input
                      value={filters.tarih}
                      onChange={(e) => setFilters((p) => ({ ...p, tarih: e.target.value }))}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                      placeholder="Yıl-Ay-Gün"
                    />
                  </th>
                  <th className="px-4 pb-3"></th>
                  <th className="px-4 pb-3">
                    <input
                      value={filters.isletme}
                      onChange={(e) => setFilters((p) => ({ ...p, isletme: e.target.value }))}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                      placeholder="İşletme ara"
                    />
                  </th>
                  <th className="px-4 pb-3">
                    <select
                      value={filters.kategori}
                      onChange={(e) => setFilters((p) => ({ ...p, kategori: e.target.value }))}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                    >
                      <option value="">Tümü</option>
                      {categories.map((c) => (
                        <option key={c.id || c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-4 pb-3">
                    <input
                      value={filters.kart_son_4}
                      onChange={(e) => setFilters((p) => ({ ...p, kart_son_4: e.target.value }))}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                      placeholder="Kart son 4"
                    />
                  </th>
                  <th className="px-4 pb-3">
                    <input
                      value={filters.tutar}
                      onChange={(e) => setFilters((p) => ({ ...p, tutar: e.target.value }))}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                      placeholder="Tutar"
                    />
                  </th>
                  <th className="px-4 pb-3">
                    <select
                      value={filters.durum}
                      onChange={(e) => setFilters((p) => ({ ...p, durum: e.target.value }))}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                    >
                      <option value="">Hepsi</option>
                      <option value="beklemede">Beklemede</option>
                      <option value="onaylandi">Onaylandı</option>
                      <option value="reddedildi">Reddedildi</option>
                      <option value="mukerrer">Mükerrer</option>
                      <option value="rapor alindi">Rapor Alındı</option>
                    </select>
                  </th>
                  <th className="px-4 pb-3"></th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8 text-slate-400">Yükleniyor...</td></tr>
              ) : filteredReceipts.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-slate-400">Fiş bulunamadı.</td></tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="group hover:bg-slate-50">
                    <td className="px-4 py-3">{receipt.tarih ? new Date(receipt.tarih).toLocaleDateString("tr-TR") : "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{receipt.fis_no || "-"}</td>
                    <td className="px-4 py-3 font-medium">{receipt.isletme_adi || "-"}</td>
                    <td className="px-4 py-3">{receipt.kategori || "-"}</td>
                    <td className="px-4 py-3">{receipt.kart_son_4 || "-"}</td>
                    <td className="px-4 py-3 text-right">{window.formatCurrency ? window.formatCurrency(receipt.toplam_tutar) : receipt.toplam_tutar}</td>
                    <td className="px-4 py-3 text-center">{statusBadge(receipt.durum)}</td>
                    <td className="px-4 py-3 text-center">
                      {!simple && (
                        <button
                          onClick={() => openEditModal(receipt)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs hover:bg-slate-100"
                        >
                          Düzenle
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex">
          <div className="w-1/2 bg-slate-900 relative overflow-hidden">
            <div
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                setIsPanning(true);
                panStartRef.current = { x: e.clientX, y: e.clientY, panX: imgPan.x, panY: imgPan.y };
              }}
              onMouseMove={(e) => {
                if (!isPanning) return;
                const dx = e.clientX - panStartRef.current.x;
                const dy = e.clientY - panStartRef.current.y;
                setImgPan({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
              }}
              onMouseUp={() => setIsPanning(false)}
              onMouseLeave={() => setIsPanning(false)}
            >
              {editItem.gorsel_url ? (
                <img
                  src={editItem.gorsel_url}
                  alt="Fiş"
                  className="absolute left-1/2 top-1/2 max-w-none"
                  style={{
                    transform: `translate(calc(-50% + ${imgPan.x}px), calc(-50% + ${imgPan.y}px)) scale(${imgZoom}) rotate(${imgRotate}deg)`,
                    transformOrigin: "center center"
                  }}
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-slate-500">Görsel bulunamadı</div>
              )}
            </div>

            <div className="absolute top-4 left-4 flex gap-2">
              <button onClick={() => setImgZoom((z) => Math.min(3, z + 0.1))} className="px-2 py-1 bg-black/40 text-white rounded">+</button>
              <button onClick={() => setImgZoom((z) => Math.max(0.5, z - 0.1))} className="px-2 py-1 bg-black/40 text-white rounded">-</button>
              <button onClick={() => setImgRotate((r) => r + 90)} className="px-2 py-1 bg-black/40 text-white rounded">↻</button>
              <button onClick={() => { setImgZoom(1); setImgRotate(0); setImgPan({ x: 0, y: 0 }); }} className="px-2 py-1 bg-black/40 text-white rounded">Reset</button>
              {editItem.gorsel_url && (
                <a href={editItem.gorsel_url} target="_blank" rel="noreferrer" className="px-2 py-1 bg-black/40 text-white rounded">
                  Yeni sekme
                </a>
              )}
            </div>
          </div>

          <div className="w-1/2 bg-white flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Fiş Düzenle #{editItem.id}</h3>
              <button onClick={closeEditModal} className="px-3 py-1.5 text-sm border rounded">Kapat</button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">İşletme</label>
                  <input value={editItem.isletme_adi || ""} onChange={(e) => setEditItem((p) => ({ ...p, isletme_adi: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Tarih</label>
                  <input type="datetime-local" value={editItem.tarih ? new Date(editItem.tarih).toISOString().slice(0, 16) : ""} onChange={(e) => setEditItem((p) => ({ ...p, tarih: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Fiş No</label>
                  <input value={editItem.fis_no || ""} onChange={(e) => setEditItem((p) => ({ ...p, fis_no: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Tutar</label>
                  <input type="number" value={editItem.toplam_tutar || 0} onChange={(e) => setEditItem((p) => ({ ...p, toplam_tutar: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Kart Son 4</label>
                  <input value={editItem.kart_son_4 || ""} onChange={(e) => setEditItem((p) => ({ ...p, kart_son_4: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Durum</label>
                  <select value={normalizeStatus(editItem.durum)} onChange={(e) => setEditItem((p) => ({ ...p, durum: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="beklemede">beklemede</option>
                    <option value="onaylandi">onaylandi</option>
                    <option value="reddedildi">reddedildi</option>
                    <option value="mukerrer">mukerrer</option>
                    <option value="rapor alindi">rapor alindi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Proje</label>
                  <select value={editItem.proje || ""} onChange={(e) => setEditItem((p) => ({ ...p, proje: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Seçiniz</option>
                    <option value="Genel">Genel</option>
                    {projects.map((proj) => (
                      <option key={proj.id || proj.name} value={proj.name}>{proj.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Kategori (Otomatik)</label>
                  <input disabled value={getAutoCategory(editItem.ocr_detaylari)} className="w-full border rounded px-3 py-2 text-sm bg-slate-50" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-700">Harcama Kalemleri</h4>
                  <button
                    onClick={() => setEditItem((p) => ({
                      ...p,
                      ocr_detaylari: [...(p.ocr_detaylari || []), { aciklama: "", kategori: "", kdv: "", tutar: "" }]
                    }))}
                    className="px-3 py-1.5 text-xs border rounded hover:bg-slate-50"
                  >
                    Yeni Satır Ekle
                  </button>
                </div>
                <div className="border rounded overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-50 text-xs text-slate-500 font-semibold">
                    <div className="col-span-4 p-2 border-r">Açıklama</div>
                    <div className="col-span-3 p-2 border-r">Kategori</div>
                    <div className="col-span-2 p-2 border-r">KDV</div>
                    <div className="col-span-2 p-2 border-r">Tutar</div>
                    <div className="col-span-1 p-2 text-center">Sil</div>
                  </div>
                  {(editItem.ocr_detaylari || []).map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 border-t">
                      <div className="col-span-4 p-1 border-r">
                        <input value={line.aciklama || ""} onChange={(e) => setEditItem((p) => {
                          const next = [...(p.ocr_detaylari || [])];
                          next[idx] = { ...next[idx], aciklama: e.target.value };
                          return { ...p, ocr_detaylari: next };
                        })} className="w-full text-sm px-2 py-1 border rounded" />
                      </div>
                      <div className="col-span-3 p-1 border-r">
                        <select value={line.kategori || ""} onChange={(e) => setEditItem((p) => {
                          const next = [...(p.ocr_detaylari || [])];
                          next[idx] = { ...next[idx], kategori: e.target.value };
                          return { ...p, ocr_detaylari: next };
                        })} className="w-full text-sm px-2 py-1 border rounded">
                          <option value="">Seçiniz</option>
                          {categories.map((c) => (
                            <option key={c.id || c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 p-1 border-r">
                        <input value={line.kdv ?? ""} onChange={(e) => setEditItem((p) => {
                          const next = [...(p.ocr_detaylari || [])];
                          next[idx] = { ...next[idx], kdv: e.target.value };
                          return { ...p, ocr_detaylari: next };
                        })} className="w-full text-sm px-2 py-1 border rounded" />
                      </div>
                      <div className="col-span-2 p-1 border-r">
                        <input type="number" value={line.tutar ?? ""} onChange={(e) => setEditItem((p) => {
                          const next = [...(p.ocr_detaylari || [])];
                          next[idx] = { ...next[idx], tutar: e.target.value };
                          return { ...p, ocr_detaylari: next };
                        })} className="w-full text-sm px-2 py-1 border rounded" />
                      </div>
                      <div className="col-span-1 p-1 grid place-items-center">
                        <button onClick={() => setEditItem((p) => {
                          const next = [...(p.ocr_detaylari || [])];
                          next.splice(idx, 1);
                          return { ...p, ocr_detaylari: next };
                        })} className="text-rose-600 text-xs px-2 py-1 rounded hover:bg-rose-50">
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                  {(editItem.ocr_detaylari || []).length === 0 && (
                    <div className="p-3 text-xs text-slate-400">Satır detayı bulunmuyor.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={closeEditModal} className="px-4 py-2 border rounded-lg">İptal</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-brand text-white disabled:opacity-60">
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

window.ReceiptTable = ReceiptTable;
