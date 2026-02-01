import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";

// URL van jouw bron (pas aan indien nodig)
const URL = "https://www.vrt.be/vrtnu/kalender/";

async function fetchPremieres() {
  try {
    const response = await axios.get(URL);
    const $ = cheerio.load(response.data);

    const premieres = [];

    $(".calendar-item").each((i, el) => {
      const title = $(el).find(".title").text().trim();
      const date = $(el).find(".date").text().trim();

      if (title && date) {
        premieres.push({ title, date });
      }
    });

    const output = {
      updated: new Date().toISOString(),
      premieres
    };

    fs.writeFileSync(
      "docs/data/tv-premieres.json",
      JSON.stringify(output, null, 2)
    );

    console.log("JSON succesvol geschreven!");
  } catch (err) {
    console.error("Fout bij ophalen:", err);
  }
}

fetchPremieres();
