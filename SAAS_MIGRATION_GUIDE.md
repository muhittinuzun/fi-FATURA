# Fişmatik SaaS Migration Guide (Güncel)

Bu rehber, projenin geldiği son noktadaki gerçek çalışan mimariyi özetler:
**PostgreSQL + n8n + S3 + Zero-Build Frontend**

---

## 1) Güncel Mimari

- Frontend yalnızca tek gateway endpoint'ine gider (`N8N_GATEWAY_URL`).
- n8n, `action` alanına göre PostgreSQL sorgusu / workflow yönlendirmesi yapar.
- Kimlik doğrulama ve oturum yönetimi `users` + `user_sessions` ile backend tarafında yapılır.
- Fiş görselleri S3'e yazılır, OCR/Gemini işleme n8n tarafında yürütülür.

---

## 2) Frontend Çalışma Modeli (No-Build)

- `index.html` içinde tüm dosyalar `type="text/babel"` ile yüklenir.
- `import/export` yerine global window modeli kullanılır (`window.App`, `window.fetchReceipts` vb.).
- Aktif rapor sayfası scripti: `src/pages/ReportsPageV2.js`.

> Geçmişte `ReportsPage.js` içinde duplicate fonksiyon tanımları parse hatası ürettiği için güvenli aktif sürüm `ReportsPageV2.js` olarak tutulmaktadır.

---

## 3) API Contract

Tüm istekler tek gövde formatını kullanır:

```json
{
  "action": "login | register | get_reports | get_receipts | upload_receipt | ...",
  "payload": {},
  "session_key": "user_session_token"
}
```

### Session akışı

1. `login` başarılı olduğunda `session_key` döner.
2. Frontend bunu `localStorage` içine yazar.
3. Sonraki tüm gateway çağrılarında `session_key` gönderilir.

---

## 4) Frontend Veri Dayanıklılığı (Yeni)

`src/api.js` ve `src/App.js` tarafında, backend response format farklılıklarına karşı koruma eklendi.

### `fetchReceipts` normalize davranışı

`get_receipts` cevabı aşağıdaki formatlardan hangisi olursa olsun frontend bunu `receipts` dizisine çevirir:

- `[]`
- `{ receipts: [] }`
- `{ items: [] }`
- `{ rows: [] }`
- `{ data: [] }`
- `{ result: [] }`
- `{ result: { receipts: [] } }`

### `bootstrap` fallback davranışı

`App.loadData()` içinde:

- Önce `bootstrapRequest()` çağrılır.
- `bootstrap.receipts` boşsa otomatik `fetchReceipts({})` çağrısı yapılır.
- Böylece `Genel Bakış` ekranı yalnızca `get_reports` çıktısına bağlı kalmaz.

---

## 5) PostgreSQL Kurulumu

1. `supabase/001_saas_schema.sql` dosyasını PostgreSQL üzerinde çalıştır.
2. Ana tablolar: `companies`, `users`, `user_sessions`, `receipts`, `api_usage_logs`, `storage_usage_daily`.
3. Yardımcı fonksiyonlar:
   - `create_trial_company_and_admin`
   - `check_company_quota`
   - `increment_company_usage`
4. Super admin için:
   - `users.is_super_admin = true`
   - `users.role = 'admin'`

---

## 6) n8n Workflow Haritası

### `00 - Merkezi API Gateway.json`

Ana webhook ve action router:

- `login`
- `register`
- `forgot_password`
- `check_quota`
- `upload_receipt`
- `get_reports`
- (bekleyen) `get_receipts`, `update_receipt`, `get_team`, `add_user`, `delete_user`, `manage_metadata`, `delete_receipt`

### `02 - OCR ve AI İşleme (S3).json`

- S3 upload
- OCR
- Gemini parse
- token/maliyet hesaplama

### `03 - Kayıt ve Maliyet Loglama.json`

- `receipts` insert
- `api_usage_logs` insert
- şirket aylık kullanım artırımı

---

## 7) Beklenen `get_reports` Çıktıları

### Normal kullanıcı bootstrap

```json
{
  "profile": {},
  "company": {},
  "receipts": [],
  "usage_logs": []
}
```

### Super admin dashboard

```json
{
  "profile": { "role": "admin", "is_super_admin": true },
  "companies": [],
  "usage_logs": [],
  "storage": { "used_gb": 0, "total_gb": 0, "usage_percent": 0 }
}
```

---

## 8) Yayına Alma ve Test

### Local test

```bash
python3 -m http.server 8080
```

`http://localhost:8080` adresinden aç.

### GitHub Pages

- Değişiklikleri push et.
- `main/root` yayında ise otomatik güncellenir.

---

## 9) Kritik Notlar

- `tailwindcdn` ve `babel standalone` konsol uyarıları production önerisi niteliğindedir; tek başına crash sebebi değildir.
- Crash sebebi olduğunda ilk bakılacak yerler:
  - duplicate function declaration
  - yanlış script sırası
  - gateway'den gelen response formatı
