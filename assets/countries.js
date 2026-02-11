/* ============================================================
   Queer Memory - Countries
   Lists countries with rights or history data.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    function init() {
        loadCountries();
    }

    function loadCountries() {
        var container = document.getElementById('countries-grid');
        var countEl = document.getElementById('countries-count');
        var searchEl = document.getElementById('countries-search');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        Promise.all([fetchRightsCountries(), fetchHistoryCountries()])
            .then(function (results) {
                doneLoading();
                var rights = results[0];
                var history = results[1];
                var merged = mergeCountries(rights, history);
                renderCountries(container, countEl, merged);
                bindSearch(searchEl, container, merged);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load countries:', err);
                wd.showError(container, 'Could not load countries from Wikidata.');
            });
    }

    function fetchRightsCountries() {
        var sparql = [
            'SELECT ?country ?countryLabel (COUNT(DISTINCT ?rights) AS ?rightsCount) WHERE {',
            '  ?rights wdt:P31 wd:Q17898 .',
            '  OPTIONAL { ?rights wdt:P17 ?countryDirect . }',
            '  BIND(COALESCE(?countryDirect, ?rights) AS ?place)',
            '  ?place wdt:P31 wd:Q6256 .',
            '  BIND(?place AS ?country)',
            '  ' + wd.labelService(),
            '}',
            'GROUP BY ?country ?countryLabel',
            'ORDER BY ?countryLabel',
            'LIMIT 400'
        ].join('\n');

        return wd.query(sparql).then(function (bindings) {
            return bindings.map(function (b) {
                return {
                    qid: wd.qid(b, 'country'),
                    label: wd.val(b, 'countryLabel'),
                    rightsCount: parseInt(wd.val(b, 'rightsCount'), 10) || 0,
                    historyCount: 0
                };
            });
        });
    }

    function fetchHistoryCountries() {
        var sparql = [
            'SELECT ?item ?country ?countryLabel WHERE {',
            '  VALUES ?type { wd:Q130262508 wd:Q125143610 }',
            '  ?item wdt:P31 ?type .',
            '  OPTIONAL { ?item wdt:P17 ?c1 . }',
            '  OPTIONAL { ?item wdt:P921 ?c2 . }',
            '  BIND(COALESCE(?c1, ?c2) AS ?country)',
            '  FILTER(BOUND(?c1) || BOUND(?c2))',
            '  ?country wdt:P31 wd:Q6256 .',
            '  ' + wd.labelService(),
            '}',
            'LIMIT 2000'
        ].join('\n');

        return wd.query(sparql).then(function (bindings) {
            var byCountry = {};
            var labelByCountry = {};

            bindings.forEach(function (b) {
                var countryQid = wd.qid(b, 'country');
                var itemQid = wd.qid(b, 'item');
                if (!countryQid || !itemQid) return;

                if (!byCountry[countryQid]) {
                    byCountry[countryQid] = {};
                    labelByCountry[countryQid] = wd.val(b, 'countryLabel');
                }
                byCountry[countryQid][itemQid] = true;
            });

            return Object.keys(byCountry).map(function (qid) {
                return {
                    qid: qid,
                    label: labelByCountry[qid] || qid,
                    rightsCount: 0,
                    historyCount: Object.keys(byCountry[qid]).length
                };
            });
        });
    }

    function mergeCountries(rights, history) {
        var map = {};

        rights.forEach(function (c) {
            map[c.qid] = c;
        });

        history.forEach(function (c) {
            if (map[c.qid]) {
                map[c.qid].historyCount = c.historyCount;
            } else {
                map[c.qid] = c;
            }
        });

        return Object.keys(map).map(function (qid) { return map[qid]; })
            .sort(function (a, b) {
                return a.label.localeCompare(b.label);
            });
    }

    function renderCountries(container, countEl, countries) {
        if (!countries.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No countries found.'));
            return;
        }

        if (countEl) {
            countEl.textContent = countries.length + ' countries';
        }

        countries.forEach(function (country) {
            var link = document.createElement('a');
            link.href = './country.html?id=' + country.qid;
            link.className = 'location-card card';

            var name = wd.el('h3', 'location-card__name', country.label);
            link.appendChild(name);

            var tags = wd.el('div', 'location-card__tags');
            if (country.rightsCount > 0) {
                tags.appendChild(wd.el('span', 'location-tag', 'Rights items: ' + country.rightsCount));
            }
            if (country.historyCount > 0) {
                tags.appendChild(wd.el('span', 'location-tag', 'History items: ' + country.historyCount));
            }
            link.appendChild(tags);

            container.appendChild(link);
        });
    }

    function bindSearch(input, container, countries) {
        if (!input) return;
        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            container.innerHTML = '';
            var filtered = countries.filter(function (c) {
                return c.label.toLowerCase().indexOf(q) >= 0;
            });
            renderCountries(container, null, filtered);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
