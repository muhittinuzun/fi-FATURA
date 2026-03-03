# Fişmatik - Sistem Dokümantasyonu (Güncel)

> [!IMPORTANT]
> Bu proje **Zero-Build** çalışır: `npm`, `vite`, `webpack` yok.
> Frontend tamamen CDN + `text/babel` scriptleri ile tarayıcıda çalışır.

---

## 1) Mimari Özeti

- **Frontend:** `index.html` içinden sırayla yüklenen global React bileşenleri.
- **Backend Gateway:** n8n tek webhook (`fismatik-gateway`) üzerinden `action` bazlı çalışır.
- **Veri:** PostgreSQL (kullanıcı, şirket, fiş, kullanım logları).
- **Dosya depolama:** S3/R2.
- **Oturum:** `session_key` değeri `localStorage` içinde saklanır.

---

## 2) Aktif Frontend Yükleme Sırası

`index.html` içinde mevcut akış:

1. `src/config.js`
2. `src/utils/format.js`
3. `src/api.js`
4. `src/components/*` (Icon, Header, Sidebar, ReceiptTable vb.)
5. `src/pages/*`
   - Önemli: aktif rapor scripti `src/pages/ReportsPageV2.js`
6. `src/App.js`
7. `src/main.js`

> Not: `ReportsPage.js` dosyası geçmişte duplicate declaration kaynaklı parse hatası üretmiştir. Çalışan sürüm `ReportsPageV2.js` üzerinden yüklenir.

---

## 3) API Sözleşmesi

Tüm istekler tek formatla gateway'e gider:

```json
{
  "action": "get_reports",
  "payload": {},
  "session_key": "..."
}
```

### Frontend tarafında kritik güncel davranış

- `src/api.js`:
  - `parseResponse` boş body durumunu güvenli işler.
  - `fetchReceipts` cevabı normalize eder.
  - Şu response tipleri otomatik `receipts` alanına map edilir:
    - `[]`
    - `{ receipts: [] }`
    - `{ items: [] }`
    - `{ rows: [] }`
    - `{ data: [] }`
    - `{ result: [] }` veya `{ result: { receipts: [] } }`

- `src/App.js`:
  - `bootstrapRequest()` sonrası `bootstrap.receipts` boşsa **otomatik fallback** olarak `fetchReceipts({})` çağrılır.
  - Böylece `Genel Bakış` tablosu sadece `get_reports` çıktısına bağımlı kalmaz.

---

## 4) Sayfalar ve Yetkilendirme

- `dashboard`: müşteri ana paneli + basit fiş tablosu.
- `receipts`: tam fiş listesi + düzenleme modalı (`ReceiptTable simple=false`).
- `reports`: `ReportsPageV2`.
- `team`: admin kullanıcı yönetimi.
- `settings`: metadata ve profil ayarları.
- `about`: ürün açıklama sayfası.
- `admin`: sadece super admin görünümü.

---

## 5) Local Çalıştırma

`file://` ile açmayın. CORS nedeniyle sorun olur.

```bash
python3 -m http.server 8080
```

Tarayıcı:

`http://localhost:8080`

---

## 6) AI ile Geliştirme Kuralları

1. `npm install` önermeyin / kullanmayın.
2. Yeni JS dosyaları mutlaka `index.html` script sırasına eklenmeli.
3. `import/export` yerine `window.X = X` global modeli kullanılmalı.
4. CDN bağımlılıkları korunmalı.
5. Parse hatalarında ilk kontrol: duplicate fonksiyon tanımı ve script sırası.

---

## 7) Güncel Teknik Borç / Bekleyenler

- n8n gateway tarafında bazı action'lar hala tam implemente değil:
  - `get_receipts`
  - `update_receipt`
  - `get_team`
  - `add_user`
  - `delete_user`
  - `manage_metadata`
  - `delete_receipt`

Bu action'lar frontend'de hazırdır; backend sorguları tamamlandıkça tüm sayfalar tam fonksiyonel hale gelir.
