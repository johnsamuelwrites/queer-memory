/* ============================================================
   Queer Memory - History & Timelines
   Fetches and renders LGBTQIA+ history data from Wikidata.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;

    /* ----------------------------------------------------------
       Configuration - model QIDs (WikiProject LGBT)
       ---------------------------------------------------------- */

    var TIMELINE_TYPES = [
        { qid: 'Q125143610', label: 'LGBT timeline' },
        { qid: 'Q130262508', label: 'LGBT history in a geographic region' }
    ];

    var MOVEMENT_TOPICS = [
        {
            qid: 'Q130283248',
            label: 'LGBT movement in a geographic area',
            desc: 'Regional movement histories and organizing efforts.'
        },
        {
            qid: 'Q130285134',
            label: 'LGBT pride in a geographic region',
            desc: 'Pride records by region, including festivals and celebrations.'
        },
        {
            qid: 'Q125506609',
            label: 'LGBT+ protest',
            desc: 'Protest events and mobilizations.'
        },
        {
            qid: 'Q64348974',
            label: 'LGBTQ+ event',
            desc: 'Documented LGBTQ+ events across time and place.'
        }
    ];


    /* ----------------------------------------------------------
       Page initialisation
       ---------------------------------------------------------- */

    function init() {
        loadTimelinesByRegion();
        loadMovementTopics();
        loadPeopleActivists();
        loadHotspots();
    }


    /* ----------------------------------------------------------
       Section 1: Timelines by region
       Instances of Q125143610 and Q130262508
       ---------------------------------------------------------- */

    function loadTimelinesByRegion() {
        var container = document.getElementById('history-eras-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);
        var typeQids = TIMELINE_TYPES.map(function (t) { return t.qid; });

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?type ?typeLabel ?country ?countryLabel ?article WHERE {',
            '  ' + wd.valuesClause('?type', typeQids),
            '  ?item wdt:P31 ?type .',
            '  OPTIONAL { ?item wdt:P17 ?country . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <https://en.wikipedia.org/> .',
            '  }',
            '  ' + wd.labelService('en'),
            '}',
            'ORDER BY ?countryLabel ?itemLabel',
            'LIMIT 200'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderTimelineCards(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load timelines:', err);
                wd.showError(container, 'Could not load timelines from Wikidata.');
            });
    }

    function renderTimelineCards(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No timelines found.'));
            return;
        }

        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'item');
            if (!seen[id]) {
                seen[id] = true;
                unique.push(b);
            }
        });

        unique.forEach(function (b) {
            var card = wd.el('article', 'history-card card');
            var itemQid = wd.qid(b, 'item');
            var itemLabel = wd.val(b, 'itemLabel');
            var itemDesc = wd.val(b, 'itemDescription');
            var typeLabel = wd.val(b, 'typeLabel');
            var countryLabel = wd.val(b, 'countryLabel');

            var title = wd.el('h3', 'history-card__title', itemLabel);
            card.appendChild(title);

            if (countryLabel) {
                card.appendChild(wd.el('span', 'history-card__meta', countryLabel));
            }

            if (typeLabel) {
                card.appendChild(wd.el('span', 'history-card__tag', typeLabel));
            }

            if (itemDesc) {
                card.appendChild(wd.el('p', 'history-card__desc', itemDesc));
            }

            var links = wd.el('div', 'history-card__links');
            var articleUrl = wd.val(b, 'article');
            var link = document.createElement('a');
            link.href = articleUrl || wd.entityUrl(itemQid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = articleUrl ? 'Wikipedia' : 'Wikidata';
            link.className = 'identity-card__link';
            links.appendChild(link);
            card.appendChild(links);

            container.appendChild(card);
        });
    }


    /* ----------------------------------------------------------
       Section 2: Movements, pride, and protest
       ---------------------------------------------------------- */

    function loadMovementTopics() {
        var container = document.getElementById('history-movements-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);
        var topicQids = MOVEMENT_TOPICS.map(function (t) { return t.qid; });

        var sparql = [
            'SELECT ?topic ?topicLabel (COUNT(DISTINCT ?item) AS ?count) WHERE {',
            '  ' + wd.valuesClause('?topic', topicQids),
            '  ?item wdt:P31 ?topic .',
            '  ' + wd.labelService('en'),
            '}',
            'GROUP BY ?topic ?topicLabel',
            'ORDER BY DESC(?count)'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderMovementTopics(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load movement topics:', err);
                wd.showError(container, 'Could not load movement data from Wikidata.');
            });
    }

    function renderMovementTopics(container, bindings) {
        var countMap = {};
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'topic');
            countMap[id] = parseInt(wd.val(b, 'count'), 10) || 0;
        });

        MOVEMENT_TOPICS.forEach(function (topic) {
            var card = wd.el('article', 'history-card card');
            var count = countMap[topic.qid] || 0;
            var countStr = count > 0
                ? count + ' ' + (count === 1 ? 'entry' : 'entries')
                : 'No data yet';

            card.appendChild(wd.el('h3', 'history-card__title', topic.label));
            card.appendChild(wd.el('p', 'history-card__desc', topic.desc));
            card.appendChild(wd.el('span', 'history-card__count', countStr));

            var links = wd.el('div', 'history-card__links');
            var link = document.createElement('a');
            link.href = wd.entityUrl(topic.qid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = 'Wikidata class';
            link.className = 'identity-card__link';
            links.appendChild(link);
            card.appendChild(links);

            container.appendChild(card);
        });
    }


    /* ----------------------------------------------------------
       Section 3: People & activists
       People with occupation LGBT rights activist (Q19509201)
       ---------------------------------------------------------- */

    function loadPeopleActivists() {
        var container = document.getElementById('history-people-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?person ?personLabel ?personDescription ?image ?article ?dob ?dod WHERE {',
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:P106 wd:Q19509201 .',
            '  OPTIONAL { ?person wdt:P18 ?image . }',
            '  OPTIONAL { ?person wdt:P569 ?dob . }',
            '  OPTIONAL { ?person wdt:P570 ?dod . }',
            '  OPTIONAL {',
            '    ?article schema:about ?person ;',
            '            schema:isPartOf <https://en.wikipedia.org/> .',
            '  }',
            '  ' + wd.labelService('en'),
            '}',
            'ORDER BY ?personLabel',
            'LIMIT 24'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderPeopleCards(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load activists:', err);
                wd.showError(container, 'Could not load activists from Wikidata.');
            });
    }

    function renderPeopleCards(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No people found.'));
            return;
        }

        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'person');
            if (!seen[id]) {
                seen[id] = true;
                unique.push(b);
            }
        });

        unique.forEach(function (b) {
            var card = wd.el('article', 'history-person-card card');
            var personQid = wd.qid(b, 'person');

            var imgUrl = wd.val(b, 'image');
            if (imgUrl) {
                var imgWrap = wd.el('div', 'history-person-card__image');
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 320);
                img.alt = '';
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                card.appendChild(imgWrap);
            }

            var name = wd.el('h3', 'history-card__title', wd.val(b, 'personLabel'));
            card.appendChild(name);

            var dates = formatDates(wd.val(b, 'dob'), wd.val(b, 'dod'));
            if (dates) {
                card.appendChild(wd.el('span', 'history-card__meta', dates));
            }

            var desc = wd.val(b, 'personDescription');
            if (desc) {
                card.appendChild(wd.el('p', 'history-card__desc', desc));
            }

            var links = wd.el('div', 'history-card__links');
            var articleUrl = wd.val(b, 'article');
            var link = document.createElement('a');
            link.href = articleUrl || wd.entityUrl(personQid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = articleUrl ? 'Wikipedia' : 'Wikidata';
            link.className = 'identity-card__link';
            links.appendChild(link);
            card.appendChild(links);

            container.appendChild(card);
        });
    }

    function formatDates(dob, dod) {
        if (!dob) return '';
        var start = formatYear(dob);
        if (!start) return '';
        if (dod) return start + ' - ' + formatYear(dod);
        return start;
    }

    function formatYear(isoDate) {
        if (!isoDate) return '';
        var match = isoDate.match(/^(-?\d{1,4})/);
        if (match) {
            var year = parseInt(match[1], 10);
            if (year < 0) return Math.abs(year) + ' BCE';
            return String(year);
        }
        return isoDate.substring(0, 4);
    }


    /* ----------------------------------------------------------
       Section 4: Global hotspots
       Count LGBTQ+ events by country
       ---------------------------------------------------------- */

    function loadHotspots() {
        var container = document.getElementById('history-hotspots');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?country ?countryLabel (COUNT(DISTINCT ?event) AS ?count) WHERE {',
            '  ?event wdt:P31 wd:Q64348974 .',
            '  ?event wdt:P17 ?country .',
            '  ' + wd.labelService('en'),
            '}',
            'GROUP BY ?country ?countryLabel',
            'ORDER BY DESC(?count)',
            'LIMIT 12'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderHotspots(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load hotspots:', err);
                wd.showError(container, 'Could not load hotspots from Wikidata.');
            });
    }

    function renderHotspots(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No hotspots found.'));
            return;
        }

        bindings.forEach(function (b) {
            var card = wd.el('article', 'history-card card');
            var countryQid = wd.qid(b, 'country');
            var label = wd.val(b, 'countryLabel');
            var count = parseInt(wd.val(b, 'count'), 10) || 0;

            card.appendChild(wd.el('h3', 'history-card__title', label));
            card.appendChild(wd.el('span', 'history-card__count', count + ' events'));

            var links = wd.el('div', 'history-card__links');
            var link = document.createElement('a');
            link.href = wd.entityUrl(countryQid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = 'Wikidata';
            link.className = 'identity-card__link';
            links.appendChild(link);
            card.appendChild(links);

            container.appendChild(card);
        });
    }


    /* ----------------------------------------------------------
       Bootstrap
       ---------------------------------------------------------- */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
