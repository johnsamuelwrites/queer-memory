/* ============================================================
   Queer Memory — Wikidata SPARQL Query Module
   Reusable module for fetching data from the Wikidata Query Service.
   ============================================================ */

var QM = window.QM || {};

QM.wikidata = (function () {
    'use strict';

    var ENDPOINT = 'https://query.wikidata.org/sparql';

    /* ----------------------------------------------------------
       Low-level helpers
       ---------------------------------------------------------- */

    /**
     * Execute a SPARQL query against the Wikidata Query Service.
     * Returns the parsed JSON bindings array.
     *
     * @param  {string}   sparql  – The SPARQL query string.
     * @param  {Object}   [opts]  – Options.
     * @param  {string}   [opts.lang='en'] – Preferred label language.
     * @param  {AbortSignal} [opts.signal] – Optional AbortController signal.
     * @return {Promise<Array<Object>>}  – Array of binding rows.
     */
    function query(sparql, opts) {
        opts = opts || {};
        var params = new URLSearchParams({
            query: sparql,
            format: 'json'
        });

        return fetch(ENDPOINT + '?' + params.toString(), {
            headers: {
                'Accept': 'application/sparql-results+json'
            },
            signal: opts.signal || undefined
        })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Wikidata query failed: HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            return data.results.bindings;
        });
    }


    /* ----------------------------------------------------------
       Value extractors
       ---------------------------------------------------------- */

    /**
     * Extract a plain value from a SPARQL binding cell.
     * Returns empty string if the cell is missing.
     */
    function val(binding, key) {
        return (binding[key] && binding[key].value) ? binding[key].value : '';
    }

    /**
     * Extract a QID (e.g. "Q12345") from a full Wikidata entity URI.
     */
    function qid(binding, key) {
        var v = val(binding, key);
        if (!v) return '';
        var i = v.lastIndexOf('/');
        return i >= 0 ? v.substring(i + 1) : v;
    }

    /**
     * Build a Wikidata entity page URL from a QID.
     */
    function entityUrl(qidStr) {
        return 'https://www.wikidata.org/wiki/' + qidStr;
    }

    /**
     * Build a Wikimedia Commons thumbnail URL from a full commons file URL.
     *
     * @param  {string} fileUrl – e.g. "http://commons.wikimedia.org/wiki/Special:FilePath/Example.jpg"
     * @param  {number} [width=300] – Desired width in pixels.
     * @return {string} – Thumbnail URL.
     */
    function thumb(fileUrl, width) {
        if (!fileUrl) return '';
        width = width || 300;
        // The SPARQL endpoint returns URLs of the form:
        // http://commons.wikimedia.org/wiki/Special:FilePath/Filename.jpg
        // We can add ?width=N to get a resized version.
        var sep = fileUrl.indexOf('?') >= 0 ? '&' : '?';
        return fileUrl + sep + 'width=' + width;
    }


    /* ----------------------------------------------------------
       SPARQL builder helpers
       ---------------------------------------------------------- */

    /**
     * Build a SERVICE wikibase:label clause.
     */
    function labelService(lang) {
        lang = lang || 'en';
        return 'SERVICE wikibase:label { bd:serviceParam wikibase:language "' + lang + ',mul" . }';
    }

    /**
     * Build a VALUES clause from an array of QIDs.
     * e.g. valuesClause('?item', ['Q6636','Q6649']) =>
     *   'VALUES ?item { wd:Q6636 wd:Q6649 }'
     */
    function valuesClause(variable, qids) {
        var items = qids.map(function (q) { return 'wd:' + q; });
        return 'VALUES ' + variable + ' { ' + items.join(' ') + ' }';
    }


    /* ----------------------------------------------------------
       High-level query builders
       ---------------------------------------------------------- */

    /**
     * Fetch items that are instances of a given class, with labels,
     * descriptions, images, and English Wikipedia sitelinks.
     *
     * @param  {string}  classQid – e.g. 'Q17888' for sexual orientation.
     * @param  {Object}  [opts]
     * @param  {string}  [opts.lang='en']
     * @param  {number}  [opts.limit]
     * @return {Promise<Array>}
     */
    function fetchInstancesOf(classQid, opts) {
        opts = opts || {};
        var lang = opts.lang || 'en';
        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  ?item wdt:P31 wd:' + classQid + ' .',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <https://' + lang + '.wikipedia.org/> .',
            '  }',
            '  ' + labelService(lang),
            '}',
            'ORDER BY ?itemLabel'
        ];
        if (opts.limit) sparql.push('LIMIT ' + opts.limit);
        return query(sparql.join('\n'), opts);
    }

    /**
     * Fetch details for a list of specific QIDs.
     *
     * @param  {string[]} qids   – e.g. ['Q6636', 'Q6649']
     * @param  {Object}   [opts]
     * @return {Promise<Array>}
     */
    function fetchItems(qids, opts) {
        opts = opts || {};
        var lang = opts.lang || 'en';
        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  ' + valuesClause('?item', qids),
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <https://' + lang + '.wikipedia.org/> .',
            '  }',
            '  ' + labelService(lang),
            '}'
        ];
        return query(sparql.join('\n'), opts);
    }

    /**
     * Fetch notable people associated with a property value.
     * E.g. people whose sexual orientation (P91) is Q6636 (homosexuality).
     *
     * @param  {string}  property – e.g. 'P91' or 'P21'
     * @param  {string}  valueQid – e.g. 'Q6636'
     * @param  {Object}  [opts]
     * @param  {number}  [opts.limit=20]
     * @return {Promise<Array>}
     */
    function fetchPeopleBy(property, valueQid, opts) {
        opts = opts || {};
        var lang = opts.lang || 'en';
        var limit = opts.limit || 20;
        var sparql = [
            'SELECT ?person ?personLabel ?personDescription ?image ?article ?dob ?dod WHERE {',
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:' + property + ' wd:' + valueQid + ' .',
            '  OPTIONAL { ?person wdt:P18 ?image . }',
            '  OPTIONAL { ?person wdt:P569 ?dob . }',
            '  OPTIONAL { ?person wdt:P570 ?dod . }',
            '  OPTIONAL {',
            '    ?article schema:about ?person ;',
            '            schema:isPartOf <https://' + lang + '.wikipedia.org/> .',
            '  }',
            '  ' + labelService(lang),
            '}',
            'ORDER BY ?personLabel',
            'LIMIT ' + limit
        ];
        return query(sparql.join('\n'), opts);
    }

    /**
     * Count people associated with each identity value for a given property.
     *
     * @param  {string}   property – e.g. 'P91'
     * @param  {string[]} valueQids – e.g. ['Q6636','Q6649']
     * @param  {Object}   [opts]
     * @return {Promise<Array>}
     */
    function fetchPeopleCounts(property, valueQids, opts) {
        opts = opts || {};
        var lang = opts.lang || 'en';
        var sparql = [
            'SELECT ?identity ?identityLabel (COUNT(DISTINCT ?person) AS ?count) WHERE {',
            '  ' + valuesClause('?identity', valueQids),
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:' + property + ' ?identity .',
            '  ' + labelService(lang),
            '}',
            'GROUP BY ?identity ?identityLabel',
            'ORDER BY DESC(?count)'
        ];
        return query(sparql.join('\n'), opts);
    }


    /* ----------------------------------------------------------
       DOM helpers (shared across page modules)
       ---------------------------------------------------------- */

    /**
     * Create an element with optional className and text content.
     */
    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    /**
     * Show a loading spinner inside a container.
     * Returns a function to call when loading is done (removes spinner).
     */
    function showLoading(container) {
        var spinner = el('div', 'qm-loading');
        spinner.setAttribute('role', 'status');
        spinner.innerHTML = '<span class="qm-spinner" aria-hidden="true"></span>' +
                            '<span>Loading from Wikidata&hellip;</span>';
        container.appendChild(spinner);
        return function () {
            if (spinner.parentNode) spinner.parentNode.removeChild(spinner);
        };
    }

    /**
     * Show an error message inside a container.
     */
    function showError(container, message) {
        var box = el('div', 'qm-error');
        box.textContent = message || 'Failed to load data from Wikidata.';
        container.appendChild(box);
    }


    /* ----------------------------------------------------------
       Public API
       ---------------------------------------------------------- */
    return {
        query:             query,
        val:               val,
        qid:               qid,
        entityUrl:         entityUrl,
        thumb:             thumb,
        labelService:      labelService,
        valuesClause:      valuesClause,
        fetchInstancesOf:  fetchInstancesOf,
        fetchItems:        fetchItems,
        fetchPeopleBy:     fetchPeopleBy,
        fetchPeopleCounts: fetchPeopleCounts,
        el:                el,
        showLoading:       showLoading,
        showError:         showError
    };

})();

window.QM = QM;
