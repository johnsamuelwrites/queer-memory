# Queer Memory

Queer Memory explores global LGBTQIA+ history through places, timelines, laws, culture, and activism. The site is a static front end that queries Wikidata live and links to Wikipedia and Wikimedia Commons where available.

## Features
- Country and city discovery pages that link to detailed profiles.
- Section pages for rights, history, identities, places, activism, and culture.
- Live data from the Wikidata Query Service (SPARQL), rendered client-side.
- Direct links to Wikidata and Wikipedia for transparency and verification.

## Data Sources
- `Wikidata` for structured entities and relationships.
- `Wikipedia` for narrative context when available.
- `Wikimedia Commons` for media assets.

The project follows WikiProject LGBT data models and class hierarchies to keep scope consistent and improve coverage.

## Project Structure
Key files and folders:
- `index.html` — Landing page.
- `countries.html`, `cities.html` — Discovery lists.
- `country.html`, `city.html` — Profile templates (driven by `?id=Q...`).
- `assets/` — JS modules and styles:
  - `assets/wikidata.js` — SPARQL helpers and shared utilities.
  - `assets/*.js` — Page-level data loaders.
  - `assets/styles.css` — Global styles.

## Running Locally
This is a static site. You can open `index.html` directly, or run a simple local server:

```bash
python -m http.server
```

Then visit `http://localhost:8000`.

## Query Notes
The site uses live SPARQL queries against the Wikidata Query Service. If a page appears empty or slow:
- The query service may be rate-limited or temporarily unavailable.
- Some items may not yet be modeled in Wikidata.

## Contributing
There are two ways to contribute:
1. Improve the site code or queries.
2. Improve the underlying data by editing Wikidata, Wikipedia, or Wikimedia Commons.

For data improvements, consider joining [WikiProject LGBT](https://www.wikidata.org/wiki/Wikidata:WikiProject_LGBT) to align with shared models and best practices.

## License & Attribution
This project links to Wikimedia content and follows their licenses:
- Wikidata: CC0
- Wikipedia and Wikimedia Commons: CC BY-SA (and related licenses per item)

Please verify licensing for any media or text you reuse outside this project.
