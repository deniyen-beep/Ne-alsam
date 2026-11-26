# 🎁 Ne Alsam?

Kime, ne için, ne kadar? Hediye alacağın kişiyi anlat; yapay zekâ ona **tam uygun hediye fikirleri** bulsun,
istersen yanına koyacağın **kart notunu** da yazsın.

- Ön yüz: `index.html` (tek sayfa, telefona yüklenebilir uygulama / PWA)
- Hediye servisi: `api/hediye.js` (kişi, vesile, bütçe ve ilgi alanlarına göre 6 fikir; "başka fikirler" ile tekrar etmeden yenileri)
- Kart notu servisi: `api/kart.js` (duygusal, komik, kısa ya da şiirsel not)
- Ortak yapay zekâ kodu: `api/_gemini.js` (Google Gemini)
- Kullanım sınırı: `api/_limit.js` (kişi başına günde 25 fikir isteği, 30 kart notu; dakikada en fazla 6)
- `sw.js` + `manifest.json` + ikonlar: telefona "yüklenebilmesi" için

Özellikler:
- **Ana sayfa:** yaklaşan özel günler (Anneler Günü, Yılbaşı, kişilerin doğum günleri…), hızlı başlangıç, bütçeye göre arama, son aramalar
- **Hediye bul:** 7 adımlı soru akışı (kime, hakkında, vesile, bütçe, ilgi alanları, tarz/tür/acil, not)
- **Sonuçlar:** türe göre filtre, fiyata göre sıralama, Trendyol / Hepsiburada / Amazon / Google bağlantıları,
  kart notu yazma, paylaşma, "benzerleri"
- **Kişilerim:** sevdiklerini doğum günü ve ilgi alanlarıyla kaydet; "Bunu aldım" dediğin hediyeler bir daha önerilmez
- **Kaydettiklerim:** beğenilen fikirler kişiye göre gruplu
- **Sürpriz yap:** çark çevir, şansına bir fikir gelsin
- **Toplu plan:** yılbaşı gibi günlerde birden çok kişiye, toplam bütçeyi bölerek fikir
- **İstek listem:** kendi listeni yap, linkle paylaş (veriler linkin içinde, sunucu gerekmez)
- **Gizli anket:** hediye alacağın kişiye "Ne tarz birisin?" testi gönder, sonucu ilgi alanı olarak gelsin
- **Fotoğraftan tahmin:** oda/raf/profil fotoğrafından ilgi alanları (`/api/ilgi`, Dolapta Ne Var'da)
- **Takvime ekle:** doğum günleri 1 hafta önceden hatırlatmalı takvim dosyası (`api/takvim.js`, bu projede)
- **Kart görseli:** kart notunu paylaşılabilir bir görsele çevir
- **Hediye rehberi:** kısa ipucu yazıları
- Beyaz / Siyah / Otomatik görünüm; veriler sadece telefonun kendisinde saklanır

> Not: Yapay zekâ istekleri şimdilik Dolapta Ne Var projesinin `/api/hediye` ve `/api/kart` servislerine gider
> (Gemini anahtarı orada). Bu projeye kendi anahtarı eklenirse `index.html` içindeki `API_ADRESI` boş yapılabilir.

---

## 1. Ücretsiz Gemini API anahtarı al
1. https://aistudio.google.com/apikey adresine Google hesabınla gir.
2. **Create API key** → anahtarı kopyala. (Kimseyle paylaşma, koda yazma!)
   Dolapta Ne Var için aldığın anahtarı da kullanabilirsin.

## 2. İnternete yayınla (Vercel — ücretsiz)
1. https://vercel.com → **Add New → Project** → `ne-alsam` deposunu seç → **Import**.
2. **Environment Variables**: Ad `GEMINI_API_KEY`, Değer: anahtarın.
3. **Deploy**. Birkaç dakika sonra `https://ne-alsam.vercel.app` gibi bir adresin olur. 🎉

> Anahtarı sonradan eklediysen: Vercel → Project → Deployments → son dağıtım → **Redeploy**.

## 3. Bilgisayarında denemek
```
GEMINI_API_KEY=anahtarın npm run dev
```
→ http://localhost:3000

## 4. İnsanlar nasıl yükler?
- **Android (Chrome):** sayfadaki **📲 Uygulamayı telefonuna yükle** düğmesi.
- **iPhone (Safari):** Paylaş ⬆️ → **Ana Ekrana Ekle**.
