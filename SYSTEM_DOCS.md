# FişFatura - Sistem Dokümantasyonu (Güncel)

> [!IMPORTANT]
> Proje Zero-Build mimaridedir. `npm/vite/webpack` yoktur.
> Frontend tamamen `index.html` icinden CDN + `type="text/babel"` scriptleriyle calisir.

---

## 1) Mimari Ozeti

- **Frontend:** Global `window.*` modeline dayali React bilesenleri.
- **Backend Gateway:** n8n webhook uzerinden action tabanli API.
- **Veritabani:** PostgreSQL.
- **Dosya akislari:** Telegram -> OCR/AI -> DB/S3 workflow'lari (backend tarafi).
- **Oturum:** `session_key` localStorage (`fismatik_session_key`) uzerinden.

---

## 2) Frontend Script Yukleme Sirasi

`index.html` icinde sirali yukleme:

1. `src/config.js`
2. `src/utils/format.js`
3. `src/api.js`
4. `src/components/*`
5. `src/pages/*`
6. `src/App.js`
7. `src/main.js`

Aktif rapor resolve sirasi:

- `ReportsPageV3` -> `ReportsPageV2` -> `ReportsPage`

---

## 3) Sayfa Haritasi ve Rota Akisi

## Session yoksa

- Varsayilan sayfa: `landing`
- `LandingPage` uzerinden:
  - `Giris Yap` -> `login`
  - `Kayit Ol` -> `register`

## Session varsa

- `bootstrapRequest()` sonrasinda role bazli yonlendirme:
  - `is_super_admin === true` veya `role === "admin"` -> `AdminDashboard`
  - `role === "mali_musavir"` -> `AdvisorDashboard`
  - diger roller -> `CustomerDashboard`

---

## 4) Ana Bilesenler

- `LandingPage`: modern vitrin + Telegram QR + CTA.
- `RegisterPage`: rol secimli kayit formu (`company_admin` / `mali_musavir`).
- `CustomerDashboard`: kalan kontor + son 20 fis ozeti.
- `ReceiptsPage` / `ReceiptTable`:
  - filtreleme
  - hizli durum aksiyonlari (`onaylandi`, `mukerrer`, `cikartildi`, `beklemede`)
  - fis duzenleme modalı
- `ReportsPageV3`:
  - yalnizca `onaylandi` fisler
  - 3 sekme: Sirket Kartlari / Proje Harcamalari / Master List
  - KDV ve Kategori Icmali
  - PDF (`window.print`) + Excel (`window.XLSX`) export
- `SettingsPage`: metadata CRUD (`categories`, `projects`, `company_cards`)
- `TeamPage`: ekip yonetimi
- `SubscriptionPage`: kontor paketleri vitrini (statik satin alma aksiyonu)
- `AdvisorDashboard`: musavir paneli (simdilik statik musteri listesi)

---

## 5) API Sozlesmesi

Gateway istek formati:

```json
{
  "action": "string",
  "payload": {},
  "session_key": "string"
}
```

`src/api.js` guncel davranis:

- `gatewayRequest` iki kullanimi da destekler:
  - `gatewayRequest(action, payload, sessionKey)`
  - `gatewayRequest({ action, payload, session_key })`
- `parseResponse`:
  - HTTP hata kodlarini yakalar
  - body'de `ok:false` donerse exception firlatir
- `fetchReceipts` birden fazla response formatini `receipts[]` alanina normalize eder.
- `apiRegister` kayit payload'ini backend contract'ina map eder.

---

## 6) Cevresel Degerler / Konfig

- `N8N_GATEWAY_URL`: `src/config.js`
- `SUPPORT_LINKS`: destek baglantilari
- `PLAN_LABELS`: eski plan etiketleri (bazilari legacy)

---

## 7) Uretim ve Calistirma

Local test:

```bash
python3 -m http.server 8080
```

Acilis:

- `http://localhost:8080`
- `file://` ile acmayin (CORS ve fetch sorunlari)

---

## 8) Gelistirme Kurallari

1. Yeni JS dosyasi eklenirse `index.html` script sirasina eklenmeli.
2. `import/export` kullanilmaz, `window.X = X` modeli kullanilir.
3. Script sirasi parse/runtime hatalarinda ilk kontrol noktasidir.
4. Cache-busting query (`?v=...`) release'lerde guncellenmelidir.

---

## 9) Bilinen Teknik Borc

- UI metinlerinde Turkce karakter tutarsizliklari (kismi olarak devam ediyor).
- `ReportsPageV2` hala repo'da, V3 aktifken legacy dosya olarak duruyor.
- `ProgressBar`, `SupportBanner`, `BillingSection` gibi bazi legacy bilesenler artik aktif akista sinirli/atıl.
- `AdvisorDashboard` musteri verisi statik; backend entegrasyonu gerekiyor.
- Bazi API yorumlari (`TODO`) mevcut gercek davranisla tam hizali degil.

---

## 10) Dogrulama Onerileri

- Giris/kayit/landing navigasyonu
- Rol bazli dashboard gecisleri
- Fis durum aksiyonlari ve duzenleme modalı
- Rapor V3:
  - onayli fis filtreleme
  - KDV icmal toplamlari
  - PDF ve Excel export
- Settings metadata CRUD
- Team sayfasi add/delete
