/* Colour fields with a palette: clicking the swatch opens a popover with named
 * colours (e.g. the UIB palette), a field to type a hex code or RGB values, and
 * a button for the browser's own colour picker.
 *
 *   ColourPicker.enhance(document.querySelectorAll('input[type=color]'), [
 *     { group: 'Institutional', colours: [{ name: 'UIB blue', pantone: 'Pantone 300 C', hex: '#0065bd' }] },
 *   ]);
 *   ColourPicker.refresh();   // after changing an input's value from code
 *
 * The <input type="color"> stays in the page and holds the value: choosing a
 * colour sets it and fires an "input" event, so existing listeners keep working.
 * Styles: .colour-* in assets/site.css.
 */
(() => {
  'use strict';

  const fields = new Map(); // input → swatch button
  let popover = null;       // { el, input, button }

  /** "#3e5694", "3e5694", "#36c", "62, 86, 148", "62 86 148" or "rgb(62, 86, 148)" → "#3e5694"; else null. */
  function parse(text) {
    const t = text.trim().toLowerCase();
    let m = t.match(/^#?([0-9a-f]{6})$/);
    if (m) return `#${m[1]}`;
    m = t.match(/^#?([0-9a-f]{3})$/);
    if (m) return `#${[...m[1]].map((c) => c + c).join('')}`;
    m = t.match(/^(?:rgb\()?\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/);
    if (m && m.slice(1).every((v) => Number(v) <= 255)) {
      return `#${m.slice(1).map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`;
    }
    return null;
  }

  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');

  function setValue(input, hex) {
    input.value = hex;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    refresh();
  }

  function refresh() {
    for (const [input, button] of fields) {
      button.style.setProperty('--swatch', input.value);
      button.title = `${input.value} · RGB ${rgb(input.value)}`;
    }
  }

  function close(returnFocus) {
    if (!popover) return;
    const { el, button } = popover;
    el.remove();
    button.setAttribute('aria-expanded', 'false');
    popover = null;
    if (returnFocus) button.focus();
  }

  function open(input, button, groups) {
    close();
    const el = document.createElement('div');
    el.className = 'colour-popover';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Choose a colour');
    const value = input.value.toLowerCase();

    for (const { group, colours } of groups) {
      const heading = document.createElement('p');
      heading.className = 'colour-group';
      heading.textContent = group;
      const grid = document.createElement('div');
      grid.className = 'colour-grid';
      for (const c of colours) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'colour-swatch';
        b.style.setProperty('--swatch', c.hex);
        b.title = [c.name, c.pantone, c.hex].filter(Boolean).join(' · ');
        b.setAttribute('aria-label', b.title);
        b.setAttribute('aria-pressed', String(c.hex.toLowerCase() === value));
        b.addEventListener('click', () => { setValue(input, c.hex); close(true); });
        grid.appendChild(b);
      }
      el.append(heading, grid);
    }

    // Type a colour: hex or RGB.
    const label = document.createElement('label');
    label.className = 'colour-text';
    label.textContent = 'Hex or RGB';
    const text = document.createElement('input');
    text.type = 'text';
    text.value = value;
    text.placeholder = '#3e5694 or 62, 86, 148';
    text.spellcheck = false;
    const info = document.createElement('span');
    info.className = 'colour-info';
    info.textContent = `RGB ${rgb(value)}`;
    const error = document.createElement('span');
    error.className = 'colour-error';
    const apply = () => {
      const hex = parse(text.value);
      error.textContent = hex ? '' : 'Use #rrggbb or three numbers 0–255, e.g. 62, 86, 148';
      text.classList.toggle('invalid', !hex);
      if (hex) { setValue(input, hex); info.textContent = `RGB ${rgb(hex)}`; }
      return hex;
    };
    text.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); if (apply()) close(true); }
    });
    text.addEventListener('change', apply);
    label.append(text, info, error);

    // The browser's own picker.
    const custom = document.createElement('button');
    custom.type = 'button';
    custom.className = 'colour-custom';
    custom.textContent = 'Custom colour…';
    custom.addEventListener('click', () => {
      close();
      try { input.showPicker(); } catch { input.click(); }
    });

    el.append(label, custom);
    document.body.appendChild(el);
    place(el, button);
    button.setAttribute('aria-expanded', 'true');
    popover = { el, input, button };
    (el.querySelector('[aria-pressed="true"]') || el.querySelector('.colour-swatch')).focus();
  }

  /** Below the swatch button, or above it when there is no room; kept inside the window. */
  function place(el, button) {
    const r = button.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight, margin = 8;
    let top = r.bottom + 6;
    if (top + h > innerHeight - margin) top = r.top - 6 - h;
    top = Math.max(margin, Math.min(top, innerHeight - h - margin));
    const left = Math.min(Math.max(margin, r.left), innerWidth - w - margin);
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  }

  function enhance(inputs, groups) {
    for (const input of inputs) {
      const wrap = document.createElement('span');
      wrap.className = 'colour-field';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'colour-button';
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-expanded', 'false');
      input.replaceWith(wrap);
      input.classList.add('colour-native');
      input.tabIndex = -1;
      wrap.append(button, input);
      fields.set(input, button);
      button.addEventListener('click', (e) => {
        e.preventDefault(); // inside a <label>: don't also activate the native input
        if (popover && popover.input === input) close();
        else open(input, button, groups);
      });
      input.addEventListener('input', refresh); // the browser's picker
    }
    refresh();
  }

  document.addEventListener('pointerdown', (e) => {
    if (popover && !popover.el.contains(e.target) && !popover.button.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popover) close(true);
  });
  // Follow the swatch while the page or panel scrolls; close once it is out of view.
  const follow = () => {
    if (!popover) return;
    const r = popover.button.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) close();
    else place(popover.el, popover.button);
  };
  addEventListener('resize', follow);
  document.addEventListener('scroll', (e) => {
    if (popover && !popover.el.contains(e.target)) follow();
  }, true);

  window.ColourPicker = { enhance, refresh, parse };
})();
