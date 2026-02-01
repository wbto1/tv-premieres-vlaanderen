import fs from "fs";
import { parseStringPromise } from "xml2js";

const URLS = [
  "https://iptv-org.github.io/epg/guides/be-vrt.xml",
  "https://iptv-org.github.io/epg/guides/be-dpg.xml",
  "https://iptv-org.github.io/epg/guides/be-playtime.xml"
];

async function run() {
  try {
    let allProgrammes = [];

    for (const url of URLS) {
      console.log(`EPG downloaden van ${url}...`);
      const response = await fetch(url);

      if (!response.ok) {
        console.log(`Fout bij ${url}: ${response.status}`);
        continue;
      }

      const xml = await response.text();
      const result = await parseStringPromise(xml);
      const programmes = result?.tv?.programme ?? [];

      allProgrammes = allProgrammes.concat(programmes);
    }

    const vlaamseZenders = [
      "één", "canvas", "vtm", "vtm2", "vtm3", "vtm4",
      "vier", "vijf", "zes", "play4", "play5", "play6",
      "play7", "vtm gold"
    ];

    const premieres = allProgrammes.filter(p => {
      const channel = p.$?.channel?.toLowerCase() ?? "";
      return vlaamseZenders.includes(channel);
    });

    if (!fs.existsSync("docs/data")) {
      fs.mkdirSync("docs/data", { recursive: true });
    }

    fs.writeFileSync(
      "docs/data/tv-premieres.json",
      JSON.stringify(premieres, null, 2)
    );

    console.log("Klaar! JSON opgeslagen.");
  } catch (err) {
    console.error("Fout:", err);
    process.exit(1);
  }
}

run();
