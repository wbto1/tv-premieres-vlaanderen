if (!fs.existsSync("docs/data")) {
  fs.mkdirSync("docs/data", { recursive: true });
}

fs.writeFileSync(
  "docs/data/tv-premieres.json",
  JSON.stringify(premieres, null, 2)
);
