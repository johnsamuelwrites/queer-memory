/* ============================================================
   Queer Memory — Search Page
   Full-text search across Wikidata LGBT-related entities.
   Depends on: wikidata.js (QM.wikidata), wikidata-models.js (QM.models)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;

    var form       = document.getElementById('search-form');
    var input      = document.getElementById('search-input');
    var statusEl   = document.getElementById('search-status');
    var resultsEl  = document.getElementById('search-results');

    /* Debounce timer */
    var debounceTimer = null;
    var currentController = null;

    /* --------------------------------------------------------
       Init: read query param and wire up events
       -------------------------------------------------------- */
    function init() {
        if (!form || !input) return;

        /* Pre-fill from URL query param */
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            input.value = q;
            runSearch(q);
        }

        /* Form submit */
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var term = input.value.trim();
            if (term) {
                pushState(term);
                runSearch(term);
            }
        });

        /* Live search on typing (debounced) */
        input.addEventListener('input', function () {
            var term = input.value.trim();
            clearTimeout(debounceTimer);
            if (term.length < 2) {
                clearResults();
                return;
            }
            debounceTimer = setTimeout(function () {
                pushState(term);
                runSearch(term);
            }, 400);
        });

        /* Handle back/forward */
        window.addEventListener('popstate', function () {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';
            input.value = q;
            if (q) {
                runSearch(q);
            } else {
                clearResults();
            }
        });
    }

    /* --------------------------------------------------------
       Push search term into URL without reload
       -------------------------------------------------------- */
    function pushState(term) {
        var url = new URL(window.location);
        url.searchParams.set('q', term);
        history.replaceState(null, '', url);
    }

    /* --------------------------------------------------------
       Clear results
       -------------------------------------------------------- */
    function clearResults() {
        statusEl.textContent = '';
        resultsEl.innerHTML = '';
    }

    /* --------------------------------------------------------
       Run search: fire multiple targeted queries in parallel
       for different entity categories, then merge results.
       -------------------------------------------------------- */
    function runSearch(term) {
        if (currentController) {
            currentController.abort();
        }
        currentController = new AbortController();
        var signal = currentController.signal;

        clearResults();
        var doneLoading = wd.showLoading(resultsEl);
        statusEl.textContent = '';

        var escaped = escapeSparql(term);

        /* Query 1: People with sexual orientation or non-cisgender gender identity */
        var peopleSparql = [
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image WHERE {',
            '  SERVICE wikibase:mwapi {',
            '    bd:serviceParam wikibase:endpoint "www.wikidata.org";',
            '                    wikibase:api "EntitySearch";',
            '                    mwapi:search "' + escaped + '";',
            '                    mwapi:language "en".',
            '    ?item wikibase:apiOutputItem mwapi:item.',
            '  }',
            '  ?item wdt:P31 wd:Q5 .',
            '  { ?item wdt:P91 [] . }',
            '  UNION',
            '  { ?item wdt:P21 ?gender . FILTER(?gender NOT IN (wd:Q6581097, wd:Q6581072)) }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  ' + wd.labelService('en'),
            '}',
            'LIMIT 20'
        ].join('\n');

        /* Query 2: Countries and territories (all — they all have relevance to the site) */
        var countriesSparql = [
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image WHERE {',
            '  SERVICE wikibase:mwapi {',
            '    bd:serviceParam wikibase:endpoint "www.wikidata.org";',
            '                    wikibase:api "EntitySearch";',
            '                    mwapi:search "' + escaped + '";',
            '                    mwapi:language "en".',
            '    ?item wikibase:apiOutputItem mwapi:item.',
            '  }',
            '  { ?item wdt:P31 wd:Q6256 . }',
            '  UNION',
            '  { ?item wdt:P31 wd:Q3624078 . }',
            '  UNION',
            '  { ?item wdt:P31 wd:Q515 . }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  ' + wd.labelService('en'),
            '}',
            'LIMIT 15'
        ].join('\n');

        /* Query 3: LGBT-specific entities (events, orgs, places, flags, media, rights) */
        var lgbtSparql = [
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image WHERE {',
            '  SERVICE wikibase:mwapi {',
            '    bd:serviceParam wikibase:endpoint "www.wikidata.org";',
            '                    wikibase:api "EntitySearch";',
            '                    mwapi:search "' + escaped + '";',
            '                    mwapi:language "en".',
            '    ?item wikibase:apiOutputItem mwapi:item.',
            '  }',
            '  VALUES ?relatedType {',
            '    wd:Q51404 wd:Q7242811 wd:Q64606659 wd:Q6458277',
            '    wd:Q2945640 wd:Q61710650 wd:Q105321449 wd:Q1043639',
            '    wd:Q20442589 wd:Q85133165 wd:Q17898',
            '    wd:Q17888 wd:Q48264 wd:Q29469577 wd:Q62128088',
            '  }',
            '  ?item wdt:P31 ?relatedType .',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  ' + wd.labelService('en'),
            '}',
            'LIMIT 15'
        ].join('\n');

        /* Fire all three queries in parallel */
        var p1 = wd.query(peopleSparql, { signal: signal })
                    .then(function (b) { return tagResults(b, 'person'); })
                    .catch(function () { return []; });

        var p2 = wd.query(countriesSparql, { signal: signal })
                    .then(function (b) { return tagResults(b, 'country'); })
                    .catch(function () { return []; });

        var p3 = wd.query(lgbtSparql, { signal: signal })
                    .then(function (b) { return tagResults(b, 'lgbt'); })
                    .catch(function () { return []; });

        Promise.all([p1, p2, p3])
            .then(function (groups) {
                doneLoading();
                if (signal.aborted) return;

                var merged = mergeResults(groups[0], groups[1], groups[2]);
                renderResults(merged, term);
            })
            .catch(function (err) {
                doneLoading();
                if (err && err.name === 'AbortError') return;
                wd.showError(resultsEl, 'Search failed. Please try again.');
            });
    }

    /* --------------------------------------------------------
       Tag each binding with a category for display
       -------------------------------------------------------- */
    function tagResults(bindings, category) {
        return bindings.map(function (b) {
            b._category = category;
            return b;
        });
    }

    /* --------------------------------------------------------
       Merge and deduplicate results from multiple queries.
       Countries first, then people, then LGBT entities.
       -------------------------------------------------------- */
    function mergeResults(people, countries, lgbt) {
        var seen = {};
        var results = [];

        function add(items) {
            items.forEach(function (b) {
                var id = wd.qid(b, 'item');
                if (id && !seen[id]) {
                    seen[id] = true;
                    results.push(b);
                }
            });
        }

        add(countries);
        add(people);
        add(lgbt);

        return results;
    }

    /* --------------------------------------------------------
       Escape special characters for SPARQL string literal
       -------------------------------------------------------- */
    function escapeSparql(str) {
        return str.replace(/\\/g, '\\\\')
                  .replace(/"/g, '\\"')
                  .replace(/\n/g, '\\n');
    }

    /* --------------------------------------------------------
       Category labels and link-building
       -------------------------------------------------------- */
    var categoryLabels = {
        country: 'Country / City',
        person:  'Person',
        lgbt:    'LGBT Topic'
    };

    function buildLink(b) {
        var id = wd.qid(b, 'item');
        var cat = b._category;

        /* Link countries to internal country page */
        if (cat === 'country') {
            return './country.html?qid=' + id;
        }

        /* Default: link to Wikidata */
        return wd.entityUrl(id);
    }

    function isInternal(b) {
        return b._category === 'country';
    }

    /* --------------------------------------------------------
       Render search results
       -------------------------------------------------------- */
    function renderResults(items, term) {
        if (!items.length) {
            statusEl.textContent = 'No results found for \u201c' + term + '\u201d';
            resultsEl.appendChild(
                wd.el('p', 'qm-empty',
                    'Try a different search term, or browse using the navigation above.')
            );
            return;
        }

        statusEl.textContent = items.length + ' result' + (items.length === 1 ? '' : 's') +
                               ' for \u201c' + term + '\u201d';

        var grid = wd.el('div', 'search-results-grid');

        items.forEach(function (b) {
            var card = wd.el('a', 'search-result-card card');
            card.href = buildLink(b);
            if (!isInternal(b)) {
                card.target = '_blank';
                card.rel = 'noopener';
            }

            /* Image */
            var imgUrl = wd.val(b, 'image');
            if (imgUrl) {
                var imgWrap = wd.el('div', 'search-result-card__image');
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 200);
                img.alt = '';
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                card.appendChild(imgWrap);
            }

            /* Content */
            var content = wd.el('div', 'search-result-card__content');

            content.appendChild(
                wd.el('h3', 'search-result-card__title', wd.val(b, 'itemLabel'))
            );

            var catLabel = categoryLabels[b._category] || '';
            if (catLabel) {
                content.appendChild(
                    wd.el('span', 'search-result-card__type', catLabel)
                );
            }

            var desc = wd.val(b, 'itemDescription');
            if (desc) {
                content.appendChild(
                    wd.el('p', 'search-result-card__desc', desc)
                );
            }

            card.appendChild(content);
            grid.appendChild(card);
        });

        resultsEl.appendChild(grid);
    }

    /* --------------------------------------------------------
       Start
       -------------------------------------------------------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
