# FişFatura Durum ve Yayınlama Raporu

## Kapsam

- Bu rapor, `n8n workflovs` klasoru haricindeki tum dosyalarin incelenmesiyle hazirlanmistir.
- Incelenen ana alanlar: `index.html`, `src/*`, mevcut `.md` dokumanlari.
- Tarih: 2026-03-03

## Geldigimiz Nokta (Ozet)

- Proje su an **Zero-Build** (CDN + Babel + `window.*`) mimarisinde calisiyor.
- Kimlik akisi: `landing -> login/register -> role bazli dashboard`.
- Rol bazli panel akislari mevcut:
  - `admin` / `is_super_admin` -> `AdminDashboard`
  - `mali_musavir` -> `AdvisorDashboard`
  - diger kullanicilar -> `CustomerDashboard`
- Kontor modeli frontend'e alinmis durumda (`company.kalan_kredi`).
- Raporlama tarafinda `ReportsPageV3` aktif olarak resolve ediliyor.

## Mevcut Sistem Envanteri

### Giris ve Yonlendirme

- `LandingPage`: modern vitrin + CTA yonlendirmeleri.
- `RegisterPage`: rol secimli kayit formu (`company_admin` / `mali_musavir`) ve API payload map.
- `App.js`: session varsa bootstrap, yoksa landing.

### Ana Moduller

- `CustomerDashboard`: kalan kontor karti + son 20 fis ozeti.
- `ReceiptsPage` + `ReceiptTable`: filtreleme, hizli durum aksiyonlari, modal duzenleme.
- `ReportsPageV3`: onayli fis odakli tablar, KDV/kategori icmali, PDF/Excel export.
- `SettingsPage`: categories/projects/company_cards metadata yonetimi.
- `TeamPage`: ekip listeleme, ekleme/silme.
- `SubscriptionPage`: kontor paket vitrini (statik satin alma aksiyonu).
- `AdvisorDashboard`: musavir icin musteri tablosu + impersonation akisi (simdilik statik veri).

### Teknik Altyapi

- API baglantisi `src/api.js` uzerinden tek gateway'e gidiyor.
- `gatewayRequest` hem klasik (`action,payload`) hem object config formunu destekliyor.
- `index.html` script sirasi dogru ve cache-busting (`?v=...`) kullaniliyor.
- CDN kutuphaneleri:
  - React/ReactDOM
  - Babel Standalone
  - Tailwind CDN
  - Lucide
  - Marked
  - html2pdf
  - SheetJS (XLSX)

## Kritik Bulgular / Riskler

1. **Turkce karakter tutarliligi**
   - Bircok yeni/eski dosyada metinler ASCII transliterasyonlu (`Giris`, `Kayit`, `Musavir` vb.).
   - Kullanici deneyimi ve kurumsal kalite icin tum UI metinleri UTF-8 standardina normalize edilmeli.

2. **Raporlama ikili surum durumu**
   - `ReportsPageV2.js` ve `ReportsPageV3.js` birlikte yukleniyor.
   - App tarafi V3'u onceliklendiriyor; V2 dosyasi teknik borc olarak kaldirilmali veya arsivlenmeli.

3. **Legacy component artiklari**
   - `ProgressBar.js`, `SupportBanner.js`, `BillingSection.js` aktif akista pratikte kullanilmiyor.
   - Kod karmasasini artiriyor; kaldirilma/arsivleme karari alinmali.

4. **Musavir paneli veri kaynagi**
   - `AdvisorDashboard` musterilerde statik mock kullaniyor.
   - Gercek API baglantisi (`get_advisor_clients` benzeri action) olmadan uretim fonksiyonelligi eksik.

5. **Rapor V3 muhasebe veri modeli varsayimlari**
   - `ocr_detaylari` parsing'i farkli formatlari handle ediyor ama backend standardi kesin degil.
   - KDV/matrah hesaplari icin backend sozlesmesi netlestirilmeli (urun satir yapisi, kdv net/brut).

6. **API TODO notlari ile gercek durum uyumsuzlugu**
   - `api.js` icinde bazi action'larda "TODO" yorumlari kalmis.
   - Kod fiilen bu action'lari cagiriyor; dokuman ve kod notlari hizalanmali.

## Bundan Sonraki Yapilacak Isler (Oncelik Sirali)

### P0 (Yayina cikmadan once)

- Tum UI metinlerini UTF-8 Turkce standardina cekmek.
- `ReportsPageV3` testlerini tamamlamak:
  - sadece `onaylandi` filtre dogrulamasi
  - tab kurallarinin veriyle dogrulanmasi
  - KDV icmal matematik kontrolu
- `AdvisorDashboard` statik veri yerine gercek API baglantisi.
- `RegisterPage` backend validasyon mesajlarinin son haliyle UX testleri.
- `delete_receipt`, `update_receipt`, `manage_metadata`, `get_team` akislariyla E2E smoke.

### P1 (Yayin sonrasi hizli iyilestirme)

- `ReportsPageV2` ve kullanilmayan componentlerin temizlik refaktoru.
- Header/Sidebar metin ve rol etiketlerinin tam Turkcelestirilmesi.
- Hata mesajlarinda standartlasma (`toast/alert` tek desen).
- Excel export'ta aktif tab ve full export seceneklerinin ayrilmasi.

### P2 (Urunlestirme)

- Musavir context switch akisini backend destekli musteri listesiyle kalici hale getirmek.
- Kontor satin alma adimlarinin odeme altyapisi ile entegrasyonu.
- Kullanici aktivite logu, audit trail ve izlenebilirlik ekranlari.

## Sistemi Tamamlama ve Yayina Alma Plani

## 1) Teknik Tamamlama

- Frontend:
  - UTF-8 metin normalization
  - dead code temizligi
  - production print stilleri ve responsive kontroller
- Backend/Gateway:
  - frontendin kullandigi tum actionlarin kesin contract testleri
  - `ocr_detaylari` standart JSON semasi

## 2) Test Plani

- **Smoke:** Giris, kayit, role routing, fis listeleme, durum guncelleme, rapor export.
- **Regression:** Settings metadata CRUD, Team CRUD, Advisor impersonation.
- **Muhasebe dogrulama:** KDV/matrah toplamlarinin manuel capraz kontrolu.

## 3) Uretim Hazirlik

- Ortam degiskenleri ve endpoint son kontrol:
  - `N8N_GATEWAY_URL`
  - destek linkleri
- Cache-busting versiyonunun bir release etiketiyle guncellenmesi.
- Son branch freeze + etiketli release notu.

## 4) Yayin

- Staging benzeri test ortaminda son E2E.
- Ana ortama alinmasi.
- Ilk 24 saat hata izleme:
  - login/register hata oranlari
  - rapor export basari oranlari
  - update/delete fis action hata oranlari

## Sonuc

- Sistem iskeleti ve ana urun akislari olgunlasmis durumda.
- Uretime cikis icin en kritik 3 konu:
  1) UTF-8 dil ve metin standardi,
  2) Musavir veri akisinin backend baglantisiyla tamamlanmasi,
  3) Raporlama (V3) muhasebe dogrulama testlerinin tamamlanmasi.

