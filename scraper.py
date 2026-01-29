import requests
from bs4 import BeautifulSoup
from datetime import datetime

URL = "https://www.vrt.be/vrtmax/tv-gids/"

PREMIERE_KEYWORDS = [
    "première",
    "eerste uitzending",
    "nieuw",
    "nieuw op tv",
    "nieuwe reeks",
    "nieuwe aflevering",
    "tv-première",
]


def log(tekst):
    with open("log.txt", "a", encoding="utf-8") as f:
        f.write(tekst + "\n")


def haal_programmas_op():
    log("Start scraping...")

    response = requests.get(URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    programma_lijst = []

    artikelen = soup.find_all("article")
    log(f"Gevonden artikelen: {len(artikelen)}")

    for blok in artikelen:
        titel_tag = blok.find("h3")
        beschrijving_tag = blok.find("p")

        if not titel_tag:
            continue

        titel = titel_tag.get_text(strip=True)
        beschrijving = beschrijving_tag.get_text(strip=True) if beschrijving_tag else ""

        programma_lijst.append({
            "titel": titel,
            "beschrijving": beschrijving
        })

    log(f"Totaal programma's gevonden: {len(programma_lijst)}")
    return programma_lijst


def detecteer_premieres(programmas):
    premieres = []

    for p in programmas:
        tekst = (p["titel"] + " " + p["beschrijving"]).lower()

        if any(keyword in tekst for keyword in PREMIERE_KEYWORDS):
            premieres.append(p)
            continue

        if any(str(jaar) in tekst for jaar in range(2024, 2027)):
            if any(genre in tekst for genre in ["film", "thriller", "drama"]):
                premieres.append(p)

    unieke = []
    seen = set()

    for p in premieres:
        if p["titel"] not in seen:
            unieke.append(p)
            seen.add(p["titel"])

    log(f"Premières gevonden: {len(unieke)}")
    return unieke


def genereer_html(premieres):
    datum = datetime.now().strftime("%d/%m/%Y")

    html = f"""<html>
<head>
<meta charset="utf-8">
<title>TV Premieres Vlaanderen</title>
<style>
body {{ font-family: Arial; padding: 20px; }}
h1 {{ color: #333; }}
li {{ margin-bottom: 12px; }}
</style>
</head>
<body>
<h1>TV-premières in Vlaanderen</h1>
<p>Laatst bijgewerkt: {datum}</p>
<ul>
"""

    if premieres:
        for p in premieres:
            html += f"<li><strong>{p['titel']}</strong><br>{p['beschrijving']}</li>"
    else:
        html += "<li>Geen premières gevonden vandaag.</li>"

    html += "</ul></body></html>"

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)

    log("HTML gegenereerd.")


if __name__ == "__main__":
    open("log.txt", "w").close()

    programmas = haal_programmas_op()
    premieres = detecteer_premieres(programmas)
    genereer_html(premieres)

    log("Scraper vol
    tooid.")
