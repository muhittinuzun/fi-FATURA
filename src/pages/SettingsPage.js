function MetadataManager({ table, title, icon, companyId }) {
  const [items, setItems] = React.useState([]);
  const [newValue, setNewValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const parseItems = (data) => {
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await window.fetchMetadata(table);
      setItems(parseItems(data));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, [table, companyId]);

  const add = async () => {
    if (!newValue) return;
    const payload = table === "company_cards"
      ? { last_4_digits: newValue, bank_name: "Kredi Kartı", card_alias: `Kart ${newValue}` }
      : { name: newValue };
    await window.addMetadata(table, payload);
    setNewValue("");
    load();
  };

  const remove = async (id) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    await window.deleteMetadata(table, id);
    load();
  };

  const renderValue = (item) => {
    if (table === "company_cards") return `${item.card_alias || "Kart"} (${item.last_4_digits || "-"})`;
    if (table === "projects") return `${item.name || "-"}${item.code ? ` (${item.code})` : ""}`;
    return item.name || "-";
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name={icon} size={16} />
          <h4 className="font-semibold">{title}</h4>
        </div>
        <span className="text-xs text-slate-500">{items.length} kayıt</span>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={table === "company_cards" ? "Kart son 4 hane" : "Yeni değer"}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button onClick={add} className="px-3 py-2 rounded-lg bg-brand text-white text-sm">Ekle</button>
      </div>

      <div className="border rounded-lg divide-y divide-slate-100">
        {loading ? (
          <div className="p-3 text-sm text-slate-400">Yükleniyor...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-slate-400">Kayıt bulunamadı.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-3 flex items-center justify-between">
              <span className="text-sm">{renderValue(item)}</span>
              <button onClick={() => remove(item.id)} className="px-2 py-1 text-xs border border-rose-200 text-rose-600 rounded hover:bg-rose-50">
                Sil
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function SettingsPage({ profile }) {
  const [geminiKey, setGeminiKey] = React.useState(localStorage.getItem("fisfatura_gemini_key") || "");
  const [saved, setSaved] = React.useState(false);

  const saveGeminiKey = () => {
    localStorage.setItem("fisfatura_gemini_key", geminiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3">Profil Bilgileri</h3>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Ad Soyad</p><p className="font-medium">{profile?.full_name || "-"}</p></div>
          <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">E-Posta</p><p className="font-medium">{profile?.email || "-"}</p></div>
          <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-500">Yetki Seviyesi</p><p className="font-medium">{profile?.role === "admin" ? "Yönetici" : "Personel"}</p></div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3">Gemini API Key</h3>
        <div className="flex gap-2">
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AI_STUDIO_API_KEY"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={saveGeminiKey} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm">
            {saved ? "Kaydedildi" : "Kaydet"}
          </button>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        <MetadataManager table="categories" title="Kategoriler" icon="tag" companyId={profile?.company_id} />
        <MetadataManager table="projects" title="Projeler" icon="folder" companyId={profile?.company_id} />
        <MetadataManager table="company_cards" title="Şirket Kredi Kartları" icon="credit-card" companyId={profile?.company_id} />
      </div>
    </div>
  );
}

window.SettingsPage = SettingsPage;
