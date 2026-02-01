import fs from "fs";
import { parseStringPromise } from "xml2js";

const URLS = [
  "https://epghub.online/epg/BE.xml"
];

const VLAAMSE_ZENDERS = [
  "één",
  "canvas",
  "vtm",
  "vtm2",
  "vtm3",
  "vtm4",
  "vtm gold",
  "vier",
  "vijf",
  "zes",
  "play4",
  "play5",
  "play6",
  "play7"
];

const normalize = str =>
  str.toLowerCase().replace(".be", "").trim();

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

    const premieres = allProgrammes.filter(p => {
      const channel = normalize(p.$?.channel ?? "");
      return VLAAMSE_ZENDERS.includes(channel);
    });

    console.log(`Aantal Vlaamse programma’s: ${premieres.length}`);

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
