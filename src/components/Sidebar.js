const menuItems = [
  { id: "dashboard", label: "Genel Bakış", icon: "layout-dashboard" },
  { id: "receipts", label: "Fişlerim", icon: "file-text" },
  { id: "reports", label: "Raporlar", icon: "bar-chart-3" },
  { id: "team", label: "Ekip Yönetimi", icon: "users", adminOnly: true },
  { id: "settings", label: "Ayarlar", icon: "settings" },
  { id: "subscription", label: "Kontor Yukle", icon: "credit-card" },
  { id: "about", label: "Hakkında", icon: "info" },
  { id: "admin", label: "Super Admin", icon: "shield", superAdminOnly: true }
];

function Sidebar({ activeView, onChangeView, profile, isSuperAdmin, onLogout }) {
  const role = profile?.role || "user";
  const IconComp = window.Icon || (({ size = 16 }) => <span style={{ width: size, height: size }} />);

  const visibleItems = menuItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.adminOnly && role !== "admin") return false;
    return true;
  });

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }
    if (typeof window.clearSessionKey === "function") {
      window.clearSessionKey();
      window.location.reload();
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 min-h-[calc(100vh-73px)] p-4 flex flex-col justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Menü</p>
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg text-sm transition ${
                  active ? "bg-brand text-white" : "hover:bg-slate-800 text-slate-200"
                }`}
              >
                <IconComp name={item.icon} size={16} className={active ? "text-white" : "text-slate-400"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-400">{profile?.full_name || profile?.email || "Kullanıcı"}</p>
        <p className="text-xs text-slate-500 mb-3">{role === "admin" ? "Yönetici" : "Personel"}</p>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-left flex items-center gap-2"
        >
          <IconComp name="log-out" size={16} className="text-slate-300" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
