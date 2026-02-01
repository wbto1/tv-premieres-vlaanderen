import fs from "fs";
import path from "path";
import xml2js from "xml2js";

const EPG_URL = "https://iptv-org.github.io/epg/guides/be.xml";

function isPremiere(program) {
  const title = program.title?.[0]?._ || "";
  const desc = program.desc?.[0]?._ || "";

  return (
    /première/i.test(title) ||
    /premiere/i.test(title) ||
    /première/i.test(desc) ||
    /premiere/i.test(desc)
  );
}

async function fetchXml(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} bij ${url}`);
  return res.text();
}

async function main() {
  console.log("EPG ophalen…");
  const xml = await fetchXml(EPG_URL);

  console.log("XML omzetten naar JSON…");
  const parser = new xml2js.Parser();
  const epg = await parser.parseStringPromise(xml);

  const programmes = epg.tv.programme || [];
  const premieres = [];

  for (const p of programmes) {
    if (isPremiere(p)) {
      premieres.push({
        title: p.title?.[0]?._ || "",
        channel: p.$.channel,
        start: p.$.start,
        stop: p.$.stop,
        description: p.desc?.[0]?._ || ""
      });
    }
  }

  premieres.sort((a, b) => new Date(a.start) - new Date(b.start));

  const outDir = "data";
  const outFile = path.join(outDir, "tv-premieres.json");

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        premieres
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Klaar! ${premieres.length} premières gevonden.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
