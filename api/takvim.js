// Doğum günlerini telefonun takvimine eklemek için .ics dosyası üretir (Gemini gerekmez).
// GET /api/takvim?v=<base64url JSON: [{ i: id, a: ad, d: "YYYY-MM-DD" }]>&o=<site adresi>
const kac = x => String(x).replace(/[\\,;]/g, m => "\\" + m).replace(/[\r\n]+/g, " ");
const p = n => String(n).padStart(2, "0");

export default function handler(req, res) {
  let liste = [];
  try {
    const v = String(req.query?.v || "").replace(/-/g, "+").replace(/_/g, "/");
    liste = JSON.parse(Buffer.from(v, "base64").toString("utf8"));
  } catch { liste = []; }
  liste = (Array.isArray(liste) ? liste : []).slice(0, 100)
    .map(k => ({ i: String(k?.i || "").replace(/[^a-z0-9]/gi, "").slice(0, 24) || "k", a: String(k?.a || "").slice(0, 40), d: String(k?.d || "") }))
    .filter(k => k.a && /^\d{4}-\d{2}-\d{2}$/.test(k.d));
  if (!liste.length) { res.statusCode = 400; res.setHeader("Content-Type", "text/plain; charset=utf-8"); return res.end("Takvime eklenecek doğum günü bulunamadı."); }

  const site = /^https:\/\/[a-z0-9.-]+$/i.test(String(req.query?.o || "")) ? req.query.o : "";
  const simdi = new Date(), bugun = new Date(Date.UTC(simdi.getUTCFullYear(), simdi.getUTCMonth(), simdi.getUTCDate()));
  const damga = `${simdi.getUTCFullYear()}${p(simdi.getUTCMonth() + 1)}${p(simdi.getUTCDate())}T${p(simdi.getUTCHours())}${p(simdi.getUTCMinutes())}00Z`;
  const sat = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ne Alsam//TR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Doğum günleri"];
  for (const k of liste) {
    const [, mm, dd] = k.d.split("-").map(Number);
    let y = bugun.getUTCFullYear(); if (Date.UTC(y, mm - 1, dd) < bugun.getTime()) y++;
    sat.push("BEGIN:VEVENT", `UID:${k.i}-dogum@nealsam`, `DTSTAMP:${damga}`, `DTSTART;VALUE=DATE:${y}${p(mm)}${p(dd)}`, "RRULE:FREQ=YEARLY", "TRANSP:TRANSPARENT",
      `SUMMARY:${kac(k.a + " doğum günü 🎂")}`, `DESCRIPTION:${kac("Hediye fikri için Ne Alsam'ı aç" + (site ? ": " + site : "."))}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P7D", `DESCRIPTION:${kac(k.a + " doğum gününe 1 hafta kaldı. Hediyeyi düşündün mü?")}`, "END:VALARM",
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT15H", `DESCRIPTION:${kac("Yarın " + k.a + " doğum günü!")}`, "END:VALARM", "END:VEVENT");
  }
  sat.push("END:VCALENDAR");
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `inline; filename="dogum-gunleri.ics"`);
  res.setHeader("Cache-Control", "no-store");
  res.end(sat.join("\r\n") + "\r\n");
}
