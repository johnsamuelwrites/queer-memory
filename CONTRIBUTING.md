# Contributing to Queer Memory

Thanks for helping improve Queer Memory. There are two main paths:

1. Improve the site code or queries.
2. Improve the underlying data on Wikidata, Wikipedia, or Wikimedia Commons.

## Quick Start (Code)
1. Fork the repository and clone your fork.
2. Open the site locally:

```bash
python -m http.server
```

Then visit `http://localhost:8000` and navigate the site. For profile pages, you can test by adding `?id=Q...` to `country.html` or `city.html`.

## Project Structure
- HTML pages render sections and templates.
- Page-specific JavaScript lives in `assets/*.js`.
- Shared SPARQL helpers live in `assets/wikidata.js`.
- Query models and templates live in `assets/wikidata-models.js`.

## Query and Data Guidelines
- Avoid hardcoding facts in HTML; prefer Wikidata-backed queries.
- Keep queries readable and reusable when possible.
- Align with WikiProject LGBT modeling guidance to improve consistency.

## UI and Content Guidelines
- Preserve semantic HTML and accessibility attributes.
- Keep text concise and descriptive.
- Avoid introducing non-ASCII characters unless the file already uses them.

## Submitting Changes
1. Create a focused branch for your change.
2. Include a short description of what you changed and why.
3. For UI updates, include a screenshot in the pull request.

## Reporting Issues
Use the GitHub issue tracker to report bugs or request features. Include:
- Steps to reproduce (if applicable)
- Expected vs. actual behavior
- Screenshots or console output if relevant

## License
By contributing, you agree that your contributions will be licensed under the GNU AGPL v3 (see `LICENSE`).
