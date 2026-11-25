# 🎁 Ne Alsam?

Kime, ne için, ne kadar? Hediye alacağın kişiyi anlat; yapay zekâ ona **tam uygun hediye fikirleri** bulsun,
istersen yanına koyacağın **kart notunu** da yazsın.

- Ön yüz: `index.html` (tek sayfa, telefona yüklenebilir uygulama / PWA)
- Hediye servisi: `api/hediye.js` (kişi, vesile, bütçe ve ilgi alanlarına göre 6 fikir; "başka fikirler" ile tekrar etmeden yenileri)
- Kart notu servisi: `api/kart.js` (duygusal, komik, kısa ya da şiirsel not)
- Ortak yapay zekâ kodu: `api/_gemini.js` (Google Gemini)
- Kullanım sınırı: `api/_limit.js` (kişi başına günde 25 fikir isteği, 30 kart notu; dakikada en fazla 6)
- `sw.js` + `manifest.json` + ikonlar: telefona "yüklenebilmesi" için

Özellikler: kişiye özel fikirler, Google Alışveriş'te tek dokunuşla arama, beğenilen fikirleri kaydetme,
listeyi WhatsApp vb. ile paylaşma, kart notu yazma. Form ve kayıtlar telefonun kendisinde saklanır.

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
