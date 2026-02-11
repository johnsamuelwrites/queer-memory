/* ============================================================
   Queer Memory — Rights & Law Page
   Fetches and renders LGBTQ+ rights data from Wikidata.
   Depends on: wikidata.js (QM.wikidata), wikidata-models.js (QM.models)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var models = QM.models;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    /* ----------------------------------------------------------
       Configuration — rights topic QIDs from WikiProject LGBT
       ---------------------------------------------------------- */

    /**
     * Key rights topics — each maps to a Wikidata class that has
     * country-level instances (P31 -> this class).
     */
    var RIGHTS_TOPICS = [
        {
            qid:   'Q130262462',
            label: i18n ? i18n.t('rights.marriage') : 'Same-sex marriage',
            icon:  '\uD83D\uDC8D',
            desc:  i18n ? i18n.t('rights.marriageDesc') : 'Countries and territories with legal same-sex marriage.'
        },
        {
            qid:   'Q130265950',
            label: i18n ? i18n.t('rights.unions') : 'Same-sex unions',
            icon:  '\uD83E\uDD1D',
            desc:  i18n ? i18n.t('rights.unionsDesc') : 'Countries with civil unions, domestic partnerships, or other same-sex union recognition.'
        },
        {
            qid:   'Q130286663',
            label: i18n ? i18n.t('rights.decrim') : 'Decriminalization',
            icon:  '\u2696\uFE0F',
            desc:  i18n ? i18n.t('rights.decrimDesc') : 'Countries that have decriminalized consensual same-sex relations.'
        },
        {
            qid:   'Q130286655',
            label: i18n ? i18n.t('rights.adoption') : 'Same-sex adoption',
            icon:  '\uD83D\uDC76',
            desc:  i18n ? i18n.t('rights.adoptionDesc') : 'Countries allowing adoption by same-sex couples.'
        },
        {
            qid:   'Q130320678',
            label: i18n ? i18n.t('rights.conversion') : 'Conversion therapy bans',
            icon:  '\uD83D\uDEAB',
            desc:  i18n ? i18n.t('rights.conversionDesc') : 'Countries or regions that have outlawed conversion therapy.'
        },
        {
            qid:   'Q123237562',
            label: i18n ? i18n.t('rights.trans') : 'Transgender rights',
            icon:  '\u26A7\uFE0F',
            desc:  i18n ? i18n.t('rights.transDesc') : 'Transgender rights by country, including legal gender recognition.'
        },
        {
            qid:   'Q130301689',
            label: i18n ? i18n.t('rights.intersex') : 'Intersex rights',
            icon:  '\uD83D\uDFE3',
            desc:  i18n ? i18n.t('rights.intersexDesc') : 'Intersex rights by country, including protections against non-consensual medical interventions.'
        }
    ];

    /**
     * Discrimination / violence topics.
     */
    var DISCRIMINATION_TOPICS = [
        {
            qid:   'Q130297530',
            label: 'Discrimination',
            desc:  'Documented discrimination against LGBT people by region.'
        },
        {
            qid:   'Q130297534',
            label: 'Violence',
            desc:  'Documented violence against LGBT people by region.'
        },
        {
            qid:   'Q130297541',
            label: 'History of violence',
            desc:  'Historical documentation of violence against LGBT people.'
        }
    ];


    /* ----------------------------------------------------------
       Page initialisation
       ---------------------------------------------------------- */

    function init() {
        loadCountryRightsArticles();
        loadRightsTopics();
        loadDiscriminationTopics();
    }


    /* ----------------------------------------------------------
       Section 1: Country rights articles overview
       Instances of Q17898 (LGBT rights by country or territory)
       ---------------------------------------------------------- */

    function loadCountryRightsArticles() {
        var container = document.getElementById('rights-countries-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?country ?countryLabel ?image ?article WHERE {',
            '  ?item wdt:P31 wd:Q17898 .',
            '  OPTIONAL { ?item wdt:P17 ?country . }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?countryLabel',
            'LIMIT 300'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCountryRightsGrid(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load country rights articles:', err);
                wd.showError(container, 'Could not load country rights data from Wikidata.');
            });
    }

    function renderCountryRightsGrid(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No country rights articles found.'));
            return;
        }

        /* Deduplicate by item QID */
        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'item');
            if (!seen[id]) {
                seen[id] = true;
                unique.push(b);
            }
        });

        /* Summary stat */
        var stat = wd.el('p', 'rights-stat',
            unique.length + ' country and territory rights articles on Wikidata');
        container.parentNode.insertBefore(stat, container);

        /* Render as alphabetical card grid */
        unique.forEach(function (b) {
            var card = wd.el('a', 'rights-country-card');
            var itemQid = wd.qid(b, 'item');

            /* Link destination: Wikipedia if available, else Wikidata */
            var articleUrl = wd.val(b, 'article');
            card.href = articleUrl || wd.entityUrl(itemQid);
            card.target = '_blank';
            card.rel = 'noopener';
            card.setAttribute('data-qid', itemQid);

            /* Country name */
            var countryLabel = wd.val(b, 'countryLabel');
            var itemLabel = wd.val(b, 'itemLabel');
            var displayName = countryLabel || itemLabel;

            var name = wd.el('span', 'rights-country-card__name', displayName);
            card.appendChild(name);

            /* Description snippet */
            var desc = wd.val(b, 'itemDescription');
            if (desc) {
                var descEl = wd.el('span', 'rights-country-card__desc', desc);
                card.appendChild(descEl);
            }

            container.appendChild(card);
        });
    }


    /* ----------------------------------------------------------
       Section 2: Rights topics
       Count instances of each rights class
       ---------------------------------------------------------- */

    function loadRightsTopics() {
        var container = document.getElementById('rights-topics-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        /* Build a SPARQL query that counts instances for each rights topic */
        var topicQids = RIGHTS_TOPICS.map(function (t) { return t.qid; });
        var sparql = [
            'SELECT ?topic ?topicLabel (COUNT(DISTINCT ?item) AS ?count) WHERE {',
            '  ' + wd.valuesClause('?topic', topicQids),
            '  ?item wdt:P31 ?topic .',
            '  ' + wd.labelService(),
            '}',
            'GROUP BY ?topic ?topicLabel',
            'ORDER BY DESC(?count)'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderRightsTopics(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load rights topic counts:', err);
                wd.showError(container, 'Could not load rights topic data from Wikidata.');
            });
    }

    function renderRightsTopics(container, bindings) {
        /* Build a count map from query results */
        var countMap = {};
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'topic');
            countMap[id] = parseInt(wd.val(b, 'count'), 10) || 0;
        });

        /* Render each topic card in curated order */
        RIGHTS_TOPICS.forEach(function (topic) {
            var card = wd.el('article', 'rights-topic-card card');
            card.setAttribute('data-qid', topic.qid);

            /* Icon */
            var iconEl = wd.el('span', 'rights-topic-card__icon', topic.icon);
            iconEl.setAttribute('aria-hidden', 'true');
            card.appendChild(iconEl);

            /* Title */
            card.appendChild(wd.el('h3', 'rights-topic-card__title', topic.label));

            /* Description */
            card.appendChild(wd.el('p', 'rights-topic-card__desc', topic.desc));

            /* Count */
            var count = countMap[topic.qid] || 0;
            var countStr = count > 0
                ? count + ' ' + (count === 1 ? 'region' : 'regions') + ' on Wikidata'
                : (i18n ? i18n.t('empty.noData') : 'No data yet');
            card.appendChild(wd.el('span', 'rights-topic-card__count', countStr));

            /* Links */
            var links = wd.el('div', 'rights-topic-card__links');

            var wdLink = document.createElement('a');
            wdLink.href = wd.entityUrl(topic.qid);
            wdLink.target = '_blank';
            wdLink.rel = 'noopener';
            wdLink.textContent = i18n ? i18n.t('link.wikidataClass') : 'Wikidata class';
            wdLink.className = 'identity-card__link';
            links.appendChild(wdLink);

            /* "Show regions" expand button */
            if (count > 0) {
                var expandBtn = document.createElement('button');
                expandBtn.type = 'button';
                expandBtn.className = 'btn btn--secondary rights-topic-card__expand-btn';
                expandBtn.textContent = i18n ? i18n.t('btn.showRegions') : 'Show regions';
                expandBtn.setAttribute('data-qid', topic.qid);
                expandBtn.setAttribute('aria-expanded', 'false');
                expandBtn.addEventListener('click', onExpandTopic);
                links.appendChild(expandBtn);
            }

            card.appendChild(links);

            /* Expandable region list */
            var regionList = wd.el('div', 'rights-topic-card__regions');
            regionList.id = 'regions-' + topic.qid;
            regionList.hidden = true;
            card.appendChild(regionList);

            container.appendChild(card);
        });
    }


    /* ----------------------------------------------------------
       Expand / collapse region list for a rights topic
       ---------------------------------------------------------- */

    function onExpandTopic(e) {
        var btn = e.currentTarget;
        var topicQid = btn.getAttribute('data-qid');
        var regionContainer = document.getElementById('regions-' + topicQid);
        if (!regionContainer) return;

        var expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            regionContainer.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            btn.textContent = i18n ? i18n.t('btn.showRegions') : 'Show regions';
            return;
        }

        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = i18n ? i18n.t('btn.hideRegions') : 'Hide regions';
        regionContainer.hidden = false;

        /* Only load once */
        if (regionContainer.getAttribute('data-loaded')) return;
        regionContainer.setAttribute('data-loaded', 'true');

        var doneLoading = wd.showLoading(regionContainer);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?country ?countryLabel ?article WHERE {',
            '  ?item wdt:P31 wd:' + topicQid + ' .',
            '  OPTIONAL { ?item wdt:P17 ?country . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?countryLabel',
            'LIMIT 200'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderRegionList(regionContainer, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load regions for topic:', err);
                wd.showError(regionContainer, 'Could not load region data from Wikidata.');
            });
    }

    function renderRegionList(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No regions found.'));
            return;
        }

        /* Deduplicate */
        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'item');
            if (!seen[id]) {
                seen[id] = true;
                unique.push(b);
            }
        });

        var list = wd.el('ul', 'region-list');

        unique.forEach(function (b) {
            var li = wd.el('li', 'region-list__item');

            var countryLabel = wd.val(b, 'countryLabel');
            var itemLabel = wd.val(b, 'itemLabel');
            var displayName = countryLabel || itemLabel;

            var articleUrl = wd.val(b, 'article');
            var itemQid = wd.qid(b, 'item');

            var link = document.createElement('a');
            link.href = articleUrl || wd.entityUrl(itemQid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'region-list__link';
            link.textContent = displayName;
            li.appendChild(link);

            var desc = wd.val(b, 'itemDescription');
            if (desc) {
                li.appendChild(wd.el('span', 'region-list__desc', ' \u2014 ' + desc));
            }

            list.appendChild(li);
        });

        container.appendChild(list);
    }


    /* ----------------------------------------------------------
       Section 3: Discrimination & violence
       ---------------------------------------------------------- */

    function loadDiscriminationTopics() {
        var container = document.getElementById('rights-discrimination-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var topicQids = DISCRIMINATION_TOPICS.map(function (t) { return t.qid; });
        var sparql = [
            'SELECT ?topic ?topicLabel (COUNT(DISTINCT ?item) AS ?count) WHERE {',
            '  ' + wd.valuesClause('?topic', topicQids),
            '  ?item wdt:P31 ?topic .',
            '  ' + wd.labelService(),
            '}',
            'GROUP BY ?topic ?topicLabel',
            'ORDER BY DESC(?count)'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderDiscriminationTopics(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load discrimination data:', err);
                wd.showError(container, 'Could not load discrimination data from Wikidata.');
            });
    }

    function renderDiscriminationTopics(container, bindings) {
        var countMap = {};
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'topic');
            countMap[id] = parseInt(wd.val(b, 'count'), 10) || 0;
        });

        DISCRIMINATION_TOPICS.forEach(function (topic) {
            var card = wd.el('article', 'discrimination-card card');

            card.appendChild(wd.el('h3', 'discrimination-card__title', topic.label));
            card.appendChild(wd.el('p', 'discrimination-card__desc', topic.desc));

            var count = countMap[topic.qid] || 0;
            var countStr = count > 0
                ? count + ' ' + (count === 1 ? 'entry' : 'entries') + ' on Wikidata'
                : (i18n ? i18n.t('empty.noData') : 'No data yet');
            card.appendChild(wd.el('span', 'discrimination-card__count', countStr));

            /* Link to Wikidata class */
            var link = document.createElement('a');
            link.href = wd.entityUrl(topic.qid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = i18n ? i18n.t('link.viewOnWikidata') : 'View on Wikidata';
            link.className = 'identity-card__link';
            var linkWrap = wd.el('div', 'discrimination-card__links');
            linkWrap.appendChild(link);

            /* Expand button */
            if (count > 0) {
                var expandBtn = document.createElement('button');
                expandBtn.type = 'button';
                expandBtn.className = 'btn btn--secondary rights-topic-card__expand-btn';
                expandBtn.textContent = i18n ? i18n.t('btn.showEntries') : 'Show entries';
                expandBtn.setAttribute('data-qid', topic.qid);
                expandBtn.setAttribute('aria-expanded', 'false');
                expandBtn.addEventListener('click', onExpandTopic);
                linkWrap.appendChild(expandBtn);
            }

            card.appendChild(linkWrap);

            /* Expandable list */
            var regionList = wd.el('div', 'rights-topic-card__regions');
            regionList.id = 'regions-' + topic.qid;
            regionList.hidden = true;
            card.appendChild(regionList);

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
