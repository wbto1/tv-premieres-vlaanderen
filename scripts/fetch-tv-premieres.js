import { parseStringPromise } from "xml2js";
import fs from "fs";

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

      console.log(`Programma’s gevonden in ${url}: ${programmes.length}`);
      allProgrammes = allProgrammes.concat(programmes);
    }

    console.log(`Totaal aantal programma’s: ${allProgrammes.length}`);

    const vlaamseZenders = [
      "één",
      "canvas",
      "vtm",
      "vtm2",
      "vtm3",
      "vtm4",
      "vier",
      "vijf",
      "zes",
      "play4",
      "play5",
      "play6",
      "play7",
      "vtm gold"
    ];

    const premieres = allProgrammes.filter(p => {
      const channel = p.$?.channel?.toLowerCase() ?? "";
      return vlaamseZenders.includes(channel);
    });

    console.log(`Aantal Vlaamse programma’s: ${premieres.length}`);

    // 👉 HIER: schrijven naar docs/data/
    if (!fs.existsSync("docs/data")) {
      fs.mkdirSync("docs/data", { recursive: true });
    }

    fs.writeFileSync(
      "docs/data/tv-premieres.json",
      JSON.stringify(premieres, null, 2)
    );

    console.log("Klaar! docs/data/tv-premieres.json bijgewerkt.");
  } catch (err) {
    console.error("Fout tijdens uitvoeren scraper:", err);
    process.exit(1);
  }
}

run();
