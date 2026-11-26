// Ortak Gemini yardımcıları (hediye ve kart servisleri kullanır)
export class Hata extends Error {
  constructor(status, mesaj) { super(mesaj); this.status = status; }
}

// Kullanıcıdan gelen metni kısaltır ve temizler
export const temizMetin = (m, max = 40) => String(m ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export const temizListe = (liste, max = 20, uzunluk = 40) =>
  (Array.isArray(liste) ? liste : []).map(m => temizMetin(m, uzunluk)).filter(Boolean).slice(0, max);

// Gemini'ye sorar; json=true ise ayrıştırılmış JSON döndürür, değilse düz metin
export async function gemini({ parts, json = true, temperature = 0.9, maxTokens = 4096, timeout = 50000, model: istenenModel }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Hata(500, "Sunucuda GEMINI_API_KEY ayarlanmamış.");
  const model = istenenModel || process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const bitis = Date.now() + timeout;
  // dusunme: 0 = en az düşünme (yeni modeller), 1 = düşünme kapalı (2.5 modelleri), 2 = ayar yok
  const sor = (dusunme) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(Math.max(1000, bitis - Date.now())),
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        ...(json ? { responseMimeType: "application/json" } : {}),
        temperature,
        maxOutputTokens: maxTokens,
        ...(dusunme === 0 ? { thinkingConfig: { thinkingLevel: "minimal" } } : dusunme === 1 ? { thinkingConfig: { thinkingBudget: 0 } } : {})
      }
    })
  });
  let r;
  try {
    r = await sor(0);
    if (r.status === 400) r = await sor(1);
    if (r.status === 400) r = await sor(2);
    // Google geçici olarak meşgulse (500/502/503/504) kısa bir bekleyip bir kez daha dene
    if ([500, 502, 503, 504].includes(r.status) && bitis - Date.now() > 6000) {
      console.error("Gemini geçici hata, tekrar deneniyor:", model, r.status);
      await new Promise(o => setTimeout(o, 1200));
      r = await sor(0);
      if (r.status === 400) r = await sor(1);
      if (r.status === 400) r = await sor(2);
    }
  } catch (e) {
    if (e && (e.name === "TimeoutError" || e.name === "AbortError")) { const h = new Hata(504, "Çok uzun sürdü, lütfen tekrar dene."); h.ust = 504; throw h; }
    throw e;
  }
  if (r.status === 429) { const h = new Hata(429, "Çok fazla istek geldi, biraz bekleyip tekrar dene."); h.ust = 429; throw h; }
  if (!r.ok) {
    console.error("Gemini hatası:", model, r.status, (await r.text()).slice(0, 500));
    const h = new Hata(502, r.status === 503 ? "Yapay zekâ şu an çok yoğun. Birkaç saniye sonra tekrar dene." : "Yapay zekâ şu an cevap veremedi. Birazdan tekrar dene.");
    h.ust = r.status; throw h;
  }
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  if (!json) return text.trim();
  const eslesme = text.match(/[\[{][\s\S]*[\]}]/);
  try { return JSON.parse(eslesme ? eslesme[0] : text); }
  catch { console.error("Gemini bozuk JSON:", model, data?.candidates?.[0]?.finishReason, text.slice(0, 200)); const h = new Hata(502, "Yapay zekânın cevabı yarım kaldı, tekrar dene."); h.ust = "json"; throw h; }
}

// Ortak hata cevabı
export function hataCevabi(res, e) {
  if (e instanceof Hata) return res.status(e.status).json({ hata: e.message });
  console.error(e);
  return res.status(500).json({ hata: "Bir şeyler ters gitti, tekrar dene." });
}
