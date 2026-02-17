/* ============================================================
   Queer Memory — Search Page
   Full-text search across Wikidata LGBT-related entities.
   Depends on: wikidata.js (QM.wikidata), wikidata-models.js (QM.models)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

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
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  SERVICE wikibase:mwapi {',
            '    bd:serviceParam wikibase:endpoint "www.wikidata.org";',
            '                    wikibase:api "EntitySearch";',
            '                    mwapi:search "' + escaped + '";',
            '                    mwapi:language "' + lang + '".',
            '    ?item wikibase:apiOutputItem mwapi:item.',
            '  }',
            '  ?item wdt:P31 wd:Q5 .',
            '  { ?item wdt:P91 ?orient . FILTER(?orient != wd:Q1035954) }',
            '  UNION',
            '  { ?item wdt:P21 ?gender . FILTER(?gender NOT IN (wd:Q6581097, wd:Q6581072)) }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'LIMIT 20'
        ].join('\n');

        /* Query 2: Countries and territories (all — they all have relevance to the site) */
        var countriesSparql = [
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  SERVICE wikibase:mwapi {',
            '    bd:serviceParam wikibase:endpoint "www.wikidata.org";',
            '                    wikibase:api "EntitySearch";',
            '                    mwapi:search "' + escaped + '";',
            '                    mwapi:language "' + lang + '".',
            '    ?item wikibase:apiOutputItem mwapi:item.',
            '  }',
            '  VALUES ?geoType { wd:Q6256 wd:Q3624078 wd:Q515 wd:Q56061 wd:Q47168 }',
            '  ?item wdt:P31/wdt:P279* ?geoType .',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'LIMIT 25'
        ].join('\n');

        /* Query 3: LGBT-specific entities (events, orgs, places, flags, media, rights) */
        var lgbtSparql = [
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  SERVICE wikibase:mwapi {',
            '    bd:serviceParam wikibase:endpoint "www.wikidata.org";',
            '                    wikibase:api "EntitySearch";',
            '                    mwapi:search "' + escaped + '";',
            '                    mwapi:language "' + lang + '".',
            '    ?item wikibase:apiOutputItem mwapi:item.',
            '  }',
            '  VALUES ?relatedType {',
            '    wd:Q64348974 wd:Q125506609 wd:Q130285134 wd:Q51404',
            '    wd:Q64606659 wd:Q6458277 wd:Q64364539 wd:Q2945640',
            '    wd:Q61710650 wd:Q105321449 wd:Q1043639 wd:Q61710689',
            '    wd:Q62128088 wd:Q29469577 wd:Q7242811 wd:Q20442589',
            '    wd:Q85133165 wd:Q17898 wd:Q17888 wd:Q48264 wd:Q84433816',
            '  }',
            '  ?item wdt:P31/wdt:P279* ?relatedType .',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'LIMIT 30'
        ].join('\n');

        /* Query 4: Broad fallback search to catch entities missed by typed filters */
        var fallbackSparql = [
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  SERVICE wikibase:mwapi {',
            '    bd:serviceParam wikibase:endpoint "www.wikidata.org";',
            '                    wikibase:api "EntitySearch";',
            '                    mwapi:search "' + escaped + '";',
            '                    mwapi:language "' + lang + '".',
            '    ?item wikibase:apiOutputItem mwapi:item.',
            '  }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'LIMIT 20'
        ].join('\n');

        var fallbackEnglishSparql = [
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  SERVICE wikibase:mwapi {',
            '    bd:serviceParam wikibase:endpoint "www.wikidata.org";',
            '                    wikibase:api "EntitySearch";',
            '                    mwapi:search "' + escaped + '";',
            '                    mwapi:language "en".',
            '    ?item wikibase:apiOutputItem mwapi:item.',
            '  }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'LIMIT 40'
        ].join('\n');

        /* Fire queries in parallel and render incrementally as they complete */
        var totalQueries = (lang === 'en') ? 5 : 6;
        var pending = totalQueries;
        var successes = 0;
        var buckets = {
            people: [],
            country: [],
            lgbt: [],
            fallback: [],
            fallbackEn: [],
            srsearch: []
        };
        var queryStates = {
            people: { label: i18n ? i18n.t('search.catPerson') : 'People', state: 'pending' },
            country: { label: i18n ? i18n.t('search.catCountry') : 'Countries / Cities', state: 'pending' },
            lgbt: { label: i18n ? i18n.t('search.catLgbt') : 'LGBT topics', state: 'pending' },
            fallback: { label: 'General', state: 'pending' },
            srsearch: { label: 'Wiki search', state: 'pending' }
        };
        if (lang !== 'en') {
            queryStates.fallbackEn = { label: 'General (EN)', state: 'pending' };
        }

        updateStatus(term, 0, pending, totalQueries);
        renderProgress(pending, totalQueries, queryStates);

        function finishOne() {
            if (signal.aborted) return;
            pending -= 1;
            var mergedNow = mergeResults(
                buckets.people,
                buckets.country,
                buckets.lgbt,
                buckets.fallback,
                buckets.fallbackEn,
                buckets.srsearch
            );
            renderResults(mergedNow, term, pending, totalQueries, queryStates);
            if (pending === 0) {
                doneLoading();
            }
            if (pending === 0 && successes === 0) {
                wd.showError(resultsEl, i18n ? i18n.t('search.failed') : 'Search failed. Please try again.');
            }
        }

        function onSuccess(bindings, bucketKey, category) {
            if (signal.aborted) return;
            successes += 1;
            buckets[bucketKey] = tagResults(bindings, category);
            if (queryStates[bucketKey]) queryStates[bucketKey].state = 'done';
            finishOne();
        }

        function onFailure(err) {
            if (signal.aborted) return;
            if (err && err.name === 'AbortError') return;
            if (err && err._bucketKey && queryStates[err._bucketKey]) {
                queryStates[err._bucketKey].state = 'error';
            }
            finishOne();
        }

        wd.query(peopleSparql, { signal: signal })
            .then(function (b) { onSuccess(b, 'people', 'person'); })
            .catch(function (err) {
                err = err || {};
                err._bucketKey = 'people';
                onFailure(err);
            });

        wd.query(countriesSparql, { signal: signal })
            .then(function (b) { onSuccess(b, 'country', 'country'); })
            .catch(function (err) {
                err = err || {};
                err._bucketKey = 'country';
                onFailure(err);
            });

        wd.query(lgbtSparql, { signal: signal })
            .then(function (b) { onSuccess(b, 'lgbt', 'lgbt'); })
            .catch(function (err) {
                err = err || {};
                err._bucketKey = 'lgbt';
                onFailure(err);
            });

        wd.query(fallbackSparql, { signal: signal })
            .then(function (b) { onSuccess(b, 'fallback', 'fallback'); })
            .catch(function (err) {
                err = err || {};
                err._bucketKey = 'fallback';
                onFailure(err);
            });

        fetchSpecialSearchItems(term, signal)
            .then(function (b) { onSuccess(b, 'srsearch', 'fallback'); })
            .catch(function (err) {
                err = err || {};
                err._bucketKey = 'srsearch';
                onFailure(err);
            });

        if (lang !== 'en') {
            wd.query(fallbackEnglishSparql, { signal: signal })
                .then(function (b) { onSuccess(b, 'fallbackEn', 'fallback'); })
                .catch(function (err) {
                    err = err || {};
                    err._bucketKey = 'fallbackEn';
                    onFailure(err);
                });
        }
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
    function mergeResults(people, countries, lgbt, fallback, fallbackEn, srsearch) {
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
        add(fallback || []);
        add(fallbackEn || []);
        add(srsearch || []);

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

    function fetchSpecialSearchItems(term, signal) {
        var params = new URLSearchParams({
            action: 'query',
            list: 'search',
            srsearch: term,
            srlimit: '200',
            srnamespace: '0',
            srprop: 'title',
            language: 'en',
            format: 'json',
            origin: '*'
        });

        return fetch('https://www.wikidata.org/w/api.php?' + params.toString(), {
            headers: { 'Accept': 'application/json' },
            signal: signal
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Wikidata search API failed: HTTP ' + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                var rows = (data && data.query && data.query.search) ? data.query.search : [];
                var seen = {};
                var qids = [];
                rows.forEach(function (row) {
                    var title = row && row.title ? String(row.title) : '';
                    if (/^Q\d+$/.test(title) && !seen[title]) {
                        seen[title] = true;
                        qids.push(title);
                    }
                });
                if (!qids.length) return [];

                var capped = qids.slice(0, 60);
                var rank = {};
                capped.forEach(function (qid, index) { rank[qid] = index; });

                return wd.fetchItems(capped, { signal: signal })
                    .then(function (bindings) {
                        return bindings.slice().sort(function (a, b) {
                            return (rank[wd.qid(a, 'item')] || 9999) - (rank[wd.qid(b, 'item')] || 9999);
                        });
                    });
            });
    }

    /* --------------------------------------------------------
       Category labels and link-building
       -------------------------------------------------------- */
    var categoryLabels = {
        country: i18n ? i18n.t('search.catCountry') : 'Country / City',
        person:  i18n ? i18n.t('search.catPerson') : 'Person',
        lgbt:    i18n ? i18n.t('search.catLgbt') : 'LGBT Topic',
        fallback: 'Topic'
    };

    function buildLink(b) {
        var id = wd.qid(b, 'item');
        var cat = b._category;
        var articleUrl = wd.val(b, 'article');

        /* Link countries to internal country page */
        if (cat === 'country') {
            return './country.html?qid=' + id;
        }

        if (articleUrl) {
            return articleUrl;
        }

        /* Fallback: link to Wikidata */
        return wd.entityUrl(id);
    }

    function isInternal(b) {
        return b._category === 'country';
    }

    /* --------------------------------------------------------
       Render search results
       -------------------------------------------------------- */
    function updateStatus(term, count, pending, totalQueries) {
        var resultsWord = count === 1
            ? (i18n ? i18n.t('search.results') : 'result')
            : (i18n ? i18n.t('search.resultsPlural') : 'results');

        statusEl.textContent = count + ' ' + resultsWord + ' ' + (i18n ? i18n.t('search.for') : 'for') + ' \u201c' + term + '\u201d';
        if (pending > 0) {
            var done = totalQueries - pending;
            statusEl.textContent += ' \u00b7 updating ' + done + '/' + totalQueries;
        }
    }

    function renderProgress(pending, totalQueries, queryStates) {
        var existing = document.getElementById('search-progress');
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }
        if (pending <= 0) return;

        var progress = wd.el('div', 'search-progress');
        progress.id = 'search-progress';

        var bar = wd.el('div', 'search-progress__bar');
        var fill = wd.el('div', 'search-progress__fill');
        var percent = Math.round(((totalQueries - pending) / totalQueries) * 100);
        fill.style.width = percent + '%';
        bar.appendChild(fill);
        progress.appendChild(bar);

        var chips = wd.el('div', 'search-progress__chips');
        Object.keys(queryStates).forEach(function (key) {
            var meta = queryStates[key];
            var chipClass = 'search-progress__chip ';
            if (meta.state === 'done') chipClass += 'search-progress__chip--done';
            else if (meta.state === 'error') chipClass += 'search-progress__chip--error';
            else chipClass += 'search-progress__chip--pending';
            chips.appendChild(wd.el('span', chipClass, meta.label));
        });
        progress.appendChild(chips);
        resultsEl.appendChild(progress);
    }

    function renderResults(items, term, pending, totalQueries, queryStates) {
        updateStatus(term, items.length, pending, totalQueries);

        Array.prototype.slice.call(resultsEl.children).forEach(function (child) {
            if (!child.classList.contains('qm-loading')) {
                resultsEl.removeChild(child);
            }
        });

        renderProgress(pending, totalQueries, queryStates || {});

        if (!items.length) {
            if (pending > 0) {
                resultsEl.appendChild(
                    wd.el('p', 'qm-empty', i18n ? i18n.t('loading') : 'Loading from Wikidata\u2026')
                );
            } else {
                statusEl.textContent = (i18n ? i18n.t('search.noResults') : 'No results found for') + ' \u201c' + term + '\u201d';
                resultsEl.appendChild(
                    wd.el('p', 'qm-empty',
                        i18n ? i18n.t('search.tryAgain') : 'Try a different search term, or browse using the navigation above.')
                );
            }
            return;
        }

        var grid = wd.el('div', 'search-results-grid');

        items.forEach(function (b) {
            var card = wd.el('article', 'search-result-card card');

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
            var titleWrap = wd.el('h3', 'search-result-card__title');
            var titleLink = document.createElement('a');
            titleLink.className = 'search-result-card__title-link';
            titleLink.href = buildLink(b);
            titleLink.textContent = wd.val(b, 'itemLabel');
            if (!isInternal(b)) {
                titleLink.target = '_blank';
                titleLink.rel = 'noopener';
            }
            titleWrap.appendChild(titleLink);
            content.appendChild(titleWrap);

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

            var links = wd.el('div', 'identity-card__links');
            var articleUrl = wd.val(b, 'article');

            if (articleUrl) {
                var wpLink = document.createElement('a');
                wpLink.href = articleUrl;
                wpLink.target = '_blank';
                wpLink.rel = 'noopener';
                wpLink.textContent = i18n ? i18n.t('link.wikipedia') : 'Wikipedia';
                wpLink.className = 'identity-card__link';
                links.appendChild(wpLink);
            }

            var wdLink = document.createElement('a');
            wdLink.href = wd.entityUrl(wd.qid(b, 'item'));
            wdLink.target = '_blank';
            wdLink.rel = 'noopener';
            wdLink.textContent = i18n ? i18n.t('link.wikidata') : 'Wikidata';
            wdLink.className = 'identity-card__link';
            links.appendChild(wdLink);

            content.appendChild(links);

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
