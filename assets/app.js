/* ============================================================
   Queer Memory — Application Script
   Theme toggling & core UI interactions
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
            btn.setAttribute('aria-label',
                theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
            );
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
        btn.setAttribute('aria-label', 'Switch theme');
        btn.innerHTML =
            '<span class="icon-sun" aria-hidden="true">\u2600\uFE0F</span>' +
            '<span class="icon-moon" aria-hidden="true">\uD83C\uDF19</span>';

        btn.addEventListener('click', toggleTheme);
        header.appendChild(btn);
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createToggleButton);
    } else {
        createToggleButton();
    }
})();
