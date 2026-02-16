/* ============================================================
   Queer Memory - Rights Grid (map replacement)
   Fetches LGBTQ+ rights data by topic from Wikidata and renders
   a sortable/filterable country matrix.
   Depends on: wikidata.js (QM.wikidata), i18n.js (QM.i18n)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    var TOPICS = [
        { key: 'marriage',   qid: 'Q130262462', label: i18n ? i18n.t('heatmap.marriage')  : 'Marriage' },
        { key: 'unions',     qid: 'Q130265950', label: i18n ? i18n.t('heatmap.unions')    : 'Civil unions' },
        { key: 'decrim',     qid: 'Q130286663', label: i18n ? i18n.t('heatmap.decrim')    : 'Decriminalization' },
        { key: 'adoption',   qid: 'Q130286655', label: i18n ? i18n.t('heatmap.adoption')  : 'Adoption' },
        { key: 'conversion', qid: 'Q130320678', label: i18n ? i18n.t('heatmap.conversion'): 'Conversion therapy ban' },
        { key: 'trans',      qid: 'Q123237562', label: i18n ? i18n.t('heatmap.trans')     : 'Trans rights' },
        { key: 'intersex',   qid: 'Q130301689', label: i18n ? i18n.t('heatmap.intersex')  : 'Intersex rights' }
    ];

    var activeTopic = 'all';
    var topicResults = {};   /* key -> { code -> { article, itemUrl } } */
    var countryNames = {};   /* code -> display name */
    var rows = [];           /* normalized rows for table */
    var sortState = { key: 'score', dir: 'desc' };
    var searchTerm = '';

    function init() {
        var container = document.getElementById('heatmap-map');
        if (!container) return;

        var doneLoading = wd.showLoading(container);
        loadAllTopics()
            .then(function () {
                buildRows();
                doneLoading();
                buildControls();
                buildLegend();
                renderGrid();
            })
            .catch(function () {
                doneLoading();
                wd.showError(container, i18n ? i18n.t('heatmap.error') : 'Could not load heatmap data.');
            });
    }

    function loadAllTopics() {
        var promises = TOPICS.map(function (topic) {
            return queryTopic(topic);
        });
        return Promise.all(promises);
    }

    function queryTopic(topic) {
        var sparql = [
            'SELECT DISTINCT ?country ?countryLabel ?code ?item ?article WHERE {',
            '  ?item wdt:P31 wd:' + topic.qid + ' .',
            '  ?item wdt:P17 ?country .',
            '  ?country wdt:P297 ?code .',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'LIMIT 400'
        ].join('\n');

        return wd.query(sparql)
            .then(function (bindings) {
                var map = {};
                bindings.forEach(function (b) {
                    var code = wd.val(b, 'code');
                    if (!code) return;
                    code = code.toUpperCase();

                    var name = wd.val(b, 'countryLabel');
                    if (name && !countryNames[code]) {
                        countryNames[code] = name;
                    }

                    if (!map[code]) {
                        var articleUrl = wd.val(b, 'article');
                        var itemQid = wd.qid(b, 'item');
                        map[code] = {
                            article: articleUrl || '',
                            itemUrl: wd.entityUrl(itemQid)
                        };
                    }
                });
                topicResults[topic.key] = map;
            })
            .catch(function () {
                topicResults[topic.key] = {};
            });
    }

    function buildRows() {
        var allCodes = {};
        TOPICS.forEach(function (topic) {
            var map = topicResults[topic.key] || {};
            Object.keys(map).forEach(function (code) { allCodes[code] = true; });
        });

        rows = Object.keys(allCodes).map(function (code) {
            var status = {};
            var score = 0;

            TOPICS.forEach(function (topic) {
                var entry = (topicResults[topic.key] || {})[code] || null;
                status[topic.key] = entry;
                if (entry) score++;
            });

            return {
                code: code,
                country: countryNames[code] || code,
                score: score,
                status: status
            };
        });
    }

    function buildControls() {
        var controls = document.getElementById('heatmap-controls');
        if (!controls) return;
        controls.innerHTML = '';

        var allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'heatmap-btn heatmap-btn--active';
        allBtn.textContent = i18n ? i18n.t('heatmap.all') : 'All topics';
        allBtn.setAttribute('data-topic', 'all');
        allBtn.addEventListener('click', function () { selectTopic('all'); });
        controls.appendChild(allBtn);

        TOPICS.forEach(function (topic) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'heatmap-btn';
            btn.textContent = topic.label;
            btn.setAttribute('data-topic', topic.key);
            btn.addEventListener('click', function () { selectTopic(topic.key); });
            controls.appendChild(btn);
        });
    }

    function selectTopic(topicKey) {
        activeTopic = topicKey;
        var btns = document.querySelectorAll('.heatmap-btn');
        for (var i = 0; i < btns.length; i++) {
            var btn = btns[i];
            btn.classList.toggle('heatmap-btn--active', btn.getAttribute('data-topic') === topicKey);
        }
        renderGrid();
    }

    function buildLegend() {
        var legend = document.getElementById('heatmap-legend');
        if (!legend) return;
        legend.innerHTML = '';

        var labels = [
            { cls: 'heatmap-legend__swatch heatmap-legend__swatch--yes', text: 'Linked entry' },
            { cls: 'heatmap-legend__swatch heatmap-legend__swatch--no', text: i18n ? i18n.t('heatmap.noData') : 'No data' }
        ];

        labels.forEach(function (item) {
            var row = wd.el('div', 'heatmap-legend__item');
            row.appendChild(wd.el('span', item.cls));
            row.appendChild(wd.el('span', 'heatmap-legend__label', item.text));
            legend.appendChild(row);
        });
    }

    function getFilteredRows() {
        var q = searchTerm.trim().toLowerCase();
        var filtered = rows.filter(function (row) {
            if (activeTopic !== 'all' && !row.status[activeTopic]) return false;
            if (!q) return true;
            return row.country.toLowerCase().indexOf(q) >= 0 || row.code.toLowerCase().indexOf(q) >= 0;
        });

        filtered.sort(function (a, b) {
            var mul = sortState.dir === 'asc' ? 1 : -1;
            if (sortState.key === 'country') {
                return a.country.localeCompare(b.country) * mul;
            }
            if (sortState.key === 'score') {
                if (a.score === b.score) return a.country.localeCompare(b.country);
                return (a.score - b.score) * mul;
            }
            return 0;
        });

        return filtered;
    }

    function setSort(key) {
        if (sortState.key === key) {
            sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
        } else {
            sortState.key = key;
            sortState.dir = key === 'country' ? 'asc' : 'desc';
        }
        renderGrid();
    }

    function renderGrid() {
        var container = document.getElementById('heatmap-map');
        if (!container) return;
        container.innerHTML = '';

        var filtered = getFilteredRows();

        var toolbar = wd.el('div', 'heatmap-table-toolbar');
        var search = document.createElement('input');
        search.type = 'search';
        search.className = 'heatmap-table-search';
        search.placeholder = i18n ? i18n.t('search.placeholder') : 'Search countries...';
        search.value = searchTerm;
        search.addEventListener('input', function () {
            searchTerm = search.value || '';
            renderGrid();
        });
        toolbar.appendChild(search);

        var meta = wd.el(
            'span',
            'heatmap-table-meta',
            filtered.length + ' ' + (filtered.length === 1 ? 'country' : 'countries')
        );
        toolbar.appendChild(meta);
        container.appendChild(toolbar);

        var wrap = wd.el('div', 'heatmap-table-wrap');
        var table = wd.el('table', 'heatmap-table');
        table.setAttribute('aria-label', 'LGBTQ rights country matrix');

        var thead = document.createElement('thead');
        var headRow = document.createElement('tr');

        headRow.appendChild(makeSortableHeader('Country', 'country'));
        headRow.appendChild(makeSortableHeader('Score', 'score'));
        TOPICS.forEach(function (topic) {
            var th = document.createElement('th');
            th.className = 'heatmap-table__topic';
            th.textContent = topic.label;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        var tbody = document.createElement('tbody');
        if (!filtered.length) {
            var emptyRow = document.createElement('tr');
            var emptyCell = document.createElement('td');
            emptyCell.className = 'heatmap-table__empty';
            emptyCell.colSpan = 2 + TOPICS.length;
            emptyCell.textContent = i18n ? i18n.t('empty.noResults') : 'No results found.';
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            filtered.forEach(function (row) {
                var tr = document.createElement('tr');

                var countryCell = document.createElement('td');
                countryCell.className = 'heatmap-table__country';
                countryCell.innerHTML = '<strong>' + escapeHtml(row.country) + '</strong><span>' + row.code + '</span>';
                tr.appendChild(countryCell);

                var scoreCell = document.createElement('td');
                scoreCell.className = 'heatmap-table__score';
                scoreCell.textContent = row.score + '/7';
                tr.appendChild(scoreCell);

                TOPICS.forEach(function (topic) {
                    var td = document.createElement('td');
                    var entry = row.status[topic.key];
                    td.className = 'heatmap-table__status';
                    if (entry) {
                        var link = document.createElement('a');
                        var href = entry.article || entry.itemUrl;
                        var isWikipedia = href.indexOf('wikipedia.org') >= 0;
                        link.href = href;
                        link.target = '_blank';
                        link.rel = 'noopener';
                        link.className = 'heatmap-table__status-link ' + (isWikipedia
                            ? 'heatmap-table__status-link--wikipedia'
                            : 'heatmap-table__status-link--wikidata');
                        link.textContent = isWikipedia
                            ? (i18n ? i18n.t('link.wikipedia') : 'Wikipedia')
                            : (i18n ? i18n.t('link.wikidata') : 'Wikidata');
                        td.appendChild(link);
                    } else {
                        td.className += ' heatmap-table__status--no';
                        td.textContent = '—';
                    }
                    tr.appendChild(td);
                });

                tbody.appendChild(tr);
            });
        }
        table.appendChild(tbody);
        wrap.appendChild(table);
        container.appendChild(wrap);
    }

    function makeSortableHeader(label, key) {
        var th = document.createElement('th');
        th.className = 'heatmap-table__sortable';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'heatmap-table__sortbtn';
        btn.textContent = label;
        btn.addEventListener('click', function () { setSort(key); });

        if (sortState.key === key) {
            btn.setAttribute('data-dir', sortState.dir);
        }

        th.appendChild(btn);
        return th;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
