/* ============================================================
   Queer Memory — Application Script
   Theme toggling, language switcher & core UI interactions
   ============================================================ */

(function () {
    'use strict';

    /* ----------------------------------------------------------
       Theme toggle
       ---------------------------------------------------------- */
    const STORAGE_KEY = 'queer-memory-theme';

    function getPreferredTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update toggle button aria-label
        var btn = document.querySelector('.theme-toggle');
        if (btn) {
            var label = theme === 'dark'
                ? (QM.i18n ? QM.i18n.t('theme.switchLight') : 'Switch to light theme')
                : (QM.i18n ? QM.i18n.t('theme.switchDark') : 'Switch to dark theme');
            btn.setAttribute('aria-label', label);
        }
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
        applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    // Create and insert the toggle button into the site header
    function createToggleButton() {
        var header = document.getElementById('site-header');
        if (!header) return;

        var btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-label', QM.i18n ? QM.i18n.t('theme.switch') : 'Switch theme');
        btn.innerHTML =
            '<span class="icon-sun" aria-hidden="true">\u2600\uFE0F</span>' +
            '<span class="icon-moon" aria-hidden="true">\uD83C\uDF19</span>';

        btn.addEventListener('click', toggleTheme);
        header.appendChild(btn);
    }

    /* ----------------------------------------------------------
       Language switcher
       ---------------------------------------------------------- */
    function createLangSwitcher() {
        var header = document.getElementById('site-header');
        if (!header || !QM.i18n) return;

        var currentLang = QM.i18n.getLang();
        var supported = QM.i18n.SUPPORTED;

        var wrapper = document.createElement('div');
        wrapper.className = 'lang-switcher';
        wrapper.setAttribute('role', 'group');
        wrapper.setAttribute('aria-label', QM.i18n.t('lang.label'));

        supported.forEach(function (lang) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'lang-btn';
            btn.textContent = lang.toUpperCase();
            btn.setAttribute('aria-pressed', lang === currentLang ? 'true' : 'false');
            if (lang === currentLang) btn.classList.add('lang-btn--active');
            btn.addEventListener('click', function () {
                QM.i18n.setLang(lang);
            });
            wrapper.appendChild(btn);
        });

        header.appendChild(wrapper);
    }

    // Apply theme immediately (before paint)
    applyTheme(getPreferredTheme());

    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // DOM ready
    function initUI() {
        createToggleButton();
        createLangSwitcher();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
})();
