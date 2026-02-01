import { parseStringPromise } from "xml2js";
import fs from "fs";

const URL = "https://iptv-org.github.io/epg/guides/be.xml";

async function run() {
  try {
    console.log("EPG downloaden...");
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error(`HTTP-fout: ${response.status}`);
    }

    const xml = await response.text();

    console.log("XML parsen...");
    const result = await parseStringPromise(xml);

    const programmes = result?.tv?.programme ?? [];

    console.log(`Aantal programma’s gevonden: ${programmes.length}`);

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

    const premieres = programmes.filter(p => {
      const channel = p.$?.channel?.toLowerCase() ?? "";
      return vlaamseZenders.includes(channel);
    });

    console.log(`Aantal Vlaamse programma’s: ${premieres.length}`);

    if (!fs.existsSync("data")) {
      fs.mkdirSync("data");
    }

    fs.writeFileSync(
      "data/tv-premieres.json",
      JSON.stringify(premieres, null, 2)
    );

    console.log("Klaar! tv-premieres.json bijgewerkt.");
  } catch (err) {
    console.error("Fout tijdens uitvoeren scraper:", err);
    process.exit(1);
  }
}

run();
