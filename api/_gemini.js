// Ortak Gemini yardımcıları (hediye ve kart servisleri kullanır)
export class Hata extends Error {
  constructor(status, mesaj) { super(mesaj); this.status = status; }
}

// Kullanıcıdan gelen metni kısaltır ve temizler
export const temizMetin = (m, max = 40) => String(m ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export const temizListe = (liste, max = 20, uzunluk = 40) =>
  (Array.isArray(liste) ? liste : []).map(m => temizMetin(m, uzunluk)).filter(Boolean).slice(0, max);

// Gemini'ye sorar; json=true ise ayrıştırılmış JSON döndürür, değilse düz metin
export async function gemini({ parts, json = true, temperature = 0.9, maxTokens = 4096, timeout = 50000 }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Hata(500, "Sunucuda GEMINI_API_KEY ayarlanmamış.");
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const sor = (hizli) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(timeout),
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        ...(json ? { responseMimeType: "application/json" } : {}),
        temperature,
        maxOutputTokens: maxTokens,
        ...(hizli ? { thinkingConfig: { thinkingLevel: "minimal" } } : {})
      }
    })
  });
  let r;
  try {
    r = await sor(true);
    if (r.status === 400) r = await sor(false);
  } catch (e) {
    if (e && e.name === "TimeoutError") throw new Hata(504, "Çok uzun düşündüm, lütfen tekrar dene.");
    throw e;
  }
  if (r.status === 429) throw new Hata(429, "Çok fazla istek geldi, biraz bekleyip tekrar dene.");
  if (!r.ok) {
    console.error("Gemini hatası:", r.status, await r.text());
    throw new Hata(502, "Yapay zeka şu an cevap veremedi.");
  }
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  if (!json) return text.trim();
  const eslesme = text.match(/[\[{][\s\S]*[\]}]/);
  return JSON.parse(eslesme ? eslesme[0] : text);
}

// Ortak hata cevabı
export function hataCevabi(res, e) {
  if (e instanceof Hata) return res.status(e.status).json({ hata: e.message });
  console.error(e);
  return res.status(500).json({ hata: "Bir şeyler ters gitti, tekrar dene." });
}
