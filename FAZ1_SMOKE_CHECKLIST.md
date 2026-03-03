# Faz 1 Smoke Checklist

Bu kontrol listesi, sifirdan acilan panelde kritik akisin bozulmadigini hizli test etmek icin hazirlandi.

## 1) Acilis
- Sayfayi hard refresh ile ac (`Cmd + Shift + R`).
- Beyaz ekran olmamali.
- Console'da kirmizi hata olmamali.
- Asagidaki uyari mesajlari tolere edilir:
  - `cdn.tailwindcss.com should not be used in production`
  - `You are using the in-browser Babel transformer`

## 2) Giris ve oturum
- Gecerli hesapla giris yap.
- Ust barda sirket adi ve rol gorunmeli.
- Cikis yap butonu calismali.

## 3) Menu gecisleri
- `Genel Bakis` -> `Fislerim` -> `Raporlar` -> `Ayarlar` -> `Hakkinda`
- Her geciste sayfa icerigi render olmali, crash olmamali.

## 4) Fislerim
- Liste doluysa satirlar gorunmeli.
- En az bir fiste `Duzenle` acilip kaydetme denenmeli.
- Durum guncelleme sonrasi liste yenilenmeli.

## 5) Raporlar
- Tarih araligi secilip rapor olustur calismali.
- Kart/proje/projesiz/master sekmeleri render olmali.
- PDF indirme aksiyonu tetiklenebilmeli.

## 6) Ayarlar metadata
- `Kategoriler` sadece `categories` tablosu kayitlarini gostermeli.
- `Projeler` sadece `projects` tablosu kayitlarini gostermeli.
- `Sirket Kredi Kartlari` sadece `company_cards` tablosu kayitlarini gostermeli.
- Ekle/Sil islemleri sonrasi liste aninda guncellenmeli.

## 7) Kabul kosulu
- Kritik akislarda kirmizi runtime hata yok.
- Kullanici panelden fis yukleme akisi gormuyor.
- Mevcut fisleri goruntuleme/duzenleme/raporlama stabil calisiyor.
