/* Shared page chrome of the MIProSoft tools: theme, header and footer.
 *
 * Load it in <head> (not deferred), so the saved theme applies before the
 * first paint:
 *
 *   <link rel="stylesheet" href="../assets/site.css">
 *   <script src="../assets/site.js"></script>
 *
 * Then place, where they should appear:
 *   <header data-site-header></header>          full header (top bar + masthead)
 *   <header data-site-header="compact"></header> compact header for tool pages
 *   <footer data-site-footer></footer>
 */
(() => {
  'use strict';

  const SITE = {
    name: 'MIProSoft',
    tagline: 'Tools',
    institution: { name: 'Universitat de les Illes Balears', url: 'https://www.uib.eu' },
    website: 'https://miprosoft-lab.github.io/miprosoft-site/',
  };

  // Same key as the group's website, so the choice is shared on the same domain.
  const root = document.documentElement;
  try {
    const theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  } catch { /* storage disabled */ }

  // The tools' home page: the folder above assets/.
  const home = new URL('../', document.currentScript.src).href;

  const icon = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const themeToggle = `<button type="button" class="theme-toggle">
    <span class="icon-moon">${icon('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>')}</span>
    <span class="icon-sun">${icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>')}</span>
  </button>`;
  const nav = `<nav class="main-nav" aria-label="Main">
    <ul>
      <li><a href="${home}" aria-current="page">Tools</a></li>
      <li><a href="${SITE.website}">Group website</a></li>
    </ul>
  </nav>`;
  const brand = `<a class="brand" href="${home}">
    <span class="brand-name">${SITE.name}</span>
    <span class="brand-tagline">${SITE.tagline}</span>
  </a>`;

  function header(compact) {
    if (compact) {
      return `<div class="masthead"><div class="container masthead-inner">
        ${brand}<div class="masthead-tools">${nav}${themeToggle}</div>
      </div></div>`;
    }
    return `<div class="topbar"><div class="container topbar-inner">
        <a class="institution" href="${SITE.institution.url}">${SITE.institution.name}</a>
        <div class="topbar-tools"><a href="${SITE.website}">${SITE.name}</a>${themeToggle}</div>
      </div></div>
      <div class="masthead"><div class="container masthead-inner">${brand}${nav}</div></div>`;
  }

  const footer = `<div class="container footer-inner">
      <div>
        <p class="footer-name">${SITE.name}</p>
        <p>Research group · <a href="${SITE.institution.url}">${SITE.institution.name}</a></p>
      </div>
      <div class="footer-meta">
        <p><a href="${SITE.website}">Group website</a></p>
        <p>Everything runs in your browser: no files are uploaded.</p>
      </div>
    </div>`;

  function setupThemeToggle(button) {
    const systemDark = matchMedia('(prefers-color-scheme: dark)');
    const current = () => root.dataset.theme ?? (systemDark.matches ? 'dark' : 'light');
    const label = () => {
      const text = current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      button.setAttribute('aria-label', text);
      button.title = text;
    };
    button.addEventListener('click', () => {
      root.dataset.theme = current() === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch { /* storage disabled */ }
      label();
      document.dispatchEvent(new CustomEvent('themechange', { detail: root.dataset.theme }));
    });
    systemDark.addEventListener('change', label);
    label();
  }

  document.addEventListener('DOMContentLoaded', () => {
    for (const el of document.querySelectorAll('[data-site-header]')) {
      el.classList.add('site-header');
      if (el.dataset.siteHeader === 'compact') el.classList.add('compact');
      el.innerHTML = header(el.dataset.siteHeader === 'compact');
    }
    for (const el of document.querySelectorAll('[data-site-footer]')) {
      el.classList.add('site-footer');
      el.innerHTML = footer;
    }
    document.querySelectorAll('.theme-toggle').forEach(setupThemeToggle);
  });
})();
