/* ============================================================
   Queer Memory — Interactive Timeline (Vertical)
   Fetches events from Wikidata across 4 categories (Rights,
   Activism, Culture, People), renders a vertical scrollable
   timeline grouped by decade → year with collapsible sections.
   Depends on: wikidata.js (QM.wikidata), i18n.js (QM.i18n)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    /* ----------------------------------------------------------
       Categories
       ---------------------------------------------------------- */
    var CATEGORIES = [
        { key: 'rights', label: i18n ? i18n.t('timeline.rights') : 'Rights', color: 'var(--accent-success)' },
        { key: 'activism', label: i18n ? i18n.t('timeline.activism') : 'Activism', color: 'var(--accent-secondary)' },
        { key: 'culture', label: i18n ? i18n.t('timeline.culture') : 'Culture', color: 'var(--accent-tertiary)' },
        { key: 'people', label: i18n ? i18n.t('timeline.people') : 'People', color: 'var(--accent-warm)' }
    ];

    /* ----------------------------------------------------------
       State
       ---------------------------------------------------------- */
    var allEvents = [];
    var visibleCategories = { rights: true, activism: true, culture: true, people: true };

    /* ----------------------------------------------------------
       Bootstrap
       ---------------------------------------------------------- */
    function init() {
        var container = document.getElementById('timeline-container');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        Promise.all([
            queryRights(),
            queryActivism(),
            queryCulture(),
            queryPeople()
        ]).then(function (results) {
            doneLoading();
            allEvents = [].concat.apply([], results);
            allEvents.sort(function (a, b) { return a.year - b.year; });

            if (!allEvents.length) {
                wd.showError(container,
                    i18n ? i18n.t('timeline.noEvents') : 'No events found.');
                return;
            }

            buildFilters();
            renderTimeline();
            expandCurrentDecade();
        }).catch(function () {
            doneLoading();
            wd.showError(container,
                i18n ? i18n.t('timeline.error') : 'Could not load timeline data.');
        });
    }

    /* ----------------------------------------------------------
       SPARQL Queries
       ---------------------------------------------------------- */

    /* 1. Legal milestones — rights classes with dates */
    function queryRights() {
        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?article WHERE {',
            '  VALUES ?type { wd:Q130262462 wd:Q130265950 wd:Q130286663',
            '                 wd:Q130286655 wd:Q130320678 wd:Q123237562 wd:Q130301689 }',
            '  ?item wdt:P31 ?type .',
            '  { ?item wdt:P585 ?date . } UNION { ?item wdt:P571 ?date . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?date',
            'LIMIT 120'
        ].join('\n');

        return wd.query(sparql).then(function (bindings) {
            return dedup(bindings, 'item').map(function (b) {
                return makeEvent(b, 'item', 'rights');
            }).filter(Boolean);
        }).catch(function () { return []; });
    }

    /* 2. Pride events with dates — use direct P31 match, avoid expensive P279* */
    function queryActivism() {
        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?article WHERE {',
            '  VALUES ?type { wd:Q51404 wd:Q125506609 }',
            '  ?item wdt:P31 ?type .',
            '  { ?item wdt:P585 ?date . } UNION { ?item wdt:P571 ?date . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?date',
            'LIMIT 80'
        ].join('\n');

        return wd.query(sparql).then(function (bindings) {
            return dedup(bindings, 'item').map(function (b) {
                return makeEvent(b, 'item', 'activism');
            }).filter(Boolean);
        }).catch(function () { return []; });
    }

    /* 3. LGBTQ+ cultural works — use P31 only, with publication date P577 */
    function queryCulture() {
        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?article WHERE {',
            '  VALUES ?type { wd:Q20442589 wd:Q85133165 wd:Q10318944 wd:Q62018250 }',
            '  ?item wdt:P31 ?type .',
            '  { ?item wdt:P577 ?date . } UNION { ?item wdt:P571 ?date . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?date',
            'LIMIT 80'
        ].join('\n');

        return wd.query(sparql).then(function (bindings) {
            return dedup(bindings, 'item').map(function (b) {
                return makeEvent(b, 'item', 'culture');
            }).filter(Boolean);
        }).catch(function () { return []; });
    }

    /* 4. Notable LGBTQ+ people — activists with birth dates */
    function queryPeople() {
        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?article WHERE {',
            '  ?item wdt:P31 wd:Q5 ;',
            '        wdt:P106 wd:Q19509201 ;',
            '        wdt:P569 ?date .',
            '  FILTER(YEAR(?date) >= 1850)',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?date',
            'LIMIT 80'
        ].join('\n');

        return wd.query(sparql).then(function (bindings) {
            return dedup(bindings, 'item').map(function (b) {
                return makeEvent(b, 'item', 'people');
            }).filter(Boolean);
        }).catch(function () { return []; });
    }

    /* ----------------------------------------------------------
       Build filter buttons
       ---------------------------------------------------------- */
    function buildFilters() {
        var container = document.getElementById('timeline-filters');
        if (!container) return;

        CATEGORIES.forEach(function (cat) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'timeline-filter-btn timeline-filter-btn--' + cat.key;
            btn.textContent = cat.label;
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('data-category', cat.key);
            btn.style.setProperty('--cat-color', cat.color);

            btn.addEventListener('click', function () {
                visibleCategories[cat.key] = !visibleCategories[cat.key];
                btn.setAttribute('aria-pressed', visibleCategories[cat.key] ? 'true' : 'false');
                btn.classList.toggle('timeline-filter-btn--off', !visibleCategories[cat.key]);
                updateVisibility();
            });

            container.appendChild(btn);
        });

        /* Expand / Collapse All buttons */
        var bulkWrap = document.getElementById('timeline-bulk-actions');
        if (bulkWrap) {
            var expandAllBtn = bulkWrap.querySelector('[data-action="expand"]');
            var collapseAllBtn = bulkWrap.querySelector('[data-action="collapse"]');

            if (expandAllBtn) {
                expandAllBtn.addEventListener('click', function () {
                    toggleAllDecades(true);
                });
            }
            if (collapseAllBtn) {
                collapseAllBtn.addEventListener('click', function () {
                    toggleAllDecades(false);
                });
            }
        }
    }

    function updateVisibility() {
        var nodes = document.querySelectorAll('.vtl-event');
        for (var i = 0; i < nodes.length; i++) {
            var cat = nodes[i].getAttribute('data-category');
            nodes[i].style.display = visibleCategories[cat] ? '' : 'none';
        }

        /* Update year counts and hide empty years */
        updateYearCounts();
    }

    /* ----------------------------------------------------------
       Render vertical timeline
       ---------------------------------------------------------- */
    function renderTimeline() {
        var container = document.getElementById('timeline-container');
        if (!container) return;
        container.innerHTML = '';

        /* Group events by decade → year */
        var decades = groupByDecade(allEvents);
        var decadeKeys = Object.keys(decades).sort(function (a, b) {
            return parseInt(a, 10) - parseInt(b, 10);
        });

        decadeKeys.forEach(function (decadeKey) {
            var decadeData = decades[decadeKey];
            var decadeSection = renderDecade(decadeKey, decadeData);
            container.appendChild(decadeSection);
        });
    }

    function groupByDecade(events) {
        var decades = {};
        events.forEach(function (evt) {
            var dk = Math.floor(evt.year / 10) * 10;
            if (!decades[dk]) decades[dk] = {};
            if (!decades[dk][evt.year]) decades[dk][evt.year] = [];
            decades[dk][evt.year].push(evt);
        });
        return decades;
    }

    function renderDecade(decadeKey, yearMap) {
        var label = decadeKey + 's';
        var yearKeys = Object.keys(yearMap).sort(function (a, b) {
            return parseInt(a, 10) - parseInt(b, 10);
        });

        /* Count total events in this decade */
        var totalCount = 0;
        yearKeys.forEach(function (yk) { totalCount += yearMap[yk].length; });

        /* Decade container = <details> */
        var details = document.createElement('details');
        details.className = 'vtl-decade';
        details.setAttribute('data-decade', decadeKey);

        /* Summary */
        var summary = document.createElement('summary');
        summary.className = 'vtl-decade__summary';

        var titleSpan = document.createElement('span');
        titleSpan.className = 'vtl-decade__title';
        titleSpan.textContent = label;
        summary.appendChild(titleSpan);

        var countSpan = document.createElement('span');
        countSpan.className = 'vtl-decade__count';
        countSpan.textContent = totalCount + ' ' + (totalCount === 1
            ? (i18n ? i18n.t('timeline.event') : 'event')
            : (i18n ? i18n.t('timeline.events') : 'events'));
        summary.appendChild(countSpan);

        /* Category dots preview in summary */
        var dotsPreview = document.createElement('span');
        dotsPreview.className = 'vtl-decade__dots';
        var catCounts = {};
        yearKeys.forEach(function (yk) {
            yearMap[yk].forEach(function (evt) {
                catCounts[evt.category] = (catCounts[evt.category] || 0) + 1;
            });
        });
        CATEGORIES.forEach(function (cat) {
            if (catCounts[cat.key]) {
                var dot = document.createElement('span');
                dot.className = 'vtl-decade__dot';
                dot.style.background = cat.color;
                dot.title = cat.label + ': ' + catCounts[cat.key];
                dotsPreview.appendChild(dot);
            }
        });
        summary.appendChild(dotsPreview);

        details.appendChild(summary);

        /* Year groups inside the decade */
        var yearsContainer = document.createElement('div');
        yearsContainer.className = 'vtl-decade__years';

        yearKeys.forEach(function (yearKey) {
            var yearGroup = renderYear(yearKey, yearMap[yearKey]);
            yearsContainer.appendChild(yearGroup);
        });

        details.appendChild(yearsContainer);
        return details;
    }

    function renderYear(yearKey, events) {
        var details = document.createElement('details');
        details.className = 'vtl-year';
        details.setAttribute('data-year', yearKey);
        details.open = true; /* Years open by default when decade is expanded */

        /* Summary */
        var summary = document.createElement('summary');
        summary.className = 'vtl-year__summary';

        var yearLabel = document.createElement('span');
        yearLabel.className = 'vtl-year__label';
        yearLabel.textContent = yearKey;
        summary.appendChild(yearLabel);

        var countSpan = document.createElement('span');
        countSpan.className = 'vtl-year__count';
        countSpan.setAttribute('data-total', events.length);
        countSpan.textContent = events.length + ' ' + (events.length === 1
            ? (i18n ? i18n.t('timeline.event') : 'event')
            : (i18n ? i18n.t('timeline.events') : 'events'));
        summary.appendChild(countSpan);

        details.appendChild(summary);

        /* Event list */
        var list = document.createElement('div');
        list.className = 'vtl-year__events';

        events.forEach(function (evt, index) {
            var side = index % 2 === 0 ? 'left' : 'right';
            var card = renderEventCard(evt, side);
            list.appendChild(card);
        });

        details.appendChild(list);
        return details;
    }

    function renderEventCard(evt, side) {
        var catInfo = getCatInfo(evt.category);

        var card = document.createElement('a');
        card.className = 'vtl-event vtl-event--' + evt.category + ' vtl-event--' + (side || 'left');
        card.setAttribute('data-category', evt.category);
        card.href = evt.url || '#';
        card.target = '_blank';
        card.rel = 'noopener';

        /* Category indicator line */
        var indicator = document.createElement('span');
        indicator.className = 'vtl-event__indicator';
        indicator.style.background = catInfo.color;
        card.appendChild(indicator);

        /* Content */
        var content = document.createElement('div');
        content.className = 'vtl-event__content';

        /* Badge + title row */
        var header = document.createElement('div');
        header.className = 'vtl-event__header';

        var badge = document.createElement('span');
        badge.className = 'vtl-event__badge';
        badge.style.background = catInfo.color;
        badge.textContent = catInfo.label;
        header.appendChild(badge);

        var title = document.createElement('span');
        title.className = 'vtl-event__title';
        title.textContent = evt.label;
        header.appendChild(title);

        content.appendChild(header);

        /* Description */
        if (evt.desc) {
            var desc = document.createElement('p');
            desc.className = 'vtl-event__desc';
            desc.textContent = evt.desc;
            content.appendChild(desc);
        }

        card.appendChild(content);
        return card;
    }

    /* ----------------------------------------------------------
       Expand / Collapse
       ---------------------------------------------------------- */
    function expandCurrentDecade() {
        var currentDecade = Math.floor(new Date().getFullYear() / 10) * 10;
        var allDecades = document.querySelectorAll('.vtl-decade');
        var found = false;

        for (var i = 0; i < allDecades.length; i++) {
            var dk = parseInt(allDecades[i].getAttribute('data-decade'), 10);
            if (dk === currentDecade) {
                allDecades[i].open = true;
                found = true;
            }
        }

        /* If current decade has no data, open the last decade */
        if (!found && allDecades.length > 0) {
            allDecades[allDecades.length - 1].open = true;
        }
    }

    function toggleAllDecades(open) {
        var allDecades = document.querySelectorAll('.vtl-decade');
        for (var i = 0; i < allDecades.length; i++) {
            allDecades[i].open = open;
        }
    }

    /* ----------------------------------------------------------
       Update counts when filters change
       ---------------------------------------------------------- */
    function updateYearCounts() {
        var yearGroups = document.querySelectorAll('.vtl-year');
        for (var i = 0; i < yearGroups.length; i++) {
            var events = yearGroups[i].querySelectorAll('.vtl-event');
            var visibleCount = 0;
            for (var j = 0; j < events.length; j++) {
                if (events[j].style.display !== 'none') visibleCount++;
            }

            /* Update count text */
            var countEl = yearGroups[i].querySelector('.vtl-year__count');
            if (countEl) {
                countEl.textContent = visibleCount + ' ' + (visibleCount === 1
                    ? (i18n ? i18n.t('timeline.event') : 'event')
                    : (i18n ? i18n.t('timeline.events') : 'events'));
            }

            /* Hide year group entirely if no visible events */
            yearGroups[i].style.display = visibleCount === 0 ? 'none' : '';
        }

        /* Update decade counts too */
        var decadeGroups = document.querySelectorAll('.vtl-decade');
        for (var d = 0; d < decadeGroups.length; d++) {
            var decadeEvents = decadeGroups[d].querySelectorAll('.vtl-event');
            var decadeVisible = 0;
            for (var k = 0; k < decadeEvents.length; k++) {
                if (decadeEvents[k].style.display !== 'none') decadeVisible++;
            }

            var decadeCount = decadeGroups[d].querySelector('.vtl-decade__count');
            if (decadeCount) {
                decadeCount.textContent = decadeVisible + ' ' + (decadeVisible === 1
                    ? (i18n ? i18n.t('timeline.event') : 'event')
                    : (i18n ? i18n.t('timeline.events') : 'events'));
            }

            decadeGroups[d].style.display = decadeVisible === 0 ? 'none' : '';
        }
    }

    /* ----------------------------------------------------------
       Helpers
       ---------------------------------------------------------- */
    function dedup(bindings, key) {
        var seen = {};
        var result = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, key);
            if (!seen[id]) { seen[id] = true; result.push(b); }
        });
        return result;
    }

    function makeEvent(b, key, category) {
        var dateStr = wd.val(b, 'date');
        if (!dateStr) return null;
        var year = parseYear(dateStr);
        if (isNaN(year)) return null;

        return {
            qid: wd.qid(b, key),
            label: wd.val(b, key + 'Label') || '',
            desc: wd.val(b, key + 'Description') || '',
            year: year,
            category: category,
            url: wd.val(b, 'article') || wd.entityUrl(wd.qid(b, key))
        };
    }

    function parseYear(iso) {
        if (!iso) return NaN;
        var match = iso.match(/^(-?\d{1,4})/);
        return match ? parseInt(match[1], 10) : NaN;
    }

    function getCatInfo(key) {
        for (var i = 0; i < CATEGORIES.length; i++) {
            if (CATEGORIES[i].key === key) return CATEGORIES[i];
        }
        return { key: key, label: key, color: 'var(--text-muted)' };
    }

    /* ----------------------------------------------------------
       Start
       ---------------------------------------------------------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
