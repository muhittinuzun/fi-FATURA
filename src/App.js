function App() {
  const {
    adminDashboardRequest,
    bootstrapRequest,
    clearSessionKey,
    fetchReceipts,
    getSessionKey,
    loginRequest,
    registerRequest,
    forgotPasswordRequest
  } = window;
  const [profile, setProfile] = React.useState(null);
  const [company, setCompany] = React.useState(null);
  const [receipts, setReceipts] = React.useState([]);
  const [usageLogs, setUsageLogs] = React.useState([]);
  const [allCompanies, setAllCompanies] = React.useState([]);
  const [storageSummary, setStorageSummary] = React.useState(null);
  const [activeView, setActiveView] = React.useState("dashboard");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [loginForm, setLoginForm] = React.useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = React.useState({ company_name: "", email: "", password: "", telegram_id: "" });
  const [showRegister, setShowRegister] = React.useState(false);
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotMessage, setForgotMessage] = React.useState("");
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [sessionKey, setSessionKeyState] = React.useState(getSessionKey());

  const isSuperAdmin = profile?.is_super_admin === true || (profile?.role === "admin" && !profile?.company_id);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const bootstrap = await bootstrapRequest();
      setProfile(bootstrap.profile || null);
      setCompany(bootstrap.company || null);
      setUsageLogs(bootstrap.usage_logs || []);

      const bootstrapReceipts = Array.isArray(bootstrap.receipts) ? bootstrap.receipts : [];
      if (bootstrapReceipts.length > 0) {
        setReceipts(bootstrapReceipts);
      } else if (typeof fetchReceipts === "function") {
        try {
          const receiptRes = await fetchReceipts({});
          setReceipts(receiptRes?.receipts || []);
        } catch (_receiptErr) {
          setReceipts([]);
        }
      } else {
        setReceipts([]);
      }

      if (bootstrap.profile?.is_super_admin) {
        const adminData = await adminDashboardRequest();
        setAllCompanies(adminData.companies || []);
        setUsageLogs(adminData.usage_logs || bootstrap.usage_logs || []);
        setStorageSummary(adminData.storage || null);
      } else {
        setAllCompanies([]);
        setStorageSummary(null);
      }
    } catch (err) {
      setError(err.message || "Veri yuklenemedi.");
      clearSessionKey();
      setSessionKeyState("");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!sessionKey) {
      setLoading(false);
      return;
    }
    loadData();
  }, [loadData, sessionKey]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await loginRequest(loginForm.email, loginForm.password);
      setSessionKeyState(getSessionKey());
      await loadData();
    } catch (err) {
      setError(err.message || "Giris basarisiz.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerRequest(registerForm);
      setShowRegister(false);
      setRegisterForm({ company_name: "", email: "", password: "", telegram_id: "" });
    } catch (err) {
      setError(err.message || "Kayit olusturulamadi.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setError("");
    setForgotMessage("");
    try {
      await forgotPasswordRequest(forgotEmail);
      setForgotMessage("Sifre yenileme talebiniz alindi. E-posta kutunuzu kontrol edin.");
    } catch (err) {
      setError(err.message || "Sifremi unuttum akisi baslatilamadi.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleUpdateReceipt = async (receiptId, data) => {
    try {
      await window.updateReceipt(receiptId, data);
      await loadData();
    } catch (err) {
      setError(err.message || "Guncelleme basarisiz.");
    }
  };

  const handleUpdateStatus = async (receiptId, status) => {
    try {
      await window.updateReceiptStatus(receiptId, status);
      await loadData();
    } catch (err) {
      setError(err.message || "Durum guncelleme basarisiz.");
    }
  };

  const handleDeleteReceipt = async (receiptId) => {
    if (!confirm("Bu fisi silmek istediginizden emin misiniz?")) return;
    try {
      // TODO: Backend'de delete_receipt action'i yoksa gateway 404 verecek
      await window.gatewayRequest("delete_receipt", { receipt_id: receiptId });
      await loadData();
    } catch (err) {
      setError(err.message || "Silme islemi basarisiz.");
    }
  };

  const handleLogout = () => {

    clearSessionKey();
    setSessionKeyState("");
    setProfile(null);
    setCompany(null);
    setReceipts([]);
    setUsageLogs([]);
    setAllCompanies([]);
    setStorageSummary(null);
    setActiveView("dashboard");
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Yukleniyor...</div>;

  if (!sessionKey || !profile) {
    return (
      <main className="min-h-screen grid place-items-center p-4">
        {!showRegister ? (
          <form onSubmit={handleLogin} className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-bold">Fismatik Giris</h2>
            <input
              type="email"
              required
              placeholder="E-posta"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={loginForm.email}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              type="password"
              required
              placeholder="Sifre"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <button className="w-full bg-brand text-white rounded-lg px-3 py-2">Giris Yap</button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setShowRegister(true)} className="w-full text-sm underline">
                Yeni Kayit
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword((prev) => !prev);
                  setForgotMessage("");
                }}
                className="w-full text-sm underline"
              >
                Sifremi Unuttum
              </button>
            </div>

            {showForgotPassword && (
              <div className="mt-2 p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <p className="text-sm font-medium">Sifre yenileme</p>
                <input
                  type="email"
                  required
                  placeholder="Kayitli e-posta adresiniz"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={!forgotEmail || forgotLoading}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 text-sm disabled:opacity-60"
                >
                  {forgotLoading ? "Gonderiliyor..." : "Sifre Sifirlama Linki Gonder"}
                </button>
                {forgotMessage && <p className="text-xs text-green-700">{forgotMessage}</p>}
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="text-xl font-bold">Yeni Sirket Kaydi</h2>
            <input
              required
              placeholder="Sirket adi"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={registerForm.company_name}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, company_name: e.target.value }))}
            />
            <input
              type="email"
              required
              placeholder="E-posta"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={registerForm.email}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              type="password"
              required
              placeholder="Sifre"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <input
              placeholder="Telegram ID (opsiyonel)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={registerForm.telegram_id}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, telegram_id: e.target.value }))}
            />
            <button className="w-full bg-brand text-white rounded-lg px-3 py-2">Kayit Olustur</button>
            <button type="button" onClick={() => setShowRegister(false)} className="w-full text-sm underline">
              Girise Don
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
      </main>
    );
  }

  let page = null;
  if (activeView === "reports") {
    const ActiveReportsPage = window.ReportsPageV2 || window.ReportsPage;
    page = ActiveReportsPage
      ? <ActiveReportsPage profile={profile} company={company} />
      : <p className="text-sm text-red-600">Rapor sayfasi yuklenemedi.</p>;
  }
  if (activeView === "receipts") page = <ReceiptsPage profile={profile} />;
  if (activeView === "team") page = <TeamPage profile={profile} user={profile} />;
  if (activeView === "settings") page = <SettingsPage profile={profile} />;
  if (activeView === "about") page = <AboutPage />;
  if (activeView === "subscription") page = <SubscriptionPage company={company} />;
  if (activeView === "admin") {
    page = isSuperAdmin
      ? <AdminDashboard companies={allCompanies} usageLogs={usageLogs} storageSummary={storageSummary} />
      : <p className="text-sm text-red-600">Bu alan yalnizca super admin icin.</p>;
  }
  if (activeView === "dashboard") {
    page = (
      <CustomerDashboard
        company={company}
        usageLogs={usageLogs}
        receipts={receipts}
        onUpdateReceipt={handleUpdateReceipt}
        onUpdateStatus={handleUpdateStatus}
        onDeleteReceipt={handleDeleteReceipt}
        receiptTableSimple={true}
        onRefreshReceipts={loadData}
        profile={profile}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <Header companyName={company?.company_name || company?.name || "Super Admin Paneli"} role={profile?.role || "-"} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar
          activeView={activeView}
          onChangeView={setActiveView}
          profile={profile}
          isSuperAdmin={isSuperAdmin}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-6">
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          {page}
        </main>
      </div>
    </div>
  );
}

window.App = App;
