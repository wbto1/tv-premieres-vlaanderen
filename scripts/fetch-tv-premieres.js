import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// TODO: VERVANG DIT DOOR JOUW ECHTE EPG-BRON
const EPG_URL = "https://example.com/epg.json";

// Bepalen of een programma een première is
function isPremiere(program) {
  return (
    program.isPremiere === true ||
    /première/i.test(program.title || "") ||
    /premiere/i.test(program.description || "")
  );
}

// JSON ophalen
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} bij ${url}`);
  return res.json();
}

async function main() {
  console.log("EPG ophalen…");
  const epg = await fetchJson(EPG_URL);

  const premieres = [];

  // Verwacht structuur: { channels: [ { name, programs: [...] } ] }
  for (const channel of epg.channels || []) {
    for (const p of channel.programs || []) {
      if (isPremiere(p)) {
        premieres.push({
          title: p.title,
          channel: channel.name,
          start: p.start,
          end: p.end,
          description: p.description || "",
        });
      }
    }
  }

  // Sorteren op starttijd
  premieres.sort((a, b) => new Date(a.start) - new Date(b.start));

  // Outputmap en bestand
  const outDir = "data";
  const outFile = path.join(outDir, "tv-premieres.json");

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        premieres,
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Klaar! ${premieres.length} premières opgeslagen.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
