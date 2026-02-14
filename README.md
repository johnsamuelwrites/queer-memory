# Queer Memory

Queer Memory explores global LGBTQIA+ history through places, timelines, laws, culture, and activism. The site is a static front end that queries Wikidata live and links to Wikipedia and Wikimedia Commons where available.

GitHub source: https://github.com/johnsamuelwrites/queer-memory
Live application: https://queer-memory.toolforge.org/

## Features
- Country and city discovery pages that link to detailed profiles.
- Section pages for rights, history, identities, places, activism, and culture.
- A dedicated search page for people, places, events, and works.
- A data and methodology page that documents sources, models, and limitations.
- Live data from the Wikidata Query Service (SPARQL), rendered client-side.
- Direct links to Wikidata and Wikipedia for transparency and verification.
- Home page highlights, including live stats, featured timelines, and pride events.

## Data Sources
- `Wikidata` for structured entities and relationships.
- `Wikipedia` for narrative context when available.
- `Wikimedia Commons` for media assets.

The project follows WikiProject LGBT data models and class hierarchies to keep scope consistent and improve coverage.

## Project Structure
Key files and folders:
- `index.html` - Landing page.
- `countries.html`, `cities.html` - Discovery lists.
- `country.html`, `city.html` - Profile templates (driven by `?id=Q...`).
- `history.html`, `rights.html`, `culture.html`, `identities.html`, `places.html`, `activism.html` - Section pages.
- `search.html` - Site-wide search.
- `data.html` - Data sources, methodology, and licensing notes.
- `assets/` - JS modules and styles:
  - `assets/wikidata.js` - SPARQL helpers and shared utilities.
  - `assets/wikidata-models.js` - Query models and shared templates.
  - `assets/*.js` - Page-level data loaders.
  - `assets/styles.css` - Global styles.

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

See `CONTRIBUTING.md` for code standards, query guidance, and submission steps.

For data improvements, consider joining [WikiProject LGBT](https://www.wikidata.org/wiki/Wikidata:WikiProject_LGBT) to align with shared models and best practices.

## Release Notes
Release history is tracked in `RELEASE.md`.

## License & Attribution
Code in this repository is licensed under the GNU AGPL v3. See `LICENSE`.

This project links to Wikimedia content and follows their licenses:
- Wikidata: CC0
- Wikipedia and Wikimedia Commons: CC BY-SA (and related licenses per item)

Please verify licensing for any media or text you reuse outside this project.
