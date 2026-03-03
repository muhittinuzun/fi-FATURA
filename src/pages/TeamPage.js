function TeamPage({ profile, user }) {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [companyName, setCompanyName] = React.useState("");
  const [newUser, setNewUser] = React.useState({
    email: "",
    full_name: "",
    password: "",
    role: "user",
    phone: ""
  });
  const [error, setError] = React.useState("");

  const isAdmin = profile?.role === "admin";

  const parseList = (data) => {
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const loadTeam = async () => {
    setLoading(true);
    try {
      const data = await window.fetchTeam();
      setUsers(parseList(data));
      setCompanyName(data?.company?.company_name || data?.company?.name || "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadTeam();
  }, []);

  const handleAdd = async () => {
    if (!newUser.email || !newUser.full_name || !newUser.password) return;
    setError("");
    try {
      await window.addUser(newUser);
      setShowModal(false);
      setNewUser({ email: "", full_name: "", password: "", role: "user", phone: "" });
      setTimeout(loadTeam, 1000);
    } catch (err) {
      setError(err.message || "Kullanici eklenemedi.");
    }
  };

  const handleDelete = async (uid) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;
    setError("");
    try {
      await window.deleteUser(uid);
      setTimeout(loadTeam, 1000);
    } catch (err) {
      setError(err.message || "Kullanici silinemedi.");
    }
  };

  const roleBadge = (role) => {
    const isManager = role === "admin" || role === "manager";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isManager ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
        {isManager ? "Yönetici" : "Personel"}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-bold mb-2">Ekip Yönetimi</h2>
        <p className="text-sm text-rose-600">Bu alanı yalnızca yönetici kullanıcılar görebilir.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold">Ekip Yönetimi</h2>
          <p className="text-sm text-slate-500">
            {companyName || profile?.company_name || "Şirket"} · {users.length} kullanıcı
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold"
        >
          <Icon name="user-plus" size={16} />
          Yeni Kullanıcı Ekle
        </button>
      </div>
      {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Ad Soyad</th>
              <th className="px-4 py-3 text-left">E-Posta</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8 text-slate-400">Yükleniyor...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-slate-400">Kullanıcı bulunamadı.</td></tr>
            ) : (
              users.map((u) => {
                const active = String(u.status ?? u.is_active ?? "true") === "true";
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{u.full_name || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email || "-"}</td>
                    <td className="px-4 py-3">{roleBadge(u.role)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="px-3 py-1.5 rounded-lg text-xs border border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 grid place-items-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Yeni Kullanıcı Ekle</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded hover:bg-slate-100">
                <Icon name="x" size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={newUser.full_name} onChange={(e) => setNewUser((p) => ({ ...p, full_name: e.target.value }))} placeholder="Ad Soyad" className="border rounded-lg px-3 py-2 text-sm" />
              <input value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} placeholder="E-Posta" className="border rounded-lg px-3 py-2 text-sm" />
              <input value={newUser.phone} onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))} placeholder="Telefon" className="border rounded-lg px-3 py-2 text-sm" />
              <input value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} placeholder="Geçici Şifre" className="border rounded-lg px-3 py-2 text-sm" />
              <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm md:col-span-2">
                <option value="user">Personel</option>
                <option value="admin">Yönetici</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
              <button onClick={handleAdd} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold">Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.TeamPage = TeamPage;
