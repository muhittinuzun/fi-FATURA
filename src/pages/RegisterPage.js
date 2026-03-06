function RegisterPage({ onNavigate }) {
  const [form, setForm] = React.useState({
    role: "company_admin",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    taxOffice: "",
    taxId: ""
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.companyName ||
      !form.taxOffice ||
      !form.taxId
    ) {
      return "Lutfen zorunlu alanlari doldurun.";
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) return "Gecerli bir e-posta adresi girin.";

    const taxDigits = String(form.taxId || "").replace(/\D/g, "");
    if (!(taxDigits.length === 10 || taxDigits.length === 11)) {
      return "Vergi numarasi 10 veya 11 haneli olmalidir.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await window.apiRegister(form);
      if (result && typeof result === "object" && result.ok === false) {
        setError(result.message || "Kayit islemi basarisiz.");
        return;
      }
      setSuccess("Kayit basarili. Giris ekranina yonlendiriliyorsunuz...");
      setTimeout(() => {
        if (typeof onNavigate === "function") onNavigate("login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Kayit islemi sirasinda bir hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Yeni Kayit Olustur</h2>
          <p className="text-sm text-slate-500 mt-1">Isletme veya Mali Musavir hesabi olusturabilirsiniz.</p>
        </div>

        <section className="grid md:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              checked={form.role === "company_admin"}
              onChange={() => setField("role", "company_admin")}
            />
            <span className="text-sm font-medium">Isletme Hesabi</span>
          </label>
          <label className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              checked={form.role === "mali_musavir"}
              onChange={() => setField("role", "mali_musavir")}
            />
            <span className="text-sm font-medium">Mali Musavir Hesabi</span>
          </label>
        </section>

        <section className="grid md:grid-cols-2 gap-3">
          <input
            required
            placeholder="Adiniz"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
          />
          <input
            required
            placeholder="Soyadiniz"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
          />
          <input
            required
            type="email"
            placeholder="Mail adresiniz"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
          <input
            required
            placeholder="Telefon numaraniz"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Sifreniz"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 md:col-span-2"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
          />
        </section>

        <section className="grid md:grid-cols-2 gap-3">
          <input
            required
            placeholder="Sirket/Ofis unvaniniz"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.companyName}
            onChange={(e) => setField("companyName", e.target.value)}
          />
          <input
            required
            placeholder="Vergi dairesi"
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.taxOffice}
            onChange={(e) => setField("taxOffice", e.target.value)}
          />
          <input
            required
            placeholder="Vergi numarasi (10 veya 11 hane)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 md:col-span-2"
            value={form.taxId}
            onChange={(e) => setField("taxId", e.target.value)}
          />
        </section>

        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div>}
        {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{success}</div>}

        <div className="grid md:grid-cols-2 gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-lg px-3 py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "Kaydediliyor..." : "Kayit Olustur"}
          </button>
          <button
            type="button"
            onClick={() => typeof onNavigate === "function" && onNavigate("login")}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            Zaten hesabim var, Giris Yap
          </button>
        </div>
      </form>
    </main>
  );
}

window.RegisterPage = RegisterPage;
