/* ============================================================
   Queer Memory - Cities
   Lists cities linked to LGBTQIA+ events, places, or organizations.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    var PLACE_TYPES = [
        'Q2945640',   /* LGBT community center */
        'Q118108259', /* LGBT information point */
        'Q61710650',  /* LGBT museum */
        'Q64364539',  /* LGBT place */
        'Q61710689',  /* LGBT archive */
        'Q62128088',  /* LGBT library */
        'Q29469577'   /* LGBT historic place */
    ];

    var ORG_TYPES = [
        'Q64606659',  /* LGBTQ+ organization */
        'Q6458277'    /* LGBTQ+ rights organization */
    ];

    var EVENT_TYPES = [
        'Q64348974',  /* LGBTQ+ event */
        'Q125506609', /* LGBT+ protest */
        'Q130285134'  /* LGBT pride in a geographic region */
    ];

    function init() {
        loadCities();
    }

    function loadCities() {
        var container = document.getElementById('cities-grid');
        var countEl = document.getElementById('cities-count');
        var searchEl = document.getElementById('cities-search');
        if (!container) return;

        var doneLoading = wd.showLoading(container);
        var state = { cities: [] };
        bindSearch(searchEl, container, state);

        var merged = {};
        var loadingCleared = false;
        var totalQueries = 3;
        var pending = totalQueries;
        var successes = 0;
        updateCount(countEl, state.cities.length, pending, totalQueries);

        function finishOne() {
            pending -= 1;
            updateCount(countEl, state.cities.length, pending, totalQueries);
            if (pending === 0 && !loadingCleared) {
                doneLoading();
                loadingCleared = true;
            }
            if (pending === 0 && !successes) {
                wd.showError(container, 'Could not load cities from Wikidata.');
            }
        }

        function handleSuccess(bindings) {
            successes += 1;
            mergeInto(merged, parseCities(bindings));
            state.cities = mergedToSortedList(merged);
            if (!loadingCleared) {
                doneLoading();
                loadingCleared = true;
            }
            renderCities(container, getFilteredCities(state, searchEl));
            finishOne();
        }

        function handleFailure(err) {
            console.warn('Cities sub-query failed:', err);
            finishOne();
        }

        wd.query(buildCitiesSparql(PLACE_TYPES, 900))
            .then(handleSuccess)
            .catch(handleFailure);

        wd.query(buildCitiesSparql(ORG_TYPES, 900))
            .then(handleSuccess)
            .catch(handleFailure);

        wd.query(buildCitiesSparql(EVENT_TYPES, 900))
            .then(handleSuccess)
            .catch(handleFailure);
    }

    function buildCitiesSparql(typeQids, limit) {
        return [
            'SELECT ?city ?cityLabel ?country ?countryLabel (COUNT(DISTINCT ?item) AS ?count) WHERE {',
            '  VALUES ?type { ' + typeQids.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  ?item (wdt:P131|wdt:P276|wdt:P159) ?city .',
            '  OPTIONAL { ?city wdt:P17 ?country . }',
            '  ' + wd.labelService(),
            '}',
            'GROUP BY ?city ?cityLabel ?country ?countryLabel',
            'ORDER BY DESC(?count) ?cityLabel',
            'LIMIT ' + limit
        ].join('\n');
    }

    function parseCities(bindings) {
        return bindings.map(function (b) {
            return {
                qid: wd.qid(b, 'city'),
                label: wd.val(b, 'cityLabel'),
                country: wd.val(b, 'countryLabel'),
                count: parseInt(wd.val(b, 'count'), 10) || 0
            };
        });
    }

    function mergeInto(merged, list) {
        list.forEach(function (city) {
            if (!merged[city.qid]) {
                merged[city.qid] = {
                    qid: city.qid,
                    label: city.label,
                    country: city.country,
                    count: 0
                };
            }
            merged[city.qid].count += city.count;
            if (!merged[city.qid].country && city.country) {
                merged[city.qid].country = city.country;
            }
        });
    }

    function mergedToSortedList(merged) {
        return Object.keys(merged)
            .map(function (qid) { return merged[qid]; })
            .sort(function (a, b) {
                if (b.count !== a.count) return b.count - a.count;
                return a.label.localeCompare(b.label);
            });
    }

    function renderCities(container, cities) {
        container.innerHTML = '';
        if (!cities.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No cities found.'));
            return;
        }

        cities.forEach(function (city) {
            var link = document.createElement('a');
            link.href = './city.html?id=' + city.qid;
            link.className = 'location-card card';

            var name = wd.el('h3', 'location-card__name', city.label);
            link.appendChild(name);

            if (city.country) {
                link.appendChild(wd.el('div', 'location-card__meta', city.country));
            }

            var tags = wd.el('div', 'location-card__tags');
            tags.appendChild(wd.el('span', 'location-tag', city.count + ' items (places/events/orgs)'));
            link.appendChild(tags);

            container.appendChild(link);
        });
    }

    function updateCount(countEl, totalCities, pending, totalQueries) {
        if (!countEl) return;
        var done = totalQueries - pending;
        countEl.textContent = totalCities + ' places';
        if (pending > 0) {
            countEl.textContent += ' · updating ' + done + '/' + totalQueries;
            countEl.classList.add('location-count--updating');
            return;
        }
        countEl.classList.remove('location-count--updating');
    }

    function getFilteredCities(state, input) {
        var q = input && input.value ? input.value.trim().toLowerCase() : '';
        if (!q) return state.cities;
        return state.cities.filter(function (c) {
            return c.label.toLowerCase().indexOf(q) >= 0 ||
                (c.country && c.country.toLowerCase().indexOf(q) >= 0);
        });
    }

    function bindSearch(input, container, state) {
        if (!input) return;
        input.addEventListener('input', function () {
            renderCities(container, getFilteredCities(state, input));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
